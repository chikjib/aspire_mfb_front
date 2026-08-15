<script>
export default {
  name: 'PageState',
  props: {
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' },
  },
}
</script>

<template>
  <div class="page-state shell" role="status">
    <div v-if="loading" class="loading-card"><span class="spinner"></span><h2>Loading page</h2><p>Getting the latest content from Aspire.</p></div>
    <div v-else class="loading-card error-card"><span class="state-icon">!</span><h2>Page unavailable</h2><p>{{ error }}</p><RouterLink class="btn btn-blue" to="/">Return home</RouterLink></div>
  </div>
</template>
