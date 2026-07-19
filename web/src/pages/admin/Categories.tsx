import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, FolderOpen, Loader2 } from 'lucide-react'
import { categoriesApi } from '../../services/api'

interface Category {
  id: string
  name: string
  nameEn: string
  icon: string
  slug: string
  description: string | null
  isActive: boolean
  _count?: {
    places: number
  }
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await categoriesApi.getAll()
      setCategories(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return
    try {
      await categoriesApi.delete(id)
      fetchCategories()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar categoría')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Categorías</h1>
          <p className="text-neutral-500 mt-1">Gestiona las categorías de lugares</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors">
          <Plus className="h-5 w-5" />
          Agregar Categoría
        </button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <FolderOpen className="h-6 w-6 text-primary-700" />
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-neutral-900">{cat.name}</h3>
              <p className="text-sm text-neutral-500 mt-1">{cat._count?.places || 0} lugares</p>
              <p className="text-xs text-neutral-400 mt-1">/{cat.slug}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
