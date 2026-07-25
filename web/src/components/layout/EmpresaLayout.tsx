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

export default function EmpresaLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/business/login')
  }

  return (
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
          <Outlet />
        </main>
      </div>
    </div>
  )
}
