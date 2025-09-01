<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo & Title -->
      <div class="text-center">
        <div class="mx-auto h-12 w-12 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4">
          <UserGroupIcon class="h-6 w-6 text-white" />
        </div>
        <h2 class="text-3xl font-bold text-gradient mb-2">AGO CRM</h2>
        <p class="text-secondary-600">Healthcare Management System</p>
      </div>

      <!-- Login Form -->
      <div class="card animate-fade-in">
        <div class="card-body">
          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- Email Field -->
            <div>
              <label for="email" class="form-label flex items-center gap-2">
                <EnvelopeIcon class="h-4 w-4 text-secondary-400" />
                Email address
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                :disabled="isLoading"
                class="form-input"
                placeholder="Enter your email"
              />
            </div>

            <!-- Password Field -->
            <div>
              <label for="password" class="form-label flex items-center gap-2">
                <LockClosedIcon class="h-4 w-4 text-secondary-400" />
                Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  :disabled="isLoading"
                  class="form-input pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-400 hover:text-secondary-600"
                  :disabled="isLoading"
                >
                  <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                  <EyeSlashIcon v-else class="h-5 w-5" />
                </button>
              </div>
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input
                  v-model="form.rememberMe"
                  type="checkbox"
                  :disabled="isLoading"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <span class="ml-2 text-sm text-secondary-600">Remember me</span>
              </label>
              <button
                type="button"
                @click="showForgotPassword = true"
                class="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isLoading"
              class="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              <ArrowRightOnRectangleIcon v-if="!isLoading" class="h-5 w-5" />
              <div v-else class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              {{ isLoading ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>

          <!-- Success Message -->
          <div v-if="successMessage" class="alert alert-success mt-4 animate-slide-up">
            <CheckCircleIcon class="h-5 w-5 mr-2" />
            {{ successMessage }}
          </div>

          <!-- Error Message -->
          <div v-if="error" class="alert alert-danger mt-4 animate-slide-up">
            <ExclamationCircleIcon class="h-5 w-5 mr-2" />
            {{ error }}
          </div>

          <!-- Test Accounts -->
          <div class="mt-8 pt-6 border-t border-secondary-200">
            <button
              @click="showTestAccounts = !showTestAccounts"
              class="btn btn-secondary w-full mb-4 flex items-center justify-center gap-2"
            >
              <BeakerIcon class="h-4 w-4" />
              {{ showTestAccounts ? 'Hide' : 'Show' }} Demo Accounts
              <ChevronDownIcon 
                :class="['h-4 w-4 transition-transform', showTestAccounts ? 'rotate-180' : '']" 
              />
            </button>

            <!-- Collapsible Test Accounts -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div v-if="showTestAccounts" class="space-y-3">
                <p class="text-sm text-secondary-600 text-center mb-4">Click any account to auto-fill credentials</p>
                
                <!-- Test Account Cards -->
                <div class="grid gap-2">
                  <div
                    v-for="account in testAccounts"
                    :key="account.email"
                    @click="fillLoginForm(account.email)"
                    class="flex items-center gap-3 p-3 bg-secondary-50 hover:bg-secondary-100 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div :class="[
                      'p-2 rounded-lg',
                      account.role === 'Super Admin' ? 'bg-gradient-to-r from-purple-500 to-purple-700' :
                      account.role === 'Admin' ? 'bg-gradient-to-r from-primary-500 to-primary-700' :
                      account.role === 'Manager' ? 'bg-gradient-to-r from-success-500 to-success-700' :
                      account.role === 'Support Coordinator' ? 'bg-gradient-to-r from-warning-500 to-warning-600' :
                      'bg-gradient-to-r from-secondary-500 to-secondary-700'
                    ]">
                      <component :is="getAccountIcon(account.icon)" class="h-4 w-4 text-white" />
                    </div>
                    <div class="flex-1">
                      <div class="font-medium text-secondary-900 group-hover:text-primary-600 transition-colors">
                        {{ account.role }}
                      </div>
                      <div class="text-sm text-secondary-600">{{ account.email }}</div>
                    </div>
                    <ArrowRightIcon class="h-4 w-4 text-secondary-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <TransitionRoot appear :show="showForgotPassword" as="template">
      <Dialog as="div" class="relative z-50" @close="showForgotPassword = false">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="modal-overlay" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="modal-panel w-full max-w-md">
                <div class="card-body">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="p-2 bg-primary-100 rounded-lg">
                      <LockClosedIcon class="h-5 w-5 text-primary-600" />
                    </div>
                    <DialogTitle class="text-lg font-semibold text-secondary-900">
                      Reset Password
                    </DialogTitle>
                  </div>
                  
                  <p class="text-secondary-600 mb-6">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  
                  <form @submit.prevent="handlePasswordReset" class="space-y-4">
                    <div>
                      <label for="reset-email" class="form-label">Email address</label>
                      <input
                        id="reset-email"
                        v-model="resetForm.email"
                        type="email"
                        required
                        :disabled="isResetting"
                        class="form-input"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div v-if="resetError" class="alert alert-danger">
                      {{ resetError }}
                    </div>
                    
                    <div v-if="resetSuccess" class="alert alert-success">
                      {{ resetSuccess }}
                    </div>
                    
                    <div class="flex gap-3 pt-4">
                      <button
                        type="button"
                        @click="showForgotPassword = false"
                        class="btn btn-secondary flex-1"
                        :disabled="isResetting"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        :disabled="isResetting"
                        class="btn btn-primary flex-1"
                      >
                        {{ isResetting ? 'Sending...' : 'Send Reset Link' }}
                      </button>
                    </div>
                  </form>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script>
import { 
  UserGroupIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon,
  ArrowRightOnRectangleIcon, CheckCircleIcon, ExclamationCircleIcon,
  BeakerIcon, ChevronDownIcon, ArrowRightIcon, ShieldCheckIcon,
  UserIcon, CogIcon, HeartIcon, WrenchScrewdriverIcon
} from '@heroicons/vue/24/outline'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { useAuthStore } from '../stores/auth'
import { showInfoModal } from '../utils/notifications'

export default {
  name: 'LoginModern',
  components: {
    UserGroupIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon,
    ArrowRightOnRectangleIcon, CheckCircleIcon, ExclamationCircleIcon,
    BeakerIcon, ChevronDownIcon, ArrowRightIcon, ShieldCheckIcon,
    UserIcon, CogIcon, HeartIcon, WrenchScrewdriverIcon,
    Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild
  },
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
      showForgotPassword: false,
      showTestAccounts: false,
      resetForm: {
        email: ''
      },
      isResetting: false,
      resetError: null,
      resetSuccess: null,
      testAccounts: [
        {
          email: 'admin@dasyin.com.au',
          role: 'Super Admin',
          icon: 'ShieldCheckIcon'
        },
        {
          email: 'kennedy@dasyin.com.au', 
          role: 'Admin',
          icon: 'UserIcon'
        },
        {
          email: 'manager@dasyin.com.au',
          role: 'Manager', 
          icon: 'CogIcon'
        },
        {
          email: 'coordinator@dasyin.com.au',
          role: 'Support Coordinator',
          icon: 'HeartIcon'
        },
        {
          email: 'careworker@dasyin.com.au',
          role: 'Care Worker',
          icon: 'WrenchScrewdriverIcon'
        }
      ]
    }
  },
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  methods: {
    async handleLogin() {
      this.isLoading = true
      this.error = null
      this.successMessage = null

      try {
        console.log('Login attempt:', { email: this.form.email })
        
        const result = await this.authStore.login(this.form)
        console.log('Login successful:', result)
        
        this.successMessage = 'Login successful! Redirecting...'
        
        // Immediate redirect
        const redirectTo = this.$route.query.redirect || '/dashboard'
        console.log('Redirecting to:', redirectTo)
        this.$router.push(redirectTo)
        
      } catch (error) {
        console.error('Login error:', error)
        this.error = this.authStore.error || error.message || 'Login failed. Please try again.'
      } finally {
        this.isLoading = false
      }
    },

    async handlePasswordReset() {
      this.isResetting = true
      this.resetError = null
      this.resetSuccess = null
      
      try {
        // Simulate API call for password reset
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        this.resetSuccess = 'Password reset instructions have been sent to your email.'
        
        // Clear form and close modal after delay
        setTimeout(() => {
          this.resetForm.email = ''
          this.resetError = null
          this.resetSuccess = null
          this.showForgotPassword = false
        }, 3000)
        
      } catch (error) {
        console.error('Password reset error:', error)
        this.resetError = 'Failed to send reset email. Please try again.'
      } finally {
        this.isResetting = false
      }
    },

    fillLoginForm(email) {
      this.form.email = email
      this.form.password = 'password'
      this.error = null
      this.successMessage = null
    },

    getAccountIcon(iconName) {
      const iconMap = {
        ShieldCheckIcon,
        UserIcon,
        CogIcon,
        HeartIcon,
        WrenchScrewdriverIcon
      }
      return iconMap[iconName] || UserIcon
    }
  },
  
  mounted() {
    console.log('Modern Login component mounted')
    // If already authenticated, redirect to dashboard
    if (this.authStore.isAuthenticated) {
      console.log('Already authenticated, redirecting...')
      this.$router.push('/dashboard')
    }
  }
}
</script>