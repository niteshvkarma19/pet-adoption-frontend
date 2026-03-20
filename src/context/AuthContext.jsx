import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../api/auth.js'

const AuthContext = createContext(null)

const TOKEN_KEY = 'pet_adoption_token'
const USER_KEY = 'pet_adoption_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false

    async function refreshMe() {
      try {
        const me = await getCurrentUser()
        if (!cancelled && me) {
          localStorage.setItem(USER_KEY, JSON.stringify(me))
          setUser(me)
        }
      } catch {
        // Keep existing local user if /users/me fails.
      }
    }

    refreshMe()
    return () => {
      cancelled = true
    }
  }, [token])

  const storeAuth = (payload) => {
    localStorage.setItem(TOKEN_KEY, payload.token)
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
    setToken(payload.token)
    setUser(payload.user)
  }

  const login = async (payload) => {
    setLoading(true)
    try {
      const response = await loginUser(payload)
      storeAuth(response)
      return response
    } finally {
      setLoading(false)
    }
  }

  const register = async (payload) => {
    setLoading(true)
    try {
      const response = await registerUser(payload)
      return response
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await logoutUser()
    } catch {
      // Always clear frontend auth even if logout request fails.
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [loading, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.')
  }
  return context
}
