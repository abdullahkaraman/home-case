import axios from 'axios'
import store from '@/store'

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = store.getters['auth/getToken']
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
