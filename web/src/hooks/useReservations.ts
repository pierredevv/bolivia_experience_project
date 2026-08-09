import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reservationsApi } from '../services/api'

export function useSocioReservations(status?: string) {
  return useQuery({
    queryKey: ['socio-reservations', status || 'all'],
    queryFn: async () => {
      const response = await reservationsApi.getSocioReservations(status)
      return response.data.data
    },
  })
}

export function useConfirmReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await reservationsApi.confirm(id)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socio-reservations'] })
    },
  })
}

export function useRejectReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await reservationsApi.reject(id)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socio-reservations'] })
    },
  })
}

export function useCompleteReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await reservationsApi.complete(id)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socio-reservations'] })
    },
  })
}

export function useNoShowReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await reservationsApi.noShow(id)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socio-reservations'] })
    },
  })
}
