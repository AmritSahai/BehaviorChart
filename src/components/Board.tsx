'use client'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import type React from 'react'
// Removed Framer Motion for custom pointer-based dragging
import { useBoardStore } from '@/store/boardStore'
import { supabase } from '@/lib/supabase'

interface Category {
  name: string
  color: string
}

interface BoardProps {
  sessionId: string
  categories: Category[]
}

type Pin = {
  id: string;
  person_name: string;
  board_x_percentage: number;
  board_y_percentage: number;
  placed_by: string;
  state?: 'saving' | 'error';
};

const Board = ({ sessionId, categories }: BoardProps) => {
  console.log('Categories:', categories);  // Add this line to log categories
  const boardRef = useRef<HTMLDivElement>(null)
  const [newPersonName, setNewPersonName] = useState('')

  const pins = useBoardStore((state) => state.pins as Pin[])
  const isConnected = useBoardStore((state) => state.isConnected)
  const activeUsers = useBoardStore((state) => state.activeUsers)
  const { subscribeToSession, unsubscribe, setPins, markPinAsDragging, markPinAsNotDragging } = useBoardStore.getState()

  useEffect(() => {
    subscribeToSession(sessionId)

    const loadExistingPins = async () => {
      const { data, error } = await supabase
        .from('pin_placements')
        .select('id, person_name, board_x_percentage, board_y_percentage, placed_by')
        .eq('session_id', sessionId)
      
      if (error) {
        console.error('Error fetching pins:', error)
      } else if (data) {
        setPins(data.map(p => ({ ...p, state: undefined })))
      }
    }
    
    loadExistingPins()
    
    return () => unsubscribe()
  }, [sessionId, subscribeToSession, unsubscribe, setPins])

  const addPin = useCallback(async () => {
    const trimmedName = newPersonName.trim()
    if (!trimmedName) return
    
    const { error } = await supabase
      .from('pin_placements')
      .insert({
        session_id: sessionId,
        person_name: trimmedName,
        board_x_percentage: 0.5, // Default to center
        board_y_percentage: 0.5,
        placed_by: 'user' // This should ideally be a real user ID
      })
      
    if (error) {
      console.error('Error adding pin:', error)
    } else {
      setNewPersonName('')
    }
  }, [newPersonName, sessionId])

  // Custom pointer-based drag state
  const draggingPinIdRef = useRef<string | null>(null)

  const handlePointerDown = useCallback((pinId: string, e: React.PointerEvent<HTMLDivElement>) => {
    const board = boardRef.current
    if (!board) return
    draggingPinIdRef.current = pinId
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
    markPinAsDragging(pinId)
  }, [markPinAsDragging])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const board = boardRef.current
    if (!board) return
    const pinId = draggingPinIdRef.current
    if (!pinId) return
    const boardRect = board.getBoundingClientRect()
    // Use pointer position as the pin center
    const centerX = e.clientX - boardRect.left
    const centerY = e.clientY - boardRect.top
    const xPct = Math.max(0.02, Math.min(0.98, centerX / boardRect.width))
    const yPct = Math.max(0.02, Math.min(0.98, centerY / boardRect.height))
    // Imperatively move the element without React state updates
    const el = e.currentTarget as HTMLDivElement
    el.style.left = `${xPct * 100}%`
    el.style.top = `${yPct * 100}%`
  }, [])

  const handlePointerUp = useCallback(async (pinId: string, e: React.PointerEvent<HTMLDivElement>) => {
    const board = boardRef.current
    if (!board) return
    // Cache the element before any await
    const el = e.currentTarget as HTMLDivElement
    const boardRect = board.getBoundingClientRect()
    const centerX = e.clientX - boardRect.left
    const centerY = e.clientY - boardRect.top
    const clampedX = Math.max(0.02, Math.min(0.98, centerX / boardRect.width))
    const clampedY = Math.max(0.02, Math.min(0.98, centerY / boardRect.height))
    const newPinState = {
      board_x_percentage: clampedX,
      board_y_percentage: clampedY,
    }
    // Release pointer capture before awaiting to avoid stale target
    if (el && el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId)
    }
    // Persist once to DB; realtime will confirm
    const { error } = await supabase
      .from('pin_placements')
      .update({ ...newPinState, updated_at: new Date().toISOString() })
      .eq('id', pinId)
    if (error) {
      console.error('Failed to save pin position:', error)
      markPinAsNotDragging(pinId)
    }
    // Keep dragging flag until realtime UPDATE arrives; then store clears it
    draggingPinIdRef.current = null
  }, [markPinAsNotDragging])

  // Framer drag version removed
  
  const getCategoryIndexForPin = useCallback((pin: Pin) => {
    const numCategories = categories.length;
    const yPercentage = pin.board_y_percentage ?? 0;
    return Math.min(Math.floor(yPercentage * numCategories), numCategories - 1);
  }, [categories.length]);

  const pinsByCategory = useMemo(() => {
    const grouped: { [key: number]: Pin[] } = {};
    for (const pin of pins) {
      const categoryIndex = getCategoryIndexForPin(pin);
      if (!grouped[categoryIndex]) {
        grouped[categoryIndex] = [];
      }
      grouped[categoryIndex].push(pin);
    }
    return grouped;
  }, [pins, getCategoryIndexForPin]);

  return (
    <div className="w-full p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="text-sm text-gray-600">
          {activeUsers.length} active users
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={newPersonName}
          onChange={(e) => setNewPersonName(e.target.value)}
          placeholder="Enter person's name"
          className="flex-1 px-4 py-2 border rounded-lg"
          onKeyPress={(e) => e.key === 'Enter' && addPin()}
        />
        <button
          onClick={addPin}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Add Pin
        </button>
      </div>

      {/* Container - completely fixed, never changes */}
      <div className="w-full flex justify-center">
        <div
          ref={boardRef}
          className="relative rounded-lg overflow-hidden"
          style={{ 
            width: '600px',
            height: '500px',
            border: '2px solid #D1D5DB',
            // Removed position: fixed, top, left, transform to allow it to flow in the document after the add pin section
            zIndex: 10
          }}
        >
        {/* Top Section - Blue Sky/Clouds */}
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-blue-400 to-blue-300 flex items-center justify-center">
          <div className="absolute inset-0">
            {/* Clouds */}
            <div className="absolute top-4 left-8 w-12 h-8 bg-white rounded-full opacity-80"></div>
            <div className="absolute top-6 left-12 w-8 h-6 bg-white rounded-full opacity-80"></div>
            <div className="absolute top-2 right-12 w-16 h-10 bg-white rounded-full opacity-80"></div>
            <div className="absolute top-4 right-8 w-10 h-7 bg-white rounded-full opacity-80"></div>
            <div className="absolute top-3 right-16 w-6 h-5 bg-white rounded-full opacity-80"></div>
          </div>
          <h2 className="text-4xl font-bold text-blue-800 uppercase tracking-wider relative z-10" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            {categories[0]?.name || 'GOOD BOYYY'}
          </h2>
        </div>

        {/* Second Section - Green Grass */}
        <div className="absolute inset-x-0 top-1/4 h-1/4 bg-gradient-to-b from-green-400 to-green-300 flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-black text-lg mb-2" style={{ fontFamily: 'Brush Script MT, cursive' }}>YK What...</p>
            <h2 className="text-4xl font-bold text-black uppercase tracking-wider" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
              {categories[1]?.name || 'HELL YEAH'}
            </h2>
          </div>
          
          {/* Sparkles */}
          <div className="absolute top-6 right-6">
            <div className="w-4 h-4 bg-yellow-300 transform rotate-45"></div>
          </div>
          <div className="absolute top-8 right-8">
            <div className="w-3 h-3 bg-yellow-300 transform rotate-45"></div>
          </div>
        </div>

        {/* Third Section - Peach/Pink */}
        <div className="absolute inset-x-0 top-2/4 h-1/4 bg-gradient-to-b from-pink-300 to-pink-200 flex flex-col items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-purple-600 uppercase tracking-wider" style={{ fontFamily: 'Chiller, fantasy' }}>
              {categories[2]?.name || 'FUCKIN\''}
            </h2>
            <p className="text-purple-800 text-2xl italic" style={{ fontFamily: 'Papyrus, fantasy' }}>freak</p>
          </div>
          
          {/* Devil emojis */}
          <div className="absolute top-6 left-6">
            <span className="text-4xl">😈</span>
          </div>
          <div className="absolute top-6 right-6">
            <span className="text-4xl">👅</span>
          </div>
        </div>

        {/* Bottom Section - Black with Fire */}
        <div className="absolute inset-x-0 top-3/4 h-1/4 bg-gradient-to-t from-orange-500 via-red-600 to-black flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-orange-400 via-red-500 to-transparent opacity-60"></div>
          <h2 className="text-4xl font-bold text-white uppercase tracking-wider relative z-10" style={{ fontFamily: 'Creepster, fantasy' }}>
            {categories[3]?.name || 'IN THE FIRE'}
          </h2>
          
          {/* Flame decorations on text */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="absolute -top-3 left-3 w-2 h-4 bg-orange-400 rounded-full transform rotate-12"></div>
            <div className="absolute -top-2 right-3 w-1 h-3 bg-yellow-400 rounded-full transform -rotate-12"></div>
          </div>
        </div>

        {pins.map((pin) => (
          <div
            key={pin.id}
            onPointerDown={(e) => handlePointerDown(pin.id, e)}
            onPointerMove={handlePointerMove}
            onPointerUp={(e) => handlePointerUp(pin.id, e)}
            className={`absolute w-12 h-12 bg-yellow-400 rounded-full border-2 select-none flex items-center justify-center font-bold text-xs text-black cursor-grab
              ${pin.state === 'error' ? 'border-red-500' : 'border-yellow-600'}
            `}
            style={{
              left: `${pin.board_x_percentage * 100}%`,
              top: `${pin.board_y_percentage * 100}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              touchAction: 'none',
              willChange: 'transform, left, top'
            }}
            title={pin.person_name}
          >
            {pin.person_name.slice(0, 2).toUpperCase()}
          </div>
        ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Current Pins:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <div key={index} className="border rounded-lg p-3">
              <h4 className="font-medium mb-2" style={{ color: category.color }}>
                {category.name}
              </h4>
              <ul className="text-sm space-y-1">
                {(pinsByCategory[index] || []).map(pin => (
                  <li key={pin.id} className="text-gray-700">
                    {pin.person_name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Board