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
      admin: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',
      empresa: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
      usuario: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    }
    return styles[role as keyof typeof styles] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
  }

  const inputCls = 'px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-medium transition-all'

  return (
    <div className="space-y-8 pb-12">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Usuarios</h1>
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">
          Gestiona los usuarios de la plataforma
        </p>
      </div>

      {/* ── Filters Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className={`${inputCls} w-full pl-11`}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
            className={inputCls}
          >
            <option value="all">Todos los roles</option>
            <option value="usuario">Usuarios</option>
            <option value="empresa">Empresas</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No hay usuarios"
          description="No se encontraron usuarios con los filtros aplicados."
        />
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/60 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                    {['Usuario', 'Rol', 'Estado', 'Reseñas', 'Registro', 'Acciones'].map((col, i) => (
                      <th
                        key={col}
                        className={`text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-6 py-4 ${i === 5 ? 'text-right' : 'text-left'}`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-900 dark:bg-slate-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-black text-white uppercase">
                              {user.name?.[0] || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-black rounded-full ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-black rounded-full ${
                          user.isActive
                            ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                        }`}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{user._count?.reviews || 0}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-400 dark:text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString('es-BO')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { setEditingUser(user); setEditRole(user.role) }}
                          className="px-4 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-2xl transition-colors"
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
            <div className="mt-2">
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
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="h-10 w-10 bg-slate-900 dark:bg-slate-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-black text-white uppercase">{editingUser.name?.[0]}</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{editingUser.name}</p>
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">{editingUser.email}</p>
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
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setEditingUser(null)}
                className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={updateUser.isPending || editRole === editingUser.role}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20"
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
