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
        {categories.map((category, index) => (
          <div
            key={category.name}
            className="absolute inset-x-0 flex items-center justify-center text-white font-bold text-xl"
            style={{
              backgroundColor: category.color,
              top: `${index * (100 / categories.length)}%`,
              height: `${100 / categories.length}%`,
              borderBottom: index < categories.length - 1 ? '2px solid white' : 'none'
            }}
          >
            {category.name}
          </div>
        ))}

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