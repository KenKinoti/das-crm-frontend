<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <div class="card shadow-lg" style="width: 100%; max-width: 400px;">
      <div class="card-body p-4">
        <div class="text-center mb-4">
          <div class="mb-3">
            <div class="stat-icon mx-auto" style="width: 60px; height: 60px; font-size: 1.5rem;">
              <i class="fas fa-heart-pulse"></i>
            </div>
          </div>
          <h3 class="gradient-text mb-2">DASYIN PRO</h3>
          <h4 class="mb-1">Welcome Back</h4>
          <p class="text-muted">Sign in to your account to continue</p>
        </div>

        <form @submit.prevent="handleLogin" @submit="console.log('🚀 FORM DEBUG: Form submitted!')">
          <div class="mb-3">
            <label for="email" class="form-label">Email Address</label>
            <div class="position-relative">
              <i class="fas fa-envelope position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-control ps-5"
                placeholder="Enter your email"
                required
                :disabled="isLoading"
                autocomplete="email"
              />
            </div>
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <div class="position-relative">
              <i class="fas fa-lock position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control ps-5 pe-5"
                placeholder="Enter your password"
                required
                :disabled="isLoading"
                autocomplete="current-password"
                @keyup.enter="handleLogin"
              />
              <button
                type="button"
                class="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 text-muted"
                @click="showPassword = !showPassword"
                :disabled="isLoading"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" v-model="form.rememberMe" :disabled="isLoading" id="rememberMe">
              <label class="form-check-label" for="rememberMe">
                Remember me
              </label>
            </div>
            <a href="#" class="text-decoration-none" @click.prevent="showForgotPassword">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            @click.prevent="handleLoginClick"
            class="btn btn-primary w-100 mb-3" 
            :disabled="isLoading"
          >
            <span v-if="isLoading">
              <i class="fas fa-spinner fa-spin me-2"></i>
              Signing In...
            </span>
            <span v-else>Sign In</span>
          </button>

          <!-- EMERGENCY BACKUP BUTTON -->
          <button 
            type="button"
            @click="testLogin"
            class="btn btn-success w-100 mb-3"
            style="background: green !important;"
          >
            🚨 EMERGENCY LOGIN (Click this GREEN button if blue button doesn't work)
          </button>

          <div class="text-center mb-3">
            <hr class="my-3">
            <span class="text-muted">Or continue with</span>
          </div>

          <div class="d-grid gap-2">
            <button type="button" @click="loginWithGoogle" class="btn btn-outline-secondary" :disabled="isLoading">
              <i class="fab fa-google me-2"></i>
              Google
            </button>
            <button type="button" @click="loginWithMicrosoft" class="btn btn-outline-info" :disabled="isLoading">
              <i class="fab fa-microsoft me-2"></i>
              Microsoft
            </button>
          </div>

          <div v-if="error" class="alert alert-danger mt-3" role="alert">
            <i class="fas fa-exclamation-circle me-2"></i>
            {{ error }}
          </div>

          <div v-if="successMessage" class="alert alert-success mt-3" role="alert">
            <i class="fas fa-check-circle me-2"></i>
            {{ successMessage }}
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
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-card {
  background: var(--white);
  padding: 2.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-medium);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.login-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: var(--primary-gradient);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.8rem;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-header h2 {
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.login-header p {
  color: var(--text-medium);
  font-size: 0.9rem;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-dark);
  font-weight: 500;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 40px 12px 40px;
  border: 2px solid #e2e8f0;
  border-radius: var(--border-radius-sm);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-wrapper input:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 4px;
  transition: color 0.3s ease;
}

.password-toggle:hover:not(:disabled) {
  color: var(--primary-color);
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-medium);
  cursor: pointer;
}

.checkbox-wrapper input:disabled {
  cursor: not-allowed;
}

.forgot-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  background: #fee;
  color: #c53030;
  padding: 12px;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  margin-top: 1rem;
  border: 1px solid #fed7d7;
}

.success-message {
  background: #f0fff4;
  color: #38a169;
  padding: 12px;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  margin-top: 1rem;
  border: 1px solid #9ae6b4;
}

.login-footer {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
  color: var(--text-light);
  font-size: 0.8rem;
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

@media (max-width: 640px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-card {
    padding: 2rem;
    max-width: 100%;
  }
  
  .test-account-cards {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .test-account-card {
    padding: 0.75rem;
    min-height: 70px;
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

@media (max-width: 480px) {
  .login-container {
    padding: 0.75rem;
  }
  
  .login-card {
    padding: 1.5rem;
  }
  
  .modal-overlay {
    padding: 1rem;
  }
  
  .modal-header {
    padding: 1.5rem 1.5rem 0;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .test-accounts-section {
    margin-top: 1rem;
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
  color: var(--text-medium);
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: var(--border-radius-sm);
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
  color: var(--text-dark);
  font-size: 0.95rem;
  font-weight: 600;
}

.test-accounts-note {
  margin: 0 0 1rem 0;
  color: var(--text-medium);
  font-size: 0.8rem;
  text-align: center;
  background: #f8fafc;
  padding: 0.5rem;
  border-radius: var(--border-radius-sm);
}

.test-account-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.test-account-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius-sm);
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
  border-color: var(--primary-color);
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
  color: var(--text-dark);
  font-weight: 500;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.account-description {
  color: var(--text-medium);
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
