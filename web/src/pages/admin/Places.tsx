import { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Star, MapPin, Loader2 } from 'lucide-react'
import { placesApi } from '../../services/api'

interface Place {
  id: string
  name: string
  description: string | null
  address: string
  latitude: number
  longitude: number
  ratingAvg: number
  ratingCount: number
  isFeatured: boolean
  isActive: boolean
  category: {
    id: string
    name: string
    icon: string
  }
  photos: Array<{ url: string }>
}

export default function AdminPlaces() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchPlaces()
  }, [page, search])

  const fetchPlaces = async () => {
    try {
      setLoading(true)
      const response = await placesApi.getAll({ page, limit: 12, search })
      setPlaces(response.data.data)
      setTotalPages(response.data.meta.totalPages)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar lugares')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este lugar?')) return
    try {
      await placesApi.delete(id)
      fetchPlaces()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar lugar')
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await placesApi.toggleStatus(id)
      fetchPlaces()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar estado')
    }
  }

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
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6">
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <div key={place.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="h-48 bg-neutral-200 relative">
                  {place.photos?.[0] ? (
                    <img src={place.photos[0].url} alt={place.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MapPin className="h-12 w-12 text-neutral-400" />
                    </div>
                  )}
                  {place.isFeatured && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                      Destacado
                    </span>
                  )}
                  <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full ${
                    place.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {place.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-neutral-900">{place.name}</h3>
                  <p className="text-sm text-neutral-500 mt-1">{place.category?.name}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{Number(place.ratingAvg).toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-neutral-500">{place.ratingCount} reseñas</span>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <button
                      onClick={() => handleToggleStatus(place.id)}
                      className="flex-1 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      {place.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(place.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-neutral-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-neutral-500">
              Página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 text-sm hover:bg-neutral-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 text-sm hover:bg-neutral-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
