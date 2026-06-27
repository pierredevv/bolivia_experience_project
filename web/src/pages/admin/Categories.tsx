import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react'

const categories = [
  { id: '1', name: 'Restaurantes', icon: 'restaurant', slug: 'restaurantes', places: 45 },
  { id: '2', name: 'Hoteles', icon: 'hotel', slug: 'hoteles', places: 25 },
  { id: '3', name: 'Cafeterías', icon: 'local_cafe', slug: 'cafeterias', places: 30 },
  { id: '4', name: 'Atracciones', icon: 'place', slug: 'atracciones', places: 20 },
  { id: '5', name: 'Parques', icon: 'park', slug: 'parques', places: 15 },
  { id: '6', name: 'Museos', icon: 'museum', slug: 'museos', places: 10 },
  { id: '7', name: 'Bares', icon: 'local_bar', slug: 'bares', places: 35 },
  { id: '8', name: 'Centros Comerciales', icon: 'shopping_cart', slug: 'centros-comerciales', places: 8 },
]

export default function AdminCategories() {
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
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-neutral-900">{cat.name}</h3>
            <p className="text-sm text-neutral-500 mt-1">{cat.places} lugares</p>
            <p className="text-xs text-neutral-400 mt-1">/{cat.slug}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
