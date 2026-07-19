import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  roles?: string[]
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-700 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />
  }

  if (roles && !roles.includes(user.role)) {
    const redirectPath = user.role === 'admin' ? '/admin-panel' : '/business'
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}
