import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import api, { authApi, placesApi, categoriesApi, eventsApi, promotionsApi, empresaApi, reviewsApi } from '../../services/api'

describe('api service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('has correct baseURL', () => {
    expect(api.defaults.baseURL).toBe('/api/v1')
  })

  it('has correct timeout', () => {
    expect(api.defaults.timeout).toBe(10000)
  })

  it('sets Authorization header from localStorage', () => {
    localStorage.setItem('token', 'test-token')
    const config = { headers: {} as any }
    const interceptor = (api.interceptors.request as any).handlers[0].fulfilled
    const result = interceptor(config)
    expect(result.headers.Authorization).toBe('Bearer test-token')
  })

  it('does not set Authorization header when no token', () => {
    const config = { headers: {} as any }
    const interceptor = (api.interceptors.request as any).handlers[0].fulfilled
    const result = interceptor(config)
    expect(result.headers.Authorization).toBeUndefined()
  })
})

describe('API modules', () => {
  it('authApi has expected methods', () => {
    expect(typeof authApi.login).toBe('function')
    expect(typeof authApi.register).toBe('function')
    expect(typeof authApi.refreshToken).toBe('function')
  })

  it('placesApi has expected methods', () => {
    expect(typeof placesApi.getAll).toBe('function')
    expect(typeof placesApi.getById).toBe('function')
    expect(typeof placesApi.create).toBe('function')
    expect(typeof placesApi.update).toBe('function')
    expect(typeof placesApi.delete).toBe('function')
  })

  it('categoriesApi has expected methods', () => {
    expect(typeof categoriesApi.getAll).toBe('function')
    expect(typeof categoriesApi.create).toBe('function')
    expect(typeof categoriesApi.update).toBe('function')
    expect(typeof categoriesApi.delete).toBe('function')
  })

  it('eventsApi has expected methods', () => {
    expect(typeof eventsApi.getAll).toBe('function')
    expect(typeof eventsApi.create).toBe('function')
    expect(typeof eventsApi.update).toBe('function')
    expect(typeof eventsApi.delete).toBe('function')
  })

  it('promotionsApi has expected methods', () => {
    expect(typeof promotionsApi.getAll).toBe('function')
    expect(typeof promotionsApi.create).toBe('function')
    expect(typeof promotionsApi.update).toBe('function')
    expect(typeof promotionsApi.delete).toBe('function')
  })

  it('empresaApi has expected methods', () => {
    expect(typeof empresaApi.getPlace).toBe('function')
    expect(typeof empresaApi.updatePlace).toBe('function')
    expect(typeof empresaApi.getReviews).toBe('function')
    expect(typeof empresaApi.getStats).toBe('function')
  })

  it('reviewsApi has expected methods', () => {
    expect(typeof reviewsApi.getByPlace).toBe('function')
    expect(typeof reviewsApi.approve).toBe('function')
    expect(typeof reviewsApi.delete).toBe('function')
    expect(typeof reviewsApi.respond).toBe('function')
  })
})
