import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import BusinessLayout from './components/layout/BusinessLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Public Pages
const LandingPage = lazy(() => import('./pages/LandingPage'))

// Admin Pages
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))
const AdminPlaces = lazy(() => import('./pages/admin/Places'))
const AdminReviews = lazy(() => import('./pages/admin/Reviews'))
const AdminEvents = lazy(() => import('./pages/admin/Events'))
const AdminPromotions = lazy(() => import('./pages/admin/Promotions'))
const AdminCategories = lazy(() => import('./pages/admin/Categories'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))
const AdminBusinesses = lazy(() => import('./pages/admin/Businesses'))

// Business Pages
const BusinessLoginPage = lazy(() => import('./pages/business/BusinessLoginPage'))
const BusinessRegisterPage = lazy(() => import('./pages/business/BusinessRegisterPage'))
const EmpresaDashboard = lazy(() => import('./pages/empresa/Dashboard'))
const EmpresaPlace = lazy(() => import('./pages/empresa/Place'))
const EmpresaReviews = lazy(() => import('./pages/empresa/Reviews'))
const EmpresaPromotions = lazy(() => import('./pages/empresa/Promotions'))
const EmpresaStats = lazy(() => import('./pages/empresa/Stats'))
const EmpresaPhotos = lazy(() => import('./pages/empresa/Photos'))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

function App() {
  return (
    <SuspenseWrapper>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        {/* Business Auth Routes */}
        <Route path="/business/login" element={<BusinessLoginPage />} />
        <Route path="/business/register" element={<BusinessRegisterPage />} />

        {/* Admin Auth Route (Secret URL) */}
        <Route path="/admin-panel/login" element={<AdminLoginPage />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin-panel" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="businesses" element={<AdminBusinesses />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="places" element={<AdminPlaces />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Business Routes */}
        <Route element={<ProtectedRoute roles={['empresa']} />}>
          <Route path="/business" element={<BusinessLayout />}>
            <Route index element={<EmpresaDashboard />} />
            <Route path="place" element={<EmpresaPlace />} />
            <Route path="reviews" element={<EmpresaReviews />} />
            <Route path="promotions" element={<EmpresaPromotions />} />
            <Route path="stats" element={<EmpresaStats />} />
            <Route path="photos" element={<EmpresaPhotos />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SuspenseWrapper>
  )
}

export default App
