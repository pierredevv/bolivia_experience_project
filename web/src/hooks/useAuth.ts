import { useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'empresa' | 'usuario'
  photoUrl?: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
    error: null,
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        setState({ user, token, loading: false, error: null })
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setState({ user: null, token: null, loading: false, error: null })
      }
    } else {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const response = await authApi.login(email, password)
      const { user, accessToken, refreshToken } = response.data

      localStorage.setItem('token', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))

      setState({ user, token: accessToken, loading: false, error: null })
      return user
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al iniciar sesión'
      setState(prev => ({ ...prev, loading: false, error: message }))
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setState({ user: null, token: null, loading: false, error: null })
  }, [])

  const isAdmin = state.user?.role === 'admin'
  const isEmpresa = state.user?.role === 'empresa'

  return {
    ...state,
    login,
    logout,
    isAdmin,
    isEmpresa,
    isAuthenticated: !!state.token,
  }
}
