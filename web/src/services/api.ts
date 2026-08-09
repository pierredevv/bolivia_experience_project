import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')
      const userId = localStorage.getItem('userId')

      if (!refreshToken || !userId) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('user')
        window.location.href = '/'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post('/api/v1/auth/refresh', {
          userId,
          refreshToken,
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data.data
        localStorage.setItem('token', accessToken)
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken)
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        processQueue(null, accessToken)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('user')
        window.location.href = '/'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  registerBusiness: (data: any) => api.post('/auth/register-business', data),
  refreshToken: (userId: string, refreshToken: string) =>
    api.post('/auth/refresh', { userId, refreshToken }),
}

// Users
export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: any) => api.put('/users/me', data),
  getById: (id: string) => api.get(`/users/${id}`),
}

// Admin
export const adminApi = {
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getReviews: (params?: any) => api.get('/admin/reviews', { params }),
  getDashboard: () => api.get('/admin/dashboard'),
  getBusinesses: (status?: string) => api.get('/admin/businesses', { params: { status } }),
  approveBusiness: (id: string) => api.patch(`/admin/businesses/${id}/approve`),
  suspendBusiness: (id: string) => api.patch(`/admin/businesses/${id}/suspend`),
  togglePremium: (id: string) => api.patch(`/admin/businesses/${id}/premium`),
}

// Places
export const placesApi = {
  getAll: (params?: any) => api.get('/places', { params }),
  getFeatured: () => api.get('/places/featured'),
  getById: (id: string) => api.get(`/places/${id}`),
  create: (data: any) => api.post('/places', data),
  update: (id: string, data: any) => api.put(`/places/${id}`, data),
  delete: (id: string) => api.delete(`/places/${id}`),
  toggleStatus: (id: string) => api.patch(`/places/${id}/status`),
  getPhotos: (id: string) => api.get(`/places/${id}/photos`),
  uploadPhoto: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/places/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// Categories
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
}

// Reviews
export const reviewsApi = {
  getByPlace: (placeId: string, params?: any) =>
    api.get(`/places/${placeId}/reviews`, { params }),
  approve: (id: string) =>
    api.patch(`/reviews/${id}/status`, { status: 'PUBLISHED' }),
  delete: (id: string) => api.delete(`/reviews/${id}`),
  respond: (id: string, comment: string) =>
    api.post(`/reviews/${id}/respond`, { comment }),
}

// Events
export const eventsApi = {
  getAll: (params?: any) => api.get('/events', { params }),
  getToday: () => api.get('/events/today'),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
}

// Promotions
export const promotionsApi = {
  getAll: (params?: any) => api.get('/promotions', { params }),
  getById: (id: string) => api.get(`/promotions/${id}`),
  create: (placeId: string, data: any) =>
    api.post(`/promotions/places/${placeId}`, data),
  update: (id: string, data: any) => api.put(`/promotions/${id}`, data),
  delete: (id: string) => api.delete(`/promotions/${id}`),
}

// Empresa
export const empresaApi = {
  getPlace: () => api.get('/empresa/place'),
  updatePlace: (data: any) => api.put('/empresa/place', data),
  getReviews: (params?: any) => api.get('/empresa/reviews', { params }),
  getStats: () => api.get('/empresa/analytics'),
  getDashboard: () => api.get('/empresa/dashboard'),
}

// Products / Experiences
export const productsApi = {
  getMyProducts: () => api.get('/products/my'),
  createProduct: (data: any) => api.post('/products', data),
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  uploadPhoto: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/products/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  // Availability slots ("Reserva tu lugar")
  getMySlots: (productId: string) => api.get(`/products/${productId}/slots/mine`),
  createSlot: (productId: string, data: { date: string; time: string; capacity?: number }) =>
    api.post(`/products/${productId}/slots`, data),
  deleteSlot: (productId: string, slotId: string) =>
    api.delete(`/products/${productId}/slots/${slotId}`),
}

// Reservations (socio / empresa)
export const reservationsApi = {
  getSocioReservations: (status?: string) =>
    api.get('/reservations/socio', { params: { status } }),
  confirm: (id: string) => api.post(`/reservations/${id}/confirm`),
  reject: (id: string) => api.post(`/reservations/${id}/reject`),
  complete: (id: string) => api.post(`/reservations/${id}/complete`),
  noShow: (id: string) => api.post(`/reservations/${id}/no-show`),
}
