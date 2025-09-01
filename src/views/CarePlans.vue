<template>
  <PageTemplate
    title="Care Plans Management"
    description="Manage participant care plans, approvals, and service objectives"
    icon="fa-clipboard-list"
    :stats="statsCards"
    :search-placeholder="'Search care plans...'"
    :search-query="searchQuery"
    @search="searchQuery = $event"
    :show-add-button="true"
    @add="showCreateModal = true"
    add-button-text="Create Care Plan"
  >
    <template #filters>
      <select v-model="statusFilter" @change="filterPlans" class="form-select">
        <option value="">All Status</option>
        <option value="active">Active Plans</option>
        <option value="pending_approval">Pending Approval</option>
        <option value="draft">Draft Plans</option>
        <option value="expired">Expired Plans</option>
        <option value="cancelled">Cancelled Plans</option>
      </select>
      
      <button @click="clearFilters" class="btn btn-outline-secondary">
        <i class="fas fa-times"></i>
        Clear Filters
      </button>
      
      <div class="btn-group" role="group">
        <button 
          @click="currentView = 'list'" 
          :class="['btn', currentView === 'list' ? 'btn-primary' : 'btn-outline-primary']"
          title="List View"
        >
          <i class="fas fa-list"></i>
        </button>
        <button 
          @click="currentView = 'grid'" 
          :class="['btn', currentView === 'grid' ? 'btn-primary' : 'btn-outline-primary']"
          title="Grid View"
        >
          <i class="fas fa-th"></i>
        </button>
      </div>
    </template>

    <template #content>
      <div class="care-plans-content">
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading care plans...</p>
        </div>

        <div v-else-if="filteredCarePlans.length" class="care-plans-grid">
      <div v-for="plan in filteredCarePlans" :key="plan.id" class="care-plan-card">
        <div class="plan-header">
          <div class="plan-info">
            <h3>{{ getParticipantName(plan.participant_id) }}</h3>
            <div class="plan-meta">
              <span class="plan-id">#{{ plan.id }}</span>
              <span class="plan-date">{{ formatDate(plan.created_at) }}</span>
            </div>
          </div>
          <div class="plan-status">
            <span class="status-badge" :class="plan.status">
              {{ getStatusLabel(plan.status) }}
            </span>
          </div>
        </div>
        
        <div class="plan-content">
          <div class="plan-details">
            <div class="detail-item">
              <i class="fas fa-calendar-range"></i>
              <span>{{ formatDateRange(plan.start_date, plan.end_date) }}</span>
            </div>
            
            <div v-if="plan.budget_amount" class="detail-item">
              <i class="fas fa-dollar-sign"></i>
              <span>${{ formatCurrency(plan.budget_amount) }} budget</span>
            </div>
            
            <div class="detail-item">
              <i class="fas fa-tasks"></i>
              <span>{{ plan.goals?.length || 0 }} goals</span>
            </div>
            
            <div class="detail-item">
              <i class="fas fa-handshake"></i>
              <span>{{ plan.services?.length || 0 }} services</span>
            </div>
          </div>
          
          <div v-if="plan.description" class="plan-description">
            {{ plan.description }}
          </div>
          
          <div class="progress-section">
            <div class="progress-label">
              <span>Plan Progress</span>
              <span>{{ calculateProgress(plan) }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: calculateProgress(plan) + '%' }"></div>
            </div>
          </div>
        </div>
        
        <div class="plan-actions">
          <button @click="viewPlan(plan)" class="btn-mini btn-info" title="View Details">
            View
          </button>
          
          <button @click="editPlan(plan)" class="btn-mini btn-edit" title="Edit Plan">
            <i class="fas fa-edit"></i>
          </button>
          
          <button 
            v-if="plan.status === 'pending_approval'" 
            @click="approvePlan(plan)" 
            class="btn-mini btn-success" 
            title="Approve"
          >
            <i class="fas fa-check"></i>
          </button>
          
          <button 
            v-if="plan.status === 'active'"
            @click="showReviewModal(plan)" 
            class="btn-mini btn-info" 
            title="Review"
          >
            <i class="fas fa-clipboard-check"></i>
          </button>
          
          <button @click="duplicatePlan(plan)" class="btn-mini btn-warning" title="Duplicate">
            <i class="fas fa-copy"></i>
          </button>
          
          <button 
            v-if="['draft', 'cancelled'].includes(plan.status)"
            @click="deletePlan(plan)" 
            class="btn-mini btn-delete" 
            title="Delete"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
        </div>

        <div v-else class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-clipboard-list"></i>
      </div>
      <h3>No Care Plans Found</h3>
      <p>{{ searchQuery ? 'No care plans match your search criteria.' : 'Get started by creating your first care plan.' }}</p>
          <button v-if="!searchQuery" @click="showCreateModal = true" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Create First Care Plan
          </button>
        </div>
      </div>
    </template>
  </PageTemplate>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-clipboard-list"></i>
            {{ showEditModal ? 'Edit Care Plan' : 'Create New Care Plan' }}
          </h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="form-section">
              <h4>Basic Information</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Participant *</label>
                  <select v-model="form.participant_id" required>
                    <option value="">Select participant</option>
                    <option v-for="participant in participants" :key="participant.id" :value="participant.id">
                      {{ participant.first_name }} {{ participant.last_name }}
                    </option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Plan Type *</label>
                  <select v-model="form.plan_type" required>
                    <option value="standard">Standard Plan</option>
                    <option value="intensive">Intensive Support</option>
                    <option value="community">Community Access</option>
                    <option value="respite">Respite Care</option>
                    <option value="employment">Employment Support</option>
                  </select>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Start Date *</label>
                  <input v-model="form.start_date" type="date" required />
                </div>
                
                <div class="form-group">
                  <label>End Date *</label>
                  <input v-model="form.end_date" type="date" required />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Budget Amount</label>
                  <input v-model="form.budget_amount" type="number" step="0.01" placeholder="0.00" />
                </div>
                
                <div class="form-group">
                  <label>Review Frequency</label>
                  <select v-model="form.review_frequency">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="biannually">Bi-annually</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label>Description</label>
                <textarea v-model="form.description" rows="3" placeholder="Care plan overview and objectives..."></textarea>
              </div>
            </div>
            
            <div class="form-section">
              <h4>Goals & Objectives</h4>
              <div class="dynamic-list">
                <div v-for="(goal, index) in form.goals" :key="index" class="goal-item">
                  <div class="form-row">
                    <div class="form-group flex-2">
                      <input v-model="goal.title" placeholder="Goal title" />
                    </div>
                    <div class="form-group">
                      <select v-model="goal.category">
                        <option value="independence">Independence</option>
                        <option value="social">Social Skills</option>
                        <option value="employment">Employment</option>
                        <option value="health">Health & Wellbeing</option>
                        <option value="community">Community Access</option>
                      </select>
                    </div>
                    <button @click="removeGoal(index)" class="btn-mini btn-delete">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                  <div class="form-group">
                    <textarea v-model="goal.description" rows="2" placeholder="Goal description and success criteria..."></textarea>
                  </div>
                </div>
                
                <button @click="addGoal" type="button" class="btn btn-outline">
                  <i class="fas fa-plus"></i>
                  Add Goal
                </button>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn btn-cancel">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting">
                  <i class="fas fa-spinner fa-spin"></i>
                  {{ showEditModal ? 'Updating...' : 'Creating...' }}
                </span>
                <span v-else>
                  <i class="fas fa-save"></i>
                  {{ showEditModal ? 'Update Plan' : 'Create Plan' }}
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
import { useCarePlansStore } from '../stores/carePlans'
import { useParticipantsStore } from '../stores/participants'
import { performanceMixin } from '../mixins/performance'
import { showSuccessModal, showErrorModal, showViewModal } from '../utils/errorHandler'
import { debounce } from '../utils/performance'
import PageTemplate from '../components/PageTemplate.vue'

export default {
  name: 'CarePlans',
  components: {
    PageTemplate
  },
  mixins: [performanceMixin],
  
  data() {
    return {
      searchQuery: '',
      statusFilter: '',
      currentView: 'list',
      showCreateModal: false,
      showEditModal: false,
      currentPlan: null,
      isSubmitting: false,
      form: {
        participant_id: '',
        plan_type: 'standard',
        start_date: '',
        end_date: '',
        budget_amount: '',
        review_frequency: 'quarterly',
        description: '',
        goals: []
      },
      debouncedSearch: null
    }
  },
  
  computed: {
    ...mapState(useCarePlansStore, ['carePlans', 'isLoading', 'error']),
    ...mapGetters(useCarePlansStore, ['activePlans', 'pendingApproval']),
    ...mapState(useParticipantsStore, { participants: 'participants' }),
    
    filteredCarePlans() {
      let filtered = [...this.carePlans]
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(plan => {
          const participant = this.getParticipantName(plan.participant_id).toLowerCase()
          const description = (plan.description || '').toLowerCase()
          return participant.includes(query) || description.includes(query) || plan.id.toString().includes(query)
        })
      }
      
      if (this.statusFilter) {
        filtered = filtered.filter(plan => plan.status === this.statusFilter)
      }
      
      if (this.participantFilter) {
        filtered = filtered.filter(plan => plan.participant_id === this.participantFilter)
      }
      
      return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    },
    
    expiringPlans() {
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      
      return this.activePlans.filter(plan => {
        const endDate = new Date(plan.end_date)
        return endDate <= nextMonth
      })
    },
    
    completionRate() {
      if (!this.activePlans.length) return 0
      const totalProgress = this.activePlans.reduce((sum, plan) => sum + this.calculateProgress(plan), 0)
      return Math.round(totalProgress / this.activePlans.length)
    },

    statsCards() {
      return [
        {
          title: 'Active Plans',
          value: this.activePlans.length,
          icon: 'fa-clipboard-check',
          color: 'info'
        },
        {
          title: 'Pending Approval',
          value: this.pendingApproval.length,
          icon: 'fa-clock',
          color: 'warning'
        },
        {
          title: 'Expiring Soon',
          value: this.expiringPlans.length,
          icon: 'fa-calendar-alt',
          color: 'info'
        },
        {
          title: 'Completion Rate',
          value: this.completionRate + '%',
          icon: 'fa-chart-line',
          color: 'success'
        }
      ]
    }
  },
  
  async mounted() {
    this.debouncedSearch = debounce(this.filterPlans, 300)
    await Promise.all([
      this.fetchCarePlans(),
      this.fetchParticipants()
    ])
  },
  
  methods: {
    ...mapActions(useCarePlansStore, ['fetchCarePlans', 'createCarePlan', 'updateCarePlan', 'approveCarePlan', 'deleteCarePlan']),
    ...mapActions(useParticipantsStore, ['fetchParticipants']),
    
    getParticipantName(participantId) {
      const participant = this.participants.find(p => p.id === participantId)
      return participant ? `${participant.first_name} ${participant.last_name}` : 'Unknown Participant'
    },
    
    getStatusLabel(status) {
      const labels = {
        active: 'Active',
        pending_approval: 'Pending Approval', 
        draft: 'Draft',
        expired: 'Expired',
        cancelled: 'Cancelled'
      }
      return labels[status] || status
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-AU', {
        day: '2-digit',
        month: 'short', 
        year: 'numeric'
      })
    },
    
    formatDateRange(startDate, endDate) {
      return `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`
    },
    
    formatCurrency(amount) {
      return parseFloat(amount || 0).toLocaleString('en-AU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    
    calculateProgress(plan) {
      if (!plan.goals?.length) return 0
      const completedGoals = plan.goals.filter(goal => goal.status === 'completed').length
      return Math.round((completedGoals / plan.goals.length) * 100)
    },
    
    filterPlans() {
      // Triggered by filters
    },
    
    clearFilters() {
      this.searchQuery = ''
      this.statusFilter = ''
    },
    
    viewPlan(plan) {
      const participant = this.getParticipantName(plan.participant_id)
      const goals = plan.goals?.map(goal => `• ${goal.title}`).join('\n') || 'No goals defined'
      const budget = plan.budget_amount ? `$${this.formatCurrency(plan.budget_amount)}` : 'Not specified'
      
      const details = `👤 Participant: ${participant}\n📅 Period: ${this.formatDateRange(plan.start_date, plan.end_date)}\n💰 Budget: ${budget}\n🎯 Goals:\n${goals}\n\n${plan.description || ''}`
      
      showViewModal(details, `Care Plan #${plan.id}`)
    },
    
    editPlan(plan) {
      this.currentPlan = plan
      this.form = {
        participant_id: plan.participant_id,
        plan_type: plan.plan_type || 'standard',
        start_date: plan.start_date,
        end_date: plan.end_date,
        budget_amount: plan.budget_amount || '',
        review_frequency: plan.review_frequency || 'quarterly',
        description: plan.description || '',
        goals: plan.goals || []
      }
      this.showEditModal = true
    },
    
    async approvePlan(plan) {
      try {
        await this.approveCarePlan(plan.id)
        showSuccessModal(`Care plan #${plan.id} has been approved successfully!`, 'Plan Approved')
        await this.fetchCarePlans()
      } catch (error) {
        showErrorModal('Failed to approve care plan. Please try again.', 'Approval Failed')
      }
    },
    
    showReviewModal(plan) {
      showViewModal('Care plan review functionality will be available soon! This feature will allow you to conduct periodic reviews and update progress.', 'Plan Review')
    },
    
    duplicatePlan(plan) {
      this.form = {
        participant_id: plan.participant_id,
        plan_type: plan.plan_type || 'standard',
        start_date: '',
        end_date: '',
        budget_amount: plan.budget_amount || '',
        review_frequency: plan.review_frequency || 'quarterly',
        description: `Copy of: ${plan.description || ''}`,
        goals: plan.goals ? [...plan.goals.map(goal => ({ ...goal, status: 'active' }))] : []
      }
      this.showCreateModal = true
    },
    
    async deletePlan(plan) {
      if (confirm(`Are you sure you want to delete care plan #${plan.id}? This action cannot be undone.`)) {
        try {
          await this.deleteCarePlan(plan.id)
          showSuccessModal('Care plan deleted successfully.', 'Plan Deleted')
        } catch (error) {
          showErrorModal('Failed to delete care plan. Please try again.', 'Delete Failed')
        }
      }
    },
    
    addGoal() {
      this.form.goals.push({
        title: '',
        description: '',
        category: 'independence',
        status: 'active'
      })
    },
    
    removeGoal(index) {
      this.form.goals.splice(index, 1)
    },
    
    async submitForm() {
      this.isSubmitting = true
      try {
        if (this.showEditModal) {
          await this.updateCarePlan(this.currentPlan.id, this.form)
          showSuccessModal('Care plan updated successfully!', 'Plan Updated')
        } else {
          await this.createCarePlan(this.form)
          showSuccessModal('Care plan created successfully!', 'Plan Created')
        }
        this.closeModal()
        await this.fetchCarePlans()
      } catch (error) {
        showErrorModal('Failed to save care plan. Please check your data and try again.', 'Save Failed')
      } finally {
        this.isSubmitting = false
      }
    },
    
    closeModal() {
      this.showCreateModal = false
      this.showEditModal = false
      this.currentPlan = null
      this.form = {
        participant_id: '',
        plan_type: 'standard',
        start_date: '',
        end_date: '',
        budget_amount: '',
        review_frequency: 'quarterly',
        description: '',
        goals: []
      }
    }
  }
}
</script>

<style scoped>
.care-plans-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Participants-style filters */
.filters-section {
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  margin-bottom: 1rem;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-weight: 500;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-select {
  padding: 0.75rem 1rem;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-weight: 500;
  min-width: 140px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
  background-color: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}

.btn-outline-elegant {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 2px solid rgba(0, 0, 0, 0.08);
  color: #4a5568;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.btn-outline-elegant:hover {
  border-color: #667eea;
  color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(102, 126, 234, 0.04) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.15);
}

.view-toggle {
  display: flex;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.view-btn-elegant {
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  min-width: 44px;
}

.view-btn-elegant:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transform: translateY(-1px);
}

.view-btn-elegant.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.25);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.header-content h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 32px;
  font-weight: 700;
}

.header-content p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-card.primary {
  border-left: 4px solid #3b82f6;
}

.stat-card.warning {
  border-left: 4px solid #f59e0b;
}

.stat-card.info {
  border-left: 4px solid #06b6d4;
}

.stat-card.success {
  border-left: 4px solid #10b981;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-card.primary .stat-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-card.info .stat-icon {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.stat-card.success .stat-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-content h3 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.stat-content p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
}

/* Filter controls now use global styles for consistency */

.care-plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.care-plan-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 24px;
  transition: all 0.3s ease;
  border-left: 4px solid #e5e7eb;
}

.care-plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.care-plan-card .plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.plan-info h3 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.plan-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.pending_approval {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.draft {
  background: #f3f4f6;
  color: #374151;
}

.status-badge.expired {
  background: #fee2e2;
  color: #991b1b;
}

.plan-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.detail-item i {
  width: 16px;
  color: #9ca3af;
}

.plan-description {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 16px;
}

.progress-section {
  margin-bottom: 16px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #10b981, #059669);
  transition: width 0.3s ease;
}

.plan-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn-mini {
  padding: 8px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.btn-mini:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-view { background: linear-gradient(135deg, #6b7280, #4b5563); color: white; }
.btn-edit { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
.btn-success { background: linear-gradient(135deg, #10b981, #059669); color: white; }
.btn-info { background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; }
.btn-warning { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
.btn-delete { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }

.empty-state {
  text-align: center;
  padding: 80px 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 24px;
}

.empty-state h3 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 24px;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: #6b7280;
  font-size: 16px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.large-modal {
  width: 90%;
  max-width: 900px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  padding: 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.8;
  padding: 4px;
}

.close-btn:hover {
  opacity: 1;
}

.modal-body {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 32px;
}

.form-section h4 {
  margin: 0 0 16px 0;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group.flex-2 {
  grid-column: span 2;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.goal-item {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
}

.btn-cancel {
  background: #6b7280;
  color: white;
}

.btn-outline {
  background: transparent;
  border: 2px solid #e5e7eb;
  color: #374151;
}

.btn-outline:hover {
  background: #f9fafb;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .care-plans-container {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .search-box {
    min-width: unset;
  }
  
  .filter-controls {
    justify-content: space-between;
    flex-wrap: wrap;
  }
  
  .care-plans-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>