import { useState } from 'react'
import { Plus, Pencil, Trash2, Tag, Calendar, Loader2, Sparkles, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion } from '../../hooks/usePromotions'
import { useEmpresaPlace } from '../../hooks/useEmpresa'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
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

function getPromoStatus(startDate: string, endDate: string): { label: string; color: string } {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (now < start) return { label: 'Próxima', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
  if (now > end) return { label: 'Expirada', color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
  return { label: 'Activa', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }
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

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })

  const openCreate = () => { setEditingId(null); setForm(defaultForm); setIsModalOpen(true) }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Promociones</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Crea ofertas para atraer más clientes</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-600/20"
        >
          <Plus className="h-4 w-4" />
          Nueva Promoción
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : promotions.length === 0 ? (
        /* ── Premium Empty State ── */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative mb-5">
            <div className="h-20 w-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
              <Tag className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="absolute -top-1 -right-1 h-6 w-6 bg-amber-400 rounded-full flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sin promociones activas</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 max-w-xs">
            Crea tu primera oferta para destacar tu negocio y atraer más visitantes.
          </p>
          <button
            onClick={openCreate}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20"
          >
            <Plus className="h-4 w-4" />
            Crear primera promoción
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {promotions.map((promo: any) => {
            const status = getPromoStatus(promo.startDate, promo.endDate)
            const isExpired = status.label === 'Expirada'
            return (
              <div
                key={promo.id}
                className={`group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col ${isExpired ? 'opacity-70' : ''}`}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

                {/* Card Top: Discount + Status */}
                <div className="relative flex items-start justify-between p-5 pb-4">
                  {/* Discount badge */}
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2.5 rounded-xl">
                      <Tag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    {promo.discountPercentage && (
                      <div>
                        <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                          -{promo.discountPercentage}%
                        </span>
                        <p className="text-xs text-slate-400 dark:text-slate-500 leading-none mt-0.5">descuento</p>
                      </div>
                    )}
                  </div>
                  {/* Status badge */}
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${status.color}`}>
                    {status.label === 'Activa' && <CheckCircle2 className="h-3 w-3" />}
                    {status.label === 'Expirada' && <XCircle className="h-3 w-3" />}
                    {status.label === 'Próxima' && <Clock className="h-3 w-3" />}
                    {status.label}
                  </span>
                </div>

                {/* Card Body */}
                <div className="px-5 pb-5 flex flex-col flex-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">{promo.title}</h3>
                  {promo.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{promo.description}</p>
                  )}

                  {/* Date range */}
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-400 dark:text-slate-500">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{formatDate(promo.startDate)} — {formatDate(promo.endDate)}</span>
                  </div>

                  {/* Divider + Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => handleEdit(promo)}
                      className="flex-1 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteId(promo.id)}
                      disabled={deletePromotion.isPending}
                      className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                      aria-label="Eliminar promoción"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
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
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); setEditingId(null) }}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createPromotion.isPending || updatePromotion.isPending}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {createPromotion.isPending || updatePromotion.isPending ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Promoción'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Promoción"
        message="¿Estás seguro de que deseas eliminar esta promoción? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={deletePromotion.isPending}
      />
    </div>
  )
}
