const API_PREFIX = '/api'

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  TIMEOUT_MS: 15000,
  USE_MOCKS: import.meta.env.VITE_USE_MOCKS === 'true',
}

export const API_ENDPOINTS = {
  auth: {
    profile: `${API_PREFIX}/auth/me`,
  },
  dashboard: {
    summary: `${API_PREFIX}/dashboard/summary`,
    activities: `${API_PREFIX}/dashboard/activities`,
  },
  leads: {
    list: `${API_PREFIX}/leads`,
    create: `${API_PREFIX}/leads`,
    details: (leadId) => `${API_PREFIX}/leads/${leadId}`,
    update: (leadId) => `${API_PREFIX}/leads/${leadId}`,
    assign: (leadId) => `${API_PREFIX}/leads/${leadId}/assign`,
  },
  clients: {
    list: `${API_PREFIX}/clients`,
    create: `${API_PREFIX}/clients`,
    details: (clientId) => `${API_PREFIX}/clients/${clientId}`,
    update: (clientId) => `${API_PREFIX}/clients/${clientId}`,
    remove: (clientId) => `${API_PREFIX}/clients/${clientId}`,
  },
  tasks: {
    list: `${API_PREFIX}/tasks`,
    myTasks: `${API_PREFIX}/tasks/my`,
    details: (taskId) => `${API_PREFIX}/tasks/${taskId}`,
    update: (taskId) => `${API_PREFIX}/tasks/${taskId}`,
    updateStatus: (taskId) => `${API_PREFIX}/tasks/${taskId}/status`,
  },
  notifications: {
    list: `${API_PREFIX}/notifications`,
    markRead: `${API_PREFIX}/notifications/mark-read`,
  },
  communications: {
    list: `${API_PREFIX}/communications`,
    details: (communicationId) => `${API_PREFIX}/communications/${communicationId}`,
    send: `${API_PREFIX}/communications/send`,
  },
  pitches: {
    list: `${API_PREFIX}/pitches`,
    create: `${API_PREFIX}/pitches`,
    details: (pitchId) => `${API_PREFIX}/pitches/${pitchId}`,
    update: (pitchId) => `${API_PREFIX}/pitches/${pitchId}`,
    versions: (pitchId) => `${API_PREFIX}/pitches/${pitchId}/versions`,
  },
  admin: {
    users: `${API_PREFIX}/admin/users`,
    assignments: `${API_PREFIX}/admin/assignments`,
  },
}

export const API_CONTRACTS = {
  'GET /api/leads': {
    query: {
      search: 'string',
      status: 'New | Contacted | Pitch Sent | Won | Lost',
      page: 'number',
      limit: 'number',
    },
    response: {
      data: [{ id: 'string', name: 'string', company: 'string', status: 'string' }],
      meta: { page: 'number', limit: 'number', total: 'number' },
    },
  },
  'POST /api/leads': {
    body: { name: 'string', company: 'string', email: 'string', source: 'string' },
    response: { data: { id: 'string' }, message: 'Lead created' },
  },
  'GET /api/leads/:id': {
    response: { data: { id: 'string', activities: 'array', pitchHistory: 'array' } },
  },
  'POST /api/pitches': {
    body: { leadId: 'string', title: 'string', content: 'string' },
    response: { data: { id: 'string', version: 'number' } },
  },
  'PUT /api/pitches/:id': {
    body: { title: 'string', content: 'string', feedback: 'string' },
    response: { data: { id: 'string', version: 'number', updatedAt: 'string' } },
  },
  'GET /api/tasks/my': {
    query: {
      status: 'To Do | In Progress | Blocked | Completed',
      priority: 'Low | Medium | High',
    },
    response: {
      data: [
        {
          id: 'string',
          title: 'string',
          status: 'string',
          dueDate: 'ISO date string',
          leadId: 'string',
          assigneeId: 'string',
        },
      ],
    },
  },
  'PUT /api/tasks/:id/status': {
    body: { status: 'To Do | In Progress | Blocked | Completed' },
    response: { data: { id: 'string', status: 'string', updatedAt: 'string' } },
  },
  'GET /api/communications': {
    query: {
      filter: 'all | sent | received',
      leadId: 'string',
      search: 'string',
    },
    response: {
      data: [
        {
          id: 'string',
          contactName: 'string',
          subject: 'string',
          lastMessageAt: 'ISO date string',
          direction: 'sent | received',
          status: 'sent | delivered | read',
        },
      ],
    },
  },
  'GET /api/communications/:id': {
    response: {
      data: {
        id: 'string',
        subject: 'string',
        participants: 'array',
        messages: 'array',
        timeline: 'array',
      },
    },
  },
  'POST /api/communications/send': {
    body: {
      conversationId: 'string',
      to: 'string',
      subject: 'string',
      body: 'string',
    },
    response: {
      data: {
        id: 'string',
        conversationId: 'string',
        status: 'sent',
        createdAt: 'ISO date string',
      },
    },
  },
  'GET /api/notifications': {
    response: {
      data: [
        {
          id: 'string',
          title: 'string',
          description: 'string',
          createdAt: 'ISO date string',
          isRead: 'boolean',
        },
      ],
    },
  },
  'POST /api/notifications/mark-read': {
    body: {
      notificationIds: ['string'],
    },
    response: {
      data: {
        notificationIds: ['string'],
        markedAt: 'ISO date string',
      },
    },
  },
  'GET /api/clients': {
    query: {
      search: 'string',
      status: 'Active | Prospect | Inactive',
      company: 'string',
      owner: 'string',
      page: 'number',
      limit: 'number',
    },
    response: {
      data: [{ id: 'string', name: 'string', company: 'string', status: 'string' }],
      meta: { page: 'number', limit: 'number', total: 'number' },
    },
  },
  'POST /api/clients': {
    body: {
      name: 'string',
      company: 'string',
      email: 'string',
      phone: 'string',
      status: 'Active | Prospect | Inactive',
      owner: 'string',
    },
    response: { data: { id: 'string' }, message: 'Client created' },
  },
  'GET /api/clients/:id': {
    response: {
      data: {
        id: 'string',
        name: 'string',
        communicationHistory: 'array',
        relatedTasks: 'array',
        notes: 'array',
      },
    },
  },
}
