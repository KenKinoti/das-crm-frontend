<template>
  <Teleport to="body">
    <div v-if="show" class="notification-modal-overlay" @click="handleOverlayClick">
      <div class="notification-modal-content" :class="contentClass" @click.stop>
        <div class="notification-modal-header" :class="headerColor">
          <i :class="iconClass"></i>
          <h3>{{ title }}</h3>
          <button 
            class="notification-modal-close" 
            @click="$emit('close')"
            aria-label="Close modal"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="notification-modal-body">
          <slot name="body">
            <p v-html="formattedMessage"></p>
          </slot>
        </div>
        
        <div class="notification-modal-actions">
          <slot name="actions">
            <!-- Default actions based on modal type -->
            <template v-if="type === 'view'">
              <button class="btn btn-view" @click="$emit('close')">
                <i class="fas fa-times"></i>
                Close
              </button>
              <button 
                v-if="showDelete" 
                class="btn btn-delete" 
                @click="$emit('delete')"
              >
                <i class="fas fa-trash"></i>
                Delete
              </button>
            </template>
            
            <template v-else-if="type === 'confirm'">
              <button class="btn btn-view" @click="$emit('close')">
                <i class="fas fa-times"></i>
                Cancel
              </button>
              <button class="btn btn-delete" @click="$emit('confirm')">
                <i class="fas fa-check"></i>
                Confirm
              </button>
            </template>
            
            <template v-else>
              <button class="btn btn-primary" @click="$emit('close')">
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
  name: 'BaseModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => [
        'info', 'view', 'edit', 'delete', 'shift', 
        'success', 'error', 'confirm', 'warning'
      ].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    showDelete: {
      type: Boolean,
      default: false
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    }
  },
  
  emits: ['close', 'delete', 'confirm'],
  
  computed: {
    typeConfig() {
      return {
        info: { color: 'white', icon: 'fas fa-info-circle' },
        view: { color: 'white', icon: 'fas fa-eye' },
        edit: { color: 'blue', icon: 'fas fa-edit' },
        delete: { color: 'red', icon: 'fas fa-trash' },
        shift: { color: 'green', icon: 'fas fa-calendar' },
        success: { color: 'green', icon: 'fas fa-check-circle' },
        error: { color: 'red', icon: 'fas fa-exclamation-circle' },
        confirm: { color: 'yellow', icon: 'fas fa-question-circle' },
        warning: { color: 'yellow', icon: 'fas fa-exclamation-triangle' }
      }
    },
    
    config() {
      return this.typeConfig[this.type] || this.typeConfig.info
    },
    
    headerColor() {
      return this.config.color
    },
    
    iconClass() {
      return this.config.icon
    },
    
    contentClass() {
      return {
        'modal-small': this.size === 'small',
        'modal-large': this.size === 'large'
      }
    },
    
    formattedMessage() {
      return this.message.replace(/\n/g, '<br>')
    }
  },
  
  mounted() {
    // Handle escape key
    document.addEventListener('keydown', this.handleEscape)
  },
  
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscape)
  },
  
  methods: {
    handleOverlayClick() {
      if (this.closeOnOverlay) {
        this.$emit('close')
      }
    },
    
    handleEscape(e) {
      if (e.key === 'Escape' && this.show) {
        this.$emit('close')
      }
    }
  }
}
</script>

<style scoped>
.modal-small .notification-modal-content {
  max-width: 400px;
}

.modal-large .notification-modal-content {
  max-width: 800px;
}

/* Animation for modal entrance */
.notification-modal-overlay {
  animation: modalFadeIn 0.2s ease forwards;
}

.notification-modal-content {
  animation: modalSlideIn 0.2s ease forwards;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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
</style>