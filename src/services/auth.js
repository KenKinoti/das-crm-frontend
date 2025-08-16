import api from './api'

export const authService = {
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials)
      return response
    } catch (error) {
      throw error
    }
  },

  async logout() {
    try {
      const response = await api.post('/auth/logout')
      return response
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error)
      return { success: true }
    }
  },

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      
      const response = await api.post('/auth/refresh', { 
        refresh_token: refreshToken 
      })
      return response
    } catch (error) {
      throw error
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/users/me')
      return response
    } catch (error) {
      throw error
    }
  }
}
