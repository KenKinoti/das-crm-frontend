<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <div class="logo-icon">
            <i class="fas fa-heart-pulse"></i>
          </div>
          <span class="logo-text">AGO Pro</span>
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
          <a href="#" class="forgot-link">Forgot password?</a>
        </div>

        <button type="submit" class="login-btn" :disabled="isLoading">
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else>Sign In</span>
        </button>

        <div v-if="error" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          {{ error }}
        </div>

        <div v-if="successMessage" class="success-message">
          <i class="fas fa-check-circle"></i>
          {{ successMessage }}
        </div>
      </form>

      <div class="login-footer">
        <p>Demo Credentials:</p>
        <small>Email: kennedy@dasyin.com.au | Password: password</small>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Login',
  data() {
    return {
      form: {
        email: 'kennedy@dasyin.com.au',
        password: 'password',
        rememberMe: false
      },
      showPassword: false,
      isLoading: false,
      error: null,
      successMessage: null
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
        console.log('Login form submitted')
        
        const result = await this.authStore.login(this.form)
        console.log('Login result:', result)
        
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
  padding: 3rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-medium);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
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
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
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
  margin-bottom: 1.5rem;
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

@media (max-width: 480px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-card {
    padding: 2rem;
  }
}
</style>
