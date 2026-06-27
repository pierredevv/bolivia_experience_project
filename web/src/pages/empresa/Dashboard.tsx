import { 
  MapPin, Star, TrendingUp, Eye, MessageSquare, Heart,
  ArrowUpRight
} from 'lucide-react'

const stats = [
  { name: 'Visitas al Perfil', value: '1,234', change: '+15%', icon: Eye, color: 'bg-blue-500' },
  { name: 'Reseñas', value: '89', change: '+8', icon: MessageSquare, color: 'bg-yellow-500' },
  { name: 'Favoritos', value: '256', change: '+23', icon: Heart, color: 'bg-red-500' },
  { name: 'Rating Promedio', value: '4.5', change: '+0.2', icon: Star, color: 'bg-green-500' },
]

const recentReviews = [
  { id: 1, user: 'María García', rating: 5, comment: 'Excelente!', date: 'Hace 2 horas' },
  { id: 2, user: 'John Smith', rating: 4, comment: 'Very good!', date: 'Hace 1 día' },
  { id: 3, user: 'Ana López', rating: 5, comment: 'Increíble', date: 'Hace 2 días' },
]

export default function EmpresaDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 mt-1">Bienvenido de vuelta</p>
      </div>

      {/* Place Card */}
      <div className="bg-gradient-to-r from-secondary-600 to-secondary-700 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-80">Tu negocio</p>
            <h2 className="text-2xl font-bold mt-1">La Casa del Camba</h2>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Av. San Martín 1250
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-white" />
                4.5 (120 reseñas)
              </span>
            </div>
          </div>
          <button className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm">
            Editar
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">{stat.name}</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-2.5 rounded-xl`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
              <span className="text-xs text-neutral-500">vs semana anterior</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-neutral-900">Reseñas Recientes</h3>
            <button className="text-sm text-secondary-700 hover:text-secondary-800 flex items-center gap-1">
              Ver todas <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            {recentReviews.map((review) => (
              <div key={review.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50">
                <div className="h-8 w-8 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-secondary-700">{review.user[0]}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-neutral-900">{review.user}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">{review.comment}</p>
                  <p className="text-xs text-neutral-400 mt-1">{review.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-neutral-900">Acciones Rápidas</h3>
          </div>
          <div className="p-4 space-y-3">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors text-left">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">Editar Información</p>
                <p className="text-sm text-neutral-500">Actualiza los datos de tu negocio</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors text-left">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">Responder Reseñas</p>
                <p className="text-sm text-neutral-500">3 reseñas pendientes de respuesta</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors text-left">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">Crear Promoción</p>
                <p className="text-sm text-neutral-500">Atrae más clientes con ofertas</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-neutral-900 mb-4">Visitas esta semana</h3>
        <div className="h-48 bg-neutral-50 rounded-lg flex items-center justify-center">
          <p className="text-neutral-500">Gráfico de visitas</p>
        </div>
      </div>
    </div>
  )
}
