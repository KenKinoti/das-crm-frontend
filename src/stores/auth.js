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
      this.isLoading = true
      this.error = null
      
      try {
        
        // Try backend first
        try {
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
            
            return response
          } else {
            throw new Error(response.error?.message || 'Login failed')
          }
        } catch (backendError) {
          console.log('Backend login failed, falling back to mock authentication')
          
          // Fallback to mock authentication with multiple test users
          const mockUsers = this.getMockUsers()
          console.log('Available mock users:', mockUsers.map(u => ({ email: u.email, role: u.role })))
          console.log('Attempting login with:', { email: credentials.email, password: credentials.password })
          
          const user = mockUsers.find(u => u.email === credentials.email && u.password === credentials.password)
          console.log('Found user:', user)
          
          if (user) {
            this.token = `mock-jwt-token-${user.role}`
            this.user = {
              id: user.id,
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              role: user.role,
              organization_id: user.organization_id,
              permissions: user.permissions || []
            }
            localStorage.setItem('auth_token', this.token)
            localStorage.setItem('current_user', JSON.stringify(this.user))
            
            // Refresh permissions after successful login
            const permissionsStore = await import('./permissions').then(m => m.usePermissionsStore())
            permissionsStore.refreshPermissions()
            
            console.log('Mock login successful:', { user: this.user, token: this.token })
            return { success: true, data: { user: this.user, token: this.token } }
          } else {
            throw new Error('Invalid credentials. Try one of the test accounts.')
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
        // Only call API logout if we have a valid real JWT token (not mock tokens)
        if (this.token && !this.token.startsWith('mock-jwt-token') && this.isValidJWT(this.token)) {
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
        
        // Clear localStorage
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('current_user')
      }
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
      
      if (this.token?.startsWith('mock-jwt-token')) {
        console.log('Mock token detected, current user:', this.user)
        
        // Mock auth - restore user from localStorage or fallback
        if (!this.user) {
          console.log('No user in store, checking localStorage')
          const storedUser = localStorage.getItem('current_user')
          if (storedUser) {
            this.user = JSON.parse(storedUser)
            console.log('User restored from localStorage:', this.user)
          } else {
            console.log('No stored user, using fallback admin')
            // Fallback to super admin if no stored user
            this.user = {
              id: 'user_admin',
              email: 'kennedy@dasyin.com.au',
              first_name: 'Ken',
              last_name: 'Kinoti',
              role: 'super_admin',
              organization_id: 'org_1'
            }
          }
        }
        console.log('Final user for mock auth:', this.user)
        return true
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

    // Mock users for testing different roles and permissions
    getMockUsers() {
      return [
        // Super Admin - Full system access
        {
          id: 'user_superadmin',
          email: 'admin@dasyin.com.au',
          password: 'password',
          first_name: 'System',
          last_name: 'Administrator',
          role: 'super_admin',
          organization_id: null,
          permissions: ['all']
        },
        
        // Organization Admin - Full org access
        {
          id: 'user_admin',
          email: 'kennedy@dasyin.com.au',
          password: 'password',
          first_name: 'Ken',
          last_name: 'Kinoti',
          role: 'admin',
          organization_id: 'org_1',
          permissions: ['manage_users', 'manage_participants', 'view_reports', 'manage_billing']
        },
        
        // Manager - Limited management access
        {
          id: 'user_manager',
          email: 'manager@dasyin.com.au',
          password: 'password',
          first_name: 'Sarah',
          last_name: 'Wilson',
          role: 'manager',
          organization_id: 'org_1',
          permissions: ['manage_staff', 'manage_schedules', 'view_reports']
        },
        
        // Support Coordinator - Participant focused
        {
          id: 'user_coordinator',
          email: 'coordinator@dasyin.com.au',
          password: 'password',
          first_name: 'Lisa',
          last_name: 'Johnson',
          role: 'support_coordinator',
          organization_id: 'org_1',
          permissions: ['manage_participants', 'manage_care_plans', 'view_schedules']
        },
        
        // Care Worker - Basic access
        {
          id: 'user_careworker',
          email: 'careworker@dasyin.com.au',
          password: 'password',
          first_name: 'John',
          last_name: 'Smith',
          role: 'care_worker',
          organization_id: 'org_1',
          permissions: ['view_schedules', 'update_shifts', 'view_participants']
        },
        
        // Different Organization Admin
        {
          id: 'user_admin2',
          email: 'admin2@example.com',
          password: 'password',
          first_name: 'Mark',
          last_name: 'Davis',
          role: 'admin',
          organization_id: 'org_2',
          permissions: ['manage_users', 'manage_participants', 'view_reports', 'manage_billing']
        }
      ]
    }
  }
})
