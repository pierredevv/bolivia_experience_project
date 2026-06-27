import { Upload, Trash2, Star, Image } from 'lucide-react'

const photos = [
  { id: '1', url: '', isPrimary: true },
  { id: '2', url: '', isPrimary: false },
  { id: '3', url: '', isPrimary: false },
  { id: '4', url: '', isPrimary: false },
  { id: '5', url: '', isPrimary: false },
]

export default function EmpresaPhotos() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Fotos</h1>
          <p className="text-neutral-500 mt-1">Gestiona las fotos de tu negocio</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary-700 text-white rounded-lg hover:bg-secondary-800 transition-colors">
          <Upload className="h-5 w-5" />
          Subir Foto
        </button>
      </div>

      <p className="text-sm text-neutral-500 mb-4">
        {photos.length} de 10 fotos • La primera foto será la principal
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div key={photo.id} className="relative group">
            <div className="aspect-square bg-neutral-200 rounded-xl flex items-center justify-center overflow-hidden">
              <Image className="h-12 w-12 text-neutral-400" />
            </div>
            {photo.isPrimary && (
              <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                Principal
              </span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
              {!photo.isPrimary && (
                <button className="p-2 bg-white rounded-lg hover:bg-neutral-100">
                  <Star className="h-5 w-5 text-neutral-700" />
                </button>
              )}
              <button className="p-2 bg-white rounded-lg hover:bg-red-50">
                <Trash2 className="h-5 w-5 text-red-600" />
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2 text-center">Foto {index + 1}</p>
          </div>
        ))}

        {/* Upload placeholder */}
        <button className="aspect-square border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center text-neutral-500 hover:border-secondary-500 hover:text-secondary-700 transition-colors">
          <Upload className="h-8 w-8 mb-2" />
          <span className="text-sm font-medium">Subir foto</span>
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>Consejo:</strong> Las fotos de buena calidad aumentan las visitas hasta un 40%. 
          Usa fotos bien iluminadas que muestren lo mejor de tu negocio.
        </p>
      </div>
    </div>
  )
}
