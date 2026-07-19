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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Gestión de Empresas</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Administra los registros y aprobaciones de negocios en la plataforma.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobados</option>
            <option value="rejected">Suspendidos</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
          </div>
        ) : businesses?.length === 0 ? (
          <div className="p-12 text-center">
            <Store className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No hay empresas</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              No se encontraron empresas con los filtros actuales.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Negocio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Representante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {businesses?.map((business: any) => (
                  <tr key={business.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-lg flex items-center justify-center font-bold">
                          {business.businessName?.[0]?.toUpperCase() || 'E'}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                            {business.businessName || 'Empresa Sin Nombre'}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {business.places?.[0]?.name || 'Sin lugar asignado'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900 dark:text-neutral-100">{business.name}</div>
                      <div className="text-sm text-neutral-500">{business.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {business.businessPhone || 'No registrado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {business.approvalStatus === 'pending' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Pendiente
                        </span>
                      )}
                      {business.approvalStatus === 'approved' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Aprobado
                        </span>
                      )}
                      {business.approvalStatus === 'rejected' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          Suspendido
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {format(new Date(business.createdAt), "d MMM, yyyy", { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {business.approvalStatus !== 'approved' && (
                          <button
                            onClick={() => setConfirmApproveId(business.id)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Aprobar"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        {business.approvalStatus !== 'rejected' && (
                          <button
                            onClick={() => setConfirmSuspendId(business.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
