import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { placesApi } from '../services/api'

export function usePlaces(params?: { page?: number; limit?: number; search?: string; category?: string; isActive?: boolean; allStatuses?: boolean }) {
  return useQuery({
    queryKey: ['places', params],
    queryFn: async () => {
      const apiParams: any = {
        page: params?.page,
        limit: params?.limit,
      };
      if (params?.search) apiParams.search = params.search;
      if (params?.category) apiParams.categoryId = params.category;
      if (params?.allStatuses) {
        apiParams.allStatuses = true;
      } else if (params?.isActive !== undefined) {
        apiParams.isActive = params.isActive;
      }
      const response = await placesApi.getAll(apiParams)
      return response.data.data
    },
  })
}

export function usePlace(id: string) {
  return useQuery({
    queryKey: ['place', id],
    queryFn: async () => {
      const response = await placesApi.getById(id)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useFeaturedPlaces() {
  return useQuery({
    queryKey: ['places-featured'],
    queryFn: async () => {
      const response = await placesApi.getFeatured()
      return response.data.data
    },
  })
}

export function useCreatePlace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await placesApi.create(data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
    },
  })
}

export function useUpdatePlace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await placesApi.update(id, data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
    },
  })
}

export function useDeletePlace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await placesApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
    },
  })
}

export function useTogglePlaceStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await placesApi.toggleStatus(id)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
    },
  })
}
