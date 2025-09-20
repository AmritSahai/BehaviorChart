'use client'

import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900 animate-color-wheel-slow"></div>
        
        {/* Pool-themed background elements with color animation */}
        <div className="absolute inset-0 overflow-hidden animate-color-wheel-slow">
          {/* Water ripple effects - Pool theme */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-cyan-200 rounded-full opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-teal-200 rounded-full opacity-25 animate-pulse delay-2000"></div>
          <div className="absolute bottom-32 right-1/3 w-28 h-28 bg-blue-300 rounded-full opacity-20 animate-pulse delay-3000"></div>
          
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
          {/* Floating orbs with water colors */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/4 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-20 right-1/3 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-6000"></div>
          
          {/* Water-themed grid pattern */}
          <div className="absolute inset-0 opacity-8">
            <div className="grid grid-cols-20 h-full">
              {Array.from({ length: 400 }).map((_, i) => (
                <div key={i} className="border border-cyan-300/30"></div>
              ))}
            </div>
          </div>
          
          {/* Floating water particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-cyan-300 rounded-full opacity-40 animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${10 + Math.random() * 20}s`
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
        <nav className="bg-cyan-900/30 backdrop-blur-md shadow-lg border-b border-cyan-300/30 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-white">Behavior Chart</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-white/80">{user?.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
          <div className="px-4 py-6 sm:px-0">
            {/* Behavior Chart Board - Completely isolated from color animations */}
            <div className="flex justify-center relative z-20">
              <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden border-4 border-gray-800">
                {/* Top Section - Blue Sky/Clouds */}
                <div className="bg-gradient-to-b from-blue-400 to-blue-300 p-8 relative min-h-[160px] flex items-center justify-center">
                  <div className="absolute inset-0">
                    {/* Clouds */}
                    <div className="absolute top-4 left-8 w-12 h-8 bg-white rounded-full opacity-80"></div>
                    <div className="absolute top-6 left-12 w-8 h-6 bg-white rounded-full opacity-80"></div>
                    <div className="absolute top-2 right-12 w-16 h-10 bg-white rounded-full opacity-80"></div>
                    <div className="absolute top-4 right-8 w-10 h-7 bg-white rounded-full opacity-80"></div>
                    <div className="absolute top-3 right-16 w-6 h-5 bg-white rounded-full opacity-80"></div>
                  </div>
                  <h2 className="text-4xl font-bold text-blue-800 uppercase tracking-wider relative z-10" style={{ fontFamily: 'Comic Sans MS, cursive' }}>GOOD BOYYY</h2>
                </div>

                {/* Second Section - Green Grass */}
                <div className="bg-gradient-to-b from-green-400 to-green-300 p-8 relative min-h-[160px] flex flex-col items-center justify-center">
                  <div className="text-center">
                    <p className="text-black text-lg mb-2" style={{ fontFamily: 'Brush Script MT, cursive' }}>YK What...</p>
                    <h2 className="text-4xl font-bold text-black uppercase tracking-wider" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>HELL YEAH</h2>
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
                <div className="bg-gradient-to-b from-pink-300 to-pink-200 p-8 relative min-h-[160px] flex flex-col items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-4xl font-bold text-purple-600 uppercase tracking-wider" style={{ fontFamily: 'Chiller, fantasy' }}>FUCKIN'</h2>
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
                <div className="bg-gradient-to-t from-orange-500 via-red-600 to-black p-8 relative min-h-[160px] flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-400 via-red-500 to-transparent opacity-60"></div>
                  <h2 className="text-4xl font-bold text-white uppercase tracking-wider relative z-10" style={{ fontFamily: 'Creepster, fantasy' }}>IN THE FIRE</h2>
                  
                  {/* Flame decorations on text */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="absolute -top-3 left-3 w-2 h-4 bg-orange-400 rounded-full transform rotate-12"></div>
                    <div className="absolute -top-2 right-3 w-1 h-3 bg-yellow-400 rounded-full transform -rotate-12"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
