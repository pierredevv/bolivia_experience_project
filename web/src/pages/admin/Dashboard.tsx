import { 
  Users, MapPin, Star, Calendar, TrendingUp, TrendingDown,
  ArrowUpRight, Eye
} from 'lucide-react'

const stats = [
  {
    name: 'Usuarios Totales',
    value: '1,234',
    change: '+12%',
    changeType: 'increase',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    name: 'Lugares Activos',
    value: '200',
    change: '+5',
    changeType: 'increase',
    icon: MapPin,
    color: 'bg-green-500',
  },
  {
    name: 'Reseñas',
    value: '3,456',
    change: '+89',
    changeType: 'increase',
    icon: Star,
    color: 'bg-yellow-500',
  },
  {
    name: 'Eventos Activos',
    value: '12',
    change: '-2',
    changeType: 'decrease',
    icon: Calendar,
    color: 'bg-purple-500',
  },
]

const recentReviews = [
  { id: 1, user: 'María García', place: 'La Casa del Camba', rating: 5, comment: 'Excelente comida!' },
  { id: 2, user: 'John Smith', place: 'Biocentro Güembé', rating: 4, comment: 'Amazing place!' },
  { id: 3, user: 'Carlos López', place: 'Hotel Los Tajibos', rating: 5, comment: 'Perfecto servicio' },
]

const recentUsers = [
  { id: 1, name: 'Ana Martínez', email: 'ana@example.com', role: 'usuario', date: '2026-06-26' },
  { id: 2, name: 'Pedro Sánchez', email: 'pedro@example.com', role: 'empresa', date: '2026-06-25' },
  { id: 3, name: 'Laura Pérez', email: 'laura@example.com', role: 'usuario', date: '2026-06-24' },
]

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 mt-1">Resumen general de la plataforma</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">{stat.name}</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              {stat.changeType === 'increase' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-neutral-500">vs mes anterior</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold text-neutral-900">Reseñas Recientes</h2>
            <button className="text-sm text-primary-700 hover:text-primary-800 flex items-center gap-1">
              Ver todas <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50">
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary-700">{review.user[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-neutral-900">{review.user}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500">{review.place}</p>
                  <p className="text-sm text-neutral-700 mt-1">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold text-neutral-900">Usuarios Recientes</h2>
            <button className="text-sm text-primary-700 hover:text-primary-800 flex items-center gap-1">
              Ver todos <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">
                    Usuario
                  </th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">
                    Rol
                  </th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">
                    Fecha
                  </th>
                  <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'empresa' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {user.date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-neutral-500 hover:text-neutral-700">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Usuarios por Mes</h2>
        <div className="h-64 bg-neutral-50 rounded-lg flex items-center justify-center">
          <p className="text-neutral-500">Gráfico de usuarios (Recharts)</p>
        </div>
      </div>
    </div>
  )
}
