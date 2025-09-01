<template>
  <div class="relative">
    <!-- Sidebar -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <div
        v-if="isOpen || !isMobile"
        class="fixed left-0 top-0 h-full w-64 bg-white shadow-large z-40 border-r border-secondary-200"
      >
        <!-- Logo Area -->
        <div class="flex items-center gap-3 px-6 py-6 border-b border-secondary-200">
          <div class="h-10 w-10 bg-gradient-primary rounded-2xl flex items-center justify-center">
            <UserGroupIcon class="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gradient">AGO CRM</h1>
            <p class="text-xs text-secondary-500">Healthcare Management</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="px-4 py-6 space-y-2">
          <div
            v-for="item in navigationItems"
            :key="item.name"
            class="nav-link"
            :class="{ 'active': currentPage === item.page }"
            @click="$emit('navigate', item.page)"
          >
            <component :is="item.icon" class="h-5 w-5" />
            <span class="font-medium">{{ item.name }}</span>
          </div>
        </nav>

        <!-- User Profile Area -->
        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-200">
          <div class="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
            <div class="h-10 w-10 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              <span class="text-white font-semibold text-sm">
                {{ authStore.userInitials }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-secondary-900 truncate">
                {{ authStore.userName }}
              </p>
              <p class="text-xs text-secondary-500 capitalize">
                {{ authStore.user?.role?.replace('_', ' ') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Mobile Overlay -->
    <div
      v-if="isOpen && isMobile"
      class="fixed inset-0 bg-secondary-900 bg-opacity-50 backdrop-blur-sm z-30 lg:hidden"
      @click="$emit('toggle')"
    />
  </div>
</template>

<script>
import { 
  UserGroupIcon, HomeIcon, UsersIcon, UserIcon, CalendarDaysIcon,
  DocumentTextIcon, CreditCardIcon, ChartBarIcon, CogIcon, ShieldCheckIcon,
  CircuitBoardIcon, HeartIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'ModernSidebar',
  components: {
    UserGroupIcon, HomeIcon, UsersIcon, UserIcon, CalendarDaysIcon,
    DocumentTextIcon, CreditCardIcon, ChartBarIcon, CogIcon, ShieldCheckIcon,
    CircuitBoardIcon, HeartIcon
  },
  props: {
    isOpen: {
      type: Boolean,
      default: true
    },
    currentPage: {
      type: String,
      default: 'dashboard'
    }
  },
  emits: ['toggle', 'navigate'],
  data() {
    return {
      isMobile: window.innerWidth <= 768
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    navigationItems() {
      const items = [
        { name: 'Dashboard', page: 'dashboard', icon: 'HomeIcon' },
        { name: 'Participants', page: 'participants', icon: 'UsersIcon' },
        { name: 'Staff', page: 'staff', icon: 'UserIcon' },
        { name: 'Scheduling', page: 'scheduling', icon: 'CalendarDaysIcon' },
        { name: 'Care Plans', page: 'care-plans', icon: 'HeartIcon' },
        { name: 'Documents', page: 'documents', icon: 'DocumentTextIcon' },
        { name: 'Billing', page: 'billing', icon: 'CreditCardIcon' },
        { name: 'Reports', page: 'reports', icon: 'ChartBarIcon' },
        { name: 'Settings', page: 'settings', icon: 'CogIcon' }
      ]

      // Add super admin items
      if (this.authStore.isSuperAdmin) {
        items.push(
          { name: 'Organizations', page: 'superadmin', icon: 'ShieldCheckIcon' },
          { name: 'Database', page: 'database', icon: 'CircuitBoardIcon' }
        )
      }

      return items.map(item => ({
        ...item,
        icon: this.getIcon(item.icon)
      }))
    }
  },
  methods: {
    getIcon(iconName) {
      const iconMap = {
        HomeIcon, UsersIcon, UserIcon, CalendarDaysIcon,
        DocumentTextIcon, CreditCardIcon, ChartBarIcon, CogIcon,
        ShieldCheckIcon, CircuitBoardIcon, HeartIcon
      }
      return iconMap[iconName] || HomeIcon
    }
  },
  mounted() {
    const handleResize = () => {
      this.isMobile = window.innerWidth <= 768
    }
    window.addEventListener('resize', handleResize)
    this.$once('unmounted', () => {
      window.removeEventListener('resize', handleResize)
    })
  }
}
</script>