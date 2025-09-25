import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface Pin {
  id: string
  person_name: string
  board_x_percentage: number
  board_y_percentage: number

  placed_by: string
  state?: 'saving' | 'error'
}

interface BoardStore {
  pins: Pin[]
  activeUsers: string[]
  sessionId: string | null
  isConnected: boolean
  subscription: any | null
  updatingPins: Set<string> // Track pins being updated by current user
  draggingPins: Set<string> // Track pins currently being dragged
  setPins: (pins: Pin[]) => void
  addPin: (pin: Pin) => void
  updatePin: (id: string, updates: Partial<Pin>) => void
  removePin: (id: string) => void
  setActiveUsers: (users: string[]) => void
  setSessionId: (id: string) => void
  subscribeToSession: (sessionId: string) => void
  unsubscribe: () => void
  markPinAsUpdating: (id: string) => void
  markPinAsUpdated: (id: string) => void
  markPinAsDragging: (id: string) => void
  markPinAsNotDragging: (id: string) => void
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  pins: [],
  activeUsers: [],
  sessionId: null,
  isConnected: false,
  subscription: null,
  updatingPins: new Set<string>(),
  draggingPins: new Set<string>(),

  setPins: (pins) => set({ pins }),
  
  addPin: (pin) => set((state) => ({ pins: [...state.pins, pin] })),
  
  updatePin: (id, updates) => {
    console.log('📌 updatePin called:', { id, updates });
    set((state) => ({
      pins: state.pins.map(pin => pin.id === id ? { ...pin, ...updates } : pin)
    }));
  },
  
  removePin: (id) => set((state) => ({
    pins: state.pins.filter(pin => pin.id !== id)
  })),
  
  setActiveUsers: (users) => set({ activeUsers: users }),
  setSessionId: (id) => set({ sessionId: id }),

  markPinAsUpdating: (id: string) => set((state) => ({
    updatingPins: new Set([...state.updatingPins, id])
  })),

  markPinAsUpdated: (id: string) => set((state) => {
    const newUpdatingPins = new Set(state.updatingPins)
    newUpdatingPins.delete(id)
    return { updatingPins: newUpdatingPins }
  }),

  markPinAsDragging: (id: string) => set((state) => ({
    draggingPins: new Set([...state.draggingPins, id])
  })),

  markPinAsNotDragging: (id: string) => set((state) => {
    const newDraggingPins = new Set(state.draggingPins)
    newDraggingPins.delete(id)
    return { draggingPins: newDraggingPins }
  }),

  subscribeToSession: (sessionId: string) => {
    const channel = supabase.channel(`session-${sessionId}`, {
      config: {
        broadcast: {
          ack: true,
        },
      },
    });
    // Selective real-time updates: only update pins that are NOT being dragged
    channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pin_placements',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload
        
        if (eventType === 'INSERT' && newRecord) {
          get().addPin(newRecord as Pin)
        } else if (eventType === 'UPDATE' && newRecord) {
          // If this pin is currently being dragged locally, clear dragging and skip or accept authoritative value
          if (get().draggingPins.has(newRecord.id)) {
            console.log(`Clearing drag flag for pin ${newRecord.id} on real-time update`);
            get().markPinAsNotDragging(newRecord.id);
          }
          console.log('🔄 Real-time update received:', {
            pinId: newRecord.id,
            newPosition: { 
              x: newRecord.board_x_percentage, 
              y: newRecord.board_y_percentage 
            },
            draggingPins: Array.from(get().draggingPins)
          });
          get().updatePin(newRecord.id, newRecord as Pin)
        } else if (eventType === 'DELETE' && oldRecord) {
          get().removePin(oldRecord.id)
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState()
        const users = Object.keys(presenceState)
        get().setActiveUsers(users)
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('New user joined:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          set({ isConnected: true })
          await channel.track({ online_at: new Date().toISOString() })
        }
      })

    set({ subscription: channel })
  },

  unsubscribe: () => {
    const { subscription } = get()
    if (subscription) {
      subscription.unsubscribe()
      set({ subscription: null, isConnected: false })
    }
  }
}))