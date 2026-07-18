import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { promotionsApi } from '../services/api'

export function usePromotions(params?: { page?: number; limit?: number; all?: boolean; placeId?: string }) {
  return useQuery({
    queryKey: ['promotions', params],
    queryFn: async () => {
      const response = await promotionsApi.getAll(params)
      return response.data.data
    },
  })
}

export function useCreatePromotion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ placeId, data }: { placeId: string; data: any }) => {
      const response = await promotionsApi.create(placeId, data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
    },
  })
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await promotionsApi.update(id, data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
    },
  })
}

export function useDeletePromotion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await promotionsApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
    },
  })
}
