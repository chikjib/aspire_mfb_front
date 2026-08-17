import { createRouter, createWebHistory } from 'vue-router'

import AboutPage from '../pages/AboutPage.vue'
import BranchesPage from '../pages/BranchesPage.vue'
import ContactPage from '../pages/ContactPage.vue'
import EChannelPage from '../pages/EChannelPage.vue'
import HomePage from '../pages/HomePage.vue'
import LegalPage from '../pages/LegalPage.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'
import ProductPage from '../pages/ProductPage.vue'
import SavingsPage from '../pages/SavingsPage.vue'
import AdminDashboard from '../pages/AdminDashboard.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/savings-product', name: 'savings-product', component: SavingsPage },
  { path: '/savings-accounts', name: 'savings-accounts', component: ProductPage },
  { path: '/current-accounts', name: 'current-accounts', component: ProductPage },
  { path: '/fixed-deposit', name: 'fixed-deposit', component: ProductPage },
  { path: '/e-channel', name: 'e-channel', component: EChannelPage },
  { path: '/aspire-mobile-transact', name: 'mobile-transact', component: ProductPage },
  { path: '/aspire-debit-card', name: 'debit-card', component: ProductPage },
  { path: '/aspire-internet-banking', name: 'internet-banking', component: ProductPage },
  { path: '/aspire-agency-banking', name: 'agency-banking', component: ProductPage },
  { path: '/nibss', name: 'nibss', component: ProductPage },
  { path: '/about-us', name: 'about-us', component: AboutPage },
  { path: '/aspire', name: 'aspire', component: AboutPage },
  { path: '/branches', name: 'branches', component: BranchesPage },
  { path: '/contact', name: 'contact', component: ContactPage },
  { path: '/loan', name: 'loan', component: ProductPage },
  { path: '/privacy-policy', name: 'privacy-policy', component: LegalPage },
  { path: '/terms-and-conditions', name: 'terms-and-conditions', component: LegalPage },
  { path: '/admin/login', name: 'admin-login', component: AdminDashboard, meta: { admin: true } },
  { path: '/admin/dashboard', name: 'admin-dashboard', component: AdminDashboard, meta: { admin: true } },
  { path: '/cms-admin', redirect: '/admin/login' },
  { path: '/dashboard', redirect: '/admin/dashboard' },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
})

router.afterEach((to) => {
  const routeTitle = typeof to.name === 'string'
    ? to.name.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Aspire MFB'
  document.title = `${routeTitle} | Aspire Microfinance Bank`
})

export default router
