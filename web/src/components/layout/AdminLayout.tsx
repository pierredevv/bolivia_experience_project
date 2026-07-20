import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import {
  LayoutDashboard,
  Users,
  MapPin,
  Star,
  Calendar,
  Tag,
  FolderOpen,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin-panel', icon: LayoutDashboard },
  { name: 'Empresas', href: '/admin-panel/businesses', icon: MapPin },
  { name: 'Usuarios', href: '/admin-panel/users', icon: Users },
  { name: 'Lugares', href: '/admin-panel/places', icon: MapPin },
  { name: 'Reseñas', href: '/admin-panel/reviews', icon: Star },
  { name: 'Eventos', href: '/admin-panel/events', icon: Calendar },
  { name: 'Promociones', href: '/admin-panel/promotions', icon: Tag },
  { name: 'Categorías', href: '/admin-panel/categories', icon: FolderOpen },
  { name: 'Configuración', href: '/admin-panel/settings', icon: Settings },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()

  const handleLogout = () => {
    logout()
    navigate('/admin-panel/login')
  }

  const userInitial = user?.name?.[0]?.toUpperCase() || 'A'

  const sidebarLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'border-l-4 border-emerald-500 bg-slate-800/50 text-white font-bold'
        : 'text-slate-400 hover:text-white hover:bg-slate-900/50 border-l-4 border-transparent'
    }`

  const mobileSidebarLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'border-l-4 border-emerald-500 bg-slate-800/50 text-white font-bold'
        : 'text-slate-400 hover:text-white hover:bg-slate-900/50 border-l-4 border-transparent'
    }`

  return (
    <div className="min-h-screen bg-white transition-colors">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 shadow-xl">
          <div className="w-full flex justify-center items-center py-6 px-2 border-b border-slate-800 relative">
            <img src="/LogoBoliviaExperience.png" className="h-16 w-auto object-contain block mx-auto" alt="Logo" />
            <button onClick={() => setSidebarOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-5 w-5 text-slate-500 hover:text-white transition-colors" />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/admin-panel'}
                className={mobileSidebarLinkClass}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-900/50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-slate-900 border-r border-slate-800 text-white">
          <div className="w-full flex justify-center items-center py-6 px-2 border-b border-slate-800">
            <img src="/LogoBoliviaExperience.png" className="h-16 w-auto object-contain block mx-auto" alt="Logo" />
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/admin-panel'}
                className={sidebarLinkClass}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-900/50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                title={resolvedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              >
                {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="p-2 rounded-xl hover:bg-slate-100 relative text-slate-400 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{userInitial}</span>
                  </div>
                  <span className="text-sm font-medium hidden sm:block text-slate-700">{user?.name || 'Admin'}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
                      <div className="p-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold bg-emerald-600/10 text-emerald-600 rounded-full">
                          {user?.role}
                        </span>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => { handleLogout(); setUserMenuOpen(false) }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 bg-white min-h-[calc(100vh-52px)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
