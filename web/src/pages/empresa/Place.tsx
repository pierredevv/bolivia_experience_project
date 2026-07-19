import { useState, useEffect } from 'react'
import { Save, MapPin, Phone, Globe, Instagram, Clock, Loader2, CheckCircle } from 'lucide-react'
import { useEmpresaPlace, useUpdateEmpresaPlace } from '../../hooks/useEmpresa'
import { useCategories } from '../../hooks/useCategories'
import { toast } from 'sonner'

export default function EmpresaPlace() {
  const { data: place, isLoading } = useEmpresaPlace()
  const { data: categories } = useCategories()
  const updatePlace = useUpdateEmpresaPlace()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    instagram: '',
    categoryId: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (place) {
      setFormData({
        name: place.name || '',
        description: place.description || '',
        address: place.address || '',
        phone: place.phone || '',
        website: place.website || '',
        instagram: place.instagram || '',
        categoryId: place.categoryId || '',
      })
    }
  }, [place])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = () => {
    updatePlace.mutate(formData, {
      onSuccess: () => {
        setSaved(true)
        toast.success('Lugar actualizado correctamente')
        setTimeout(() => setSaved(false), 3000)
      },
      onError: () => {
        toast.error('Error al actualizar el lugar')
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-secondary-700" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Mi Lugar</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Edita la información de tu negocio</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updatePlace.isPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary-700 text-white rounded-lg hover:bg-secondary-800 transition-colors disabled:opacity-50"
        >
          {updatePlace.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : saved ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {saved ? 'Guardado!' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Nombre del negocio
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Categoría
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
              >
                <option value="">Seleccionar categoría</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Contacto y Ubicación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Dirección</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> Teléfono</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> Sitio Web</span>
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                <span className="flex items-center gap-2"><Instagram className="h-4 w-4" /> Instagram</span>
              </label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            <span className="flex items-center gap-2"><Clock className="h-5 w-5" /> Horarios</span>
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Los horarios se gestionan desde el panel de administración del lugar.
          </p>
          <div className="space-y-3">
            {(place?.hours || []).sort((a: any, b: any) => a.dayOfWeek - b.dayOfWeek).map((hour: any) => {
              const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
              return (
                <div key={hour.id} className="flex items-center gap-4">
                  <span className="w-24 text-sm font-medium text-neutral-700 dark:text-neutral-300">{days[hour.dayOfWeek]}</span>
                  {hour.isClosed ? (
                    <span className="text-sm text-red-500 font-medium">Cerrado</span>
                  ) : (
                    <>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{hour.openTime}</span>
                      <span className="text-neutral-500 dark:text-neutral-400">-</span>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{hour.closeTime}</span>
                    </>
                  )}
                </div>
              )
            })}
            {(!place?.hours || place.hours.length === 0) && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No hay horarios configurados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
