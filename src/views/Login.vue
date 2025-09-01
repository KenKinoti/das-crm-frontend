<template>
  <div class="login-page">
    <!-- Background Pattern -->
    <div class="background-pattern"></div>
    
    <div class="login-container">
      <div class="login-card">
        <!-- Header -->
        <div class="login-header">
          <div class="logo-container">
            <div class="logo-icon">
              <i class="fas fa-heart-pulse"></i>
            </div>
            <div class="logo-brand">
              <h1 class="brand-name">DASYIN CRM</h1>
              <p class="brand-tagline">Client Relationship Management System</p>
            </div>
          </div>
          <div class="welcome-text">
            <h2>Welcome Back</h2>
            <p>Sign in to continue to your dashboard</p>
          </div>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <div class="input-group">
              <div class="input-icon">
                <i class="fas fa-envelope"></i>
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-input"
                placeholder="Enter your email address"
                required
                :disabled="isLoading"
                autocomplete="email"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="input-group">
              <div class="input-icon">
                <i class="fas fa-lock"></i>
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Enter your password"
                required
                :disabled="isLoading"
                autocomplete="current-password"
                @keyup.enter="handleLogin"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :disabled="isLoading"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="form.rememberMe" 
                :disabled="isLoading" 
                class="checkbox-input"
              >
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">Remember me</span>
            </label>
            <button 
              type="button" 
              class="forgot-link" 
              @click="showForgotPassword"
            >
              Forgot password?
            </button>
          </div>

          <button 
            type="submit" 
            @click.prevent="handleLoginClick"
            class="login-button" 
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="button-content">
              <div class="loading-spinner"></div>
              <span>Signing In...</span>
            </span>
            <span v-else class="button-content">
              <i class="fas fa-sign-in-alt"></i>
              <span>Sign In</span>
            </span>
          </button>

          <!-- Emergency backup button (styled better) -->
          <button 
            type="button"
            @click="testLogin"
            class="emergency-button"
            title="Use this if the main login button doesn't work"
          >
            <i class="fas fa-exclamation-triangle"></i>
            Emergency Login
          </button>

          <div class="divider">
            <span>Or continue with</span>
          </div>

          <div class="social-buttons">
            <button 
              type="button" 
              @click="loginWithGoogle" 
              class="social-button google" 
              :disabled="isLoading"
            >
              <i class="fab fa-google"></i>
              <span>Google</span>
            </button>
            <button 
              type="button" 
              @click="loginWithMicrosoft" 
              class="social-button microsoft" 
              :disabled="isLoading"
            >
              <i class="fab fa-microsoft"></i>
              <span>Microsoft</span>
            </button>
          </div>

          <!-- Error and Success Messages -->
          <div v-if="error" class="alert error-alert">
            <div class="alert-icon">
              <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="alert-content">
              <p class="alert-title">Login Failed</p>
              <p class="alert-message">{{ error }}</p>
            </div>
          </div>

          <div v-if="successMessage" class="alert success-alert">
            <div class="alert-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="alert-content">
              <p class="alert-title">Success</p>
              <p class="alert-message">{{ successMessage }}</p>
            </div>
          </div>
        </form>

        <!-- Test Accounts Section -->
        <div class="test-accounts-section">
          <button type="button" @click="showTestAccounts = !showTestAccounts" class="test-accounts-toggle">
            <i :class="showTestAccounts ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            {{ showTestAccounts ? 'Hide' : 'Show' }} Test Accounts
          </button>
          
          <div v-if="showTestAccounts" class="test-accounts-list">
            <h4>Demo Accounts</h4>
            <p class="test-accounts-note">Click any account to auto-fill login credentials</p>
            
            <div class="test-account-cards">
              <div class="test-account-card" @click="fillLoginForm('admin@dasyin.com.au')">
                <div class="account-role super-admin">Super Admin</div>
                <div class="account-email">admin@dasyin.com.au</div>
                <div class="account-description">Full system access</div>
              </div>
              
              <div class="test-account-card" @click="fillLoginForm('kennedy@dasyin.com.au')">
                <div class="account-role admin">Admin</div>
                <div class="account-email">kennedy@dasyin.com.au</div>
                <div class="account-description">Organization admin</div>
              </div>
              
              <div class="test-account-card" @click="fillLoginForm('manager@dasyin.com.au')">
                <div class="account-role manager">Manager</div>
                <div class="account-email">manager@dasyin.com.au</div>
                <div class="account-description">Team management</div>
              </div>
              
              <div class="test-account-card" @click="fillLoginForm('coordinator@dasyin.com.au')">
                <div class="account-role coordinator">Support Coordinator</div>
                <div class="account-email">coordinator@dasyin.com.au</div>
                <div class="account-description">Participant support</div>
              </div>
              
              <div class="test-account-card" @click="fillLoginForm('careworker@dasyin.com.au')">
                <div class="account-role care-worker">Care Worker</div>
                <div class="account-email">careworker@dasyin.com.au</div>
                <div class="account-description">Direct care services</div>
              </div>
              
              <div class="test-account-card" @click="fillLoginForm('org2admin@dasyin.com.au')">
                <div class="account-role admin">Org 2 Admin</div>
                <div class="account-email">org2admin@dasyin.com.au</div>
                <div class="account-description">Organization 2 administrator</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { showInfoModal } from '../utils/notifications'

export default {
  name: 'Login',
  data() {
    return {
      form: {
        email: 'admin@dasyin.com.au',
        password: 'password',
        rememberMe: false
      },
      showPassword: false,
      isLoading: false,
      error: null,
      successMessage: null,
      showForgotPasswordModal: false,
      showTestAccounts: false,
      resetForm: {
        email: ''
      },
      isResetting: false,
      resetError: null,
      resetSuccess: null
    }
  },
  setup() {
    const authStore = useAuthStore()
    return {
      authStore
    }
  },
  methods: {
    async handleLogin() {
      console.log('🚀 LOGIN DEBUG: handleLogin called')
      
      // Check if we're in a try-catch that might be failing silently
      try {
        console.log('🚀 LOGIN DEBUG: Inside try block')
      
      this.isLoading = true
      this.error = null
      this.successMessage = null

      try {
        console.log('🚀 LOGIN DEBUG: Form submitted with credentials:', { 
          email: this.form.email,
          passwordLength: this.form.password?.length 
        })
        
        console.log('🚀 LOGIN DEBUG: AuthStore state before login:', {
          hasToken: !!this.authStore.token,
          hasUser: !!this.authStore.user,
          isAuthenticated: this.authStore.isAuthenticated
        })
        
        const result = await this.authStore.login(this.form)
        console.log('🚀 LOGIN DEBUG: Login result:', result)
        
        console.log('🚀 LOGIN DEBUG: Auth store state after login:', {
          hasToken: !!this.authStore.token,
          hasUser: !!this.authStore.user,
          isAuthenticated: this.authStore.isAuthenticated,
          tokenValue: this.authStore.token ? this.authStore.token.substring(0, 30) + '...' : 'null',
          userEmail: this.authStore.user?.email || 'null'
        })
        
        this.successMessage = 'Login successful! Redirecting...'
        
        // Wait a moment to ensure auth state is fully updated
        await this.$nextTick()
        
        // Small delay to ensure reactivity has updated
        console.log('🚀 LOGIN DEBUG: Waiting for reactivity update...')
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const redirectTo = this.$route.query.redirect || '/dashboard'
        console.log('🚀 LOGIN DEBUG: Preparing to redirect to:', redirectTo)
        
        console.log('🚀 LOGIN DEBUG: Final auth state before redirect:', {
          hasToken: !!this.authStore.token,
          hasUser: !!this.authStore.user,
          isAuthenticated: this.authStore.isAuthenticated,
          tokenValue: this.authStore.token ? this.authStore.token.substring(0, 30) + '...' : 'null',
          userEmail: this.authStore.user?.email || 'null'
        })
        
        // Verify authentication state one more time
        if (!this.authStore.isAuthenticated) {
          console.log('🚀 LOGIN DEBUG: Authentication state check failed!')
          throw new Error('Authentication state not properly set after login')
        }
        
        console.log('🚀 LOGIN DEBUG: Authentication verified, executing redirect...')
        // Use replace instead of push to prevent login page from staying in history
        await this.$router.replace(redirectTo)
        console.log('🚀 LOGIN DEBUG: Router.replace executed')
        
      } catch (error) {
        console.error('🚀 LOGIN DEBUG: Error in try block:', error)
        console.error('🚀 LOGIN DEBUG: Error details:', error.stack)
        this.error = this.authStore.error || error.message || 'Login failed. Please try again.'
      } finally {
        console.log('🚀 LOGIN DEBUG: Finally block executed')
        this.isLoading = false
      }
      
      } catch (outerError) {
        console.error('🚀 LOGIN DEBUG: OUTER CATCH - Critical error:', outerError)
        console.error('🚀 LOGIN DEBUG: OUTER CATCH - Error stack:', outerError.stack)
        this.isLoading = false
        this.error = 'Critical login error: ' + outerError.message
      }
    },

    // EXPLICIT BUTTON CLICK HANDLER
    async handleLoginClick(event) {
      console.log('🚀 BUTTON DEBUG: handleLoginClick called', {
        event: event,
        eventType: event?.type,
        form: this.form,
        disabled: this.isLoading
      })
      
      if (this.isLoading) {
        console.log('🚀 BUTTON DEBUG: Button disabled, ignoring click')
        return
      }
      
      try {
        await this.handleLogin()
      } catch (error) {
        console.error('🚀 BUTTON DEBUG: Click handler error:', error)
      }
    },

    // SUPER SIMPLE TEST METHOD
    async testLogin() {
      console.log('🚀 TEST: Simple login test started')
      try {
        // Set form data manually
        this.form.email = 'admin@dasyin.com.au'
        this.form.password = 'password'
        console.log('🚀 TEST: Form data set:', this.form)
        
        // Call login directly
        await this.handleLogin()
      } catch (error) {
        console.error('🚀 TEST: Login test failed:', error)
      }
    },
    
    showForgotPassword() {
      this.showForgotPasswordModal = true
      this.resetForm.email = this.form.email
      this.resetError = null
      this.resetSuccess = null
    },
    
    closeForgotPassword() {
      this.showForgotPasswordModal = false
      this.resetForm.email = ''
      this.resetError = null
      this.resetSuccess = null
    },
    
    async handlePasswordReset() {
      this.isResetting = true
      this.resetError = null
      this.resetSuccess = null
      
      try {
        // Simulate API call for password reset
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        this.resetSuccess = 'Password reset link has been sent to your email address.'
        
        // Close modal after 3 seconds
        setTimeout(() => {
          this.closeForgotPassword()
        }, 3000)
        
      } catch (error) {
        console.error('Password reset error:', error)
        this.resetError = 'Failed to send reset email. Please try again.'
      } finally {
        this.isResetting = false
      }
    },
    
    async loginWithGoogle() {
      try {
        this.error = null
        this.isLoading = true
        
        showInfoModal('Google OAuth integration is coming soon! This will enable secure sign-in with your Google account.', 'Google Sign-In')
        
      } catch (error) {
        console.error('Google login error:', error)
        this.error = 'Google login failed. Please try again.'
      } finally {
        this.isLoading = false
      }
    },
    
    async loginWithMicrosoft() {
      try {
        this.error = null
        this.isLoading = true
        
        showInfoModal('Microsoft OAuth integration is coming soon! This will enable secure sign-in with your Microsoft account.', 'Microsoft Sign-In')
        
      } catch (error) {
        console.error('Microsoft login error:', error)
        this.error = 'Microsoft login failed. Please try again.'
      } finally {
        this.isLoading = false
      }
    },

    fillLoginForm(email) {
      this.form.email = email
      this.form.password = 'password'
      this.error = null
      this.successMessage = null
    }
  },
  
  mounted() {
    console.log('🚀 LOGIN DEBUG: Login component mounted')
    console.log('🚀 LOGIN DEBUG: Initial form state:', this.form)
    console.log('🚀 LOGIN DEBUG: AuthStore instance:', {
      exists: !!this.authStore,
      hasToken: !!this.authStore?.token,
      hasUser: !!this.authStore?.user,
      isAuthenticated: this.authStore?.isAuthenticated
    })
    console.log('🚀 LOGIN DEBUG: Available test emails:', ['admin@dasyin.com.au', 'kennedy@dasyin.com.au', 'manager@dasyin.com.au', 'coordinator@dasyin.com.au'])
    
    // If already authenticated, redirect to dashboard
    if (this.authStore.isAuthenticated) {
      console.log('🚀 LOGIN DEBUG: Already authenticated, redirecting...')
      this.$router.push('/dashboard')
    }
  }
}
</script>

<style scoped>
/* Main Layout */
.login-page {
  min-height: 100vh;
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(1deg); }
  66% { transform: translateY(-10px) rotate(-1deg); }
}

.login-container {
  width: 100%;
  max-width: 450px;
  z-index: 1;
  position: relative;
}

.login-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 15px 35px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
  animation: slideUp 0.6s ease-out;
  width: 100%;
  margin: 0 auto;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header Styles */
.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.logo-brand {
  text-align: left;
}

.brand-name {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.5px;
}

.brand-tagline {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0;
  font-weight: 500;
}

.welcome-text h2 {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.welcome-text p {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

/* Form Styles */
.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #334155;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.025em;
}

.input-group {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1.1rem;
  z-index: 2;
}

.form-input {
  width: 100%;
  padding: 15px 20px 15px 50px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.95);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #1e293b;
  font-family: inherit;
  line-height: 1.5;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.12);
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}

.form-input:hover:not(:focus):not(:disabled) {
  border-color: #cbd5e1;
  background: rgba(255, 255, 255, 0.95);
}

.form-input:disabled {
  background-color: rgba(248, 250, 252, 0.8);
  cursor: not-allowed;
  opacity: 0.7;
}

.form-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  z-index: 2;
}

.password-toggle:hover:not(:disabled) {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  user-select: none;
}

.checkbox-input {
  opacity: 0;
  position: absolute;
  left: 0;
  top: 0;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: #ffffff;
}

.checkbox-input:checked + .checkbox-custom {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-text {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.forgot-link:hover {
  color: #5a67d8;
  background: rgba(102, 126, 234, 0.1);
}

/* Buttons */
.login-button {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.3);
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.emergency-button {
  width: 100%;
  padding: 10px 20px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.25);
  opacity: 0.9;
}

.emergency-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(245, 158, 11, 0.35);
  opacity: 1;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
}

.divider span {
  padding: 0 1rem;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.95);
}

/* Social Buttons */
.social-buttons {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.social-button {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.social-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.social-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.social-button.google:hover:not(:disabled) {
  border-color: #db4437;
  color: #db4437;
}

.social-button.microsoft:hover:not(:disabled) {
  border-color: #00a1f1;
  color: #00a1f1;
}

/* Alert Styles */
.alert {
  padding: 1rem;
  border-radius: 12px;
  margin-top: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  animation: slideDown 0.3s ease-out;
}

.error-alert {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #f87171;
  color: #dc2626;
}

.success-alert {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #4ade80;
  color: #16a34a;
}

.alert-icon {
  font-size: 1.2rem;
  margin-top: 0.1rem;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin: 0 0 0.25rem 0;
}

.alert-message {
  font-size: 0.85rem;
  margin: 0;
  opacity: 0.9;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-medium);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 2rem 2rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  color: var(--text-dark);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-light);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: var(--text-dark);
  background: #f7fafc;
}

.modal-body {
  padding: 2rem;
}

.modal-body p {
  color: var(--text-medium);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  flex: 1;
}

.btn-primary {
  background: var(--primary-gradient);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-cancel {
  background: #f7fafc;
  color: var(--text-medium);
  border: 1px solid #e2e8f0;
}

.btn-cancel:hover:not(:disabled) {
  background: #edf2f7;
  color: var(--text-dark);
}

.btn-cancel:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Social Login Styles */
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 2rem 0 1.5rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.divider span {
  padding: 0 1rem;
  color: var(--text-light);
  font-size: 0.85rem;
  font-weight: 500;
}

.social-login {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.social-btn {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: var(--border-radius-sm);
  background: white;
  color: var(--text-dark);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.9rem;
}

.social-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.social-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.google-btn i {
  color: #db4437;
}

.microsoft-btn i {
  color: #00a1f1;
}

.google-btn:hover:not(:disabled) {
  border-color: #db4437;
  color: #db4437;
}

.microsoft-btn:hover:not(:disabled) {
  border-color: #00a1f1;
  color: #00a1f1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-page {
    padding: 1rem;
  }
  
  .login-container {
    max-width: 100%;
  }
  
  .login-card {
    padding: 2rem;
    border-radius: 16px;
    margin: 0 auto;
  }
  
  .logo-container {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .logo-brand {
    text-align: center;
  }
  
  .brand-name {
    font-size: 1.75rem;
  }
  
  .social-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .test-account-cards {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .test-account-card {
    padding: 0.75rem;
    min-height: 70px;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 0.25rem;
  }
  
  .login-card {
    padding: 1.5rem;
    border-radius: 16px;
  }
  
  .brand-name {
    font-size: 1.5rem;
  }
  
  .welcome-text h2 {
    font-size: 1.3rem;
  }
  
  .form-input {
    padding: 14px 16px 14px 45px;
  }
  
  .login-button, .emergency-button {
    padding: 14px 20px;
  }
  
  .account-role {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
  
  .account-email {
    font-size: 0.75rem;
  }
  
  .account-description {
    font-size: 0.7rem;
  }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .login-card {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(71, 85, 105, 0.3);
  }
  
  .form-input {
    background: #1e293b;
    border-color: #334155;
    color: #f1f5f9;
  }
  
  .form-input:focus {
    border-color: #667eea;
    background: #1e293b;
  }
  
  .form-input:hover:not(:focus):not(:disabled) {
    border-color: #475569;
    background: rgba(30, 41, 59, 0.95);
  }
  
  .form-label {
    color: #e2e8f0;
  }
  
  .checkbox-text {
    color: #cbd5e1;
  }
  
  .welcome-text h2 {
    color: #f1f5f9;
  }
  
  .welcome-text p {
    color: #94a3b8;
  }
  
  .test-accounts-toggle {
    color: #cbd5e1;
  }
  
  .test-accounts-toggle:hover {
    background: #334155;
    color: #f1f5f9;
  }
  
  .test-accounts-list h4 {
    color: #f1f5f9;
  }
  
  .test-accounts-note {
    color: #94a3b8;
    background: #334155;
  }
  
  .test-account-card {
    background: #1e293b;
    border-color: #475569;
  }
  
  .test-account-card:hover {
    border-color: #667eea;
    background: #334155;
  }
  
  .account-email {
    color: #f1f5f9;
  }
  
  .account-description {
    color: #94a3b8;
  }
}

/* Test Accounts Section Styling */
.test-accounts-section {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e2e8f0;
}

.test-accounts-toggle {
  width: 100%;
  background: none;
  border: none;
  color: #64748b;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.test-accounts-toggle:hover {
  background: #f8fafc;
  color: var(--text-dark);
}

.test-accounts-list {
  margin-top: 1rem;
  animation: slideDown 0.3s ease;
}

.test-accounts-list h4 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-size: 0.95rem;
  font-weight: 600;
}

.test-accounts-note {
  margin: 0 0 1rem 0;
  color: #64748b;
  font-size: 0.8rem;
  text-align: center;
  background: #f8fafc;
  padding: 0.5rem;
  border-radius: 8px;
}

.test-account-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.test-account-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.test-account-card:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
  transform: translateY(-1px);
}

.account-role {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.account-role.super-admin {
  background: #fee2e2;
  color: #dc2626;
}

.account-role.admin {
  background: #dbeafe;
  color: #2563eb;
}

.account-role.manager {
  background: #f3e8ff;
  color: #7c3aed;
}

.account-role.coordinator {
  background: #ecfdf5;
  color: #059669;
}

.account-role.care-worker {
  background: #fef3c7;
  color: #d97706;
}

.account-email {
  color: #1e293b;
  font-weight: 500;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.account-description {
  color: #64748b;
  font-size: 0.75rem;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
