/**
 * Enhanced error handling utility for better user feedback
 */

export function parseApiError(error) {
  console.error('API Error:', error)
  
  // Default error message
  let message = 'An unexpected error occurred. Please try again.'
  let details = []
  let statusCode = null

  if (error.response) {
    statusCode = error.response.status
    const errorData = error.response.data

    // Handle different error response structures
    if (errorData) {
      // Check for various error message formats
      if (errorData.message) {
        message = errorData.message
      } else if (errorData.error && errorData.error.message) {
        message = errorData.error.message
      } else if (errorData.errors && Array.isArray(errorData.errors)) {
        message = 'Please fix the following issues:'
        details = errorData.errors.map(err => {
          if (typeof err === 'string') return err
          if (err.message) return err.message
          if (err.field && err.message) return `${err.field}: ${err.message}`
          return JSON.stringify(err)
        })
      } else if (errorData.details) {
        details = Array.isArray(errorData.details) ? errorData.details : [errorData.details]
      }

      // Handle validation errors specifically
      if (statusCode === 400) {
        if (errorData.validation_errors) {
          message = 'Validation failed:'
          details = Object.entries(errorData.validation_errors).map(([field, errors]) => {
            const errorList = Array.isArray(errors) ? errors : [errors]
            return `${field}: ${errorList.join(', ')}`
          })
        } else if (errorData.required_fields) {
          message = 'Missing required fields:'
          details = errorData.required_fields.map(field => `${field} is required`)
        }
      }

      // Handle authentication errors
      if (statusCode === 401) {
        message = 'Authentication failed. Please log in again.'
      }

      // Handle authorization errors
      if (statusCode === 403) {
        message = 'You do not have permission to perform this action.'
      }

      // Handle not found errors
      if (statusCode === 404) {
        message = 'The requested resource was not found.'
      }

      // Handle server errors
      if (statusCode >= 500) {
        message = 'Server error occurred. Please try again later.'
      }
    }
  } else if (error.request) {
    message = 'Network error. Please check your connection and try again.'
  } else if (error.message) {
    message = error.message
  }

  return {
    message,
    details,
    statusCode,
    fullError: error
  }
}

export function formatErrorMessage(error) {
  const parsedError = parseApiError(error)
  
  let formattedMessage = parsedError.message

  if (parsedError.details && parsedError.details.length > 0) {
    formattedMessage += '\n\nDetails:\n' + parsedError.details.map(detail => `• ${detail}`).join('\n')
  }

  if (process.env.NODE_ENV === 'development' && parsedError.statusCode) {
    formattedMessage += `\n\nStatus Code: ${parsedError.statusCode}`
  }

  return formattedMessage
}

export function showErrorNotification(error, defaultMessage = 'An error occurred') {
  const errorMessage = formatErrorMessage(error)
  
  // Clear any existing error notifications first
  const existingErrors = document.querySelectorAll('.error-notification')
  existingErrors.forEach(notification => notification.remove())
  
  // Create notification element
  const notification = document.createElement('div')
  notification.className = 'error-notification detailed-error'
  notification.innerHTML = `
    <div class="error-header">
      <i class="fas fa-exclamation-circle"></i>
      <span>Error</span>
      <button class="close-error" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="error-body">
      ${errorMessage.replace(/\n/g, '<br>')}
    </div>
  `
  
  document.body.appendChild(notification)
  
  // Auto-remove after 8 seconds (longer for detailed errors)
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove()
    }
  }, 8000)

  return errorMessage
}

export function showSuccessNotification(message) {
  // Clear any existing success notifications first
  const existingSuccess = document.querySelectorAll('.success-notification')
  existingSuccess.forEach(notification => notification.remove())
  
  const notification = document.createElement('div')
  notification.className = 'success-notification'
  notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`
  document.body.appendChild(notification)
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove()
    }
  }, 3000)
}

// Modal notification system with color-coded headers
export function showModal(message, type = 'info', title = null, actions = null) {
  // Clear any existing modals
  const existingModals = document.querySelectorAll('.notification-modal-overlay')
  existingModals.forEach(modal => modal.remove())
  
  const typeConfig = {
    info: { color: 'white', icon: 'fas fa-info-circle', title: title || 'Information' },
    view: { color: 'white', icon: 'fas fa-eye', title: title || 'Details' },
    edit: { color: 'blue', icon: 'fas fa-edit', title: title || 'Edit' },
    delete: { color: 'red', icon: 'fas fa-trash', title: title || 'Delete' },
    shift: { color: 'green', icon: 'fas fa-calendar', title: title || 'Shift' },
    success: { color: 'green', icon: 'fas fa-check-circle', title: title || 'Success' },
    error: { color: 'red', icon: 'fas fa-exclamation-circle', title: title || 'Error' }
  }
  
  const config = typeConfig[type] || typeConfig.info
  
  // Default actions for view modals - only Close and Delete
  const defaultViewActions = type === 'view' ? `
    <button class="btn btn-view" onclick="this.closest('.notification-modal-overlay').remove()">
      <i class="fas fa-times"></i>
      Close
    </button>
  ` : `
    <button class="btn btn-primary" onclick="this.closest('.notification-modal-overlay').remove()">
      OK
    </button>
  `
  
  const actionsHTML = actions || defaultViewActions
  
  const modal = document.createElement('div')
  modal.className = 'notification-modal-overlay'
  modal.innerHTML = `
    <div class="notification-modal-content">
      <div class="notification-modal-header ${config.color}">
        <i class="${config.icon}"></i>
        <h3>${config.title}</h3>
        <button class="notification-modal-close" onclick="this.closest('.notification-modal-overlay').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="notification-modal-body">
        <p>${message.replace(/\n/g, '<br>')}</p>
      </div>
      <div class="notification-modal-actions">
        ${actionsHTML}
      </div>
    </div>
  `
  
  document.body.appendChild(modal)
  
  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove()
    }
  })
  
  // Close on escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove()
      document.removeEventListener('keydown', handleEscape)
    }
  }
  document.addEventListener('keydown', handleEscape)
}

// Convenience functions for different modal types
export function showInfoModal(message, title = null) {
  showModal(message, 'info', title)
}

export function showViewModal(message, title = null) {
  showModal(message, 'view', title)
}

export function showEditModal(message, title = null) {
  showModal(message, 'edit', title)
}

export function showDeleteModal(message, title = null) {
  showModal(message, 'delete', title)
}

export function showShiftModal(message, title = null) {
  showModal(message, 'shift', title)
}

export function showSuccessModal(message, title = null) {
  showModal(message, 'success', title)
}

export function showErrorModal(message, title = null) {
  showModal(message, 'error', title)
}