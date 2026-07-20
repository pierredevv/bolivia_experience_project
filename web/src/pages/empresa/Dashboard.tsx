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
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">Bienvenido de vuelta</p>
      </div>

      {/* Place Hero Card — Premium gradient */}
      {place && (
        <div className="relative bg-slate-900 rounded-2xl p-6 md:p-8 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-transparent to-sky-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Tu negocio</p>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">{place.name}</h2>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1.5 text-white/80">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{place.ratingAvg?.toFixed(1) || '0.0'}</span>
                  <span className="text-white/50">({place.ratingCount || 0} reseñas)</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/business/place')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-xl transition-colors border border-white/10"
            >
              Editar
            </button>
          </div>
        </div>
      )}

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-emerald-50 p-2.5 rounded-xl">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-black">+3</span>
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Reseñas</p>
            <p className="text-slate-900 font-black text-3xl md:text-4xl mt-1">{place?.totalReviews || 0}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-rose-50 p-2.5 rounded-xl">
                <Heart className="h-5 w-5 text-rose-600" />
              </div>
              <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-black">+7</span>
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Favoritos</p>
            <p className="text-slate-900 font-black text-3xl md:text-4xl mt-1">{place?.favoriteCount || 0}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-amber-50 p-2.5 rounded-xl">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-black">+0.2</span>
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Rating Promedio</p>
            <p className="text-slate-900 font-black text-3xl md:text-4xl mt-1">{place?.ratingAvg?.toFixed(1) || '0.0'}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-sky-50 p-2.5 rounded-xl">
                <Eye className="h-5 w-5 text-sky-600" />
              </div>
              <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-black">+15</span>
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Reseñas</p>
            <p className="text-slate-900 font-black text-3xl md:text-4xl mt-1">{place?.ratingCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Bento Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Reviews — takes 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Reseñas Recientes</h3>
            <button
              onClick={() => navigate('/business/reviews')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
            >
              Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="p-3 space-y-1">
            {recentReviews.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No hay reseñas aún</p>
            ) : (
              recentReviews.map((review: any) => (
                <div key={review.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
                  <div className="h-9 w-9 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-emerald-600">
                      {review.user?.name?.[0] || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{review.user?.name}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{review.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions — takes 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Acciones Rápidas</h3>
          </div>
          <div className="p-4 space-y-2">
            <button
              onClick={() => navigate('/business/place')}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all text-left group"
            >
              <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Editar Información</p>
                <p className="text-xs text-slate-500">Actualiza los datos de tu negocio</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 ml-auto transition-colors" />
            </button>
            <button
              onClick={() => navigate('/business/reviews')}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all text-left group"
            >
              <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Responder Reseñas</p>
                <p className="text-xs text-slate-500">Gestiona las reseñas de tus clientes</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 ml-auto transition-colors" />
            </button>
            <button
              onClick={() => navigate('/business/promotions')}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all text-left group"
            >
              <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Crear Promoción</p>
                <p className="text-xs text-slate-500">Atrae más clientes con ofertas</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 ml-auto transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
