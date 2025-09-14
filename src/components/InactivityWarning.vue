<template>
  <div v-if="authStore.inactivityWarning" class="inactivity-overlay">
    <div class="inactivity-modal">
      <div class="modal-header">
        <i class="fas fa-clock text-warning"></i>
        <h3>Session Timeout Warning</h3>
      </div>
      
      <div class="modal-body">
        <p>
          You have been inactive for a while. Your session will expire in 
          <strong class="countdown">{{ countdown }}</strong> seconds.
        </p>
        <p class="text-muted">
          Click "Stay Logged In" to continue your session.
        </p>
      </div>
      
      <div class="modal-actions">
        <button @click="stayLoggedIn" class="btn btn-primary">
          <i class="fas fa-check"></i>
          Stay Logged In
        </button>
        <button @click="logoutNow" class="btn btn-outline-secondary">
          <i class="fas fa-sign-out-alt"></i>
          Logout Now
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'

export default {
  name: 'InactivityWarning',
  data() {
    return {
      countdown: 30,
      countdownInterval: null
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    }
  },
  watch: {
    'authStore.inactivityWarning'(newVal) {
      if (newVal) {
        this.startCountdown()
      } else {
        this.stopCountdown()
      }
    }
  },
  methods: {
    startCountdown() {
      this.countdown = 30
      this.countdownInterval = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          this.stopCountdown()
        }
      }, 1000)
    },
    
    stopCountdown() {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval)
        this.countdownInterval = null
      }
    },
    
    stayLoggedIn() {
      this.authStore.dismissInactivityWarning()
      this.stopCountdown()
    },
    
    logoutNow() {
      this.stopCountdown()
      this.authStore.logout('manual')
    }
  },
  
  beforeUnmount() {
    this.stopCountdown()
  }
}
</script>

<style scoped>
.inactivity-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

.inactivity-modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  margin: 0 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
  text-align: center;
}

.modal-header {
  margin-bottom: 1.5rem;
}

.modal-header i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #f59e0b;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
}

.modal-body {
  margin-bottom: 2rem;
  line-height: 1.6;
}

.modal-body p {
  margin: 0 0 1rem 0;
  color: #4b5563;
}

.countdown {
  color: #ef4444;
  font-size: 1.1em;
  font-weight: 700;
}

.text-muted {
  font-size: 0.9rem;
  color: #6b7280 !important;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  border: 2px solid;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  min-width: 140px;
  justify-content: center;
}

.btn-primary {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
}

.btn-outline-secondary {
  background: transparent;
  border-color: #d1d5db;
  color: #6b7280;
}

.btn-outline-secondary:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@media (max-width: 768px) {
  .modal-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>