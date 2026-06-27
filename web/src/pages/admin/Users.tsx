import { useState } from 'react'
import { Search, Plus, MoreVertical, Edit, Trash2, Eye, Ban } from 'lucide-react'

const users = [
  { id: '1', name: 'María García', email: 'maria@example.com', role: 'usuario', status: 'active', reviews: 12, date: '2026-01-15' },
  { id: '2', name: 'John Smith', email: 'john@example.com', role: 'usuario', status: 'active', reviews: 8, date: '2026-02-20' },
  { id: '3', name: 'Carlos Mendoza', email: 'carlos@restaurante.com', role: 'empresa', status: 'active', reviews: 0, date: '2026-03-10' },
  { id: '4', name: 'Ana Martínez', email: 'ana@example.com', role: 'usuario', status: 'inactive', reviews: 3, date: '2026-04-05' },
  { id: '5', name: 'Pedro López', email: 'pedro@hotel.com', role: 'empresa', status: 'active', reviews: 0, date: '2026-05-12' },
]

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Usuarios</h1>
          <p className="text-neutral-500 mt-1">Gestiona los usuarios de la plataforma</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="all">Todos los roles</option>
            <option value="usuario">Usuarios</option>
            <option value="empresa">Empresas</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">
                  Usuario
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">
                  Rol
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">
                  Estado
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">
                  Reseñas
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">
                  Registro
                </th>
                <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">{user.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'empresa' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900">
                    {user.reviews}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">
                    {user.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-500 hover:text-red-600">
                        <Ban className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <p className="text-sm text-neutral-500">
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-neutral-300 text-sm hover:bg-neutral-50">
              Anterior
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-primary-700 text-white text-sm">
              1
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-neutral-300 text-sm hover:bg-neutral-50">
              2
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-neutral-300 text-sm hover:bg-neutral-50">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
