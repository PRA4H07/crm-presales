import axiosInstance from './axiosInstance'

export function login(payload) {
  return axiosInstance.post('auth/login', payload)
}
