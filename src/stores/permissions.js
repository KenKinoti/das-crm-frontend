import { defineStore } from 'pinia'
import PermissionService, { PERMISSIONS, ROLES } from '../services/permissions'
import { useAuthStore } from './auth'

export const usePermissionsStore = defineStore('permissions', {
  state: () => ({
    _permissionService: null
  }),
  
  getters: {
    userRole: (state) => {
      const authStore = useAuthStore()
      return authStore.user?.role || null
    },
    
    permissionService: (state) => {
      const authStore = useAuthStore()
      const userRole = authStore.user?.role || null
      
      if (!state._permissionService && userRole) {
        state._permissionService = new PermissionService(userRole)
      } else if (state._permissionService && state._permissionService.role !== userRole) {
        // Update service if role changed
        state._permissionService = userRole ? new PermissionService(userRole) : null
      }
      
      return state._permissionService
    },
    
    // Navigation permissions
    canViewDashboard() {
      return this.permissionService?.hasPermission(PERMISSIONS.VIEW_DASHBOARD) || false
    },
    canViewParticipants() {
      return this.permissionService?.hasPermission(PERMISSIONS.VIEW_PARTICIPANTS) || false
    },
    canViewStaff() {
      return this.permissionService?.hasPermission(PERMISSIONS.VIEW_STAFF) || false
    },
    canViewScheduling() {
      return this.permissionService?.hasPermission(PERMISSIONS.VIEW_SCHEDULING) || false
    },
    canViewCarePlans() {
      return this.permissionService?.hasPermission(PERMISSIONS.VIEW_CARE_PLANS) || false
    },
    canViewDocuments() {
      return this.permissionService?.hasPermission(PERMISSIONS.VIEW_DOCUMENTS) || false
    },
    canViewBilling() {
      return this.permissionService?.hasPermission(PERMISSIONS.VIEW_BILLING) || false
    },
    canViewReports() {
      return this.permissionService?.hasPermission(PERMISSIONS.VIEW_REPORTS) || false
    },
    canViewSettings() {
      return this.permissionService?.hasPermission(PERMISSIONS.VIEW_SETTINGS) || false
    },
    canManageOrganizations() {
      return this.permissionService?.hasPermission(PERMISSIONS.MANAGE_ORGANIZATIONS) || false
    },
    
    // Participants permissions
    canAddParticipants() {
      return this.permissionService?.hasPermission(PERMISSIONS.ADD_PARTICIPANTS) || false
    },
    canEditParticipants() {
      return this.permissionService?.hasPermission(PERMISSIONS.EDIT_PARTICIPANTS) || false
    },
    canDeleteParticipants() {
      return this.permissionService?.hasPermission(PERMISSIONS.DELETE_PARTICIPANTS) || false
    },
    
    // Staff permissions
    canAddStaff() {
      return this.permissionService?.hasPermission(PERMISSIONS.ADD_STAFF) || false
    },
    canEditStaff() {
      return this.permissionService?.hasPermission(PERMISSIONS.EDIT_STAFF) || false
    },
    canDeleteStaff() {
      return this.permissionService?.hasPermission(PERMISSIONS.DELETE_STAFF) || false
    },
    
    // Scheduling permissions
    canViewAllSchedules() {
      return this.permissionService?.hasPermission(PERMISSIONS.VIEW_ALL_SCHEDULES) || false
    },
    canViewOwnSchedule() {
      return this.permissionService?.hasPermission(PERMISSIONS.VIEW_OWN_SCHEDULE) || false
    },
    canCreateShifts() {
      return this.permissionService?.hasPermission(PERMISSIONS.CREATE_SHIFTS) || false
    },
    canAssignShifts() {
      return this.permissionService?.hasPermission(PERMISSIONS.ASSIGN_SHIFTS) || false
    },
    canEditShifts() {
      return this.permissionService?.hasPermission(PERMISSIONS.EDIT_SHIFTS) || false
    },
    canCompleteShifts() {
      return this.permissionService?.hasPermission(PERMISSIONS.COMPLETE_SHIFTS) || false
    },
    canCancelShifts() {
      return this.permissionService?.hasPermission(PERMISSIONS.CANCEL_SHIFTS) || false
    },
    
    // Care Plans permissions
    canCreateCarePlans() {
      return this.permissionService?.hasPermission(PERMISSIONS.CREATE_CARE_PLANS) || false
    },
    canEditCarePlans() {
      return this.permissionService?.hasPermission(PERMISSIONS.EDIT_CARE_PLANS) || false
    },
    canApproveCarePlans() {
      return this.permissionService?.hasPermission(PERMISSIONS.APPROVE_CARE_PLANS) || false
    },
    canDeleteCarePlans() {
      return this.permissionService?.hasPermission(PERMISSIONS.DELETE_CARE_PLANS) || false
    },
    
    // Documents permissions
    canUploadDocuments() {
      return this.permissionService?.hasPermission(PERMISSIONS.UPLOAD_DOCUMENTS) || false
    },
    canEditDocuments() {
      return this.permissionService?.hasPermission(PERMISSIONS.EDIT_DOCUMENTS) || false
    },
    canDeleteDocuments() {
      return this.permissionService?.hasPermission(PERMISSIONS.DELETE_DOCUMENTS) || false
    },
    
    // Billing permissions
    canCreateInvoices() {
      return this.permissionService?.hasPermission(PERMISSIONS.CREATE_INVOICES) || false
    },
    canEditBilling() {
      return this.permissionService?.hasPermission(PERMISSIONS.EDIT_BILLING) || false
    },
    canProcessPayments() {
      return this.permissionService?.hasPermission(PERMISSIONS.PROCESS_PAYMENTS) || false
    },
    
    // Reports permissions
    canCreateReports() {
      return this.permissionService?.hasPermission(PERMISSIONS.CREATE_REPORTS) || false
    },
    canExportReports() {
      return this.permissionService?.hasPermission(PERMISSIONS.EXPORT_REPORTS) || false
    },
    
    // Settings permissions
    canEditSettings() {
      return this.permissionService?.hasPermission(PERMISSIONS.EDIT_SETTINGS) || false
    },
    canEditOrganizationSettings() {
      return this.permissionService?.hasPermission(PERMISSIONS.EDIT_ORGANIZATION_SETTINGS) || false
    },
    
    // Role checks
    isSuperAdmin() {
      return this.permissionService?.isSuperAdmin() || false
    },
    isManager() {
      return this.permissionService?.isManager() || false
    },
    isSupportCoordinator() {
      return this.permissionService?.isSupportCoordinator() || false
    },
    isCareWorker() {
      return this.permissionService?.isCareWorker() || false
    },
    
    // Incident Reports permissions
    canViewIncidentReports() {
      return this.permissionService?.hasPermission(PERMISSIONS.VIEW_INCIDENT_REPORTS) || false
    },
    canCreateIncidentReports() {
      return this.permissionService?.hasPermission(PERMISSIONS.CREATE_INCIDENT_REPORTS) || false
    },
    canEditIncidentReports() {
      return this.permissionService?.hasPermission(PERMISSIONS.EDIT_INCIDENT_REPORTS) || false
    },
    canReviewIncidentReports() {
      return this.permissionService?.hasPermission(PERMISSIONS.REVIEW_INCIDENT_REPORTS) || false
    },
    
    // Care Notes permissions
    canViewCareNotes() {
      return this.permissionService?.hasPermission(PERMISSIONS.VIEW_CARE_NOTES) || false
    },
    canCreateCareNotes() {
      return this.permissionService?.hasPermission(PERMISSIONS.CREATE_CARE_NOTES) || false
    },
    canEditCareNotes() {
      return this.permissionService?.hasPermission(PERMISSIONS.EDIT_CARE_NOTES) || false
    },
    canDeleteCareNotes() {
      return this.permissionService?.hasPermission(PERMISSIONS.DELETE_CARE_NOTES) || false
    },
    
    // Navigation visibility
    visibleNavigation() {
      return this.permissionService?.getVisibleNavigation() || []
    }
  },
  
  actions: {
    refreshPermissions() {
      const authStore = useAuthStore()
      if (authStore.user?.role) {
        this._permissionService = new PermissionService(authStore.user.role)
      } else {
        this._permissionService = null
      }
    },
    
    hasPermission(permission) {
      return this.permissionService?.hasPermission(permission) || false
    },
    
    hasAnyPermission(permissions) {
      return this.permissionService?.hasAnyPermission(permissions) || false
    },
    
    hasAllPermissions(permissions) {
      return this.permissionService?.hasAllPermissions(permissions) || false
    },
    
    canViewPage(pageName) {
      return this.permissionService?.canViewPage(pageName) || false
    }
  }
})