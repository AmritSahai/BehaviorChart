import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface Pin {
  id: string
  person_name: string
  category_index: number
  x_position: number
  y_position: number
  placed_by: string
}

interface BoardStore {
  pins: Pin[]
  activeUsers: string[]
  sessionId: string | null
  isConnected: boolean
  subscription: any | null
  setPins: (pins: Pin[]) => void
  addPin: (pin: Pin) => void
  updatePin: (id: string, updates: Partial<Pin>) => void
  removePin: (id: string) => void
  setActiveUsers: (users: string[]) => void
  setSessionId: (id: string) => void
  subscribeToSession: (sessionId: string) => void
  unsubscribe: () => void
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  pins: [],
  activeUsers: [],
  sessionId: null,
  isConnected: false,
  subscription: null,

  setPins: (pins) => set({ pins }),
  
  addPin: (pin) => set((state) => ({ pins: [...state.pins, pin] })),
  
  updatePin: (id, updates) => set((state) => ({
    pins: state.pins.map(pin => pin.id === id ? { ...pin, ...updates } : pin)
  })),
  
  removePin: (id) => set((state) => ({
    pins: state.pins.filter(pin => pin.id !== id)
  })),
  
  setActiveUsers: (users) => set({ activeUsers: users }),
  setSessionId: (id) => set({ sessionId: id }),

  subscribeToSession: (sessionId: string) => {
    const channel = supabase.channel(`session-${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pin_placements',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload
        
        if (eventType === 'INSERT' && newRecord) {
          get().addPin(newRecord as Pin)
        } else if (eventType === 'UPDATE' && newRecord) {
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