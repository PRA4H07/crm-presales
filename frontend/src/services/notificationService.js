import { API_ENDPOINTS } from '../constants/api'
import httpClient from './httpClient'

const STORAGE_KEY = 'crm_notifications'

const mockNotifications = [
  {
    id: 'noti_001',
    title: 'New lead assigned',
    description: 'Aarav Sharma has been assigned to your queue.',
    assignedTo: 'user_002',
    visibleTo: ['admin', 'employee'],
    createdAt: '2026-04-06T10:45:00Z',
    isRead: false,
  },
  {
    id: 'noti_002',
    title: 'Task due in 2 hours',
    description: 'Send revised proposal deck for Helio Ventures.',
    assignedTo: 'user_001',
    visibleTo: ['admin', 'system_admin'],
    createdAt: '2026-04-06T09:20:00Z',
    isRead: false,
  },
  {
    id: 'noti_003',
    title: 'Client replied',
    description: 'Priya Iyer replied in Communication thread.',
    assignedTo: 'user_002',
    visibleTo: ['employee'],
    createdAt: '2026-04-06T08:50:00Z',
    isRead: false,
  },
  {
    id: 'noti_004',
    title: 'Lead status updated',
    description: 'Kabir Mehta moved to Contacted.',
    assignedTo: 'user_001',
    visibleTo: ['admin', 'employee'],
    createdAt: '2026-04-06T07:10:00Z',
    isRead: true,
  },
  {
    id: 'noti_005',
    title: 'Pitch version approved',
    description: 'Version 3 is approved by reviewer.',
    assignedTo: 'user_001',
    visibleTo: ['admin', 'system_admin'],
    createdAt: '2026-04-05T16:40:00Z',
    isRead: true,
  },
]

function readStore() {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mockNotifications))
    return mockNotifications
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : mockNotifications
  } catch {
    return mockNotifications
  }
}

function writeStore(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const notificationService = {
  async getNotifications(useMock = true) {
    if (useMock) {
      return Promise.resolve({ data: readStore() })
    }

    const response = await httpClient.get(API_ENDPOINTS.notifications.list)
    return response.data
  },

  async markRead(notificationIds = [], useMock = true) {
    if (useMock) {
      const updatedNotifications = readStore().map((item) =>
        notificationIds.includes(item.id) ? { ...item, isRead: true } : item,
      )
      writeStore(updatedNotifications)

      return Promise.resolve({
        data: {
          notificationIds,
          markedAt: new Date().toISOString(),
        },
      })
    }

    const response = await httpClient.post(API_ENDPOINTS.notifications.markRead, {
      notificationIds,
    })
    return response.data
  },
}
