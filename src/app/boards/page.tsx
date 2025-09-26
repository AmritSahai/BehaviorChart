'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'

interface Board {
  id: string;
  title: string;
  created_at: string;
}

export default function BoardsPage() {
  const { user, session } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [boards, setBoards] = useState<Board[]>([])

  useEffect(() => {
    const fetchBoards = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('boards')
        .select('id, title, created_at')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching boards:', error)
        setError('Could not fetch boards.')
      } else {
        setBoards(data as Board[])
      }
      setLoading(false);
    }

    fetchBoards()
  }, [user])

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!session?.access_token) {
      setError('No authentication token available')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ title }),
      })

      if (response.ok) {
        const data = await response.json()
        // Add a small delay for smooth transition
        setTimeout(() => {
          router.push(data.shareUrl)
        }, 300)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create board.')
        setLoading(false)
      }
    } catch (error) {
      setError('Network error occurred.')
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      {/* Loading overlay */}
      {loading && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="bg-white rounded-lg p-8 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Creating your session...</p>
          </motion.div>
        </motion.div>
      )}

      {/* Main content */}
      <div className="relative z-10 min-h-screen py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <motion.div 
            className="px-4 py-6 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <h1 className="text-3xl font-bold text-white">Party Boards</h1>
            </motion.div>

            <motion.div 
              className="bg-white/90 backdrop-blur-sm shadow rounded-lg p-6 mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Board</h2>
              <form onSubmit={handleCreateBoard} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Session Name
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                    placeholder="e.g., Friday Night Hangout"
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {loading ? 'Creating...' : 'Create and Go to Session'}
                </motion.button>
              </form>
            </motion.div>

            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            >
              <h2 className="text-xl font-bold text-white mb-4">Your Boards</h2>
              {loading && <p className="text-white">Loading boards...</p>}
              {!loading && boards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {boards.map((board, index) => (
                    <motion.div 
                      key={board.id} 
                      className="bg-white/90 backdrop-blur-sm shadow rounded-lg p-6"
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: 0.8 + (index * 0.1), 
                        ease: "easeOut" 
                      }}
                      whileHover={{ 
                        scale: 1.05, 
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{board.title}</h3>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(board.created_at).toLocaleDateString()}
                      </div>
                      {/* In a future step, we could fetch and link to active sessions for each board */}
                    </motion.div>
                  ))}
                </div>
              ) : (
                !loading && <p className="text-white">You haven't created any boards yet.</p>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  )
}