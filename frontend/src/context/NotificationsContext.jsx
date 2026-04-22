import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { notificationService } from '../services/notificationService'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const { user } = useAuth()
  const [allNotifications, setAllNotifications] = useState([])

  useEffect(() => {
    async function loadNotifications() {
      const response = await notificationService.getNotifications()
      const raw = response.data || []
      const cleaned = raw
        .map((item) => ({
          ...item,
          title: String(item?.title || '').trim(),
          description: String(item?.description || '').trim(),
          assignedTo: item?.assignedTo || null,
          visibleTo: Array.isArray(item?.visibleTo) ? item.visibleTo : [],
          isRead: Boolean(item?.isRead),
          createdAt: item?.createdAt || new Date().toISOString(),
        }))
        .filter((item) => item.title)
      setAllNotifications(cleaned)
    }
    loadNotifications()
  }, [])

  const role = user?.role
  const isAdmin = role === 'admin'
  const isSystemAdmin = role === 'system_admin'
  const userId = user?.id

  let notifications = []
  if (isAdmin || isSystemAdmin) {
    notifications = allNotifications
  } else if (role && userId) {
    notifications = allNotifications.filter((item) => {
      const matchesAssignee = item.assignedTo && item.assignedTo === userId
      const roleVisible = item.visibleTo.includes(role)
      return matchesAssignee || roleVisible
    })
  }

  const unreadCount = notifications.filter((item) => !item.isRead).length

  async function markNotificationRead(notificationId) {
    setAllNotifications((previous) =>
      previous.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item,
      ),
    )
    await notificationService.markRead([notificationId])
  }

  async function markAllRead() {
    const unreadIds = notifications.filter((item) => !item.isRead).map((item) => item.id)
    if (!unreadIds.length) {
      return
    }

    setAllNotifications((previous) =>
      previous.map((item) =>
        unreadIds.includes(item.id) ? { ...item, isRead: true } : item,
      ),
    )
    await notificationService.markRead(unreadIds)
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markNotificationRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider')
  }
  return context
}
