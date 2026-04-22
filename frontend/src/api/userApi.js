import axiosInstance from './axiosInstance'

export function createUser(payload) {
  return axiosInstance.post('/users', payload)
}

export function getAdmins() {
  return axiosInstance.get('/users?role=ADMIN')
}