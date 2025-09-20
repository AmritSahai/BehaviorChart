'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

interface Board {
  id: string;
  title: string;
  created_at: string;
}

export default function BoardsPage() {
  const { user, session } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [sessionName, setSessionName] = useState('')
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

    const response = await fetch('/api/boards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ title, sessionName }),
    })

    if (response.ok) {
      const data = await response.json()
      router.push(data.shareUrl)
    } else {
      const data = await response.json()
      setError(data.error || 'Failed to create board.')
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Party Boards</h1>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Board</h2>
              <form onSubmit={handleCreateBoard} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Board Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Friday Night Hangout"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="sessionName" className="block text-sm font-medium text-gray-700">
                    Session Name
                  </label>
                  <input
                    type="text"
                    id="sessionName"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., John's Birthday"
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create and Go to Session'}
                </button>
              </form>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Boards</h2>
              {loading && <p>Loading boards...</p>}
              {!loading && boards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {boards.map((board) => (
                    <div key={board.id} className="bg-white shadow rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{board.title}</h3>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(board.created_at).toLocaleDateString()}
                      </div>
                      {/* In a future step, we could fetch and link to active sessions for each board */}
                    </div>
                  ))}
                </div>
              ) : (
                !loading && <p className="text-gray-500">You haven't created any boards yet.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}