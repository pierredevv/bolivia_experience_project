import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import EmpresaLayout from './components/layout/EmpresaLayout'
import LoginPage from './pages/LoginPage'
import { useAuth } from './hooks/useAuth'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminPlaces from './pages/admin/Places'
import AdminReviews from './pages/admin/Reviews'
import AdminEvents from './pages/admin/Events'
import AdminPromotions from './pages/admin/Promotions'
import AdminCategories from './pages/admin/Categories'
import AdminSettings from './pages/admin/Settings'

// Empresa Pages
import EmpresaDashboard from './pages/empresa/Dashboard'
import EmpresaPlace from './pages/empresa/Place'
import EmpresaReviews from './pages/empresa/Reviews'
import EmpresaPromotions from './pages/empresa/Promotions'
import EmpresaStats from './pages/empresa/Stats'
import EmpresaPhotos from './pages/empresa/Photos'

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'admin' | 'empresa' }) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="places" element={<AdminPlaces />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Empresa Routes */}
      <Route
        path="/empresa"
        element={
          <ProtectedRoute requiredRole="empresa">
            <EmpresaLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmpresaDashboard />} />
        <Route path="place" element={<EmpresaPlace />} />
        <Route path="reviews" element={<EmpresaReviews />} />
        <Route path="promotions" element={<EmpresaPromotions />} />
        <Route path="stats" element={<EmpresaStats />} />
        <Route path="photos" element={<EmpresaPhotos />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
