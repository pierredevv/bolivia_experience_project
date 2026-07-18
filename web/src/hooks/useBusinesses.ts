import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../services/api'

export function useAdminBusinesses(status?: string) {
  return useQuery({
    queryKey: ['admin-businesses', status],
    queryFn: async () => {
      const response = await adminApi.getBusinesses(status)
      return response.data.data
    },
  })
}

export function useApproveBusiness() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminApi.approveBusiness(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] })
    },
  })
}

export function useSuspendBusiness() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminApi.suspendBusiness(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] })
    },
  })
}
