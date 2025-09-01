/**
 * Notification utilities for the AGO Vue application
 * Provides simple notification functions for user feedback
 */

/**
 * Show an informational modal dialog
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {Object} options - Additional options
 */
export function showInfoModal(title, message, options = {}) {
  // For now, use a simple alert - can be enhanced with proper modal later
  if (typeof title === 'string' && typeof message === 'string') {
    alert(`${title}\n\n${message}`)
  } else if (typeof title === 'string') {
    alert(title)
  }
}

/**
 * Show a success notification
 * @param {string} message - Success message
 */
export function showSuccess(message) {
  console.log('Success:', message)
  // Can be enhanced with toast notifications later
}

/**
 * Show an error notification
 * @param {string} message - Error message
 */
export function showError(message) {
  console.error('Error:', message)
  alert(`Error: ${message}`)
}

/**
 * Show a warning notification
 * @param {string} message - Warning message
 */
export function showWarning(message) {
  console.warn('Warning:', message)
  alert(`Warning: ${message}`)
}