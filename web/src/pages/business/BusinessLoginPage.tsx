import { useState } from 'react'
import { Link } from 'react-router-dom'
<<<<<<< HEAD
import { Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react'
=======
import { Eye, EyeOff, AlertCircle, ArrowLeft, Clock, Ban } from 'lucide-react'
>>>>>>> develop
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
<<<<<<< HEAD
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 selection:bg-emerald-500/20 antialiased">

      <div className="w-full max-w-lg">
        {/* 5% Organic Corner Radii & 15% MD3 Flat Micro-border Layout */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-900/5 p-10 lg:p-12 transition-all duration-300">

          {/* Header Branding: Replaced by your official local logo asset */}
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
            {/* Fallback code in case image fails */}
            <h1 className="hidden text-3xl font-black text-slate-900 tracking-tight">
              Bolivia<span className="text-emerald-600">Experience</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">
              Portal de Negocios
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Error Handlers scaled to text-base */}
            {loginMutation.isError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-base font-medium animate-fade-in">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
=======
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm font-medium hidden sm:block">Volver a inicio</span>
      </Link>

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
              Acceso Corporativo
            </div>
            <h1 className="text-2xl font-bold text-white">Portal de Negocio</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Gestiona tu presencia en Bolivia</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {errorType === 'pending' && (
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-400 text-sm">
                <Clock className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-300">Tu cuenta está pendiente de aprobación</p>
                  <p className="mt-1 text-amber-400/70">Te notificaremos por correo electrónico cuando nuestro equipo valide tu registro. Esto generalmente toma 24-48 horas.</p>
                </div>
              </div>
            )}

            {errorType === 'deactivated' && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
                <Ban className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-300">Tu cuenta ha sido desactivada</p>
                  <p className="mt-1 text-red-400/70">Contacta a nuestro equipo de soporte para más información.</p>
                </div>
              </div>
            )}

            {errorType === 'credentials' && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
>>>>>>> develop
                <span>
                  {(loginMutation.error as any)?.response?.data?.error?.message ||
                    'Credenciales inválidas. Intenta de nuevo.'}
                </span>
              </div>
            )}

            {/* Email Input Field */}
            <div>
<<<<<<< HEAD
              <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
=======
              <label className="block text-sm font-semibold text-slate-400 mb-1.5">
>>>>>>> develop
                Email de la empresa
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
                placeholder="contacto@minegocio.com"
                required
              />
            </div>

            {/* Password Input Field */}
            <div>
<<<<<<< HEAD
              <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
=======
              <label className="block text-sm font-semibold text-slate-400 mb-1.5">
>>>>>>> develop
                Contraseña
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

<<<<<<< HEAD
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded-lg border-slate-200 text-emerald-600 focus:ring-emerald-500/10 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-base font-semibold text-slate-500">Recordarme</span>
              </label>
              <button
                type="button"
                className="text-base font-bold text-emerald-700 hover:text-emerald-600 hover:underline text-left"
              >
=======
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0" />
                <span className="text-sm text-slate-400">Recordarme</span>
              </label>
              <button type="button" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
>>>>>>> develop
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
<<<<<<< HEAD
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-base hover:bg-emerald-700 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
=======
              className="w-full py-3 mt-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
>>>>>>> develop
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando credenciales...
                </span>
              ) : (
                'Iniciar Sesión Corporativa'
              )}
            </button>

<<<<<<< HEAD
            {/* Redirect Footer Info */}
            <p className="text-center mt-8 text-base font-semibold text-slate-400">
              ¿Tu empresa no está registrada?{' '}
              <Link to="/business/register" className="font-black text-emerald-700 hover:text-emerald-600 hover:underline">
=======
            <p className="text-center mt-6 text-sm text-slate-500">
              ¿No tienes cuenta?{' '}
              <Link to="/business/register" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
>>>>>>> develop
                Registra tu negocio
              </Link>
            </p>
          </form>
        </div>

        {/* Integrated Return Navigation: Clean, elegant, and centralized below the card */}
        <div className="text-center mt-8 animate-fade-in">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group font-bold text-base"
          >
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Volver a la página principal</span>
          </Link>
        </div>

      </div>
    </div>
  )
}