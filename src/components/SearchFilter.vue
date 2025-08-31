<template>
  <div class="filters-section">
    <div class="filters-row">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          type="text" 
          :placeholder="searchPlaceholder"
          class="form-input"
        />
      </div>
      
      <!-- Filter Controls -->
      <div class="filter-controls">
        <select 
          v-if="statusOptions.length > 0"
          :value="statusFilter" 
          @change="$emit('update:statusFilter', $event.target.value)" 
          class="form-select"
        >
          <option value="">All Status</option>
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        
        <!-- Additional custom filters slot -->
        <slot name="filters"></slot>
        
        <button @click="$emit('clearFilters')" class="btn btn-outline-elegant">
          <i class="fas fa-times"></i>
          Clear Filters
        </button>
        
        <!-- View Toggle -->
        <div class="view-toggle">
          <button 
            v-for="view in viewOptions"
            :key="view.value"
            @click="$emit('update:currentView', view.value)" 
            :class="['view-btn-elegant', { active: currentView === view.value }]"
            :title="view.label"
          >
            <i :class="view.icon"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchFilter',
  props: {
    searchQuery: {
      type: String,
      default: ''
    },
    searchPlaceholder: {
      type: String,
      default: 'Search...'
    },
    statusFilter: {
      type: String,
      default: ''
    },
    statusOptions: {
      type: Array,
      default: () => []
    },
    currentView: {
      type: String,
      default: 'list'
    },
    viewOptions: {
      type: Array,
      default: () => [
        { value: 'list', label: 'List View', icon: 'fas fa-list' },
        { value: 'grid', label: 'Grid View', icon: 'fas fa-th' }
      ]
    }
  },
  emits: ['update:searchQuery', 'update:statusFilter', 'update:currentView', 'clearFilters']
}
</script>

<style scoped>
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

.filters-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
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
  z-index: 2;
}

.form-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.form-select {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;
}

.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn {
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-outline-elegant {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-outline-elegant:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.view-toggle {
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
  gap: 2px;
}

.view-btn-elegant {
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.view-btn-elegant:hover {
  background: white;
  color: #374151;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.view-btn-elegant.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .filters-section {
    padding: 16px;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: unset;
    order: -1;
  }
  
  .filter-controls {
    justify-content: space-between;
  }
}
</style>