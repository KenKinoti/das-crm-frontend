<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <div class="logo-icon">
            <i class="fas fa-heart-pulse"></i>
          </div>
          <span class="logo-text">DASYIN PRO</span>
        </div>
        <h2>Welcome Back</h2>
        <p>Sign in to your account to continue</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email Address</label>
          <div class="input-wrapper">
            <i class="fas fa-envelope input-icon"></i>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="Enter your email"
              required
              :disabled="isLoading"
              autocomplete="email"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <i class="fas fa-lock input-icon"></i>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              required
              :disabled="isLoading"
              autocomplete="current-password"
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
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="form.rememberMe" :disabled="isLoading">
            <span class="checkmark"></span>
            Remember me
          </label>
          <a href="#" class="forgot-link" @click.prevent="showForgotPassword">Forgot password?</a>
        </div>

        <button type="submit" class="login-btn" :disabled="isLoading">
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else>Sign In</span>
        </button>

        <div class="divider">
          <span>Or continue with</span>
        </div>

        <div class="social-login">
          <button type="button" @click="loginWithGoogle" class="social-btn google-btn" :disabled="isLoading">
            <i class="fab fa-google"></i>
            Google
          </button>
          <button type="button" @click="loginWithMicrosoft" class="social-btn microsoft-btn" :disabled="isLoading">
            <i class="fab fa-microsoft"></i>
            Microsoft
          </button>
        </div>

        <div v-if="error" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          {{ error }}
        </div>

        <div v-if="successMessage" class="success-message">
          <i class="fas fa-check-circle"></i>
          {{ successMessage }}
        </div>
      </form>

      <!-- Test Accounts Section -->
      <div class="test-accounts-section">
        <button @click="showTestAccounts = !showTestAccounts" class="test-accounts-toggle">
          <i :class="showTestAccounts ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          {{ showTestAccounts ? 'Hide' : 'Show' }} Test Accounts
        </button>
        
        <div v-if="showTestAccounts" class="test-accounts-list">
          <h4>Available Test Accounts</h4>
          <p class="test-accounts-note">All accounts use password: <strong>Test123!@#</strong></p>
          
          <div class="test-account-cards">
            <div class="test-account-card" @click="fillLoginForm('kennedy@dasyin.com.au')">
              <div class="account-role super-admin">Super Admin</div>
              <div class="account-email">kennedy@dasyin.com.au</div>
              <div class="account-description">Full system access</div>
            </div>
            
            <div class="test-account-card" @click="fillLoginForm('Sarah.Smith75@test.com')">
              <div class="account-role admin">Admin</div>
              <div class="account-email">Sarah.Smith75@test.com</div>
              <div class="account-description">Organization management</div>
            </div>
            
            <div class="test-account-card" @click="fillLoginForm('William.White84@test.com')">
              <div class="account-role manager">Manager</div>
              <div class="account-email">William.White84@test.com</div>
              <div class="account-description">Staff & schedule management</div>
            </div>
            
            <div class="test-account-card" @click="fillLoginForm('Emma.Miller23@test.com')">
              <div class="account-role coordinator">Support Coordinator</div>
              <div class="account-email">Emma.Miller23@test.com</div>
              <div class="account-description">Participant care plans</div>
            </div>
            
            <div class="test-account-card" @click="fillLoginForm('James.Jones32@test.com')">
              <div class="account-role care-worker">Care Worker</div>
              <div class="account-email">James.Jones32@test.com</div>
              <div class="account-description">Basic shift access</div>
            </div>
            
            <div class="test-account-card" @click="fillLoginForm('Emma.Jones59@test.com')">
              <div class="account-role admin">Admin (Org 2)</div>
              <div class="account-email">Emma.Jones59@test.com</div>
              <div class="account-description">Different organization</div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Forgot Password Modal -->
    <div v-if="showForgotPasswordModal" class="modal-overlay" @click="closeForgotPassword">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Reset Password</h3>
          <button @click="closeForgotPassword" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Enter your email address and we'll send you a link to reset your password.</p>
          <form @submit.prevent="handlePasswordReset">
            <div class="form-group">
              <label for="reset-email">Email Address</label>
              <div class="input-wrapper">
                <i class="fas fa-envelope input-icon"></i>
                <input
                  id="reset-email"
                  v-model="resetForm.email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  :disabled="isResetting"
                  autocomplete="email"
                />
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeForgotPassword" class="btn btn-cancel" :disabled="isResetting">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isResetting">
                <span v-if="isResetting" class="loading-spinner"></span>
                <span v-else>Send Reset Link</span>
              </button>
            </div>
          </form>
          <div v-if="resetError" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ resetError }}
          </div>
          <div v-if="resetSuccess" class="success-message">
            <i class="fas fa-check-circle"></i>
            {{ resetSuccess }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { showInfoModal } from '../utils/errorHandler'

export default {
  name: 'Login',
  data() {
    return {
      form: {
        email: 'kennedy@dasyin.com.au',
        password: 'Test123!@#',
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
  computed: {
    authStore() {
      return useAuthStore()
    }
  },
  methods: {
    async handleLogin() {
      this.isLoading = true
      this.error = null
      this.successMessage = null

      try {
        console.log('Login form submitted with credentials:', { email: this.form.email })
        
        const result = await this.authStore.login(this.form)
        console.log('Login result:', result)
        console.log('Auth store state after login:', {
          token: this.authStore.token,
          user: this.authStore.user,
          isAuthenticated: this.authStore.isAuthenticated
        })
        
        this.successMessage = 'Login successful! Redirecting...'
        
        // Small delay to show success message
        setTimeout(() => {
          const redirectTo = this.$route.query.redirect || '/dashboard'
          console.log('Redirecting to:', redirectTo)
          this.$router.push(redirectTo)
        }, 1000)
        
      } catch (error) {
        console.error('Login error:', error)
        this.error = this.authStore.error || error.message || 'Login failed. Please try again.'
      } finally {
        this.isLoading = false
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
      this.form.password = 'Test123!@#'
      this.error = null
      this.successMessage = null
    }
  },
  
  mounted() {
    console.log('Login component mounted')
    // If already authenticated, redirect to dashboard
    if (this.authStore.isAuthenticated) {
      console.log('Already authenticated, redirecting...')
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
