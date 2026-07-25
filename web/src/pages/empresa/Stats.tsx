import { TrendingUp, Star, Loader2, Heart, MessageSquare, Lightbulb, CheckCircle2, Clock } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useEmpresaStats } from '../../hooks/useEmpresa'

// Aligned to design tokens: primary-500 (emerald), accent-warm (amber), neutral-200
const COLORS = ['#38A169', '#F59E0B', '#E2E8F0']

export default function EmpresaStats() {
  const { data, isLoading, error } = useEmpresaStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="h-16 w-16 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold">Error al cargar estadísticas</p>
          <p className="text-sm text-slate-400 mt-1">Intenta recargar la página</p>
        </div>
      </div>
    )
  }

  const reviewStatusData = [
    { name: 'Aprobadas', value: data?.approvedReviews || 0 },
    { name: 'Pendientes', value: data?.pendingReviews || 0 },
    { name: 'Total', value: data?.totalReviews || 0 },
  ].filter(d => d.value > 0)

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
              <PieChart>
                <Pie
                  data={reviewStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
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
                    background: 'rgb(15 23 42)',
                    border: '1px solid rgb(51 65 85)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[240px] text-slate-400 dark:text-slate-500 gap-3">
              <div className="h-12 w-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6" />
              </div>
              <p className="text-sm">Sin datos de reseñas aún</p>
            </div>
          )}
        </div>

        {/* Rating Gauge */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-5">Calificación Promedio</h3>
          <div className="flex flex-col items-center justify-center h-[240px]">
            <div className="relative">
              <svg width="200" height="120" viewBox="0 0 200 120">
                {/* Background arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="rgb(226 232 240)"
                  className="dark:stroke-slate-700"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Filled arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#38A169"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${((data?.ratingAvg || 0) / 5) * 251.2} 251.2`}
                />
              </svg>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <p className="text-4xl font-black text-slate-900 dark:text-slate-100">{data?.ratingAvg?.toFixed(1) || '0.0'}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">de 5.0</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.round(data?.ratingAvg || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">{data?.ratingCount || 0} calificaciones totales</p>
          </div>
        </div>
      </div>

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
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
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
                Crea promociones regulares para mantener a los clientes interesados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
