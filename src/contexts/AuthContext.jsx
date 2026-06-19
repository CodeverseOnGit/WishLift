import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { authService } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Retry up to 5 times with backoff — handles the race where
  // onAuthStateChange fires before the profile row is inserted.
  async function loadProfile(userId, attempt = 0) {
    try {
      const p = await authService.getProfile(userId)
      setProfile(p)
    } catch (e) {
      if (attempt < 5) {
        setTimeout(() => loadProfile(userId, attempt + 1), 300 * (attempt + 1))
      } else {
        console.error('Could not load profile after retries:', e)
      }
    } finally {
      if (attempt === 0) setLoading(false)
    }
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.id)
  }

  // Called by Register page to seed profile immediately without waiting
  // for the retry loop — eliminates the race condition entirely.
  function setProfileDirect(p) {
    setProfile(p)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, setProfileDirect }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
