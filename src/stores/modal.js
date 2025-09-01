import { defineStore } from 'pinia'

export const useModalStore = defineStore('modal', {
  state: () => ({
    currentModal: null
  }),

  actions: {
    showModal(options) {
      return new Promise((resolve) => {
        this.currentModal = {
          ...options,
          resolve
        }
      })
    },

    closeModal(result = null) {
      if (this.currentModal && this.currentModal.resolve) {
        this.currentModal.resolve(result)
      }
      this.currentModal = null
    },

    // Convenience methods for different modal types
    async showInfo(title, message, options = {}) {
      return this.showModal({
        type: 'info',
        title,
        message,
        confirmText: 'OK',
        ...options
      })
    },

    async showSuccess(title, message, options = {}) {
      return this.showModal({
        type: 'success',
        title,
        message,
        confirmText: 'OK',
        ...options
      })
    },

    async showWarning(title, message, options = {}) {
      return this.showModal({
        type: 'warning',
        title,
        message,
        confirmText: 'OK',
        ...options
      })
    },

    async showError(title, message, options = {}) {
      return this.showModal({
        type: 'error',
        title,
        message,
        confirmText: 'OK',
        ...options
      })
    },

    async showConfirm(title, message, options = {}) {
      return this.showModal({
        type: 'confirm',
        title,
        message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        ...options
      })
    }
  }
})