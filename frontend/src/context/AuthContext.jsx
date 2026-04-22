import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const USER_KEY = 'user'
const TOKEN_KEY = 'token'
const LEGACY_AUTH_KEY = 'crm_auth_user'

function readStoredAuth() {
  const token = window.localStorage.getItem(TOKEN_KEY)
  const userRaw = window.localStorage.getItem(USER_KEY)
  if (!token || !userRaw) {
    return { user: null, token: null }
  }
  try {
    const user = JSON.parse(userRaw)
    if (user && typeof user === 'object') {
      return { user, token }
    }
  } catch {
    // ignore bad stored json
  }
  window.localStorage.removeItem(USER_KEY)
  window.localStorage.removeItem(TOKEN_KEY)
  return { user: null, token: null }
}

export function AuthProvider({ children }) {
  const [{ user, token }, setAuth] = useState(() => {
    window.localStorage.removeItem(LEGACY_AUTH_KEY)
    return readStoredAuth()
  })

  function login(userData, tokenValue) {
    window.localStorage.removeItem(LEGACY_AUTH_KEY)
    setAuth({ user: userData, token: tokenValue })
    window.localStorage.setItem(USER_KEY, JSON.stringify(userData))
    window.localStorage.setItem(TOKEN_KEY, tokenValue)
  }

  function logout() {
    window.localStorage.removeItem(LEGACY_AUTH_KEY)
    setAuth({ user: null, token: null })
    window.localStorage.removeItem(USER_KEY)
    window.localStorage.removeItem(TOKEN_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
