import { useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, FolderOpen } from 'lucide-react'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategories'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from 'sonner'

// Map icon strings to clean emojis
const iconMap: Record<string, string> = {
  restaurant: '🍽️',
  hotel: '🏨',
  nightlife: '🎭',
  coffee: '☕',
  landscape: '🏞️',
  park: '🌳',
  museum: '🏛️',
  shopping_bag: '🛍️',
  sports_soccer: '⚽',
  restaurant_menu: '🍴',
  bar: '🍸',
}

function getCategoryIcon(icon: string): string {
  if (!icon) return '📂'
  const trimmed = icon.trim()
  // If it's already an emoji, return it
  if (trimmed.length > 0 && /[\u{1F300}-\u{1F9FF}]/u.test(trimmed)) return trimmed
  // Map known icon strings cleanly
  return iconMap[trimmed] || '📂'
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
        toast.success('Categoría actualizada exitosamente')
      } else {
        await createCategory.mutateAsync(form)
        toast.success('Categoría creada exitosamente')
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Categorías</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Gestiona las categorías principales de la plataforma
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#38A169] hover:bg-[#2F855A] text-white font-medium rounded-xl shadow-sm hover:shadow transition-all text-sm min-h-[44px]"
        >
          <Plus className="h-5 w-5" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#38A169]" />
        </div>
      ) : !categories || categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No hay categorías"
          description="Crea la primera categoría para organizar los lugares turísticos."
          action={{ label: 'Crear Categoría', onClick: openCreate }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat: any) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 bg-slate-100 dark:bg-slate-700/50 rounded-xl flex items-center justify-center flex-shrink-0 text-slate-700 dark:text-slate-300">
                      <span className="text-xl">{getCategoryIcon(cat.icon)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-base">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {cat.nameEn ? `${cat.nameEn} · ` : ''}
                        <span className="font-mono text-slate-400">{cat.slug}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-[#38A169] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Editar"
                      aria-label={`Editar categoría ${cat.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(cat.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 dark:text-slate-400 hover:text-red-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Eliminar"
                      aria-label={`Eliminar categoría ${cat.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {cat.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="bg-slate-100 dark:bg-slate-700/40 px-2.5 py-1 rounded-md">
                  Orden: {cat.displayOrder}
                </span>
                {cat._count?.places !== undefined && (
                  <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-md font-semibold">
                    {cat._count.places} lugares
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingId(null)
        }}
        title={editingId ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre (ES)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Ej. Restaurantes"
            />
            <Input
              label="Nombre (EN)"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              placeholder="Ej. Restaurants"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Icono (emoji)"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="🍽️"
            />
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
              placeholder="restaurantes"
            />
          </div>
          <Textarea
            label="Descripción (ES)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descripción clara de la categoría..."
          />
          <Textarea
            label="Descripción (EN)"
            value={form.descriptionEn}
            onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
            placeholder="English description..."
          />
          <Input
            label="Orden de visualización"
            type="number"
            value={form.displayOrder}
            onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                setEditingId(null)
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createCategory.isPending || updateCategory.isPending}
              className="px-5 py-2.5 rounded-xl bg-[#38A169] hover:bg-[#2F855A] text-white text-sm font-medium transition-colors disabled:opacity-50 min-h-[44px]"
            >
              {createCategory.isPending || updateCategory.isPending
                ? 'Guardando...'
                : editingId
                ? 'Actualizar'
                : 'Crear'}
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
