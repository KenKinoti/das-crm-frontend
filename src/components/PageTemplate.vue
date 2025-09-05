<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>
          <i :class="headerIcon"></i>
          {{ pageTitle }}
        </h1>
        <p>{{ pageDescription }}</p>
      </div>
      <button v-if="showAddButton" @click="$emit('add-clicked')" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        {{ addButtonText || 'Add New' }}
      </button>
    </div>

    <!-- Stats Overview -->
    <div v-if="statsCards && statsCards.length > 0" class="stats-overview">
      <div 
        v-for="(card, index) in statsCards" 
        :key="index"
        :class="['stat-card', card.type || 'info']"
      >
        <div :class="['stat-icon', `${card.type || 'info'}-icon`]">
          <i :class="card.icon"></i>
        </div>
        <div class="stat-content">
          <h3>{{ card.value }}</h3>
          <p>{{ card.label }}</p>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div v-if="showFilters" class="filters-section">
      <div class="filters-row">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            :value="searchQuery" 
            @input="$emit('search-updated', $event.target.value)"
            type="text" 
            placeholder="Search..." 
            class="form-input"
          />
        </div>
        
        <div class="filter-controls">
          <select 
            v-if="showStatusFilter"
            :value="statusFilter" 
            @change="$emit('status-filter-updated', $event.target.value)"
            class="form-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button @click="$emit('clear-filters')" class="btn btn-outline-elegant">
            <i class="fas fa-times"></i>
            Clear Filters
          </button>
          
          <!-- View Toggle -->
          <div v-if="showViewToggle" class="view-toggle">
            <button 
              @click="$emit('view-changed', 'list')" 
              :class="['view-btn-elegant', { active: currentView === 'list' }]"
              title="List View"
            >
              <i class="fas fa-list"></i>
            </button>
            <button 
              @click="$emit('view-changed', 'grid')" 
              :class="['view-btn-elegant', { active: currentView === 'grid' }]"
              title="Grid View"
            >
              <i class="fas fa-th"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Container -->
    <div class="dashboard-content">
      <slot name="content">
        <!-- Default loading/empty states -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading data...</p>
        </div>

        <div v-else-if="showEmptyState" class="empty-state">
          <i :class="headerIcon"></i>
          <h3>{{ emptyStateTitle || 'No Data Found' }}</h3>
          <p>{{ emptyStateMessage || 'Get started by adding your first item' }}</p>
          <button v-if="showAddButton" @click="$emit('add-clicked')" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            {{ addButtonText || 'Add First Item' }}
          </button>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageTemplate',
  props: {
    pageTitle: {
      type: String,
      required: true
    },
    pageDescription: {
      type: String,
      default: ''
    },
    headerIcon: {
      type: String,
      default: 'fas fa-home'
    },
    showAddButton: {
      type: Boolean,
      default: false
    },
    addButtonText: {
      type: String,
      default: 'Add New'
    },
    statsCards: {
      type: Array,
      default: () => []
    },
    showFilters: {
      type: Boolean,
      default: false
    },
    showStatusFilter: {
      type: Boolean,
      default: false
    },
    showViewToggle: {
      type: Boolean,
      default: false
    },
    searchQuery: {
      type: String,
      default: ''
    },
    statusFilter: {
      type: String,
      default: ''
    },
    currentView: {
      type: String,
      default: 'list'
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    showEmptyState: {
      type: Boolean,
      default: false
    },
    emptyStateTitle: {
      type: String,
      default: ''
    },
    emptyStateMessage: {
      type: String,
      default: ''
    }
  },
  emits: [
    'add-clicked',
    'search-updated',
    'status-filter-updated', 
    'clear-filters',
    'view-changed'
  ]
}
</script>

<style scoped>
/* Page Container */
.page-container {
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Enhanced Stats Cards with Matching Colors */
.stats-overview {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.stat-card {
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  flex: 1;
  min-width: 250px;
}

.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.6s;
}

.stat-card:hover::after {
  left: 100%;
}

.stat-card.info {
  border-color: rgba(59, 130, 246, 0.3);
}

.stat-card.success {
  border-color: rgba(16, 185, 129, 0.3);
}

.stat-card.warning {
  border-color: rgba(245, 158, 11, 0.3);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 6px;
  border-radius: 16px 0 0 16px;
}

.stat-card.info::before {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.stat-card.success::before {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-card.warning::before {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.stat-icon.info-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.stat-icon.success-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.stat-icon.warning-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.stat-content {
  flex: 1;
  text-align: right;
}

.stat-content h3 {
  font-size: 2.25rem;
  font-weight: 700;
  color: #374151;
  margin: 0;
  line-height: 1;
}

.stat-content p {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Dark theme - proper dark cards with light text */
[data-theme="dark"] .stat-card {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .stat-content h3 {
  color: #f3f4f6;
}

[data-theme="dark"] .stat-content p {
  color: #9ca3af;
}

[data-theme="dark"] .stat-icon.info-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

[data-theme="dark"] .stat-icon.success-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

[data-theme="dark"] .stat-icon.warning-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1.5rem 2rem;
  background: rgba(250, 250, 250, 0.95);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .page-header {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #3b82f6 100%);
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.header-content h1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 1rem;
}

[data-theme="dark"] .header-content h1 {
  color: #f3f4f6;
}

.header-content h1 i {
  color: #3b82f6;
  font-size: 2rem;
}

.header-content p {
  font-size: 1rem;
  color: #64748b;
  margin: 0.5rem 0 0 0;
}

[data-theme="dark"] .header-content p {
  color: #9ca3af;
}

/* Filters */
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
  gap: 1rem;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 300px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2rem;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  font-size: 0.8125rem;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  font-weight: 500;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: nowrap;
  flex-shrink: 0;
}

.form-select {
  padding: 0.625rem 0.75rem;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  font-size: 0.8125rem;
  background: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  min-width: 120px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px;
  padding-right: 32px;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: 2px solid transparent;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.btn-outline-elegant {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 2px solid rgba(0, 0, 0, 0.08);
  color: #4a5568;
  padding: 0.625rem 0.875rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.8125rem;
}

.btn-outline-elegant:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%);
  transform: translateY(-2px);
}

.view-toggle {
  display: flex;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
}

.view-btn-elegant {
  padding: 0.625rem 0.75rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  min-width: 36px;
}

.view-btn-elegant:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  transform: translateY(-1px);
}

.view-btn-elegant.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.25);
}

/* Content */
.dashboard-content {
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  border: none;
  width: 100%;
  overflow: visible;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state i {
  font-size: 4rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 2rem 0;
}

/* Mobile Responsive Design */
@media (max-width: 1024px) {
  .page-container {
    padding: 1rem;
    height: 100%;
  }
  
  .page-header {
    padding: 1.25rem 1.5rem;
    margin-bottom: 1rem;
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
    height: 100%;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
    text-align: left;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 1.25rem;
  }
  
  .header-content h1 {
    font-size: 1.375rem;
    justify-content: flex-start;
    color: var(--text-dark);
    font-weight: 600;
    line-height: 1.25;
    margin-bottom: 0.75rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
  }
  
  .header-content p {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--text-medium);
    opacity: 0.8;
    margin: 0;
  }
  
  .stats-overview {
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .stat-card {
    min-width: auto;
    padding: 0.875rem;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.125rem;
    flex-shrink: 0;
  }
  
  .stat-content {
    text-align: right;
    flex: 1;
  }
  
  .stat-content h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-dark);
    line-height: 1.2;
    margin: 0;
  }
  
  .stat-content p {
    font-size: 0.75rem;
    color: var(--text-medium);
    font-weight: 500;
    margin: 0.125rem 0 0 0;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }
  
  .filters-section {
    padding: 1rem;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .filters-row {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
  
  .form-input {
    font-size: 16px;
    padding: 1rem;
    border-radius: 12px;
    min-height: 48px;
  }
  
  .filter-controls {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .form-select {
    min-width: 140px;
    font-size: 16px;
    padding: 1rem;
    border-radius: 12px;
    min-height: 48px;
  }
  
  .btn-outline-elegant {
    padding: 1rem 1.25rem;
    font-size: 1rem;
    border-radius: 12px;
    min-height: 48px;
  }
  
  .view-toggle {
    align-self: center;
    border-radius: 12px;
  }
  
  .view-btn-elegant {
    padding: 1rem;
    min-height: 48px;
    min-width: 48px;
  }
}

/* Dark theme support for mobile */
[data-theme="dark"] .page-header {
  background: rgba(31, 41, 55, 0.95) !important;
  border: 1px solid rgba(75, 85, 99, 0.3) !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3) !important;
}

[data-theme="dark"] .header-content h1 {
  color: #f3f4f6 !important;
}

[data-theme="dark"] .header-content p {
  color: #9ca3af !important;
}

[data-theme="dark"] .stat-card {
  background: rgba(31, 41, 55, 0.95) !important;
  border: 1px solid rgba(75, 85, 99, 0.3) !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2) !important;
}

[data-theme="dark"] .stat-content h3 {
  color: #f3f4f6 !important;
}

[data-theme="dark"] .stat-content p {
  color: #9ca3af !important;
}

[data-theme="dark"] .filters-section {
  background: rgba(31, 41, 55, 0.9) !important;
  border: 1px solid rgba(75, 85, 99, 0.3) !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2) !important;
}

@media (max-width: 480px) {
  .page-container {
    padding: 0.875rem;
  }
  
  .page-header {
    padding: 1rem;
    gap: 0.875rem;
    margin-bottom: 1rem;
  }
  
  .header-content h1 {
    font-size: 1.125rem;
    flex-direction: column;
    gap: 0.5rem;
    line-height: 1.2;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
  }
  
  .header-content h1 i {
    font-size: 1.25rem;
  }
  
  .header-content p {
    font-size: 0.8125rem;
  }
  
  .stat-card {
    padding: 0.75rem;
  }
  
  .stat-content h3 {
    font-size: 1.25rem;
  }
  
  .stat-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .stat-content {
    text-align: center;
  }
  
  .stat-content h3 {
    font-size: 1.5rem;
  }
  
  .filters-section {
    padding: 0.75rem;
  }
  
  .form-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
  
  .form-select {
    font-size: 16px; /* Prevents zoom on iOS */
    min-width: auto;
  }
  
  .btn {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
  
  .btn-outline-elegant {
    padding: 0.625rem 0.75rem;
  }
  
  .filter-controls {
    gap: 0.5rem;
  }
  
  .view-toggle {
    width: 100%;
    justify-content: center;
  }
  
  .view-btn-elegant {
    flex: 1;
    max-width: 60px;
  }
}
</style>