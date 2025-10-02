import { CreateUserPayload } from '../types'
import { useAuthStore } from '../stores/auth'
import { IUser } from '../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
  isBlob = false,
): Promise<T> => {
  const auth = useAuthStore()
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (auth.access) headers.set('Authorization', `Bearer ${auth.access}`)

  const doFetch = async (): Promise<Response> => {
    return fetch(`${BASE_URL}${path}`, { ...options, headers, credentials: 'omit' })
  }

  let resp = await doFetch()
  if (resp.status === 401) {
    const ok = await refreshToken()
    if (ok) {
      if (auth.access) headers.set('Authorization', `Bearer ${auth.access}`)
      resp = await doFetch()
    }
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(text || `HTTP ${resp.status}`)
  }

  if (isBlob) return (await resp.blob()) as unknown as T
  if (resp.status === 204) return undefined as T
  return (await resp.json()) as T
}

export const createUser = async (payload: CreateUserPayload): Promise<IUser> => {
  return apiFetch<IUser>(`/api/admin/users/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const refreshToken = async () => {
  const auth = useAuthStore()
  if (!auth.refresh) return false
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: auth.refresh }),
    })
    if (!res.ok) return false
    const data = await res.json()
    auth.setTokens(data.access, auth.refresh)
    return true
  } catch {
    return false
  }
}

export const fetchSession = (): Promise<IUser> => {
  return apiFetch<IUser>('/api/auth/me/')
}

export const download = async (path: string, fallbackName = 'file') => {
  const blob = await apiFetch<Blob>(path, { method: 'GET' }, true)
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const cd = (blob as any).name || fallbackName
  a.download = cd
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
