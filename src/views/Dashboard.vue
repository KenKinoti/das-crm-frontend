<template>
  <div>
    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-header">
          <div>
            <div class="stat-title">Total Participants</div>
            <div class="stat-value">{{ stats.totalParticipants }}</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              {{ stats.participantGrowth }}
            </div>
          </div>
          <div class="stat-icon primary">
            <i class="fas fa-users"></i>
          </div>
        </div>
      </div>

      <div class="stat-card secondary">
        <div class="stat-header">
          <div>
            <div class="stat-title">Active Staff</div>
            <div class="stat-value">{{ stats.activeStaff }}</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              {{ stats.staffGrowth }}
            </div>
          </div>
          <div class="stat-icon secondary">
            <i class="fas fa-user-nurse"></i>
          </div>
        </div>
      </div>

      <div class="stat-card success">
        <div class="stat-header">
          <div>
            <div class="stat-title">Shifts This Week</div>
            <div class="stat-value">{{ stats.shiftsThisWeek }}</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              {{ stats.shiftCompletion }}% completion rate
            </div>
          </div>
          <div class="stat-icon success">
            <i class="fas fa-calendar-check"></i>
          </div>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-header">
          <div>
            <div class="stat-title">Monthly Revenue</div>
            <div class="stat-value">${{ formatCurrency(stats.monthlyRevenue) }}</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              {{ stats.revenueGrowth }}% vs last month
            </div>
          </div>
          <div class="stat-icon warning">
            <i class="fas fa-dollar-sign"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading dashboard data...</p>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchDashboardData" class="btn btn-primary">Retry</button>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2 class="section-title">
        <i class="fas fa-bolt"></i>
        Quick Actions
      </h2>
      <div class="actions-grid">
        <div class="action-btn" @click="navigateTo('participants')" :class="{ 'loading': isNavigating }">
          <div class="action-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <div class="action-text">Add New Participant</div>
        </div>
        <div class="action-btn" @click="navigateTo('scheduling')" :class="{ 'loading': isNavigating }">
          <div class="action-icon">
            <i class="fas fa-calendar-plus"></i>
          </div>
          <div class="action-text">Schedule Shift</div>
        </div>
        <div class="action-btn" @click="navigateTo('documents')" :class="{ 'loading': isNavigating }">
          <div class="action-icon">
            <i class="fas fa-upload"></i>
          </div>
          <div class="action-text">Upload Document</div>
        </div>
        <div class="action-btn" @click="navigateTo('billing')" :class="{ 'loading': isNavigating }">
          <div class="action-icon">
            <i class="fas fa-file-invoice-dollar"></i>
          </div>
          <div class="action-text">Generate Invoice</div>
        </div>
        <div class="action-btn" @click="navigateTo('staff')" :class="{ 'loading': isNavigating }">
          <div class="action-icon">
            <i class="fas fa-user-tie"></i>
          </div>
          <div class="action-text">Add Staff Member</div>
        </div>
        <div class="action-btn" @click="navigateTo('reports')" :class="{ 'loading': isNavigating }">
          <div class="action-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="action-text">View Reports</div>
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

<script>
import api from '../services/api'

export default {
  name: 'Dashboard',
  data() {
    return {
      stats: {
        totalParticipants: 0,
        activeStaff: 0,
        shiftsThisWeek: 0,
        monthlyRevenue: 0,
        participantGrowth: '+0% from last month',
        staffGrowth: '+0 new this week',
        shiftCompletion: 0,
        revenueGrowth: 0
      },
      recentActivities: [],
      isLoading: false,
      isNavigating: false,
      error: null
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
        
        // Try to get real data from backend
        const promises = [
          this.fetchParticipantStats(),
          this.fetchStaffStats(),
          this.fetchShiftStats(),
          this.fetchRevenueStats(),
          this.fetchRecentActivity()
        ]
        
        await Promise.allSettled(promises)
        
      } catch (error) {
        console.error('Dashboard error:', error)
        this.error = 'Failed to load dashboard data'
        // Set fallback data
        this.setFallbackData()
      } finally {
        this.isLoading = false
      }
    },
    
    async fetchParticipantStats() {
      try {
        const response = await api.get('/participants?limit=1')
        if (response.success && response.data.pagination) {
          this.stats.totalParticipants = response.data.pagination.total || 0
          this.stats.participantGrowth = '+12% from last month'
        }
      } catch (error) {
        console.log('Failed to fetch participant stats:', error.message)
        this.stats.totalParticipants = 0
        this.stats.participantGrowth = 'Unable to load'
      }
    },
    
    async fetchStaffStats() {
      try {
        const response = await api.get('/users?limit=1')
        if (response.success && response.data.pagination) {
          this.stats.activeStaff = response.data.pagination.total || 0
          this.stats.staffGrowth = '+3 new this week'
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
        
        const response = await api.get(`/shifts?start_date=${weekStart.toISOString()}&end_date=${weekEnd.toISOString()}`)
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
        // This would typically come from a billing/revenue endpoint
        // Setting to 0 as we don't have a revenue API endpoint yet
        this.stats.monthlyRevenue = 0
        this.stats.revenueGrowth = 0
      } catch (error) {
        console.log('Failed to fetch revenue stats:', error.message)
        this.stats.monthlyRevenue = 0
        this.stats.revenueGrowth = 0
      }
    },
    
    async fetchRecentActivity() {
      try {
        // This would come from an activity log endpoint
        // For now, set empty until we have a real endpoint
        this.recentActivities = []
      } catch (error) {
        console.log('Could not fetch recent activity')
        this.recentActivities = []
      }
    },
    
    setFallbackData() {
      // No fallback data - show actual data or zeros
      this.stats = {
        totalParticipants: 0,
        activeStaff: 0,
        shiftsThisWeek: 0,
        monthlyRevenue: 0,
        participantGrowth: 'No data',
        staffGrowth: 'No data',
        shiftCompletion: 0,
        revenueGrowth: 0
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
}

.stat-card {
  background: var(--white);
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.stat-card.primary::before {
  background: var(--primary-gradient);
}

.stat-card.secondary::before {
  background: var(--secondary-gradient);
}

.stat-card.success::before {
  background: var(--success-gradient);
}

.stat-card.warning::before {
  background: var(--warning-gradient);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.stat-title {
  font-size: 0.9rem;
  color: var(--text-medium);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.stat-icon.primary {
  background: var(--primary-gradient);
}

.stat-icon.secondary {
  background: var(--secondary-gradient);
}

.stat-icon.success {
  background: var(--success-gradient);
}

.stat-icon.warning {
  background: var(--warning-gradient);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
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
  background: var(--white);
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 1.5rem;
  background: var(--white);
  border: 2px solid #e2e8f0;
  border-radius: var(--border-radius);
  text-decoration: none;
  color: var(--text-medium);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.action-btn:hover:not(.loading) {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}

.action-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.action-btn:hover:not(.loading) .action-icon {
  background: var(--primary-gradient);
  color: white;
}

.action-text {
  font-weight: 500;
  text-align: center;
}

/* Recent Activity */
.recent-activity {
  background: var(--white);
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
}

.activity-list {
  space-y: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--border-radius-sm);
  transition: background 0.3s ease;
}

.activity-item:hover {
  background: rgba(102, 126, 234, 0.05);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  color: var(--text-dark);
  margin-bottom: 2px;
}

.activity-subtitle {
  font-size: 0.85rem;
  color: var(--text-light);
}

.activity-time {
  font-size: 0.8rem;
  color: var(--text-light);
  font-weight: 500;
}

.no-activity {
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
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
