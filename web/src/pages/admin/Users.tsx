import { useState } from 'react'
import { Search, Loader2, Users as UsersIcon } from 'lucide-react'
import { useUsers, useUpdateUser } from '../../hooks/useUsers'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from 'sonner'

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editRole, setEditRole] = useState('')

  const { data, isLoading } = useUsers({
    page,
    limit: 10,
    search: search || undefined,
    role: roleFilter === 'all' ? undefined : roleFilter,
  })
  const updateUser = useUpdateUser()

  const users = data?.data || []
  const meta = data?.meta

  const handleUpdateRole = async () => {
    if (!editingUser) return
    try {
      await updateUser.mutateAsync({ id: editingUser.id, data: { role: editRole } })
      toast.success('Rol actualizado')
      setEditingUser(null)
    } catch {
      toast.error('Error al actualizar el rol')
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-700',
      empresa: 'bg-blue-100 text-blue-700',
      usuario: 'bg-green-100 text-green-700',
    }
    return styles[role as keyof typeof styles] || 'bg-neutral-100 text-neutral-700'
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Usuarios</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Gestiona los usuarios de la plataforma</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 dark:text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
            className="px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="all">Todos los roles</option>
            <option value="usuario">Usuarios</option>
            <option value="empresa">Empresas</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No hay usuarios"
          description="No se encontraron usuarios con los filtros aplicados."
        />
      ) : (
        <>
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-700/50 border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Usuario</th>
                    <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Rol</th>
                    <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Estado</th>
                    <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Reseñas</th>
                    <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Registro</th>
                    <th className="text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id} className="border-b border-neutral-200 dark:border-neutral-700 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
                              {user.name?.[0] || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user.name}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${user.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">{user._count?.reviews || 0}</td>
                      <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                        {new Date(user.createdAt).toLocaleDateString('es-BO')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => { setEditingUser(user); setEditRole(user.role) }}
                          className="px-3 py-1.5 text-sm font-medium text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        >
                          Editar rol
                        </button>
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

      {/* Edit Role Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Editar Rol de Usuario"
        size="sm"
      >
        {editingUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
              <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-400">{editingUser.name?.[0]}</span>
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">{editingUser.name}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{editingUser.email}</p>
              </div>
            </div>
            <Select
              label="Nuevo rol"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              options={[
                { value: 'usuario', label: 'Usuario' },
                { value: 'empresa', label: 'Empresa' },
                { value: 'admin', label: 'Administrador' },
              ]}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                Cancelar
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={updateUser.isPending || editRole === editingUser.role}
                className="px-4 py-2 rounded-lg bg-primary-700 text-white text-sm font-medium hover:bg-primary-800 disabled:opacity-50"
              >
                {updateUser.isPending ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
