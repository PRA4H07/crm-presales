import { API_ENDPOINTS } from '../constants/api'
import httpClient from './httpClient'



export const clientService = {
  async getClients(params = {}) {
    const response = await httpClient.get(API_ENDPOINTS.clients.list, { params })
    return response.data
  },

  async getClientById(clientId) {
    const response = await httpClient.get(API_ENDPOINTS.clients.details(clientId))
    return response.data
  },

  async createClient(payload) {
    const response = await httpClient.post(API_ENDPOINTS.clients.create, payload)
    return response.data
  },

  async updateClient(clientId, payload) {
    const response = await httpClient.put(API_ENDPOINTS.clients.update(clientId), payload)
    return response.data
  },

  async deleteClient(clientId) {
    const response = await httpClient.delete(API_ENDPOINTS.clients.remove(clientId))
    return response.data
  },

  async updateClientStatus(clientId, status) {
  const response = await httpClient.put(`/api/clients/${clientId}/status`, { status })
  return response.data
},
}
