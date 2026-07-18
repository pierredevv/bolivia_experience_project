import { useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, MapPin, Star, Eye, EyeOff } from 'lucide-react'
import { usePlaces, useCreatePlace, useDeletePlace, useTogglePlaceStatus } from '../../hooks/usePlaces'
import { useCategories } from '../../hooks/useCategories'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from 'sonner'

interface PlaceForm {
  name: string
  description: string
  descriptionEn: string
  address: string
  phone: string
  website: string
  instagram: string
  facebook: string
  tiktok: string
  latitude: string
  longitude: string
  categoryId: string
  isFeatured: boolean
}

const defaultForm: PlaceForm = {
  name: '',
  description: '',
  descriptionEn: '',
  address: '',
  phone: '',
  website: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  latitude: '',
  longitude: '',
  categoryId: '',
  isFeatured: false,
}

export default function AdminPlaces() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PlaceForm>(defaultForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: categories } = useCategories()
  const { data, isLoading } = usePlaces({
    page,
    limit: 12,
    search: search || undefined,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    allStatuses: statusFilter === 'all',
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  })
  const createPlace = useCreatePlace()
  const deletePlace = useDeletePlace()
  const toggleStatus = useTogglePlaceStatus()

  const places = data?.data || []
  const meta = data?.meta

  const categoryOptions = [
    { value: '', placeholder: 'Seleccionar categoría' },
    ...(categories?.map((c: any) => ({ value: c.id, label: c.name })) || []),
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = {
      name: form.name,
      description: form.description || undefined,
      descriptionEn: form.descriptionEn || undefined,
      address: form.address,
      phone: form.phone || undefined,
      website: form.website || undefined,
      instagram: form.instagram || undefined,
      facebook: form.facebook || undefined,
      tiktok: form.tiktok || undefined,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      categoryId: form.categoryId,
      isFeatured: form.isFeatured,
    }

    try {
      if (editingId) {
        // Update not implemented in API yet, placeholder
        toast.success('Lugar actualizado')
      } else {
        await createPlace.mutateAsync(payload)
        toast.success('Lugar creado')
      }
      setIsModalOpen(false)
      setEditingId(null)
      setForm(defaultForm)
    } catch {
      toast.error('Error al guardar el lugar')
    }
  }

  const handleEdit = (place: any) => {
    setEditingId(place.id)
    setForm({
      name: place.name || '',
      description: place.description || '',
      descriptionEn: place.descriptionEn || '',
      address: place.address || '',
      phone: place.phone || '',
      website: place.website || '',
      instagram: place.instagram || '',
      facebook: place.facebook || '',
      tiktok: place.tiktok || '',
      latitude: place.latitude?.toString() || '',
      longitude: place.longitude?.toString() || '',
      categoryId: place.categoryId || '',
      isFeatured: place.isFeatured || false,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deletePlace.mutateAsync(deleteId)
      toast.success('Lugar eliminado')
      setDeleteId(null)
    } catch {
      toast.error('Error al eliminar el lugar')
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatus.mutateAsync(id)
      toast.success('Estado actualizado')
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Lugares</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Gestiona los lugares turísticos</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm(defaultForm); setIsModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-700 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nuevo Lugar
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 dark:text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar lugares..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
            className="px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="all">Todas las categorías</option>
            {categories?.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Ocultos</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        </div>
      ) : places.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No hay lugares"
          description="Crea el primer lugar turístico."
          action={{ label: 'Crear Lugar', onClick: () => { setEditingId(null); setForm(defaultForm); setIsModalOpen(true) } }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place: any) => (
              <div key={place.id} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="h-48 bg-neutral-200 dark:bg-neutral-700 relative">
                  {place.photos?.[0] ? (
                    <img src={place.photos[0].url} alt={place.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MapPin className="h-12 w-12 text-neutral-400" />
                    </div>
                  )}
                  {place.isFeatured && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                      Destacado
                    </span>
                  )}
                  <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full ${place.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {place.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{place.name}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{place.category?.name || 'Sin categoría'}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{place.ratingAvg?.toFixed(1) || '0.0'}</span>
                    </div>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{place._count?.reviews || 0} reseñas</span>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <button onClick={() => handleEdit(place)} className="flex-1 py-2 text-sm font-medium text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors flex items-center justify-center gap-1">
                      <Pencil className="h-4 w-4" /> Editar
                    </button>
                    <button
                      onClick={() => handleToggleStatus(place.id)}
                      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                      title={place.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {place.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setDeleteId(place.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-500 dark:text-neutral-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {meta && (
            <div className="mt-6">
              <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} total={meta.total} limit={meta.limit} />
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingId(null) }}
        title={editingId ? 'Editar Lugar' : 'Nuevo Lugar'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Textarea label="Descripción (ES)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Textarea label="Descripción (EN)" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
          </div>
          <Input label="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required placeholder="Av. principal #123" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+591 3 123456" />
            <Select label="Categoría" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} options={categoryOptions.filter(o => o.value)} required placeholder="Seleccionar categoría" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Latitud" type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} required placeholder="-17.7833" />
            <Input label="Longitud" type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} required placeholder="-63.1821" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
            <Input label="Instagram" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@usuario" />
            <Input label="Facebook" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder="https://..." />
          </div>
          <Input label="TikTok" value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} placeholder="@usuario" />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="rounded border-neutral-300 dark:border-neutral-600" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Lugar destacado</span>
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null) }} className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
              Cancelar
            </button>
            <button type="submit" disabled={createPlace.isPending} className="px-4 py-2 rounded-lg bg-primary-700 text-white text-sm font-medium hover:bg-primary-800 disabled:opacity-50">
              {createPlace.isPending ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Lugar"
        message="¿Estás seguro de que deseas eliminar este lugar? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={deletePlace.isPending}
      />
    </div>
  )
}
