<script>
import ContentPage from '../components/ContentPage.vue'

export default { name: 'AboutPage', components: { ContentPage }, computed: { slug() { return this.$route.name === 'aspire' ? 'aspire' : 'about-us' } } }
</script>

<template><ContentPage :key="slug" :slug="slug" /></template>
