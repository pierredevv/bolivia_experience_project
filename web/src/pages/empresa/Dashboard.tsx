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
      <div className="flex items-center justify-center py-32 bg-slate-50/50 min-h-[60vh] rounded-[2.5rem]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-24 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm max-w-2xl mx-auto my-12 p-8">
        <p className="text-red-600 text-lg font-bold">Error al cargar el panel de control.</p>
        <p className="text-slate-400 text-sm mt-2 font-medium">Por favor, verifica que tu cuenta tenga un establecimiento comercial asignado.</p>
      </div>
    )
  }

  const place = data?.place
  const recentReviews = data?.recentReviews || []

  return (
    <div className="space-y-10 animate-fade-in pb-12">

      {/* 70% Minimalism: Large Hierarchy Section Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-400 text-base font-bold uppercase tracking-widest mt-1.5 text-[11px]">
          Bienvenido de vuelta, Portal Corporativo
        </p>
      </div>

      {/* 5% Organic Landscape Header: Replaced the flat generic orange fill */}
      {place && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-[2.5rem] p-8 lg:p-10 text-white relative overflow-hidden border border-slate-800 shadow-xl shadow-slate-900/5">
          {/* Subtle design gradient glow */}
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="text-emerald-400 text-xs font-black uppercase tracking-widest block mb-2">Tu Establecimiento</span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{place.name}</h2>
              <div className="flex items-center gap-4 mt-3 text-base font-bold text-slate-300">
                <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-white font-black">{place.ratingAvg?.toFixed(1) || '0.0'}</span> ({place.ratingCount || 0} reseñas)
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/business/place')}
              className="sm:w-auto px-6 py-3.5 bg-white text-slate-900 font-black text-sm rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-lg hover:shadow-emerald-600/20 transform hover:-translate-y-0.5"
            >
              Editar Información
            </button>
          </div>
        </div>
      )}

      {/* 15% MD3 Functional Layout: Refactored Bento Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Metric 1 */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-sm font-black uppercase text-slate-400 tracking-wider">Reseñas</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">{place?.totalReviews || 0}</p>
          </div>
          <div className="bg-slate-50 text-slate-700 p-3 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
            <MessageSquare className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-sm font-black uppercase text-slate-400 tracking-wider">Favoritos</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">{place?.favoriteCount || 0}</p>
          </div>
          <div className="bg-slate-50 text-slate-700 p-3 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
            <Heart className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-sm font-black uppercase text-slate-400 tracking-wider">Rating Promedio</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">{place?.ratingAvg?.toFixed(1) || '0.0'}</p>
          </div>
          <div className="bg-slate-50 text-slate-700 p-3 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
            <Star className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-sm font-black uppercase text-slate-400 tracking-wider">Total Reseñas</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">{place?.ratingCount || 0}</p>
          </div>
          <div className="bg-slate-50 text-slate-700 p-3 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
            <Eye className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Workspace Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">

        {/* Recent Reviews Panel */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 lg:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Reseñas Recientes</h3>
            <button
              onClick={() => navigate('/business/reviews')}
              className="text-sm font-black text-emerald-700 hover:text-emerald-600 flex items-center gap-1 group"
            >
              Ver todas <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          <div className="space-y-4">
            {recentReviews.length === 0 ? (
              <p className="text-base text-slate-400 font-semibold text-center py-8">No hay reseñas registradas aún</p>
            ) : (
              recentReviews.map((review: any) => (
                <div key={review.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50/80 transition-all border border-transparent hover:border-slate-100">
                  <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-sm font-black text-white uppercase">
                      {review.user?.name?.[0] || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-base font-bold text-slate-900">{review.user?.name}</p>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm lg:text-base text-slate-500 mt-2 font-medium leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions Panel — MD3 Clean Surfaces */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 lg:p-8">
          <div className="pb-6 border-b border-slate-100 mb-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Acciones Rápidas</h3>
          </div>

          <div className="space-y-4">

            {/* Action 1 */}
            <button
              onClick={() => navigate('/business/place')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-transparent hover:shadow-xl transition-all duration-300 text-left group"
            >
              <div className="h-12 w-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-emerald-600 transition-colors">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-base text-slate-900">Editar Información</p>
                <p className="text-sm font-semibold text-slate-400 mt-0.5">Actualiza las coordenadas, horarios y datos clave de tu local</p>
              </div>
            </button>

            {/* Action 2 */}
            <button
              onClick={() => navigate('/business/reviews')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-transparent hover:shadow-xl transition-all duration-300 text-left group"
            >
              <div className="h-12 w-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-emerald-600 transition-colors">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-base text-slate-900">Responder Reseñas</p>
                <p className="text-sm font-semibold text-slate-400 mt-0.5">Interactúa y gestiona el feedback de tus visitantes activos</p>
              </div>
            </button>

            {/* Action 3 */}
            <button
              onClick={() => navigate('/business/promotions')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-transparent hover:shadow-xl transition-all duration-300 text-left group"
            >
              <div className="h-12 w-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-emerald-600 transition-colors">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-base text-slate-900">Crear Promoción</p>
                <p className="text-sm font-semibold text-slate-400 mt-0.5">Atrae flujos masivos de turistas lanzando ofertas de temporada</p>
              </div>
            </button>

          </div>
        </div>

      </div>
    </div>
  )
}