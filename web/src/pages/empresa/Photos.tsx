import { useState, useRef } from 'react'
import { Upload, Trash2, Image, Loader2 } from 'lucide-react'
import { useEmpresaPlace } from '../../hooks/useEmpresa'
import { placesApi } from '../../services/api'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function EmpresaPhotos() {
  const { data: place, isLoading } = useEmpresaPlace()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const photos = place?.photos || []

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !place) return

    if (photos.length >= 10) {
      setUploadError('Máximo 10 fotos permitidas')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      await placesApi.uploadPhoto(place.id, file)
      queryClient.invalidateQueries({ queryKey: ['empresa-place'] })
      toast.success('Foto subida correctamente')
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Error al subir foto'
      setUploadError(msg)
      toast.error(msg)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (photoId: string) => {
    if (!place) return
    if (!confirm('¿Eliminar esta foto?')) return

    try {
      await placesApi.delete(`${place.id}/photos/${photoId}`)
      queryClient.invalidateQueries({ queryKey: ['empresa-place'] })
      toast.success('Foto eliminada')
    } catch (err) {
      toast.error('Error al eliminar la foto')
    }
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
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Fotos</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Gestiona las fotos de tu negocio</p>
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary-700 text-white rounded-lg hover:bg-secondary-800 transition-colors cursor-pointer">
          <Upload className="h-5 w-5" />
          Subir Foto
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading || photos.length >= 10}
          />
        </label>
      </div>

      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
          {uploadError}
        </div>
      )}

      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
        {photos.length} de 10 fotos • La primera foto será la principal
      </p>

      {uploading && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-400 text-sm flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Subiendo foto...
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo: any, index: number) => (
          <div key={photo.id} className="relative group">
            <div className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-xl overflow-hidden">
              {photo.url ? (
                <img src={photo.url} alt={photo.altText || `Foto ${index + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="h-12 w-12 text-neutral-400 dark:text-neutral-500" />
                </div>
              )}
            </div>
            {index === 0 && (
              <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                Principal
              </span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
              <button
                onClick={() => handleDelete(photo.id)}
                className="p-2 bg-white dark:bg-neutral-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </button>
            </div>
          </div>
        ))}

        {/* Upload placeholder */}
        {photos.length < 10 && (
          <label className="aspect-square border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400 hover:border-secondary-500 hover:text-secondary-700 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Subir foto</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Consejo:</strong> Las fotos de buena calidad aumentan las visitas hasta un 40%.
          Usa fotos bien iluminadas que muestren lo mejor de tu negocio.
        </p>
      </div>
    </div>
  )
}
