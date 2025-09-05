import { healthService } from '../services/health'
import { authService } from '../services/auth'

export const testAPIConnection = async () => {
  console.log('🧪 Testing API Connection...')
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...')
    const healthResponse = await healthService.checkHealth()
    console.log('✅ Health check passed:', healthResponse)
    
    // Test 2: Try login with test credentials (if backend is running)
    console.log('2️⃣ Testing authentication...')
    try {
      const loginResponse = await authService.login({
        email: 'kennedy@dasyin.com.au',
        password: 'password'
      })
      console.log('✅ Authentication test passed:', loginResponse)
      return true
    } catch (authError) {
      console.log('⚠️ Auth test failed (backend may not be configured):', authError.message)
      return false
    }
    
  } catch (error) {
    console.log('❌ API Connection test failed:', error.message)
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://das-crm-backend-567187485284.us-central1.run.app/api/v1'
    console.log(`💡 Make sure your backend is accessible at ${baseURL}`)
    return false
  }
}

export const logAPIStatus = () => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://das-crm-backend-ug5fk2kuxq-uc.a.run.app/api/v1'
  const healthURL = baseURL.replace('/api/v1', '/health')
  console.log('📡 API Configuration:')
  console.log(`  - Base URL: ${baseURL}`)
  console.log(`  - Health Check: ${healthURL}`)
  console.log('  - Auth Token:', localStorage.getItem('auth_token') ? 'Present' : 'None')
  console.log('  - Refresh Token:', localStorage.getItem('refresh_token') ? 'Present' : 'None')
}