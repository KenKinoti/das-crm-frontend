<template>
  <div v-if="show" class="modal-overlay" @click.self="handleOverlayClick">
    <div class="modal-container" :class="modalClass">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="modal-icon">
          <i :class="iconClass"></i>
        </div>
        <h3 class="modal-title">{{ title }}</h3>
        <button v-if="showCloseButton" @click="close" class="close-button">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Modal Body -->
      <div class="modal-body">
        <p v-if="message" class="modal-message">{{ message }}</p>
        <slot></slot>
      </div>
      
      <!-- Modal Footer -->
      <div class="modal-footer">
        <button 
          v-if="type === 'confirm'" 
          @click="cancel" 
          class="btn btn-secondary"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="confirm" 
          class="btn"
          :class="confirmButtonClass"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalNotification',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'info', // info, success, warning, error, confirm
      validator: value => ['info', 'success', 'warning', 'error', 'confirm'].includes(value)
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      default: ''
    },
    confirmText: {
      type: String,
      default: 'OK'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    showCloseButton: {
      type: Boolean,
      default: true
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    }
  },
  emits: ['confirm', 'cancel', 'close'],
  computed: {
    modalClass() {
      return `modal-${this.type}`
    },
    iconClass() {
      const icons = {
        info: 'fas fa-info-circle',
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-exclamation-circle',
        confirm: 'fas fa-question-circle'
      }
      return icons[this.type] || icons.info
    },
    confirmButtonClass() {
      const classes = {
        info: 'btn-primary',
        success: 'btn-success',
        warning: 'btn-warning',
        error: 'btn-danger',
        confirm: 'btn-primary'
      }
      return classes[this.type] || classes.info
    }
  },
  methods: {
    confirm() {
      this.$emit('confirm')
    },
    cancel() {
      this.$emit('cancel')
    },
    close() {
      this.$emit('close')
    },
    handleOverlayClick() {
      if (this.closeOnOverlay) {
        this.close()
      }
    },
    
    handleEscape(e) {
      if (e.key === 'Escape' && this.show) {
        if (this.type === 'confirm') {
          this.cancel()
        } else {
          this.close()
        }
      }
    }
  },
  mounted() {
    // Add escape key listener
    document.addEventListener('keydown', this.handleEscape)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscape)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

.modal-container {
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-info .modal-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.modal-success .modal-icon {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.modal-warning .modal-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.modal-error .modal-icon {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.modal-confirm .modal-icon {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
  flex: 1;
}

.close-button {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--text-dark);
}

.modal-body {
  padding: 1.5rem;
}

.modal-message {
  color: var(--text-medium);
  line-height: 1.6;
  margin: 0;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
}

.btn-success {
  background: #22c55e;
  color: white;
}

.btn-success:hover {
  background: #16a34a;
  transform: translateY(-1px);
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background: #d97706;
  transform: translateY(-1px);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

/* Dark mode support */
[data-theme="dark"] .modal-container {
  background: var(--gray-800);
  border: 1px solid var(--gray-700);
}

[data-theme="dark"] .modal-header {
  border-bottom-color: var(--gray-700);
}

[data-theme="dark"] .modal-footer {
  border-top-color: var(--gray-700);
}

[data-theme="dark"] .modal-title {
  color: var(--gray-100);
}

[data-theme="dark"] .modal-message {
  color: var(--gray-300);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .modal-container {
    width: 95vw;
    margin: 1rem;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>