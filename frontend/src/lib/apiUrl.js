const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const apiBase = rawApiUrl.replace(/\/+$/, '')
export const apiOrigin = apiBase.replace(/\/api$/, '')

export function apiUrl(path) {
  return `${path.startsWith('/api') ? apiOrigin : apiBase}${path}`
}
