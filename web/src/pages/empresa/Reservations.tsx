import { useState } from 'react'
import {
  CalendarCheck2, Check, X, CheckCircle2, UserX, Loader2,
  Clock, Users, MessageSquare, Phone, Wallet, ArrowRight
} from 'lucide-react'
import {
  useSocioReservations,
  useConfirmReservation,
  useRejectReservation,
  useCompleteReservation,
  useNoShowReservation,
} from '../../hooks/useReservations'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const STATUS_TABS = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas' },
  { value: 'expirada', label: 'Expiradas' },
  { value: 'no_show', label: 'No asistieron' },
]

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  confirmed: { label: 'Confirmada', className: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
  rejected: { label: 'Rechazada', className: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' },
  cancelled: { label: 'Cancelada', className: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
  completed: { label: 'Completada', className: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400' },
  expirada: { label: 'Expirada', className: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
  no_show: { label: 'No asistió', className: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
}

const MODALIDAD_LABEL: Record<string, string> = {
  instantanea: 'Instantánea',
  solicitud: 'Solicitud',
}

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente de pago',
  held: 'Pagado (retenido)',
  released: 'Liberado',
  refunded: 'Reembolsado',
  cancelled: 'Cancelado',
}

const formatCurrency = (amount: number | null | undefined, currency = 'BOB') =>
  new Intl.NumberFormat('es-BO', { style: 'currency', currency }).format(amount ?? 0)

type ConfirmAction =
  | { kind: 'confirm'; id: string; name: string }
  | { kind: 'reject'; id: string; name: string }
  | { kind: 'complete'; id: string; name: string }
  | { kind: 'no-show'; id: string; name: string }
  | null

export default function EmpresaReservations() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)

  const { data: reservations, isLoading, error } = useSocioReservations(
    statusFilter === 'all' ? undefined : statusFilter
  )
  const confirmMutation = useConfirmReservation()
  const rejectMutation = useRejectReservation()
  const completeMutation = useCompleteReservation()
  const noShowMutation = useNoShowReservation()

  const isMutating = [
    confirmMutation.isPending,
    rejectMutation.isPending,
    completeMutation.isPending,
    noShowMutation.isPending,
  ].some(Boolean)

  const handleConfirm = async () => {
    if (!confirmAction) return
    try {
      await confirmMutation.mutateAsync(confirmAction.id)
      toast.success('Reserva confirmada. Se generó el QR de pago para el cliente.')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error al confirmar la reserva')
    } finally {
      setConfirmAction(null)
    }
  }

  const handleReject = async () => {
    if (!confirmAction) return
    try {
      await rejectMutation.mutateAsync(confirmAction.id)
      toast.success('Solicitud rechazada')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error al rechazar la solicitud')
    } finally {
      setConfirmAction(null)
    }
  }

  const handleComplete = async () => {
    if (!confirmAction) return
    try {
      await completeMutation.mutateAsync(confirmAction.id)
      toast.success('Visita completada. El pago fue liberado.')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error al completar la reserva')
    } finally {
      setConfirmAction(null)
    }
  }

  const handleNoShow = async () => {
    if (!confirmAction) return
    try {
      await noShowMutation.mutateAsync(confirmAction.id)
      toast.success('Reserva marcada como no asistida')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error al marcar no-show')
    } finally {
      setConfirmAction(null)
    }
  }

  const dialogConfig = (() => {
    if (!confirmAction) return null
    const base = {
      isOpen: true,
      onClose: () => setConfirmAction(null),
      isLoading: isMutating,
    }
    switch (confirmAction.kind) {
      case 'confirm':
        return {
          ...base,
          onConfirm: handleConfirm,
          title: 'Confirmar reserva',
          message: `¿Confirmar la solicitud de ${confirmAction.name}? El cliente recibirá un QR para pagar.`,
          confirmLabel: 'Confirmar',
          variant: 'warning' as const,
        }
      case 'reject':
        return {
          ...base,
          onConfirm: handleReject,
          title: 'Rechazar solicitud',
          message: `¿Rechazar la solicitud de ${confirmAction.name}? Se notificará al cliente.`,
          confirmLabel: 'Rechazar',
        }
      case 'complete':
        return {
          ...base,
          onConfirm: handleComplete,
          title: 'Completar reserva',
          message: `¿Marcar la reserva de ${confirmAction.name} como completada? Se liberará el pago (escrow).`,
          confirmLabel: 'Completar',
        }
      case 'no-show':
        return {
          ...base,
          onConfirm: handleNoShow,
          title: 'Marcar no asistencia',
          message: `¿Marcar a ${confirmAction.name} como no asistido? Se liquidará el pago al socio.`,
          confirmLabel: 'No asistió',
        }
    }
  })()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Reservas</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Gestiona las solicitudes y reservas de tus servicios
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-slate-900 dark:bg-slate-700 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="h-16 w-16 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarCheck2 className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-semibold">Error al cargar reservas</p>
            <p className="text-sm text-slate-400 mt-1">Intenta recargar la página</p>
          </div>
        </div>
      ) : !reservations || reservations.length === 0 ? (
        /* ── Premium Empty State ── */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-20 w-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-5">
            <CalendarCheck2 className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No hay reservas</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 max-w-xs">
            Cuando los clientes reserven tus servicios, aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation: any) => {
            const badge = STATUS_BADGE[reservation.status] || STATUS_BADGE.pending
            const payment = reservation.payments?.[0]
            return (
              <div
                key={reservation.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-300 p-5 md:p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{reservation.product?.name}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.className}`}>
                        {badge.label}
                      </span>
                      <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">
                        {MODALIDAD_LABEL[reservation.modalidad] || reservation.modalidad}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                      {format(new Date(reservation.date), "EEEE d 'de' MMMM, yyyy", { locale: es })} · {reservation.time} hs
                    </p>

                    {/* Detail chips */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
                      <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <Users className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        {reservation.partySize} persona(s)
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        Solicitada por {reservation.user?.name}
                      </span>
                      {reservation.contactPhone && (
                        <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                          <Phone className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                          {reservation.contactPhone}
                        </span>
                      )}
                      {payment && (
                        <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                          <Wallet className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                          {formatCurrency(payment.amount, payment.currency)} ·{' '}
                          <span className="text-slate-400 dark:text-slate-500">
                            {PAYMENT_STATUS_LABEL[payment.status] || payment.status}
                          </span>
                        </span>
                      )}
                    </div>

                    {reservation.notes && (
                      <div className="flex items-start gap-1.5 mt-3">
                        <MessageSquare className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">{reservation.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
                    {reservation.status === 'pending' && reservation.modalidad === 'solicitud' && (
                      <>
                        <button
                          onClick={() => setConfirmAction({ kind: 'confirm', id: reservation.id, name: reservation.user?.name })}
                          disabled={isMutating}
                          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                          <Check className="h-4 w-4" /> Confirmar
                        </button>
                        <button
                          onClick={() => setConfirmAction({ kind: 'reject', id: reservation.id, name: reservation.user?.name })}
                          disabled={isMutating}
                          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/50 disabled:opacity-50 transition-colors"
                        >
                          <X className="h-4 w-4" /> Rechazar
                        </button>
                      </>
                    )}

                    {reservation.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => setConfirmAction({ kind: 'complete', id: reservation.id, name: reservation.user?.name })}
                          disabled={isMutating}
                          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 transition-colors"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Completar
                        </button>
                        <button
                          onClick={() => setConfirmAction({ kind: 'no-show', id: reservation.id, name: reservation.user?.name })}
                          disabled={isMutating}
                          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 disabled:opacity-50 transition-colors"
                        >
                          <UserX className="h-4 w-4" /> No asistió
                        </button>
                      </>
                    )}

                    {['rejected', 'cancelled', 'expirada', 'no_show', 'completed'].includes(reservation.status) && (
                      <span className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                        Sin acciones <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    )}

                    {reservation.status === 'pending' && reservation.modalidad !== 'solicitud' && (
                      <span className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-500 dark:text-amber-400">
                        <Clock className="h-3.5 w-3.5" /> Esperando pago
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {dialogConfig && <ConfirmDialog {...dialogConfig} />}
    </div>
  )
}
