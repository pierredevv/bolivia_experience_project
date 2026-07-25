<<<<<<< HEAD
import { TrendingUp, Eye, Star, Loader2, Heart, BarChart3 } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useEmpresaStats } from '../../hooks/useEmpresa'

const COLORS = ['#10b981', '#f59e0b', '#94a3b8']
=======
import { TrendingUp, Star, Loader2, Heart, MessageSquare, Lightbulb, CheckCircle2, Clock } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useEmpresaStats } from '../../hooks/useEmpresa'

// Aligned to design tokens: primary-500 (emerald), accent-warm (amber), neutral-200
const COLORS = ['#38A169', '#F59E0B', '#E2E8F0']
>>>>>>> develop

export default function EmpresaStats() {
  const { data, isLoading, error } = useEmpresaStats()

  if (isLoading) {
    return (
<<<<<<< HEAD
      <div className="flex items-center justify-center py-32 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
=======
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
>>>>>>> develop
      </div>
    )
  }

  if (error) {
    return (
<<<<<<< HEAD
      <div className="text-center py-24 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-8">
        <p className="text-red-600 text-lg font-bold">Error al cargar estadísticas</p>
        <p className="text-slate-400 text-sm mt-2 font-medium">Intenta recargar la página.</p>
=======
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="h-16 w-16 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold">Error al cargar estadísticas</p>
          <p className="text-sm text-slate-400 mt-1">Intenta recargar la página</p>
        </div>
>>>>>>> develop
      </div>
    )
  }

  const reviewStatusData = [
    { name: 'Aprobadas', value: data?.approvedReviews || 0 },
    { name: 'Pendientes', value: data?.pendingReviews || 0 },
    { name: 'Total', value: data?.totalReviews || 0 },
  ].filter((d) => d.value > 0)

  const statCards = [
    {
      label: 'Rating Promedio',
      value: data?.ratingAvg?.toFixed(1) || '0.0',
      icon: Star,
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      glow: 'from-amber-600/5',
    },
    {
      label: 'Total Reseñas',
      value: data?.totalReviews || 0,
      icon: MessageSquare,
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      glow: 'from-blue-600/5',
    },
    {
      label: 'Favoritos',
      value: data?.favoriteCount || 0,
      icon: Heart,
      bg: 'bg-rose-50 dark:bg-rose-900/30',
      iconColor: 'text-rose-600 dark:text-rose-400',
      glow: 'from-rose-600/5',
    },
    {
      label: 'Reseñas Aprobadas',
      value: data?.approvedReviews || 0,
      icon: TrendingUp,
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      glow: 'from-emerald-600/5',
    },
  ]

  return (
<<<<<<< HEAD
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
=======
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Estadísticas</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Analiza el rendimiento de tu negocio</p>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, bg, iconColor, glow }) => (
          <div key={label} className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 p-5 overflow-hidden">
            {/* Hover glow overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className={`${bg} p-2.5 rounded-xl`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
              <p className="text-slate-900 dark:text-slate-100 font-black text-3xl md:text-4xl mt-1">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Review Status Pie Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-5">Estado de Reseñas</h3>
          {reviewStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
>>>>>>> develop
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
<<<<<<< HEAD
                    borderRadius: '1rem',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                    fontWeight: 700,
=======
                    background: 'rgb(15 23 42)',
                    border: '1px solid rgb(51 65 85)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '13px',
>>>>>>> develop
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
<<<<<<< HEAD
            <div className="flex flex-col items-center justify-center h-[260px] text-slate-300">
              <BarChart3 className="h-12 w-12 mb-3" />
              <p className="text-sm font-bold">Sin datos de reseñas</p>
=======
            <div className="flex flex-col items-center justify-center h-[240px] text-slate-400 dark:text-slate-500 gap-3">
              <div className="h-12 w-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6" />
              </div>
              <p className="text-sm">Sin datos de reseñas aún</p>
>>>>>>> develop
            </div>
          )}
        </div>

        {/* Rating Gauge */}
<<<<<<< HEAD
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-6 lg:p-8">
          <div className="pb-5 border-b border-slate-100 mb-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Calificación Promedio</h3>
            <p className="text-sm font-semibold text-slate-400 mt-1">Basado en {data?.ratingCount || 0} calificaciones</p>
          </div>
          <div className="flex flex-col items-center justify-center h-[215px]">
=======
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-5">Calificación Promedio</h3>
          <div className="flex flex-col items-center justify-center h-[240px]">
>>>>>>> develop
            <div className="relative">
              <svg width="200" height="120" viewBox="0 0 200 120">
                {/* Background arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
<<<<<<< HEAD
                  stroke="#f1f5f9"
                  strokeWidth="16"
=======
                  stroke="rgb(226 232 240)"
                  className="dark:stroke-slate-700"
                  strokeWidth="14"
>>>>>>> develop
                  strokeLinecap="round"
                />
                {/* Filled arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
<<<<<<< HEAD
                  stroke="#10b981"
                  strokeWidth="16"
=======
                  stroke="#38A169"
                  strokeWidth="14"
>>>>>>> develop
                  strokeLinecap="round"
                  strokeDasharray={`${((data?.ratingAvg || 0) / 5) * 251.2} 251.2`}
                />
              </svg>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
<<<<<<< HEAD
                <p className="text-4xl font-black text-slate-900">
                  {data?.ratingAvg?.toFixed(1) || '0.0'}
                </p>
                <p className="text-xs font-bold text-slate-400 mt-0.5">de 5.0</p>
=======
                <p className="text-4xl font-black text-slate-900 dark:text-slate-100">{data?.ratingAvg?.toFixed(1) || '0.0'}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">de 5.0</p>
>>>>>>> develop
              </div>
            </div>
            <div className="flex items-center gap-1 mt-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
<<<<<<< HEAD
                    i < Math.round(data?.ratingAvg || 0)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
=======
                    i < Math.round(data?.ratingAvg || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-600'
>>>>>>> develop
                  }`}
                />
              ))}
            </div>
<<<<<<< HEAD
=======
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">{data?.ratingCount || 0} calificaciones totales</p>
>>>>>>> develop
          </div>
        </div>
      </div>

<<<<<<< HEAD
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
=======
      {/* Bottom Row: Summary + Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-5">Resumen</h3>
          <div className="space-y-3">
            {[
              { label: 'Reseñas pendientes', value: data?.pendingReviews || 0, valueClass: 'text-amber-600 dark:text-amber-400', icon: Clock },
              { label: 'Reseñas aprobadas', value: data?.approvedReviews || 0, valueClass: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
              { label: 'Total calificaciones', value: data?.ratingCount || 0, valueClass: 'text-slate-900 dark:text-slate-100', icon: Star },
              { label: 'Favoritos', value: data?.favoriteCount || 0, valueClass: 'text-rose-600 dark:text-rose-400', icon: Heart },
            ].map(({ label, value, valueClass, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
                </div>
                <span className={`text-sm font-bold ${valueClass}`}>{value}</span>
>>>>>>> develop
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
<<<<<<< HEAD
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
=======
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-amber-50 dark:bg-amber-900/30 p-2 rounded-xl">
              <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Consejos</h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                Responde a todas tus reseñas para mejorar la confianza de los clientes.
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
              <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Mantén tu información actualizada para atraer más visitas a tu negocio.
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
              <p className="text-sm text-purple-800 dark:text-purple-300 leading-relaxed">
>>>>>>> develop
                Crea promociones regulares para mantener a los clientes interesados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
