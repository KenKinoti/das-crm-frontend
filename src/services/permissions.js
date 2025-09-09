// Role-based permissions system

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager', 
  SUPPORT_COORDINATOR: 'support_coordinator',
  CARE_WORKER: 'care_worker',
  ADMIN: 'admin' // Legacy role - treat as manager
}

export const PERMISSIONS = {
  // Dashboard - all can see their own data
  VIEW_DASHBOARD: 'view_dashboard',
  
  // Participants management
  VIEW_PARTICIPANTS: 'view_participants',
  ADD_PARTICIPANTS: 'add_participants',
  EDIT_PARTICIPANTS: 'edit_participants',
  DELETE_PARTICIPANTS: 'delete_participants',
  
  // Staff management
  VIEW_STAFF: 'view_staff',
  ADD_STAFF: 'add_staff',
  EDIT_STAFF: 'edit_staff',
  DELETE_STAFF: 'delete_staff',
  
  // Scheduling
  VIEW_SCHEDULING: 'view_scheduling',
  VIEW_ALL_SCHEDULES: 'view_all_schedules',
  VIEW_OWN_SCHEDULE: 'view_own_schedule',
  CREATE_SHIFTS: 'create_shifts',
  ASSIGN_SHIFTS: 'assign_shifts',
  EDIT_SHIFTS: 'edit_shifts',
  COMPLETE_SHIFTS: 'complete_shifts',
  CANCEL_SHIFTS: 'cancel_shifts',
  
  // Care Plans
  VIEW_CARE_PLANS: 'view_care_plans',
  CREATE_CARE_PLANS: 'create_care_plans',
  EDIT_CARE_PLANS: 'edit_care_plans',
  APPROVE_CARE_PLANS: 'approve_care_plans',
  DELETE_CARE_PLANS: 'delete_care_plans',

  // Documents
  VIEW_DOCUMENTS: 'view_documents',
  UPLOAD_DOCUMENTS: 'upload_documents',
  EDIT_DOCUMENTS: 'edit_documents',
  DELETE_DOCUMENTS: 'delete_documents',
  
  // Billing
  VIEW_BILLING: 'view_billing',
  CREATE_INVOICES: 'create_invoices',
  EDIT_BILLING: 'edit_billing',
  PROCESS_PAYMENTS: 'process_payments',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
  CREATE_REPORTS: 'create_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Settings - all can access their own
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  EDIT_ORGANIZATION_SETTINGS: 'edit_organization_settings',
  
  // Super Admin
  MANAGE_ORGANIZATIONS: 'manage_organizations',
  MANAGE_ALL_USERS: 'manage_all_users',
  VIEW_SYSTEM_LOGS: 'view_system_logs',
  MANAGE_DATABASE: 'manage_database',
  
  // Worker Availability
  VIEW_OWN_AVAILABILITY: 'view_own_availability',
  MANAGE_OWN_AVAILABILITY: 'manage_own_availability',
  VIEW_ALL_AVAILABILITY: 'view_all_availability',
  MANAGE_ALL_AVAILABILITY: 'manage_all_availability',
  
  // Incident Reports
  VIEW_INCIDENT_REPORTS: 'view_incident_reports',
  CREATE_INCIDENT_REPORTS: 'create_incident_reports',
  EDIT_INCIDENT_REPORTS: 'edit_incident_reports',
  REVIEW_INCIDENT_REPORTS: 'review_incident_reports',

  // Care Notes
  VIEW_CARE_NOTES: 'view_care_notes',
  CREATE_CARE_NOTES: 'create_care_notes',
  EDIT_CARE_NOTES: 'edit_care_notes',
  DELETE_CARE_NOTES: 'delete_care_notes'
}

// Define manager permissions first
const MANAGER_PERMISSIONS = [
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_PARTICIPANTS,
  PERMISSIONS.ADD_PARTICIPANTS,
  PERMISSIONS.EDIT_PARTICIPANTS,
  PERMISSIONS.VIEW_STAFF,
  PERMISSIONS.ADD_STAFF,
  PERMISSIONS.EDIT_STAFF,
  PERMISSIONS.DELETE_STAFF,
  PERMISSIONS.VIEW_SCHEDULING,
  PERMISSIONS.VIEW_ALL_SCHEDULES,
  PERMISSIONS.CREATE_SHIFTS,
  PERMISSIONS.ASSIGN_SHIFTS,
  PERMISSIONS.EDIT_SHIFTS,
  PERMISSIONS.COMPLETE_SHIFTS,
  PERMISSIONS.CANCEL_SHIFTS,
  PERMISSIONS.VIEW_CARE_PLANS,
  PERMISSIONS.CREATE_CARE_PLANS,
  PERMISSIONS.EDIT_CARE_PLANS,
  PERMISSIONS.APPROVE_CARE_PLANS,
  PERMISSIONS.DELETE_CARE_PLANS,
  PERMISSIONS.VIEW_DOCUMENTS,
  PERMISSIONS.UPLOAD_DOCUMENTS,
  PERMISSIONS.EDIT_DOCUMENTS,
  PERMISSIONS.DELETE_DOCUMENTS,
  PERMISSIONS.VIEW_BILLING,
  PERMISSIONS.CREATE_INVOICES,
  PERMISSIONS.EDIT_BILLING,
  PERMISSIONS.PROCESS_PAYMENTS,
  PERMISSIONS.VIEW_REPORTS,
  PERMISSIONS.CREATE_REPORTS,
  PERMISSIONS.EXPORT_REPORTS,
  PERMISSIONS.VIEW_SETTINGS,
  PERMISSIONS.EDIT_SETTINGS,
  PERMISSIONS.EDIT_ORGANIZATION_SETTINGS,
  PERMISSIONS.VIEW_INCIDENT_REPORTS,
  PERMISSIONS.CREATE_INCIDENT_REPORTS,
  PERMISSIONS.EDIT_INCIDENT_REPORTS,
  PERMISSIONS.REVIEW_INCIDENT_REPORTS,
  PERMISSIONS.VIEW_CARE_NOTES,
  PERMISSIONS.CREATE_CARE_NOTES,
  PERMISSIONS.EDIT_CARE_NOTES,
  PERMISSIONS.DELETE_CARE_NOTES
]

// Define permissions for each role
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    // Super admin has all permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [ROLES.MANAGER]: MANAGER_PERMISSIONS,
  
  [ROLES.SUPPORT_COORDINATOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PARTICIPANTS,
    PERMISSIONS.ADD_PARTICIPANTS,
    PERMISSIONS.EDIT_PARTICIPANTS,
    PERMISSIONS.VIEW_STAFF,
    PERMISSIONS.VIEW_SCHEDULING,
    PERMISSIONS.VIEW_ALL_SCHEDULES,
    PERMISSIONS.CREATE_SHIFTS,
    PERMISSIONS.ASSIGN_SHIFTS,
    PERMISSIONS.EDIT_SHIFTS,
    PERMISSIONS.COMPLETE_SHIFTS,
    PERMISSIONS.CANCEL_SHIFTS,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.VIEW_INCIDENT_REPORTS,
    PERMISSIONS.CREATE_INCIDENT_REPORTS,
    PERMISSIONS.EDIT_INCIDENT_REPORTS,
    PERMISSIONS.REVIEW_INCIDENT_REPORTS,
    PERMISSIONS.VIEW_CARE_NOTES,
    PERMISSIONS.CREATE_CARE_NOTES,
    PERMISSIONS.EDIT_CARE_NOTES
  ],
  
  [ROLES.CARE_WORKER]: [
    PERMISSIONS.VIEW_SCHEDULING,
    PERMISSIONS.VIEW_OWN_SCHEDULE,
    PERMISSIONS.COMPLETE_SHIFTS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.MANAGE_OWN_AVAILABILITY,
    PERMISSIONS.VIEW_OWN_AVAILABILITY,
    PERMISSIONS.VIEW_INCIDENT_REPORTS,
    PERMISSIONS.CREATE_INCIDENT_REPORTS,
    PERMISSIONS.VIEW_CARE_NOTES,
    PERMISSIONS.CREATE_CARE_NOTES,
    PERMISSIONS.EDIT_CARE_NOTES
  ],
  
  // Legacy admin role - treat as manager
  [ROLES.ADMIN]: MANAGER_PERMISSIONS
}

// Define manager navigation first
const MANAGER_NAVIGATION = [
  'dashboard', 'participants', 'staff', 'scheduling', 'care-plans', 'care-notes', 'documents', 'billing', 'reports', 'incident-reports', 'settings'
]

// Navigation items that should be visible for each role
export const ROLE_NAVIGATION = {
  [ROLES.SUPER_ADMIN]: [
    'dashboard', 'participants', 'staff', 'scheduling', 'care-plans', 'care-notes', 'documents', 'billing', 'reports', 'incident-reports', 'settings', 'superadmin'
  ],
  
  [ROLES.MANAGER]: MANAGER_NAVIGATION,
  
  [ROLES.SUPPORT_COORDINATOR]: [
    'dashboard', 'participants', 'scheduling', 'care-plans', 'care-notes', 'documents', 'reports', 'incident-reports', 'settings'
  ],
  
  [ROLES.CARE_WORKER]: [
    'availability', 'scheduling', 'care-notes', 'incident-reports', 'settings'
  ],
  
  [ROLES.ADMIN]: MANAGER_NAVIGATION
}

export class PermissionService {
  constructor(userRole) {
    this.userRole = userRole
    this.permissions = ROLE_PERMISSIONS[userRole] || []
  }
  
  hasPermission(permission) {
    return this.permissions.includes(permission)
  }
  
  hasAnyPermission(permissions) {
    return permissions.some(permission => this.hasPermission(permission))
  }
  
  hasAllPermissions(permissions) {
    return permissions.every(permission => this.hasPermission(permission))
  }
  
  canViewPage(pageName) {
    const allowedNavigation = ROLE_NAVIGATION[this.userRole] || []
    return allowedNavigation.includes(pageName)
  }
  
  getVisibleNavigation() {
    return ROLE_NAVIGATION[this.userRole] || []
  }
  
  isSuperAdmin() {
    return this.userRole === ROLES.SUPER_ADMIN
  }
  
  isManager() {
    return this.userRole === ROLES.MANAGER || this.userRole === ROLES.ADMIN
  }
  
  isSupportCoordinator() {
    return this.userRole === ROLES.SUPPORT_COORDINATOR
  }
  
  isCareWorker() {
    return this.userRole === ROLES.CARE_WORKER
  }
}

export default PermissionService