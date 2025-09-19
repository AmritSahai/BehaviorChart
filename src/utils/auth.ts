import { supabase } from '@/lib/supabase'

/**
 * Check if the user is authenticated by verifying the token
 * This function can be used for additional security checks
 */
export async function verifyAuthToken(): Promise<boolean> {
  try {
    // Get the current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return false
    }

    // Check if token exists in localStorage as backup
    const storedToken = localStorage.getItem('auth_token')
    if (!storedToken) {
      return false
    }

    // Verify the token is still valid
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      // Clear invalid token
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      return false
    }

    return true
  } catch (error) {
    console.error('Token verification error:', error)
    return false
  }
}

/**
 * Get the stored auth token from localStorage
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

/**
 * Get the stored user data from localStorage
 */
export function getStoredUserData(): any | null {
  if (typeof window === 'undefined') return null
  
  try {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Error parsing stored user data:', error)
    return null
  }
}

/**
 * Clear all stored auth data
 */
export function clearStoredAuthData(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_data')
}

/**
 * Check if user has valid authentication (both Supabase session and localStorage)
 */
export async function isUserAuthenticated(): Promise<boolean> {
  const hasStoredToken = !!getStoredToken()
  const hasValidSession = await verifyAuthToken()
  
  return hasStoredToken && hasValidSession
}
