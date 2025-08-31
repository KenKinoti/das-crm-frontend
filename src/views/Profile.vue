<template>
  <div class="page-container">
    <div class="page-header">
      <h1>My Profile</h1>
      <button @click="saveProfile" class="btn btn-primary" :disabled="isSaving">
        <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
        <i v-else class="fas fa-save"></i>
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading profile...</p>
    </div>

    <div v-else class="profile-content">
      <!-- Personal Information -->
      <div class="profile-card">
        <div class="card-header">
          <h3>
            <i class="fas fa-user"></i>
            Personal Information
          </h3>
        </div>
        <div class="card-content">
          <form @submit.prevent="saveProfile">
            <div class="form-row">
              <div class="form-group">
                <label>First Name *</label>
                <input v-model="profileForm.first_name" type="text" required placeholder="Enter first name" />
              </div>
              <div class="form-group">
                <label>Last Name *</label>
                <input v-model="profileForm.last_name" type="text" required placeholder="Enter last name" />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Email *</label>
                <input v-model="profileForm.email" type="email" required placeholder="Enter email address" />
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input v-model="profileForm.phone" type="tel" placeholder="Enter phone number" />
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="profile-card">
        <div class="card-header">
          <h3>
            <i class="fas fa-lock"></i>
            Security
          </h3>
        </div>
        <div class="card-content">
          <form @submit.prevent="changePassword">
            <div class="form-group">
              <label>Current Password</label>
              <input v-model="passwordForm.current_password" type="password" placeholder="Enter current password" />
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input v-model="passwordForm.new_password" type="password" placeholder="Enter new password" />
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input v-model="passwordForm.confirm_password" type="password" placeholder="Confirm new password" />
            </div>
            <button type="submit" class="btn btn-secondary" :disabled="isChangingPassword">
              <i v-if="isChangingPassword" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-key"></i>
              {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Account Information -->
      <div class="profile-card">
        <div class="card-header">
          <h3>
            <i class="fas fa-info-circle"></i>
            Account Information
          </h3>
        </div>
        <div class="card-content">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">User ID:</span>
              <span class="info-value">{{ user.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Role:</span>
              <span class="info-value role" :class="user.role">{{ user.role }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Organization:</span>
              <span class="info-value">{{ user.organization_id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Account Status:</span>
              <span class="info-value status" :class="{ active: user.is_active, inactive: !user.is_active }">
                <i :class="user.is_active ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                {{ user.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Last Login:</span>
              <span class="info-value">{{ formatDate(user.last_login_at) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Account Created:</span>
              <span class="info-value">{{ formatDate(user.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { showErrorNotification, showSuccessNotification } from '../utils/errorHandler'

export default {
  name: 'Profile',
  data() {
    return {
      isLoading: false,
      isSaving: false,
      isChangingPassword: false,
      profileForm: {
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
      },
      passwordForm: {
        current_password: '',
        new_password: '',
        confirm_password: ''
      }
    }
  },
  computed: {
    ...mapState(useAuthStore, ['user', 'isAuthenticated'])
  },
  async mounted() {
    await this.loadProfile()
  },
  methods: {
    ...mapActions(useAuthStore, ['updateProfile', 'changeUserPassword']),
    
    async loadProfile() {
      this.isLoading = true
      try {
        if (this.user) {
          this.profileForm = {
            first_name: this.user.first_name || '',
            last_name: this.user.last_name || '',
            email: this.user.email || '',
            phone: this.user.phone || ''
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        showErrorNotification(error, 'Failed to load profile data')
      } finally {
        this.isLoading = false
      }
    },
    
    async saveProfile() {
      if (!this.validateProfileForm()) {
        return
      }
      
      this.isSaving = true
      try {
        await this.updateProfile(this.profileForm)
        showSuccessNotification('Profile updated successfully!')
      } catch (error) {
        console.error('Error saving profile:', error)
        showErrorNotification(error, 'Failed to save profile')
      } finally {
        this.isSaving = false
      }
    },
    
    async changePassword() {
      if (!this.validatePasswordForm()) {
        return
      }
      
      this.isChangingPassword = true
      try {
        await this.changeUserPassword(this.passwordForm)
        showSuccessNotification('Password changed successfully!')
        this.resetPasswordForm()
      } catch (error) {
        console.error('Error changing password:', error)
        showErrorNotification(error, 'Failed to change password')
      } finally {
        this.isChangingPassword = false
      }
    },
    
    validateProfileForm() {
      if (!this.profileForm.first_name.trim()) {
        showErrorNotification(new Error('First name is required'))
        return false
      }
      if (!this.profileForm.last_name.trim()) {
        showErrorNotification(new Error('Last name is required'))
        return false
      }
      if (!this.profileForm.email.trim()) {
        showErrorNotification(new Error('Email is required'))
        return false
      }
      if (!this.isValidEmail(this.profileForm.email)) {
        showErrorNotification(new Error('Please enter a valid email address'))
        return false
      }
      return true
    },
    
    validatePasswordForm() {
      if (!this.passwordForm.current_password) {
        showErrorNotification(new Error('Current password is required'))
        return false
      }
      if (!this.passwordForm.new_password) {
        showErrorNotification(new Error('New password is required'))
        return false
      }
      if (this.passwordForm.new_password.length < 6) {
        showErrorNotification(new Error('New password must be at least 6 characters'))
        return false
      }
      if (this.passwordForm.new_password !== this.passwordForm.confirm_password) {
        showErrorNotification(new Error('Passwords do not match'))
        return false
      }
      return true
    },
    
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email.trim())
    },
    
    resetPasswordForm() {
      this.passwordForm = {
        current_password: '',
        new_password: '',
        confirm_password: ''
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-dark);
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin: 0 auto 1rem;
}

.profile-content {
  display: grid;
  gap: 2rem;
}

.profile-card {
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-header i {
  color: var(--primary-color);
  font-size: 1.2rem;
}

.card-content {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-dark);
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: var(--border-radius-sm);
  transition: border-color 0.3s ease;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: var(--text-medium);
}

.info-value {
  font-weight: 600;
  color: var(--text-dark);
}

.info-value.role {
  text-transform: capitalize;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.info-value.role.admin {
  background: #fef3c7;
  color: #d97706;
}

.info-value.role.manager {
  background: #e0e7ff;
  color: #4338ca;
}

.info-value.role.care_worker {
  background: #dcfce7;
  color: #166534;
}

.info-value.status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-value.status.active {
  color: #10b981;
}

.info-value.status.inactive {
  color: #ef4444;
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
  gap: 8px;
  text-decoration: none;
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

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
  transform: translateY(-1px);
}

.btn-secondary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>