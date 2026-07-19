import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Calendar, MapPin, Loader2 } from 'lucide-react'
import { eventsApi } from '../../services/api'

interface Event {
  id: string
  name: string
  description: string | null
  dateStart: string
  dateEnd: string | null
  location: string | null
  category: string | null
  isActive: boolean
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await eventsApi.getAll()
      setEvents(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar eventos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return
    try {
      await eventsApi.delete(id)
      fetchEvents()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar evento')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-BO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Eventos</h1>
          <p className="text-neutral-500 mt-1">Gestiona los eventos turísticos</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors">
          <Plus className="h-5 w-5" />
          Crear Evento
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6">
          {error}
        </div>
      )}

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-primary-500 to-primary-700 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-white/30" />
                </div>
                {event.category && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-white/20 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                    {event.category}
                  </span>
                )}
                <span className={`absolute top-3 right-3 px-2 py-1 text-white text-xs font-medium rounded-full ${
                  event.isActive ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {event.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-neutral-900">{event.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(event.dateStart)}
                    {event.dateEnd && ` - ${formatDate(event.dateEnd)}`}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <button className="flex-1 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">
                    Ver detalles
                  </button>
                  <button className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-neutral-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
