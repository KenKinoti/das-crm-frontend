/**
 * Notification utilities for the AGO Vue application
 * Provides modal-based notification functions for user feedback
 */

import { useModalStore } from '../stores/modal'

/**
 * Show an informational modal dialog
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {Object} options - Additional options
 */
export async function showInfoModal(title, message, options = {}) {
  const modalStore = useModalStore()
  return await modalStore.showInfo(title, message, options)
}

/**
 * Show a success notification modal
 * @param {string} title - Success title 
 * @param {string} message - Success message
 * @param {Object} options - Additional options
 */
export async function showSuccess(title, message, options = {}) {
  const modalStore = useModalStore()
  return await modalStore.showSuccess(title, message || '', options)
}

/**
 * Show an error notification modal
 * @param {string} title - Error title
 * @param {string} message - Error message
 * @param {Object} options - Additional options
 */
export async function showError(title, message, options = {}) {
  const modalStore = useModalStore()
  return await modalStore.showError(title, message || '', options)
}

/**
 * Show a warning notification modal
 * @param {string} title - Warning title
 * @param {string} message - Warning message
 * @param {Object} options - Additional options
 */
export async function showWarning(title, message, options = {}) {
  const modalStore = useModalStore()
  return await modalStore.showWarning(title, message || '', options)
}

/**
 * Show a confirmation modal
 * @param {string} title - Confirmation title
 * @param {string} message - Confirmation message
 * @param {Object} options - Additional options
 */
export async function showConfirm(title, message, options = {}) {
  const modalStore = useModalStore()
  const result = await modalStore.showConfirm(title, message, options)
  return result === true // Convert to boolean for backward compatibility
}

// Legacy compatibility functions
export function showErrorNotification(error, message) {
  if (typeof error === 'string' && !message) {
    return showError('Error', error)
  }
  return showError('Error', message || error?.message || 'An error occurred')
}

export function showSuccessNotification(title, message) {
  if (typeof title === 'string' && !message) {
    return showSuccess('Success', title)
  }
  return showSuccess(title, message || '')
}