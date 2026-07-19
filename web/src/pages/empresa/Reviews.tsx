import { Star, MessageSquare, Check, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { empresaApi, reviewsApi } from '../../services/api'

interface Review {
  id: string
  rating: number
  comment: string | null
  isApproved: boolean
  createdAt: string
  user: {
    id: string
    name: string
    photoUrl: string | null
  }
  replies: Array<{
    id: string
    comment: string
    user: { name: string }
  }>
}

export default function EmpresaReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [responding, setResponding] = useState<string | null>(null)
  const [response, setResponse] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchReviews()
  }, [page])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await empresaApi.getReviews({ page, limit: 20 })
      setReviews(response.data.data)
      setTotalPages(response.data.meta.totalPages)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar reseñas')
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (reviewId: string) => {
    if (!response.trim()) return
    try {
      await reviewsApi.respond(reviewId, response)
      setResponding(null)
      setResponse('')
      fetchReviews()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al enviar respuesta')
    }
  }

  const pendingCount = reviews.filter(r => r.replies.length === 0).length
  const respondedCount = reviews.filter(r => r.replies.length > 0).length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Reseñas</h1>
        <p className="text-neutral-500 mt-1">Gestiona las reseñas de tus clientes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-neutral-900">{reviews.length}</p>
          <p className="text-xs text-neutral-500 mt-1">Total</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-green-600">{respondedCount}</p>
          <p className="text-xs text-neutral-500 mt-1">Respondidas</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-xs text-neutral-500 mt-1">Pendientes</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6">
          {error}
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-secondary-600" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-10 w-10 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-secondary-700">
                        {review.user?.name?.[0] || '?'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-neutral-900">{review.user?.name}</p>
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
                        {review.replies.length > 0 && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            <Check className="h-3 w-3" /> Respondida
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      {review.comment && (
                        <p className="text-neutral-700 mt-2">{review.comment}</p>
                      )}
                      
                      {/* Show existing replies */}
                      {review.replies.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-secondary-200">
                          {review.replies.map((reply) => (
                            <div key={reply.id} className="mt-2">
                              <p className="text-sm font-medium text-secondary-700">{reply.user.name}</p>
                              <p className="text-sm text-neutral-600">{reply.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {review.replies.length === 0 && (
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
                                <button
                                  onClick={() => handleRespond(review.id)}
                                  className="px-4 py-2 text-sm bg-secondary-700 text-white rounded-lg hover:bg-secondary-800"
                                >
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
