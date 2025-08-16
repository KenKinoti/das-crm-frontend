import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Participants from '../views/Participants.vue'
import Staff from '../views/Staff.vue'
import Scheduling from '../views/Scheduling.vue'
import Documents from '../views/Documents.vue'
import Billing from '../views/Billing.vue'
import Reports from '../views/Reports.vue'
import Settings from '../views/Settings.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/participants',
    name: 'Participants',
    component: Participants,
    meta: { requiresAuth: true }
  },
  {
    path: '/staff',
    name: 'Staff',
    component: Staff,
    meta: { requiresAuth: true }
  },
  {
    path: '/scheduling',
    name: 'Scheduling',
    component: Scheduling,
    meta: { requiresAuth: true }
  },
  {
    path: '/documents',
    name: 'Documents',
    component: Documents,
    meta: { requiresAuth: true }
  },
  {
    path: '/billing',
    name: 'Billing',
    component: Billing,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Simplified auth guard
router.beforeEach(async (to, from, next) => {
  console.log('Router guard - navigating to:', to.name)
  
  const authStore = useAuthStore()
  
  // If going to login page
  if (to.name === 'Login') {
    // If already authenticated, redirect to dashboard
    if (authStore.isAuthenticated) {
      console.log('Already authenticated, redirecting to dashboard')
      next('/dashboard')
      return
    }
    console.log('Going to login page')
    next()
    return
  }
  
  // For protected routes
  if (to.meta.requiresAuth !== false) {
    console.log('Protected route, checking auth...')
    
    // Quick check - if we have a token, allow navigation
    if (authStore.isAuthenticated) {
      console.log('Token exists, allowing navigation')
      next()
      return
    }
    
    console.log('No auth token, redirecting to login')
    next('/login')
    return
  }
  
  console.log('Public route, allowing navigation')
  next()
})

export default router
