import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Building, Phone, Mail, User, Lock, Map, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useRegisterBusiness } from '../../hooks/useAuth'
import { useCategories } from '../../hooks/useCategories'

export default function BusinessRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    businessPhone: '',
    categoryId: '',
    address: '',
  })

  const [success, setSuccess] = useState(false)
  const registerMutation = useRegisterBusiness()
  const { data: categories } = useCategories()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    registerMutation.mutate(formData, {
      onSuccess: () => {
        setSuccess(true)
      }
    })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6 selection:bg-emerald-500/20 antialiased">
        <div className="max-w-xl w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-900/5 p-10 text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 bg-emerald-50 rounded-full mb-6 text-emerald-600">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">¡Solicitud Enviada!</h2>
          <p className="text-slate-500 text-base lg:text-lg mb-8 leading-relaxed">
            Hemos recibido los datos de tu empresa. Nuestro equipo validará la información y te notificaremos por correo electrónico cuando tu cuenta sea aprobada.
          </p>
          <Link
            to="/business/login"
            className="inline-block w-full py-4 bg-slate-900 text-white font-black text-base rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-slate-900/10 transform hover:-translate-y-0.5"
          >
            Volver al Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 py-16 selection:bg-emerald-500/20 antialiased">

      <div className="w-full max-w-3xl">
        {/* 5% Organic Corner Radii & 15% MD3 Layout */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-900/5 overflow-hidden transition-all duration-300">

          {/* Header Branding Section with integrated logo padding fix */}
          <div className="p-8 pb-4 text-center flex flex-col items-center justify-center border-b border-slate-100 bg-slate-50/30">
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
              Registra tu Negocio
            </p>
          </div>

          <div className="p-8 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Error boundary scaled to text-base */}
              {registerMutation.isError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-base font-medium animate-fade-in">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>
                    {(registerMutation.error as any)?.response?.data?.error?.message ||
                      'Ocurrió un error al procesar tu solicitud. Revisa tus datos e intenta de nuevo.'}
                  </span>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

                {/* Column 1: Datos del Representante */}
                <div className="space-y-5">
                  <h3 className="font-black text-lg text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                    Representante
                  </h3>

                  <div>
                    <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 text-base font-medium rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Ej. Juan Pérez"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 text-base font-medium rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        placeholder="correo@ejemplo.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 text-base font-medium rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                    <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-wide">Mínimo 6 caracteres</p>
                  </div>
                </div>

                {/* Column 2: Datos del Negocio */}
                <div className="space-y-5">
                  <h3 className="font-black text-lg text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                    Datos del Negocio
                  </h3>

                  <div>
                    <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
                      Nombre del Negocio
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 text-base font-medium rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Ej. Restaurante El Sabor"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
                      Categoría Principal
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 text-base font-medium rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories?.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
                      Teléfono de Contacto
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        name="businessPhone"
                        value={formData.businessPhone}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 text-base font-medium rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        placeholder="+591 71234567"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
                      Dirección Completa
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Map className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 text-base font-medium rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Av. Principal #123, Zona Centro"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions Footer Area */}
              <div className="pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-base hover:bg-emerald-700 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  {registerMutation.isPending ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enviando solicitud de registro...
                    </span>
                  ) : (
                    'Solicitar Registro de Negocio'
                  )}
                </button>

                <p className="text-center mt-6 text-base font-semibold text-slate-400">
                  ¿Ya tienes una cuenta aprobada?{' '}
                  <Link to="/business/login" className="font-black text-emerald-700 hover:text-emerald-600 hover:underline">
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Centralized return navigation link */}
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