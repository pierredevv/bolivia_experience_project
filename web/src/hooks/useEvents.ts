import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '../services/api'

export function useEvents(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: async () => {
      const response = await eventsApi.getAll(params)
      return response.data.data
    },
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await eventsApi.create(data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await eventsApi.update(id, data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await eventsApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useAdminEvents(params?: {
  page?: number
  limit?: number
  status?: string
}) {
  return useQuery({
    queryKey: ['events-admin', params],
    queryFn: async () => {
      const response = await eventsApi.adminGetAll(params)
      return response.data.data
    },
  })
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: 'pending' | 'approved' | 'rejected'
    }) => {
      const response = await eventsApi.updateStatus(id, status)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events-admin'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
