import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, usersApi } from '../services/api'

export function useUsers(params?: { page?: number; limit?: number; search?: string; role?: string }) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: async () => {
      const response = await adminApi.getUsers(params)
      return response.data.data
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      void id
      const response = await usersApi.updateMe(data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

export function useBanUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      // Ban endpoint doesn't exist yet, placeholder for future
      return { id }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}
