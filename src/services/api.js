/**
 * =============================================================================
 * API Service - DASYIN PRO Healthcare Management System
 * =============================================================================
 * 
 * This service handles all API interactions with the Go Fiber backend.
 * All data is fetched from the real PostgreSQL database.
 * 
 * Backend API Endpoints:
 * ---------------------
 * - /auth/* - Authentication endpoints
 * - /participants - Participant management
 * - /users - Staff/user management  
 * - /organizations - Organization management
 * - /reports/* - Reporting endpoints
 * - /admin/* - Administrative functions
 * 
 * =============================================================================
 */

import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { useOrganizationContextStore } from '../stores/organizationContext'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Login function to get real JWT tokens
export const login = async (email, password) => {
  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
    const response = await axios.post(`${baseURL}/auth/login`, {
      email,
      password
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    })

    const { token, refresh_token, user } = response.data.data
    
    // Store real tokens
    localStorage.setItem('auth_token', token)
    localStorage.setItem('refresh_token', refresh_token)
    localStorage.setItem('user_data', JSON.stringify(user))
    
    return { success: true, data: response.data.data }
  } catch (error) {
    console.error('Login failed:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || 'Login failed' 
    }
  }
}

// Request interceptor to add auth token and organization filtering
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add organization filtering for super admin
    try {
      const authStore = useAuthStore()
      const orgContextStore = useOrganizationContextStore()
      
      // Only add organization filter for super admins when they have selected a specific org
      if (authStore.isSuperAdmin && orgContextStore.currentOrgId) {
        // Add organization_id as a query parameter for GET requests
        if (config.method === 'get') {
          config.params = config.params || {}
          config.params.organization_id = orgContextStore.currentOrgId
        }
        // Add organization_id as a header for all requests
        config.headers['X-Organization-ID'] = orgContextStore.currentOrgId
      }
    } catch (error) {
      console.warn('Error adding organization filter to request:', error)
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
          const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
          const response = await axios.post(
            `${baseURL}/auth/refresh`,
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

      // Clear tokens and redirect to login (avoid API call loop)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('current_user')
      localStorage.removeItem('user_data')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)


export default api
