<script>
import CmsSectionRenderer from './CmsSectionRenderer.vue'
import PageHero from './PageHero.vue'
import PageState from './PageState.vue'
import { getBranches, getFaqs, getPage } from '../services/api'

export default {
  name: 'ContentPage',
  components: { CmsSectionRenderer, PageHero, PageState },
  props: {
    slug: { type: String, required: true },
    home: { type: Boolean, default: false },
  },
  data() {
    return { page: null, branches: [], faqs: [], loading: true, error: '' }
  },
  watch: {
    slug: { immediate: true, handler: 'loadPage' },
  },
  methods: {
    async loadPage() {
      this.loading = true
      this.error = ''
      try {
        const page = await getPage(this.slug)
        const needsBranches = page.sections.some((section) => section.kind === 'branches')
        const needsFaqs = page.sections.some((section) => section.kind === 'faq')
        const [branchesPayload, faqPayload] = await Promise.all([
          needsBranches ? getBranches() : Promise.resolve({ branches: [] }),
          needsFaqs ? getFaqs() : Promise.resolve({ faqs: page.faqs || [] }),
        ])
        this.page = page
        this.branches = branchesPayload.branches
        this.faqs = needsFaqs ? faqPayload.faqs.filter((faq) => !faq.page || faq.page === this.slug) : []
        document.title = `${page.title} | Aspire Microfinance Bank`
        document.querySelector('meta[name="description"]')?.setAttribute('content', page.meta_description || page.hero_summary)
      } catch (error) {
        this.error = error.status === 404 ? 'The requested page could not be found.' : 'The latest page content could not be loaded. Please try again shortly.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <PageState v-if="loading || error" :loading="loading" :error="error" />
  <template v-else-if="page">
    <PageHero :page="page" :home="home" />
    <div v-if="home" class="marquee"><div class="shell marquee-inner"><span>Aspire more</span><i></i><span>Save with purpose</span><i></i><span>Build your business</span><i></i><span>Achieve more</span></div></div>
    <CmsSectionRenderer v-for="section in page.sections" :key="section.id" :section="section" :branches="branches" :faqs="faqs" />
  </template>
</template>
