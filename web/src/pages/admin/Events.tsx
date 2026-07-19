import { useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, Calendar } from 'lucide-react'
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '../../hooks/useEvents'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from 'sonner'

interface EventForm {
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  dateStart: string
  dateEnd: string
  location: string
  latitude: string
  longitude: string
  photoUrl: string
  category: string
}

const defaultForm: EventForm = {
  name: '',
  nameEn: '',
  description: '',
  descriptionEn: '',
  dateStart: '',
  dateEnd: '',
  location: '',
  latitude: '',
  longitude: '',
  photoUrl: '',
  category: '',
}

export default function AdminEvents() {
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EventForm>(defaultForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useEvents({ page, limit: 10 })
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()

  const events = data?.data || []
  const meta = data?.meta

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = {
      name: form.name,
      nameEn: form.nameEn || undefined,
      description: form.description || undefined,
      descriptionEn: form.descriptionEn || undefined,
      dateStart: new Date(form.dateStart).toISOString(),
      dateEnd: form.dateEnd ? new Date(form.dateEnd).toISOString() : undefined,
      location: form.location || undefined,
      latitude: form.latitude ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      photoUrl: form.photoUrl || undefined,
      category: form.category || undefined,
    }

    try {
      if (editingId) {
        await updateEvent.mutateAsync({ id: editingId, data: payload })
        toast.success('Evento actualizado')
      } else {
        await createEvent.mutateAsync(payload)
        toast.success('Evento creado')
      }
      setIsModalOpen(false)
      setEditingId(null)
      setForm(defaultForm)
    } catch {
      toast.error('Error al guardar el evento')
    }
  }

  const handleEdit = (event: any) => {
    setEditingId(event.id)
    setForm({
      name: event.name || '',
      nameEn: event.nameEn || '',
      description: event.description || '',
      descriptionEn: event.descriptionEn || '',
      dateStart: event.dateStart ? new Date(event.dateStart).toISOString().slice(0, 16) : '',
      dateEnd: event.dateEnd ? new Date(event.dateEnd).toISOString().slice(0, 16) : '',
      location: event.location || '',
      latitude: event.latitude?.toString() || '',
      longitude: event.longitude?.toString() || '',
      photoUrl: event.photoUrl || '',
      category: event.category || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteEvent.mutateAsync(deleteId)
      toast.success('Evento eliminado')
      setDeleteId(null)
    } catch {
      toast.error('Error al eliminar el evento')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Eventos</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Gestiona los eventos turísticos</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm(defaultForm); setIsModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-700 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nuevo Evento
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No hay eventos"
          description="Crea el primer evento turístico."
          action={{ label: 'Crear Evento', onClick: () => { setEditingId(null); setForm(defaultForm); setIsModalOpen(true) } }}
        />
      ) : (
        <>
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-700/50 border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Evento</th>
                    <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Fecha</th>
                    <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Ubicación</th>
                    <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Categoría</th>
                    <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Estado</th>
                    <th className="text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event: any) => (
                    <tr key={event.id} className="border-b border-neutral-200 dark:border-neutral-700 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">{event.name}</p>
                          {event.nameEn && <p className="text-xs text-neutral-500 dark:text-neutral-400">{event.nameEn}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                        {formatDate(event.dateStart)}
                        {event.dateEnd && <span className="text-neutral-400 dark:text-neutral-500"> - {formatDate(event.dateEnd)}</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 max-w-[200px] truncate">{event.location || '-'}</td>
                      <td className="px-6 py-4">
                        {event.category && (
                          <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs rounded-full">{event.category}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${event.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                          {event.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(event)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-primary-700">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteId(event.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-500 dark:text-neutral-400 hover:text-red-600">
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
        title={editingId ? 'Editar Evento' : 'Nuevo Evento'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre (ES)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Nombre (EN)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
          </div>
          <Textarea label="Descripción (ES)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Textarea label="Descripción (EN)" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha inicio" type="datetime-local" value={form.dateStart} onChange={(e) => setForm({ ...form, dateStart: e.target.value })} required />
            <Input label="Fecha fin" type="datetime-local" value={form.dateEnd} onChange={(e) => setForm({ ...form, dateEnd: e.target.value })} />
          </div>
          <Input label="Ubicación" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Av. principal, Santa Cruz" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Latitud" type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-17.7833" />
            <Input label="Longitud" type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="-63.1821" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Música, Gastronomía..." />
            <Input label="URL Foto" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null) }} className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
              Cancelar
            </button>
            <button type="submit" disabled={createEvent.isPending || updateEvent.isPending} className="px-4 py-2 rounded-lg bg-primary-700 text-white text-sm font-medium hover:bg-primary-800 disabled:opacity-50">
              {createEvent.isPending || updateEvent.isPending ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Evento"
        message="¿Estás seguro de que deseas eliminar este evento?"
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={deleteEvent.isPending}
      />
    </div>
  )
}
