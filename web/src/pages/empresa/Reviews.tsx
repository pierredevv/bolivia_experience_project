import { useState } from 'react'
import { Star, MessageSquare, Check, Loader2 } from 'lucide-react'
import { useEmpresaReviews } from '../../hooks/useEmpresa'
import { useRespondToReview } from '../../hooks/useReviews'
import { toast } from 'sonner'

export default function EmpresaReviews() {
  const [responding, setResponding] = useState<string | null>(null)
  const [response, setResponse] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useEmpresaReviews({ page, limit: 20 })
  const respondToReview = useRespondToReview()

  const reviews = data?.data || []
  const meta = data?.meta

  const handleRespond = (reviewId: string) => {
    if (!response.trim()) return
    respondToReview.mutate(
      { id: reviewId, comment: response },
      {
        onSuccess: () => {
          setResponding(null)
          setResponse('')
          toast.success('Respuesta enviada')
        },
        onError: () => {
          toast.error('Error al enviar la respuesta')
        },
      }
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Reseñas</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Gestiona las reseñas de tus clientes</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-secondary-700" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-600">Error al cargar reseñas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
              No hay reseñas aún
            </div>
          ) : (
            reviews.map((review: any) => (
              <div key={review.id} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-10 w-10 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-secondary-700 dark:text-secondary-400">
                        {review.user?.name?.[0] || '?'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{review.user?.name}</p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300 dark:text-neutral-600'
                              }`}
                            />
                          ))}
                        </div>
                        {review.replies && review.replies.length > 0 && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                            <Check className="h-3 w-3" /> Respondida
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {new Date(review.createdAt).toLocaleDateString('es-BO')}
                      </p>
                      <p className="text-neutral-700 dark:text-neutral-300 mt-2">{review.comment}</p>

                      {/* Show existing replies */}
                      {review.replies && review.replies.length > 0 && (
                        <div className="mt-3 ml-4 border-l-2 border-secondary-200 dark:border-secondary-700 pl-3">
                          {review.replies.map((reply: any) => (
                            <div key={reply.id} className="mt-2">
                              <p className="text-xs font-medium text-secondary-700 dark:text-secondary-400">{reply.user?.name}</p>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">{reply.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply form */}
                      {!review.replies?.length && (
                        <div className="mt-4">
                          {responding === review.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="Escribe tu respuesta..."
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none resize-none"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => { setResponding(null); setResponse('') }}
                                  className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => handleRespond(review.id)}
                                  disabled={respondToReview.isPending || !response.trim()}
                                  className="px-4 py-2 text-sm bg-secondary-700 text-white rounded-lg hover:bg-secondary-800 disabled:opacity-50"
                                >
                                  {respondToReview.isPending ? 'Enviando...' : 'Enviar Respuesta'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setResponding(review.id)}
                              className="flex items-center gap-2 text-sm text-secondary-700 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-300"
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
            ))
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Página {meta.page} de {meta.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 text-neutral-700 dark:text-neutral-300"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 text-neutral-700 dark:text-neutral-300"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
