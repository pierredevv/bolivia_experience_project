import { useState } from 'react'
<<<<<<< HEAD
import { Link } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react'
=======
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
>>>>>>> develop
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
<<<<<<< HEAD
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 selection:bg-emerald-500/20 antialiased">
      {/* 70% Minimalism: Expansive Return Navigation Link */}
      <div className="w-full max-w-lg">
        {/* 5% Organic Corner Radii & 15% MD3 Flat Micro-border Layout */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-900/5 p-10 lg:p-12 transition-all duration-300">

          {/* Header Branding with integrated local image asset padding fix */}
          <div className="text-center mb-10 flex flex-col items-center justify-center">
            <img
              src="/LogoBoliviaExperience.png"
              alt="BoliviaExperience Logo"
              className="h-36 md:h-44 object-contain transition-transform duration-300 hover:scale-[1.02] -mt-6 -mb-6"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <h1 className="hidden text-3xl font-black text-slate-900 tracking-tight">
              Bolivia<span className="text-emerald-600">Experience</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">
              Panel Administrativo Global
            </p>
=======
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Floating dark card */}
        <div className="bg-slate-900 rounded-[2rem] shadow-2xl p-8 border border-slate-700/50">
          <div className="text-center mb-8">
            <img
              src="/BoliviaExperience.png"
              alt="BoliviaExperience"
              className="h-16 md:h-20 w-auto object-contain mx-auto mb-4"
            />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/15 border border-emerald-600/25 text-emerald-400 text-xs font-bold mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Control Global
            </div>
            <h1 className="text-2xl font-bold text-white">Panel Administrativo</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Acceso restringido al equipo</p>
>>>>>>> develop
          </div>

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Error Handlers scaled to text-base */}
            {loginMutation.isError && (
<<<<<<< HEAD
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-base font-medium animate-fade-in">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
=======
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
>>>>>>> develop
                <span>
                  {(loginMutation.error as any)?.response?.data?.error?.message ||
                    'Credenciales de administrador inválidas.'}
                </span>
              </div>
            )}

            {/* Email Input Field */}
            <div>
<<<<<<< HEAD
              <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
                Correo Electrónico
=======
              <label className="block text-sm font-semibold text-slate-400 mb-1.5">
                Email
>>>>>>> develop
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
<<<<<<< HEAD
                className="w-full px-5 py-4 text-base font-medium rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
=======
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all text-sm"
>>>>>>> develop
                placeholder="admin@boliviaexperience.com"
                required
              />
            </div>

            {/* Password Input Field */}
            <div>
<<<<<<< HEAD
              <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
                Contraseña Secure Token
=======
              <label className="block text-sm font-semibold text-slate-400 mb-1.5">
                Contraseña
>>>>>>> develop
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
<<<<<<< HEAD
                  className="w-full px-5 py-4 text-base font-medium rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all pr-14"
=======
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all pr-12 text-sm"
>>>>>>> develop
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
<<<<<<< HEAD
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors px-1.5 py-1"
=======
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
>>>>>>> develop
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Corporate Actions Submit Control */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
<<<<<<< HEAD
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-base hover:bg-emerald-700 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
=======
              className="w-full py-3 mt-6 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
>>>>>>> develop
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Autenticando administrador global...
                </span>
              ) : (
                'Acceder al Panel de Control'
              )}
            </button>

          </form>
        </div>
<<<<<<< HEAD

        {/* Centralized back to landing below the card */}
        <div className="text-center mt-8 animate-fade-in">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group font-bold text-base"
          >
            <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
            <span>Volver a la página principal</span>
          </Link>
        </div>

=======
        <p className="text-center mt-6 text-xs text-slate-400">
          Solo personal autorizado
        </p>
>>>>>>> develop
      </div>
    </div>
  )
}