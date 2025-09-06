/**
 * =============================================================================
 * Worker Availability Service - DASYIN PRO Healthcare Management System
 * =============================================================================
 * 
 * This service handles all API interactions for worker availability management.
 * Includes availability patterns, preferences, skills, and capacity management.
 * 
 * =============================================================================
 */

import api from './api'

export const availabilityService = {
  // Worker Availability Patterns
  async getAvailability(userId = null) {
    const params = userId ? { user_id: userId } : {}
    const response = await api.get('/worker/availability', { params })
    return response.data
  },

  async createAvailability(availabilityData) {
    const response = await api.post('/worker/availability', availabilityData)
    return response.data
  },

  async updateAvailability(id, availabilityData) {
    const response = await api.put(`/worker/availability/${id}`, availabilityData)
    return response.data
  },

  async deleteAvailability(id) {
    const response = await api.delete(`/worker/availability/${id}`)
    return response.data
  },

  async bulkUpdateAvailability(availabilityData) {
    const response = await api.post('/worker/availability/bulk', availabilityData)
    return response.data
  },

  async getAvailabilityTemplate() {
    const response = await api.get('/worker/availability/template')
    return response.data
  },

  // Worker Preferences
  async getWorkerPreferences(userId = null) {
    const params = userId ? { user_id: userId } : {}
    const response = await api.get('/worker/preferences', { params })
    return response.data
  },

  async createOrUpdateWorkerPreferences(preferencesData) {
    const response = await api.post('/worker/preferences', preferencesData)
    return response.data
  },

  async updateWorkerPreferences(id, preferencesData) {
    const response = await api.put(`/worker/preferences/${id}`, preferencesData)
    return response.data
  },

  // Worker Skills
  async getWorkerSkills(userId = null) {
    const params = userId ? { user_id: userId } : {}
    const response = await api.get('/worker/skills', { params })
    return response.data
  },

  async createWorkerSkill(skillData) {
    const response = await api.post('/worker/skills', skillData)
    return response.data
  },

  async updateWorkerSkill(id, skillData) {
    const response = await api.put(`/worker/skills/${id}`, skillData)
    return response.data
  },

  async deleteWorkerSkill(id) {
    const response = await api.delete(`/worker/skills/${id}`)
    return response.data
  },

  async getSkillCategories() {
    const response = await api.get('/worker/skills/categories')
    return response.data
  },

  async getExpiringSkills(userId = null) {
    const params = userId ? { user_id: userId } : {}
    const response = await api.get('/worker/skills/expiring', { params })
    return response.data
  },

  // Location Preferences
  async getLocationPreferences(userId = null) {
    const params = userId ? { user_id: userId } : {}
    const response = await api.get('/worker/locations', { params })
    return response.data
  },

  async createLocationPreference(locationData) {
    const response = await api.post('/worker/locations', locationData)
    return response.data
  },

  async updateLocationPreference(id, locationData) {
    const response = await api.put(`/worker/locations/${id}`, locationData)
    return response.data
  },

  async deleteLocationPreference(id) {
    const response = await api.delete(`/worker/locations/${id}`)
    return response.data
  },

  // Capacity and Reports
  async getCapacitySummary(userId = null) {
    const params = userId ? { user_id: userId } : {}
    const response = await api.get('/worker/capacity/summary', { params })
    return response.data
  },

  async getWeeklyCapacity(userId = null) {
    const params = userId ? { user_id: userId } : {}
    const response = await api.get('/worker/capacity/weekly', { params })
    return response.data
  },

  async getAvailabilityConflicts(userId = null) {
    const params = userId ? { user_id: userId } : {}
    const response = await api.get('/worker/capacity/conflicts', { params })
    return response.data
  },

  // Availability Exceptions
  async getAvailabilityExceptions(userId = null) {
    const params = userId ? { user_id: userId } : {}
    const response = await api.get('/worker/availability/exceptions', { params })
    return response.data
  },

  async createAvailabilityException(exceptionData) {
    const response = await api.post('/worker/availability/exceptions', exceptionData)
    return response.data
  },

  async updateAvailabilityException(id, exceptionData) {
    const response = await api.put(`/worker/availability/exceptions/${id}`, exceptionData)
    return response.data
  },

  async deleteAvailabilityException(id) {
    const response = await api.delete(`/worker/availability/exceptions/${id}`)
    return response.data
  },

  async approveAvailabilityException(id) {
    const response = await api.post(`/worker/availability/exceptions/${id}/approve`)
    return response.data
  }
}

export default availabilityService