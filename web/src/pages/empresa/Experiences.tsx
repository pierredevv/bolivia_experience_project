import { useState } from 'react'
import { Plus, Pencil, Trash2, Sparkles, Loader2, Star, ImagePlus, Eye, EyeOff, CalendarDays, Clock, X } from 'lucide-react'
import {
  useEmpresaProducts,
  useCreateEmpresaProduct,
  useUpdateEmpresaProduct,
  useDeleteEmpresaProduct,
  useUploadEmpresaProductPhoto,
  useEmpresaPlace,
  useEmpresaProductSlots,
  useCreateEmpresaProductSlot,
  useDeleteEmpresaProductSlot,
} from '../../hooks/useEmpresa'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import { toast } from 'sonner'

interface ExperienceForm {
  name: string
  description: string
  descriptionEn: string
  experienceCategory: string
  pricePerAdult: string
  price: string
  currency: string
  modalidadReserva: string
  duration: string
  minAge: string
  maxAge: string
  maxGroup: string
  guideLanguage: string
  mobileTicket: boolean
  advanceDays: string
  policies: string
  isActive: boolean
}

const defaultForm: ExperienceForm = {
  name: '',
  description: '',
  descriptionEn: '',
  experienceCategory: '',
  pricePerAdult: '',
  price: '',
  currency: 'BOB',
  modalidadReserva: 'solicitud',
  duration: '',
  minAge: '',
  maxAge: '',
  maxGroup: '',
  guideLanguage: 'es',
  mobileTicket: true,
  advanceDays: '',
  policies: '',
  isActive: true,
}

export default function EmpresaExperiences() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ExperienceForm>(defaultForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [slotsOpenId, setSlotsOpenId] = useState<string | null>(null)

  const { data: place } = useEmpresaPlace()
  const { data: products, isLoading } = useEmpresaProducts()
  const createProduct = useCreateEmpresaProduct()
  const updateProduct = useUpdateEmpresaProduct()
  const deleteProduct = useDeleteEmpresaProduct()
  const uploadPhoto = useUploadEmpresaProductPhoto()

  const experiences = (products || []).filter(
    (p: any) => p.type === 'experiencia' || p.type === 'actividad' || p.type === 'guia',
  )

  const openCreate = () => {
    setEditingId(null)
    setForm(defaultForm)
    setIsModalOpen(true)
  }

  const openEdit = (exp: any) => {
    let policies = ''
    try {
      const parsed = typeof exp.policiesJson === 'string' ? JSON.parse(exp.policiesJson || '[]') : []
      policies = Array.isArray(parsed) ? parsed.join('\n') : ''
    } catch {
      policies = ''
    }
    setEditingId(exp.id)
    setForm({
      name: exp.name || '',
      description: exp.description || '',
      descriptionEn: exp.descriptionEn || '',
      experienceCategory: exp.experienceCategory || '',
      pricePerAdult: exp.pricePerAdult ? String(exp.pricePerAdult) : '',
      price: exp.price ? String(exp.price) : '',
      currency: exp.currency || 'BOB',
      modalidadReserva: exp.modalidadReserva || 'solicitud',
      duration: exp.duration || '',
      minAge: exp.minAge != null ? String(exp.minAge) : '',
      maxAge: exp.maxAge != null ? String(exp.maxAge) : '',
      maxGroup: exp.maxGroup != null ? String(exp.maxGroup) : '',
      guideLanguage: exp.guideLanguage || 'es',
      mobileTicket: exp.mobileTicket !== false,
      advanceDays: exp.advanceDays != null ? String(exp.advanceDays) : '',
      policies,
      isActive: exp.isActive !== false,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!place) return

    const payload: any = {
      name: form.name,
      description: form.description || undefined,
      descriptionEn: form.descriptionEn || undefined,
      type: 'experiencia',
      placeId: place.id,
      experienceCategory: form.experienceCategory || undefined,
      pricePerAdult: form.pricePerAdult ? parseFloat(form.pricePerAdult) : undefined,
      price: form.price ? parseFloat(form.price) : 0,
      currency: form.currency,
      modalidadReserva: form.modalidadReserva,
      duration: form.duration || undefined,
      minAge: form.minAge ? parseInt(form.minAge, 10) : undefined,
      maxAge: form.maxAge ? parseInt(form.maxAge, 10) : undefined,
      maxGroup: form.maxGroup ? parseInt(form.maxGroup, 10) : undefined,
      guideLanguage: form.guideLanguage || undefined,
      mobileTicket: form.mobileTicket,
      advanceDays: form.advanceDays ? parseInt(form.advanceDays, 10) : undefined,
      policies: form.policies
        ? form.policies.split('\n').map((p) => p.trim()).filter(Boolean)
        : undefined,
      isActive: form.isActive,
    }

    try {
      if (editingId) {
        await updateProduct.mutateAsync({ id: editingId, data: payload })
        toast.success('Experiencia actualizada')
      } else {
        await createProduct.mutateAsync(payload)
        toast.success('Experiencia creada')
      }
      setIsModalOpen(false)
      setEditingId(null)
    } catch {
      toast.error('Error al guardar la experiencia')
    }
  }

  const handlePhoto = async (id: string, file: File) => {
    try {
      await uploadPhoto.mutateAsync({ id, file })
      toast.success('Foto actualizada')
    } catch {
      toast.error('Error al subir la foto')
    }
  }

  const toggleActive = async (exp: any) => {
    await updateProduct.mutateAsync({
      id: exp.id,
      data: { isActive: !exp.isActive },
    })
    toast.success(exp.isActive ? 'Experiencia ocultada' : 'Experiencia publicada')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow text-sm"

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Experiencias</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Crea experiencias destacadas que aparecen en el Home de la app</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-600/20"
        >
          <Plus className="h-4 w-4" />
          Nueva Experiencia
        </button>
      </div>

      {/* Empty state */}
      {experiences.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
            <Sparkles className="h-7 w-7 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Aún no tienes experiencias</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Crea tu primera experiencia para mostrarla en el Home de BoliviaExperience.
          </p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Crear experiencia
          </button>
        </div>
      )}

      {/* List */}
      {experiences.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {experiences.map((exp: any) => (
            <div key={exp.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              {/* Image */}
              <div className="relative h-40 bg-slate-100 dark:bg-slate-700">
                {exp.photoUrl ? (
                  <img src={exp.photoUrl} alt={exp.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-slate-300 dark:text-slate-500" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${exp.isActive !== false ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                    {exp.isActive !== false ? 'Activa' : 'Oculta'}
                  </span>
                </div>
                {exp.ratingCount > 0 && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-full">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-white">{exp.ratingAvg?.toFixed?.(1) ?? exp.ratingAvg} ({exp.ratingCount})</span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{exp.name}</h3>
                {exp.experienceCategory && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">{exp.experienceCategory}</p>
                )}
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 min-h-[2.5rem]">
                  {exp.description || 'Sin descripción'}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-600">
                    {exp.pricePerAdult ? `Bs ${exp.pricePerAdult} / persona` : exp.price ? `Bs ${exp.price}` : 'Consultar'}
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 pt-4">
                  <button
                    onClick={() => setSlotsOpenId(slotsOpenId === exp.id ? null : exp.id)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${slotsOpenId === exp.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    Disponibilidad
                  </button>
                  <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    <ImagePlus className="h-3.5 w-3.5" />
                    Foto
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handlePhoto(exp.id, file)
                    }} />
                  </label>
                  <button
                    onClick={() => toggleActive(exp)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    {exp.isActive !== false ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {exp.isActive !== false ? 'Ocultar' : 'Publicar'}
                  </button>
                  <button
                    onClick={() => openEdit(exp)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteId(exp.id)}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Availability panel */}
                {slotsOpenId === exp.id && (
                  <AvailabilityPanel productId={exp.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Experiencia' : 'Nueva Experiencia'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Nombre de la experiencia
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Tour Salar de Uyuni"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Categoría de experiencia
            </label>
            <Input
              value={form.experienceCategory}
              onChange={(e) => setForm({ ...form, experienceCategory: e.target.value })}
              placeholder="Ej. Aventura, Gastronomía, Tours de Noche"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Descripción
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Describe la experiencia..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Precio por adulto (Bs)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.pricePerAdult}
                onChange={(e) => setForm({ ...form, pricePerAdult: e.target.value })}
                placeholder="Ej. 250"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Modalidad de reserva
              </label>
              <select
                value={form.modalidadReserva}
                onChange={(e) => setForm({ ...form, modalidadReserva: e.target.value })}
                className={inputClass}
              >
                <option value="solicitud">Solicitud</option>
                <option value="instantanea">Instantánea</option>
                <option value="ninguna">Sin reserva</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Duración
              </label>
              <Input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="Ej. 4 horas"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Edad mínima
              </label>
              <Input
                type="number"
                min="0"
                value={form.minAge}
                onChange={(e) => setForm({ ...form, minAge: e.target.value })}
                placeholder="Ej. 5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Edad máxima
              </label>
              <Input
                type="number"
                min="0"
                value={form.maxAge}
                onChange={(e) => setForm({ ...form, maxAge: e.target.value })}
                placeholder="Ej. 70"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Grupo máximo (personas)
              </label>
              <Input
                type="number"
                min="1"
                value={form.maxGroup}
                onChange={(e) => setForm({ ...form, maxGroup: e.target.value })}
                placeholder="Ej. 15"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Antelación (días)
              </label>
              <Input
                type="number"
                min="0"
                value={form.advanceDays}
                onChange={(e) => setForm({ ...form, advanceDays: e.target.value })}
                placeholder="Ej. 23"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Idioma del guía
              </label>
              <select
                value={form.guideLanguage}
                onChange={(e) => setForm({ ...form, guideLanguage: e.target.value })}
                className={inputClass}
              >
                <option value="es">Español</option>
                <option value="en">Inglés</option>
                <option value="pt">Portugués</option>
                <option value="de">Alemán</option>
                <option value="fr">Francés</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer select-none pb-2.5">
                <input
                  type="checkbox"
                  checked={form.mobileTicket}
                  onChange={(e) => setForm({ ...form, mobileTicket: e.target.checked })}
                  className="h-4 w-4 accent-emerald-600"
                />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Entrada móvil
                </span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Políticas (una por línea)
            </label>
            <Textarea
              value={form.policies}
              onChange={(e) => setForm({ ...form, policies: e.target.value })}
              rows={3}
              placeholder={'Garantía de precio más bajo\nCancelación gratuita'}
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createProduct.isPending || updateProduct.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {(createProduct.isPending || updateProduct.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {editingId ? 'Guardar cambios' : 'Crear experiencia'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return
          try {
            await deleteProduct.mutateAsync(deleteId)
            toast.success('Experiencia eliminada')
          } catch {
            toast.error('Error al eliminar la experiencia')
          }
          setDeleteId(null)
        }}
        title="Eliminar experiencia"
        message="¿Seguro que deseas eliminar esta experiencia? Esta acción ocultará el producto."
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  )
}

function AvailabilityPanel({ productId }: { productId: string }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [capacity, setCapacity] = useState('10')

  const { data: slots, isLoading } = useEmpresaProductSlots(productId)
  const createSlot = useCreateEmpresaProductSlot()
  const deleteSlot = useDeleteEmpresaProductSlot()

  const today = new Date()
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const handleAdd = async () => {
    if (!date || !time) {
      toast.error('Seleccioná fecha y hora')
      return
    }
    try {
      await createSlot.mutateAsync({
        productId,
        data: { date, time, capacity: capacity ? parseInt(capacity, 10) : 10 },
      })
      toast.success('Fecha de disponibilidad agregada')
      setDate('')
      setTime('09:00')
      setCapacity('10')
    } catch {
      toast.error('Error al agregar la fecha')
    }
  }

  const handleDelete = async (slotId: string) => {
    try {
      await deleteSlot.mutateAsync({ productId, slotId })
      toast.success('Fecha eliminada')
    } catch {
      toast.error('Error al eliminar la fecha')
    }
  }

  return (
    <div className="mt-3 border-t border-slate-100 dark:border-slate-700 pt-4 space-y-3">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-emerald-600" />
        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
          Disponibilidad "Reserva tu lugar"
        </span>
      </div>

      {/* Add slot form */}
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Fecha</label>
          <input
            type="date"
            min={minDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Hora</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Cupo</label>
          <input
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleAdd}
            disabled={createSlot.isPending}
            className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {createSlot.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Agregar
          </button>
        </div>
      </div>

      {/* Slot list */}
      <div className="space-y-1.5">
        {isLoading && (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          </div>
        )}
        {!isLoading && (!slots || slots.length === 0) && (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-1">
            No hay fechas cargadas. Si no agregás fechas, la app mostrará fechas de ejemplo.
          </p>
        )}
        {(slots || []).map((slot: any) => (
          <div
            key={slot.id}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {slot.date}
              </span>
              <span className="text-xs font-bold text-emerald-600">{slot.time}</span>
              <span className="text-[10px] text-slate-400">cupo {slot.capacity}</span>
            </div>
            <button
              onClick={() => handleDelete(slot.id)}
              disabled={deleteSlot.isPending}
              className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
              title="Eliminar fecha"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
