const BASE = import.meta.env.VITE_API_URL || ''
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || 'fca-secret-2024'

async function req<T>(method: string, path: string, body?: unknown, auth = false): Promise<T> {
  const headers: Record<string, string> = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (auth) headers['x-admin-secret'] = ADMIN_SECRET
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data as T
}

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', 'fc-auto')
  const res = await fetch('https://api.cloudinary.com/v1_1/deqfsmdab/auto/upload', {
    method: 'POST',
    body: form,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Upload failed')
  return data.secure_url as string
}

export async function uploadFiles(files: File[]): Promise<string[]> {
  return Promise.all(files.map(uploadFile))
}

// Session ID persistant
export function getSessionId(): string {
  let id = localStorage.getItem('fca_session')
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('fca_session', id) }
  return id
}

export const api = {
  // vehicles (public read, auth write)
  getVehicles: async (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    const res = await req<{ data: unknown[]; total: number } | unknown[]>('GET', `/api/vehicles${qs}`)
    return Array.isArray(res) ? { data: res, total: res.length } : res
  },
  getVehicle: (id: string) => req<unknown>('GET', `/api/vehicles/${id}`),
  createVehicle: (data: unknown) => req<unknown>('POST', '/api/vehicles', data, true),
  updateVehicle: (id: string, data: unknown) => req<unknown>('PUT', `/api/vehicles/${id}`, data, true),
  deleteVehicle: (id: string) => req<unknown>('DELETE', `/api/vehicles/${id}`, undefined, true),

  // listings
  getListings: async (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    const res = await req<{ data: unknown[]; total: number } | unknown[]>('GET', `/api/listings${qs}`, undefined, true)
    return Array.isArray(res) ? { data: res, total: res.length } : res
  },
  createListing: (data: unknown) => req<unknown>('POST', '/api/listings', data),
  updateListingStatus: (id: string, status: string) => req<unknown>('PATCH', `/api/listings/${id}`, { status }, true),

  // blog
  getBlog: async (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    const res = await req<{ data: unknown[]; total: number } | unknown[]>('GET', `/api/blog${qs}`)
    return Array.isArray(res) ? { data: res, total: res.length } : res
  },
  createPost: (data: unknown) => req<unknown>('POST', '/api/blog', data, true),
  updatePost: (id: string, data: unknown) => req<unknown>('PUT', `/api/blog/${id}`, data, true),
  deletePost: (id: string) => req<unknown>('DELETE', `/api/blog/${id}`, undefined, true),

  // comments
  getComments: (postId: string) => req<unknown[]>('GET', `/api/comments/${postId}`),
  addComment: (data: unknown) => req<unknown>('POST', '/api/comments', data),
  deleteComment: (id: string) => req<unknown>('DELETE', `/api/comments/${id}`, undefined, true),
  getPostStats: (id: string) => req<{ comments: number; likes: number }>('GET', `/api/blog/${id}/stats`),

  // likes
  toggleLike: (postId: string, sessionId: string) => req<{ liked: boolean }>('POST', '/api/likes', { post_id: postId, session_id: sessionId }),
  getLikeStatus: (postId: string, sessionId: string) => req<{ liked: boolean }>('GET', `/api/likes/${postId}/${sessionId}`),

  // users
  getUsers: () => req<unknown[]>('GET', '/api/users', undefined, true),
  createUser: (data: unknown) => req<unknown>('POST', '/api/users', data, true),
  updateUser: (id: string, data: unknown) => req<unknown>('PUT', `/api/users/${id}`, data, true),
  deleteUser: (id: string) => req<unknown>('DELETE', `/api/users/${id}`, undefined, true),
  login: (email: string, password: string) => req<unknown>('POST', '/api/users/login', { email, password }),

  // bookings
  getBookings: () => req<unknown[]>('GET', '/api/bookings', undefined, true),
  updateBookingStatus: (id: string, status: string) => req<unknown>('PATCH', `/api/bookings/${id}`, { status }, true),
}
