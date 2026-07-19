import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import {
  LayoutDashboard,
  MapPin,
  Star,
  Tag,
  BarChart3,
  Image,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/empresa', icon: LayoutDashboard },
  { name: 'Mi Lugar', href: '/empresa/place', icon: MapPin },
  { name: 'Reseñas', href: '/empresa/reviews', icon: Star },
  { name: 'Promociones', href: '/empresa/promotions', icon: Tag },
  { name: 'Estadísticas', href: '/empresa/stats', icon: BarChart3 },
  { name: 'Fotos', href: '/empresa/photos', icon: Image },
]

export default function EmpresaLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userInitial = user?.name?.[0]?.toUpperCase() || 'E'

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-neutral-800 shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
            <h1 className="text-xl font-bold text-secondary-700">Mi Negocio</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/empresa'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-secondary-50 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 p-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="h-8 w-8 bg-secondary-700 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-secondary-700">Mi Negocio</h1>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/empresa'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-secondary-50 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
        <div className="sticky top-0 z-40 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                title={resolvedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              >
                {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 relative text-neutral-500 dark:text-neutral-400">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <div className="h-8 w-8 bg-secondary-100 dark:bg-secondary-900/50 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-400">{userInitial}</span>
                  </div>
                  <span className="text-sm font-medium hidden sm:block text-neutral-700 dark:text-neutral-300">{user?.name || 'Empresa'}</span>
                  <ChevronDown className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 z-50">
                      <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user?.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-secondary-100 dark:bg-secondary-900/50 text-secondary-700 dark:text-secondary-400 rounded-full">
                          {user?.role}
                        </span>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => { handleLogout(); setUserMenuOpen(false) }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
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
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
