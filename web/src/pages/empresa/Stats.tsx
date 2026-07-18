import { TrendingUp, Eye, Star, Loader2, Heart } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useEmpresaStats } from '../../hooks/useEmpresa'

const COLORS = ['#4CAF50', '#FFCDD2', '#FFEB3B']

export default function EmpresaStats() {
  const { data, isLoading, error } = useEmpresaStats()

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
        <p className="text-red-600">Error al cargar estadísticas</p>
      </div>
    )
  }

  const reviewStatusData = [
    { name: 'Aprobadas', value: data?.approvedReviews || 0 },
    { name: 'Pendientes', value: data?.pendingReviews || 0 },
    { name: 'Total', value: data?.totalReviews || 0 },
  ].filter(d => d.value > 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Estadísticas</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Analiza el rendimiento de tu negocio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Rating Promedio</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{data?.ratingAvg?.toFixed(1) || '0.0'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Reseñas</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{data?.totalReviews || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Favoritos</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{data?.favoriteCount || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Reseñas Aprobadas</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{data?.approvedReviews || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Review Status Chart */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Estado de Reseñas</h3>
          {reviewStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-neutral-400 dark:text-neutral-500">
              Sin datos de reseñas
            </div>
          )}
        </div>

        {/* Rating Gauge */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Calificación Promedio</h3>
          <div className="flex flex-col items-center justify-center h-[250px]">
            <div className="relative">
              <svg width="200" height="120" viewBox="0 0 200 120">
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#E5E5E5"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={`${((data?.ratingAvg || 0) / 5) * 251.2} 251.2`}
                />
              </svg>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <p className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">{data?.ratingAvg?.toFixed(1) || '0.0'}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">de 5.0</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.round(data?.ratingAvg || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300 dark:text-neutral-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">{data?.ratingCount || 0} calificaciones</p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Resumen</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Reseñas pendientes</span>
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{data?.pendingReviews || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Reseñas aprobadas</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">{data?.approvedReviews || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Total de calificaciones</span>
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{data?.ratingCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Favoritos</span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">{data?.favoriteCount || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Consejos</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Responde a todas tus reseñas para mejorar la confianza de los clientes.
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-300">
                Mantén tu información actualizada para atraer más visitas.
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-purple-800 dark:text-purple-300">
                Crea promociones regulares para mantener a los clientes interesados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
