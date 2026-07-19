import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth as useAuthContext } from '../contexts/AuthContext'
import { authApi } from '../services/api'

interface LoginResponse {
  user: {
    id: string
    email: string
    name: string
    role: 'admin' | 'empresa' | 'usuario'
    photoUrl?: string
    approvalStatus?: string
  }
  accessToken: string
  refreshToken: string
}

export function useLogin(expectedRole?: 'admin' | 'empresa') {
  const { login } = useAuthContext()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await authApi.login(email, password)
      const data = response.data.data as LoginResponse
      
      if (expectedRole && data.user.role !== expectedRole) {
        throw new Error(
          expectedRole === 'admin'
            ? 'Esta cuenta no tiene permisos de administrador'
            : 'Esta cuenta no tiene acceso al portal de empresas'
        )
      }
      
      return data
    },
    onSuccess: (data) => {
      login(data.accessToken, data.refreshToken, data.user)
      if (data.user.role === 'admin') {
        navigate('/admin-panel')
      } else {
        navigate('/business')
      }
    },
  })
}

export function useRegisterBusiness() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await authApi.registerBusiness(data)
      return response.data
    }
  })
}
