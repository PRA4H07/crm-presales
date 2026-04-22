import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [toasts, setToasts] = useState([])

  const toggleSidebar = useCallback(
    () => setSidebarCollapsed((previous) => !previous),
    [],
  )

  const showToast = useCallback((toast) => {
    const id = crypto.randomUUID()
    setToasts((previous) => [...previous, { id, type: 'info', ...toast }])
    window.setTimeout(() => {
      setToasts((previous) => previous.filter((item) => item.id !== id))
    }, 3000)
  }, [])

  const value = useMemo(
    () => ({ sidebarCollapsed, toggleSidebar, toasts, showToast }),
    [showToast, sidebarCollapsed, toasts, toggleSidebar],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  const context = useContext(UIContext)
  if (!context) {
    throw new Error('useUI must be used within UIProvider')
  }
  return context
}
