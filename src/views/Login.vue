<template>
  <div class="login-page">
    <!-- Background Pattern -->
    <div class="background-pattern"></div>
    
    
    <div class="login-container">
      <div class="login-card">
        <!-- Header -->
        <div class="login-header">
          <!-- Theme Toggle -->
          <div class="theme-toggle-container">
            <button 
              type="button" 
              @click="toggleTheme" 
              class="theme-toggle"
              :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            >
              <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
            </button>
          </div>
          
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
      resetSuccess: null,
      isDarkMode: false
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
    },

    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      const theme = this.isDarkMode ? 'dark' : 'light'
      
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
      
      // Update login page class for specific styling
      if (this.isDarkMode) {
        document.querySelector('.login-page').classList.add('dark-theme')
      } else {
        document.querySelector('.login-page').classList.remove('dark-theme')
      }
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
    
    // Initialize theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light'
    this.isDarkMode = savedTheme === 'dark'
    
    // Apply the theme
    document.documentElement.setAttribute('data-theme', savedTheme)
    if (this.isDarkMode) {
      document.querySelector('.login-page').classList.add('dark-theme')
    }
    
    // If already authenticated, redirect to dashboard
    if (this.authStore.isAuthenticated) {
      console.log('🚀 LOGIN DEBUG: Already authenticated, redirecting...')
      this.$router.push('/dashboard')
    }
  },
  
  beforeUnmount() {
    // Clean up theme class if needed
    document.querySelector('.login-page')?.classList.remove('dark-theme')
  }
}
</script>

<style scoped>
/* Main Layout - Beautiful Purple Gradient with Floating Grids */
.login-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: 
    linear-gradient(135deg, #8b9dfc 0%, #9b7bc2 50%, #8b9dfc 100%),
    radial-gradient(circle at top left, rgba(139, 157, 252, 0.4), transparent 50%),
    radial-gradient(circle at bottom right, rgba(155, 123, 194, 0.4), transparent 50%);
  background-size: 300% 300%, 100% 100%, 100% 100%;
  animation: gradientShift 15s ease infinite;
  padding: 1rem;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%, 0% 0%, 100% 100%;
  }
  33% {
    background-position: 50% 0%, 20% 20%, 80% 80%;
  }
  66% {
    background-position: 100% 50%, 80% 80%, 20% 20%;
  }
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  pointer-events: none;
}

@keyframes smoothOrbs {
  0%, 100% { 
    transform: translate(0, 0) scale(1);
    background-position: 25% 75%, 75% 25%, 50% 50%, 10% 90%, 90% 10%;
    opacity: 0.8;
  }
  25% { 
    transform: translate(-10px, -5px) scale(1.05);
    background-position: 35% 65%, 65% 35%, 40% 60%, 20% 80%, 80% 20%;
    opacity: 0.9;
  }
  50% { 
    transform: translate(5px, -8px) scale(0.98);
    background-position: 45% 55%, 55% 45%, 60% 40%, 30% 70%, 70% 30%;
    opacity: 0.7;
  }
  75% { 
    transform: translate(-3px, 6px) scale(1.02);
    background-position: 15% 85%, 85% 15%, 30% 70%, 40% 60%, 60% 40%;
    opacity: 1;
  }
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg) scale(1); 
  }
  25% { 
    transform: translateY(-15px) rotate(1deg) scale(1.02); 
  }
  50% { 
    transform: translateY(-8px) rotate(-0.5deg) scale(1.01); 
  }
  75% { 
    transform: translateY(-20px) rotate(0.8deg) scale(1.03); 
  }
}

@keyframes shimmerMove {
  0% {
    background-position: 0% 0%, 0% 0%, 0% 0%, -100% -100%;
  }
  100% {
    background-position: 100% 100%, 100% 100%, 100% 100%, 200% 200%;
  }
}


.login-container {
  width: 100%;
  max-width: 450px;
  z-index: 1;
  position: relative;
  margin: 2rem auto;
  padding-top: 3rem; /* Add top padding to lower the form */
}

.login-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.08),
    0 2px 10px rgba(0, 0, 0, 0.04);
  padding: 3rem;
  position: relative;
  overflow: visible;
  animation: elegantEntry 1s cubic-bezier(0.165, 0.84, 0.44, 1);
  width: 100%;
  margin: 0 auto;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.login-card::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 30%;
  right: 30%;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    #667eea, 
    transparent);
  opacity: 0.6;
}

.login-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.12),
    0 5px 20px rgba(0, 0, 0, 0.06);
}

@keyframes elegantEntry {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* Theme Toggle */
.theme-toggle-container {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}

.theme-toggle {
  width: 44px;
  height: 44px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.theme-toggle i {
  transition: transform 0.3s ease;
}

.theme-toggle:hover i {
  transform: scale(1.1);
}

/* Header Styles */
.login-header {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.6rem;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.25);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.logo-icon::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, 
    transparent, 
    rgba(255, 255, 255, 0.2), 
    transparent);
  animation: logoShine 4s ease-in-out infinite;
  transform: rotate(-45deg);
}

@keyframes logoShine {
  0%, 100% {
    transform: rotate(-45deg) translate(-100%, -100%);
    opacity: 0;
  }
  50% {
    transform: rotate(-45deg) translate(50%, 50%);
    opacity: 1;
  }
}

.logo-icon {
  animation: logoPulse 3s ease-in-out infinite;
}

@keyframes logoPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.25);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 30px rgba(102, 126, 234, 0.4);
  }
}

.logo-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 30px rgba(102, 126, 234, 0.3);
}

.logo-brand {
  text-align: left;
}

.brand-name {
  font-size: 1.75rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  letter-spacing: -0.025em;
}

.brand-tagline {
  color: #6b7280;
  font-size: 0.8125rem;
  margin: 2px 0 0 0;
  font-weight: 400;
  letter-spacing: 0.025em;
}

.welcome-text h2 {
  color: #111827;
  font-size: 1.375rem;
  font-weight: 600;
  margin: 0 0 0.375rem 0;
  letter-spacing: -0.025em;
}

.welcome-text p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
  font-weight: 400;
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
  padding: 14px 16px 14px 48px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9375rem;
  background: #ffffff;
  transition: all 0.2s ease;
  color: #111827;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.5;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: #ffffff;
}

.form-input:hover:not(:focus):not(:disabled) {
  border-color: #d1d5db;
  background: #fafafa;
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

/* Professional Login Button */
.login-button {
  width: 100%;
  padding: 14px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.25);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.025em;
}

.login-button:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
}

.login-button:active {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background: #9ca3af;
  box-shadow: none;
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

/* Small screens (max-height: 700px) */
@media (max-height: 700px) {
  .login-card {
    padding: 1rem;
  }
  
  .login-header {
    margin-bottom: 1rem;
  }
  
  .form-group {
    margin-bottom: 0.75rem;
  }
  
  .test-accounts-section {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-page {
    padding: 0.5rem;
    align-items: center;
    padding-top: 0;
  }
  
  .login-container {
    max-width: 100%;
    margin: 0 auto;
    padding-top: 2rem; /* Slightly less padding on mobile */
  }
  
  .login-card {
    padding: 1.5rem;
    border-radius: 16px;
    margin: 0 auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  
  .logo-container {
    flex-direction: row;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .logo-icon {
    width: 45px;
    height: 45px;
    font-size: 1.4rem;
  }
  
  .logo-brand {
    text-align: left;
  }
  
  .brand-name {
    font-size: 1.5rem;
  }
  
  .brand-tagline {
    font-size: 0.75rem;
  }
  
  .welcome-text h2 {
    font-size: 1.25rem;
  }
  
  .welcome-text p {
    font-size: 0.85rem;
  }
  
  .form-input {
    padding: 12px 16px 12px 45px;
    font-size: 0.95rem;
  }
  
  .input-icon {
    left: 14px;
    font-size: 1rem;
  }
  
  .login-button {
    padding: 14px 20px;
    font-size: 0.95rem;
  }
  
  
  .social-buttons {
    flex-direction: row;
    gap: 0.5rem;
  }
  
  .social-button {
    padding: 10px 12px;
    font-size: 0.85rem;
  }
  
  .social-button span {
    display: none;
  }
  
  .test-accounts-section {
    margin-top: 1rem;
    padding-top: 1rem;
  }
  
  .test-accounts-toggle {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
  
  .test-accounts-list h4 {
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
  }
  
  .test-accounts-note {
    font-size: 0.7rem;
    padding: 0.35rem;
    margin-bottom: 0.5rem;
  }
  
  .test-account-cards {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }
  
  .test-account-card {
    padding: 0.5rem;
    min-height: 55px;
  }
  
  .account-role {
    font-size: 0.65rem;
    padding: 0.15rem 0.35rem;
    margin-bottom: 0.25rem;
  }
  
  .account-email {
    font-size: 0.7rem;
  }
  
  .account-description {
    font-size: 0.65rem;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 0.25rem;
    padding-top: 0;
  }
  
  .login-container {
    padding-top: 1.5rem; /* Even less padding on small mobile */
  }
  
  .login-card {
    padding: 1.25rem;
    border-radius: 16px;
  }
  
  .login-header {
    margin-bottom: 1.25rem;
  }
  
  .logo-container {
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  
  .logo-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
  
  .brand-name {
    font-size: 1.3rem;
  }
  
  .brand-tagline {
    display: none;
  }
  
  .welcome-text h2 {
    font-size: 1.1rem;
    margin-bottom: 0.15rem;
  }
  
  .welcome-text p {
    font-size: 0.8rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-label {
    font-size: 0.85rem;
    margin-bottom: 0.35rem;
  }
  
  .form-input {
    padding: 11px 14px 11px 40px;
    font-size: 0.9rem;
  }
  
  .input-icon {
    left: 12px;
    font-size: 0.9rem;
  }
  
  .password-toggle {
    right: 12px;
    padding: 6px;
  }
  
  .form-options {
    margin-bottom: 1rem;
  }
  
  .checkbox-label {
    font-size: 0.8rem;
  }
  
  .forgot-link {
    font-size: 0.8rem;
    padding: 2px 6px;
  }
  
  .login-button {
    padding: 12px 16px;
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }
  
  
  .divider {
    margin: 1rem 0;
  }
  
  .divider span {
    font-size: 0.75rem;
    padding: 0 0.75rem;
  }
  
  .social-buttons {
    margin-bottom: 1rem;
  }
  
  .alert {
    padding: 0.75rem;
    margin-top: 0.75rem;
  }
  
  .alert-title {
    font-size: 0.85rem;
  }
  
  .alert-message {
    font-size: 0.75rem;
  }
}

/* Dark Theme Support - Disabled for Login Page */
@media (prefers-color-scheme: dark) and (max-width: 0px) {
/* This media query will never match, effectively disabling dark theme for login */
  /* Dynamic dark gradient background */
  .login-page {
    background: 
      linear-gradient(135deg, #1e3a8a 0%, #7c3aed 35%, #ec4899 70%, #f97316 100%),
      radial-gradient(circle at top left, rgba(59, 130, 246, 0.5), transparent 50%),
      radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.5), transparent 50%),
      #0f172a;
    background-size: 400% 400%, 100% 100%, 100% 100%, 100% 100%;
    animation: darkGradientShift 20s ease infinite;
  }
  
  @keyframes darkGradientShift {
    0%, 100% {
      background-position: 0% 50%, 0% 0%, 100% 100%, 0% 0%;
    }
    25% {
      background-position: 50% 30%, 20% 20%, 80% 80%, 0% 0%;
    }
    50% {
      background-position: 100% 50%, 50% 50%, 50% 50%, 0% 0%;
    }
    75% {
      background-position: 50% 70%, 80% 80%, 20% 20%, 0% 0%;
    }
  }
  
  .background-pattern {
    background-image: 
      radial-gradient(circle at 25% 75%, rgba(147, 197, 253, 0.2) 0%, transparent 45%),
      radial-gradient(circle at 75% 25%, rgba(196, 181, 253, 0.2) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(251, 146, 60, 0.1) 0%, transparent 50%),
      linear-gradient(45deg, transparent 30%, rgba(236, 72, 153, 0.05) 50%, transparent 70%);
  }
  
  .login-card {
    background: 
      linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%),
      linear-gradient(145deg, rgba(59, 130, 246, 0.03), rgba(168, 85, 247, 0.03));
    backdrop-filter: blur(20px) saturate(1.8);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    border: 1px solid rgba(148, 163, 184, 0.3);
    box-shadow: 
      0 32px 64px rgba(0, 0, 0, 0.5),
      0 16px 32px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(148, 163, 184, 0.1),
      inset 0 1px 0 rgba(148, 163, 184, 0.2);
  }
  
  .login-card::before {
    background: linear-gradient(90deg, 
      transparent, 
      rgba(59, 130, 246, 0.5), 
      rgba(168, 85, 247, 0.5), 
      rgba(236, 72, 153, 0.5), 
      transparent);
    height: 2px;
  }
  
  .logo-icon {
    background: 
      linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%),
      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 50%);
    box-shadow: 
      0 12px 40px rgba(96, 165, 250, 0.4),
      0 6px 16px rgba(167, 139, 250, 0.3),
      inset 0 1px 2px rgba(255, 255, 255, 0.4);
  }
  
  .brand-name {
    background: linear-gradient(135deg, #93c5fd 0%, #c084fc 50%, #fbbf24 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 2px 4px rgba(147, 197, 253, 0.3));
  }
  
  .brand-tagline {
    color: #f1f5f9;
    opacity: 0.9;
  }
  
  /* Enhanced welcome text visibility */
  .welcome-text h2 {
    color: #ffffff;
    font-weight: 700;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    letter-spacing: -0.025em;
  }
  
  .welcome-text p {
    color: #e2e8f0;
    font-weight: 500;
    opacity: 0.95;
  }
  
  .form-input {
    background: rgba(15, 23, 42, 0.6);
    border-color: rgba(100, 116, 139, 0.5);
    color: #f8fafc;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  
  .form-input::placeholder {
    color: #94a3b8;
  }
  
  .form-input:focus {
    border-color: #60a5fa;
    background: rgba(15, 23, 42, 0.7);
    box-shadow: 
      0 0 0 4px rgba(96, 165, 250, 0.15),
      0 8px 25px rgba(96, 165, 250, 0.2),
      inset 0 1px 0 rgba(148, 163, 184, 0.1);
  }
  
  .form-input:hover:not(:focus):not(:disabled) {
    border-color: #64748b;
    background: rgba(15, 23, 42, 0.65);
  }
  
  .form-label {
    color: #f8fafc;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
  
  .input-icon {
    color: #cbd5e1;
  }
  
  .password-toggle {
    color: #cbd5e1;
  }
  
  .password-toggle:hover:not(:disabled) {
    color: #93c5fd;
    background: rgba(147, 197, 253, 0.1);
  }
  
  .checkbox-text {
    color: #f1f5f9;
  }
  
  .forgot-link {
    color: #93c5fd;
  }
  
  .forgot-link:hover {
    color: #60a5fa;
    background: rgba(96, 165, 250, 0.1);
  }
  
  .login-button {
    background: 
      linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%),
      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2), transparent 50%);
    box-shadow: 
      0 8px 32px rgba(59, 130, 246, 0.4),
      0 4px 16px rgba(139, 92, 246, 0.3),
      inset 0 1px 2px rgba(255, 255, 255, 0.3);
  }
  
  .login-button:hover:not(:disabled) {
    box-shadow: 
      0 16px 50px rgba(59, 130, 246, 0.5),
      0 8px 25px rgba(139, 92, 246, 0.4),
      inset 0 1px 2px rgba(255, 255, 255, 0.4);
  }
  
  .divider span {
    color: #e2e8f0;
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.98) 0%, rgba(51, 65, 85, 0.95) 100%);
  }
  
  .social-button {
    background: rgba(15, 23, 42, 0.7);
    border-color: rgba(100, 116, 139, 0.5);
    color: #f1f5f9;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  
  .social-button:hover:not(:disabled) {
    background: rgba(15, 23, 42, 0.85);
    border-color: #60a5fa;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(96, 165, 250, 0.2);
  }
  
  .social-button.google:hover:not(:disabled) {
    border-color: #ef4444;
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.2);
  }
  
  .social-button.microsoft:hover:not(:disabled) {
    border-color: #3b82f6;
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
  }
  
  .test-accounts-toggle {
    color: #f1f5f9;
    background: rgba(15, 23, 42, 0.7);
    border-color: rgba(100, 116, 139, 0.4);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  
  .test-accounts-toggle:hover {
    background: 
      linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(168, 85, 247, 0.08) 100%);
    color: #ffffff;
    border-color: rgba(96, 165, 250, 0.5);
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.2);
  }
  
  .test-accounts-list h4 {
    color: #ffffff;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
  
  .test-accounts-note {
    color: #e2e8f0;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(100, 116, 139, 0.3);
  }
  
  .test-account-card {
    background: rgba(15, 23, 42, 0.7);
    border-color: rgba(100, 116, 139, 0.4);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  
  .test-account-card:hover {
    border-color: #60a5fa;
    background: 
      linear-gradient(145deg, rgba(59, 130, 246, 0.08) 0%, rgba(168, 85, 247, 0.06) 100%);
    box-shadow: 
      0 8px 25px rgba(96, 165, 250, 0.2),
      0 4px 12px rgba(96, 165, 250, 0.15);
  }
  
  .account-email {
    color: #ffffff;
    font-weight: 600;
  }
  
  .account-description {
    color: #e2e8f0;
  }
  
  .account-role.super-admin {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(236, 72, 153, 0.15));
    color: #fca5a5;
    border: 1px solid rgba(252, 165, 165, 0.3);
  }
  
  .account-role.admin {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(96, 165, 250, 0.15));
    color: #93c5fd;
    border: 1px solid rgba(147, 197, 253, 0.3);
  }
  
  .account-role.manager {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(196, 181, 253, 0.15));
    color: #c084fc;
    border: 1px solid rgba(192, 132, 252, 0.3);
  }
  
  .account-role.coordinator {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(134, 239, 172, 0.15));
    color: #86efac;
    border: 1px solid rgba(134, 239, 172, 0.3);
  }
  
  .account-role.care-worker {
    background: linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(251, 191, 36, 0.15));
    color: #fde047;
    border: 1px solid rgba(253, 224, 71, 0.3);
  }
}

/* Enhanced Test Accounts Section */
.test-accounts-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
  position: relative;
}

.test-accounts-section::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(102, 126, 234, 0.4), 
    transparent);
  border-radius: 1px;
}

.test-accounts-toggle {
  width: 100%;
  background: 
    linear-gradient(145deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(226, 232, 240, 0.6);
  color: #64748b;
  padding: 0.875rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.test-accounts-toggle::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(102, 126, 234, 0.05), 
    transparent);
  transition: left 0.5s ease;
}

.test-accounts-toggle:hover {
  background: 
    linear-gradient(145deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-color: rgba(102, 126, 234, 0.3);
  color: #475569;
  transform: translateY(-1px);
  box-shadow: 
    0 4px 12px rgba(102, 126, 234, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.test-accounts-toggle:hover::before {
  left: 100%;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.test-account-card {
  background: 
    linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.test-account-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(102, 126, 234, 0.04), 
    transparent);
  transition: left 0.5s ease;
}

.test-account-card:hover {
  border-color: rgba(102, 126, 234, 0.4);
  box-shadow: 
    0 8px 25px rgba(102, 126, 234, 0.15),
    0 4px 12px rgba(102, 126, 234, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transform: translateY(-3px) scale(1.02);
  background: 
    linear-gradient(145deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.03) 100%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95));
}

.test-account-card:hover::before {
  left: 100%;
}

.test-account-card:active {
  transform: translateY(-1px) scale(1.01);
  transition: all 0.1s ease;
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

/* Dark Theme Styles */
.login-page.dark-theme {
  background: 
    linear-gradient(135deg, #1a1f3a 0%, #2d1b3d 50%, #1a1f3a 100%),
    radial-gradient(circle at top left, rgba(26, 31, 58, 0.8), transparent 50%),
    radial-gradient(circle at bottom right, rgba(45, 27, 61, 0.8), transparent 50%);
}

.dark-theme .login-card {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(100, 116, 139, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.dark-theme .theme-toggle {
  background: rgba(51, 65, 85, 0.7);
  border-color: rgba(100, 116, 139, 0.5);
  color: #e2e8f0;
}

.dark-theme .theme-toggle:hover {
  background: rgba(51, 65, 85, 0.9);
  border-color: rgba(148, 163, 184, 0.6);
}

.dark-theme .brand-name {
  color: #f8fafc;
}

.dark-theme .brand-tagline {
  color: #cbd5e1;
}

.dark-theme .welcome-text h2 {
  color: #f8fafc;
}

.dark-theme .welcome-text p {
  color: #cbd5e1;
}

.dark-theme .form-label {
  color: #f1f5f9;
}

.dark-theme .form-input {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(100, 116, 139, 0.4);
  color: #f8fafc;
}

.dark-theme .form-input:focus {
  background: rgba(15, 23, 42, 0.8);
  border-color: #667eea;
}

.dark-theme .form-input::placeholder {
  color: #94a3b8;
}

.dark-theme .input-icon {
  color: #94a3b8;
}

.dark-theme .checkbox-text {
  color: #cbd5e1;
}

.dark-theme .forgot-link {
  color: #93c5fd;
}

.dark-theme .forgot-link:hover {
  color: #60a5fa;
}

.dark-theme .social-button {
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(100, 116, 139, 0.4);
  color: #cbd5e1;
}

.dark-theme .social-button:hover {
  background: rgba(15, 23, 42, 0.9);
  border-color: rgba(148, 163, 184, 0.6);
}

.dark-theme .divider span {
  color: #94a3b8;
  background: rgba(30, 41, 59, 0.95);
}

.dark-theme .test-accounts-toggle {
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(100, 116, 139, 0.4);
  color: #cbd5e1;
}

.dark-theme .test-accounts-list h4 {
  color: #f8fafc;
}

.dark-theme .test-accounts-note {
  background: rgba(15, 23, 42, 0.6);
  color: #cbd5e1;
  border-color: rgba(100, 116, 139, 0.3);
}

.dark-theme .test-account-card {
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(100, 116, 139, 0.4);
}

.dark-theme .account-email {
  color: #f8fafc;
}
</style>
