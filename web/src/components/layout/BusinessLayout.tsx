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
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/business', icon: LayoutDashboard },
  { name: 'Mi Lugar', href: '/business/place', icon: MapPin },
  { name: 'Reseñas', href: '/business/reviews', icon: Star },
  { name: 'Promociones', href: '/business/promotions', icon: Tag },
  { name: 'Estadísticas', href: '/business/stats', icon: BarChart3 },
  { name: 'Fotos', href: '/business/photos', icon: Image },
]

// ─── Inner Sidebar ────────────────────────────────────────────────────────────
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
    <div className="flex flex-col h-full bg-slate-900 text-white selection:bg-emerald-500/20">

      {/* ── Brand Section: Calling Official Local Logo Asset with integrated padding patch ── */}
      <div className="flex flex-col items-start px-6 pt-6 pb-4 flex-shrink-0">
        <img
          src="/Logo.png"
          alt="BoliviaExperience Logo"
          className="h-32 w-auto object-contain transition-transform duration-300 hover:scale-[1.02] -mt-6 -mb-6 -ml-2"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        {/* Fallback layout if the asset route is temporarily unavailable */}
        <div className="hidden flex items-center gap-2">
          <p className="text-lg font-black text-white tracking-tight">
            Bolivia<span className="text-emerald-400">Experience</span>
          </p>
        </div>
      </div>

      {/* ── Section label ── */}
      <div className="px-6 pb-3 pt-4">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600">
          Navegación
        </p>
      </div>

      {/* ── Nav links (Upgraded text scaling and organic states) ── */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/business'}
            onClick={onLinkClick}
            className={({ isActive }) =>
              `group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all duration-300 ${isActive
                ? 'bg-emerald-500/10 text-emerald-400 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`h-5 w-5 flex-shrink-0 transition-colors duration-300 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-white'
                    }`}
                />
                <span className="flex-1 truncate">{item.name}</span>
                {isActive && (
                  <span className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0 shadow-lg shadow-emerald-400/50" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Divider ── */}
      <div className="mx-6 border-t border-slate-800" />

      {/* ── User card (logout lives in topbar dropdown only) ── */}
      <div className="px-4 py-5 flex-shrink-0">
        <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-base font-black text-emerald-400">{userInitial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Empresa'}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function BusinessLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/business/login')
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 antialiased">

      {/* ══ Mobile Sidebar Drawer ══ */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 shadow-2xl flex flex-col border-r border-slate-800">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-5 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all z-10"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent
            user={user}
            handleLogout={handleLogout}
            onLinkClick={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* ══ Desktop Sidebar (10% Fixed Design Architecture) ══ */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 bg-slate-900 border-r border-slate-800 shadow-xl shadow-slate-950/20">
          <SidebarContent user={user} handleLogout={handleLogout} />
        </div>
      </div>

      {/* ══ Main Content Window Canvas ══ */}
      <div className="lg:pl-72 flex flex-col min-h-screen">

        {/* ── Top Fixed Bar: 10% Cinematic Glassmorphic Blur Surface ── */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm shadow-slate-900/[0.02]">
          <div className="flex items-center justify-between px-6 py-4 gap-4 h-20">

            {/* Mobile layout drawer activator */}
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden lg:block flex-1" />

            {/* Topbar Controls Context Area */}
            <div className="flex items-center gap-3 ml-auto">

              {/* Light/Dark State Control */}
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                title={resolvedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              >
                {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Notification Center Trigger */}
              <button
                className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white relative transition-all duration-200"
                aria-label="Notificaciones"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              </button>

              <div className="h-7 w-px bg-slate-200/80 dark:bg-slate-700/60 mx-1" />

              {/* User Dropdown Action surface */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center shadow-md flex-shrink-0 border border-slate-800">
                    <span className="text-sm font-black text-white">{userInitial}</span>
                  </div>
                  <div className="hidden sm:block text-left min-w-0">
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none truncate max-w-[140px]">
                      {user?.name || 'Empresa'}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">{user?.role || 'Merchant'}</p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-300 flex-shrink-0 ${userMenuOpen ? 'rotate-180 text-slate-900' : ''
                      }`}
                  />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-950/10 dark:shadow-slate-950/40 border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-fade-in">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-black text-white">{userInitial}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate mt-0.5">{user?.email}</p>
                            <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full uppercase tracking-wide">
                              {user?.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => { handleLogout(); setUserMenuOpen(false) }}
                          className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-200"
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

        {/* ── Page Nested Workspace Canvas ── */}
        <main className="flex-1 p-6 lg:p-10">
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