import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import EmpresaLayout from './components/layout/EmpresaLayout'
import LoginPage from './pages/LoginPage'

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

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
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
      <Route path="/empresa" element={<EmpresaLayout />}>
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
