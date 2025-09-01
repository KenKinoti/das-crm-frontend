import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePermissionsStore } from '../stores/permissions'

// Lazy load components for better performance
const Login = () => import('../views/Login.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const Participants = () => import('../views/ParticipantsFixed.vue')
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
  
  console.log('🛡️ ROUTER DEBUG: Guard triggered', {
    from: from.path,
    to: to.path,
    timestamp: new Date().toISOString()
  })
  
  console.log('🛡️ ROUTER DEBUG: Auth state check:', { 
    isAuthenticated: authStore.isAuthenticated,
    hasToken: !!authStore.token,
    hasUser: !!authStore.user,
    tokenValue: authStore.token ? authStore.token.substring(0, 30) + '...' : 'null',
    userEmail: authStore.user?.email || 'null'
  })
  
  // Save current route (except login) for refresh persistence
  if (to.name && to.name !== 'Login' && to.path !== '/') {
    localStorage.setItem('lastRoute', to.path)
  }
  
  // If going to login page
  if (to.name === 'Login') {
    // Only check existing auth state, don't initialize if no token
    if (authStore.token && !authStore.user) {
      console.log('Has token but no user, initializing...')
      await authStore.initializeAuth()
    }
    
    // If authenticated, redirect to dashboard
    if (authStore.isAuthenticated) {
      console.log('User already authenticated, redirecting to dashboard')
      next('/dashboard')
      return
    }
    next()
    return
  }
  
  // For protected routes
  if (to.meta.requiresAuth !== false) {
    
    // Initialize auth state if not authenticated
    if (!authStore.isAuthenticated) {
      console.log('Initializing auth state...')
      const isInitialized = await authStore.initializeAuth()
      
      if (!isInitialized) {
        console.log('Auth initialization failed, redirecting to login')
        next('/login')
        return
      }
    }
    
    // Final check - ensure we have both token and user
    if (!authStore.isAuthenticated || !authStore.user) {
      console.log('Authentication incomplete, redirecting to login')
      authStore.logout() // Clear invalid state
      next('/login')
      return
    }
    
    // Check for super admin requirement
    if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
      console.log('Super admin required, redirecting to dashboard')
      next('/dashboard')
      return
    }
    
    console.log('Auth guard passed, proceeding to:', to.path)
    next()
    return
  }
  
  next()
})

export default router
