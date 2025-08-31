import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePermissionsStore } from '../stores/permissions'

// Lazy load components for better performance
const Login = () => import('../views/Login.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const Participants = () => import('../views/Participants.vue')
const Staff = () => import('../views/Staff.vue')
const Scheduling = () => import('../views/Scheduling.vue')
const Documents = () => import('../views/Documents.vue')
const Billing = () => import('../views/Billing.vue')
const Reports = () => import('../views/Reports.vue')
const Settings = () => import('../views/Settings.vue')
const Profile = () => import('../views/Profile.vue')
const SuperAdmin = () => import('../views/SuperAdmin.vue')
const CarePlans = () => import('../views/CarePlans.vue')
const Database = () => import('../views/Database.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: to => {
      // If user has a stored last route, redirect there
      const lastRoute = localStorage.getItem('lastRoute')
      return lastRoute || '/dashboard'
    }
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
    path: '/care-plans',
    name: 'CarePlans',
    component: CarePlans,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/superadmin',
    name: 'SuperAdmin',
    component: SuperAdmin,
    meta: { requiresAuth: true, requiresSuperAdmin: true }
  },
  {
    path: '/database',
    name: 'Database',
    component: Database,
    meta: { requiresAuth: true, requiresSuperAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Enhanced auth guard with role-based permissions
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Save current route (except login) for refresh persistence
  if (to.name && to.name !== 'Login' && to.path !== '/') {
    localStorage.setItem('lastRoute', to.path)
  }
  
  // If going to login page
  if (to.name === 'Login') {
    // If already authenticated, redirect to dashboard
    if (authStore.isAuthenticated) {
      next('/dashboard')
      return
    }
    next()
    return
  }
  
  // For protected routes
  if (to.meta.requiresAuth !== false) {
    
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }
    
    // For mock tokens, ensure user data is loaded
    if (authStore.token?.startsWith('mock-jwt-token') && !authStore.user) {
      try {
        await authStore.getCurrentUser()
      } catch (error) {
        console.error('Failed to get current user:', error)
        next('/login')
        return
      }
    }
    
    // Check for super admin requirement
    if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
      next('/dashboard')
      return
    }
    
    next()
    return
  }
  
  next()
})

export default router
