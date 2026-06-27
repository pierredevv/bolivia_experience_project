import { Plus, Edit, Trash2, Tag, Calendar } from 'lucide-react'

const promotions = [
  { id: '1', title: '2x1 en almuerzos', discount: 50, startDate: '2026-07-01', endDate: '2026-07-31', status: 'active' },
  { id: '2', title: 'Café + pastel = Bs 25', discount: 20, startDate: '2026-06-26', endDate: '2026-08-31', status: 'active' },
]

export default function EmpresaPromotions() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Promociones</h1>
          <p className="text-neutral-500 mt-1">Crea ofertas para atraer clientes</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary-700 text-white rounded-lg hover:bg-secondary-800 transition-colors">
          <Plus className="h-5 w-5" />
          Nueva Promoción
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promotions.map((promo) => (
          <div key={promo.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-secondary-500 to-secondary-600">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-white">-{promo.discount}%</span>
                <Tag className="h-8 w-8 text-white/50" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-neutral-900">{promo.title}</h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-neutral-500">
                <Calendar className="h-4 w-4" />
                {promo.startDate} - {promo.endDate}
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <button className="flex-1 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 rounded-lg transition-colors">
                  Editar
                </button>
                <button className="p-2 rounded-lg hover:bg-red-50 text-neutral-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <Tag className="h-12 w-12 text-neutral-400 mb-3" />
          <p className="font-medium text-neutral-900">Crear nueva promoción</p>
          <p className="text-sm text-neutral-500 mt-1">Atrae más clientes con ofertas especiales</p>
          <button className="mt-4 px-4 py-2 bg-secondary-700 text-white rounded-lg hover:bg-secondary-800 transition-colors">
            Crear Promoción
          </button>
        </div>
      </div>
    </div>
  )
}
