import { defineStore } from 'pinia'
import { authService } from '../services/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    refreshToken: null,
    isLoading: false,
    error: null,
    _initializing: false,
    inactivityTimer: null,
    inactivityWarning: false,
    inactivityTimeout: 5 * 60 * 1000, // 5 minutes in milliseconds
    warningTimeout: 30 * 1000 // 30 seconds warning before logout
  }),

  getters: {
    isAuthenticated: (state) => {
      // Must have both token and user data for true authentication
      const hasToken = !!state.token
      const hasUser = !!state.user
      const result = hasToken && hasUser
      
      console.log('🔍 AUTH DEBUG: isAuthenticated getter called', {
        hasToken,
        hasUser,
        result,
        tokenType: typeof state.token,
        userType: typeof state.user
      })
      
      return result
    },
    isSuperAdmin: (state) => state.user?.role === 'super_admin',
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
      console.log('🔐 AUTH DEBUG: Login method called', { 
        email: credentials.email, 
        timestamp: new Date().toISOString() 
      })
      
      this.isLoading = true
      this.error = null
      
      try {
        console.log('🔐 AUTH DEBUG: Starting login process for:', credentials.email)
        console.log('🔐 AUTH DEBUG: Initial state:', {
          hasToken: !!this.token,
          hasUser: !!this.user,
          isAuthenticated: this.isAuthenticated
        })
        
        // Backend authentication only - no mock users
        console.log('🔐 AUTH DEBUG: Attempting backend authentication for:', credentials.email)
        const response = await authService.login(credentials)
        
        if (response.success) {
          this.token = response.data.token
          this.refreshToken = response.data.refresh_token
          this.user = response.data.user
          
          // Store tokens in localStorage
          localStorage.setItem('auth_token', this.token)
          if (this.refreshToken) {
            localStorage.setItem('refresh_token', this.refreshToken)
          }
          localStorage.setItem('current_user', JSON.stringify(this.user))
          
          // Start inactivity timer after successful login
          this.startInactivityTimer()
          
          console.log('✅ Backend login successful:', { user: this.user, token: this.token })
          return response
        } else {
          throw new Error(response.error?.message || 'Login failed')
        }
      } catch (error) {
        console.error('Login error:', error)
        this.error = error.response?.data?.error?.message || error.message || 'Login failed'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async logout(reason = 'manual') {
      try {
        console.log(`🚪 Logout initiated: ${reason}`)
        
        // Clear inactivity timer
        this.clearInactivityTimer()
        
        // Call API logout if we have a valid JWT token
        if (this.token && this.isValidJWT(this.token)) {
          await authService.logout()
        }
      } catch (error) {
        console.error('Logout error:', error)
        // Don't throw error - continue with local cleanup
      } finally {
        // Clear local state regardless of API call result
        this.token = null
        this.refreshToken = null
        this.user = null
        this.error = null
        this.inactivityWarning = false
        
        // Clear localStorage
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('current_user')
        localStorage.removeItem('user_data')
        
        // If logout was due to inactivity, redirect to login
        if (reason === 'inactivity' && window.location.pathname !== '/login') {
          window.location.href = '/login?reason=inactivity'
        }
      }
    },

    // Start inactivity timer
    startInactivityTimer() {
      console.log('⏰ Starting inactivity timer (5 minutes)')
      this.clearInactivityTimer()
      
      this.inactivityTimer = setTimeout(() => {
        this.showInactivityWarning()
      }, this.inactivityTimeout - this.warningTimeout)
    },

    // Clear inactivity timer
    clearInactivityTimer() {
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer)
        this.inactivityTimer = null
        this.inactivityWarning = false
      }
    },

    // Show inactivity warning
    showInactivityWarning() {
      console.log('⚠️ Showing inactivity warning')
      this.inactivityWarning = true
      
      // Final countdown - logout in 30 seconds
      setTimeout(() => {
        if (this.inactivityWarning) {
          this.logout('inactivity')
        }
      }, this.warningTimeout)
    },

    // Reset inactivity timer on user activity
    resetInactivityTimer() {
      if (this.isAuthenticated) {
        this.inactivityWarning = false
        this.startInactivityTimer()
      }
    },

    // Dismiss inactivity warning and reset timer
    dismissInactivityWarning() {
      console.log('✅ Inactivity warning dismissed by user')
      this.inactivityWarning = false
      this.startInactivityTimer()
    },

    // Helper method to validate JWT format
    isValidJWT(token) {
      if (!token || typeof token !== 'string') return false
      const parts = token.split('.')
      return parts.length === 3 && parts.every(part => part.length > 0)
    },

    async getCurrentUser() {
      console.log('getCurrentUser called, token:', this.token)
      
      if (!this.token) {
        console.log('No token found')
        return false
      }
      
      try {
        const response = await authService.getCurrentUser()
        
        if (response.success) {
          this.user = response.data
          return true
        } else {
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
      
      if (!this.token) return false
      
      try {
        const result = await this.getCurrentUser()
        return result
      } catch (error) {
        console.error('Auth check error:', error)
        await this.logout()
        return false
      }
    },


    // Initialize authentication state from localStorage
    async initializeAuth() {
      // Prevent multiple simultaneous initialization calls
      if (this._initializing) {
        console.log('Auth initialization already in progress...')
        return this.isAuthenticated
      }
      
      this._initializing = true
      console.log('Initializing auth state...')
      
      try {
        const token = localStorage.getItem('auth_token')
        const storedUser = localStorage.getItem('current_user')
        
        if (!token) {
          console.log('No token found in localStorage')
          return false
        }
        
        this.token = token
        
        if (storedUser) {
          try {
            this.user = JSON.parse(storedUser)
            console.log('Auth state initialized:', { token: !!this.token, user: !!this.user })
            
            // Validate token is still valid by checking user data
            const isValid = await this.getCurrentUser()
            
            // Start inactivity timer if authentication is valid
            if (isValid) {
              this.startInactivityTimer()
            }
            
            return isValid
          } catch (error) {
            console.error('Error parsing stored user:', error)
            this.logout()
            return false
          }
        }
        
        // If we have a token but no user, try to get user data
        const isValid = await this.getCurrentUser()
        
        // Start inactivity timer if authentication is valid
        if (isValid) {
          this.startInactivityTimer()
        }
        
        return isValid
      } finally {
        this._initializing = false
      }
    }

  }
})
