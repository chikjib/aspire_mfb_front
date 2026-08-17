<script>
import {
  cmsLogin, cmsLogout, createCmsResource, deleteCmsResource, getCmsDashboard,
  getCmsSession, saveCmsSettings, updateCmsResource,
} from '../services/api'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      authChecked: false,
      user: null,
      loginForm: { username: '', password: '' },
      loginError: '',
      loggingIn: false,
      loading: false,
      dashboard: null,
      currentView: 'overview',
      search: '',
      sidebarOpen: false,
      editor: null,
      editorResource: '',
      saving: false,
      toast: '',
      error: '',
    }
  },
  computed: {
    djangoAdminUrl() {
      const configuredUrl = import.meta.env.VITE_DJANGO_ADMIN_URL?.trim()
      if (configuredUrl) return `${configuredUrl.replace(/\/+$/, '')}/`

      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api'
      return `${new URL(apiUrl, window.location.origin).origin}/admin/`
    },
    djangoPasswordResetUrl() {
      return `${this.djangoAdminUrl}password_reset/`
    },
    menuItems() {
      return [
        { id: 'overview', label: 'Overview', icon: '⌂' },
        { id: 'pages', label: 'Pages', icon: '▤' },
        { id: 'sections', label: 'Page sections', icon: '◫' },
        { id: 'navigation', label: 'Navigation', icon: '↗' },
        { id: 'branches', label: 'Branches', icon: '⌖' },
        { id: 'faqs', label: 'FAQs', icon: '?' },
        { id: 'settings', label: 'Site settings', icon: '⚙' },
      ]
    },
    pageSections() {
      if (!this.dashboard) return []
      return this.dashboard.pages.flatMap((page) =>
        page.sections.map((section) => ({ ...section, page_title: page.title, page: page.id })),
      )
    },
    currentItems() {
      if (!this.dashboard) return []
      const source = this.currentView === 'sections'
        ? this.pageSections
        : (this.dashboard[this.currentView] || [])
      const query = this.search.trim().toLowerCase()
      if (!query) return source
      return source.filter((item) => JSON.stringify(item).toLowerCase().includes(query))
    },
    currentLabel() {
      return this.menuItems.find((item) => item.id === this.currentView)?.label || 'Dashboard'
    },
    publishedPercent() {
      const stats = this.dashboard?.stats
      if (!stats?.pages) return 0
      return Math.round((stats.published_pages / stats.pages) * 100)
    },
  },
  async created() {
    await this.checkSession()
  },
  methods: {
    async checkSession() {
      try {
        const payload = await getCmsSession()
        this.user = payload.authenticated ? payload.user : null
        if (this.user) {
          if (this.$route.name === 'admin-login') await this.$router.replace({ name: 'admin-dashboard' })
          await this.loadDashboard()
        } else if (this.$route.name === 'admin-dashboard') {
          await this.$router.replace({ name: 'admin-login' })
        }
      } catch (error) {
        this.loginError = 'The content service is unavailable. Please start the Django server.'
      } finally {
        this.authChecked = true
      }
    },
    async signIn() {
      this.loggingIn = true
      this.loginError = ''
      try {
        const payload = await cmsLogin(this.loginForm)
        this.user = payload.user
        this.loginForm.password = ''
        await this.$router.replace({ name: 'admin-dashboard' })
        await this.loadDashboard()
      } catch (error) {
        this.loginError = error.message
      } finally {
        this.loggingIn = false
      }
    },
    async signOut() {
      await cmsLogout()
      this.user = null
      this.dashboard = null
      this.currentView = 'overview'
      await this.$router.replace({ name: 'admin-login' })
    },
    async loadDashboard() {
      this.loading = true
      this.error = ''
      try {
        this.dashboard = await getCmsDashboard()
      } catch (error) {
        if (error.status === 401) this.user = null
        else this.error = error.message
      } finally {
        this.loading = false
      }
    },
    switchView(view) {
      this.currentView = view
      this.search = ''
      this.sidebarOpen = false
    },
    newItem(resource) {
      const defaults = {
        pages: { title: '', slug: '', eyebrow: '', hero_title: '', hero_summary: '', hero_image: '', hero_image_alt: '', meta_description: '', is_homepage: false, is_published: true, show_in_footer: false, sort_order: 0 },
        sections: { page: this.dashboard?.pages[0]?.id || null, kind: 'content', eyebrow: '', heading: '', subheading: '', body: '', items: [], image: '', image_alt: '', cta_label: '', cta_url: '', tone: 'light', sort_order: 0, is_active: true },
        navigation: { label: '', page: null, custom_url: '', parent: null, sort_order: 0, is_active: true, open_in_new_tab: false },
        branches: { name: '', branch_type: '', address: '', phone: '', sort_order: 0, is_active: true },
        faqs: { question: '', answer: '', page: null, sort_order: 0, is_active: true },
      }
      this.openEditor(resource, defaults[resource])
    },
    openEditor(resource, item) {
      this.editorResource = resource
      this.editor = JSON.parse(JSON.stringify(item))
      if (resource === 'sections') this.editor.itemsText = JSON.stringify(this.editor.items || [], null, 2)
      this.error = ''
    },
    editSettings() {
      this.editorResource = 'settings'
      this.editor = JSON.parse(JSON.stringify(this.dashboard.settings))
    },
    async saveEditor() {
      this.saving = true
      this.error = ''
      try {
        if (this.editorResource === 'settings') {
          await saveCmsSettings(this.editor)
        } else {
          const payload = { ...this.editor }
          delete payload.id
          delete payload.updated_at
          delete payload.page_title
          if (this.editorResource === 'sections') {
            payload.page_id = payload.page
            delete payload.page
            delete payload.itemsText
            try { payload.items = JSON.parse(this.editor.itemsText || '[]') } catch { throw new Error('Section items must be valid JSON.') }
          }
          if (this.editorResource === 'navigation') {
            payload.page_id = payload.page || null
            payload.parent_id = payload.parent || null
            delete payload.page
            delete payload.parent
          }
          if (this.editorResource === 'faqs') {
            payload.page_id = payload.page || null
            delete payload.page
          }
          if (this.editor.id) await updateCmsResource(this.editorResource, this.editor.id, payload)
          else await createCmsResource(this.editorResource, payload)
        }
        this.editor = null
        this.showToast('Changes saved successfully')
        await this.loadDashboard()
      } catch (error) {
        this.error = error.message
      } finally {
        this.saving = false
      }
    },
    async removeItem(resource, item) {
      if (!window.confirm(`Delete “${item.title || item.heading || item.label || item.name || item.question}”? This cannot be undone.`)) return
      try {
        await deleteCmsResource(resource, item.id)
        this.showToast('Item deleted')
        await this.loadDashboard()
      } catch (error) {
        this.error = error.message
      }
    },
    showToast(message) {
      this.toast = message
      window.setTimeout(() => { this.toast = '' }, 2800)
    },
    formatDate(value) {
      return value ? new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : '—'
    },
    singularResourceLabel(resource, withArticle = false) {
      const labels = {
        pages: 'page',
        sections: 'section',
        navigation: 'menu item',
        branches: 'branch',
        faqs: 'FAQ',
      }
      const label = labels[resource] || 'item'
      if (!withArticle) return label
      return `${resource === 'faqs' ? 'an' : 'a'} ${label}`
    },
  },
}
</script>

<template>
  <div v-if="!authChecked" class="admin-boot"><span class="admin-spinner"></span><p>Preparing your workspace…</p></div>

  <section v-else-if="!user" class="admin-login">
    <div class="login-brand-panel">
      <RouterLink to="/" class="admin-brand admin-brand-light"><span class="admin-logo">AMFB</span><strong>Aspire Microfinance<br>Bank Limited</strong></RouterLink>
      <div class="login-message">
        <span class="admin-kicker">Content workspace</span>
        <h1>Welcome back.<br>Your website is ready.</h1>
        <p>Manage every page, update customer information and keep Aspire’s digital presence fresh from one friendly workspace.</p>
      </div>
      <p class="login-foot">Secure access for authorised Aspire MFB staff.</p>
    </div>
    <div class="login-form-panel">
      <form class="login-card" @submit.prevent="signIn">
        <span class="mobile-admin-mark">AMFB</span>
        <div><span class="admin-kicker">Staff sign in</span><h2>Good to see you</h2><p>Use your Django staff account to continue.</p></div>
        <label>Username<input v-model.trim="loginForm.username" autocomplete="username" required placeholder="Enter your username"></label>
        <label>Password<input v-model="loginForm.password" type="password" autocomplete="current-password" required placeholder="Enter your password"></label>
        <p v-if="loginError" class="form-error">{{ loginError }}</p>
        <button class="admin-primary login-button" :disabled="loggingIn">{{ loggingIn ? 'Signing in…' : 'Sign in securely' }} <span>→</span></button>
        <a :href="djangoPasswordResetUrl" class="forgot-link">Forgot your password?</a>
      </form>
    </div>
  </section>

  <div v-else class="admin-app">
    <aside class="admin-sidebar" :class="{ open: sidebarOpen }">
      <div class="admin-brand"><span class="admin-logo">AMFB</span><strong>Aspire MFB<br><small>Content Studio</small></strong></div>
      <nav aria-label="CMS navigation">
        <button v-for="item in menuItems" :key="item.id" :class="{ active: currentView === item.id }" @click="switchView(item.id)"><span>{{ item.icon }}</span>{{ item.label }}</button>
      </nav>
      <div class="sidebar-help"><span>?</span><div><strong>Need a hand?</strong><small>Use the classic admin for advanced changes.</small><a :href="djangoAdminUrl" target="_blank" rel="noopener noreferrer">Open Django admin ↗</a></div></div>
      <RouterLink to="/" class="view-site-link">View live website <span>↗</span></RouterLink>
    </aside>
    <button v-if="sidebarOpen" class="admin-overlay" aria-label="Close menu" @click="sidebarOpen = false"></button>

    <section class="admin-workspace">
      <header class="admin-topbar">
        <button class="sidebar-toggle" aria-label="Open menu" @click="sidebarOpen = true">☰</button>
        <div class="topbar-search"><span>⌕</span><input v-model="search" :placeholder="`Search ${currentLabel.toLowerCase()}…`" :disabled="currentView === 'overview' || currentView === 'settings'"></div>
        <div class="admin-profile"><span class="profile-avatar">{{ user.name.charAt(0).toUpperCase() }}</span><div><strong>{{ user.name }}</strong><small>Website administrator</small></div><button title="Sign out" @click="signOut">↪</button></div>
      </header>

      <main class="admin-content">
        <div v-if="error && !editor" class="admin-alert"><span>!</span>{{ error }}<button @click="error = ''">×</button></div>
        <div v-if="loading && !dashboard" class="admin-loading"><span class="admin-spinner"></span>Loading website content…</div>

        <template v-else-if="dashboard">
          <section v-if="currentView === 'overview'" class="overview-view">
            <div class="admin-welcome"><div><span class="admin-kicker">Friday, {{ new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long' }) }}</span><h1>Good day, {{ user.name.split(' ')[0] }}.</h1><p>Here’s what’s happening across the Aspire MFB website.</p></div><button class="admin-primary" @click="newItem('pages')">＋ Create a new page</button></div>
            <div class="stat-grid">
              <article><span class="stat-icon blue">▤</span><div><strong>{{ dashboard.stats.pages }}</strong><p>Total pages</p><small>{{ dashboard.stats.draft_pages }} draft{{ dashboard.stats.draft_pages === 1 ? '' : 's' }}</small></div></article>
              <article><span class="stat-icon cyan">◫</span><div><strong>{{ dashboard.stats.sections }}</strong><p>Content sections</p><small>Across all pages</small></div></article>
              <article><span class="stat-icon gold">⌖</span><div><strong>{{ dashboard.stats.branches }}</strong><p>Active branches</p><small>Customer locations</small></div></article>
              <article><span class="stat-icon green">?</span><div><strong>{{ dashboard.stats.faqs }}</strong><p>Published FAQs</p><small>Helpful answers</small></div></article>
            </div>
            <div class="overview-grid">
              <section class="admin-panel recent-panel"><div class="panel-heading"><div><h2>Recently updated</h2><p>Your latest page activity</p></div><button @click="switchView('pages')">View all</button></div><div class="recent-list"><article v-for="page in dashboard.pages.slice().sort((a,b) => new Date(b.updated_at)-new Date(a.updated_at)).slice(0,5)" :key="page.id"><span class="page-initial">{{ page.title.charAt(0) }}</span><div><strong>{{ page.title }}</strong><small>/{{ page.slug }}</small></div><span :class="['status-pill', page.is_published ? 'published' : 'draft']">{{ page.is_published ? 'Published' : 'Draft' }}</span><time>{{ formatDate(page.updated_at) }}</time><button @click="openEditor('pages', page)">•••</button></article></div></section>
              <aside class="admin-panel health-panel"><div class="panel-heading"><div><h2>Website health</h2><p>Content readiness</p></div><span class="health-good">Healthy</span></div><div class="progress-ring" :style="{ '--progress': `${publishedPercent * 3.6}deg` }"><div><strong>{{ publishedPercent }}%</strong><small>published</small></div></div><ul><li><span></span>{{ dashboard.stats.published_pages }} pages live</li><li><span></span>{{ dashboard.stats.navigation }} menu links active</li><li><i></i>{{ dashboard.stats.draft_pages }} drafts need attention</li></ul></aside>
            </div>
            <section class="quick-actions"><div><h2>Quick actions</h2><p>Jump straight into common updates.</p></div><button @click="newItem('branches')"><span>⌖</span><strong>Add a branch</strong><small>Publish a new location</small></button><button @click="newItem('faqs')"><span>?</span><strong>Add an FAQ</strong><small>Answer a customer question</small></button><button @click="editSettings"><span>⚙</span><strong>Bank details</strong><small>Update contact information</small></button></section>
          </section>

          <section v-else-if="currentView === 'settings'" class="collection-view">
            <div class="collection-heading"><div><span class="admin-kicker">Website identity</span><h1>Site settings</h1><p>Keep the bank’s core contact details and calls to action accurate.</p></div><button class="admin-primary" @click="editSettings">Edit site settings</button></div>
            <div class="settings-preview admin-panel"><div class="settings-brand"><span class="admin-logo">AMFB</span><div><small>Official website</small><h2>{{ dashboard.settings.bank_name }}</h2><p>{{ dashboard.settings.tagline }}</p></div></div><dl><div><dt>Email</dt><dd>{{ dashboard.settings.email || 'Not provided' }}</dd></div><div><dt>Phone</dt><dd>{{ dashboard.settings.phone || 'Not provided' }}</dd></div><div><dt>Primary action</dt><dd>{{ dashboard.settings.primary_cta_label }} → {{ dashboard.settings.primary_cta_url }}</dd></div><div><dt>Regulatory details</dt><dd>{{ dashboard.settings.regulatory_text || 'Not provided' }}</dd></div><div class="full"><dt>Office address</dt><dd>{{ dashboard.settings.address || 'Not provided' }}</dd></div></dl></div>
          </section>

          <section v-else class="collection-view">
            <div class="collection-heading"><div><span class="admin-kicker">Website content</span><h1>{{ currentLabel }}</h1><p>Review, organise and update the content customers see.</p></div><button class="admin-primary" @click="newItem(currentView)">＋ Add {{ singularResourceLabel(currentView, true) }}</button></div>
            <div class="content-toolbar"><p><strong>{{ currentItems.length }}</strong> items</p><span>Changes appear on the website after saving.</span></div>
            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead><tr><th>{{ currentView === 'pages' ? 'Page' : currentView === 'sections' ? 'Section' : currentView === 'navigation' ? 'Menu label' : currentView === 'branches' ? 'Branch' : 'Question' }}</th><th v-if="currentView !== 'pages'">Context</th><th>Status</th><th>Order</th><th></th></tr></thead>
                <tbody>
                  <tr v-for="item in currentItems" :key="item.id">
                    <td><div class="table-title"><span>{{ (item.title || item.heading || item.label || item.name || item.question || '?').charAt(0) }}</span><div><strong>{{ item.title || item.heading || item.label || item.name || item.question || 'Untitled section' }}</strong><small>{{ item.slug ? `/${item.slug}` : item.branch_type || item.kind || item.custom_url || '' }}</small></div></div></td>
                    <td v-if="currentView !== 'pages'">{{ item.page_title || item.address || (item.parent ? 'Submenu item' : 'Top-level menu') }}</td>
                    <td><span :class="['status-pill', (item.is_published ?? item.is_active) ? 'published' : 'draft']">{{ (item.is_published ?? item.is_active) ? 'Active' : 'Draft' }}</span></td>
                    <td>{{ item.sort_order }}</td>
                    <td><div class="row-actions"><button title="Edit" @click="openEditor(currentView, item)">Edit</button><button class="danger" title="Delete" @click="removeItem(currentView, item)">Delete</button></div></td>
                  </tr>
                  <tr v-if="!currentItems.length"><td :colspan="currentView === 'pages' ? 4 : 5"><div class="empty-state"><span>⌕</span><strong>No matching content</strong><p>Try a different search or add a new item.</p></div></td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </template>
      </main>
    </section>

    <div v-if="editor" class="editor-backdrop" @click.self="editor = null">
      <form class="editor-drawer" @submit.prevent="saveEditor">
        <header><div><span class="admin-kicker">{{ editor.id ? 'Edit content' : 'New content' }}</span><h2>{{ editorResource === 'settings' ? 'Site settings' : editor.title || editor.heading || editor.label || editor.name || editor.question || `New ${singularResourceLabel(editorResource)}` }}</h2></div><button type="button" aria-label="Close editor" @click="editor = null">×</button></header>
        <div class="editor-body">
          <p v-if="error" class="form-error">{{ error }}</p>
          <template v-if="editorResource === 'pages'">
            <div class="form-grid"><label>Page title<input v-model.trim="editor.title" required></label><label>URL slug<input v-model.trim="editor.slug" required></label></div>
            <label>Eyebrow text<input v-model="editor.eyebrow"></label><label>Hero heading<input v-model="editor.hero_title" required></label><label>Hero summary<textarea v-model="editor.hero_summary" rows="4"></textarea></label>
            <div class="form-grid"><label>Hero image path<input v-model="editor.hero_image" placeholder="/assets/photo.jpeg"></label><label>Image description<input v-model="editor.hero_image_alt"></label></div>
            <label>SEO description<textarea v-model="editor.meta_description" rows="3"></textarea></label>
            <div class="check-row"><label><input v-model="editor.is_published" type="checkbox"> Published</label><label><input v-model="editor.show_in_footer" type="checkbox"> Show in footer</label><label><input v-model="editor.is_homepage" type="checkbox"> Homepage</label></div>
          </template>
          <template v-else-if="editorResource === 'sections'">
            <div class="form-grid"><label>Page<select v-model="editor.page" required><option v-for="page in dashboard.pages" :key="page.id" :value="page.id">{{ page.title }}</option></select></label><label>Section type<select v-model="editor.kind"><option value="content">Rich content</option><option value="feature_grid">Feature grid</option><option value="list">List</option><option value="stats">Statistics</option><option value="faq">FAQs</option><option value="branches">Branches</option><option value="contact">Contact details</option><option value="cta">Call to action</option></select></label></div>
            <label>Heading<input v-model="editor.heading"></label><label>Supporting text<input v-model="editor.subheading"></label><label>Body content<textarea v-model="editor.body" rows="7"></textarea></label><label>Cards or list items (JSON)<textarea v-model="editor.itemsText" rows="7" class="code-field"></textarea></label>
            <div class="form-grid"><label>Visual tone<select v-model="editor.tone"><option value="light">Light</option><option value="cream">Cream</option><option value="blue">Blue</option><option value="navy">Navy</option></select></label><label>Display order<input v-model.number="editor.sort_order" type="number" min="0"></label></div><div class="check-row"><label><input v-model="editor.is_active" type="checkbox"> Active</label></div>
          </template>
          <template v-else-if="editorResource === 'navigation'">
            <label>Menu label<input v-model.trim="editor.label" required></label><div class="form-grid"><label>Linked page<select v-model="editor.page"><option :value="null">No linked page</option><option v-for="page in dashboard.pages" :key="page.id" :value="page.id">{{ page.title }}</option></select></label><label>Parent menu<select v-model="editor.parent"><option :value="null">Top level</option><option v-for="item in dashboard.navigation.filter(row => row.id !== editor.id && !row.parent)" :key="item.id" :value="item.id">{{ item.label }}</option></select></label></div><label>Custom URL<input v-model="editor.custom_url" placeholder="Optional — overrides linked page"></label><div class="check-row"><label><input v-model="editor.is_active" type="checkbox"> Active</label><label><input v-model="editor.open_in_new_tab" type="checkbox"> Open in new tab</label></div>
          </template>
          <template v-else-if="editorResource === 'branches'">
            <div class="form-grid"><label>Branch name<input v-model.trim="editor.name" required></label><label>Branch type<input v-model="editor.branch_type" placeholder="Head office, branch…"></label></div><label>Address<textarea v-model="editor.address" rows="5" required></textarea></label><label>Phone number<input v-model="editor.phone"></label><div class="check-row"><label><input v-model="editor.is_active" type="checkbox"> Active location</label></div>
          </template>
          <template v-else-if="editorResource === 'faqs'">
            <label>Question<input v-model.trim="editor.question" required></label><label>Answer<textarea v-model="editor.answer" rows="8" required></textarea></label><label>Related page<select v-model="editor.page"><option :value="null">All pages</option><option v-for="page in dashboard.pages" :key="page.id" :value="page.id">{{ page.title }}</option></select></label><div class="check-row"><label><input v-model="editor.is_active" type="checkbox"> Published</label></div>
          </template>
          <template v-else-if="editorResource === 'settings'">
            <div class="form-grid"><label>Bank name<input v-model="editor.bank_name" required></label><label>Short name<input v-model="editor.short_name" required></label></div><label>Tagline<input v-model="editor.tagline"></label><label>Website description<textarea v-model="editor.description" rows="4"></textarea></label><div class="form-grid"><label>Phone<input v-model="editor.phone"></label><label>Primary email<input v-model="editor.email" type="email"></label></div><label>Secondary email<input v-model="editor.secondary_email" type="email"></label><label>Address<textarea v-model="editor.address" rows="4"></textarea></label><label>Regulatory text<input v-model="editor.regulatory_text"></label><label>Footer text<textarea v-model="editor.footer_text" rows="3"></textarea></label><div class="form-grid"><label>Primary button label<input v-model="editor.primary_cta_label"></label><label>Primary button URL<input v-model="editor.primary_cta_url"></label></div>
          </template>
          <div v-if="editorResource !== 'settings' && editorResource !== 'sections'" class="form-grid compact"><label>Display order<input v-model.number="editor.sort_order" type="number" min="0"></label></div>
        </div>
        <footer><button type="button" class="admin-secondary" @click="editor = null">Cancel</button><button class="admin-primary" :disabled="saving">{{ saving ? 'Saving…' : 'Save changes' }}</button></footer>
      </form>
    </div>
    <div v-if="toast" class="admin-toast"><span>✓</span>{{ toast }}</div>
  </div>
</template>

<style src="../admin.css"></style>
