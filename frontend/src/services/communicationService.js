import { API_ENDPOINTS } from '../constants/api'
import httpClient from './httpClient'

const mockConversations = [
  {
    id: 'conv_001',
    contactName: 'Aarav Sharma',
    subject: 'Follow-up on discovery call',
    lastMessageAt: '2026-04-06T10:25:00Z',
    direction: 'received',
    status: 'read',
  },
  {
    id: 'conv_002',
    contactName: 'Priya Iyer',
    subject: 'Updated pricing deck attached',
    lastMessageAt: '2026-04-06T08:10:00Z',
    direction: 'sent',
    status: 'delivered',
  },
  {
    id: 'conv_003',
    contactName: 'Kabir Mehta',
    subject: 'POC timeline confirmation',
    lastMessageAt: '2026-04-05T16:40:00Z',
    direction: 'received',
    status: 'sent',
  },
]

const mockConversationDetails = {
  conv_001: {
    id: 'conv_001',
    subject: 'Follow-up on discovery call',
    participants: [
      { name: 'Aarav Sharma', email: 'aarav@novaedge.com' },
      { name: 'Pre-Sales Manager', email: 'manager@crm.com' },
    ],
    messages: [
      {
        id: 'msg_001',
        direction: 'received',
        body: 'Thanks for the demo. Can you share the implementation timeline?',
        createdAt: '2026-04-06T09:45:00Z',
        status: 'read',
      },
      {
        id: 'msg_002',
        direction: 'sent',
        body: 'Absolutely. We can start within 2 weeks and complete phase-1 in 6 weeks.',
        createdAt: '2026-04-06T10:00:00Z',
        status: 'delivered',
      },
      {
        id: 'msg_003',
        direction: 'received',
        body: 'Great, please include this in the proposal update.',
        createdAt: '2026-04-06T10:25:00Z',
        status: 'read',
      },
    ],
    timeline: [
      {
        id: 'event_001',
        type: 'email',
        description: 'Email thread updated by Aarav Sharma',
        createdAt: '2026-04-06T10:25:00Z',
        status: 'read',
      },
      {
        id: 'event_002',
        type: 'note',
        description: 'Internal note: Share implementation milestone slide.',
        createdAt: '2026-04-06T10:12:00Z',
        status: 'sent',
      },
      {
        id: 'event_003',
        type: 'interaction',
        description: 'Discovery call completed (30m).',
        createdAt: '2026-04-06T09:30:00Z',
        status: 'delivered',
      },
    ],
  },
}

function withFallbackDetails(conversationId) {
  const summary = mockConversations.find((item) => item.id === conversationId)
  if (!summary) {
    return {
      id: conversationId,
      subject: 'Conversation',
      participants: [],
      messages: [],
      timeline: [],
    }
  }

  return {
    id: summary.id,
    subject: summary.subject,
    participants: [{ name: summary.contactName, email: 'contact@example.com' }],
    messages: [],
    timeline: [],
  }
}

export const communicationService = {
  async getCommunications(params = {}, useMock = true) {
    if (useMock) {
      const filter = params.filter || 'all'
      const data =
        filter === 'all'
          ? mockConversations
          : mockConversations.filter((item) => item.direction === filter)

      return Promise.resolve({ data })
    }

    const response = await httpClient.get(API_ENDPOINTS.communications.list, { params })
    return response.data
  },

  async getCommunicationById(communicationId, useMock = true) {
    if (useMock) {
      return Promise.resolve({
        data: mockConversationDetails[communicationId] || withFallbackDetails(communicationId),
      })
    }

    const response = await httpClient.get(
      API_ENDPOINTS.communications.details(communicationId),
    )
    return response.data
  },

  async sendCommunication(payload, useMock = true) {
    if (useMock) {
      return Promise.resolve({
        data: {
          id: `msg_${Date.now()}`,
          conversationId: payload.conversationId,
          status: 'sent',
          createdAt: new Date().toISOString(),
        },
      })
    }

    const response = await httpClient.post(API_ENDPOINTS.communications.send, payload)
    return response.data
  },
}
