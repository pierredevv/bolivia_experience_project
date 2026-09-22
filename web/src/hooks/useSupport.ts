import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supportApi } from '../services/api'

export function useAdminSupportTickets(params?: {
  page?: number
  limit?: number
  status?: string
}) {
  return useQuery({
    queryKey: ['admin-support-tickets', params],
    queryFn: async () => {
      const response = await supportApi.getTickets(params)
      return response.data.data
    },
  })
}

export function useAdminSupportTicket(id: string) {
  return useQuery({
    queryKey: ['admin-support-ticket', id],
    queryFn: async () => {
      const response = await supportApi.getTicket(id)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useUpdateSupportStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await supportApi.updateStatus(id, status)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] })
      queryClient.invalidateQueries({ queryKey: ['admin-support-ticket'] })
    },
  })
}

export function useAddSupportMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: string }) => {
      const response = await supportApi.addMessage(id, body)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-ticket'] })
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] })
    },
  })
}