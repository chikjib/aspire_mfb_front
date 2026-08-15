<script>
import ContentPage from '../components/ContentPage.vue'

export default { name: 'LegalPage', components: { ContentPage }, computed: { slug() { return this.$route.path.replace(/^\//, '') } } }
</script>

<template><ContentPage :key="slug" :slug="slug" /></template>
