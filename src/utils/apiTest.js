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
    console.log('💡 Make sure your GoFiber backend is running on http://localhost:8080')
    return false
  }
}

export const logAPIStatus = () => {
  console.log('📡 API Configuration:')
  console.log('  - Base URL: http://localhost:8080/api/v1')
  console.log('  - Health Check: http://localhost:8080/health')
  console.log('  - Auth Token:', localStorage.getItem('auth_token') ? 'Present' : 'None')
  console.log('  - Refresh Token:', localStorage.getItem('refresh_token') ? 'Present' : 'None')
}