import { Save, MapPin, Phone, Globe, Instagram, Clock } from 'lucide-react'

export default function EmpresaPlace() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Mi Lugar</h1>
          <p className="text-neutral-500 mt-1">Edita la información de tu negocio</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary-700 text-white rounded-lg hover:bg-secondary-800 transition-colors">
          <Save className="h-5 w-5" />
          Guardar Cambios
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nombre del negocio
              </label>
              <input
                type="text"
                defaultValue="La Casa del Camba"
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Descripción
              </label>
              <textarea
                rows={4}
                defaultValue="Restaurante tradicional con gastronomía cruceña auténtica. Chicharrón, majao, y platos típicos."
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Categoría
              </label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none">
                <option value="restaurantes">Restaurantes</option>
                <option value="hoteles">Hoteles</option>
                <option value="cafeterias">Cafeterías</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Contacto y Ubicación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Dirección</span>
              </label>
              <input
                type="text"
                defaultValue="Av. San Martín 1250, Santa Cruz de la Sierra"
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> Teléfono</span>
              </label>
              <input
                type="tel"
                defaultValue="+591 3 3456789"
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> Sitio Web</span>
              </label>
              <input
                type="url"
                defaultValue="https://lacasadelcamba.com"
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                <span className="flex items-center gap-2"><Instagram className="h-4 w-4" /> Instagram</span>
              </label>
              <input
                type="text"
                defaultValue="@lacasadelcamba"
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            <span className="flex items-center gap-2"><Clock className="h-5 w-5" /> Horarios</span>
          </h2>
          <div className="space-y-3">
            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, i) => (
              <div key={day} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium text-neutral-700">{day}</span>
                <input
                  type="time"
                  defaultValue={i < 5 ? '11:00' : '11:00'}
                  className="px-3 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
                />
                <span className="text-neutral-500">-</span>
                <input
                  type="time"
                  defaultValue={i < 4 ? '23:00' : '00:00'}
                  className="px-3 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
                />
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-neutral-300" />
                  <span className="text-sm text-neutral-500">Cerrado</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
