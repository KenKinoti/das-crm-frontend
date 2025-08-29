import { defineStore } from 'pinia'
import { usersService } from '../services/users'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    currentUser: null,
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    }
  }),

  getters: {
    usersByRole: (state) => {
      return state.users.reduce((acc, user) => {
        acc[user.role] = acc[user.role] || []
        acc[user.role].push(user)
        return acc
      }, {})
    },

    activeUsers: (state) => {
      return state.users.filter(user => user.is_active)
    }
  },

  actions: {
    async fetchUsers(params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await usersService.getAll(params)
        this.users = response.data.users || response.data
        this.pagination = response.data.pagination || this.pagination
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch users'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchUser(id) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await usersService.getById(id)
        this.currentUser = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch user'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createUser(userData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await usersService.create(userData)
        this.users.unshift(response.data)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create user'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateUser(id, userData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await usersService.update(id, userData)
        const index = this.users.findIndex(u => u.id === id)
        if (index !== -1) {
          this.users[index] = response.data
        }
        if (this.currentUser?.id === id) {
          this.currentUser = response.data
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update user'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteUser(id) {
      this.isLoading = true
      this.error = null
      
      try {
        await usersService.delete(id)
        this.users = this.users.filter(u => u.id !== id)
        if (this.currentUser?.id === id) {
          this.currentUser = null
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete user'
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})