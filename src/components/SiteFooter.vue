<script>
export default {
  name: 'SiteFooter',
  props: {
    site: { type: Object, default: null },
    navigation: { type: Array, default: () => [] },
    footerPages: { type: Array, default: () => [] },
  },
  computed: {
    year() {
      return new Date().getFullYear()
    },
  },
}
</script>

<template>
  <footer class="footer">
    <div class="shell">
      <div class="footer-grid">
        <div>
          <RouterLink class="brand" to="/"><span class="mark">AMFB</span><span class="brand-name">Aspire Microfinance<br />Bank Limited</span></RouterLink>
          <p>{{ site?.footer_text || site?.description }}</p>
        </div>
        <div>
          <h4>Explore</h4>
          <RouterLink v-for="item in navigation" :key="item.id" :to="item.url">{{ item.label }}</RouterLink>
        </div>
        <div>
          <h4>Contact</h4>
          <a v-if="site?.phone" :href="`tel:${site.phone}`">{{ site.phone }}</a>
          <a v-if="site?.email" :href="`mailto:${site.email}`">{{ site.email }}</a>
          <RouterLink to="/branches">Branch network</RouterLink>
          <RouterLink to="/contact">Contact us</RouterLink>
        </div>
        <div>
          <h4>Legal</h4>
          <RouterLink v-for="page in footerPages" :key="page.slug" :to="page.url">{{ page.title }}</RouterLink>
        </div>
      </div>
      <div class="legal"><span>© {{ year }} {{ site?.bank_name || 'Aspire Microfinance Bank Limited' }}.</span><span>{{ site?.regulatory_text }}</span></div>
    </div>
  </footer>
</template>
