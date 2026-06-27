import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
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
}

// Users
export const usersApi = {
  getAll: (params?: any) => api.get('/admin/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  ban: (id: string) => api.patch(`/users/${id}/ban`),
}

// Places
export const placesApi = {
  getAll: (params?: any) => api.get('/places', { params }),
  getById: (id: string) => api.get(`/places/${id}`),
  create: (data: any) => api.post('/places', data),
  update: (id: string, data: any) => api.put(`/places/${id}`, data),
  delete: (id: string) => api.delete(`/places/${id}`),
  toggleStatus: (id: string) => api.patch(`/places/${id}/status`),
}

// Categories
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
}

// Reviews
export const reviewsApi = {
  getByPlace: (placeId: string, params?: any) =>
    api.get(`/places/${placeId}/reviews`, { params }),
  getAll: (params?: any) => api.get('/admin/reviews', { params }),
  approve: (id: string) => api.patch(`/reviews/${id}/approve`),
  delete: (id: string) => api.delete(`/reviews/${id}`),
}

// Events
export const eventsApi = {
  getAll: (params?: any) => api.get('/events', { params }),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
}

// Promotions
export const promotionsApi = {
  getAll: (params?: any) => api.get('/promotions', { params }),
  create: (placeId: string, data: any) =>
    api.post(`/places/${placeId}/promotions`, data),
  update: (id: string, data: any) => api.put(`/promotions/${id}`, data),
  delete: (id: string) => api.delete(`/promotions/${id}`),
}

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/admin/dashboard'),
  getEmpresaStats: () => api.get('/empresa/dashboard'),
}

// Empresa
export const empresaApi = {
  getPlace: () => api.get('/empresa/place'),
  updatePlace: (data: any) => api.put('/empresa/place', data),
  getReviews: (params?: any) => api.get('/empresa/reviews', { params }),
  getStats: () => api.get('/empresa/analytics'),
}
