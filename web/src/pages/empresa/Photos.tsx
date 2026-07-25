import { useState, useRef } from 'react'
<<<<<<< HEAD
import { Upload, Trash2, Image, Loader2, ImagePlus } from 'lucide-react'
=======
import { Upload, Trash2, ImageIcon, Loader2, Star, Info } from 'lucide-react'
>>>>>>> develop
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
<<<<<<< HEAD
      <div className="flex items-center justify-center py-32 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
=======
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
>>>>>>> develop
      </div>
    )
  }

  return (
<<<<<<< HEAD
    <div className="space-y-8 pb-12">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Fotos</h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
            Galería de tu establecimiento
          </p>
        </div>
        <label
          className={`inline-flex items-center gap-2 px-7 py-3.5 font-bold text-sm rounded-2xl transition-all duration-300 shadow-lg hover:-translate-y-0.5 whitespace-nowrap cursor-pointer ${
            photos.length >= 10 || uploading
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20 hover:shadow-emerald-600/30'
          }`}
        >
          <Upload className="h-5 w-5" />
=======
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Fotos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Gestiona las fotos de tu negocio</p>
        </div>
        <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm cursor-pointer ${
          photos.length >= 10 || uploading
            ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-600/20'
        }`}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
>>>>>>> develop
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

<<<<<<< HEAD
      {/* ── Stats Bar ── */}
      <div className="flex items-center justify-between bg-white border border-slate-100 rounded-[2rem] shadow-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <ImagePlus className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">
              {photos.length} <span className="text-slate-400 font-semibold">de 10 fotos</span>
            </p>
            <p className="text-xs font-semibold text-slate-400">La primera foto será la principal</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="hidden sm:flex items-center gap-3 w-48">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${(photos.length / 10) * 100}%` }}
            />
          </div>
          <span className="text-xs font-black text-slate-500">{photos.length}/10</span>
        </div>
      </div>

      {/* ── Upload Error ── */}
      {uploadError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-bold flex items-center gap-2">
=======
      {/* Counters & Error */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Progress pill */}
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            photos.length >= 10
              ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
          }`}>
            {photos.length} / 10 fotos
          </span>
          {photos.length === 0 && (
            <span className="text-xs text-slate-400 dark:text-slate-500">La primera foto será la portada</span>
          )}
        </div>
        {uploading && (
          <span className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Subiendo...
          </span>
        )}
      </div>

      {uploadError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
>>>>>>> develop
          {uploadError}
        </div>
      )}

<<<<<<< HEAD
      {/* ── Uploading Banner ── */}
      {uploading && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 text-sm font-bold flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
          Subiendo foto...
        </div>
      )}

      {/* ── Photo Grid ── */}
      {photos.length === 0 && !uploading ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
          <Image className="h-14 w-14 text-slate-200 mx-auto mb-4" />
          <p className="text-base font-bold text-slate-400">No hay fotos todavía</p>
          <p className="text-sm font-semibold text-slate-300 mt-1">
            Sube fotos de tu negocio para atraer más visitantes
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo: any, index: number) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square bg-slate-100 rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-sm">
                {photo.url ? (
                  <img
                    src={photo.url}
                    alt={photo.altText || `Foto ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-12 w-12 text-slate-300" />
                  </div>
                )}
              </div>
              {/* Principal badge */}
              {index === 0 && (
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-amber-500 text-white text-[10px] font-black rounded-full shadow-sm">
                  Principal
                </span>
              )}
              {/* Delete overlay */}
              <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] flex items-center justify-center">
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="p-3 bg-white rounded-2xl hover:bg-red-50 shadow-lg transition-all hover:scale-110"
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}

          {/* Upload placeholder slot */}
          {photos.length < 10 && (
            <label className="aspect-square border-2 border-dashed border-slate-200 rounded-[1.5rem] flex flex-col items-center justify-center text-slate-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200 cursor-pointer">
              <Upload className="h-8 w-8 mb-2" />
              <span className="text-sm font-bold">Subir foto</span>
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
      )}

      {/* ── Tip Card ── */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 rounded-[2rem] p-6 lg:p-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <p className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-2">💡 Consejo</p>
        <p className="text-base text-slate-300 font-medium leading-relaxed">
          Las fotos de buena calidad aumentan las visitas hasta un{' '}
          <span className="text-white font-black">40%</span>. Usa imágenes bien iluminadas que
          muestren lo mejor de tu negocio.
        </p>
      </div>
=======
      {/* Empty State */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-20 w-20 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-5">
            <ImageIcon className="h-10 w-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sin fotos aún</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 max-w-xs">
            Sube fotos atractivas de tu negocio. Las fotos de buena calidad aumentan las visitas hasta un 40%.
          </p>
          <label className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20 cursor-pointer">
            <Upload className="h-4 w-4" />
            Subir primera foto
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      ) : (
        <>
          {/* Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo: any, index: number) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
                  {photo.url ? (
                    <img
                      src={photo.url}
                      alt={photo.altText || `Foto ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-slate-300 dark:text-slate-500" />
                    </div>
                  )}
                </div>
                {/* Cover badge */}
                {index === 0 && (
                  <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-amber-400 text-white text-xs font-bold rounded-lg shadow-sm">
                    <Star className="h-3 w-3 fill-white" /> Portada
                  </span>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="p-2.5 bg-white/95 dark:bg-slate-800/95 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-lg"
                    aria-label="Eliminar foto"
                  >
                    <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}

            {/* Upload placeholder tile */}
            {photos.length < 10 && (
              <label className="aspect-square border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-emerald-500 hover:text-emerald-600 dark:hover:border-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer group">
                <Upload className="h-7 w-7 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Subir foto</span>
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

          {/* Tip Banner */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-lg flex-shrink-0 mt-0.5">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
              <strong>Consejo:</strong> Las fotos de buena calidad aumentan las visitas hasta un 40%.
              Usa fotos bien iluminadas que muestren lo mejor de tu negocio.
            </p>
          </div>
        </>
      )}
>>>>>>> develop
    </div>
  )
}
