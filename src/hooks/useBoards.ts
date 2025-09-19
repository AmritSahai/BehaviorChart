import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Board {
  id: string
  name: string
  description?: string
  user_id: string
  created_at: string
  updated_at: string
}

interface UseBoardsReturn {
  boards: Board[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createBoard: (name: string, description?: string) => Promise<Board | null>
}

export function useBoards(): UseBoardsReturn {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { session } = useAuth()

  const fetchBoards = async () => {
    if (!session?.access_token) {
      setError('No authentication token available')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/get-boards', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch boards')
      }

      const data = await response.json()
      setBoards(data.data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching boards:', err)
    } finally {
      setLoading(false)
    }
  }

  const createBoard = async (name: string, description?: string): Promise<Board | null> => {
    if (!session?.access_token) {
      setError('No authentication token available')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/get-boards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create board')
      }

      const data = await response.json()
      const newBoard = data.data

      // Add the new board to the local state
      setBoards(prev => [newBoard, ...prev])
      
      return newBoard
    } catch (err: any) {
      setError(err.message)
      console.error('Error creating board:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Fetch boards when component mounts or session changes
  useEffect(() => {
    if (session?.access_token) {
      fetchBoards()
    } else {
      setBoards([])
      setError(null)
    }
  }, [session?.access_token])

  return {
    boards,
    loading,
    error,
    refetch: fetchBoards,
    createBoard,
  }
}
