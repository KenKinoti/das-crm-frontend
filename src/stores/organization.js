import { defineStore } from 'pinia'
import { organizationService } from '../services/organization'

export const useOrganizationStore = defineStore('organization', {
  state: () => ({
    organization: {
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      abn: '',
      registration_number: '',
      logo_url: '',
      settings: {
        timezone: 'Australia/Melbourne',
        currency: 'AUD',
        date_format: 'DD/MM/YYYY',
        time_format: '24h',
        notifications: {
          email_enabled: true,
          sms_enabled: false,
          push_enabled: true
        },
        billing: {
          tax_rate: 10,
          payment_terms_days: 30,
          late_fee_percentage: 5
        },
        security: {
          session_timeout: 30,
          password_min_length: 8,
          require_2fa: false,
          auto_logout_inactive: true
        }
      }
    },
    isLoading: false,
    error: null
  }),

  getters: {
    organizationName: (state) => state.organization.name || 'Your Organization',
    organizationEmail: (state) => state.organization.email || '',
    organizationPhone: (state) => state.organization.phone || '',
    organizationAddress: (state) => state.organization.address || '',
    
    // Settings getters
    timezone: (state) => state.organization.settings?.timezone || 'Australia/Melbourne',
    currency: (state) => state.organization.settings?.currency || 'AUD',
    dateFormat: (state) => state.organization.settings?.date_format || 'DD/MM/YYYY',
    timeFormat: (state) => state.organization.settings?.time_format || '24h',
    taxRate: (state) => state.organization.settings?.billing?.tax_rate || 10,
    paymentTerms: (state) => state.organization.settings?.billing?.payment_terms_days || 30,
    
    // Security settings
    sessionTimeout: (state) => state.organization.settings?.security?.session_timeout || 30,
    passwordMinLength: (state) => state.organization.settings?.security?.password_min_length || 8,
    require2FA: (state) => state.organization.settings?.security?.require_2fa || false,
    
    // Notification settings
    emailNotifications: (state) => state.organization.settings?.notifications?.email_enabled || true,
    smsNotifications: (state) => state.organization.settings?.notifications?.sms_enabled || false,
    pushNotifications: (state) => state.organization.settings?.notifications?.push_enabled || true
  },

  actions: {
    async fetchOrganization() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await organizationService.get()
        this.organization = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch organization data'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateOrganization(organizationData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await organizationService.update(organizationData)
        this.organization = response.data
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update organization'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateSettings(settings) {
      const updatedOrganization = {
        ...this.organization,
        settings: {
          ...this.organization.settings,
          ...settings
        }
      }
      return await this.updateOrganization(updatedOrganization)
    },

    async updateNotificationSettings(notificationSettings) {
      const updatedSettings = {
        ...this.organization.settings,
        notifications: {
          ...this.organization.settings.notifications,
          ...notificationSettings
        }
      }
      return await this.updateSettings(updatedSettings)
    },

    async updateBillingSettings(billingSettings) {
      const updatedSettings = {
        ...this.organization.settings,
        billing: {
          ...this.organization.settings.billing,
          ...billingSettings
        }
      }
      return await this.updateSettings(updatedSettings)
    },

    async updateSecuritySettings(securitySettings) {
      const updatedSettings = {
        ...this.organization.settings,
        security: {
          ...this.organization.settings.security,
          ...securitySettings
        }
      }
      return await this.updateSettings(updatedSettings)
    }
  }
})