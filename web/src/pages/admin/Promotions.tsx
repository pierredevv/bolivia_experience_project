import { useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, Tag } from 'lucide-react'
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion } from '../../hooks/usePromotions'
import { usePlaces } from '../../hooks/usePlaces'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from 'sonner'

interface PromotionForm {
  placeId: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  photoUrl: string
  discountPercentage: string
  startDate: string
  endDate: string
}

const defaultForm: PromotionForm = {
  placeId: '',
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  photoUrl: '',
  discountPercentage: '',
  startDate: '',
  endDate: '',
}

export default function AdminPromotions() {
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PromotionForm>(defaultForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = usePromotions({ page, limit: 10, all: true })
  const { data: places } = usePlaces({ limit: 100 })
  const createPromotion = useCreatePromotion()
  const updatePromotion = useUpdatePromotion()
  const deletePromotion = useDeletePromotion()

  const promotions = data?.data || []
  const meta = data?.meta
  const placeOptions = places?.data?.map((p: any) => ({ value: p.id, label: p.name })) || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = {
      title: form.title,
      titleEn: form.titleEn || undefined,
      description: form.description || undefined,
      descriptionEn: form.descriptionEn || undefined,
      photoUrl: form.photoUrl || undefined,
      discountPercentage: form.discountPercentage ? parseInt(form.discountPercentage) : undefined,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
    }

    try {
      if (editingId) {
        await updatePromotion.mutateAsync({ id: editingId, data: payload })
        toast.success('Promoción actualizada')
      } else {
        await createPromotion.mutateAsync({ placeId: form.placeId, data: payload })
        toast.success('Promoción creada')
      }
      setIsModalOpen(false)
      setEditingId(null)
      setForm(defaultForm)
    } catch {
      toast.error('Error al guardar la promoción')
    }
  }

  const handleEdit = (promo: any) => {
    setEditingId(promo.id)
    setForm({
      placeId: promo.placeId || '',
      title: promo.title || '',
      titleEn: promo.titleEn || '',
      description: promo.description || '',
      descriptionEn: promo.descriptionEn || '',
      photoUrl: promo.photoUrl || '',
      discountPercentage: promo.discountPercentage?.toString() || '',
      startDate: promo.startDate ? new Date(promo.startDate).toISOString().slice(0, 10) : '',
      endDate: promo.endDate ? new Date(promo.endDate).toISOString().slice(0, 10) : '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deletePromotion.mutateAsync(deleteId)
      toast.success('Promoción eliminada')
      setDeleteId(null)
    } catch {
      toast.error('Error al eliminar la promoción')
    }
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-BO')

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Promociones</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Gestiona las promociones de los negocios</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm(defaultForm); setIsModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-700 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nueva Promoción
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        </div>
      ) : promotions.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No hay promociones"
          description="Crea la primera promoción para atraer clientes."
          action={{ label: 'Crear Promoción', onClick: () => { setEditingId(null); setForm(defaultForm); setIsModalOpen(true) } }}
        />
      ) : (
        <>
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-700/50 border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Título</th>
                    <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Lugar</th>
                    <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Descuento</th>
                    <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Vigencia</th>
                    <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Estado</th>
                    <th className="text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((promo: any) => (
                    <tr key={promo.id} className="border-b border-neutral-200 dark:border-neutral-700 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">{promo.title}</p>
                          {promo.titleEn && <p className="text-xs text-neutral-500 dark:text-neutral-400">{promo.titleEn}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{promo.place?.name || '-'}</td>
                      <td className="px-6 py-4">
                        {promo.discountPercentage ? (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">{promo.discountPercentage}%</span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                        {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${promo.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                          {promo.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(promo)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-primary-700">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteId(promo.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-500 dark:text-neutral-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {meta && (
            <div className="mt-4">
              <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} total={meta.total} limit={meta.limit} />
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingId(null) }}
        title={editingId ? 'Editar Promoción' : 'Nueva Promoción'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingId && (
            <Select
              label="Lugar"
              value={form.placeId}
              onChange={(e) => setForm({ ...form, placeId: e.target.value })}
              options={placeOptions}
              required
              placeholder="Seleccionar lugar"
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Título (ES)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label="Título (EN)" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
          </div>
          <Textarea label="Descripción (ES)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Textarea label="Descripción (EN)" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Descuento %" type="number" min="0" max="100" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} placeholder="10" />
            <Input label="Fecha inicio" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            <Input label="Fecha fin" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
          </div>
          <Input label="URL Foto" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null) }} className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
              Cancelar
            </button>
            <button type="submit" disabled={createPromotion.isPending || updatePromotion.isPending} className="px-4 py-2 rounded-lg bg-primary-700 text-white text-sm font-medium hover:bg-primary-800 disabled:opacity-50">
              {createPromotion.isPending || updatePromotion.isPending ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Promoción"
        message="¿Estás seguro de que deseas eliminar esta promoción?"
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={deletePromotion.isPending}
      />
    </div>
  )
}
