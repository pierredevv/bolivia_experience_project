import { useState } from 'react'
import { CheckCircle, XCircle, Search, Filter, Store, Loader2 } from 'lucide-react'
import { useAdminBusinesses, useApproveBusiness, useSuspendBusiness } from '../../hooks/useBusinesses'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AdminBusinesses() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null)
  const [confirmSuspendId, setConfirmSuspendId] = useState<string | null>(null)

  const { data: businesses, isLoading } = useAdminBusinesses(statusFilter === 'all' ? undefined : statusFilter)
  const approveMutation = useApproveBusiness()
  const suspendMutation = useSuspendBusiness()

  const handleApprove = async () => {
    if (!confirmApproveId) return
    try {
      await approveMutation.mutateAsync(confirmApproveId)
      toast.success('Empresa aprobada exitosamente')
      setConfirmApproveId(null)
    } catch (error) {
      toast.error('Error al aprobar la empresa')
    }
  }

  const handleSuspend = async () => {
    if (!confirmSuspendId) return
    try {
      await suspendMutation.mutateAsync(confirmSuspendId)
      toast.success('Empresa suspendida exitosamente')
      setConfirmSuspendId(null)
    } catch (error) {
      toast.error('Error al suspender la empresa')
    }
  }

  // ── Shared input/select class ──
  const inputCls = 'px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-medium transition-all'

  return (
    <div className="space-y-8 pb-12">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Gestión de Empresas</h1>
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">
          Aprobaciones y administración de negocios en la plataforma
        </p>
      </div>

      {/* ── Filters Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm p-5 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className={`${inputCls} w-full pl-11`}
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={inputCls}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobados</option>
            <option value="rejected">Suspendidos</option>
          </select>
        </div>
      </div>

      {/* ── Content Table Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Cargando empresas...</p>
          </div>
        ) : businesses?.length === 0 ? (
          <div className="p-16 text-center">
            <Store className="h-14 w-14 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">No hay empresas</h3>
            <p className="text-slate-400 dark:text-slate-500 mt-2 font-semibold text-sm">
              No se encontraron empresas con los filtros actuales.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/60 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  {['Negocio', 'Representante', 'Contacto', 'Estado', 'Registro', 'Acciones'].map((col, i) => (
                    <th
                      key={col}
                      className={`px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {businesses?.map((business: any) => (
                  <tr key={business.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0">
                          {business.businessName?.[0]?.toUpperCase() || 'E'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{business.businessName || 'Empresa Sin Nombre'}</p>
                          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                            {business.places?.[0]?.name || 'Sin lugar asignado'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{business.name}</p>
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">{business.email}</p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {business.businessPhone || 'No registrado'}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {business.approvalStatus === 'pending' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          Pendiente
                        </span>
                      )}
                      {business.approvalStatus === 'approved' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          Aprobado
                        </span>
                      )}
                      {business.approvalStatus === 'rejected' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400">
                          Suspendido
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-slate-400 dark:text-slate-500">
                      {format(new Date(business.createdAt), "d MMM, yyyy", { locale: es })}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        {business.approvalStatus !== 'approved' && (
                          <button
                            onClick={() => setConfirmApproveId(business.id)}
                            className="p-2.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-2xl transition-colors"
                            title="Aprobar"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        {business.approvalStatus !== 'rejected' && (
                          <button
                            onClick={() => setConfirmSuspendId(business.id)}
                            className="p-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-colors"
                            title="Suspender"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmApproveId}
        title="Aprobar Empresa"
        message="¿Estás seguro de que deseas aprobar esta empresa? Se le otorgará acceso al portal business y su negocio será visible en la aplicación."
        confirmLabel="Sí, aprobar"
        cancelLabel="Cancelar"
        onConfirm={handleApprove}
        onClose={() => setConfirmApproveId(null)}
        isLoading={approveMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!confirmSuspendId}
        title="Suspender Empresa"
        message="¿Estás seguro de que deseas suspender esta empresa? Perderá acceso al portal business y su negocio ya no será visible para los usuarios."
        confirmLabel="Sí, suspender"
        cancelLabel="Cancelar"
        onConfirm={handleSuspend}
        onClose={() => setConfirmSuspendId(null)}
        isLoading={suspendMutation.isPending}
        variant="danger"
      />
    </div>
  )
}
