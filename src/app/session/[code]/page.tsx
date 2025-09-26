'use client'

import { supabase } from '@/lib/supabase'
import Board from '@/components/Board'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface PageProps {
  params: Promise<{ code: string }>
}

export default function SessionPage({ params }: PageProps) {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState<string>('')

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setCode(resolvedParams.code)
      
      console.log('Looking for session with code:', resolvedParams.code)
      
      const { data: sessionData, error } = await supabase
        .from('board_sessions')
        .select(`
          *,
          boards (
            title,
            categories
          )
        `)
        .eq('shareable_code', resolvedParams.code)
        .eq('is_active', true)
        .single()

      console.log('Session query result:', { session: sessionData, error })

      if (error || !sessionData || !sessionData.boards) {
        console.log('Session not found or error:', { error, session: sessionData })
        notFound()
      }

      setSession(sessionData)
      setLoading(false)
    }

    getParams()
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!session) {
    notFound()
  }

  // ...existing code...

return (
  <div className="min-h-screen relative">
    {/* Main content */}
    <div className="relative z-10 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-3xl font-bold text-white mb-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            {session.boards.title}
          </motion.h1>
          <motion.p 
            className="text-sm text-white mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            Share this URL with others to collaborate: 
            <span className="font-mono ml-2 text-white">
              {`${process.env.NEXT_PUBLIC_SITE_URL}/session/${code}`}
            </span>
          </motion.p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          <Board 
            sessionId={session.id}
            categories={session.boards.categories}
          />
        </motion.div>
      </div>
    </div>
  </div>
  )
}
