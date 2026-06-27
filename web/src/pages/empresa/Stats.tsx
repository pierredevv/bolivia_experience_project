import { TrendingUp, Eye, Star, Users, Calendar } from 'lucide-react'

export default function EmpresaStats() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Estadísticas</h1>
        <p className="text-neutral-500 mt-1">Analiza el rendimiento de tu negocio</p>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2 mb-6">
        <button className="px-4 py-2 bg-secondary-700 text-white rounded-lg text-sm">
          Esta semana
        </button>
        <button className="px-4 py-2 bg-white text-neutral-700 rounded-lg text-sm border border-neutral-300 hover:bg-neutral-50">
          Este mes
        </button>
        <button className="px-4 py-2 bg-white text-neutral-700 rounded-lg text-sm border border-neutral-300 hover:bg-neutral-50">
          Este año
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Visitas</p>
              <p className="text-xl font-bold text-neutral-900">1,234</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">+15%</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Reseñas nuevas</p>
              <p className="text-xl font-bold text-neutral-900">12</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">+8</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Favoritos nuevos</p>
              <p className="text-xl font-bold text-neutral-900">23</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">+23</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Clicks "Cómo llegar"</p>
              <p className="text-xl font-bold text-neutral-900">89</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">+12%</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Visitas por día</h3>
          <div className="h-64 bg-neutral-50 rounded-lg flex items-center justify-center">
            <p className="text-neutral-500">Gráfico de visitas</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Distribución de calificaciones</h3>
          <div className="h-64 bg-neutral-50 rounded-lg flex items-center justify-center">
            <p className="text-neutral-500">Gráfico de calificaciones</p>
          </div>
        </div>
      </div>

      {/* Top Keywords */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-neutral-900 mb-4">Palabras clave más buscadas</h3>
        <div className="flex flex-wrap gap-3">
          {['chicharrón', 'comida cruceña', 'majao', 'tradicional', 'familia', 'almuerzo', 'romantic'].map((keyword) => (
            <span key={keyword} className="px-3 py-1.5 bg-neutral-100 rounded-full text-sm text-neutral-700">
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
