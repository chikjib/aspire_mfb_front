<script>
export default {
  name: 'PageHero',
  props: {
    page: { type: Object, required: true },
    home: { type: Boolean, default: false },
  },
}
</script>

<template>
  <section :class="['page-hero', { 'home-hero': home }]">
    <div class="pattern"></div>
    <div class="shell page-hero-grid">
      <div class="page-hero-copy">
        <span v-if="page.eyebrow" class="tag">{{ page.eyebrow }}</span>
        <h1>{{ page.hero_title }}</h1>
        <p v-if="page.hero_summary">{{ page.hero_summary }}</p>
        <div class="actions">
          <RouterLink class="btn btn-blue" to="/contact">Talk to Aspire ↗</RouterLink>
          <RouterLink v-if="home" class="btn btn-soft" to="/savings-product">Explore our products →</RouterLink>
        </div>
        <div v-if="home" class="proof"><span class="proof-badge">✓</span><span>Licensed by CBN<br />Deposits insured by NDIC</span></div>
      </div>
      <div v-if="page.hero_image" class="page-hero-image">
        <div class="blob"></div>
        <img :src="page.hero_image" :alt="page.hero_image_alt || page.title" />
        <div v-if="home" class="sticker"><span><strong>100%</strong>ready for<br />your next move</span></div>
      </div>
    </div>
  </section>
</template>
