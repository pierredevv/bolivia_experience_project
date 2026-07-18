import { useState } from 'react'
import { MapPin, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useLogin } from '../../hooks/useAuth'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLogin('admin')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ email, password })
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-neutral-800 rounded-2xl shadow-2xl p-8 border border-neutral-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-red-600 rounded-2xl mb-4">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">BoliviaExperience</h1>
            <p className="text-red-400 mt-1 font-medium">Panel Administrativo Global</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginMutation.isError && (
              <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-800 rounded-xl text-red-400 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>
                  {(loginMutation.error as any)?.response?.data?.error?.message ||
                    'Credenciales inválidas. Intenta de nuevo.'}
                </span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-600 bg-neutral-700 text-neutral-100 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                placeholder="admin@boliviaexperience.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-600 bg-neutral-700 text-neutral-100 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 mt-6 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                'Acceder al Panel'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
