import { useState } from 'react'
import { Star, Check, X, Loader2, MessageSquare } from 'lucide-react'
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

  const filters = [
    { label: 'Todas', value: '' },
    { label: 'Pendientes', value: 'pending' },
    { label: 'Aprobadas', value: 'approved' },
  ]

  return (
    <div className="space-y-8 pb-12">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Reseñas</h1>
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">
          Modera las reseñas de los usuarios
        </p>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-2 shadow-sm w-fit">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1) }}
            className={`px-5 py-2.5 rounded-2xl text-sm font-black transition-all duration-200 ${
              statusFilter === f.value
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        </div>
      ) : error ? (
        <div className="text-center py-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm">
          <p className="text-red-600 dark:text-red-400 text-lg font-bold">Error al cargar reseñas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm">
              <MessageSquare className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-base font-bold text-slate-400 dark:text-slate-500">No se encontraron reseñas</p>
            </div>
          ) : (
            reviews.map((review: any) => (
<<<<<<< HEAD
              <div
                key={review.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm hover:shadow-xl dark:hover:shadow-slate-950/40 transition-all duration-300 p-6 lg:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="h-11 w-11 bg-slate-900 dark:bg-slate-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-sm font-black text-white uppercase">
=======
              <div key={review.id} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
>>>>>>> develop
                        {review.user?.name?.[0] || '?'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <p className="text-base font-black text-slate-900 dark:text-white">{review.user?.name}</p>
                        <span className={`px-2.5 py-0.5 text-xs font-black rounded-full ${
                          review.isApproved
                            ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        }`}>
                          {review.isApproved ? 'Aprobada' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">
                        {review.place?.name} · {new Date(review.createdAt).toLocaleDateString('es-BO')}
                      </p>
                      <div className="flex items-center gap-0.5 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{review.comment}</p>
                    </div>
                  </div>

                  {!review.isApproved && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={approveReview.isPending}
                        className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                        title="Aprobar"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReject(review.id)}
                        disabled={deleteReview.isPending}
                        className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        title="Rechazar"
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
<<<<<<< HEAD
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm p-5">
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
                Página <span className="text-slate-800 dark:text-white">{meta.page}</span> de{' '}
                <span className="text-slate-800 dark:text-white">{meta.totalPages}</span>
=======
            <div className="flex items-center justify-between bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Página {meta.page} de {meta.totalPages}
>>>>>>> develop
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all"
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
