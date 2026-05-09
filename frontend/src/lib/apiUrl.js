const defaultApiUrl = import.meta.env.PROD
  ? 'https://wildlife-compliance-api.onrender.com/api'
  : '/api'
const rawApiUrl = import.meta.env.VITE_API_URL || defaultApiUrl

export const apiBase = rawApiUrl.replace(/\/+$/, '')
export const apiOrigin = apiBase.replace(/\/api$/, '')

export function apiUrl(path) {
  const apiPath = path.startsWith('/api') ? path : `/api${path}`
  return `${apiOrigin}${apiPath}`
}
