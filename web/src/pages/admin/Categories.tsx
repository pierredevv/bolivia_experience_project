import { useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, FolderOpen } from 'lucide-react'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategories'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from 'sonner'

// Map icon strings to emoji
const iconMap: Record<string, string> = {
  restaurant: '🍽️',
  hotel: '🏨',
  nightlife: ' nightlife',
  coffee: '☕',
  landscape: '🏞️',
  park: '🌳',
  museum: '🏛️',
  shopping_bag: '🛍️',
  sports_soccer: '⚽',
  restaurant_menu: '🍴',
}

function getCategoryIcon(icon: string): string {
  if (!icon) return '📂'
  if (icon.length > 2 && /[\u{1F300}-\u{1F9FF}]/u.test(icon)) return icon
  return iconMap[icon] || '📂'
}

interface CategoryForm {
  name: string
  nameEn: string
  icon: string
  slug: string
  description: string
  descriptionEn: string
  displayOrder: number
}

const defaultForm: CategoryForm = {
  name: '',
  nameEn: '',
  icon: '',
  slug: '',
  description: '',
  descriptionEn: '',
  displayOrder: 0,
}

export default function AdminCategories() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CategoryForm>(defaultForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateCategory.mutateAsync({ id: editingId, data: form })
        toast.success('Categoría actualizada')
      } else {
        await createCategory.mutateAsync(form)
        toast.success('Categoría creada')
      }
      setIsModalOpen(false)
      setEditingId(null)
      setForm(defaultForm)
    } catch {
      toast.error('Error al guardar la categoría')
    }
  }

  const handleEdit = (cat: any) => {
    setEditingId(cat.id)
    setForm({
      name: cat.name || '',
      nameEn: cat.nameEn || '',
      icon: cat.icon || '',
      slug: cat.slug || '',
      description: cat.description || '',
      descriptionEn: cat.descriptionEn || '',
      displayOrder: cat.displayOrder || 0,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteCategory.mutateAsync(deleteId)
      toast.success('Categoría eliminada')
      setDeleteId(null)
    } catch {
      toast.error('Error al eliminar la categoría')
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(defaultForm)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-8 pb-12">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Categorías</h1>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">
            Gestiona las categorías de lugares
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm rounded-2xl hover:bg-emerald-700 dark:hover:bg-slate-100 transition-all duration-300 shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 whitespace-nowrap"
        >
          <Plus className="h-5 w-5" />
          Nueva Categoría
        </button>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        </div>
      ) : !categories || categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No hay categorías"
          description="Crea la primera categoría para organizar los lugares."
          action={{ label: 'Crear Categoría', onClick: openCreate }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat: any) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm hover:shadow-xl dark:hover:shadow-slate-950/40 transition-all duration-300 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">{getCategoryIcon(cat.icon)}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{cat.name}</h3>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 truncate">{cat.nameEn} · {cat.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-2 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-400 dark:text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="p-2 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-all"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {cat.description && (
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-4 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500">
                <span className="bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full">Orden: {cat.displayOrder}</span>
                {cat._count?.places !== undefined && (
                  <span className="bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full">{cat._count.places} lugares</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingId(null) }}
        title={editingId ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre (ES)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Nombre (EN)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Icono (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🍽️" />
            <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="restaurantes" />
          </div>
          <Textarea label="Descripción (ES)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Textarea label="Descripción (EN)" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
          <Input
            label="Orden de visualización"
            type="number"
            value={form.displayOrder}
            onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); setEditingId(null) }}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createCategory.isPending || updateCategory.isPending}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-slate-900/10"
            >
              {createCategory.isPending || updateCategory.isPending ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Categoría"
        message="¿Estás seguro de que deseas eliminar esta categoría? Los lugares asociados quedarán sin categoría."
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={deleteCategory.isPending}
      />
    </div>
  )
}
