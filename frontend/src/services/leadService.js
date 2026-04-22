import { API_ENDPOINTS } from '../constants/api'
import { LEAD_STATUS } from '../constants/theme'
import httpClient from './httpClient'

const mockLeads = [
  {
    id: 'lead_001',
    name: 'Aarav Sharma',
    company: 'NovaEdge Systems',
    email: 'aarav@novaedge.com',
    status: LEAD_STATUS.NEW,
  },
  {
    id: 'lead_002',
    name: 'Priya Iyer',
    company: 'Helio Ventures',
    email: 'priya@helio.vc',
    status: LEAD_STATUS.PITCH_SENT,
  },
]

export const leadService = {
  async getLeads(params = {}, useMock = true) {
    if (useMock) {
      return Promise.resolve({
        data: mockLeads,
        meta: { page: 1, limit: 10, total: mockLeads.length },
      })
    }

    const response = await httpClient.get(API_ENDPOINTS.leads.list, { params })
    return response.data
  },
}
