import { useState } from 'react'
import { Star, MessageSquare, Check, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Reseñas</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Gestiona y responde las reseñas de tus clientes</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="h-16 w-16 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-semibold">Error al cargar reseñas</p>
            <p className="text-sm text-slate-400 mt-1">Intenta recargar la página</p>
          </div>
        </div>
      ) : reviews.length === 0 ? (
        /* ── Premium Empty State ── */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-20 w-20 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-5">
            <Star className="h-10 w-10 text-amber-500 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Aún no tienes reseñas</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 max-w-xs">
            Cuando tus clientes dejen reseñas, aparecerán aquí para que puedas responderlas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div
              key={review.id}
              className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 p-6"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-emerald-100 dark:border-emerald-800">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {review.user?.name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex items-center flex-wrap gap-2">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{review.user?.name}</p>
                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    {review.replies && review.replies.length > 0 && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
                        <Check className="h-3 w-3" /> Respondida
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {new Date(review.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>

                  {/* Comment */}
                  <p className="text-slate-700 dark:text-slate-300 mt-3 text-sm leading-relaxed">{review.comment}</p>

                  {/* Existing replies */}
                  {review.replies && review.replies.length > 0 && (
                    <div className="mt-4 ml-4 pl-4 border-l-2 border-emerald-200 dark:border-emerald-700">
                      {review.replies.map((reply: any) => (
                        <div key={reply.id} className="mt-2">
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{reply.user?.name} · Tu respuesta</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{reply.comment}</p>
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
                            placeholder="Escribe tu respuesta pública..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none transition-shadow"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setResponding(null); setResponse('') }}
                              className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleRespond(review.id)}
                              disabled={respondToReview.isPending || !response.trim()}
                              className="px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                              {respondToReview.isPending ? 'Enviando...' : 'Enviar Respuesta'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setResponding(review.id)}
                          className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
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
          ))}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm px-5 py-3.5">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Página <span className="font-bold text-slate-900 dark:text-slate-100">{meta.page}</span> de <span className="font-bold text-slate-900 dark:text-slate-100">{meta.totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Siguiente <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
