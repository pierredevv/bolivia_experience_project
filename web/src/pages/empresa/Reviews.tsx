import { Star, MessageSquare, Check } from 'lucide-react'
import { useState } from 'react'

const reviews = [
  { id: '1', user: 'María García', rating: 5, comment: 'Excelente comida cruceña! El chicharrón es el mejor que he probado.', date: '2026-06-26', responded: false },
  { id: '2', user: 'John Smith', rating: 4, comment: 'Great food and amazing views! The service was a bit slow.', date: '2026-06-25', responded: true },
  { id: '3', user: 'Carlos López', rating: 5, comment: 'Perfecto servicio, muy recomendado para turistas.', date: '2026-06-24', responded: true },
  { id: '4', user: 'Ana Martínez', rating: 3, comment: 'Buen café pero el servicio es lento los fines de semana.', date: '2026-06-23', responded: false },
]

export default function EmpresaReviews() {
  const [responding, setResponding] = useState<string | null>(null)
  const [response, setResponse] = useState('')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Reseñas</h1>
        <p className="text-neutral-500 mt-1">Gestiona las reseñas de tus clientes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-neutral-900">4.5</p>
          <div className="flex items-center justify-center gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`} />
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Promedio</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-neutral-900">89</p>
          <p className="text-xs text-neutral-500 mt-1">Total</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-green-600">2</p>
          <p className="text-xs text-neutral-500 mt-1">Respondidas</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-yellow-600">2</p>
          <p className="text-xs text-neutral-500 mt-1">Pendientes</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="h-10 w-10 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-secondary-700">{review.user[0]}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-neutral-900">{review.user}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'
                          }`}
                        />
                      ))}
                    </div>
                    {review.responded && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        <Check className="h-3 w-3" /> Respondida
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">{review.date}</p>
                  <p className="text-neutral-700 mt-2">{review.comment}</p>
                  
                  {!review.responded && (
                    <div className="mt-4">
                      {responding === review.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Escribe tu respuesta..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none resize-none"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setResponding(null)
                                setResponse('')
                              }}
                              className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg"
                            >
                              Cancelar
                            </button>
                            <button className="px-4 py-2 text-sm bg-secondary-700 text-white rounded-lg hover:bg-secondary-800">
                              Enviar Respuesta
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setResponding(review.id)}
                          className="flex items-center gap-2 text-sm text-secondary-700 hover:text-secondary-800"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Responder
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
