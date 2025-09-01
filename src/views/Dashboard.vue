<template>
  <PageTemplate
    page-title="Dashboard"
    page-description="Overview of your NDIS support operations and key metrics"
    header-icon="fas fa-tachometer-alt"
    :stats-cards="statsCards"
    :show-search="false"
    :show-filters="false"
    :show-add-button="false"
  >
    <template #content>
      <div class="dashboard-content">
        <!-- Loading indicator -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>

        <!-- Error message -->
        <div v-if="error" class="alert alert-danger">
          <p>{{ error }}</p>
          <button @click="fetchDashboardData" class="btn btn-primary">Retry</button>
        </div>

    <!-- Quick Actions -->
    <div class="quick-actions mt-4">
      <h2 class="section-title">
        <i class="fas fa-bolt"></i>
        Quick Actions
      </h2>
      <div class="actions-grid">
        <div class="action-btn" @click="navigateTo('participants')" :class="{ 'loading': isNavigating }">
          <div class="action-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <div class="action-text">Add Participant</div>
        </div>
        <div class="action-btn" @click="navigateTo('scheduling')" :class="{ 'loading': isNavigating }">
          <div class="action-icon">
            <i class="fas fa-calendar-plus"></i>
          </div>
          <div class="action-text">Schedule</div>
        </div>
        <div class="action-btn" @click="navigateTo('documents')" :class="{ 'loading': isNavigating }">
          <div class="action-icon">
            <i class="fas fa-upload"></i>
          </div>
          <div class="action-text">Upload</div>
        </div>
        <div class="action-btn" @click="navigateTo('billing')" :class="{ 'loading': isNavigating }">
          <div class="action-icon">
            <i class="fas fa-file-invoice-dollar"></i>
          </div>
          <div class="action-text">Invoice</div>
        </div>
        <div class="action-btn" @click="navigateTo('staff')" :class="{ 'loading': isNavigating }">
          <div class="action-icon">
            <i class="fas fa-user-tie"></i>
          </div>
          <div class="action-text">Add Staff</div>
        </div>
        <div class="action-btn" @click="navigateTo('reports')" :class="{ 'loading': isNavigating }">
          <div class="action-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="action-text">Reports</div>
        </div>
      </div>
    </div>

        <!-- Recent Activity -->
        <div class="recent-activity">
          <h2 class="section-title">
            <i class="fas fa-clock"></i>
            Recent Activity
          </h2>
          <div v-if="recentActivities.length === 0" class="no-activity">
            <p>No recent activity to show.</p>
          </div>
          <div v-else class="activity-list">
            <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <div class="activity-icon" :style="{ background: activity.color }">
                <i :class="activity.icon"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-subtitle">{{ activity.subtitle }}</div>
              </div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PageTemplate>
</template>

<script>
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import { useOrganizationContextStore } from '../stores/organizationContext'
import PageTemplate from '../components/PageTemplate.vue'

export default {
  name: 'Dashboard',
  components: {
    PageTemplate
  },
  data() {
    return {
      stats: {
        totalParticipants: 138,
        activeStaff: 24,
        shiftsThisWeek: 67,
        monthlyRevenue: 45250,
        participantGrowth: '+8% from last month',
        staffGrowth: '+3 new this week',
        shiftCompletion: 92,
        revenueGrowth: 15
      },
      recentActivities: [
        {
          id: 1,
          title: 'New participant enrolled',
          subtitle: 'Sarah Johnson has been successfully onboarded',
          time: '2 hours ago',
          icon: 'fas fa-user-plus',
          color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
          id: 2,
          title: 'Shift completed',
          subtitle: 'Morning care session with Michael Chen',
          time: '4 hours ago',
          icon: 'fas fa-check-circle',
          color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
          id: 3,
          title: 'Invoice generated',
          subtitle: 'Monthly billing for Community Access services',
          time: '6 hours ago',
          icon: 'fas fa-file-invoice-dollar',
          color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
          id: 4,
          title: 'Care plan updated',
          subtitle: 'Reviewed and approved Emma Davis care plan',
          time: '1 day ago',
          icon: 'fas fa-clipboard-check',
          color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        }
      ],
      isLoading: false,
      isNavigating: false,
      error: null
    }
  },
  computed: {
    orgStore() {
      return useOrganizationContextStore()
    },
    statsCards() {
      return [
        {
          label: 'Total Participants',
          value: this.stats.totalParticipants,
          icon: 'fas fa-users',
          type: 'info',
          change: this.stats.participantGrowth
        },
        {
          label: 'Active Staff',
          value: this.stats.activeStaff,
          icon: 'fas fa-user-nurse',
          type: 'success',
          change: this.stats.staffGrowth
        },
        {
          label: 'Shifts This Week',
          value: this.stats.shiftsThisWeek,
          icon: 'fas fa-calendar-check',
          type: 'warning',
          change: `${this.stats.shiftCompletion}% completion`
        },
        {
          label: 'Monthly Revenue',
          value: '$' + this.formatCurrency(this.stats.monthlyRevenue),
          icon: 'fas fa-dollar-sign',
          type: 'info',
          change: `${this.stats.revenueGrowth}% vs last month`
        }
      ]
    }
  },
  watch: {
    'orgStore.currentOrganization'() {
      console.log('📊 DASHBOARD DEBUG: Organization changed, refreshing data...')
      this.fetchDashboardData()
    }
  },
  async mounted() {
    await this.fetchDashboardData()
  },
  methods: {
    async fetchDashboardData() {
      this.isLoading = true
      this.error = null
      
      try {
        console.log('Fetching dashboard data...')
        
        // Check if all API calls fail, then use mock data
        const promises = [
          this.fetchParticipantStats(),
          this.fetchStaffStats(),
          this.fetchShiftStats(),
          this.fetchRevenueStats(),
          this.fetchRecentActivity()
        ]
        
        const results = await Promise.allSettled(promises)
        
        // If all promises failed, show error message
        const allFailed = results.every(result => result.status === 'rejected')
        if (allFailed) {
          console.log('Backend unavailable')
          this.error = 'Unable to connect to backend. Please ensure the server is running.'
        }
        
      } catch (error) {
        console.error('Dashboard error:', error)
        this.error = 'Failed to load dashboard data. Please try again.'
      } finally {
        this.isLoading = false
      }
    },
    
    async fetchParticipantStats() {
      try {
        console.log('📊 DASHBOARD DEBUG: Fetching participant stats...')
        const orgFilter = this.orgStore.currentOrgId ? `&organization_id=${this.orgStore.currentOrgId}` : ''
        const response = await api.get(`/participants?limit=1${orgFilter}`)
        console.log('📊 DASHBOARD DEBUG: Participant response received:', response)
        
        if (response.success && response.data.pagination) {
          this.stats.totalParticipants = response.data.pagination.total || 0
          console.log('📊 DASHBOARD DEBUG: Set totalParticipants to:', this.stats.totalParticipants)
          
          // Calculate monthly growth
          const now = new Date()
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          
          try {
            const monthlyResponse = await api.get(`/participants?created_after=${monthAgo.toISOString()}${orgFilter}`)
            const newParticipantsThisMonth = monthlyResponse.success && monthlyResponse.data.pagination 
              ? monthlyResponse.data.pagination.total 
              : 0
              
            if (this.stats.totalParticipants > 0 && newParticipantsThisMonth > 0) {
              const growthPercentage = Math.round((newParticipantsThisMonth / Math.max(this.stats.totalParticipants - newParticipantsThisMonth, 1)) * 100)
              this.stats.participantGrowth = growthPercentage > 0 ? `+${growthPercentage}% from last month` : 'No growth this month'
            } else {
              this.stats.participantGrowth = 'No new participants this month'
            }
          } catch {
            this.stats.participantGrowth = 'Growth data unavailable'
          }
        } else {
          console.log('📊 DASHBOARD DEBUG: Response format unexpected:', { hasSuccess: !!response.success, hasData: !!response.data, hasPagination: !!(response.data?.pagination) })
          this.stats.totalParticipants = 0
          this.stats.participantGrowth = 'Data format error'
        }
      } catch (error) {
        console.error('📊 DASHBOARD DEBUG: Failed to fetch participant stats:', error)
        this.stats.totalParticipants = 0
        this.stats.participantGrowth = 'Unable to load'
      }
    },
    
    async fetchStaffStats() {
      try {
        const orgFilter = this.orgStore.currentOrgId ? `&organization_id=${this.orgStore.currentOrgId}` : ''
        const response = await api.get(`/users?limit=1${orgFilter}`)
        if (response.success && response.data.pagination) {
          this.stats.activeStaff = response.data.pagination.total || 0
          
          // Calculate weekly staff growth
          const now = new Date()
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          
          try {
            const weeklyResponse = await api.get(`/users?created_after=${weekAgo.toISOString()}${orgFilter}`)
            const newStaffThisWeek = weeklyResponse.success && weeklyResponse.data.pagination 
              ? weeklyResponse.data.pagination.total 
              : 0
              
            this.stats.staffGrowth = newStaffThisWeek > 0 
              ? `+${newStaffThisWeek} new this week`
              : 'No new staff this week'
          } catch {
            this.stats.staffGrowth = 'Growth data unavailable'
          }
        }
      } catch (error) {
        console.log('Failed to fetch staff stats:', error.message)
        this.stats.activeStaff = 0
        this.stats.staffGrowth = 'Unable to load'
      }
    },
    
    async fetchShiftStats() {
      try {
        // Calculate this week's date range
        const now = new Date()
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
        const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6))
        
        const orgFilter = this.orgStore.currentOrgId ? `&organization_id=${this.orgStore.currentOrgId}` : ''
        const response = await api.get(`/shifts?start_date=${weekStart.toISOString()}&end_date=${weekEnd.toISOString()}${orgFilter}`)
        if (response.success && response.data.shifts) {
          this.stats.shiftsThisWeek = response.data.shifts.length || 0
          
          // Calculate completion rate
          const completedShifts = response.data.shifts.filter(shift => shift.status === 'completed').length
          this.stats.shiftCompletion = this.stats.shiftsThisWeek > 0 
            ? Math.round((completedShifts / this.stats.shiftsThisWeek) * 100) 
            : 0
        }
      } catch (error) {
        console.log('Failed to fetch shift stats:', error.message)
        this.stats.shiftsThisWeek = 0
        this.stats.shiftCompletion = 0
      }
    },
    
    async fetchRevenueStats() {
      try {
        const orgFilter = this.orgStore.currentOrgId ? `?organization_id=${this.orgStore.currentOrgId}` : ''
        const response = await api.get(`/reports/dashboard${orgFilter}`)
        if (response.success && response.data) {
          this.stats.monthlyRevenue = response.data.monthly_revenue || 0
          
          // Calculate revenue from completed shifts this month
          const now = new Date()
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
          
          const orgParam = this.orgStore.currentOrgId ? `&organization_id=${this.orgStore.currentOrgId}` : ''
          
          try {
            const [currentMonth, lastMonth] = await Promise.all([
              api.get(`/reports/revenue?start_date=${monthStart.toISOString().split('T')[0]}&end_date=${monthEnd.toISOString().split('T')[0]}${orgParam}`),
              api.get(`/reports/revenue?start_date=${lastMonthStart.toISOString().split('T')[0]}&end_date=${lastMonthEnd.toISOString().split('T')[0]}${orgParam}`)
            ])
            
            const currentRevenue = currentMonth.success ? (currentMonth.data.total_revenue || 0) : 0
            const lastRevenue = lastMonth.success ? (lastMonth.data.total_revenue || 0) : 0
            
            if (currentRevenue > 0 || lastRevenue > 0) {
              this.stats.monthlyRevenue = currentRevenue
              if (lastRevenue > 0) {
                const growthPercentage = Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100)
                this.stats.revenueGrowth = growthPercentage >= 0 ? Math.abs(growthPercentage) : Math.abs(growthPercentage)
              } else {
                this.stats.revenueGrowth = currentRevenue > 0 ? 100 : 0
              }
            } else {
              this.stats.revenueGrowth = 0
            }
          } catch {
            this.stats.revenueGrowth = 0
          }
        }
      } catch (error) {
        console.log('Failed to fetch revenue stats:', error.message)
        this.stats.monthlyRevenue = 0
        this.stats.revenueGrowth = 0
      }
    },
    
    async fetchRecentActivity() {
      try {
        const orgFilter = this.orgStore.currentOrgId ? `?organization_id=${this.orgStore.currentOrgId}` : ''
        const response = await api.get(`/reports/dashboard${orgFilter}`)
        if (response.success && response.data.recent_activities) {
          this.recentActivities = response.data.recent_activities.map(activity => ({
            id: activity.id,
            title: activity.description,
            subtitle: `By ${activity.user_name || 'System'}`,
            time: this.formatTimeAgo(new Date(activity.timestamp)),
            icon: this.getActivityIcon(activity.type),
            color: this.getActivityColor(activity.type)
          }))
        } else {
          // Use mock data if API doesn't return activities
          this.recentActivities = []
        }
      } catch (error) {
        console.log('Could not fetch recent activity:', error.message)
        this.recentActivities = []
      }
    },
    
    
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-AU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    },
    
    async navigateTo(page) {
      console.log('Navigating to:', page)
      this.isNavigating = true
      
      try {
        await this.$router.push(`/${page}`)
      } catch (error) {
        console.error('Navigation error:', error)
      } finally {
        // Reset navigation state after a short delay
        setTimeout(() => {
          this.isNavigating = false
        }, 300)
      }
    },
    
    formatTimeAgo(date) {
      const now = new Date()
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'Just now'
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
      if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
      return date.toLocaleDateString()
    },
    
    getActivityIcon(type) {
      const iconMap = {
        'shift_completed': 'fas fa-check-circle',
        'shift_started': 'fas fa-play-circle',
        'shift_scheduled': 'fas fa-calendar-plus',
        'participant_added': 'fas fa-user-plus',
        'staff_added': 'fas fa-user-tie',
        'document_uploaded': 'fas fa-file-upload',
        'billing_generated': 'fas fa-file-invoice',
        'default': 'fas fa-info-circle'
      }
      return iconMap[type] || iconMap.default
    },
    
    getActivityColor(type) {
      const colorMap = {
        'shift_completed': 'linear-gradient(135deg, #10b981, #059669)',
        'shift_started': 'linear-gradient(135deg, #3b82f6, #2563eb)',
        'shift_scheduled': 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        'participant_added': 'linear-gradient(135deg, #f59e0b, #d97706)',
        'staff_added': 'linear-gradient(135deg, #ef4444, #dc2626)',
        'document_uploaded': 'linear-gradient(135deg, #06b6d4, #0891b2)',
        'billing_generated': 'linear-gradient(135deg, #84cc16, #65a30d)',
        'default': 'linear-gradient(135deg, #6b7280, #4b5563)'
      }
      return colorMap[type] || colorMap.default
    }
  }
}
</script>

<style scoped>
/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 0;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* Stat card colors matching icon colors */
.stat-card.primary {
  border-left: 4px solid #3b82f6;
}

.stat-card.secondary {
  border-left: 4px solid #6b7280;
}

.stat-card.success {
  border-left: 4px solid #10b981;
}

.stat-card.warning {
  border-left: 4px solid #f59e0b;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.stat-title {
  font-size: 0.85rem;
  color: rgba(107, 114, 128, 0.8);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.2);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.stat-icon.primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.secondary {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}

.stat-icon.success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-value {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1a1a1a 0%, #333333 50%, #1a1a1a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #10b981;
}

/* Quick Actions */
.quick-actions {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 3rem;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 3rem;
  position: relative;
  overflow: hidden;
}

[data-theme="dark"] .quick-actions {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.quick-actions::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(102, 126, 234, 0.02) 100%);
  pointer-events: none;
}

.section-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
  position: relative;
}

[data-theme="dark"] .section-title {
  color: #f3f4f6;
}

.section-title i {
  color: #667eea;
  font-size: 1.4rem;
  text-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.actions-grid {
  display: flex !important;
  flex-wrap: nowrap !important;
  gap: 1.5rem;
  justify-content: space-between;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  width: 100%;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  text-decoration: none;
  color: #374151;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
  flex: 1 1 auto !important;
  min-width: 130px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* Add shimmer effect to match stat cards */
.action-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.6s;
}

.action-btn:hover::after {
  left: 100%;
}

[data-theme="dark"] .action-btn {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  color: #e5e7eb;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}


.action-btn:hover:not(.loading) {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

[data-theme="dark"] .action-btn:hover:not(.loading) {
  border-color: rgba(102, 126, 234, 0.8);
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.98) 0%, rgba(31, 41, 55, 0.9) 100%);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.25), 0 4px 8px rgba(0,0,0,0.3);
}

.action-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
}

.action-btn:hover:not(.loading) .action-icon {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.action-text {
  font-weight: 600;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
  font-size: 0.95rem;
  line-height: 1.3;
  word-wrap: break-word;
  color: #374151;
}

[data-theme="dark"] .action-text {
  color: #e5e7eb;
}

/* Recent Activity */
.recent-activity {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 3rem;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

/* Dark theme styling for recent activity */
[data-theme="dark"] .recent-activity {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.15);
}

.recent-activity::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(102, 126, 234, 0.02) 100%);
  pointer-events: none;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  position: relative;
}

.activity-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(102, 126, 234, 0.04) 100%);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateX(8px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.1);
}

[data-theme="dark"] .activity-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(102, 126, 234, 0.08) 100%);
  border-color: rgba(102, 126, 234, 0.4);
}

.activity-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.2);
  transition: all 0.3s ease;
}

.activity-item:hover .activity-icon {
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
}

[data-theme="dark"] .activity-title {
  color: #f3f4f6;
}

.activity-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
}

[data-theme="dark"] .activity-subtitle {
  color: #9ca3af;
}

.activity-time {
  font-size: 0.8rem;
  color: #9ca3af;
  font-weight: 500;
}

[data-theme="dark"] .activity-time {
  color: #6b7280;
}

.no-activity {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

[data-theme="dark"] .no-activity {
  color: #9ca3af;
}

/* Loading and Error States */
.loading-container {
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 2rem;
  background: #fee;
  border-radius: var(--border-radius);
  margin: 1rem 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
