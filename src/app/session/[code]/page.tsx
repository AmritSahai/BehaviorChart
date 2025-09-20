import { supabase } from '@/lib/supabase'
import Board from '@/components/Board'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ code: string }>
}

export default async function SessionPage({ params }: PageProps) {
  const { code } = await params
  
  console.log('Looking for session with code:', code)
  
  const { data: session, error } = await supabase
    .from('board_sessions')
    .select(`
      *,
      boards (
        title,
        categories
      )
    `)
    .eq('shareable_code', code)
    .eq('is_active', true)
    .single()

  console.log('Session query result:', { session, error })

  if (error || !session || !session.boards) {
    console.log('Session not found or error:', { error, session })
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {session.boards.title}
          </h1>
          <p className="text-gray-600">
            Session: {session.session_name}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Share this URL with others to collaborate: 
            <span className="font-mono ml-2">
              {`${process.env.NEXT_PUBLIC_SITE_URL}/session/${code}`}
            </span>
          </p>
        </div>
        
        <Board 
          sessionId={session.id}
          categories={session.boards.categories}
        />
      </div>
    </div>
  )
}
