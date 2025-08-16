import axios from 'axios'
import { useAuthStore } from '../stores/auth'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor with auto token refresh
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(
            'http://localhost:8080/api/v1/auth/refresh',
            { refresh_token: refreshToken },
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 15000
            }
          )

          const newToken = response.data.data.token
          localStorage.setItem('auth_token', newToken)
          
          // Update the failed request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
      }

      // If refresh fails, logout user
      const authStore = useAuthStore()
      await authStore.logout()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api
