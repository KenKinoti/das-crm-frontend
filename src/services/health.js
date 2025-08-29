import axios from 'axios'

export const healthService = {
  async checkHealth() {
    try {
      const response = await axios.get('http://localhost:8080/health', {
        timeout: 5000
      })
      return response.data
    } catch (error) {
      throw error
    }
  }
}