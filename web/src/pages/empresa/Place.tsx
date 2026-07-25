import { useState, useEffect } from 'react'
import { Save, MapPin, Phone, Globe, Instagram, Clock, Loader2, CheckCircle, Building2, Link } from 'lucide-react'
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

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow text-sm"

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Mi Lugar</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Edita la información pública de tu negocio</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updatePlace.isPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50"
        >
          {updatePlace.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saved ? '¡Guardado!' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="space-y-5">
        {/* Basic Info Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-slate-900 dark:bg-slate-700 p-2 rounded-xl">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Información Básica</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Nombre del negocio
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej. Restaurante El Gourmet"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe tu negocio de forma atractiva para los visitantes..."
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Categoría
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Seleccionar categoría</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-slate-900 dark:bg-slate-700 p-2 rounded-xl">
              <Phone className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Contacto y Ubicación</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Dirección</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Calle, número, zona, ciudad"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Teléfono</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+591 70000000"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Sitio Web</span>
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://www.muweb.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                <span className="flex items-center gap-1.5"><Instagram className="h-3.5 w-3.5" /> Instagram</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">@</span>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="mi_negocio"
                  className={`${inputClass} pl-7`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hours Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-slate-900 dark:bg-slate-700 p-2 rounded-xl">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Horarios</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
            <Link className="h-3.5 w-3.5 flex-shrink-0" />
            Los horarios se gestionan desde el panel de administración del lugar.
          </p>
          <div className="space-y-2">
            {(place?.hours || []).sort((a: any, b: any) => a.dayOfWeek - b.dayOfWeek).map((hour: any) => {
              const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
              return (
                <div key={hour.id} className="flex items-center gap-4 py-2.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <span className="w-28 text-sm font-semibold text-slate-700 dark:text-slate-300">{days[hour.dayOfWeek]}</span>
                  {hour.isClosed ? (
                    <span className="px-2.5 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">Cerrado</span>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
                      {hour.openTime} – {hour.closeTime}
                    </span>
                  )}
                </div>
              )
            })}
            {(!place?.hours || place.hours.length === 0) && (
              <p className="text-sm text-slate-400 dark:text-slate-500 py-2 px-3">No hay horarios configurados aún.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
