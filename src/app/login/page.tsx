'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PhoneInput from 'react-phone-number-input'
// @ts-ignore
import 'react-phone-number-input/style.css'

export default function LoginPage() {
  const { signInWithPhone, verifyOTP, isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [phone, setPhone] = useState<string>('') // Updated type for PhoneInput
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/boards')
    }
  }, [isAuthenticated, authLoading, router])

  async function handleSendOTP() {
    try {
      setLoading(true)
      setError(null)
      
      if (!phone) {
        setError('Please enter a phone number')
        return
      }
      
      await signInWithPhone(phone) // phone is already in international format
      setSuccess('OTP sent! Check your phone.')
      setStep('otp')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      console.error('Send OTP error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOTP() {
    try {
      setLoading(true)
      setError(null)
      
      await verifyOTP(phone, otp) // phone is already formatted
      setSuccess('Login successful!')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      console.error('Verify OTP error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Show loading if checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in with Phone
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome to Behavior Chart
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          {step === 'phone' && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <PhoneInput
                placeholder="Enter phone number"
                value={phone}
                // @ts-ignore
                onChange={setPhone}
                defaultCountry="US"
                className="w-full"
                style={{
                  '--PhoneInput-color--focus': '#2563eb',
                }}
              />
              <button
                onClick={handleSendOTP}
                disabled={loading || !phone}
                className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Enter 6-digit code
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Sent to {phone}
              </p>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456"
                maxLength={6}
                required
              />
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button
                onClick={() => {
                  setStep('phone')
                  setError(null)
                  setSuccess(null)
                  setOtp('')
                }}
                className="mt-2 w-full bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}