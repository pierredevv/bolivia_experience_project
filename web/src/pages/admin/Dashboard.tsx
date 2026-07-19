import { useState, useEffect } from 'react'
import { 
  Users, MapPin, Star, Calendar, ArrowUpRight, Loader2
} from 'lucide-react'
import { dashboardApi } from '../../services/api'

interface DashboardStats {
  stats: {
    totalUsers: number
    totalPlaces: number
    totalReviews: number
    totalEvents: number
    activePromotions: number
  }
  recentReviews: any[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const response = await dashboardApi.getStats()
      setData(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        {error}
      </div>
    )
  }

  const stats = data ? [
    {
      name: 'Usuarios Totales',
      value: data.stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Lugares Activos',
      value: data.stats.totalPlaces.toLocaleString(),
      icon: MapPin,
      color: 'bg-green-500',
    },
    {
      name: 'Reseñas',
      value: data.stats.totalReviews.toLocaleString(),
      icon: Star,
      color: 'bg-yellow-500',
    },
    {
      name: 'Eventos Activos',
      value: data.stats.totalEvents.toLocaleString(),
      icon: Calendar,
      color: 'bg-purple-500',
    },
  ] : []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 mt-1">Resumen general de la plataforma</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">{stat.name}</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold text-neutral-900">Reseñas Recientes</h2>
            <a href="/admin/reviews" className="text-sm text-primary-700 hover:text-primary-800 flex items-center gap-1">
              Ver todas <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <div className="p-4">
            {data?.recentReviews?.length === 0 ? (
              <p className="text-center text-neutral-500 py-4">No hay reseñas recientes</p>
            ) : (
              data?.recentReviews?.map((review) => (
                <div key={review.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50">
                  <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary-700">
                      {review.user?.name?.[0] || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-neutral-900">{review.user?.name}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500">{review.place?.name}</p>
                    <p className="text-sm text-neutral-700 mt-1">{review.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Promociones Activas</h2>
          <div className="text-center py-8">
            <p className="text-4xl font-bold text-primary-600">{data?.stats.activePromotions || 0}</p>
            <p className="text-neutral-500 mt-2">Promociones activas</p>
          </div>
        </div>
      </div>
    </div>
  )
}
