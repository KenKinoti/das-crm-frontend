<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Reports & Analytics</h1>
      <div class="header-actions">
        <select v-model="selectedPeriod" @change="refreshReports" class="period-select">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
          <option value="custom">Custom range</option>
        </select>
        <button @click="exportAllReports" class="btn btn-secondary">
          <i class="fas fa-download"></i>
          Export All
        </button>
        <button @click="showCustomReportModal = true" class="btn btn-primary">
          <i class="fas fa-chart-bar"></i>
          Custom Report
        </button>
      </div>
    </div>

    <!-- Date Range Picker for Custom -->
    <div v-if="selectedPeriod === 'custom'" class="date-range-picker">
      <div class="form-row">
        <div class="form-group">
          <label>From Date</label>
          <input v-model="customDateRange.from" type="date" @change="refreshReports" />
        </div>
        <div class="form-group">
          <label>To Date</label>
          <input v-model="customDateRange.to" type="date" @change="refreshReports" />
        </div>
      </div>
    </div>

    <!-- Overview Stats -->
    <div class="stats-section">
      <h2>Overview</h2>
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon success">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">${{ totalRevenue.toFixed(2) }}</div>
            <div class="stat-label">Total Revenue</div>
            <div class="stat-change positive">+12% vs last period</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon info">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalShifts }}</div>
            <div class="stat-label">Total Shifts</div>
            <div class="stat-change positive">+8% vs last period</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalServiceHours }}h</div>
            <div class="stat-label">Service Hours</div>
            <div class="stat-change positive">+15% vs last period</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon primary">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ activeParticipants }}</div>
            <div class="stat-label">Active Participants</div>
            <div class="stat-change neutral">No change</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Cards -->
    <div class="reports-grid">
      <!-- Financial Reports -->
      <div class="report-card">
        <div class="report-header">
          <div class="report-title">
            <i class="fas fa-chart-line"></i>
            <h3>Financial Performance</h3>
          </div>
          <button @click="exportReport('revenue', 'pdf')" class="btn-small btn-outline">
            <i class="fas fa-download"></i>
            Export
          </button>
        </div>
        <div class="report-content">
          <div class="chart-placeholder">
            <i class="fas fa-chart-line"></i>
            <p>Revenue trends over time</p>
            <div class="chart-summary">
              <div class="summary-item">
                <span class="label">Average Monthly Revenue:</span>
                <span class="value">${{ averageRevenuePerMonth.toFixed(2) }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Growth Rate:</span>
                <span class="value positive">+12.5%</span>
              </div>
            </div>
          </div>
        </div>
        <div class="report-actions">
          <button @click="viewDetailedReport('revenue')" class="btn-link">
            View Detailed Report
          </button>
        </div>
      </div>

      <!-- Service Delivery -->
      <div class="report-card">
        <div class="report-header">
          <div class="report-title">
            <i class="fas fa-clipboard-list"></i>
            <h3>Service Delivery</h3>
          </div>
          <button @click="exportReport('shifts', 'pdf')" class="btn-small btn-outline">
            <i class="fas fa-download"></i>
            Export
          </button>
        </div>
        <div class="report-content">
          <div class="service-breakdown">
            <div class="breakdown-item" v-for="service in topServiceTypes" :key="service.type">
              <div class="service-info">
                <span class="service-name">{{ service.type }}</span>
                <span class="service-count">{{ service.count }} shifts</span>
              </div>
              <div class="service-bar">
                <div class="service-progress" :style="{ width: service.percentage + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="report-actions">
          <button @click="viewDetailedReport('shifts')" class="btn-link">
            View Detailed Report
          </button>
        </div>
      </div>

      <!-- Participant Engagement -->
      <div class="report-card">
        <div class="report-header">
          <div class="report-title">
            <i class="fas fa-user-friends"></i>
            <h3>Participant Engagement</h3>
          </div>
          <button @click="exportReport('participants', 'pdf')" class="btn-small btn-outline">
            <i class="fas fa-download"></i>
            Export
          </button>
        </div>
        <div class="report-content">
          <div class="engagement-metrics">
            <div class="metric-item">
              <div class="metric-label">Active Participants</div>
              <div class="metric-value">{{ participantReport.active_count || 0 }}</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">Average Sessions/Month</div>
              <div class="metric-value">{{ participantReport.avg_sessions || 0 }}</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">Satisfaction Rating</div>
              <div class="metric-value">{{ participantReport.satisfaction_rating || 0 }}/5</div>
            </div>
          </div>
        </div>
        <div class="report-actions">
          <button @click="viewDetailedReport('participants')" class="btn-link">
            View Detailed Report
          </button>
        </div>
      </div>

      <!-- Staff Performance -->
      <div class="report-card">
        <div class="report-header">
          <div class="report-title">
            <i class="fas fa-user-tie"></i>
            <h3>Staff Performance</h3>
          </div>
          <button @click="exportReport('staff', 'pdf')" class="btn-small btn-outline">
            <i class="fas fa-download"></i>
            Export
          </button>
        </div>
        <div class="report-content">
          <div class="staff-metrics">
            <div class="metric-item">
              <div class="metric-label">Active Staff</div>
              <div class="metric-value">{{ staffReport.active_count || 0 }}</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">Avg Hours/Week</div>
              <div class="metric-value">{{ staffReport.avg_hours_per_week || 0 }}h</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">Utilization Rate</div>
              <div class="metric-value">{{ staffReport.utilization_rate || 0 }}%</div>
            </div>
          </div>
        </div>
        <div class="report-actions">
          <button @click="viewDetailedReport('staff')" class="btn-link">
            View Detailed Report
          </button>
        </div>
      </div>

      <!-- Billing Status -->
      <div class="report-card">
        <div class="report-header">
          <div class="report-title">
            <i class="fas fa-file-invoice-dollar"></i>
            <h3>Billing Status</h3>
          </div>
          <button @click="exportReport('billing', 'pdf')" class="btn-small btn-outline">
            <i class="fas fa-download"></i>
            Export
          </button>
        </div>
        <div class="report-content">
          <div class="billing-summary">
            <div class="billing-item paid">
              <div class="billing-label">Paid Invoices</div>
              <div class="billing-value">{{ billingReport.paid_count || 0 }}</div>
              <div class="billing-amount">${{ billingReport.paid_amount || 0 }}</div>
            </div>
            <div class="billing-item pending">
              <div class="billing-label">Pending</div>
              <div class="billing-value">{{ billingReport.pending_count || 0 }}</div>
              <div class="billing-amount">${{ billingReport.pending_amount || 0 }}</div>
            </div>
            <div class="billing-item overdue">
              <div class="billing-label">Overdue</div>
              <div class="billing-value">{{ billingReport.overdue_count || 0 }}</div>
              <div class="billing-amount">${{ billingReport.overdue_amount || 0 }}</div>
            </div>
          </div>
        </div>
        <div class="report-actions">
          <button @click="viewDetailedReport('billing')" class="btn-link">
            View Detailed Report
          </button>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="report-card">
        <div class="report-header">
          <div class="report-title">
            <i class="fas fa-cog"></i>
            <h3>Quick Actions</h3>
          </div>
        </div>
        <div class="report-content">
          <div class="quick-actions">
            <button @click="generateMonthlyReport" class="action-btn">
              <i class="fas fa-calendar"></i>
              <span>Generate Monthly Report</span>
            </button>
            <button @click="scheduledReports" class="action-btn">
              <i class="fas fa-clock"></i>
              <span>Scheduled Reports</span>
            </button>
            <button @click="reportTemplates" class="action-btn">
              <i class="fas fa-template"></i>
              <span>Report Templates</span>
            </button>
            <button @click="exportData" class="action-btn">
              <i class="fas fa-database"></i>
              <span>Export Raw Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading reports...</p>
    </div>

    <!-- Custom Report Modal -->
    <div v-if="showCustomReportModal" class="modal-overlay" @click="closeCustomReportModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Create Custom Report</h3>
          <button @click="closeCustomReportModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="generateCustomReport">
            <div class="form-row">
              <div class="form-group">
                <label>Report Name *</label>
                <input v-model="customReport.name" type="text" required placeholder="Enter report name" />
              </div>
              <div class="form-group">
                <label>Report Type *</label>
                <select v-model="customReport.type" required>
                  <option value="">Select Type</option>
                  <option value="financial">Financial</option>
                  <option value="service">Service Delivery</option>
                  <option value="participant">Participant</option>
                  <option value="staff">Staff</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Date Range *</label>
                <div class="date-inputs">
                  <input v-model="customReport.start_date" type="date" required />
                  <span>to</span>
                  <input v-model="customReport.end_date" type="date" required />
                </div>
              </div>
              <div class="form-group">
                <label>Format *</label>
                <select v-model="customReport.format" required>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Metrics to Include</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input v-model="customReport.metrics" type="checkbox" value="revenue" />
                  Revenue & Financial Data
                </label>
                <label class="checkbox-label">
                  <input v-model="customReport.metrics" type="checkbox" value="shifts" />
                  Shift & Service Data
                </label>
                <label class="checkbox-label">
                  <input v-model="customReport.metrics" type="checkbox" value="participants" />
                  Participant Data
                </label>
                <label class="checkbox-label">
                  <input v-model="customReport.metrics" type="checkbox" value="staff" />
                  Staff Performance
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Additional Notes</label>
              <textarea 
                v-model="customReport.notes" 
                rows="3" 
                placeholder="Any additional requirements or notes..."
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeCustomReportModal" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="isGeneratingReport">
                <span v-if="isGeneratingReport">
                  <i class="fas fa-spinner fa-spin"></i>
                  Generating...
                </span>
                <span v-else>
                  <i class="fas fa-chart-bar"></i>
                  Generate Report
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useReportsStore } from '../stores/reports'

export default {
  name: 'Reports',
  data() {
    return {
      selectedPeriod: '30',
      customDateRange: {
        from: '',
        to: ''
      },
      showCustomReportModal: false,
      isGeneratingReport: false,
      customReport: {
        name: '',
        type: '',
        start_date: '',
        end_date: '',
        format: 'pdf',
        metrics: [],
        notes: ''
      }
    }
  },
  computed: {
    ...mapState(useReportsStore, [
      'dashboardStats', 'revenueReport', 'billingReport', 'shiftsReport', 
      'serviceHoursReport', 'participantReport', 'staffReport', 'isLoading', 'error'
    ]),
    
    totalRevenue() {
      return this.revenueReport.total || 0
    },
    
    totalShifts() {
      return this.shiftsReport.total_shifts || 0
    },
    
    totalServiceHours() {
      return this.serviceHoursReport.total_hours || 0
    },
    
    activeParticipants() {
      return this.participantReport.active_count || 0
    },
    
    averageRevenuePerMonth() {
      const revenue = this.revenueReport.monthly_data || []
      if (revenue.length === 0) return 0
      const total = revenue.reduce((sum, month) => sum + (month.revenue || 0), 0)
      return total / revenue.length
    },
    
    topServiceTypes() {
      const services = this.shiftsReport.service_breakdown || []
      const total = services.reduce((sum, service) => sum + service.count, 0)
      return services.map(service => ({
        ...service,
        percentage: total > 0 ? (service.count / total) * 100 : 0
      }))
    }
  },
  async mounted() {
    await this.loadReports()
  },
  methods: {
    ...mapActions(useReportsStore, [
      'fetchAllReports', 'fetchRevenueReport', 'fetchBillingReport', 
      'fetchShiftsReport', 'fetchServiceHoursReport', 'fetchParticipantReport', 
      'fetchStaffReport', 'generateCustomReport', 'exportReport'
    ]),
    
    async loadReports() {
      try {
        const params = this.getDateRangeParams()
        await this.fetchAllReports(params)
      } catch (error) {
        console.error('Error loading reports:', error)
        this.showErrorMessage('Failed to load reports. Please refresh the page.')
      }
    },
    
    async refreshReports() {
      await this.loadReports()
    },
    
    getDateRangeParams() {
      if (this.selectedPeriod === 'custom') {
        return {
          start_date: this.customDateRange.from,
          end_date: this.customDateRange.to
        }
      } else {
        const days = parseInt(this.selectedPeriod)
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        
        return {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        }
      }
    },
    
    async exportReport(reportType, format = 'pdf') {
      try {
        const params = this.getDateRangeParams()
        const response = await this.exportReport(reportType, params, format)
        
        const blob = response.data
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${reportType}-report.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        this.showSuccessMessage(`${reportType} report exported successfully!`)
      } catch (error) {
        console.error('Error exporting report:', error)
        this.showErrorMessage('Error exporting report. Please try again.')
      }
    },
    
    async exportAllReports() {
      try {
        const reportTypes = ['revenue', 'billing', 'shifts', 'participants', 'staff']
        const params = this.getDateRangeParams()
        
        for (const reportType of reportTypes) {
          await this.exportReport(reportType, 'pdf')
        }
        
        this.showSuccessMessage('All reports exported successfully!')
      } catch (error) {
        console.error('Error exporting all reports:', error)
        this.showErrorMessage('Error exporting reports. Please try again.')
      }
    },
    
    viewDetailedReport(reportType) {
      alert(`Detailed ${reportType} report view - Coming soon!`)
    },
    
    generateMonthlyReport() {
      alert('Generate monthly report - Coming soon!')
    },
    
    scheduledReports() {
      alert('Scheduled reports management - Coming soon!')
    },
    
    reportTemplates() {
      alert('Report templates - Coming soon!')
    },
    
    exportData() {
      alert('Export raw data - Coming soon!')
    },
    
    async generateCustomReport() {
      this.isGeneratingReport = true
      try {
        const reportConfig = {
          ...this.customReport,
          start_date: this.customReport.start_date + 'T00:00:00Z',
          end_date: this.customReport.end_date + 'T23:59:59Z'
        }
        
        const response = await this.generateCustomReport(reportConfig)
        
        // Download the generated report
        const blob = response.data
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${this.customReport.name}.${this.customReport.format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        this.closeCustomReportModal()
        this.showSuccessMessage('Custom report generated successfully!')
        
      } catch (error) {
        console.error('Error generating custom report:', error)
        this.showErrorMessage('Error generating custom report. Please try again.')
      } finally {
        this.isGeneratingReport = false
      }
    },
    
    closeCustomReportModal() {
      this.showCustomReportModal = false
      this.resetCustomReportForm()
    },
    
    resetCustomReportForm() {
      this.customReport = {
        name: '',
        type: '',
        start_date: '',
        end_date: '',
        format: 'pdf',
        metrics: [],
        notes: ''
      }
    },
    
    showSuccessMessage(message) {
      const notification = document.createElement('div')
      notification.className = 'success-notification'
      notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.remove()
      }, 3000)
    },
    
    showErrorMessage(message) {
      const notification = document.createElement('div')
      notification.className = 'error-notification'
      notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.remove()
      }, 3000)
    }
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-dark);
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.period-select {
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: var(--border-radius-sm);
  background: white;
  cursor: pointer;
}

.date-range-picker {
  background: var(--white);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  margin-bottom: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-dark);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: var(--border-radius-sm);
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.stats-section {
  margin-bottom: 2rem;
}

.stats-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 1rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: var(--white);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.stat-icon.success {
  background: var(--success-gradient);
}

.stat-icon.warning {
  background: var(--warning-gradient);
}

.stat-icon.info {
  background: var(--info-gradient);
}

.stat-icon.primary {
  background: var(--primary-gradient);
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-medium);
  margin-bottom: 0.5rem;
}

.stat-change {
  font-size: 0.8rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.negative {
  color: #ef4444;
}

.stat-change.neutral {
  color: var(--text-light);
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.report-card {
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.report-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.report-title i {
  color: var(--primary-color);
  font-size: 1.2rem;
}

.report-title h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
}

.report-content {
  padding: 1.5rem;
}

.chart-placeholder {
  text-align: center;
  padding: 2rem;
  background: #f8fafc;
  border-radius: var(--border-radius-sm);
  margin-bottom: 1rem;
}

.chart-placeholder i {
  font-size: 3rem;
  color: var(--text-light);
  margin-bottom: 1rem;
}

.chart-placeholder p {
  color: var(--text-medium);
  margin-bottom: 1rem;
}

.chart-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.summary-item .label {
  color: var(--text-medium);
}

.summary-item .value {
  font-weight: 600;
  color: var(--text-dark);
}

.summary-item .value.positive {
  color: #10b981;
}

.service-breakdown {
  space-y: 1rem;
}

.breakdown-item {
  margin-bottom: 1rem;
}

.service-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.service-name {
  font-weight: 500;
  color: var(--text-dark);
}

.service-count {
  font-size: 0.9rem;
  color: var(--text-medium);
}

.service-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.service-progress {
  height: 100%;
  background: var(--primary-gradient);
  transition: width 0.3s ease;
}

.engagement-metrics,
.staff-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.metric-item {
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: var(--border-radius-sm);
}

.metric-label {
  font-size: 0.8rem;
  color: var(--text-medium);
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
}

.billing-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
}

.billing-item {
  text-align: center;
  padding: 1rem;
  border-radius: var(--border-radius-sm);
}

.billing-item.paid {
  background: #d1fae5;
}

.billing-item.pending {
  background: #fef3c7;
}

.billing-item.overdue {
  background: #fee2e2;
}

.billing-label {
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.billing-value {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.billing-amount {
  font-size: 0.9rem;
  color: var(--text-medium);
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.action-btn {
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: var(--border-radius-sm);
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.action-btn:hover {
  border-color: var(--primary-color);
  background: rgba(102, 126, 234, 0.05);
}

.action-btn i {
  color: var(--primary-color);
  font-size: 1.1rem;
}

.action-btn span {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-dark);
}

.report-actions {
  padding: 0 1.5rem 1.5rem;
  text-align: center;
}

.btn-link {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
}

.btn-link:hover {
  color: var(--primary-hover);
}

.btn-small {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-outline {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: var(--text-medium);
}

.btn-outline:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(102, 126, 234, 0.1);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin-bottom: 1rem;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-medium);
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow: auto;
}

.modal-content.large {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-light);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: var(--text-dark);
  background: #f1f5f9;
}

.modal-body {
  padding: 1.5rem;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.date-inputs span {
  color: var(--text-medium);
  font-size: 0.9rem;
}

.checkbox-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius-sm);
  transition: background 0.3s ease;
}

.checkbox-label:hover {
  background: #f8fafc;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: var(--primary-gradient);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f1f5f9;
  color: var(--text-medium);
}

.btn-secondary:hover {
  background: #e2e8f0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Success and Error notifications */
:global(.success-notification) {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

:global(.error-notification) {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #dc2626;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .chart-summary,
  .engagement-metrics,
  .staff-metrics,
  .billing-summary {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .checkbox-group {
    grid-template-columns: 1fr;
  }

  .date-inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>