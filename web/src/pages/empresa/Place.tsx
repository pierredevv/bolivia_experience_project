import { useState, useEffect } from 'react'
import { Save, MapPin, Phone, Globe, Instagram, Loader2 } from 'lucide-react'
import { empresaApi } from '../../services/api'

interface Place {
  id: string
  name: string
  description: string | null
  address: string
  phone: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
}

export default function EmpresaPlace() {
  const [place, setPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchPlace()
  }, [])

  const fetchPlace = async () => {
    try {
      setLoading(true)
      const response = await empresaApi.getPlace()
      setPlace(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar lugar')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!place) return
    try {
      setSaving(true)
      await empresaApi.updatePlace({
        name: place.name,
        description: place.description,
        address: place.address,
        phone: place.phone,
        website: place.website,
        instagram: place.instagram,
        facebook: place.facebook,
        tiktok: place.tiktok,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-secondary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Mi Lugar</h1>
          <p className="text-neutral-500 mt-1">Edita la información de tu negocio</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary-700 text-white rounded-lg hover:bg-secondary-800 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Guardar Cambios
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 mb-6">
          Cambios guardados exitosamente
        </div>
      )}

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
                value={place?.name || ''}
                onChange={(e) => setPlace(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Descripción
              </label>
              <textarea
                rows={4}
                value={place?.description || ''}
                onChange={(e) => setPlace(prev => prev ? { ...prev, description: e.target.value } : null)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none resize-none"
              />
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
                value={place?.address || ''}
                onChange={(e) => setPlace(prev => prev ? { ...prev, address: e.target.value } : null)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> Teléfono</span>
              </label>
              <input
                type="tel"
                value={place?.phone || ''}
                onChange={(e) => setPlace(prev => prev ? { ...prev, phone: e.target.value } : null)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> Sitio Web</span>
              </label>
              <input
                type="url"
                value={place?.website || ''}
                onChange={(e) => setPlace(prev => prev ? { ...prev, website: e.target.value } : null)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                <span className="flex items-center gap-2"><Instagram className="h-4 w-4" /> Instagram</span>
              </label>
              <input
                type="text"
                value={place?.instagram || ''}
                onChange={(e) => setPlace(prev => prev ? { ...prev, instagram: e.target.value } : null)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
