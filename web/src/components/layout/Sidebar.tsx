import { NavLink } from 'react-router-dom'
import { LucideIcon, X, LogOut } from 'lucide-react'

export interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface SidebarProps {
  navigation: NavItem[]
  basePath: string
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
}

export default function Sidebar({ navigation, basePath, isOpen, onClose, onLogout }: SidebarProps) {
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
      isActive
        ? 'border-l-4 border-[#38A169] bg-emerald-500/10 text-emerald-400 font-medium'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-l-4 border-transparent'
    }`

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="fixed inset-y-0 left-0 w-64 bg-[#0F172A] border-r border-slate-800 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="w-full flex items-center justify-between p-4 border-b border-slate-800 relative">
              <img
                src="/LogoBoliviaExperience.png"
                className="h-12 w-auto object-contain block mx-auto"
                alt="Bolivia Experience"
              />
              <button
                onClick={onClose}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Cerrar menú lateral"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1.5" aria-label="Navegación móvil">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === basePath}
                  className={getLinkClass}
                  onClick={onClose}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full min-h-[44px] rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-[#0F172A] border-r border-slate-800 text-white">
          <div className="w-full flex items-center justify-center p-4 border-b border-slate-800">
            <img
              src="/LogoBoliviaExperience.png"
              className="h-14 w-auto object-contain block mx-auto"
              alt="Bolivia Experience"
            />
          </div>
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" aria-label="Navegación principal">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === basePath}
                className={getLinkClass}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full min-h-[44px] rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
