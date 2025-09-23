'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBoardStore } from '@/store/boardStore'
import { supabase } from '@/lib/supabase'

interface Category {
  name: string
  color: string
  position: number
}

interface BoardProps {
  sessionId: string
  categories: Category[]
}

const Board = ({ sessionId, categories }: BoardProps) => {
  const boardRef = useRef<HTMLDivElement>(null)
  const [draggedPin, setDraggedPin] = useState<string | null>(null)
  const [newPersonName, setNewPersonName] = useState('')
  
  const {
    pins,
    activeUsers,
    subscribeToSession,
    unsubscribe,
    isConnected
  } = useBoardStore()

  useEffect(() => {
    subscribeToSession(sessionId)
    loadExistingPins()
    
    return () => unsubscribe()
  }, [sessionId])

  const loadExistingPins = async () => {
    const { data, error } = await supabase
      .from('pin_placements')
      .select('*')
      .eq('session_id', sessionId)
    
    if (data && !error) {
      useBoardStore.getState().setPins(data)
    }
  }

  const addPin = async () => {
    if (!newPersonName.trim()) return
    
    const { data, error } = await supabase
      .from('pin_placements')
      .insert({
        session_id: sessionId,
        person_name: newPersonName.trim(),
        category_index: 0,
        x_position: 50,
        y_position: 50,
        placed_by: 'user'
      })
      .select()
      .single()
    
    if (!error) {
      setNewPersonName('')
    }
  }

  const updatePinPosition = async (pinId: string, categoryIndex: number, x: number, y: number) => {
    await supabase
      .from('pin_placements')
      .update({
        category_index: categoryIndex,
        x_position: x,
        y_position: y,
        updated_at: new Date().toISOString()
      })
      .eq('id', pinId)
  }

  const handleDragEnd = (pinId: string, event: MouseEvent | TouchEvent) => {
    if (!boardRef.current) return
    
    const boardRect = boardRef.current.getBoundingClientRect()
    const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX
    const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY
    
    const x = ((clientX - boardRect.left) / boardRect.width) * 100
    const y = ((clientY - boardRect.top) / boardRect.height) * 100
    
    // Determine which category based on y position
    const categoryIndex = Math.floor((y / 100) * 4)
    const clampedCategoryIndex = Math.max(0, Math.min(3, categoryIndex))
    
    updatePinPosition(pinId, clampedCategoryIndex, x, y)
    setDraggedPin(null)
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Connection Status */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="text-sm text-gray-600">
          {activeUsers.length} active users
        </div>
      </div>

      {/* Add New Pin */}
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

      {/* Board */}
      <div
        ref={boardRef}
        className="relative w-full h-96 border-2 border-gray-300 rounded-lg overflow-hidden"
        style={{ aspectRatio: '4/3' }}
      >
        {/* Category Sections */}
        {categories.map((category, index) => (
          <div
            key={index}
            className="absolute inset-x-0 flex items-center justify-center text-white font-bold text-xl"
            style={{
              backgroundColor: category.color,
              top: `${index * 25}%`,
              height: '25%',
              borderBottom: index < 3 ? '2px solid white' : 'none'
            }}
          >
            {category.name}
          </div>
        ))}

        {/* Pins with floating animation */}
        <AnimatePresence>
          {pins.map((pin, index) => (
            <motion.div
              key={pin.id}
              className={`absolute w-12 h-12 bg-yellow-400 rounded-full border-2 border-yellow-600 cursor-grab select-none flex items-center justify-center font-bold text-xs text-black ${
                draggedPin === pin.id ? 'cursor-grabbing z-50' : 'z-10'
              }`}
              style={{
                left: `${pin.x_position}%`,
                top: `${pin.y_position}%`,
                transform: 'translate(-50%, -50%)'
              } as React.CSSProperties}
              drag
              dragMomentum={false}
              onDragStart={() => setDraggedPin(pin.id)}
              onDragEnd={(event, info) => handleDragEnd(pin.id, event as DragEvent)}
              whileDrag={{ scale: 1.1, zIndex: 50 }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                y: [0, -10, 0, 10, 0],
                x: [0, 5, 0, -5, 0],
                rotate: [0, 5, 0, -5, 0]
              }}
              transition={{
                duration: 8 + (index * 0.5), // Vary duration based on index
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2 // Stagger the animations
              }}
              exit={{ scale: 0, rotate: 180 }}
              title={pin.person_name}
            >
              {pin.person_name.slice(0, 2).toUpperCase()}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pin List */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Current Pins:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <div key={index} className="border rounded-lg p-3">
              <h4 className="font-medium mb-2" style={{ color: category.color }}>
                {category.name}
              </h4>
              <ul className="text-sm space-y-1">
                {pins
                  .filter(pin => pin.category_index === index)
                  .map(pin => (
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
