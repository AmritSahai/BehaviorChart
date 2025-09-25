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

  // ...existing code...

return (
  <div className="min-h-screen relative overflow-hidden">
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900 animate-color-wheel-slow"></div>
    
    {/* Pool-themed background elements with color animation */}
    <div className="absolute inset-0 overflow-hidden animate-color-wheel-slow">
      {/* Water ripple effects - Pool theme with movement */}
      <div 
        className="absolute w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"
        style={{
          animation: 'pulse 3s ease-in-out infinite, floatAround 15s ease-in-out infinite',
          top: '10px',
          left: '10px'
        }}
      ></div>
      <div 
        className="absolute w-24 h-24 bg-cyan-200 rounded-full opacity-30 animate-pulse delay-1000"
        style={{
          animation: 'pulse 3s ease-in-out infinite 1s, floatAround 18s ease-in-out infinite 2s',
          top: '32px',
          right: '20px'
        }}
      ></div>
      <div 
        className="absolute w-40 h-40 bg-teal-200 rounded-full opacity-25 animate-pulse delay-2000"
        style={{
          animation: 'pulse 3s ease-in-out infinite 2s, floatAround 20s ease-in-out infinite 4s',
          bottom: '20px',
          left: '25%'
        }}
      ></div>
      <div 
        className="absolute w-28 h-28 bg-blue-300 rounded-full opacity-20 animate-pulse delay-3000"
        style={{
          animation: 'pulse 3s ease-in-out infinite 3s, floatAround 16s ease-in-out infinite 6s',
          bottom: '32px',
          right: '33%'
        }}
      ></div>
      
      {/* Pool tiles pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-12 h-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border border-blue-200"></div>
          ))}
        </div>
      </div>
    </div>

    {/* Mystical animated background elements - Overlapping layer */}
    <div className="absolute inset-0 overflow-hidden animate-color-wheel">
      {/* Floating orbs with enhanced water colors and dramatic movement */}
      <div 
        className="absolute w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-15"
        style={{
          animation: 'blob 7s infinite, floatOrbs 35s ease-in-out infinite',
          top: '20px',
          left: '20px'
        }}
      ></div>
      <div 
        className="absolute w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-15"
        style={{
          animation: 'blob 7s infinite 2s, floatOrbs 40s ease-in-out infinite 8s',
          top: '40px',
          right: '20px'
        }}
      ></div>
      <div 
        className="absolute w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-15"
        style={{
          animation: 'blob 7s infinite 4s, floatOrbs 45s ease-in-out infinite 16s',
          bottom: '-8px',
          left: '25%'
        }}
      ></div>
      <div 
        className="absolute w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-15"
        style={{
          animation: 'blob 7s infinite 6s, floatOrbs 38s ease-in-out infinite 24s',
          bottom: '20px',
          right: '33%'
        }}
      ></div>
      
      {/* Water-themed grid pattern */}
      <div className="absolute inset-0 opacity-8">
        <div className="grid grid-cols-20 h-full">
          {Array.from({ length: 400 }).map((_, i) => (
            <div key={i} className="border border-cyan-300/30"></div>
          ))}
        </div>
      </div>
      
      {/* Floating water particles with enhanced movement */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-300 rounded-full opacity-40 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
              animation: `float ${10 + Math.random() * 20}s linear infinite ${Math.random() * 10}s, floatAround ${15 + Math.random() * 15}s ease-in-out infinite ${Math.random() * 20}s`
            }}
          ></div>
        ))}
      </div>

      {/* Additional water bubbles */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={`bubble-${i}`}
            className="absolute bg-white/20 rounded-full animate-float"
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 25}s`
            }}
          ></div>
        ))}
      </div>
    </div>

    {/* Main content - isolated from animations */}
    <div className="relative z-10 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {session.boards.title}
          </h1>
          <p className="text-sm text-white mt-2">
            Share this URL with others to collaborate: 
            <span className="font-mono ml-2 text-white">
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
  </div>
  )
}
