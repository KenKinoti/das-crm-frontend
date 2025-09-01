<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Settings</h1>
      <button @click="saveAllSettings" class="btn btn-primary" :disabled="isSaving">
        <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
        <i v-else class="fas fa-save"></i>
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading settings...</p>
    </div>

    <div v-else class="settings-grid">
      <!-- Organization Information -->
      <div class="settings-card">
        <div class="card-header">
          <h3>
            <i class="fas fa-building"></i>
            Organization Information
          </h3>
        </div>
        <div class="card-content">
          <form @submit.prevent="saveOrganizationInfo">
            <div class="form-row">
              <div class="form-group">
                <label>Organization Name *</label>
                <input v-model="organizationForm.name" type="text" required placeholder="Enter organization name" />
              </div>
              <div class="form-group">
                <label>ABN / Registration Number</label>
                <input v-model="organizationForm.abn" type="text" placeholder="Enter ABN or registration number" />
              </div>
            </div>
            
            <div class="form-group">
              <label>Address</label>
              <textarea v-model="organizationForm.address" rows="3" placeholder="Enter full address"></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Phone</label>
                <input v-model="organizationForm.phone" type="tel" placeholder="Enter phone number" />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input v-model="organizationForm.email" type="email" placeholder="Enter email address" />
              </div>
            </div>
            
            <div class="form-group">
              <label>Website</label>
              <input v-model="organizationForm.website" type="url" placeholder="https://example.com" />
            </div>
          </form>
        </div>
      </div>

      <!-- System Preferences -->
      <div class="settings-card">
        <div class="card-header">
          <h3>
            <i class="fas fa-cog"></i>
            System Preferences
          </h3>
        </div>
        <div class="card-content">
          <div class="form-row">
            <div class="form-group">
              <label>Timezone</label>
              <select v-model="systemForm.timezone">
                <option value="Australia/Melbourne">Australia/Melbourne</option>
                <option value="Australia/Sydney">Australia/Sydney</option>
                <option value="Australia/Brisbane">Australia/Brisbane</option>
                <option value="Australia/Perth">Australia/Perth</option>
                <option value="Australia/Adelaide">Australia/Adelaide</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div class="form-group">
              <label>Currency</label>
              <select v-model="systemForm.currency">
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Date Format</label>
              <select v-model="systemForm.date_format">
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
              </select>
            </div>
            <div class="form-group">
              <label>Time Format</label>
              <select v-model="systemForm.time_format">
                <option value="24h">24 Hour (14:30)</option>
                <option value="12h">12 Hour (2:30 PM)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="settings-card">
        <div class="card-header">
          <h3>
            <i class="fas fa-bell"></i>
            Notification Settings
          </h3>
        </div>
        <div class="card-content">
          <div class="notification-settings">
            <div class="setting-item">
              <div class="setting-info">
                <strong>Email Notifications</strong>
                <p>Receive notifications via email for important updates</p>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input v-model="notificationForm.email_enabled" type="checkbox" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <strong>SMS Notifications</strong>
                <p>Receive urgent notifications via SMS</p>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input v-model="notificationForm.sms_enabled" type="checkbox" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <strong>Push Notifications</strong>
                <p>Receive push notifications in your browser</p>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input v-model="notificationForm.push_enabled" type="checkbox" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Billing Settings -->
      <div class="settings-card">
        <div class="card-header">
          <h3>
            <i class="fas fa-file-invoice-dollar"></i>
            Billing Settings
          </h3>
        </div>
        <div class="card-content">
          <div class="form-row">
            <div class="form-group">
              <label>Default Tax Rate (%)</label>
              <input v-model="billingForm.tax_rate" type="number" step="0.01" min="0" max="100" placeholder="10.00" />
            </div>
            <div class="form-group">
              <label>Payment Terms (Days)</label>
              <input v-model="billingForm.payment_terms_days" type="number" min="1" max="365" placeholder="30" />
            </div>
          </div>
          
          <div class="form-group">
            <label>Late Fee Percentage (%)</label>
            <input v-model="billingForm.late_fee_percentage" type="number" step="0.01" min="0" max="50" placeholder="5.00" />
            <small class="form-help">Percentage charged on overdue invoices</small>
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="settings-card">
        <div class="card-header">
          <h3>
            <i class="fas fa-shield-alt"></i>
            Security Settings
          </h3>
        </div>
        <div class="card-content">
          <div class="form-row">
            <div class="form-group">
              <label>Session Timeout (minutes)</label>
              <input v-model="securityForm.session_timeout" type="number" min="5" max="480" placeholder="30" />
            </div>
            <div class="form-group">
              <label>Minimum Password Length</label>
              <input v-model="securityForm.password_min_length" type="number" min="4" max="32" placeholder="8" />
            </div>
          </div>
          
          <div class="security-settings">
            <div class="setting-item">
              <div class="setting-info">
                <strong>Require Two-Factor Authentication</strong>
                <p>All users must enable 2FA to access the system</p>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input v-model="securityForm.require_2fa" type="checkbox" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <strong>Auto-logout Inactive Users</strong>
                <p>Automatically log out users after the session timeout period</p>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input v-model="securityForm.auto_logout_inactive" type="checkbox" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data & Privacy -->
      <div class="settings-card">
        <div class="card-header">
          <h3>
            <i class="fas fa-database"></i>
            Data & Privacy
          </h3>
        </div>
        <div class="card-content">
          <div class="data-actions">
            <div class="action-item">
              <div class="action-info">
                <strong>Export Data</strong>
                <p>Download all your data in JSON format</p>
              </div>
              <button @click="exportData" class="btn btn-outline">
                <i class="fas fa-download"></i>
                Export
              </button>
            </div>
            
            <div class="action-item">
              <div class="action-info">
                <strong>Data Backup</strong>
                <p>Create a backup of all system data</p>
              </div>
              <button @click="createBackup" class="btn btn-outline">
                <i class="fas fa-backup"></i>
                Backup
              </button>
            </div>
            
            <div class="action-item warning">
              <div class="action-info">
                <strong>Reset System</strong>
                <p>Reset all settings to default values (irreversible)</p>
              </div>
              <button @click="resetSystem" class="btn btn-danger">
                <i class="fas fa-undo"></i>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>


      <!-- System Information -->
      <div class="settings-card">
        <div class="card-header">
          <h3>
            <i class="fas fa-info-circle"></i>
            System Information
          </h3>
        </div>
        <div class="card-content">
          <div class="system-info">
            <div class="info-item">
              <span class="info-label">Application Version:</span>
              <span class="info-value">1.0.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">Last Updated:</span>
              <span class="info-value">{{ formatDate(new Date()) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Database Status:</span>
              <span class="info-value status-online">
                <i class="fas fa-circle"></i> Online
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">API Status:</span>
              <span class="info-value status-online">
                <i class="fas fa-circle"></i> Online
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Total Users:</span>
              <span class="info-value">{{ systemStats.total_users || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Total Participants:</span>
              <span class="info-value">{{ systemStats.total_participants || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'pinia'
import { useOrganizationStore } from '../stores/organization'
import { useAuthStore } from '../stores/auth'
import { showErrorNotification, showSuccessNotification, showInfoModal } from '../utils/errorHandler'

export default {
  name: 'Settings',
  data() {
    return {
      isSaving: false,
      systemStats: {
        total_users: 0,
        total_participants: 0
      },
      organizationForm: {
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        abn: '',
        registration_number: ''
      },
      systemForm: {
        timezone: 'Australia/Melbourne',
        currency: 'AUD',
        date_format: 'DD/MM/YYYY',
        time_format: '24h'
      },
      notificationForm: {
        email_enabled: true,
        sms_enabled: false,
        push_enabled: true
      },
      billingForm: {
        tax_rate: 10,
        payment_terms_days: 30,
        late_fee_percentage: 5
      },
      securityForm: {
        session_timeout: 30,
        password_min_length: 8,
        require_2fa: false,
        auto_logout_inactive: true
      },
    }
  },
  computed: {
    ...mapState(useOrganizationStore, ['organization', 'isLoading', 'error']),
    ...mapState(useAuthStore, ['token']),
    ...mapGetters(useOrganizationStore, [
      'organizationName', 'organizationEmail', 'organizationPhone', 'organizationAddress',
      'timezone', 'currency', 'dateFormat', 'timeFormat', 'taxRate', 'paymentTerms',
      'sessionTimeout', 'passwordMinLength', 'require2FA',
      'emailNotifications', 'smsNotifications', 'pushNotifications'
    ])
  },
  async mounted() {
    await this.loadSettings()
  },
  methods: {
    ...mapActions(useOrganizationStore, [
      'fetchOrganization', 'updateOrganization', 'updateSettings', 
      'updateNotificationSettings', 'updateBillingSettings', 'updateSecuritySettings'
    ]),
    
    async loadSettings() {
      try {
        await this.fetchOrganization()
        this.populateForms()
        await this.loadSystemStats()
      } catch (error) {
        console.error('Error loading settings:', error)
        showErrorNotification(error, 'Failed to load settings. Please refresh the page.')
      }
    },
    
    populateForms() {
      // Populate organization form
      let addressString = ''
      if (this.organization.address && typeof this.organization.address === 'object') {
        // Convert address object to string
        const addr = this.organization.address
        const parts = [
          addr.street,
          addr.suburb,
          addr.state,
          addr.postcode,
          addr.country
        ].filter(part => part && part.trim())
        addressString = parts.join(', ')
      } else if (typeof this.organization.address === 'string') {
        addressString = this.organization.address
      }
      
      this.organizationForm = {
        name: this.organization.name || '',
        address: addressString,
        phone: this.organization.phone || '',
        email: this.organization.email || '',
        website: this.organization.website || '',
        abn: this.organization.abn || '',
        registration_number: this.organization.registration_number || ''
      }
      
      // Populate system form
      const settings = this.organization.settings || {}
      this.systemForm = {
        timezone: settings.timezone || 'Australia/Melbourne',
        currency: settings.currency || 'AUD',
        date_format: settings.date_format || 'DD/MM/YYYY',
        time_format: settings.time_format || '24h'
      }
      
      // Populate notification form
      const notifications = settings.notifications || {}
      this.notificationForm = {
        email_enabled: notifications.email_enabled !== false,
        sms_enabled: notifications.sms_enabled || false,
        push_enabled: notifications.push_enabled !== false
      }
      
      // Populate billing form
      const billing = settings.billing || {}
      this.billingForm = {
        tax_rate: billing.tax_rate || 10,
        payment_terms_days: billing.payment_terms_days || 30,
        late_fee_percentage: billing.late_fee_percentage || 5
      }
      
      // Populate security form
      const security = settings.security || {}
      this.securityForm = {
        session_timeout: security.session_timeout || 30,
        password_min_length: security.password_min_length || 8,
        require_2fa: security.require_2fa || false,
        auto_logout_inactive: security.auto_logout_inactive !== false
      }
    },
    
    async loadSystemStats() {
      // This would typically come from an API endpoint
      this.systemStats = {
        total_users: 5,
        total_participants: 12
      }
    },
    
    async saveAllSettings() {
      if (!this.validateSettingsForm()) {
        return
      }
      
      this.isSaving = true
      try {
        // Validate and prepare organization data
        const organizationData = {
          ...this.organizationForm,
          name: this.organizationForm.name.trim(),
          email: this.organizationForm.email.trim(),
          phone: this.organizationForm.phone.trim(),
          address: (this.organizationForm.address || '').toString().trim(),
          website: this.organizationForm.website.trim(),
          abn: this.organizationForm.abn.trim(),
          settings: {
            ...this.systemForm,
            notifications: this.notificationForm,
            billing: this.billingForm,
            security: this.securityForm
          }
        }
        
        console.log('Saving settings with data:', organizationData)
        await this.updateOrganization(organizationData)
        showSuccessNotification('Settings saved successfully!')
        
      } catch (error) {
        console.error('Error saving settings:', error)
        showErrorNotification(error, 'Error saving settings. Please try again.')
      } finally {
        this.isSaving = false
      }
    },

    validateSettingsForm() {
      if (!this.organizationForm.name || !this.organizationForm.name.trim()) {
        showErrorNotification(new Error('Organization name is required'))
        return false
      }
      if (this.organizationForm.email && !this.isValidEmail(this.organizationForm.email)) {
        showErrorNotification(new Error('Please enter a valid email address'))
        return false
      }
      if (this.organizationForm.website && !this.isValidUrl(this.organizationForm.website)) {
        showErrorNotification(new Error('Please enter a valid website URL'))
        return false
      }
      if (this.billingForm.tax_rate < 0 || this.billingForm.tax_rate > 100) {
        showErrorNotification(new Error('Tax rate must be between 0 and 100'))
        return false
      }
      if (this.billingForm.payment_terms_days < 1 || this.billingForm.payment_terms_days > 365) {
        showErrorNotification(new Error('Payment terms must be between 1 and 365 days'))
        return false
      }
      if (this.securityForm.session_timeout < 5 || this.securityForm.session_timeout > 480) {
        showErrorNotification(new Error('Session timeout must be between 5 and 480 minutes'))
        return false
      }
      return true
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email.trim())
    },

    isValidUrl(url) {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    },
    
    async saveOrganizationInfo() {
      try {
        await this.updateOrganization(this.organizationForm)
        showSuccessNotification('Organization information updated!')
      } catch (error) {
        console.error('Error saving organization info:', error)
        showErrorNotification(error, 'Error saving organization information.')
      }
    },
    
    exportData() {
      showInfoModal('Export data functionality will be available soon! This feature will allow you to export your organization data in various formats.', 'Export Data')
    },
    
    createBackup() {
      showInfoModal('Create backup functionality will be available soon! This feature will allow you to create secure backups of your data.', 'Create Backup')
    },
    
    resetSystem() {
      if (confirm('Are you sure you want to reset all settings? This action cannot be undone.')) {
        showInfoModal('Reset system functionality will be available soon! This feature will allow you to reset all settings to default values.', 'Reset System')
      }
},
    
    formatDate(date) {
      return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

[data-theme="dark"] .page-header {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-header h1::before {
  content: '\f013';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  color: #3b82f6;
  font-size: 1.5rem;
}

[data-theme="dark"] .page-header h1 {
  color: #f3f4f6;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #374151;
}

[data-theme="dark"] .loading-state {
  color: #e5e7eb;
}

.loading-spinner {
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin: 0 auto 1rem;
}

[data-theme="dark"] .loading-spinner {
  border: 4px solid #374151;
  border-top: 4px solid #3b82f6;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 2rem;
}

.settings-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.settings-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

[data-theme="dark"] .settings-card {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .settings-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

[data-theme="dark"] .card-header {
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
  background: rgba(31, 41, 55, 0.8);
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

[data-theme="dark"] .card-header h3 {
  color: #f3f4f6;
}

.card-header i {
  color: #3b82f6;
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
  color: #374151;
}

[data-theme="dark"] .form-group label {
  color: #e5e7eb;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-size: 1rem;
  color: #374151;
}

[data-theme="dark"] .form-group input,
[data-theme="dark"] .form-group select,
[data-theme="dark"] .form-group textarea {
  border: 2px solid rgba(75, 85, 99, 0.6);
  background: rgba(31, 41, 55, 0.8);
  color: #e5e7eb;
}

[data-theme="dark"] .form-group input::placeholder,
[data-theme="dark"] .form-group textarea::placeholder {
  color: #9ca3af;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

[data-theme="dark"] .form-group input:focus,
[data-theme="dark"] .form-group select:focus,
[data-theme="dark"] .form-group textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-help {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #6b7280;
}

[data-theme="dark"] .form-help {
  color: #9ca3af;
}

.notification-settings > *,
.security-settings > * {
  margin-bottom: 1rem;
}

.notification-settings > *:last-child,
.security-settings > *:last-child {
  margin-bottom: 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.3);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.setting-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

[data-theme="dark"] .setting-item {
  border: 1px solid rgba(75, 85, 99, 0.3);
  background: rgba(31, 41, 55, 0.5);
}

[data-theme="dark"] .setting-item:hover {
  background: rgba(31, 41, 55, 0.8);
}

.setting-info {
  flex: 1;
}

.setting-info strong {
  display: block;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

[data-theme="dark"] .setting-info strong {
  color: #f3f4f6;
}

.setting-info p {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

[data-theme="dark"] .setting-info p {
  color: #9ca3af;
}

.setting-control {
  flex-shrink: 0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.data-actions > * {
  margin-bottom: 1rem;
}

.data-actions > *:last-child {
  margin-bottom: 0;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius-sm);
  margin-bottom: 1rem;
}

.action-item.warning {
  border-color: #fbbf24;
  background: #fffbeb;
}

.action-info {
  flex: 1;
}

.action-info strong {
  display: block;
  color: var(--text-dark);
  margin-bottom: 0.25rem;
}

.action-info p {
  font-size: 0.9rem;
  color: var(--text-medium);
  margin: 0;
}

.system-info > * {
  margin-bottom: 0.75rem;
}

.system-info > *:last-child {
  margin-bottom: 0;
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

.info-value.status-online {
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-value.status-online i {
  font-size: 0.8rem;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-size: 14px;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: 2px solid transparent;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid rgba(226, 232, 240, 0.6);
  color: #6b7280;
}

[data-theme="dark"] .btn-outline {
  background: rgba(31, 41, 55, 0.8);
  border: 2px solid rgba(75, 85, 99, 0.6);
  color: #9ca3af;
}

.btn-outline:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

[data-theme="dark"] .btn-outline:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.2);
}

.btn-danger {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: 2px solid transparent;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}


/* Success and Error notifications */
:global(.success-notification) {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

:global(.error-notification) {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #dc2626;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .setting-item,
  .action-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    text-align: center;
  }

  .info-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>