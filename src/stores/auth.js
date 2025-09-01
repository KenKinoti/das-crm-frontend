import { defineStore } from 'pinia'
import { authService } from '../services/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    refreshToken: null,
    isLoading: false,
    error: null,
    _initializing: false
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
        
        // Check if this is one of our frontend test users - always use mock for them
        const mockUsers = this.getMockUsers()
        console.log('🔐 AUTH DEBUG: Mock users available:', mockUsers.map(u => u.email))
        const mockUser = mockUsers.find(u => u.email === credentials.email)
        
        if (mockUser) {
          console.log('🔐 AUTH DEBUG: Using mock authentication for frontend test user:', credentials.email)
          console.log('🔐 AUTH DEBUG: Mock user found:', { 
            id: mockUser.id, 
            role: mockUser.role 
          })
          
          // Verify password
          console.log('🔐 AUTH DEBUG: Verifying password...')
          if (mockUser.password !== credentials.password) {
            console.log('🔐 AUTH DEBUG: Password verification failed')
            throw new Error('Invalid credentials for test account')
          }
          console.log('🔐 AUTH DEBUG: Password verified successfully')
          
          // Set up mock authentication
          const newToken = `mock-jwt-token-${mockUser.role}-${Date.now()}`
          const newUser = {
            id: mockUser.id,
            email: mockUser.email,
            first_name: mockUser.first_name,
            last_name: mockUser.last_name,
            role: mockUser.role,
            organization_id: mockUser.organization_id,
            permissions: mockUser.permissions || []
          }
          
          console.log('🔐 AUTH DEBUG: Setting token and user:', {
            token: newToken.substring(0, 30) + '...',
            user: { id: newUser.id, email: newUser.email, role: newUser.role }
          })
          
          this.token = newToken
          this.user = newUser
          
          console.log('🔐 AUTH DEBUG: State after setting:', {
            hasToken: !!this.token,
            hasUser: !!this.user,
            isAuthenticated: this.isAuthenticated,
            tokenMatch: this.token === newToken,
            userMatch: this.user === newUser
          })
          
          localStorage.setItem('auth_token', this.token)
          localStorage.setItem('current_user', JSON.stringify(this.user))
          console.log('🔐 AUTH DEBUG: LocalStorage updated')
          
          // Refresh permissions after successful login
          const permissionsStore = await import('./permissions').then(m => m.usePermissionsStore())
          permissionsStore.refreshPermissions()
          
          console.log('Mock login successful for test user:', { 
            user: this.user, 
            token: this.token,
            isAuthenticated: this.isAuthenticated 
          })
          
          // Verify localStorage was set correctly
          console.log('LocalStorage verification:', {
            auth_token: localStorage.getItem('auth_token'),
            current_user: localStorage.getItem('current_user')
          })
          
          return { success: true, data: { user: this.user, token: this.token } }
        }
        
        // For non-test users, try backend authentication
        try {
          console.log('Attempting backend authentication for:', credentials.email)
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
            
            console.log('Backend login successful:', { user: this.user, token: this.token })
            return response
          } else {
            throw new Error(response.error?.message || 'Login failed')
          }
        } catch (backendError) {
          console.log('Backend login failed:', backendError.message)
          throw new Error('Invalid credentials. Please try again.')
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
        
        // Mock auth - restore user from localStorage if needed
        if (!this.user) {
          console.log('No user in store, checking localStorage')
          const storedUser = localStorage.getItem('current_user')
          if (storedUser) {
            try {
              this.user = JSON.parse(storedUser)
              console.log('User restored from localStorage:', this.user)
            } catch (error) {
              console.error('Error parsing stored user:', error)
              // Don't clear auth state, just fallback
              this.user = {
                id: 'user_admin',
                email: 'kennedy@dasyin.com.au',
                first_name: 'Ken',
                last_name: 'Kinoti',
                role: 'super_admin',
                organization_id: 'org_1'
              }
            }
          } else {
            console.log('No stored user, using fallback admin')
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
          organization_id: '3ce93742-a4bf-401a-9150-91af9ce3e87b',
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
          organization_id: '3ce93742-a4bf-401a-9150-91af9ce3e87b',
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
          organization_id: '3ce93742-a4bf-401a-9150-91af9ce3e87b',
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
          organization_id: '3ce93742-a4bf-401a-9150-91af9ce3e87b',
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
          organization_id: '3ce93742-a4bf-401a-9150-91af9ce3e87b',
          permissions: ['view_schedules', 'update_shifts', 'view_participants']
        },
        
        // Organization 2 Admin
        {
          id: 'user_org2_admin',
          email: 'org2admin@dasyin.com.au',
          password: 'password',
          first_name: 'Mark',
          last_name: 'Davis',
          role: 'admin',
          organization_id: '872ed655-c801-4eb4-8f7f-ff4666d5cc24',
          permissions: ['manage_users', 'manage_participants', 'view_reports', 'manage_billing']
        }
      ]
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
            return true
          } catch (error) {
            console.error('Error parsing stored user:', error)
            this.logout()
            return false
          }
        }
        
        // If we have a token but no user, try to get user data
        if (token.startsWith('mock-jwt-token')) {
          return await this.getCurrentUser()
        }
        
        return false
      } finally {
        this._initializing = false
      }
    }

  }
})
