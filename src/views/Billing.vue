<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Billing & Invoices</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Create Invoice
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon success">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">${{ totalRevenue.toFixed(2) }}</div>
          <div class="stat-label">Total Revenue</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">${{ pendingRevenue.toFixed(2) }}</div>
          <div class="stat-label">Pending Revenue</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon danger">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ overdueBills.length }}</div>
          <div class="stat-label">Overdue Invoices</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon info">
          <i class="fas fa-file-invoice"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ bills.length }}</div>
          <div class="stat-label">Total Invoices</div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="filters-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search invoices..."
          @input="filterBills"
        />
      </div>
      <div class="filter-controls">
        <select v-model="statusFilter" @change="filterBills">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select v-model="participantFilter" @change="filterBills">
          <option value="">All Participants</option>
          <option v-for="participant in participants" :key="participant.id" :value="participant.id">
            {{ participant.first_name }} {{ participant.last_name }}
          </option>
        </select>
        <input 
          v-model="dateFromFilter" 
          type="date" 
          @change="filterBills"
          placeholder="From Date"
        />
        <input 
          v-model="dateToFilter" 
          type="date" 
          @change="filterBills"
          placeholder="To Date"
        />
      </div>
    </div>

    <!-- Billing List -->
    <div class="content-card">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading billing records...</p>
      </div>

      <div v-else-if="filteredBills.length === 0 && !searchQuery" class="empty-state">
        <i class="fas fa-file-invoice"></i>
        <h3>No Invoices Found</h3>
        <p>Start by creating your first invoice</p>
        <button @click="showCreateModal = true" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Create First Invoice
        </button>
      </div>

      <div v-else-if="filteredBills.length === 0 && searchQuery" class="empty-state">
        <i class="fas fa-search"></i>
        <h3>No Results Found</h3>
        <p>Try adjusting your search criteria</p>
      </div>

      <div v-else class="billing-grid">
        <div v-for="bill in filteredBills" :key="bill.id" class="billing-card">
          <div class="billing-header">
            <div class="billing-info">
              <h4 class="billing-number">Invoice #{{ bill.invoice_number || bill.id }}</h4>
              <p class="billing-participant">{{ getParticipantName(bill.participant_id) }}</p>
            </div>
            <div class="billing-status">
              <span :class="['status-badge', getStatusClass(bill.status)]">
                {{ formatStatus(bill.status) }}
              </span>
            </div>
          </div>
          
          <div class="billing-details">
            <div class="detail-row">
              <div class="detail-item">
                <i class="fas fa-calendar"></i>
                <span><strong>Issue Date:</strong> {{ formatDate(bill.issue_date) }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-calendar-times"></i>
                <span><strong>Due Date:</strong> {{ formatDate(bill.due_date) }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <i class="fas fa-clock"></i>
                <span><strong>Period:</strong> {{ formatDateRange(bill.service_period_start, bill.service_period_end) }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-dollar-sign"></i>
                <span><strong>Amount:</strong> ${{ parseFloat(bill.total_amount || 0).toFixed(2) }}</span>
              </div>
            </div>
            <div v-if="bill.description" class="detail-item description">
              <i class="fas fa-info-circle"></i>
              <span><strong>Description:</strong> {{ bill.description }}</span>
            </div>
            <div v-if="bill.payment_date && bill.status === 'paid'" class="detail-item paid">
              <i class="fas fa-check-circle"></i>
              <span><strong>Paid on:</strong> {{ formatDate(bill.payment_date) }}</span>
            </div>
          </div>

          <div class="billing-actions">
            <button @click="viewBill(bill)" class="btn-small btn-outline">
              <i class="fas fa-eye"></i>
              View
            </button>
            <button @click="downloadInvoice(bill)" class="btn-small btn-outline">
              <i class="fas fa-download"></i>
              Download
            </button>
            <button 
              v-if="bill.status === 'pending' || bill.status === 'overdue'" 
              @click="markAsPaid(bill)" 
              class="btn-small btn-success"
            >
              <i class="fas fa-check"></i>
              Mark Paid
            </button>
            <button @click="editBill(bill)" class="btn-small btn-outline">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button @click="deleteBill(bill)" class="btn-small btn-danger">
              <i class="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Invoice Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Create New Invoice</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createInvoice">
            <div class="form-row">
              <div class="form-group">
                <label>Participant *</label>
                <select v-model="newInvoice.participant_id" required>
                  <option value="">Select Participant</option>
                  <option v-for="participant in participants" :key="participant.id" :value="participant.id">
                    {{ participant.first_name }} {{ participant.last_name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Invoice Number</label>
                <input v-model="newInvoice.invoice_number" type="text" placeholder="Auto-generated if empty" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Issue Date *</label>
                <input v-model="newInvoice.issue_date" type="date" required />
              </div>
              <div class="form-group">
                <label>Due Date *</label>
                <input v-model="newInvoice.due_date" type="date" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Service Period Start *</label>
                <input v-model="newInvoice.service_period_start" type="date" required />
              </div>
              <div class="form-group">
                <label>Service Period End *</label>
                <input v-model="newInvoice.service_period_end" type="date" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Subtotal ($) *</label>
                <input v-model="newInvoice.subtotal" type="number" step="0.01" min="0" required @input="calculateTotal" />
              </div>
              <div class="form-group">
                <label>Tax Rate (%)</label>
                <input v-model="newInvoice.tax_rate" type="number" step="0.01" min="0" max="100" @input="calculateTotal" placeholder="10.00" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Tax Amount ($)</label>
                <input v-model="newInvoice.tax_amount" type="number" step="0.01" min="0" readonly />
              </div>
              <div class="form-group">
                <label>Total Amount ($)</label>
                <input v-model="newInvoice.total_amount" type="number" step="0.01" min="0" readonly />
              </div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea 
                v-model="newInvoice.description" 
                rows="3" 
                placeholder="Service description or notes..."
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="isCreating">
                <span v-if="isCreating">
                  <i class="fas fa-spinner fa-spin"></i>
                  Creating...
                </span>
                <span v-else>
                  <i class="fas fa-plus"></i>
                  Create Invoice
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
import { mapState, mapActions, mapGetters } from 'pinia'
import { useBillingStore } from '../stores/billing'
import { useParticipantsStore } from '../stores/participants'

export default {
  name: 'Billing',
  data() {
    return {
      filteredBills: [],
      searchQuery: '',
      statusFilter: '',
      participantFilter: '',
      dateFromFilter: '',
      dateToFilter: '',
      showCreateModal: false,
      isCreating: false,
      newInvoice: {
        participant_id: '',
        invoice_number: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        service_period_start: '',
        service_period_end: '',
        subtotal: 0,
        tax_rate: 10.00,
        tax_amount: 0,
        total_amount: 0,
        description: ''
      }
    }
  },
  computed: {
    ...mapState(useBillingStore, ['bills', 'isLoading', 'error']),
    ...mapGetters(useBillingStore, ['paidBills', 'unpaidBills', 'overdueBills', 'totalRevenue', 'pendingRevenue']),
    ...mapState(useParticipantsStore, { participants: 'participants' })
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    ...mapActions(useBillingStore, ['fetchBills', 'createBill', 'updateBill', 'deleteBill', 'markAsPaid', 'downloadInvoice']),
    ...mapActions(useParticipantsStore, ['fetchParticipants']),
    
    async loadData() {
      try {
        await Promise.all([
          this.fetchBills(),
          this.fetchParticipants()
        ])
        this.filterBills()
      } catch (error) {
        console.error('Error loading data:', error)
        this.showErrorMessage('Failed to load data. Please refresh the page.')
      }
    },

    filterBills() {
      let filtered = [...this.bills]
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(bill => {
          const participant = this.getParticipantName(bill.participant_id)
          const invoiceNumber = bill.invoice_number || bill.id.toString()
          return participant.toLowerCase().includes(query) ||
                 invoiceNumber.toLowerCase().includes(query) ||
                 bill.description?.toLowerCase().includes(query)
        })
      }
      
      if (this.statusFilter) {
        if (this.statusFilter === 'overdue') {
          filtered = filtered.filter(bill => {
            return bill.status === 'pending' && new Date(bill.due_date) < new Date()
          })
        } else {
          filtered = filtered.filter(bill => bill.status === this.statusFilter)
        }
      }

      if (this.participantFilter) {
        filtered = filtered.filter(bill => bill.participant_id == this.participantFilter)
      }

      if (this.dateFromFilter) {
        filtered = filtered.filter(bill => new Date(bill.issue_date) >= new Date(this.dateFromFilter))
      }

      if (this.dateToFilter) {
        filtered = filtered.filter(bill => new Date(bill.issue_date) <= new Date(this.dateToFilter))
      }
      
      // Sort by issue date (newest first)
      filtered.sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date))
      
      this.filteredBills = filtered
    },

    calculateTotal() {
      const subtotal = parseFloat(this.newInvoice.subtotal) || 0
      const taxRate = parseFloat(this.newInvoice.tax_rate) || 0
      const taxAmount = (subtotal * taxRate) / 100
      
      this.newInvoice.tax_amount = taxAmount.toFixed(2)
      this.newInvoice.total_amount = (subtotal + taxAmount).toFixed(2)
    },

    async createInvoice() {
      this.isCreating = true
      try {
        const invoiceData = {
          ...this.newInvoice,
          participant_id: parseInt(this.newInvoice.participant_id),
          issue_date: this.newInvoice.issue_date + 'T00:00:00Z',
          due_date: this.newInvoice.due_date + 'T23:59:59Z',
          service_period_start: this.newInvoice.service_period_start + 'T00:00:00Z',
          service_period_end: this.newInvoice.service_period_end + 'T23:59:59Z',
          subtotal: parseFloat(this.newInvoice.subtotal),
          tax_rate: parseFloat(this.newInvoice.tax_rate),
          tax_amount: parseFloat(this.newInvoice.tax_amount),
          total_amount: parseFloat(this.newInvoice.total_amount),
          status: 'pending'
        }
        
        await this.createBill(invoiceData)
        this.filterBills()
        this.closeModal()
        this.showSuccessMessage('Invoice created successfully!')
        
      } catch (error) {
        console.error('Error creating invoice:', error)
        this.showErrorMessage('Error creating invoice. Please try again.')
      } finally {
        this.isCreating = false
      }
    },

    async markAsPaid(bill) {
      if (confirm(`Mark invoice #${bill.invoice_number || bill.id} as paid?`)) {
        try {
          const paymentData = {
            payment_date: new Date().toISOString(),
            payment_method: 'manual', // Could be expanded to show a form
            status: 'paid'
          }
          await this.markAsPaid(bill.id, paymentData)
          this.filterBills()
          this.showSuccessMessage('Invoice marked as paid!')
        } catch (error) {
          console.error('Error marking as paid:', error)
          this.showErrorMessage('Error marking invoice as paid. Please try again.')
        }
      }
    },

    async downloadInvoice(bill) {
      try {
        const response = await this.downloadInvoice(bill.id)
        const blob = response.data
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `invoice-${bill.invoice_number || bill.id}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        this.showSuccessMessage('Invoice downloaded successfully!')
      } catch (error) {
        console.error('Error downloading invoice:', error)
        this.showErrorMessage('Error downloading invoice. Please try again.')
      }
    },

    viewBill(bill) {
      const participant = this.getParticipantName(bill.participant_id)
      const status = this.formatStatus(bill.status)
      const amount = parseFloat(bill.total_amount || 0).toFixed(2)
      const period = this.formatDateRange(bill.service_period_start, bill.service_period_end)
      
      alert(`📄 Invoice #${bill.invoice_number || bill.id}\n👤 Participant: ${participant}\n💰 Amount: $${amount}\n📊 Status: ${status}\n📅 Issue Date: ${this.formatDate(bill.issue_date)}\n📅 Due Date: ${this.formatDate(bill.due_date)}\n📅 Service Period: ${period}${bill.description ? '\n📝 Description: ' + bill.description : ''}`)
    },

    editBill(bill) {
      alert(`Edit functionality for invoice #${bill.invoice_number || bill.id} - Coming soon!`)
    },

    async deleteBill(bill) {
      if (confirm(`Are you sure you want to delete invoice #${bill.invoice_number || bill.id}? This action cannot be undone.`)) {
        try {
          await this.deleteBill(bill.id)
          this.filterBills()
          this.showSuccessMessage('Invoice deleted successfully!')
        } catch (error) {
          console.error('Error deleting invoice:', error)
          this.showErrorMessage('Error deleting invoice. Please try again.')
        }
      }
    },

    closeModal() {
      this.showCreateModal = false
      this.resetForm()
    },

    resetForm() {
      // Set due date to 30 days from issue date
      const issueDate = new Date()
      const dueDate = new Date(issueDate)
      dueDate.setDate(dueDate.getDate() + 30)
      
      this.newInvoice = {
        participant_id: '',
        invoice_number: '',
        issue_date: issueDate.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        service_period_start: '',
        service_period_end: '',
        subtotal: 0,
        tax_rate: 10.00,
        tax_amount: 0,
        total_amount: 0,
        description: ''
      }
    },

    getParticipantName(participantId) {
      const participant = this.participants.find(p => p.id === participantId)
      return participant ? `${participant.first_name} ${participant.last_name}` : 'Unknown Participant'
    },

    getStatusClass(status) {
      const statusMap = {
        'pending': 'pending',
        'paid': 'paid',
        'cancelled': 'cancelled',
        'overdue': 'overdue'
      }
      return statusMap[status] || 'pending'
    },

    formatStatus(status) {
      const statusMap = {
        'pending': 'Pending',
        'paid': 'Paid',
        'cancelled': 'Cancelled',
        'overdue': 'Overdue'
      }
      return statusMap[status] || status
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    },

    formatDateRange(startDate, endDate) {
      return `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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

.stat-icon.danger {
  background: var(--danger-gradient);
}

.stat-icon.info {
  background: var(--info-gradient);
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-dark);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-medium);
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
}

.search-box input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 2px solid #e2e8f0;
  border-radius: var(--border-radius-sm);
  transition: border-color 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-controls select,
.filter-controls input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: var(--border-radius-sm);
  background: white;
  cursor: pointer;
  min-width: 120px;
}

.content-card {
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  padding: 2rem;
}

.billing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 1.5rem;
}

.billing-card {
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.billing-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-soft);
  transform: translateY(-2px);
}

.billing-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.billing-info {
  flex: 1;
}

.billing-number {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 0.25rem 0;
}

.billing-participant {
  font-size: 0.9rem;
  color: var(--text-medium);
  margin: 0;
}

.billing-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.paid {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.overdue {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.cancelled {
  background: #f3f4f6;
  color: #6b7280;
}

.billing-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-medium);
}

.detail-item i {
  width: 16px;
  color: var(--text-light);
  flex-shrink: 0;
}

.detail-item.description,
.detail-item.paid {
  grid-column: 1 / -1;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: var(--border-radius-sm);
  margin-top: 0.5rem;
}

.detail-item.paid {
  background: #d1fae5;
}

.billing-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

.btn-success {
  background: var(--success-gradient);
  color: white;
}

.btn-success:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-soft);
}

.btn-danger {
  background: transparent;
  border: 1px solid #fee2e2;
  color: #dc2626;
}

.btn-danger:hover {
  background: #dc2626;
  color: white;
}

/* Loading and Empty states */
.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
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

.empty-state i {
  font-size: 4rem;
  color: var(--text-light);
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-medium);
  margin-bottom: 2rem;
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
  z-index: 1000;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
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
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input[readonly] {
  background-color: #f8fafc;
  color: var(--text-medium);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
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

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .filter-controls {
    flex-direction: column;
  }

  .billing-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .billing-actions {
    justify-content: center;
  }

  .detail-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style>