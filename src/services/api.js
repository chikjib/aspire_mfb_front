const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
let csrfToken = ''

function getCookie(name) {
  const value = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`))
  return value ? decodeURIComponent(value.split('=').slice(1).join('=')) : ''
}

async function request(path, options = {}) {
  const headers = { Accept: 'application/json', ...(options.headers || {}) }
  if (options.body) headers['Content-Type'] = 'application/json'
  const requestCsrfToken = csrfToken || getCookie('csrftoken')
  if (requestCsrfToken) headers['X-CSRFToken'] = requestCsrfToken
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  })
  const payload = response.status === 204 ? null : await response.json().catch(() => ({}))
  if (payload?.csrf_token) csrfToken = payload.csrf_token
  if (!response.ok) {
    const detail = typeof payload.detail === 'object'
      ? Object.values(payload.detail).flat().join(' ')
      : payload.detail
    const error = new Error(detail || `CMS request failed with status ${response.status}`)
    error.status = response.status
    throw error
  }
  return payload
}

export const getSite = () => request('/site/')
export const getPage = (slug) => request(`/pages/${encodeURIComponent(slug)}/`)
export const getBranches = () => request('/branches/')
export const getFaqs = () => request('/faqs/')

export const getCmsSession = () => request('/cms/session/')
export const cmsLogin = (credentials) => request('/cms/login/', {
  method: 'POST', body: JSON.stringify(credentials),
})
export const cmsLogout = () => request('/cms/logout/', { method: 'POST' })
export const getCmsDashboard = () => request('/cms/dashboard/')
export const saveCmsSettings = (settings) => request('/cms/settings/', {
  method: 'PUT', body: JSON.stringify(settings),
})
export const createCmsResource = (resource, payload) => request(`/cms/${resource}/`, {
  method: 'POST', body: JSON.stringify(payload),
})
export const updateCmsResource = (resource, id, payload) => request(`/cms/${resource}/${id}/`, {
  method: 'PUT', body: JSON.stringify(payload),
})
export const deleteCmsResource = (resource, id) => request(`/cms/${resource}/${id}/`, {
  method: 'DELETE',
})

export async function checkApiHealth() {
  try {
    const payload = await request('/health/')
    return payload.status === 'ok'
  } catch {
    return false
  }
}
