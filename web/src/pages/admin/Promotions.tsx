import { useState, useEffect } from 'react'
import { Edit, Trash2, Tag, Calendar, Loader2 } from 'lucide-react'
import { promotionsApi } from '../../services/api'

interface Promotion {
  id: string
  title: string
  description: string | null
  discountPercentage: number | null
  startDate: string
  endDate: string
  isActive: boolean
  place: {
    id: string
    name: string
  }
}

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const response = await promotionsApi.getAll()
      setPromotions(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar promociones')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta promoción?')) return
    try {
      await promotionsApi.delete(id)
      fetchPromotions()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar promoción')
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
          <h1 className="text-2xl font-bold text-neutral-900">Promociones</h1>
          <p className="text-neutral-500 mt-1">Gestiona las promociones de los negocios</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div key={promo.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-secondary-500 to-secondary-600">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-white">
                    {promo.discountPercentage ? `-${promo.discountPercentage}%` : 'Promo'}
                  </span>
                  <Tag className="h-8 w-8 text-white/50" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-neutral-900">{promo.title}</h3>
                <p className="text-sm text-neutral-500 mt-1">{promo.place?.name}</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-neutral-500">
                  <Calendar className="h-4 w-4" />
                  {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <button className="flex-1 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">
                    Ver detalles
                  </button>
                  <button className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
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
