/**
 * Auto Authentication Utility for DASYIN PRO
 * Automatically authenticates with the backend on app startup
 */

export async function autoAuthenticate() {
  try {
    console.log('🔄 Auto-authentication: Starting...')
    
    // Check if we already have a valid backend token
    const currentToken = localStorage.getItem('auth_token')
    if (currentToken) {
      // Validate token format (JWT should have 3 parts separated by dots)
      const parts = currentToken.split('.')
      if (parts.length === 3 && parts.every(part => part.length > 0)) {
        console.log('✅ Auto-authentication: Valid token already exists')
        return true
      } else {
        console.log('🧹 Auto-authentication: Removing invalid token...')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('current_user')
        localStorage.removeItem('user_data')
      }
    }
    
    // Login with backend credentials
    const response = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({
        email: 'admin@dasyin.com.au',
        password: 'password'
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (data.success && data.data.token) {
      // Set real JWT tokens
      localStorage.setItem('auth_token', data.data.token)
      localStorage.setItem('refresh_token', data.data.refresh_token)
      localStorage.setItem('user_data', JSON.stringify(data.data.user))
      localStorage.setItem('current_user', JSON.stringify(data.data.user))
      
      console.log('✅ Auto-authentication: Success!')
      console.log('🔑 Real JWT token set')
      console.log('👤 User:', data.data.user.first_name, data.data.user.last_name)
      console.log('🏢 Role:', data.data.user.role)
      
      return true
    } else {
      throw new Error('Invalid response from backend')
    }
    
  } catch (error) {
    console.error('❌ Auto-authentication failed:', error.message)
    return false
  }
}

// Call auto-authenticate when this module is imported, but don't block app loading
setTimeout(() => {
  autoAuthenticate().catch(error => {
    console.warn('Auto-authentication failed during app startup:', error.message)
    // Don't throw - let the app continue loading
  })
}, 100)