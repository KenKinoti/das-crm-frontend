import { defineStore } from 'pinia'
import { authService } from '../services/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('auth_token'),
    refreshToken: localStorage.getItem('refresh_token'),
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => {
      if (state.user) {
        return `${state.user.first_name} ${state.user.last_name}`.trim()
      }
      return 'User'
    },
    userInitials: (state) => {
      if (state.user) {
        const first = state.user.first_name?.[0] || ''
        const last = state.user.last_name?.[0] || ''
        return (first + last).toUpperCase()
      }
      return 'U'
    }
  },

  actions: {
    async login(credentials) {
      this.isLoading = true
      this.error = null
      
      try {
        console.log('Attempting login with:', credentials.email)
        
        // Try backend first
        try {
          const response = await authService.login(credentials)
          console.log('Backend login response:', response)
          
          if (response.success) {
            this.token = response.data.token
            this.refreshToken = response.data.refresh_token
            this.user = response.data.user
            
            // Store tokens in localStorage
            localStorage.setItem('auth_token', this.token)
            if (this.refreshToken) {
              localStorage.setItem('refresh_token', this.refreshToken)
            }
            
            console.log('Login successful - user:', this.user)
            return response
          } else {
            throw new Error(response.error?.message || 'Login failed')
          }
        } catch (backendError) {
          console.log('Backend login failed, trying mock auth:', backendError.message)
          
          // Fallback to mock authentication
          if (credentials.email === 'kennedy@dasyin.com.au' && credentials.password === 'password') {
            this.token = 'mock-jwt-token'
            this.user = {
              id: 'user_admin',
              email: credentials.email,
              first_name: 'Kennedy',
              last_name: 'Dasyin',
              role: 'admin'
            }
            localStorage.setItem('auth_token', this.token)
            console.log('Mock login successful - user:', this.user)
            return { success: true }
          } else {
            throw new Error('Invalid credentials')
          }
        }
      } catch (error) {
        console.error('Login error:', error)
        this.error = error.response?.data?.error?.message || error.message || 'Login failed'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        if (this.token && this.token !== 'mock-jwt-token') {
          await authService.logout()
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // Clear local state regardless of API call result
        this.token = null
        this.refreshToken = null
        this.user = null
        this.error = null
        
        // Clear localStorage
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        
        console.log('Logout complete')
      }
    },

    async getCurrentUser() {
      if (!this.token) {
        console.log('No token, cannot get current user')
        return false
      }
      
      if (this.token === 'mock-jwt-token') {
        // Mock auth - set user if not already set
        if (!this.user) {
          this.user = {
            id: 'user_admin',
            email: 'kennedy@dasyin.com.au',
            first_name: 'Kennedy',
            last_name: 'Dasyin',
            role: 'admin'
          }
        }
        console.log('Mock user loaded:', this.user)
        return true
      }
      
      try {
        const response = await authService.getCurrentUser()
        
        if (response.success) {
          this.user = response.data
          console.log('Real user loaded:', this.user)
          return true
        } else {
          console.log('Failed to get current user, logging out')
          await this.logout()
          return false
        }
      } catch (error) {
        console.error('Get user error:', error)
        await this.logout()
        return false
      }
    },

    async checkAuth() {
      console.log('Checking auth - token exists:', !!this.token)
      
      if (!this.token) return false
      
      try {
        const result = await this.getCurrentUser()
        console.log('Auth check result:', result)
        return result
      } catch (error) {
        console.error('Auth check error:', error)
        await this.logout()
        return false
      }
    }
  }
})
