import { useState } from 'react'
import { Menu, Sun, Moon, Bell, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

interface HeaderProps {
  onOpenSidebar: () => void
  onLogout: () => void
}

export default function Header({ onOpenSidebar, onLogout }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()

  const userInitial = user?.name?.[0]?.toUpperCase() || 'A'

  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          className="lg:hidden p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
          onClick={onOpenSidebar}
          aria-label="Abrir menú de navegación"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3 ml-auto">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
            title={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {resolvedTheme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Notifications */}
          <button
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 relative text-slate-500 dark:text-slate-400 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-emerald-500 rounded-full" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] transition-colors"
              aria-expanded={userMenuOpen}
              aria-label="Menú de usuario"
            >
              <div className="h-8 w-8 bg-[#38A169] rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-white">{userInitial}</span>
              </div>
              <span className="text-sm font-medium hidden sm:block text-slate-700 dark:text-slate-200">
                {user?.name || 'Usuario'}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                      {user?.role}
                    </span>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        onLogout()
                        setUserMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors min-h-[44px]"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
