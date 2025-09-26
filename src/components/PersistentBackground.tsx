'use client'

import { useState } from 'react'

export default function PersistentBackground() {
  // Generate static particle positions to prevent re-rendering
  const [particles] = useState(() => 
    Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 20,
      floatAroundDelay: Math.random() * 20,
      floatAroundDuration: 15 + Math.random() * 15
    }))
  )

  const [bubbles] = useState(() =>
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 15,
      duration: 15 + Math.random() * 25
    }))
  )

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
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
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-cyan-300 rounded-full opacity-40 animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                animation: `float ${particle.duration}s linear infinite ${particle.delay}s, floatAround ${particle.floatAroundDuration}s ease-in-out infinite ${particle.floatAroundDelay}s`
              }}
            ></div>
          ))}
        </div>

        {/* Additional water bubbles */}
        <div className="absolute inset-0">
          {bubbles.map((bubble) => (
            <div
              key={`bubble-${bubble.id}`}
              className="absolute bg-white/20 rounded-full animate-float"
              style={{
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                left: `${bubble.left}%`,
                top: `${bubble.top}%`,
                animationDelay: `${bubble.delay}s`,
                animationDuration: `${bubble.duration}s`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}
