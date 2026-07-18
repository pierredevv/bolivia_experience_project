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
  // If it's already an emoji, return it
  if (icon.length > 2 && /[\u{1F300}-\u{1F9FF}]/u.test(icon)) return icon
  // Map known icon strings
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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Categorías</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Gestiona las categorías de lugares</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-700 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nueva Categoría
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        </div>
      ) : !categories || categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No hay categorías"
          description="Crea la primera categoría para organizar los lugares."
          action={{ label: 'Crear Categoría', onClick: openCreate }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat: any) => (
            <div key={cat.id} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{getCategoryIcon(cat.icon)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{cat.name}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{cat.nameEn} · {cat.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-primary-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-500 dark:text-neutral-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {cat.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">{cat.description}</p>
              )}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 text-xs text-neutral-500 dark:text-neutral-400">
                <span>Orden: {cat.displayOrder}</span>
                {cat._count?.places !== undefined && (
                  <span>· {cat._count.places} lugares</span>
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
            <Input
              label="Nombre (ES)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Nombre (EN)"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          />
          <Textarea
            label="Descripción (EN)"
            value={form.descriptionEn}
            onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
          />
          <Input
            label="Orden de visualización"
            type="number"
            value={form.displayOrder}
            onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); setEditingId(null) }}
              className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createCategory.isPending || updateCategory.isPending}
              className="px-4 py-2 rounded-lg bg-primary-700 text-white text-sm font-medium hover:bg-primary-800 disabled:opacity-50"
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
