import { Star, Check, X, Eye } from 'lucide-react'

const reviews = [
  { id: '1', user: 'María García', place: 'La Casa del Camba', rating: 5, comment: 'Excelente comida cruceña! El chicharrón es el mejor.', status: 'pending', date: '2026-06-26' },
  { id: '2', user: 'John Smith', place: 'Biocentro Güembé', rating: 4, comment: 'Amazing place! Great for families.', status: 'approved', date: '2026-06-25' },
  { id: '3', user: 'Carlos López', place: 'Hotel Los Tajibos', rating: 5, comment: 'Perfecto servicio, muy recomendado.', status: 'approved', date: '2026-06-24' },
  { id: '4', user: 'Ana Martínez', place: 'Café Munaipata', rating: 3, comment: 'Buen café pero el servicio es lento.', status: 'pending', date: '2026-06-23' },
  { id: '5', user: 'Pedro Sánchez', place: 'Parque El Arenal', rating: 4, comment: 'Lugar agradable para pasear.', status: 'rejected', date: '2026-06-22' },
]

export default function AdminReviews() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Reseñas</h1>
        <p className="text-neutral-500 mt-1">Modera las reseñas de los usuarios</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-neutral-500">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">2</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-neutral-500">Aprobadas</p>
          <p className="text-2xl font-bold text-green-600">2</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-neutral-500">Rechazadas</p>
          <p className="text-2xl font-bold text-red-600">1</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary-700">{review.user[0]}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-neutral-900">{review.user}</p>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      review.status === 'approved' ? 'bg-green-100 text-green-700' :
                      review.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {review.status === 'approved' ? 'Aprobada' :
                       review.status === 'pending' ? 'Pendiente' : 'Rechazada'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">{review.place} • {review.date}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-neutral-700 mt-2">{review.comment}</p>
                </div>
              </div>
              
              {review.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                    <Check className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
