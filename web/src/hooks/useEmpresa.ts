import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { empresaApi } from '../services/api'

export function useEmpresaPlace() {
  return useQuery({
    queryKey: ['empresa-place'],
    queryFn: async () => {
      const response = await empresaApi.getPlace()
      return response.data.data
    },
  })
}

export function useUpdateEmpresaPlace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await empresaApi.updatePlace(data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresa-place'] })
      queryClient.invalidateQueries({ queryKey: ['empresa-dashboard'] })
    },
  })
}

export function useEmpresaReviews(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['empresa-reviews', params],
    queryFn: async () => {
      const response = await empresaApi.getReviews(params)
      return response.data.data
    },
  })
}

export function useEmpresaStats() {
  return useQuery({
    queryKey: ['empresa-stats'],
    queryFn: async () => {
      const response = await empresaApi.getStats()
      return response.data.data
    },
  })
}

export function useEmpresaDashboard() {
  return useQuery({
    queryKey: ['empresa-dashboard'],
    queryFn: async () => {
      const response = await empresaApi.getDashboard()
      return response.data.data
    },
  })
}
