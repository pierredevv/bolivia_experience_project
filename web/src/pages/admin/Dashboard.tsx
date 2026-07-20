import {
  Users, MapPin, Star, Calendar, Loader2, MessageSquare
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAdminDashboard } from '../../hooks/useDashboard'

const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316']

export default function AdminDashboard() {
  const { data, isLoading, error } = useAdminDashboard()

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
        <p className="text-red-600">Error al cargar el dashboard. Verifica que la API esté funcionando.</p>
      </div>
    )
  }

  const stats = [
    {
      name: 'Usuarios Totales',
      value: data?.stats?.totalUsers ?? 0,
      icon: Users,
      trend: '+12%',
      color: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      name: 'Lugares Activos',
      value: data?.stats?.totalPlaces ?? 0,
      icon: MapPin,
      trend: '+8%',
      color: 'from-sky-500 to-sky-600',
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
    },
    {
      name: 'Reseñas',
      value: data?.stats?.totalReviews ?? 0,
      icon: Star,
      trend: '+24%',
      color: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      name: 'Eventos Activos',
      value: data?.stats?.totalEvents ?? 0,
      icon: Calendar,
      trend: '+5%',
      color: 'from-violet-500 to-violet-600',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">Resumen general de la plataforma</p>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-5 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.iconBg} p-2.5 rounded-xl`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-black">
                  {stat.trend}
                </span>
              </div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.name}</p>
              <p className="text-slate-900 font-black text-3xl md:text-4xl mt-1">{stat.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bento Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Rating Distribution — takes 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Distribución de Calificaciones</h2>
            <span className="text-xs font-semibold text-slate-400">{recentReviews.length} reseñas</span>
          </div>
          {recentReviews.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">
              Sin datos de reseñas
            </div>
          )}
        </div>

        {/* Role Distribution — takes 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">Usuarios por Rol</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">
              Sin datos de usuarios
            </div>
          )}
        </div>
      </div>

      {/* Bento Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Reviews */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Reseñas Recientes</h2>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
              <MessageSquare className="h-3.5 w-3.5" /> {recentReviews.length}
            </span>
          </div>
          <div className="p-3">
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{review.user?.name}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">{review.place?.name}</p>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{review.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Usuarios Recientes</h2>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
              <Users className="h-3.5 w-3.5" /> {recentUsers.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-5 py-3">Usuario</th>
                  <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-5 py-3">Rol</th>
                  <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-5 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-sm text-slate-400">No hay usuarios aún</td>
                  </tr>
                ) : (
                  recentUsers.map((user: any) => (
                    <tr key={user.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                          user.role === 'admin' ? 'bg-violet-50 text-violet-700' :
                          user.role === 'empresa' ? 'bg-sky-50 text-sky-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">
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
