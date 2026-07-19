import { useState } from 'react'
import { Plus, Pencil, Trash2, Tag, Calendar, Loader2 } from 'lucide-react'
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion } from '../../hooks/usePromotions'
import { useEmpresaPlace } from '../../hooks/useEmpresa'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from 'sonner'

interface PromotionForm {
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
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  photoUrl: '',
  discountPercentage: '',
  startDate: '',
  endDate: '',
}

export default function EmpresaPromotions() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PromotionForm>(defaultForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: place } = useEmpresaPlace()
  const { data, isLoading } = usePromotions({ limit: 50, all: true, placeId: place?.id })
  const createPromotion = useCreatePromotion()
  const updatePromotion = useUpdatePromotion()
  const deletePromotion = useDeletePromotion()

  const promotions = data?.data || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!place) return

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
        await createPromotion.mutateAsync({ placeId: place.id, data: payload })
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Promociones</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Crea ofertas para atraer clientes</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm(defaultForm); setIsModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-secondary-700 text-white rounded-lg font-medium hover:bg-secondary-800 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nueva Promoción
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-secondary-700" />
        </div>
      ) : promotions.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No hay promociones"
          description="Crea ofertas para atraer más clientes a tu negocio."
          action={{ label: 'Crear Promoción', onClick: () => { setEditingId(null); setForm(defaultForm); setIsModalOpen(true) } }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map((promo: any) => (
            <div key={promo.id} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-secondary-500 to-secondary-600">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-white">
                    {promo.discountPercentage ? `-${promo.discountPercentage}%` : 'Oferta'}
                  </span>
                  <Tag className="h-8 w-8 text-white/50" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{promo.title}</h3>
                {promo.description && <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{promo.description}</p>}
                <div className="flex items-center gap-2 mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <Calendar className="h-4 w-4" />
                  {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <button onClick={() => handleEdit(promo)} className="flex-1 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 rounded-lg transition-colors flex items-center justify-center gap-1">
                    <Pencil className="h-4 w-4" /> Editar
                  </button>
                  <button
                    onClick={() => setDeleteId(promo.id)}
                    disabled={deletePromotion.isPending}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-500 dark:text-neutral-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingId(null) }}
        title={editingId ? 'Editar Promoción' : 'Nueva Promoción'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Título (ES)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Título (EN)" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
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
            <button type="submit" disabled={createPromotion.isPending || updatePromotion.isPending} className="px-4 py-2 rounded-lg bg-secondary-700 text-white text-sm font-medium hover:bg-secondary-800 disabled:opacity-50">
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
