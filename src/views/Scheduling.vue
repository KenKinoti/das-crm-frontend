<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Scheduling</h1>
      <button class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Add New
      </button>
    </div>
    <div class="content-card">
      <p>Scheduling features coming soon...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Scheduling'
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.content-card {
  background: var(--white);
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: var(--primary-gradient);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}
</style>
