<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-content" :class="contentClass" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="modal-title-section">
            <div class="modal-icon" :class="iconColorClass">
              <i :class="iconClass"></i>
            </div>
            <div>
              <h2 class="modal-title">{{ title }}</h2>
              <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
            </div>
          </div>
          <button @click="$emit('close')" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <slot name="body">
            <p v-if="message" v-html="formattedMessage"></p>
          </slot>
        </div>

        <!-- Modal Actions -->
        <div v-if="hasActions" class="modal-actions">
          <slot name="actions">
            <!-- Default actions based on modal type -->
            <template v-if="type === 'confirm'">
              <button type="button" @click="$emit('close')" class="btn btn-outline-secondary">
                <i class="fas fa-times"></i>
                Cancel
              </button>
              <button type="button" @click="$emit('confirm')" class="btn btn-danger">
                <i class="fas fa-check"></i>
                Confirm
              </button>
            </template>
            
            <template v-else-if="type === 'form'">
              <button type="button" @click="$emit('close')" class="btn btn-outline-secondary">
                <i class="fas fa-times"></i>
                Cancel
              </button>
              <button type="submit" :disabled="submitting" class="btn btn-primary">
                <div v-if="submitting" class="btn-loading">
                  <div class="loading-spinner"></div>
                </div>
                <i v-else class="fas fa-save"></i>
                {{ submitting ? 'Saving...' : 'Save' }}
              </button>
            </template>
            
            <template v-else>
              <button type="button" @click="$emit('close')" class="btn btn-primary">
                <i class="fas fa-check"></i>
                OK
              </button>
            </template>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'GlobalModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => [
        'info', 'success', 'warning', 'error', 'confirm', 'form'
      ].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'xl'].includes(value)
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    },
    submitting: {
      type: Boolean,
      default: false
    },
    hasActions: {
      type: Boolean,
      default: true
    }
  },
  
  emits: ['close', 'confirm'],
  
  computed: {
    typeConfig() {
      return {
        info: { 
          icon: 'fas fa-info-circle', 
          color: 'blue',
          gradient: 'from-blue-500 to-blue-600'
        },
        success: { 
          icon: 'fas fa-check-circle', 
          color: 'green',
          gradient: 'from-emerald-500 to-emerald-600'
        },
        warning: { 
          icon: 'fas fa-exclamation-triangle', 
          color: 'yellow',
          gradient: 'from-amber-500 to-orange-500'
        },
        error: { 
          icon: 'fas fa-times-circle', 
          color: 'red',
          gradient: 'from-red-500 to-red-600'
        },
        confirm: { 
          icon: 'fas fa-question-circle', 
          color: 'purple',
          gradient: 'from-purple-500 to-purple-600'
        },
        form: { 
          icon: 'fas fa-edit', 
          color: 'indigo',
          gradient: 'from-indigo-500 to-indigo-600'
        }
      }
    },
    
    config() {
      return this.typeConfig[this.type] || this.typeConfig.info
    },
    
    iconClass() {
      return this.config.icon
    },
    
    iconColorClass() {
      return `modal-icon-${this.config.color}`
    },
    
    contentClass() {
      return {
        'modal-small': this.size === 'small',
        'modal-large': this.size === 'large',
        'modal-xl': this.size === 'xl'
      }
    },
    
    formattedMessage() {
      return this.message.replace(/\n/g, '<br>')
    }
  },
  
  mounted() {
    document.addEventListener('keydown', this.handleEscape)
    // Prevent body scroll when modal is open
    if (this.show) {
      document.body.style.overflow = 'hidden'
    }
  },
  
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscape)
    document.body.style.overflow = 'auto'
  },
  
  watch: {
    show(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'auto'
      }
    }
  },
  
  methods: {
    handleOverlayClick() {
      if (this.closeOnOverlay && !this.submitting) {
        this.$emit('close')
      }
    },
    
    handleEscape(e) {
      if (e.key === 'Escape' && this.show && !this.submitting) {
        this.$emit('close')
      }
    }
  }
}
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 9999;
  animation: modalFadeIn 0.3s ease forwards;
}

[data-theme="dark"] .modal-overlay {
  background: rgba(0, 0, 0, 0.8);
}

/* Modal Content */
.modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 
    0 32px 64px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  position: relative;
}

[data-theme="dark"] .modal-content {
  background: rgba(31, 41, 55, 0.95);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 
    0 32px 64px -12px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

/* Size Variations */
.modal-small .modal-content {
  max-width: 400px;
}

.modal-large .modal-content {
  max-width: 700px;
}

.modal-xl .modal-content {
  max-width: 900px;
}

/* Glassmorphism Shimmer Effect */
.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #3b82f6 100%);
  background-size: 300% 100%;
  animation: shimmer 3s ease-in-out infinite;
}

/* Modal Header */
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .modal-header {
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.modal-icon-blue {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 8px 16px -4px rgba(59, 130, 246, 0.4);
}

.modal-icon-green {
  background: linear-gradient(135deg, #10b981, #047857);
  color: white;
  box-shadow: 0 8px 16px -4px rgba(16, 185, 129, 0.4);
}

.modal-icon-yellow {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 8px 16px -4px rgba(245, 158, 11, 0.4);
}

.modal-icon-red {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 8px 16px -4px rgba(239, 68, 68, 0.4);
}

.modal-icon-purple {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 0 8px 16px -4px rgba(139, 92, 246, 0.4);
}

.modal-icon-indigo {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  box-shadow: 0 8px 16px -4px rgba(99, 102, 241, 0.4);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
}

[data-theme="dark"] .modal-title {
  color: #f9fafb;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
  line-height: 1.4;
}

[data-theme="dark"] .modal-subtitle {
  color: #9ca3af;
}

.modal-close {
  padding: 0.5rem;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  color: #6b7280;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #374151;
  transform: rotate(90deg);
}

[data-theme="dark"] .modal-close {
  background: rgba(75, 85, 99, 0.5);
  color: #9ca3af;
}

[data-theme="dark"] .modal-close:hover {
  background: rgba(75, 85, 99, 0.7);
  color: #d1d5db;
}

/* Modal Body */
.modal-body {
  padding: 1rem 2rem;
  flex: 1;
  overflow-y: auto;
  color: #374151;
}

[data-theme="dark"] .modal-body {
  color: #d1d5db;
}

/* Form Styles */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

[data-theme="dark"] .form-group label {
  color: #d1d5db;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  color: #374151;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}

[data-theme="dark"] .form-input, 
[data-theme="dark"] .form-textarea {
  background: rgba(55, 65, 81, 0.8);
  border: 2px solid rgba(75, 85, 99, 0.3);
  color: #e5e7eb;
}

[data-theme="dark"] .form-input:focus,
[data-theme="dark"] .form-textarea:focus {
  background: rgba(55, 65, 81, 0.95);
  border-color: #3b82f6;
}

.field-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 400;
  opacity: 0.8;
}

[data-theme="dark"] .field-hint {
  color: #9ca3af;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 2rem 2rem 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(249, 250, 251, 0.8);
}

[data-theme="dark"] .modal-actions {
  border-top: 1px solid rgba(75, 85, 99, 0.3);
  background: rgba(17, 24, 39, 0.8);
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px -2px rgba(59, 130, 246, 0.4);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 6px 16px -2px rgba(59, 130, 246, 0.5);
  transform: translateY(-1px);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 12px -2px rgba(239, 68, 68, 0.4);
}

.btn-danger:hover:not(:disabled) {
  box-shadow: 0 6px 16px -2px rgba(239, 68, 68, 0.5);
  transform: translateY(-1px);
}

.btn-outline-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #6b7280;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.btn-outline-secondary:hover:not(:disabled) {
  background: rgba(249, 250, 251, 1);
  color: #374151;
  transform: translateY(-1px);
}

[data-theme="dark"] .btn-outline-secondary {
  background: rgba(55, 65, 81, 0.9);
  color: #9ca3af;
  border: 1px solid rgba(75, 85, 99, 0.3);
}

[data-theme="dark"] .btn-outline-secondary:hover:not(:disabled) {
  background: rgba(75, 85, 99, 1);
  color: #d1d5db;
}

/* Loading Animation */
.btn-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Animations */
@keyframes modalFadeIn {
  from { 
    opacity: 0; 
  }
  to { 
    opacity: 1; 
  }
}

@keyframes modalSlideIn {
  from { 
    transform: scale(0.9) translateY(-20px);
    opacity: 0;
  }
  to { 
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes shimmer {
  0% { background-position: -300% 0; }
  100% { background-position: 300% 0; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile Responsiveness */
@media (max-width: 640px) {
  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
    border-radius: 20px;
  }
  
  .modal-header,
  .modal-body,
  .modal-actions {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>