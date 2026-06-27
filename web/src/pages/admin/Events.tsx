import { Plus, Edit, Trash2, Calendar, MapPin } from 'lucide-react'

const events = [
  { id: '1', name: 'Feria Exposición de Santa Cruz', date: '15-28 Sep 2026', location: 'Fexpocruz', category: 'Feria', status: 'upcoming' },
  { id: '2', name: 'Festival de la Tradición Cruceña', date: '24-25 Sep 2026', location: 'Plaza 24 de Septiembre', category: 'Cultural', status: 'upcoming' },
  { id: '3', name: 'Maratón Internacional', date: '12 Oct 2026', location: 'Av. Cristo Redentor', category: 'Deportivo', status: 'upcoming' },
  { id: '4', name: 'Noche de Museos', date: '15 Nov 2026', location: 'Varios museos', category: 'Cultural', status: 'upcoming' },
]

export default function AdminEvents() {
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

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-primary-500 to-primary-700 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar className="h-16 w-16 text-white/30" />
              </div>
              <span className="absolute top-3 left-3 px-2 py-1 bg-white/20 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                {event.category}
              </span>
              <span className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                Próximo
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-neutral-900">{event.name}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {event.date}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
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
