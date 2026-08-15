<script>
export default {
  name: 'CmsSectionRenderer',
  props: {
    section: { type: Object, required: true },
    branches: { type: Array, default: () => [] },
    faqs: { type: Array, default: () => [] },
  },
  data() {
    return { openFaq: 0 }
  },
  computed: {
    bodyParagraphs() {
      return (this.section.body || '').split(/\n\s*\n/).map((text) => text.trim()).filter(Boolean)
    },
    stringItems() {
      return (this.section.items || []).filter((item) => typeof item === 'string')
    },
    objectItems() {
      return (this.section.items || []).filter((item) => typeof item === 'object' && item !== null)
    },
  },
  methods: {
    toggleFaq(index) {
      this.openFaq = this.openFaq === index ? -1 : index
    },
  },
}
</script>

<template>
  <section :class="['cms-section', `tone-${section.tone}`, `section-${section.kind}`]">
    <div class="shell">
      <template v-if="section.kind === 'content'">
        <div :class="['content-split', { 'has-image': section.image }]">
          <div v-if="section.image" class="content-image"><img :src="section.image" :alt="section.image_alt || section.heading" /></div>
          <div class="content-copy">
            <span v-if="section.eyebrow" class="tag">{{ section.eyebrow }}</span>
            <h2 v-if="section.heading">{{ section.heading }}</h2>
            <p v-if="section.subheading" class="section-lead">{{ section.subheading }}</p>
            <p v-for="paragraph in bodyParagraphs" :key="paragraph">{{ paragraph }}</p>
            <div v-if="objectItems.length" class="mini-feature-grid">
              <article v-for="item in objectItems" :key="item.title"><h3>{{ item.title }}</h3><p>{{ item.text }}</p></article>
            </div>
            <RouterLink v-if="section.cta_url" class="btn btn-blue" :to="section.cta_url">{{ section.cta_label || 'Learn more' }} →</RouterLink>
          </div>
        </div>
      </template>

      <template v-else-if="section.kind === 'feature_grid'">
        <div class="section-heading"><span v-if="section.eyebrow" class="tag">{{ section.eyebrow }}</span><h2>{{ section.heading }}</h2><p v-if="section.subheading">{{ section.subheading }}</p></div>
        <div class="feature-cards">
          <article v-for="(item, index) in objectItems" :key="item.title" class="feature-card">
            <span class="feature-number">{{ item.number || String(index + 1).padStart(2, '0') }}</span>
            <h3>{{ item.title }}</h3><p>{{ item.text }}</p>
            <RouterLink v-if="item.url" :to="item.url">Explore <span>→</span></RouterLink>
          </article>
        </div>
      </template>

      <template v-else-if="section.kind === 'list'">
        <div class="list-layout">
          <div><span v-if="section.eyebrow" class="tag">{{ section.eyebrow }}</span><h2>{{ section.heading }}</h2><p v-if="section.subheading">{{ section.subheading }}</p></div>
          <ul class="check-list"><li v-for="item in stringItems" :key="item"><span>✓</span>{{ item }}</li></ul>
        </div>
      </template>

      <template v-else-if="section.kind === 'faq'">
        <div class="faq-grid">
          <div class="faq-title"><span v-if="section.eyebrow" class="tag">{{ section.eyebrow }}</span><h2>{{ section.heading }}</h2><p v-if="section.subheading">{{ section.subheading }}</p></div>
          <div class="faq">
            <div v-for="(faq, index) in faqs" :key="faq.id" :class="['faq-item', { open: openFaq === index }]">
              <button type="button" :aria-expanded="openFaq === index" @click="toggleFaq(index)">{{ faq.question }}<span>{{ openFaq === index ? '−' : '＋' }}</span></button>
              <div class="answer"><p>{{ faq.answer }}</p></div>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="section.kind === 'branches'">
        <div class="section-heading"><span class="tag">Branch network</span><h2>{{ section.heading }}</h2></div>
        <div class="branch-grid"><article v-for="branch in branches" :key="branch.id" class="branch-card"><span>{{ branch.branch_type }}</span><h3>{{ branch.name }}</h3><p>{{ branch.address }}</p><a v-if="branch.phone" :href="`tel:${branch.phone}`">{{ branch.phone }}</a></article></div>
      </template>

      <template v-else-if="section.kind === 'contact'">
        <div class="contact-panel">
          <div><span v-if="section.eyebrow" class="tag">{{ section.eyebrow }}</span><h2>{{ section.heading }}</h2><p>Choose the most convenient way to speak with the Aspire team.</p></div>
          <div class="contact-actions">
            <template v-for="item in objectItems" :key="item.label">
              <a v-if="item.url?.startsWith('mailto:') || item.url?.startsWith('tel:')" :href="item.url"><small>{{ item.label }}</small><strong>{{ item.value }}</strong></a>
              <RouterLink v-else :to="item.url || '/contact'"><small>{{ item.label }}</small><strong>{{ item.value }}</strong></RouterLink>
            </template>
          </div>
        </div>
      </template>

      <template v-else-if="section.kind === 'cta'">
        <div class="cta-box"><div><span v-if="section.eyebrow" class="tag">{{ section.eyebrow }}</span><h2>{{ section.heading }}</h2><p v-if="section.subheading">{{ section.subheading }}</p></div><a v-if="section.cta_url?.startsWith('mailto:')" class="btn btn-cream" :href="section.cta_url">{{ section.cta_label }} ↗</a><RouterLink v-else class="btn btn-cream" :to="section.cta_url || '/contact'">{{ section.cta_label || 'Get started' }} ↗</RouterLink></div>
      </template>
    </div>
  </section>
</template>
