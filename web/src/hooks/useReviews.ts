import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, reviewsApi } from '../services/api'

export function useAdminReviews(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['admin-reviews', params],
    queryFn: async () => {
      const response = await adminApi.getReviews(params)
      return response.data.data
    },
  })
}

export function usePlaceReviews(placeId: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['place-reviews', placeId, params],
    queryFn: async () => {
      const response = await reviewsApi.getByPlace(placeId, params)
      return response.data.data
    },
    enabled: !!placeId,
  })
}

export function useApproveReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await reviewsApi.approve(id)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['place-reviews'] })
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await reviewsApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['place-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['empresa-reviews'] })
    },
  })
}

export function useRespondToReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      const response = await reviewsApi.respond(id, comment)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['place-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['empresa-reviews'] })
    },
  })
}
