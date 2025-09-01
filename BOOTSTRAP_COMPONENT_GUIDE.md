# Bootstrap Component Standardization Guide

This guide provides templates for converting custom Vue components to use Bootstrap 5.3.3 classes consistently across the AGO Vue CRM application.

## Core Principles

1. **Single Source of Styles**: All styling comes from `bootstrap-theme.css`
2. **No Custom CSS**: Remove custom component classes, use Bootstrap utilities
3. **Responsive by Default**: Use Bootstrap's responsive grid and utilities
4. **Consistent Patterns**: Follow established component patterns

## Component Templates

### Page Layout Structure
```vue
<template>
  <div class="container-fluid">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-icon"></i> Page Title</h1>
        <p>Page description</p>
      </div>
      <button class="btn btn-primary">Primary Action</button>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card primary">
        <div class="stat-icon"><i class="fas fa-icon"></i></div>
        <div class="stat-content">
          <h3>{{ value }}</h3>
          <p>Label</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="card">
      <!-- Content here -->
    </div>
  </div>
</template>
```

### Search and Filters
```vue
<div class="search-filters">
  <div class="search-box">
    <i class="fas fa-search"></i>
    <input type="text" class="form-control" placeholder="Search..." />
  </div>
  
  <div class="filter-controls">
    <select class="form-select">
      <option>Filter Option</option>
    </select>
    <button class="btn btn-outline-secondary">Clear</button>
    
    <div class="btn-group" role="group">
      <button :class="['btn', 'btn-primary']">Active</button>
      <button :class="['btn', 'btn-outline-primary']">Inactive</button>
    </div>
  </div>
</div>
```

### Data Tables
```vue
<div class="table-responsive">
  <table class="table table-hover">
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data</td>
        <td>
          <span class="badge bg-success">Status</span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-outline-primary btn-sm">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Card Grids
```vue
<div class="row">
  <div class="col-md-6 col-lg-4 mb-4" v-for="item in items">
    <div class="card h-100">
      <div class="card-header">
        <h6 class="mb-0">Card Title</h6>
      </div>
      <div class="card-body">
        <p>Card content</p>
      </div>
      <div class="card-footer bg-transparent">
        <div class="action-buttons">
          <button class="btn btn-outline-primary btn-sm">Action</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Modals
```vue
<div v-if="showModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);" @click="closeModal">
  <div class="modal-dialog modal-lg" @click.stop>
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Modal Title</h5>
        <button type="button" class="btn-close" @click="closeModal"></button>
      </div>
      <div class="modal-body">
        <form>
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Field</label>
                <input type="text" class="form-control" />
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
        <button type="submit" class="btn btn-primary">Save</button>
      </div>
    </div>
  </div>
</div>
```

### Forms
```vue
<form>
  <div class="row">
    <div class="col-md-6">
      <div class="mb-3">
        <label class="form-label">Label *</label>
        <input type="text" class="form-control" required />
      </div>
    </div>
    <div class="col-md-6">
      <div class="mb-3">
        <label class="form-label">Select</label>
        <select class="form-select">
          <option>Option</option>
        </select>
      </div>
    </div>
  </div>
  
  <div class="mb-3">
    <div class="form-check form-switch">
      <input class="form-check-input" type="checkbox" />
      <label class="form-check-label">Toggle</label>
    </div>
  </div>
</form>
```

## Button Classes Reference

### Primary Actions
- `btn btn-primary` - Main actions (Add, Create, Save)
- `btn btn-success` - Approve, Start, Complete actions  
- `btn btn-outline-primary` - Secondary actions

### Destructive Actions
- `btn btn-danger` - Delete, Remove
- `btn btn-outline-danger` - Cancel, Reset

### Sizes
- `btn-sm` - Small buttons
- `btn-lg` - Large buttons
- Default size for normal buttons

## Status Indicators

### Badges
- `badge bg-success` - Active, Approved, Completed
- `badge bg-warning` - Pending, In Progress
- `badge bg-danger` - Inactive, Cancelled, Error
- `badge bg-secondary` - Draft, Neutral states
- `badge bg-primary` - Default/Info states

### Form Switches
```vue
<div class="form-check form-switch">
  <input class="form-check-input" type="checkbox" />
  <label class="form-check-label">Status</label>
</div>
```

## Loading States

### Spinners
```vue
<div class="loading-state">
  <div class="loading-spinner"></div>
  <p>Loading message...</p>
</div>
```

### Empty States
```vue
<div class="empty-state">
  <i class="fas fa-icon"></i>
  <h3>No Items Found</h3>
  <p class="text-muted">Description</p>
  <button class="btn btn-primary">Action</button>
</div>
```

## Migration Checklist

For each Vue component:

1. [ ] Replace `page-container` with `container-fluid`
2. [ ] Update page headers to use `page-header` structure
3. [ ] Convert custom cards to Bootstrap `card` components
4. [ ] Replace custom tables with `table table-hover`
5. [ ] Update forms to use `form-control`, `form-select`, `form-label`
6. [ ] Replace custom buttons with Bootstrap button classes
7. [ ] Convert custom modals to Bootstrap modal structure
8. [ ] Update search/filter sections to use `search-filters` layout
9. [ ] Replace custom grids with Bootstrap `row`/`col` system
10. [ ] Remove all custom CSS classes and replace with Bootstrap utilities

## Utility Classes

### Spacing (Bootstrap utilities)
- `mb-3` - margin-bottom: 1rem
- `me-2` - margin-end (right): 0.5rem
- `p-3` - padding: 1rem

### Flexbox
- `d-flex` - display: flex
- `align-items-center` - align-items: center  
- `justify-content-between` - justify-content: space-between
- `gap-2` - gap: 0.5rem

### Text
- `text-muted` - muted text color
- `text-center` - center align
- `small` - smaller font size
- `mb-0` - margin-bottom: 0

This standardization ensures consistent styling, better maintainability, and optimal code reuse across the entire application.