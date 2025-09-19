'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { useBoards } from '@/hooks/useBoards'
import { useState } from 'react'

export default function BoardsPage() {
  const { boards, loading, error, refetch, createBoard } = useBoards()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [newBoardDescription, setNewBoardDescription] = useState('')

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newBoardName.trim()) return

    const board = await createBoard(newBoardName.trim(), newBoardDescription.trim() || undefined)
    
    if (board) {
      setNewBoardName('')
      setNewBoardDescription('')
      setShowCreateForm(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Boards</h1>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {showCreateForm ? 'Cancel' : 'Create Board'}
              </button>
            </div>

            {/* Create Board Form */}
            {showCreateForm && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Board</h2>
                <form onSubmit={handleCreateBoard} className="space-y-4">
                  <div>
                    <label htmlFor="boardName" className="block text-sm font-medium text-gray-700">
                      Board Name *
                    </label>
                    <input
                      type="text"
                      id="boardName"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter board name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="boardDescription" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="boardDescription"
                      value={newBoardDescription}
                      onChange={(e) => setNewBoardDescription(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter board description (optional)"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Board'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                {error}
                <button
                  onClick={refetch}
                  className="ml-2 text-red-800 underline hover:text-red-900"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && !boards.length && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Boards Grid */}
            {!loading && boards.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">No boards found</div>
                <p className="text-gray-400 mb-6">Create your first board to get started!</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
                >
                  Create Your First Board
                </button>
              </div>
            )}

            {boards.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boards.map((board) => (
                  <div key={board.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{board.name}</h3>
                    {board.description && (
                      <p className="text-gray-600 text-sm mb-4">{board.description}</p>
                    )}
                    <div className="text-xs text-gray-500">
                      Created: {new Date(board.created_at).toLocaleDateString()}
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200">
                        View
                      </button>
                      <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Debug Info */}
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">API Debug Info</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Endpoint:</strong> /api/get-boards</p>
                <p><strong>Method:</strong> GET (fetch boards), POST (create board)</p>
                <p><strong>Authentication:</strong> Bearer token from user session</p>
                <p><strong>RLS:</strong> Row Level Security enabled for user-specific data</p>
                <p><strong>Total Boards:</strong> {boards.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
