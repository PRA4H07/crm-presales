export const LEAD_STATUS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  PITCH_SENT: 'Pitch Sent',
  WON: 'Won',
  LOST: 'Lost',
}

export const STATUS_COLORS = {
  [LEAD_STATUS.NEW]: 'info',
  [LEAD_STATUS.CONTACTED]: 'neutral',
  [LEAD_STATUS.PITCH_SENT]: 'warning',
  [LEAD_STATUS.WON]: 'success',
  [LEAD_STATUS.LOST]: 'danger',
}

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { id: 'leads', label: 'Leads', path: '/leads' },
  { id: 'communication', label: 'Communication', path: '/communication' },
  { id: 'tasks', label: 'Tasks', path: '/tasks' },
  { id: 'notifications', label: 'Notifications', path: '/notifications' },
  { id: 'clients', label: 'Clients', path: '/clients' },
  { id: 'settings', label: 'Settings', path: '/settings' },
]

export const NAVIGATION_ROLE_ACCESS = {
  dashboard: ['admin', 'employee', 'system_admin'],
  leads: ['admin', 'employee'],
  communication: ['admin', 'employee'],
  tasks: ['admin', 'employee'],
  notifications: ['admin', 'employee'],
  clients: ['admin', 'employee'],
  settings: ['admin', 'system_admin', 'employee'],
}

export const TASK_STATUS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  BLOCKED: 'Blocked',
  COMPLETED: 'Completed',
}
