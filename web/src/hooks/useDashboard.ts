import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../services/api'

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await adminApi.getDashboard()
      return response.data.data
    },
  })
}
