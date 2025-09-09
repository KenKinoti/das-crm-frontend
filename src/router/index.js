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
const CareNotes = () => import('../views/CareNotes.vue')
const Database = () => import('../views/Database.vue')
const Availability = () => import('../views/Availability.vue')
const IncidentReports = () => import('../views/IncidentReports.vue')

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
      // Check if user is authenticated and get their role
      const storedUser = localStorage.getItem('current_user')
      let userRole = null
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          userRole = user.role
        } catch (error) {
          console.error('Error parsing stored user:', error)
        }
      }
      
      // If user has a stored last route, redirect there
      const lastRoute = localStorage.getItem('lastRoute')
      
      // Default redirects based on role
      let defaultRoute = '/dashboard'
      if (userRole === 'care_worker') {
        defaultRoute = '/availability'
      } else if (userRole === 'support_coordinator') {
        defaultRoute = '/care-plans'
      }
      
      return lastRoute || defaultRoute
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { 
      requiresAuth: true,
      requiredRoles: ['super_admin', 'admin', 'manager']
    }
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
    path: '/care-notes',
    name: 'CareNotes',
    component: CareNotes,
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
  },
  {
    path: '/availability',
    name: 'Availability',
    component: Availability,
    meta: { 
      requiresAuth: true,
      requiredRoles: ['care_worker']
    }
  },
  {
    path: '/incident-reports',
    name: 'IncidentReports',
    component: IncidentReports,
    meta: { 
      requiresAuth: true,
      requiredRoles: ['support_coordinator', 'admin', 'manager', 'care_worker']
    }
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
  
  // For protected routes, ensure we initialize auth properly
  if (to.meta.requiresAuth !== false) {
    // Save current route for refresh persistence BEFORE any redirects
    if (to.name && to.name !== 'Login' && to.path !== '/') {
      localStorage.setItem('lastRoute', to.path)
      localStorage.setItem('lastRouteName', to.name)
    }
    
    // Always try to initialize auth state from localStorage first
    if (!authStore.token) {
      // Check if we have stored auth data
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('current_user')
      
      if (storedToken && storedUser) {
        console.log('🔄 Restoring auth state from localStorage...')
        try {
          authStore.token = storedToken
          authStore.user = JSON.parse(storedUser)
        } catch (error) {
          console.error('Error parsing stored auth data:', error)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('current_user')
          next('/login')
          return
        }
      } else {
        console.log('No stored auth data, redirecting to login')
        next('/login')
        return
      }
    }
    
    // If we have token but no user, initialize auth
    if (authStore.token && !authStore.user) {
      console.log('Token exists but no user data, initializing...')
      const isInitialized = await authStore.initializeAuth()
      
      if (!isInitialized) {
        console.log('Auth initialization failed, redirecting to login')
        next('/login')
        return
      }
    }
    
    // Final validation - must have both token and user
    if (!authStore.token || !authStore.user) {
      console.log('Authentication incomplete, redirecting to login')
      next('/login')
      return
    }
    
    // Check for super admin requirement
    if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
      console.log('Super admin required, redirecting to dashboard')
      next('/dashboard')
      return
    }
    
    // Check for role-based permissions
    if (to.meta.requiredRoles && Array.isArray(to.meta.requiredRoles)) {
      const userRole = authStore.user?.role
      const hasRequiredRole = to.meta.requiredRoles.includes(userRole)
      
      if (!hasRequiredRole) {
        console.log(`Role access denied. Required: ${to.meta.requiredRoles.join(', ')}, User role: ${userRole}`)
        // Redirect to appropriate page based on role
        if (userRole === 'care_worker') {
          next('/scheduling')
        } else if (userRole === 'support_coordinator') {
          next('/care-plans')
        } else {
          next('/participants')
        }
        return
      }
    }
    
    console.log('✅ Auth guard passed, proceeding to:', to.path)
    next()
    return
  }
  
  // If going to login page
  if (to.name === 'Login') {
    // If already authenticated, redirect away from login
    if (authStore.token && authStore.user) {
      let defaultRoute = '/dashboard'
      const userRole = authStore.user?.role
      
      if (userRole === 'care_worker') {
        defaultRoute = '/availability'
      } else if (userRole === 'support_coordinator') {
        defaultRoute = '/care-plans'
      }
      
      const lastRoute = localStorage.getItem('lastRoute') || defaultRoute
      console.log('Already authenticated, redirecting to:', lastRoute)
      next(lastRoute)
      return
    }
  }
  
  next()
})

export default router
