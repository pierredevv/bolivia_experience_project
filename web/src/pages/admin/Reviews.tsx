import { useState } from 'react'
import { Star, Check, X, Loader2 } from 'lucide-react'
import { useAdminReviews, useApproveReview, useDeleteReview } from '../../hooks/useReviews'

export default function AdminReviews() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data, isLoading, error } = useAdminReviews({
    page,
    limit: 20,
    status: statusFilter || undefined,
  })
  const approveReview = useApproveReview()
  const deleteReview = useDeleteReview()

  const reviews = data?.data || []
  const meta = data?.meta

  const handleApprove = (id: string) => {
    approveReview.mutate(id)
  }

  const handleReject = (id: string) => {
    if (confirm('¿Rechazar esta reseña?')) {
      deleteReview.mutate(id)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Reseñas</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Modera las reseñas de los usuarios</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => { setStatusFilter(''); setPage(1) }}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            statusFilter === '' ? 'bg-primary-700 text-white' : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => { setStatusFilter('pending'); setPage(1) }}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            statusFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => { setStatusFilter('approved'); setPage(1) }}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            statusFilter === 'approved' ? 'bg-green-500 text-white' : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
          }`}
        >
          Aprobadas
        </button>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-600">Error al cargar reseñas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
              No se encontraron reseñas
            </div>
          ) : (
            reviews.map((review: any) => (
              <div key={review.id} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
                        {review.user?.name?.[0] || '?'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{review.user?.name}</p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          review.isApproved ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {review.isApproved ? 'Aprobada' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {review.place?.name} • {new Date(review.createdAt).toLocaleDateString('es-BO')}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300 dark:text-neutral-600'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300 mt-2">{review.comment}</p>
                    </div>
                  </div>

                  {!review.isApproved && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={approveReview.isPending}
                        className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReject(review.id)}
                        disabled={deleteReview.isPending}
                        className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-4">
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
