import { useState } from 'react'
import { Search, Plus, MoreVertical, Edit, Trash2, Eye, Star, MapPin } from 'lucide-react'

const places = [
  { id: '1', name: 'La Casa del Camba', category: 'Restaurantes', rating: 4.5, reviews: 120, status: 'active', featured: true },
  { id: '2', name: 'Hotel Los Tajibos', category: 'Hoteles', rating: 4.7, reviews: 200, status: 'active', featured: true },
  { id: '3', name: 'Biocentro Güembé', category: 'Atracciones', rating: 4.9, reviews: 300, status: 'active', featured: true },
  { id: '4', name: 'Café Munaipata', category: 'Cafeterías', rating: 4.6, reviews: 75, status: 'active', featured: false },
  { id: '5', name: 'Parque El Arenal', category: 'Parques', rating: 4.2, reviews: 180, status: 'active', featured: false },
]

export default function AdminPlaces() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Lugares</h1>
          <p className="text-neutral-500 mt-1">Gestiona los lugares turísticos</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors">
          <Plus className="h-5 w-5" />
          Agregar Lugar
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar lugares..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="all">Todas las categorías</option>
            <option value="restaurantes">Restaurantes</option>
            <option value="hoteles">Hoteles</option>
            <option value="cafeterias">Cafeterías</option>
            <option value="atracciones">Atracciones</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place) => (
          <div key={place.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-48 bg-neutral-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="h-12 w-12 text-neutral-400" />
              </div>
              {place.featured && (
                <span className="absolute top-3 left-3 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                  Destacado
                </span>
              )}
              <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full ${
                place.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {place.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-neutral-900">{place.name}</h3>
              <p className="text-sm text-neutral-500 mt-1">{place.category}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{place.rating}</span>
                </div>
                <span className="text-sm text-neutral-500">{place.reviews} reseñas</span>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <button className="flex-1 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">
                  Ver detalles
                </button>
                <button className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-red-50 text-neutral-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
