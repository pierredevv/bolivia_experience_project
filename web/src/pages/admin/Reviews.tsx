import { useState, useEffect } from 'react'
import { Star, Check, X, Loader2 } from 'lucide-react'
import { reviewsApi } from '../../services/api'

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
  place: {
    id: string
    name: string
  }
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchReviews()
  }, [page])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await reviewsApi.getAll({ page, limit: 20 })
      setReviews(response.data.data)
      setTotalPages(response.data.meta.totalPages)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar reseñas')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await reviewsApi.approve(id)
      fetchReviews()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al aprobar reseña')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta reseña?')) return
    try {
      await reviewsApi.delete(id)
      fetchReviews()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar reseña')
    }
  }

  const pendingCount = reviews.filter(r => !r.isApproved).length
  const approvedCount = reviews.filter(r => r.isApproved).length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Reseñas</h1>
        <p className="text-neutral-500 mt-1">Modera las reseñas de los usuarios</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-neutral-500">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-neutral-500">Aprobadas</p>
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
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
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary-700">
                        {review.user?.name?.[0] || '?'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-neutral-900">{review.user?.name}</p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          review.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {review.isApproved ? 'Aprobada' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500">
                        {review.place?.name} • {new Date(review.createdAt).toLocaleDateString()}
                      </p>
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
                      {review.comment && (
                        <p className="text-neutral-700 mt-2">{review.comment}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!review.isApproved && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <X className="h-5 w-5" />
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
