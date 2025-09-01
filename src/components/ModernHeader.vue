<template>
  <header class="beautiful-header">
    <div class="flex items-center justify-between">
      <!-- Left: Menu Toggle & Page Title -->
      <div class="flex items-center gap-4">
        <button
          @click="$emit('toggle-sidebar')"
          class="p-2 rounded-xl hover:bg-secondary-100 transition-colors lg:hidden"
        >
          <Bars3Icon class="h-6 w-6 text-secondary-600" />
        </button>
        
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">{{ pageTitle }}</h1>
          <p class="text-sm text-secondary-600">{{ currentDateTime }}</p>
        </div>
      </div>

      <!-- Right: Actions & Profile -->
      <div class="flex items-center gap-4">
        <!-- Quick Actions -->
        <div class="hidden md:flex items-center gap-2">
          <button class="btn btn-secondary btn-sm">
            <PlusIcon class="h-4 w-4" />
            Quick Add
          </button>
        </div>

        <!-- Notifications -->
        <button class="relative p-2 rounded-xl hover:bg-secondary-100 transition-colors">
          <BellIcon class="h-6 w-6 text-secondary-600" />
          <span class="absolute -top-1 -right-1 h-3 w-3 bg-danger-500 rounded-full"></span>
        </button>

        <!-- Profile Dropdown -->
        <Menu as="div" class="relative">
          <MenuButton class="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary-100 transition-colors">
            <div class="h-8 w-8 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              <span class="text-white font-semibold text-sm">
                {{ authStore.userInitials }}
              </span>
            </div>
            <ChevronDownIcon class="h-4 w-4 text-secondary-400" />
          </MenuButton>

          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-large border border-secondary-200 focus:outline-none z-50">
              <div class="p-4 border-b border-secondary-100">
                <p class="font-medium text-secondary-900">{{ authStore.userName }}</p>
                <p class="text-sm text-secondary-500">{{ authStore.user?.email }}</p>
                <span class="inline-block px-2 py-1 mt-2 text-xs bg-primary-100 text-primary-700 rounded-lg capitalize">
                  {{ authStore.user?.role?.replace('_', ' ') }}
                </span>
              </div>
              
              <div class="p-2">
                <MenuItem v-slot="{ active }">
                  <button
                    @click="goToProfile"
                    :class="[
                      'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-xl transition-colors',
                      active ? 'bg-secondary-100 text-secondary-900' : 'text-secondary-700'
                    ]"
                  >
                    <UserIcon class="h-4 w-4" />
                    Profile Settings
                  </button>
                </MenuItem>
                
                <MenuItem v-slot="{ active }">
                  <button
                    @click="goToSettings"
                    :class="[
                      'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-xl transition-colors',
                      active ? 'bg-secondary-100 text-secondary-900' : 'text-secondary-700'
                    ]"
                  >
                    <CogIcon class="h-4 w-4" />
                    System Settings
                  </button>
                </MenuItem>
                
                <div class="border-t border-secondary-100 my-2"></div>
                
                <MenuItem v-slot="{ active }">
                  <button
                    @click="handleLogout"
                    :class="[
                      'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-xl transition-colors',
                      active ? 'bg-danger-50 text-danger-700' : 'text-danger-600'
                    ]"
                  >
                    <ArrowRightOnRectangleIcon class="h-4 w-4" />
                    Sign out
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </div>
  </header>
</template>

<script>
import { 
  Bars3Icon, BellIcon, ChevronDownIcon, PlusIcon,
  UserIcon, CogIcon, ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'ModernHeader',
  components: {
    Bars3Icon, BellIcon, ChevronDownIcon, PlusIcon,
    UserIcon, CogIcon, ArrowRightOnRectangleIcon,
    Menu, MenuButton, MenuItems, MenuItem
  },
  props: {
    pageTitle: {
      type: String,
      default: 'Dashboard'
    },
    sidebarOpen: {
      type: Boolean,
      default: true
    }
  },
  emits: ['toggle-sidebar'],
  data() {
    return {
      currentDateTime: ''
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    }
  },
  methods: {
    updateDateTime() {
      const now = new Date()
      this.currentDateTime = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    
    goToProfile() {
      this.$router.push('/profile')
    },
    
    goToSettings() {
      this.$router.push('/settings')
    },
    
    async handleLogout() {
      try {
        await this.authStore.logout()
        this.$router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        // Force redirect anyway
        this.$router.push('/login')
      }
    }
  },
  
  mounted() {
    this.updateDateTime()
    // Update time every minute
    this.timeInterval = setInterval(this.updateDateTime, 60000)
  },
  
  beforeUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
    }
  }
}
</script>

<style scoped>
/* Beautiful Header Design */
.beautiful-header {
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.95) 0%, 
    rgba(139, 92, 246, 0.95) 25%,
    rgba(236, 72, 153, 0.95) 50%,
    rgba(245, 158, 11, 0.95) 75%,
    rgba(16, 185, 129, 0.95) 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease-in-out infinite;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem 1.5rem;
  position: relative;
  overflow: hidden;
}

/* Animated gradient background */
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Glassmorphism overlay */
.beautiful-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  pointer-events: none;
}

/* Shimmer effect */
.beautiful-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.8) 50%, 
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Content styling */
.beautiful-header * {
  position: relative;
  z-index: 1;
}

.beautiful-header h1 {
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: 800;
  background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.beautiful-header p {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Button styling for header */
.beautiful-header button {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  transition: all 0.3s ease;
}

.beautiful-header button:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Profile avatar enhancement */
.beautiful-header .profile-avatar {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.beautiful-header .profile-avatar:hover {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

/* Notification badge glow */
.beautiful-header .notification-badge {
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Dark theme adjustments */
[data-theme="dark"] .beautiful-header {
  background: linear-gradient(135deg, 
    rgba(17, 24, 39, 0.95) 0%, 
    rgba(31, 41, 55, 0.95) 25%,
    rgba(55, 65, 81, 0.95) 50%,
    rgba(75, 85, 99, 0.95) 75%,
    rgba(107, 114, 128, 0.95) 100%
  );
}

[data-theme="dark"] .beautiful-header::before {
  background: rgba(0, 0, 0, 0.2);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .beautiful-header {
    padding: 1rem;
  }
  
  .beautiful-header h1 {
    font-size: 1.5rem;
  }
}
</style>