import api from './api'

export const usersService = {
  async getAll(params = {}) {
    try {
      const response = await api.get('/users', { params })
      return response
    } catch (error) {
      throw error
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/users/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  async create(userData) {
    try {
      const response = await api.post('/users', userData)
      return response
    } catch (error) {
      throw error
    }
  },

  async update(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData)
      return response
    } catch (error) {
      throw error
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/users/${id}`)
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