import { Plus, Edit, Trash2, Tag, Calendar, Percent } from 'lucide-react'

const promotions = [
  { id: '1', title: '2x1 en almuerzos', place: 'La Casa del Camba', discount: 50, startDate: '2026-07-01', endDate: '2026-07-31', status: 'active' },
  { id: '2', title: '15% en estadías largas', place: 'Hotel Los Tajibos', discount: 15, startDate: '2026-06-01', endDate: '2026-12-31', status: 'active' },
  { id: '3', title: 'Café + pastel = Bs 25', place: 'Café Munaipata', discount: 20, startDate: '2026-06-26', endDate: '2026-08-31', status: 'active' },
]

export default function AdminPromotions() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Promociones</h1>
          <p className="text-neutral-500 mt-1">Gestiona las promociones de los negocios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <p className="text-sm text-neutral-500 mt-1">{promo.place}</p>
              <div className="flex items-center gap-2 mt-3 text-sm text-neutral-500">
                <Calendar className="h-4 w-4" />
                {promo.startDate} - {promo.endDate}
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <button className="flex-1 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">
                  Ver detalles
                </button>
                <button className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-red-50 text-neutral-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
