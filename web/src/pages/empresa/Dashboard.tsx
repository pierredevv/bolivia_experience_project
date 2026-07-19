import { useState, useEffect } from 'react'
import { 
  MapPin, Star, MessageSquare, Heart, Loader2
} from 'lucide-react'
import { empresaApi } from '../../services/api'

interface DashboardData {
  stats: {
    totalReviews: number
    pendingReviews: number
    averageRating: number
  }
  recentReviews: any[]
}

export default function EmpresaDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const response = await empresaApi.getStats()
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
        <Loader2 className="h-8 w-8 animate-spin text-secondary-600" />
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 mt-1">Bienvenido de vuelta</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Reseñas Totales</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{data?.stats.totalReviews || 0}</p>
            </div>
            <div className="bg-yellow-500 p-2.5 rounded-xl">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Pendientes</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{data?.stats.pendingReviews || 0}</p>
            </div>
            <div className="bg-orange-500 p-2.5 rounded-xl">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Rating Promedio</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {data?.stats.averageRating ? Number(data.stats.averageRating).toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="bg-green-500 p-2.5 rounded-xl">
              <Star className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-neutral-900">Reseñas Recientes</h3>
            <a href="/empresa/reviews" className="text-sm text-secondary-700 hover:text-secondary-800">
              Ver todas
            </a>
          </div>
          <div className="p-4 space-y-3">
            {data?.recentReviews?.length === 0 ? (
              <p className="text-center text-neutral-500 py-4">No hay reseñas recientes</p>
            ) : (
              data?.recentReviews?.map((review) => (
                <div key={review.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50">
                  <div className="h-8 w-8 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-secondary-700">
                      {review.user?.name?.[0] || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-neutral-900">{review.user?.name}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-neutral-600 mt-1">{review.comment}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-neutral-900">Acciones Rápidas</h3>
          </div>
          <div className="p-4 space-y-3">
            <a
              href="/empresa/place"
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors text-left"
            >
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">Editar Información</p>
                <p className="text-sm text-neutral-500">Actualiza los datos de tu negocio</p>
              </div>
            </a>
            <a
              href="/empresa/reviews"
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors text-left"
            >
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">Responder Reseñas</p>
                <p className="text-sm text-neutral-500">
                  {data?.stats.pendingReviews || 0} reseñas pendientes
                </p>
              </div>
            </a>
            <a
              href="/empresa/promotions"
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors text-left"
            >
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">Crear Promoción</p>
                <p className="text-sm text-neutral-500">Atrae más clientes con ofertas</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
