import {
  Users, MapPin, Star, Calendar, Loader2, MessageSquare
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAdminDashboard } from '../../hooks/useDashboard'

const COLORS = ['#1976D2', '#E65100', '#2E7D32', '#F44336', '#9C27B0', '#FF9800']

export default function AdminDashboard() {
  const { data, isLoading, error } = useAdminDashboard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">Error al cargar el dashboard. Verifica que la API esté funcionando.</p>
      </div>
    )
  }

  const stats = [
    {
      name: 'Usuarios Totales',
      value: data?.stats?.totalUsers ?? 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Lugares Activos',
      value: data?.stats?.totalPlaces ?? 0,
      icon: MapPin,
      color: 'bg-green-500',
    },
    {
      name: 'Reseñas',
      value: data?.stats?.totalReviews ?? 0,
      icon: Star,
      color: 'bg-yellow-500',
    },
    {
      name: 'Eventos Activos',
      value: data?.stats?.totalEvents ?? 0,
      icon: Calendar,
      color: 'bg-purple-500',
    },
  ]

  const recentReviews = data?.recentReviews || []
  const recentUsers = data?.recentUsers || []

  // Prepare chart data
  const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => {
    const count = recentReviews.filter((r: any) => r.rating === rating).length
    return { name: `${rating}★`, count }
  })

  const roleDistribution = recentUsers.reduce((acc: Record<string, number>, user: any) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {})
  const pieData = Object.entries(roleDistribution).map(([name, value]) => ({
    name: name === 'admin' ? 'Admin' : name === 'empresa' ? 'Empresa' : 'Usuario',
    value,
  }))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Resumen general de la plataforma</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{stat.name}</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{stat.value.toLocaleString()}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Rating Distribution Chart */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Distribución de Calificaciones</h2>
          {recentReviews.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1976D2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-neutral-400">
              Sin datos de reseñas
            </div>
          )}
        </div>

        {/* Role Distribution Chart */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Distribución de Usuarios por Rol</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-neutral-400">
              Sin datos de usuarios
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Reseñas Recientes</h2>
            <span className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
              <MessageSquare className="h-4 w-4" /> {recentReviews.length}
            </span>
          </div>
          <div className="p-4">
            {recentReviews.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">No hay reseñas aún</p>
            ) : (
              recentReviews.map((review: any) => (
                <div key={review.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                  <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
                      {review.user?.name?.[0] || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{review.user?.name}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{review.place?.name}</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1 line-clamp-2">{review.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Usuarios Recientes</h2>
            <span className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
              <Users className="h-4 w-4" /> {recentUsers.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Usuario</th>
                  <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Rol</th>
                  <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-sm text-neutral-500 dark:text-neutral-400">No hay usuarios aún</td>
                  </tr>
                ) : (
                  recentUsers.map((user: any) => (
                    <tr key={user.id} className="border-b border-neutral-200 dark:border-neutral-700 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user.name}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400' :
                          user.role === 'empresa' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' :
                          'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                        {new Date(user.createdAt).toLocaleDateString('es-BO')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
