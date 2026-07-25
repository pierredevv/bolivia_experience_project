import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'
import {
  LayoutDashboard,
  Users,
  MapPin,
  Star,
  Calendar,
  Tag,
  FolderOpen,
  Settings,
  Store,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin-panel', icon: LayoutDashboard },
  { name: 'Empresas', href: '/admin-panel/businesses', icon: Store },
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
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/admin-panel/login')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 transition-colors">
      <Sidebar
        navigation={navigation}
        basePath="/admin-panel"
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
          <Outlet />
        </main>
      </div>
    </div>
  )
}
