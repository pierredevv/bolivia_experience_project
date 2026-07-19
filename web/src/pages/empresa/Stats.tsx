import { TrendingUp, Eye, Star, Loader2, Heart, BarChart3 } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useEmpresaStats } from '../../hooks/useEmpresa'

const COLORS = ['#10b981', '#f59e0b', '#94a3b8']

export default function EmpresaStats() {
  const { data, isLoading, error } = useEmpresaStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-24 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-8">
        <p className="text-red-600 text-lg font-bold">Error al cargar estadísticas</p>
        <p className="text-slate-400 text-sm mt-2 font-medium">Intenta recargar la página.</p>
      </div>
    )
  }

  const reviewStatusData = [
    { name: 'Aprobadas', value: data?.approvedReviews || 0 },
    { name: 'Pendientes', value: data?.pendingReviews || 0 },
    { name: 'Total', value: data?.totalReviews || 0 },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-8 pb-12">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Estadísticas</h1>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
          Analiza el rendimiento de tu negocio
        </p>
      </div>

      {/* ── KPI Cards — Bento Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Rating Promedio */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-sm font-black uppercase text-slate-400 tracking-wider">Rating</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              {data?.ratingAvg?.toFixed(1) || '0.0'}
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Promedio general</p>
          </div>
          <div className="bg-amber-50 text-amber-500 p-3 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all">
            <Star className="h-6 w-6" />
          </div>
        </div>

        {/* Total Reseñas */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-sm font-black uppercase text-slate-400 tracking-wider">Reseñas</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              {data?.totalReviews || 0}
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Total acumuladas</p>
          </div>
          <div className="bg-slate-50 text-slate-600 p-3 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
            <Eye className="h-6 w-6" />
          </div>
        </div>

        {/* Favoritos */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-sm font-black uppercase text-slate-400 tracking-wider">Favoritos</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              {data?.favoriteCount || 0}
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Guardados por usuarios</p>
          </div>
          <div className="bg-red-50 text-red-400 p-3 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-all">
            <Heart className="h-6 w-6" />
          </div>
        </div>

        {/* Reseñas Aprobadas */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-sm font-black uppercase text-slate-400 tracking-wider">Aprobadas</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              {data?.approvedReviews || 0}
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Reseñas aprobadas</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Review Status Pie */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-6 lg:p-8">
          <div className="pb-5 border-b border-slate-100 mb-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Estado de Reseñas</h3>
            <p className="text-sm font-semibold text-slate-400 mt-1">Distribución por estado de moderación</p>
          </div>
          {reviewStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={reviewStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {reviewStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '1rem',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[260px] text-slate-300">
              <BarChart3 className="h-12 w-12 mb-3" />
              <p className="text-sm font-bold">Sin datos de reseñas</p>
            </div>
          )}
        </div>

        {/* Rating Gauge */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-6 lg:p-8">
          <div className="pb-5 border-b border-slate-100 mb-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Calificación Promedio</h3>
            <p className="text-sm font-semibold text-slate-400 mt-1">Basado en {data?.ratingCount || 0} calificaciones</p>
          </div>
          <div className="flex flex-col items-center justify-center h-[215px]">
            <div className="relative">
              <svg width="200" height="120" viewBox="0 0 200 120">
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={`${((data?.ratingAvg || 0) / 5) * 251.2} 251.2`}
                />
              </svg>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <p className="text-4xl font-black text-slate-900">
                  {data?.ratingAvg?.toFixed(1) || '0.0'}
                </p>
                <p className="text-xs font-bold text-slate-400 mt-0.5">de 5.0</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.round(data?.ratingAvg || 0)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary + Tips ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Summary */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-6 lg:p-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6 pb-4 border-b border-slate-100">
            Resumen Detallado
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Reseñas pendientes', value: data?.pendingReviews || 0, color: 'text-amber-600 bg-amber-50' },
              { label: 'Reseñas aprobadas', value: data?.approvedReviews || 0, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Total de calificaciones', value: data?.ratingCount || 0, color: 'text-slate-700 bg-slate-100' },
              { label: 'Favoritos', value: data?.favoriteCount || 0, color: 'text-red-500 bg-red-50' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-sm font-bold text-slate-600">{row.label}</span>
                <span className={`text-sm font-black px-3 py-1 rounded-xl ${row.color}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2.5rem] p-6 lg:p-8 border border-slate-800 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-xl font-black text-white tracking-tight mb-6 pb-4 border-b border-slate-700/60 relative z-10">
            Consejos Pro
          </h3>
          <div className="space-y-4 relative z-10">
            <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/[0.06] rounded-2xl">
              <span className="text-lg">💬</span>
              <p className="text-sm font-semibold text-slate-300 leading-relaxed">
                Responde a todas tus reseñas para mejorar la confianza de los clientes.
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/[0.06] rounded-2xl">
              <span className="text-lg">🗺️</span>
              <p className="text-sm font-semibold text-slate-300 leading-relaxed">
                Mantén tu información actualizada para atraer más visitas.
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/[0.06] rounded-2xl">
              <span className="text-lg">🎯</span>
              <p className="text-sm font-semibold text-slate-300 leading-relaxed">
                Crea promociones regulares para mantener a los clientes interesados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
