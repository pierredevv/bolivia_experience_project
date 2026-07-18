import {
  MapPin, Star, TrendingUp, Eye, MessageSquare, Heart,
  ArrowUpRight, Loader2
} from 'lucide-react'
import { useEmpresaDashboard } from '../../hooks/useEmpresa'
import { useNavigate } from 'react-router-dom'

export default function EmpresaDashboard() {
  const { data, isLoading, error } = useEmpresaDashboard()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-secondary-700" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">Error al cargar el dashboard. Verifica que tengas un lugar asignado.</p>
      </div>
    )
  }

  const place = data?.place
  const recentReviews = data?.recentReviews || []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Bienvenido de vuelta</p>
      </div>

      {/* Place Card */}
      {place && (
        <div className="bg-gradient-to-r from-secondary-600 to-secondary-700 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-80">Tu negocio</p>
              <h2 className="text-2xl font-bold mt-1">{place.name}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-white" />
                  {place.ratingAvg?.toFixed(1) || '0.0'} ({place.ratingCount || 0} reseñas)
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/business/place')}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              Editar
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Reseñas</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{place?.totalReviews || 0}</p>
            </div>
            <div className="bg-yellow-500 p-2.5 rounded-xl">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Favoritos</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{place?.favoriteCount || 0}</p>
            </div>
            <div className="bg-red-500 p-2.5 rounded-xl">
              <Heart className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Rating Promedio</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{place?.ratingAvg?.toFixed(1) || '0.0'}</p>
            </div>
            <div className="bg-green-500 p-2.5 rounded-xl">
              <Star className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Reseñas</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{place?.ratingCount || 0}</p>
            </div>
            <div className="bg-blue-500 p-2.5 rounded-xl">
              <Eye className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Reseñas Recientes</h3>
            <button
              onClick={() => navigate('/business/reviews')}
              className="text-sm text-secondary-700 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-300 flex items-center gap-1"
            >
              Ver todas <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            {recentReviews.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">No hay reseñas aún</p>
            ) : (
              recentReviews.map((review: any) => (
                <div key={review.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                  <div className="h-8 w-8 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-secondary-700 dark:text-secondary-400">
                      {review.user?.name?.[0] || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{review.user?.name}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{review.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Acciones Rápidas</h3>
          </div>
          <div className="p-4 space-y-3">
            <button
              onClick={() => navigate('/business/place')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left"
            >
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">Editar Información</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Actualiza los datos de tu negocio</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/business/reviews')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left"
            >
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">Responder Reseñas</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Gestiona las reseñas de tus clientes</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/business/promotions')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left"
            >
              <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">Crear Promoción</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Atrae más clientes con ofertas</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
