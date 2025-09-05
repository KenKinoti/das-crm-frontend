import axios from 'axios'

export const healthService = {
  async checkHealth() {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://das-crm-backend-567187485284.us-central1.run.app/api/v1'
      const healthURL = baseURL.replace('/api/v1', '/health')
      const response = await axios.get(healthURL, {
        timeout: 5000
      })
      return response.data
    } catch (error) {
      throw error
    }
  }
}