const configuredApiUrl = import.meta.env.VITE_API_URL || ''
const hasPlaceholderApiUrl = /your-render|your-render-backend|wildlife-compliance-api\.onrender\.com/i.test(configuredApiUrl)
const rawApiUrl = configuredApiUrl && !hasPlaceholderApiUrl ? configuredApiUrl : '/api'

export const apiBase = rawApiUrl.replace(/\/+$/, '')
export const apiOrigin = apiBase.replace(/\/api$/, '')

export function apiUrl(path) {
  const apiPath = path.startsWith('/api') ? path : `/api${path}`
  const isVercelHost = typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')

  if (isVercelHost) {
    return apiPath
  }

  return `${apiOrigin}${apiPath}`
}
