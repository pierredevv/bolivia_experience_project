import {
  Users, MapPin, Star, Calendar, Loader2, MessageSquare
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAdminDashboard } from '../../hooks/useDashboard'

<<<<<<< HEAD
const COLORS = ['#10b981', '#f59e0b', '#6366f1', '#ef4444', '#3b82f6', '#ec4899']
=======
const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316']
>>>>>>> develop

export default function AdminDashboard() {
  const { data, isLoading, error } = useAdminDashboard()

  if (isLoading) {
    return (
<<<<<<< HEAD
      <div className="flex items-center justify-center py-32 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
=======
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
>>>>>>> develop
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
<<<<<<< HEAD
    { name: 'Usuarios Totales', value: data?.stats?.totalUsers ?? 0, icon: Users, color: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { name: 'Lugares Activos', value: data?.stats?.totalPlaces ?? 0, icon: MapPin, color: 'bg-blue-50 dark:bg-blue-500/10', iconColor: 'text-blue-600 dark:text-blue-400' },
    { name: 'Reseñas', value: data?.stats?.totalReviews ?? 0, icon: Star, color: 'bg-amber-50 dark:bg-amber-500/10', iconColor: 'text-amber-600 dark:text-amber-400' },
    { name: 'Eventos Activos', value: data?.stats?.totalEvents ?? 0, icon: Calendar, color: 'bg-purple-50 dark:bg-purple-500/10', iconColor: 'text-purple-600 dark:text-purple-400' },
=======
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
>>>>>>> develop
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
<<<<<<< HEAD
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
=======
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
>>>>>>> develop
            </div>
            <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

<<<<<<< HEAD
      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rating Distribution Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm p-6 lg:p-8">
          <div className="pb-5 border-b border-slate-100 dark:border-slate-800 mb-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Distribución de Calificaciones</h2>
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">Basado en las reseñas recientes</p>
=======
      {/* Bento Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Rating Distribution — takes 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Distribución de Calificaciones</h2>
            <span className="text-xs font-semibold text-slate-400">{recentReviews.length} reseñas</span>
>>>>>>> develop
          </div>
          {recentReviews.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
<<<<<<< HEAD
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
=======
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
>>>>>>> develop
            </div>
          )}
        </div>

<<<<<<< HEAD
        {/* Role Distribution Pie */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm p-6 lg:p-8">
          <div className="pb-5 border-b border-slate-100 dark:border-slate-800 mb-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Usuarios por Rol</h2>
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">Distribución de roles en la plataforma</p>
          </div>
=======
        {/* Role Distribution — takes 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">Usuarios por Rol</h2>
>>>>>>> develop
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
<<<<<<< HEAD
                  contentStyle={{
                    borderRadius: '1rem',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
=======
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
>>>>>>> develop
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
<<<<<<< HEAD
            <div className="flex flex-col items-center justify-center h-[250px] text-slate-300 dark:text-slate-600">
              <Users className="h-12 w-12 mb-3" />
              <p className="text-sm font-bold">Sin datos de usuarios</p>
=======
            <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">
              Sin datos de usuarios
>>>>>>> develop
            </div>
          )}
        </div>
      </div>

<<<<<<< HEAD
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
=======
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
>>>>>>> develop
                      {review.user?.name?.[0] || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
<<<<<<< HEAD
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
=======
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
>>>>>>> develop
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

<<<<<<< HEAD
        {/* Recent Users Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 lg:px-8 py-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Usuarios Recientes</h2>
            <span className="flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              <Users className="h-4 w-4" />
              {recentUsers.length}
=======
        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Usuarios Recientes</h2>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
              <Users className="h-3.5 w-3.5" /> {recentUsers.length}
>>>>>>> develop
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
<<<<<<< HEAD
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                  <th className="text-left text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-6 py-4">Usuario</th>
                  <th className="text-left text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-6 py-4">Rol</th>
                  <th className="text-left text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-6 py-4">Fecha</th>
=======
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-5 py-3">Usuario</th>
                  <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-5 py-3">Rol</th>
                  <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-5 py-3">Fecha</th>
>>>>>>> develop
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr>
<<<<<<< HEAD
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
=======
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
>>>>>>> develop
                        }`}>
                          {user.role}
                        </span>
                      </td>
<<<<<<< HEAD
                      <td className="px-6 py-4 text-sm font-semibold text-slate-400 dark:text-slate-500">
=======
                      <td className="px-5 py-3.5 text-sm text-slate-500">
>>>>>>> develop
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
