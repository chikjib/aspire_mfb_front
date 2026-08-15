<script>
export default {
  name: 'SiteHeader',
  props: {
    site: { type: Object, default: null },
    navigation: { type: Array, default: () => [] },
  },
  data() {
    return { menuOpen: false, openDropdown: null }
  },
  watch: {
    $route() {
      this.closeAll()
    },
  },
  methods: {
    closeAll() {
      this.menuOpen = false
      this.openDropdown = null
    },
    toggleDropdown(id) {
      this.openDropdown = this.openDropdown === id ? null : id
    },
    isExternal(url) {
      return /^(https?:|mailto:|tel:)/.test(url)
    },
  },
}
</script>

<template>
  <div class="utility-bar">
    <div class="shell utility-inner">
      <span>{{ site?.regulatory_text || 'Licensed by CBN • Deposits insured by NDIC' }}</span>
      <div><a v-if="site?.phone" :href="`tel:${site.phone}`">{{ site.phone }}</a><a v-if="site?.email" :href="`mailto:${site.email}`">{{ site.email }}</a></div>
    </div>
  </div>
  <header class="site-header">
    <div class="shell nav">
      <RouterLink class="brand" to="/" aria-label="Aspire Microfinance Bank home">
        <span class="mark">AMFB</span>
        <span class="brand-name">Aspire Microfinance<br />Bank Limited<small>ASPIRE MORE. ACHIEVE MORE.</small></span>
      </RouterLink>

      <nav :class="['navlinks', { open: menuOpen }]" aria-label="Main navigation">
        <div v-for="item in navigation" :key="item.id" class="nav-item" :class="{ 'has-children': item.children.length }">
          <div class="nav-row">
            <RouterLink v-if="!isExternal(item.url)" :to="item.url">{{ item.label }}</RouterLink>
            <a v-else :href="item.url" :target="item.open_in_new_tab ? '_blank' : null">{{ item.label }}</a>
            <button v-if="item.children.length" type="button" class="dropdown-toggle" :aria-expanded="openDropdown === item.id" :aria-label="`Toggle ${item.label} submenu`" @click="toggleDropdown(item.id)">⌄</button>
          </div>
          <div v-if="item.children.length" :class="['dropdown', { open: openDropdown === item.id }]">
            <RouterLink v-for="child in item.children" :key="child.id" :to="child.url">{{ child.label }}<span>→</span></RouterLink>
          </div>
        </div>
        <RouterLink class="btn btn-blue nav-cta" :to="site?.primary_cta_url || '/contact'">{{ site?.primary_cta_label || 'Open an account' }} ↗</RouterLink>
      </nav>

      <button class="menu" type="button" aria-label="Toggle navigation" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">{{ menuOpen ? '×' : '☰' }}</button>
    </div>
  </header>
</template>
