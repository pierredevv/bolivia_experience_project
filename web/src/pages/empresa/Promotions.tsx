import { useState } from 'react'
import { Plus, Pencil, Trash2, Tag, Loader2, Percent, TrendingUp, Clock, Sparkles } from 'lucide-react'
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion } from '../../hooks/usePromotions'
import { useEmpresaPlace } from '../../hooks/useEmpresa'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from 'sonner'

/* ──────────────────────────────────────────────────────────────────
   EmpresaPromotions.tsx — B2B Enterprise Promotions Management
   
   Design System (Section 4 — Enterprise & B2B Dashboard):
     70% Alpine Minimalism   → radical whitespace, text-base/lg sizing
     15% MD3 Functional       → Bento metric grids, micro-border surfaces
     10% Glassmorphism        → hero banner gradient (NOT header — reserved)
      5% Organic Softness    → rounded-[2.5rem] cards, sweeping curves
   
   Semantic Tokens:
     Emerald Green  → active states, nature/eco emphasis
     Slate Dark     → hero banner, trust typography
     Amber Gold     → CTA buttons, conversion points
   ────────────────────────────────────────────────────────────────── */

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
  const activeCount = promotions.filter((p: any) => {
    const now = new Date()
    return new Date(p.endDate) >= now
  }).length
  const avgDiscount = promotions.length
    ? Math.round(promotions.reduce((sum: number, p: any) => sum + (p.discountPercentage || 0), 0) / promotions.length)
    : 0

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

  const isPromoActive = (endDate: string) => new Date(endDate) >= new Date()

  return (
    <div className="space-y-8">
      {/* ════════════════════════════════════════════════════════════
          HERO BANNER — Section 4C: Organic Landscape Approach
          Replaces flat orange fill with deep gradient + blurred accents
          ════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 to-slate-950 p-8 md:p-10">
        {/* Blurred accent drops */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
              Panel de Promociones
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Promociones
            </h1>
            <p className="text-base text-slate-400 mt-2 max-w-lg leading-relaxed">
              Crea ofertas irresistibles para atraer más clientes a tu negocio.
            </p>
          </div>

          <button
            onClick={() => { setEditingId(null); setForm(defaultForm); setIsModalOpen(true) }}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-base rounded-2xl transition-all duration-300 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 hover:-translate-y-0.5 whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            Nueva Promoción
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          METRIC CARDS — Section 4B: Bento Grid, asymmetric
          ════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total promotions */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="h-11 w-11 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <Tag className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span>
          </div>
          <p className="text-3xl font-black tracking-tight text-slate-900">{promotions.length}</p>
          <p className="text-sm text-slate-400 mt-1">Promociones creadas</p>
        </div>

        {/* Active promotions */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="h-11 w-11 bg-amber-50 rounded-2xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Activas</span>
          </div>
          <p className="text-3xl font-black tracking-tight text-slate-900">{activeCount}</p>
          <p className="text-sm text-slate-400 mt-1">Vigentes actualmente</p>
        </div>

        {/* Average discount */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="h-11 w-11 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Percent className="h-5 w-5 text-slate-700" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Promedio</span>
          </div>
          <p className="text-3xl font-black tracking-tight text-slate-900">{avgDiscount}%</p>
          <p className="text-sm text-slate-400 mt-1">Descuento promedio</p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          PROMOTIONS GRID — Section 4B: Bento cards, organic curves
          ════════════════════════════════════════════════════════════ */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
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
          {promotions.map((promo: any) => {
            const active = isPromoActive(promo.endDate)
            return (
              <div
                key={promo.id}
                className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                {/* Discount badge header */}
                <div className={`relative px-8 py-6 ${active ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' : 'bg-gradient-to-r from-slate-700 to-slate-800'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-black text-white tracking-tight">
                      {promo.discountPercentage ? `-${promo.discountPercentage}%` : 'Oferta'}
                    </span>
                    <div className="flex items-center gap-2">
                      {active && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full backdrop-blur-sm">
                          <Sparkles className="h-3 w-3" />
                          Activa
                        </span>
                      )}
                      <Tag className="h-8 w-8 text-white/30" />
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-8">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {promo.title}
                  </h3>
                  {promo.description && (
                    <p className="text-base text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {promo.description}
                    </p>
                  )}

                  {/* Date range */}
                  <div className="flex items-center gap-2 mt-4 text-sm text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatDate(promo.startDate)} — {formatDate(promo.endDate)}
                    </span>
                  </div>

                  {/* Actions — MD3 micro-border surface */}
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                    <button
                      onClick={() => handleEdit(promo)}
                      className="flex-1 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteId(promo.id)}
                      disabled={deletePromotion.isPending}
                      className="p-2.5 rounded-2xl hover:bg-red-50 text-slate-400 hover:text-red-600 disabled:opacity-50 transition-all duration-200"
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

      {/* ════════════════════════════════════════════════════════════
          CREATE / EDIT MODAL — Section 4B: MD3 form fields
          ════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingId(null) }}
        title={editingId ? 'Editar Promoción' : 'Nueva Promoción'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
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
          <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); setEditingId(null) }}
              className="px-6 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createPromotion.isPending || updatePromotion.isPending}
              className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-sm font-bold transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50"
            >
              {createPromotion.isPending || updatePromotion.isPending ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ════════════════════════════════════════════════════════════
          CONFIRM DIALOG
          ════════════════════════════════════════════════════════════ */}
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
