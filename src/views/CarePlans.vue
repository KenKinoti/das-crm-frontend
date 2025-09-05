<template>
  <div class="participants-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>
          <i class="fas fa-clipboard-list"></i>
          Care Plans Management
        </h1>
        <p>Manage participant care plans, approvals, and service objectives</p>
      </div>
      <button @click="showAddModal = true" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Create Care Plan
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card info">
        <div class="stat-icon info-icon">
          <i class="fas fa-clipboard-check"></i>
        </div>
        <div class="stat-content">
          <h3>{{ activePlans.length }}</h3>
          <p>Active Plans</p>
        </div>
      </div>
      
      <div class="stat-card warning">
        <div class="stat-icon warning-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ pendingApproval.length }}</h3>
          <p>Pending Approval</p>
        </div>
      </div>
      
      <div class="stat-card info">
        <div class="stat-icon info-icon">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="stat-content">
          <h3>{{ expiringPlans.length }}</h3>
          <p>Expiring Soon</p>
        </div>
      </div>
      
      <div class="stat-card success">
        <div class="stat-icon success-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="stat-content">
          <h3>{{ completionRate }}%</h3>
          <p>Completion Rate</p>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search care plans..." 
            class="form-input"
            @input="filterPlans"
          />
        </div>
        
        <div class="filter-controls">
          <select v-model="statusFilter" @change="filterPlans" class="form-select">
            <option value="">All Status</option>
            <option value="active">Active Plans</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="draft">Draft Plans</option>
            <option value="expired">Expired Plans</option>
            <option value="cancelled">Cancelled Plans</option>
          </select>
          
          <select v-model="participantFilter" @change="filterPlans" class="form-select">
            <option value="">All Participants</option>
            <option v-for="participant in participants" :key="participant.id" :value="participant.id">
              {{ participant.first_name }} {{ participant.last_name }}
            </option>
          </select>
          
          <button @click="clearFilters" class="btn btn-outline-elegant" title="Clear">
            <i class="fas fa-times"></i>
            Clear
          </button>
          
          <!-- View Toggle -->
          <div class="view-toggle">
            <button 
              @click="currentView = 'list'" 
              :class="['view-btn-elegant', { active: currentView === 'list' }]"
              title="List View"
            >
              <i class="fas fa-list"></i>
            </button>
            <button 
              @click="currentView = 'grid'" 
              :class="['view-btn-elegant', { active: currentView === 'grid' }]"
              title="Grid View"
            >
              <i class="fas fa-th"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Care Plans List/Grid -->
    <div class="content-card">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading care plans...</p>
      </div>

      <div v-else-if="filteredCarePlans.length === 0 && !searchQuery" class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <h3>No Care Plans Yet</h3>
        <p>Get started by creating your first care plan</p>
        <button @click="showAddModal = true" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Create First Care Plan
        </button>
      </div>

      <div v-else-if="filteredCarePlans.length === 0 && searchQuery" class="empty-state">
        <i class="fas fa-search"></i>
        <h3>No Results Found</h3>
        <p>Try adjusting your search criteria</p>
      </div>

      <!-- Grid View -->
      <div v-else-if="currentView === 'grid'" class="participants-grid">
        <div v-for="plan in paginatedCarePlans" :key="plan.id" class="participant-card">
          <div class="participant-header">
            <div class="participant-avatar">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <div class="participant-info">
              <h3>{{ getParticipantName(plan.participant_id) }}</h3>
              <p class="participant-ndis">Plan #{{ plan.id }} - {{ formatPlanType(plan.plan_type) }}</p>
            </div>
            <div class="participant-status">
              <span :class="['status-badge', getStatusClass(plan.status)]">
                {{ getStatusLabel(plan.status) }}
              </span>
            </div>
          </div>
          
          <div class="participant-details">
            <div class="detail-row">
              <i class="fas fa-calendar-alt"></i>
              <span>{{ formatDateRange(plan.start_date, plan.end_date) }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-dollar-sign"></i>
              <span>${{ formatCurrency(plan.budget_amount) }} budget</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-tasks"></i>
              <span>{{ plan.goals?.length || 0 }} goals</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-chart-line"></i>
              <span>{{ calculateProgress(plan) }}% complete</span>
            </div>
          </div>
          
          <div class="participant-actions">
            <button @click="viewCarePlan(plan)" class="action-btn view-btn" title="View Details">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="editCarePlan(plan)" class="action-btn edit-btn" title="Edit Plan">
              <i class="fas fa-edit"></i>
            </button>
            <button v-if="plan.status === 'pending_approval'" @click="approveCarePlan(plan)" class="action-btn approve-btn" title="Approve Plan">
              <i class="fas fa-check"></i>
            </button>
            <button @click="deleteCarePlan(plan)" class="action-btn delete-btn" title="Delete Plan">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- List View -->
      <div v-else class="participants-list">
        <div class="list-header">
          <div class="header-cell">Participant</div>
          <div class="header-cell">Plan Type</div>
          <div class="header-cell">Period</div>
          <div class="header-cell">Budget</div>
          <div class="header-cell">Progress</div>
          <div class="header-cell">Status</div>
          <div class="header-cell">Actions</div>
        </div>
        <div v-for="plan in paginatedCarePlans" :key="plan.id" class="list-row">
          <div class="list-cell" data-label="Participant">
            <div class="user-info">
              <div class="participant-avatar">
                <i class="fas fa-clipboard-list"></i>
              </div>
              <div class="participant-name">
                <span class="name">{{ getParticipantName(plan.participant_id) }}</span>
                <span class="email">Plan #{{ plan.id }}</span>
              </div>
            </div>
          </div>
          <div class="list-cell" data-label="Plan Type">
            <span class="plan-type-badge">{{ formatPlanType(plan.plan_type) }}</span>
          </div>
          <div class="list-cell" data-label="Period">
            <div class="date-range">
              <div><i class="fas fa-calendar-check"></i> {{ formatDate(plan.start_date) }}</div>
              <div><i class="fas fa-calendar-times"></i> {{ formatDate(plan.end_date) }}</div>
            </div>
          </div>
          <div class="list-cell" data-label="Budget">
            ${{ formatCurrency(plan.budget_amount) }}
          </div>
          <div class="list-cell" data-label="Progress">
            <div class="progress-inline">
              <div class="progress-bar-small">
                <div class="progress-fill" :style="{ width: calculateProgress(plan) + '%' }"></div>
              </div>
              <span class="progress-text">{{ calculateProgress(plan) }}%</span>
            </div>
          </div>
          <div class="list-cell" data-label="Status">
            <span :class="['status-badge', getStatusClass(plan.status)]">
              {{ getStatusLabel(plan.status) }}
            </span>
          </div>
          <div class="list-cell" data-label="Actions">
            <div class="action-buttons">
              <button @click="viewCarePlan(plan)" class="action-btn view-btn" title="View Details">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="editCarePlan(plan)" class="action-btn edit-btn" title="Edit Plan">
                <i class="fas fa-edit"></i>
              </button>
              <button v-if="plan.status === 'pending_approval'" @click="approveCarePlan(plan)" class="action-btn approve-btn" title="Approve">
                <i class="fas fa-check"></i>
              </button>
              <button @click="deleteCarePlan(plan)" class="action-btn delete-btn" title="Delete Plan">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-container">
        <div class="pagination-info">
          Showing {{ startIndex + 1 }}-{{ Math.min(endIndex, allFilteredCarePlans.length) }} of {{ allFilteredCarePlans.length }} care plans
        </div>
        
        <div class="pagination">
          <button 
            @click="goToPage(currentPage - 1)" 
            :disabled="currentPage === 1" 
            class="pagination-btn"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="pagination-pages">
            <button 
              v-for="page in visiblePages" 
              :key="page" 
              @click="goToPage(page)" 
              :class="['pagination-btn', { active: page === currentPage }]"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="goToPage(currentPage + 1)" 
            :disabled="currentPage === totalPages" 
            class="pagination-btn"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div class="per-page-selector">
          <span>Show</span>
          <select v-model.number="itemsPerPage" @change="handlePerPageChange">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>per page</span>
        </div>
      </div>
    </div>

    <!-- Add Care Plan Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>Create New Care Plan</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addCarePlan">
            <div class="form-section">
              <h4>Basic Information</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Participant *</label>
                  <select v-model="newCarePlan.participant_id" required class="form-input">
                    <option value="">Select participant</option>
                    <option v-for="participant in participants" :key="participant.id" :value="participant.id">
                      {{ participant.first_name }} {{ participant.last_name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Plan Type *</label>
                  <select v-model="newCarePlan.plan_type" required class="form-input">
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
                  <label class="form-label">Start Date *</label>
                  <input v-model="newCarePlan.start_date" type="date" required class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">End Date *</label>
                  <input v-model="newCarePlan.end_date" type="date" required class="form-input" />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Budget Amount</label>
                  <input v-model="newCarePlan.budget_amount" type="number" step="0.01" placeholder="0.00" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Review Frequency</label>
                  <select v-model="newCarePlan.review_frequency" class="form-input">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="biannually">Bi-annually</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea v-model="newCarePlan.description" rows="3" placeholder="Care plan overview and objectives..." class="form-input"></textarea>
              </div>
            </div>
            
            <div class="form-section">
              <h4>Goals & Objectives</h4>
              <div class="goals-list">
                <div v-for="(goal, index) in newCarePlan.goals" :key="index" class="goal-item">
                  <div class="form-row">
                    <div class="form-group flex-2">
                      <input v-model="goal.title" placeholder="Goal title" class="form-input" />
                    </div>
                    <div class="form-group">
                      <select v-model="goal.category" class="form-input">
                        <option value="independence">Independence</option>
                        <option value="social">Social Skills</option>
                        <option value="employment">Employment</option>
                        <option value="health">Health & Wellbeing</option>
                        <option value="community">Community Access</option>
                      </select>
                    </div>
                    <button @click="removeGoal(index)" type="button" class="btn-icon-delete">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                  <div class="form-group">
                    <textarea v-model="goal.description" rows="2" placeholder="Goal description and success criteria..." class="form-input"></textarea>
                  </div>
                </div>
                
                <button @click="addGoal" type="button" class="btn btn-outline-elegant">
                  <i class="fas fa-plus"></i>
                  Add Goal
                </button>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn btn-cancel">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting">
                  <i class="fas fa-spinner fa-spin"></i>
                  Creating...
                </span>
                <span v-else>
                  <i class="fas fa-plus"></i>
                  Create Care Plan
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Care Plan Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>Edit Care Plan</h3>
          <button @click="closeEditModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateEditedCarePlan">
            <div class="form-section">
              <h4>Basic Information</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Participant *</label>
                  <select v-model="newCarePlan.participant_id" required class="form-input">
                    <option value="">Select participant</option>
                    <option v-for="participant in participants" :key="participant.id" :value="participant.id">
                      {{ participant.first_name }} {{ participant.last_name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Plan Type *</label>
                  <select v-model="newCarePlan.plan_type" required class="form-input">
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
                  <label class="form-label">Start Date *</label>
                  <input v-model="newCarePlan.start_date" type="date" required class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">End Date *</label>
                  <input v-model="newCarePlan.end_date" type="date" required class="form-input" />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Budget Amount</label>
                  <input v-model="newCarePlan.budget_amount" type="number" step="0.01" placeholder="0.00" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Review Frequency</label>
                  <select v-model="newCarePlan.review_frequency" class="form-input">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="biannually">Bi-annually</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select v-model="newCarePlan.status" class="form-input">
                    <option value="draft">Draft</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea v-model="newCarePlan.description" rows="3" placeholder="Care plan overview and objectives..." class="form-input"></textarea>
              </div>
            </div>
            
            <div class="form-section">
              <h4>Goals & Objectives</h4>
              <div class="goals-list">
                <div v-for="(goal, index) in newCarePlan.goals" :key="index" class="goal-item">
                  <div class="form-row">
                    <div class="form-group flex-2">
                      <input v-model="goal.title" placeholder="Goal title" class="form-input" />
                    </div>
                    <div class="form-group">
                      <select v-model="goal.category" class="form-input">
                        <option value="independence">Independence</option>
                        <option value="social">Social Skills</option>
                        <option value="employment">Employment</option>
                        <option value="health">Health & Wellbeing</option>
                        <option value="community">Community Access</option>
                      </select>
                    </div>
                    <button @click="removeGoal(index)" type="button" class="btn-icon-delete">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                  <div class="form-group">
                    <textarea v-model="goal.description" rows="2" placeholder="Goal description and success criteria..." class="form-input"></textarea>
                  </div>
                </div>
                
                <button @click="addGoal" type="button" class="btn btn-outline-elegant">
                  <i class="fas fa-plus"></i>
                  Add Goal
                </button>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="closeEditModal" class="btn btn-cancel">Cancel</button>
              <button type="submit" class="btn btn-edit" :disabled="isSubmitting">
                <span v-if="isSubmitting">
                  <i class="fas fa-spinner fa-spin"></i>
                  Updating...
                </span>
                <span v-else>
                  <i class="fas fa-save"></i>
                  Update Care Plan
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal && carePlanToDelete" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Delete Care Plan</h3>
          <button @click="closeDeleteModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="delete-confirmation">
            <div class="delete-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h4>Are you sure you want to delete this care plan?</h4>
            <div class="participant-summary">
              <p><strong>Plan ID:</strong> #{{ carePlanToDelete.id }}</p>
              <p><strong>Participant:</strong> {{ getParticipantName(carePlanToDelete.participant_id) }}</p>
              <p><strong>Plan Type:</strong> {{ formatPlanType(carePlanToDelete.plan_type) }}</p>
              <p><strong>Period:</strong> {{ formatDateRange(carePlanToDelete.start_date, carePlanToDelete.end_date) }}</p>
              <p><strong>Budget:</strong> ${{ formatCurrency(carePlanToDelete.budget_amount) }}</p>
            </div>
            <p class="warning-text">
              <i class="fas fa-exclamation-circle"></i>
              This action cannot be undone. All plan data including goals, services, and progress will be permanently deleted.
            </p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeDeleteModal" class="btn btn-view">
            <i class="fas fa-times"></i>
            Cancel
          </button>
          <button @click="confirmDeleteCarePlan" class="btn btn-delete" :disabled="isSubmitting">
            <span v-if="isSubmitting">
              <i class="fas fa-spinner fa-spin"></i>
              Deleting...
            </span>
            <span v-else>
              <i class="fas fa-trash"></i>
              Delete Care Plan
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- View Care Plan Modal -->
    <div v-if="showViewModal && selectedCarePlan" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content view-modal" @click.stop>
        <div class="modal-header">
          <h3>Care Plan Details</h3>
          <button @click="closeViewModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="participant-detail-grid">
            <div class="detail-section">
              <h4><i class="fas fa-info-circle"></i> Plan Information</h4>
              <div class="detail-item">
                <span class="label">Plan ID:</span>
                <span class="value">#{{ selectedCarePlan.id }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Participant:</span>
                <span class="value">{{ getParticipantName(selectedCarePlan.participant_id) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Plan Type:</span>
                <span class="value">{{ formatPlanType(selectedCarePlan.plan_type) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Status:</span>
                <span :class="['value', 'status-badge', getStatusClass(selectedCarePlan.status)]">
                  {{ getStatusLabel(selectedCarePlan.status) }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">Review Frequency:</span>
                <span class="value">{{ formatReviewFrequency(selectedCarePlan.review_frequency) }}</span>
              </div>
            </div>
            
            <div class="detail-section">
              <h4><i class="fas fa-calendar"></i> Timeline & Budget</h4>
              <div class="detail-item">
                <span class="label">Start Date:</span>
                <span class="value">{{ formatDate(selectedCarePlan.start_date) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">End Date:</span>
                <span class="value">{{ formatDate(selectedCarePlan.end_date) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Duration:</span>
                <span class="value">{{ calculateDuration(selectedCarePlan.start_date, selectedCarePlan.end_date) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Budget Amount:</span>
                <span class="value">${{ formatCurrency(selectedCarePlan.budget_amount) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Progress:</span>
                <span class="value">{{ calculateProgress(selectedCarePlan) }}%</span>
              </div>
            </div>
          </div>

          <div v-if="selectedCarePlan.description" class="detail-section full-width">
            <h4><i class="fas fa-file-alt"></i> Description</h4>
            <p class="description-text">{{ selectedCarePlan.description }}</p>
          </div>

          <div v-if="selectedCarePlan.goals && selectedCarePlan.goals.length > 0" class="detail-section full-width">
            <h4><i class="fas fa-bullseye"></i> Goals & Objectives</h4>
            <div class="goals-display">
              <div v-for="(goal, index) in selectedCarePlan.goals" :key="index" class="goal-display-item">
                <div class="goal-header">
                  <span class="goal-number">#{{ index + 1 }}</span>
                  <span class="goal-title">{{ goal.title }}</span>
                  <span class="goal-category-badge">{{ goal.category }}</span>
                </div>
                <p class="goal-description">{{ goal.description }}</p>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="closeViewModal" class="btn btn-view">Close</button>
            <button @click="editCarePlan(selectedCarePlan); closeViewModal()" class="btn btn-edit">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button @click="deleteCarePlan(selectedCarePlan); closeViewModal()" class="btn btn-delete">
              <i class="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'pinia'
import { useCarePlansStore } from '../stores/carePlans'
import { useParticipantsStore } from '../stores/participants'
import { showSuccessNotification, showErrorNotification } from '../utils/notifications'

export default {
  name: 'CarePlans',
  data() {
    return {
      searchQuery: '',
      statusFilter: '',
      participantFilter: '',
      currentView: 'grid',
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      showViewModal: false,
      editingCarePlan: null,
      carePlanToDelete: null,
      selectedCarePlan: null,
      isSubmitting: false,
      newCarePlan: {
        participant_id: '',
        plan_type: 'standard',
        start_date: '',
        end_date: '',
        budget_amount: '',
        review_frequency: 'quarterly',
        description: '',
        status: 'draft',
        goals: []
      },
      // Pagination
      itemsPerPage: 25,
      currentPage: 1
    }
  },
  computed: {
    ...mapState(useCarePlansStore, ['carePlans', 'isLoading']),
    ...mapGetters(useCarePlansStore, ['activePlans', 'pendingApproval']),
    ...mapState(useParticipantsStore, { participants: 'participants' }),
    
    // Expiring plans (within next month)
    expiringPlans() {
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      
      return this.activePlans.filter(plan => {
        const endDate = new Date(plan.end_date)
        return endDate <= nextMonth && endDate >= new Date()
      })
    },
    
    // Completion rate
    completionRate() {
      if (!this.activePlans.length) return 0
      const totalProgress = this.activePlans.reduce((sum, plan) => sum + this.calculateProgress(plan), 0)
      return Math.round(totalProgress / this.activePlans.length)
    },
    
    // Filtered care plans
    allFilteredCarePlans() {
      let filtered = [...this.carePlans]
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(plan => {
          const participantName = this.getParticipantName(plan.participant_id).toLowerCase()
          const description = (plan.description || '').toLowerCase()
          const planId = plan.id.toString()
          return participantName.includes(query) || description.includes(query) || planId.includes(query)
        })
      }
      
      // Apply status filter
      if (this.statusFilter) {
        filtered = filtered.filter(plan => plan.status === this.statusFilter)
      }
      
      // Apply participant filter
      if (this.participantFilter) {
        filtered = filtered.filter(plan => plan.participant_id === this.participantFilter)
      }
      
      // Sort by created date (newest first)
      return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    },
    
    filteredCarePlans() {
      // For compatibility
      return this.paginatedCarePlans
    },
    
    // Pagination computed properties
    totalPages() {
      return Math.ceil(this.allFilteredCarePlans.length / this.itemsPerPage)
    },
    
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage
    },
    
    endIndex() {
      return this.startIndex + this.itemsPerPage
    },
    
    paginatedCarePlans() {
      return this.allFilteredCarePlans.slice(this.startIndex, this.endIndex)
    },
    
    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)
      
      // Adjust start if we're near the end
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
  },
  methods: {
    ...mapActions(useCarePlansStore, ['fetchCarePlans', 'createCarePlan', 'updateCarePlan', 'deleteCarePlan', 'approveCarePlan']),
    ...mapActions(useParticipantsStore, ['fetchParticipants']),
    
    // Helper methods
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
    
    getStatusClass(status) {
      const classes = {
        active: 'active',
        pending_approval: 'warning',
        draft: 'draft',
        expired: 'expired',
        cancelled: 'cancelled'
      }
      return classes[status] || 'draft'
    },
    
    formatPlanType(type) {
      const types = {
        standard: 'Standard Plan',
        intensive: 'Intensive Support',
        community: 'Community Access',
        respite: 'Respite Care',
        employment: 'Employment Support'
      }
      return types[type] || type
    },
    
    formatReviewFrequency(frequency) {
      const frequencies = {
        monthly: 'Monthly',
        quarterly: 'Quarterly',
        biannually: 'Bi-annually',
        annually: 'Annually'
      }
      return frequencies[frequency] || frequency
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-AU', {
        day: 'numeric',
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
    
    calculateDuration(startDate, endDate) {
      if (!startDate || !endDate) return 'N/A'
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 30) return `${diffDays} days`
      if (diffDays < 365) return `${Math.round(diffDays / 30)} months`
      return `${Math.round(diffDays / 365)} year${diffDays >= 730 ? 's' : ''}`
    },
    
    // Filter methods
    filterPlans() {
      // Filtering is handled by computed property
      // Reset to first page when filters change
      this.currentPage = 1
    },
    
    clearFilters() {
      this.searchQuery = ''
      this.statusFilter = ''
      this.participantFilter = ''
      this.currentPage = 1
    },
    
    // Modal methods
    closeModal() {
      this.showAddModal = false
      this.resetForm()
    },
    
    closeEditModal() {
      this.showEditModal = false
      this.editingCarePlan = null
      this.resetForm()
    },
    
    closeDeleteModal() {
      this.showDeleteModal = false
      this.carePlanToDelete = null
    },
    
    closeViewModal() {
      this.showViewModal = false
      this.selectedCarePlan = null
    },
    
    resetForm() {
      this.newCarePlan = {
        participant_id: '',
        plan_type: 'standard',
        start_date: '',
        end_date: '',
        budget_amount: '',
        review_frequency: 'quarterly',
        description: '',
        status: 'draft',
        goals: []
      }
    },
    
    // CRUD operations
    viewCarePlan(plan) {
      this.selectedCarePlan = plan
      this.showViewModal = true
    },
    
    editCarePlan(plan) {
      this.editingCarePlan = { ...plan }
      // Pre-populate the form
      this.newCarePlan = {
        participant_id: plan.participant_id,
        plan_type: plan.plan_type || 'standard',
        start_date: plan.start_date,
        end_date: plan.end_date,
        budget_amount: plan.budget_amount || '',
        review_frequency: plan.review_frequency || 'quarterly',
        description: plan.description || '',
        status: plan.status || 'draft',
        goals: plan.goals ? [...plan.goals] : []
      }
      this.showEditModal = true
    },
    
    deleteCarePlan(plan) {
      this.carePlanToDelete = plan
      this.showDeleteModal = true
    },
    
    async confirmDeleteCarePlan() {
      if (!this.carePlanToDelete) return
      
      try {
        this.isSubmitting = true
        await this.deleteCarePlan(this.carePlanToDelete.id)
        this.closeDeleteModal()
        showSuccessNotification('Care plan deleted successfully!')
        await this.fetchCarePlans()
      } catch (error) {
        console.error('Error deleting care plan:', error)
        showErrorNotification(error, 'Error deleting care plan')
      } finally {
        this.isSubmitting = false
      }
    },
    
    validateCarePlanForm() {
      if (!this.newCarePlan.participant_id) {
        showErrorNotification(new Error('Please select a participant'))
        return false
      }
      
      if (!this.newCarePlan.start_date || !this.newCarePlan.end_date) {
        showErrorNotification(new Error('Please provide start and end dates'))
        return false
      }
      
      if (new Date(this.newCarePlan.start_date) > new Date(this.newCarePlan.end_date)) {
        showErrorNotification(new Error('End date must be after start date'))
        return false
      }
      
      return true
    },
    
    async addCarePlan() {
      if (!this.validateCarePlanForm()) {
        return
      }
      
      try {
        this.isSubmitting = true
        const carePlanData = { ...this.newCarePlan }
        await this.createCarePlan(carePlanData)
        this.closeModal()
        showSuccessNotification('Care plan created successfully!')
        await this.fetchCarePlans()
      } catch (error) {
        console.error('Error creating care plan:', error)
        showErrorNotification(error, 'Error creating care plan')
      } finally {
        this.isSubmitting = false
      }
    },
    
    async updateEditedCarePlan() {
      if (!this.validateCarePlanForm()) {
        return
      }
      
      try {
        this.isSubmitting = true
        const carePlanData = { ...this.newCarePlan }
        await this.updateCarePlan(this.editingCarePlan.id, carePlanData)
        this.closeEditModal()
        showSuccessNotification('Care plan updated successfully!')
        await this.fetchCarePlans()
      } catch (error) {
        console.error('Error updating care plan:', error)
        showErrorNotification(error, 'Error updating care plan')
      } finally {
        this.isSubmitting = false
      }
    },
    
    async approveCarePlan(plan) {
      try {
        await this.approveCarePlan(plan.id)
        showSuccessNotification(`Care plan #${plan.id} has been approved successfully!`)
        await this.fetchCarePlans()
      } catch (error) {
        console.error('Error approving care plan:', error)
        showErrorNotification(error, 'Error approving care plan')
      }
    },
    
    // Goal management
    addGoal() {
      this.newCarePlan.goals.push({
        title: '',
        description: '',
        category: 'independence',
        status: 'active'
      })
    },
    
    removeGoal(index) {
      this.newCarePlan.goals.splice(index, 1)
    },
    
    // Pagination methods
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    
    handlePerPageChange() {
      // Reset to first page when items per page changes
      this.currentPage = 1
    }
  },
  async mounted() {
    await Promise.all([
      this.fetchCarePlans(),
      this.fetchParticipants()
    ])
  }
}
</script>

<style scoped>
/* Import all the styles from Participants page */
@import url('../assets/styles/participants-common.css');

/* Enhanced Search Section - Responsive and Clean */
.filters-section {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .filters-section {
  background: linear-gradient(145deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.95) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.25rem 0;
}

/* Search Box - Enhanced */
.search-box {
  position: relative;
  flex: 1 1 auto;
  min-width: 200px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 0.9rem;
  z-index: 2;
}

[data-theme="dark"] .search-box i {
  color: #94a3b8;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  color: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

[data-theme="dark"] .form-input {
  background: rgba(55, 65, 81, 0.9);
  border-color: rgba(75, 85, 99, 0.5);
  color: #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

[data-theme="dark"] .form-input:focus {
  background: rgba(55, 65, 81, 0.98);
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.2);
}

.form-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

[data-theme="dark"] .form-input::placeholder {
  color: #6b7280;
}

/* Filter Controls - Enhanced */
.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.form-select {
  padding: 0.875rem 2.5rem 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  min-width: 120px;
  max-width: 180px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  color: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  flex-shrink: 1;
}

[data-theme="dark"] .form-select {
  background: rgba(55, 65, 81, 0.9);
  border-color: rgba(75, 85, 99, 0.5);
  color: #f3f4f6;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: rgba(255, 255, 255, 0.98);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

[data-theme="dark"] .form-select:focus {
  background-color: rgba(55, 65, 81, 0.98);
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Clear Button - Enhanced */
.btn-outline-elegant {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 2px solid #e2e8f0;
  color: #64748b;
  padding: 0.875rem 1.125rem;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.875rem;
}

[data-theme="dark"] .btn-outline-elegant {
  background: linear-gradient(145deg, rgba(55, 65, 81, 0.9) 0%, rgba(31, 41, 55, 0.9) 100%);
  border-color: rgba(75, 85, 99, 0.5);
  color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.btn-outline-elegant:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
}

[data-theme="dark"] .btn-outline-elegant:hover {
  border-color: #3b82f6;
  color: #60a5fa;
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%);
}

/* View Toggle - Enhanced */
.view-toggle {
  display: flex;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

[data-theme="dark"] .view-toggle {
  background: rgba(55, 65, 81, 0.9);
  border-color: rgba(75, 85, 99, 0.5);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.view-btn-elegant {
  padding: 0.875rem 1rem;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  min-width: 2.75rem;
}

[data-theme="dark"] .view-btn-elegant {
  color: #9ca3af;
}

.view-btn-elegant:hover:not(.active) {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  transform: translateY(-1px);
}

.view-btn-elegant.active {
  background: linear-gradient(145deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .filters-section {
    padding: 1rem;
  }
  
  .filters-row {
    gap: 0.5rem;
  }
  
  .search-box {
    min-width: 160px;
    flex: 1 1 auto;
  }
  
  .form-select {
    min-width: 100px;
    max-width: 140px;
  }
  
  .btn-outline-elegant {
    padding: 0.875rem 0.75rem;
    white-space: nowrap;
  }
}

@media (max-width: 640px) {
  .filters-row {
    gap: 0.5rem;
  }
  
  .search-box {
    flex: 1 1 100%;
    min-width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .filter-controls {
    flex: 1 1 100%;
    justify-content: space-between;
  }
  
  .form-select {
    flex: 1;
    min-width: 90px;
    max-width: none;
  }
}

/* Care Plans specific styles */
.large-modal {
  max-width: 900px;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
  color: var(--text-dark);
}

.goals-list {
  margin-top: 1rem;
}

.goal-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.flex-2 {
  flex: 2;
}

.btn-icon-delete {
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon-delete:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-2px);
}

/* Progress bar styles */
.progress-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: #64748b;
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  transition: width 0.3s ease;
}

.progress-inline {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar-small {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  min-width: 40px;
  text-align: right;
}

/* Status badge colors */
.status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-badge.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.status-badge.draft {
  background: rgba(107, 114, 128, 0.1);
  color: #4b5563;
}

.status-badge.expired {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.status-badge.cancelled {
  background: rgba(156, 163, 175, 0.1);
  color: #6b7280;
}

/* Plan type badge */
.plan-type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

/* Date range display */
.date-range {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.date-range div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
}

.date-range i {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Approve button */
.action-btn.approve-btn:hover {
  border-color: #10b981;
  color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

/* View modal specific styles */
.full-width {
  grid-column: span 2;
}

.description-text {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  color: #64748b;
  line-height: 1.6;
}

.goals-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.goal-display-item {
  background: #f8fafc;
  border-left: 3px solid #3b82f6;
  padding: 1rem;
  border-radius: 8px;
}

.goal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.goal-number {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.goal-title {
  flex: 1;
  font-weight: 600;
  color: #1e293b;
}

.goal-category-badge {
  padding: 0.25rem 0.5rem;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.goal-description {
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

/* Mobile Responsive Design */
@media (max-width: 1024px) {
  .large-modal {
    max-width: 95vw;
    margin: 1rem;
  }
  
  .page-header {
    padding: 1.25rem 1.5rem;
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
  
  .stats-overview {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.25rem;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .header-content h1 {
    font-size: 1.75rem;
  }
  
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1.25rem;
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .content-card {
    padding: 1.5rem;
  }
  
  /* List view mobile improvements */
  .list-header {
    display: none;
  }
  
  .list-row {
    flex-direction: column;
    padding: 1rem;
    border-bottom: 2px solid rgba(0, 0, 0, 0.05);
    gap: 0.75rem;
  }
  
  [data-theme="dark"] .list-row {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
  
  .list-cell {
    flex-direction: column;
    align-items: flex-start !important;
    width: 100%;
  }
  
  .list-cell:before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--text-medium);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
    display: block;
  }
  
  [data-theme="dark"] .list-cell:before {
    color: #9ca3af;
  }
  
  /* Mobile card improvements */
  .participants-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .participant-card {
    padding: 1.25rem;
  }
  
  .participant-header {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .participant-info {
    flex: 1 1 100%;
    text-align: center;
  }
  
  .participant-status {
    flex: 1 1 100%;
    justify-content: center;
  }
  
  /* Modal mobile improvements */
  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }
  
  .large-modal {
    max-width: calc(100vw - 2rem);
    margin: 1rem;
  }
  
  .modal-body {
    padding: 1.25rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .participant-detail-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .full-width {
    grid-column: span 1;
  }
  
  /* Goal items mobile */
  .goal-item {
    padding: 0.75rem;
  }
  
  .goal-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .goal-title {
    flex: 1 1 100%;
    order: 1;
  }
  
  .goal-number {
    order: 0;
  }
  
  .goal-category-badge {
    order: 2;
  }
  
  /* Progress inline mobile */
  .progress-inline {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .progress-text {
    text-align: left;
  }
  
  /* Pagination mobile */
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    text-align: center;
  }
  
  .pagination {
    order: 1;
  }
  
  .pagination-info {
    order: 2;
    font-size: 0.875rem;
  }
  
  .per-page-selector {
    order: 3;
    font-size: 0.875rem;
  }
}

@media (max-width: 640px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-content h3 {
    font-size: 1.5rem;
  }
  
  .participant-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .action-buttons {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .action-btn {
    min-width: 2.5rem;
    min-height: 2.5rem;
  }
  
  /* Touch-friendly buttons */
  .btn {
    min-height: 44px;
    padding: 0.75rem 1rem;
  }
  
  /* Modal improvements for small screens */
  .modal-content {
    margin: 0.5rem;
    border-radius: 12px;
  }
  
  .large-modal {
    margin: 0.5rem;
    max-width: calc(100vw - 1rem);
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-header h3 {
    font-size: 1.125rem;
  }
  
  .modal-actions {
    padding: 1rem;
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
  
  .modal-actions .btn {
    width: 100%;
    justify-content: center;
  }
  
  /* Form sections mobile */
  .form-section {
    margin-bottom: 1.5rem;
  }
  
  .form-section h4 {
    font-size: 1rem;
  }
  
  /* Goals list mobile */
  .goal-item .form-row {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .btn-icon-delete {
    align-self: flex-start;
    margin-top: 0.5rem;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 0.75rem;
  }
  
  .header-content h1 {
    font-size: 1.5rem;
  }
  
  .header-content p {
    font-size: 0.875rem;
  }
  
  .content-card {
    padding: 1rem;
  }
  
  .filters-section {
    padding: 0.75rem;
  }
  
  .search-box {
    margin-bottom: 0.75rem;
  }
  
  .form-input, .form-select {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
  
  .participant-card {
    padding: 1rem;
  }
  
  .participant-avatar {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 0.875rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .goal-item {
    padding: 0.75rem;
  }
  
  .goal-display-item {
    padding: 0.75rem;
  }
  
  .goal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .goal-number,
  .goal-category-badge {
    align-self: flex-start;
  }
}
</style>