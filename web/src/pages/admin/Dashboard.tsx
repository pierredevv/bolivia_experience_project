import {
  Users, MapPin, Star, Calendar, Loader2, MessageSquare
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAdminDashboard } from '../../hooks/useDashboard'

const COLORS = ['#10b981', '#f59e0b', '#6366f1', '#ef4444', '#3b82f6', '#ec4899']

export default function AdminDashboard() {
  const { data, isLoading, error } = useAdminDashboard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm p-8">
        <p className="text-red-600 dark:text-red-400 text-lg font-bold">Error al cargar el dashboard</p>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-2 font-medium">Verifica que la API esté funcionando.</p>
      </div>
    )
  }

  const stats = [
    { name: 'Usuarios Totales', value: data?.stats?.totalUsers ?? 0, icon: Users, color: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { name: 'Lugares Activos', value: data?.stats?.totalPlaces ?? 0, icon: MapPin, color: 'bg-blue-50 dark:bg-blue-500/10', iconColor: 'text-blue-600 dark:text-blue-400' },
    { name: 'Reseñas', value: data?.stats?.totalReviews ?? 0, icon: Star, color: 'bg-amber-50 dark:bg-amber-500/10', iconColor: 'text-amber-600 dark:text-amber-400' },
    { name: 'Eventos Activos', value: data?.stats?.totalEvents ?? 0, icon: Calendar, color: 'bg-purple-50 dark:bg-purple-500/10', iconColor: 'text-purple-600 dark:text-purple-400' },
  ]

  const recentReviews = data?.recentReviews || []
  const recentUsers = data?.recentUsers || []

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
    <div className="space-y-8 pb-12">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">
          Resumen general de la plataforma
        </p>
      </div>

      {/* ── KPI Bento Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-xl dark:hover:shadow-slate-950/40 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`h-11 w-11 ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.name}</span>
            </div>
            <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rating Distribution Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm p-6 lg:p-8">
          <div className="pb-5 border-b border-slate-100 dark:border-slate-800 mb-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Distribución de Calificaciones</h2>
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">Basado en las reseñas recientes</p>
          </div>
          {recentReviews.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 13, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '1rem',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[250px] text-slate-300 dark:text-slate-600">
              <Star className="h-12 w-12 mb-3" />
              <p className="text-sm font-bold">Sin datos de reseñas</p>
            </div>
          )}
        </div>

        {/* Role Distribution Pie */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm p-6 lg:p-8">
          <div className="pb-5 border-b border-slate-100 dark:border-slate-800 mb-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Usuarios por Rol</h2>
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">Distribución de roles en la plataforma</p>
          </div>
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
            <div className="flex flex-col items-center justify-center h-[250px] text-slate-300 dark:text-slate-600">
              <Users className="h-12 w-12 mb-3" />
              <p className="text-sm font-bold">Sin datos de usuarios</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Data Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reviews */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 lg:px-8 py-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Reseñas Recientes</h2>
            <span className="flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              <MessageSquare className="h-4 w-4" />
              {recentReviews.length}
            </span>
          </div>
          <div className="p-4 divide-y divide-slate-50 dark:divide-slate-800">
            {recentReviews.length === 0 ? (
              <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 text-center py-8">No hay reseñas aún</p>
            ) : (
              recentReviews.map((review: any) => (
                <div key={review.id} className="flex items-start gap-4 px-2 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="h-10 w-10 bg-slate-900 dark:bg-slate-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-sm font-black text-white uppercase">
                      {review.user?.name?.[0] || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{review.user?.name}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">{review.place?.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed font-medium">{review.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 lg:px-8 py-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Usuarios Recientes</h2>
            <span className="flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              <Users className="h-4 w-4" />
              {recentUsers.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                  <th className="text-left text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-6 py-4">Usuario</th>
                  <th className="text-left text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-6 py-4">Rol</th>
                  <th className="text-left text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-6 py-4">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-sm font-semibold text-slate-400 dark:text-slate-500">No hay usuarios aún</td>
                  </tr>
                ) : (
                  recentUsers.map((user: any) => (
                    <tr key={user.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-black rounded-full ${
                          user.role === 'admin'
                            ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
                            : user.role === 'empresa'
                            ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                            : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-400 dark:text-slate-500">
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
