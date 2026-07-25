import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'
import {
  LayoutDashboard,
  MapPin,
  Star,
  Tag,
  BarChart3,
  Image,
<<<<<<< HEAD
  Menu,
  X,
  LogOut,
  Bell,
  ChevronDown,
  Sun,
  Moon,
  Building2,
=======
>>>>>>> develop
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/business', icon: LayoutDashboard },
  { name: 'Mi Lugar', href: '/business/place', icon: MapPin },
  { name: 'Reseñas', href: '/business/reviews', icon: Star },
  { name: 'Promociones', href: '/business/promotions', icon: Tag },
  { name: 'Estadísticas', href: '/business/stats', icon: BarChart3 },
  { name: 'Fotos', href: '/business/photos', icon: Image },
]

function SidebarContent({
  user,
  handleLogout,
  onLinkClick,
}: {
  user: { name?: string; email?: string; role?: string } | null
  handleLogout: () => void
  onLinkClick?: () => void
}) {
  const userInitial = user?.name?.[0]?.toUpperCase() || 'E'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-7 flex-shrink-0">
        <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-black text-white leading-none tracking-tight">
            Mi<span className="text-emerald-400">Negocio</span>
          </p>
          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Portal Empresarial</p>
        </div>
      </div>

      <div className="px-6 pb-2">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">Navegación</p>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/empresa'}
            onClick={onLinkClick}
            className={({ isActive }) =>
              `group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-base font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`h-5 w-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-white'
                  }`}
                />
                <span className="flex-1 truncate">{item.name}</span>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mx-6 border-t border-slate-700/60" />

      <div className="px-3 py-4 space-y-1 flex-shrink-0">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/[0.06]">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-700/30 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-black text-emerald-300">{userInitial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Empresa'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-2xl text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}

export default function EmpresaLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/business/login')
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-slate-50 transition-colors">
      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 shadow-2xl flex flex-col">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-5 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all z-10"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent user={user} handleLogout={handleLogout} onLinkClick={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 bg-slate-900 border-r border-slate-700/50">
          <SidebarContent user={user} handleLogout={handleLogout} />
        </div>
      </div>

      {/* Main */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm shadow-slate-900/[0.04]">
          <div className="flex items-center justify-between px-6 py-4 gap-4">
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-all"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden lg:block flex-1" />
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all duration-200"
                title={resolvedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              >
                {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 relative transition-all duration-200">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button>
              <div className="h-7 w-px bg-slate-200 mx-1" />
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all duration-200"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-sm font-black text-white">{userInitial}</span>
                  </div>
                  <div className="hidden sm:block text-left min-w-0">
                    <p className="text-sm font-bold text-slate-800 leading-none truncate max-w-[120px]">{user?.name || 'Empresa'}</p>
                    <p className="text-xs text-slate-400 mt-0.5 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 z-50 overflow-hidden">
                      <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-black text-white">{userInitial}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-700 rounded-full uppercase tracking-wide">
                              {user?.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => { handleLogout(); setUserMenuOpen(false) }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
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
        </header>
        <main className="flex-1 p-6 lg:p-8">
=======
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 transition-colors">
      <Sidebar
        navigation={navigation}
        basePath="/business"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
>>>>>>> develop
          <Outlet />
        </main>
      </div>
    </div>
  )
}
