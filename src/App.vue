<script>
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import { getSite } from './services/api'

export default {
  name: 'App',
  components: { SiteFooter, SiteHeader },
  data() {
    return {
      site: null,
      navigation: [],
      footerPages: [],
      siteError: '',
    }
  },
  watch: {
    '$route.meta.admin'(isAdmin) {
      if (!isAdmin && !this.site) this.loadSite()
    },
  },
  created() {
    if (!this.$route.meta.admin) this.loadSite()
  },
  methods: {
    async loadSite() {
      this.siteError = ''
    try {
      const payload = await getSite()
      this.site = payload.settings
      this.navigation = payload.navigation
      this.footerPages = payload.footer_pages
    } catch {
      this.siteError = 'The website content service is temporarily unavailable.'
    }
    },
  },
}
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <SiteHeader v-if="!$route.meta.admin" :site="site" :navigation="navigation" />
  <div v-if="siteError && !$route.meta.admin" class="service-notice">{{ siteError }}</div>
  <main id="main-content" :class="{ 'admin-main': $route.meta.admin }">
    <RouterView />
  </main>
  <SiteFooter v-if="!$route.meta.admin" :site="site" :navigation="navigation" :footer-pages="footerPages" />
</template>
