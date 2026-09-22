import { useState } from 'react'
import { Loader2, MessageSquare, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import {
  useAdminSupportTickets,
  useAdminSupportTicket,
  useUpdateSupportStatus,
  useAddSupportMessage,
} from '../../hooks/useSupport'

const STATUS_LABELS: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En revisión',
  resolved: 'Resuelto',
  closed: 'Cerrado',
}

const TYPE_LABELS: Record<string, string> = {
  reservation: 'Reserva',
  payment: 'Pago',
  tours: 'Tours',
  bill: 'Facturación',
  opinion: 'Opinión',
  other: 'Otro',
}

export default function AdminSupport() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading, error } = useAdminSupportTickets({
    page,
    limit: 20,
    status: statusFilter || undefined,
  })
  const tickets = data?.data || []
  const meta = data?.meta

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Soporte y conflictos
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Gestiona los tickets de soporte de los usuarios
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {[
          { value: '', label: 'Todos' },
          { value: 'open', label: 'Abiertos' },
          { value: 'in_progress', label: 'En revisión' },
          { value: 'resolved', label: 'Resueltos' },
          { value: 'closed', label: 'Cerrados' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === f.value
                ? 'bg-primary-700 text-white'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-600">Error al cargar tickets de soporte</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
              No se encontraron tickets
            </div>
          ) : (
            tickets.map((ticket: any) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedId(ticket.id)}
                className="w-full text-left bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-5 w-5 text-primary-700 dark:text-primary-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {ticket.subject}
                        </p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          ticket.status === 'resolved' || ticket.status === 'closed'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : ticket.status === 'in_progress'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {STATUS_LABELS[ticket.status] || ticket.status}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                          {TYPE_LABELS[ticket.type] || ticket.type}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {ticket.user?.name || 'Usuario'} •{' '}
                        {new Date(ticket.createdAt).toLocaleDateString('es-BO')} •{' '}
                        {ticket._count?.messages ?? 0} mensaje(s)
                      </p>
                      <p className="text-neutral-700 dark:text-neutral-300 mt-2 line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Página {meta.page} de {meta.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedId && (
        <SupportTicketModal
          ticketId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}

function SupportTicketModal({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const { data: ticket, isLoading } = useAdminSupportTicket(ticketId)
  const updateStatus = useUpdateSupportStatus()
  const addMessage = useAddSupportMessage()
  const [reply, setReply] = useState('')
  const [newStatus, setNewStatus] = useState<string>('open')

  const handleStatusChange = () => {
    if (newStatus && newStatus !== ticket?.status) {
      updateStatus.mutate({ id: ticketId, status: newStatus })
    }
  }

  const handleReply = () => {
    if (!reply.trim()) return
    addMessage.mutate({ id: ticketId, body: reply.trim() }, {
      onSuccess: () => setReply(''),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Ticket de soporte
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {isLoading ? 'Cargando...' : ticket?.subject}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 min-w-[40px] min-h-[40px]"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
          </div>
        ) : ticket ? (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  ticket.status === 'resolved' || ticket.status === 'closed'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : ticket.status === 'in_progress'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {STATUS_LABELS[ticket.status] || ticket.status}
                </span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {ticket.user?.name} ({ticket.user?.email})
                </span>
              </div>

              <p className="text-neutral-700 dark:text-neutral-300">
                {ticket.description}
              </p>

              {ticket.reservation && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Reserva: {ticket.reservation.id} • {ticket.reservation.status}
                </p>
              )}

              <div className="space-y-3 pt-2">
                {(ticket.messages || []).map((msg: any) => (
                  <div
                    key={msg.id}
                    className="bg-neutral-50 dark:bg-neutral-700/40 rounded-xl p-4"
                  >
                    <p className="text-neutral-800 dark:text-neutral-200 text-sm">{msg.body}</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Autor: {msg.authorId} •{' '}
                      {new Date(msg.createdAt).toLocaleString('es-BO')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Status changer */}
              <div className="flex items-center gap-2 pt-2">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 p-2.5 text-sm text-neutral-700 dark:text-neutral-300"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <button
                  onClick={handleStatusChange}
                  disabled={updateStatus.isPending || newStatus === ticket.status}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-700 text-white text-sm hover:bg-primary-800 disabled:opacity-50 transition-colors min-h-[44px]"
                >
                  {ticket.status === 'resolved'
                    ? <CheckCircle2 className="h-4 w-4" />
                    : <Clock className="h-4 w-4" />}
                  Actualizar estado
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={2}
                placeholder="Responder al usuario..."
                className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 p-2.5 text-sm resize-none"
              />
              <button
                onClick={handleReply}
                disabled={addMessage.isPending || !reply.trim()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50 transition-colors min-h-[44px]"
              >
                {addMessage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Enviar
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        )}
      </div>
    </div>
  )
}