import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Eye, EyeOff, AlertCircle, ArrowLeft, Clock, Ban } from 'lucide-react'
import { useLogin } from '../../hooks/useAuth'

export default function BusinessLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLogin('empresa')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ email, password })
  }

  const getErrorMessage = () => {
    const msg = (loginMutation.error as any)?.response?.data?.error?.message || ''
    if (msg.includes('pendiente de aprobación')) return 'pending'
    if (msg.includes('desactivada')) return 'deactivated'
    return 'credentials'
  }

  const errorType = loginMutation.isError ? getErrorMessage() : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center p-4 transition-colors">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-secondary-700 dark:hover:text-secondary-400">
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm font-medium hidden sm:block">Volver a inicio</span>
      </Link>
      
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 border border-neutral-100 dark:border-neutral-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-secondary-700 rounded-2xl mb-4 shadow-lg shadow-secondary-700/20">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">BoliviaExperience</h1>
            <p className="text-secondary-700 dark:text-secondary-400 mt-1 font-medium">Business Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {errorType === 'pending' && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-sm">
                <Clock className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Tu cuenta está pendiente de aprobación</p>
                  <p className="mt-1 text-amber-700 dark:text-amber-400">Te notificaremos por correo electrónico cuando nuestro equipo valide tu registro. Esto generalmente toma 24-48 horas.</p>
                </div>
              </div>
            )}

            {errorType === 'deactivated' && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                <Ban className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Tu cuenta ha sido desactivada</p>
                  <p className="mt-1 text-red-600 dark:text-red-400">Contacta a nuestro equipo de soporte para más información.</p>
                </div>
              </div>
            )}

            {errorType === 'credentials' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>
                  {(loginMutation.error as any)?.response?.data?.error?.message ||
                    'Credenciales inválidas. Intenta de nuevo.'}
                </span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email de la empresa
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none transition-all"
                placeholder="contacto@minegocio.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none transition-all pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-neutral-300 dark:border-neutral-600 text-secondary-600 focus:ring-secondary-500" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Recordarme</span>
              </label>
              <button type="button" className="text-sm font-medium text-secondary-700 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-300">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 mt-4 bg-secondary-700 text-white rounded-xl font-semibold hover:bg-secondary-800 transition-colors shadow-lg shadow-secondary-700/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
            
            <p className="text-center mt-6 text-sm text-neutral-600 dark:text-neutral-400">
              ¿No tienes cuenta?{' '}
              <Link to="/business/register" className="font-medium text-secondary-700 dark:text-secondary-400 hover:underline">
                Registra tu negocio
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
