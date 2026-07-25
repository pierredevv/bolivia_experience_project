import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Building, Phone, Mail, User, Lock, Map, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, Check, Upload } from 'lucide-react'
import { useRegisterBusiness } from '../../hooks/useAuth'
import { useCategories } from '../../hooks/useCategories'

const steps = [
  { id: 1, label: 'Datos Básicos', icon: User },
  { id: 2, label: 'Tu Negocio', icon: Building },
  { id: 3, label: 'Revisión', icon: Check },
]

export default function BusinessRegisterPage() {
  const [step, setStep] = useState(1)
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

  const canNext = () => {
    if (step === 1) return formData.name && formData.email && formData.password.length >= 6
    if (step === 2) return formData.businessName && formData.categoryId && formData.businessPhone && formData.address
    return true
  }

  if (success) {
    return (
<<<<<<< HEAD
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6 selection:bg-emerald-500/20 antialiased">
        <div className="max-w-xl w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-900/5 p-10 text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 bg-emerald-50 rounded-full mb-6 text-emerald-600">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">¡Solicitud Enviada!</h2>
          <p className="text-slate-500 text-base lg:text-lg mb-8 leading-relaxed">
=======
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 rounded-[2rem] shadow-2xl p-8 text-center border border-slate-800">
          <div className="inline-flex items-center justify-center h-20 w-20 bg-emerald-600/15 rounded-full mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">¡Solicitud Enviada!</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
>>>>>>> develop
            Hemos recibido los datos de tu empresa. Nuestro equipo validará la información y te notificaremos por correo electrónico cuando tu cuenta sea aprobada.
          </p>
          <Link
            to="/business/login"
<<<<<<< HEAD
            className="inline-block w-full py-4 bg-slate-900 text-white font-black text-base rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-slate-900/10 transform hover:-translate-y-0.5"
=======
            className="inline-block w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10"
>>>>>>> develop
          >
            Volver al Login
          </Link>
        </div>
      </div>
    )
  }

  return (
<<<<<<< HEAD
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
=======
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 relative">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm font-medium hidden sm:block">Volver a inicio</span>
      </Link>

      <div className="w-full max-w-2xl">
        {/* Step Progress Tracker */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center h-10 w-10 rounded-full text-sm font-bold transition-all duration-300 ${
                  step > s.id
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                    : step === s.id
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 ring-4 ring-emerald-600/20'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                </div>
                <span className={`text-sm font-semibold hidden sm:block transition-colors ${
                  step >= s.id ? 'text-white' : 'text-slate-500'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 md:w-20 h-0.5 mx-3 rounded-full transition-colors duration-300 ${
                  step > s.id ? 'bg-emerald-600' : 'bg-slate-800'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Dark Floating Card */}
        <div className="bg-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-800">
          {/* Header */}
          <div className="px-8 md:px-12 pt-10 pb-6 text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 bg-emerald-600/15 rounded-2xl mb-4 border border-emerald-600/20">
              <MapPin className="h-7 w-7 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Registra tu Negocio</h1>
            <p className="text-slate-400 mt-1 text-sm">Paso {step} de 3 — {steps[step - 1].label}</p>
          </div>

          <div className="px-8 md:px-12 pb-10">
            <form onSubmit={handleSubmit}>
              {registerMutation.isError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm mb-6">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
>>>>>>> develop
                  <span>
                    {(registerMutation.error as any)?.response?.data?.error?.message ||
                      'Ocurrió un error al procesar tu solicitud. Revisa tus datos e intenta de nuevo.'}
                  </span>
                </div>
              )}

<<<<<<< HEAD
              <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

                {/* Column 1: Datos del Representante */}
                <div className="space-y-5">
                  <h3 className="font-black text-lg text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                    Representante
                  </h3>

                  <div>
                    <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
=======
              {/* Step 1: Datos Básicos */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1.5">
>>>>>>> develop
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
<<<<<<< HEAD
                        <User className="h-5 w-5 text-slate-400" />
=======
                        <User className="h-5 w-5 text-slate-600" />
>>>>>>> develop
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
<<<<<<< HEAD
                        className="w-full pl-12 pr-4 py-3.5 text-base font-medium rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
=======
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl outline-none transition-all text-sm"
>>>>>>> develop
                        placeholder="Ej. Juan Pérez"
                        required
                      />
                    </div>
                  </div>

                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
=======
                    <label className="block text-sm font-semibold text-slate-400 mb-1.5">
>>>>>>> develop
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
<<<<<<< HEAD
                        <Mail className="h-5 w-5 text-slate-400" />
=======
                        <Mail className="h-5 w-5 text-slate-600" />
>>>>>>> develop
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
<<<<<<< HEAD
                        className="w-full pl-12 pr-4 py-3.5 text-base font-medium rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
=======
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl outline-none transition-all text-sm"
>>>>>>> develop
                        placeholder="correo@ejemplo.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
=======
                    <label className="block text-sm font-semibold text-slate-400 mb-1.5">
>>>>>>> develop
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
<<<<<<< HEAD
                        <Lock className="h-5 w-5 text-slate-400" />
=======
                        <Lock className="h-5 w-5 text-slate-600" />
>>>>>>> develop
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
<<<<<<< HEAD
                        className="w-full pl-12 pr-4 py-3.5 text-base font-medium rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
=======
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl outline-none transition-all text-sm"
>>>>>>> develop
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
<<<<<<< HEAD
                    <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-wide">Mínimo 6 caracteres</p>
=======
                    <p className="mt-1.5 text-xs text-slate-600">Mínimo 6 caracteres</p>
>>>>>>> develop
                  </div>
                </div>
              )}

<<<<<<< HEAD
                {/* Column 2: Datos del Negocio */}
                <div className="space-y-5">
                  <h3 className="font-black text-lg text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                    Datos del Negocio
                  </h3>

                  <div>
                    <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
=======
              {/* Step 2: Datos del Negocio */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1.5">
>>>>>>> develop
                      Nombre del Negocio
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
<<<<<<< HEAD
                        <Building className="h-5 w-5 text-slate-400" />
=======
                        <Building className="h-5 w-5 text-slate-600" />
>>>>>>> develop
                      </div>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
<<<<<<< HEAD
                        className="w-full pl-12 pr-4 py-3.5 text-base font-medium rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
=======
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl outline-none transition-all text-sm"
>>>>>>> develop
                        placeholder="Ej. Restaurante El Sabor"
                        required
                      />
                    </div>
                  </div>

                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
=======
                    <label className="block text-sm font-semibold text-slate-400 mb-1.5">
>>>>>>> develop
                      Categoría Principal
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
<<<<<<< HEAD
                      className="w-full px-5 py-3.5 text-base font-medium rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all cursor-pointer"
=======
                      className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl outline-none transition-all text-sm appearance-none"
>>>>>>> develop
                      required
                    >
                      <option value="" className="bg-slate-900">Selecciona una categoría</option>
                      {categories?.map((cat: any) => (
                        <option key={cat.id} value={cat.id} className="bg-slate-900">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
=======
                    <label className="block text-sm font-semibold text-slate-400 mb-1.5">
>>>>>>> develop
                      Teléfono de Contacto
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
<<<<<<< HEAD
                        <Phone className="h-5 w-5 text-slate-400" />
=======
                        <Phone className="h-5 w-5 text-slate-600" />
>>>>>>> develop
                      </div>
                      <input
                        type="tel"
                        name="businessPhone"
                        value={formData.businessPhone}
                        onChange={handleChange}
<<<<<<< HEAD
                        className="w-full pl-12 pr-4 py-3.5 text-base font-medium rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
=======
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl outline-none transition-all text-sm"
>>>>>>> develop
                        placeholder="+591 71234567"
                        required
                      />
                    </div>
                  </div>

                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-black uppercase text-slate-400 mb-2 tracking-wider">
=======
                    <label className="block text-sm font-semibold text-slate-400 mb-1.5">
>>>>>>> develop
                      Dirección Completa
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
<<<<<<< HEAD
                        <Map className="h-5 w-5 text-slate-400" />
=======
                        <Map className="h-5 w-5 text-slate-600" />
>>>>>>> develop
                      </div>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
<<<<<<< HEAD
                        className="w-full pl-12 pr-4 py-3.5 text-base font-medium rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
=======
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl outline-none transition-all text-sm"
>>>>>>> develop
                        placeholder="Av. Principal #123, Zona Centro"
                        required
                      />
                    </div>
                  </div>

<<<<<<< HEAD
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
=======
                  {/* Photo Upload Dropzone (decorative) */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1.5">
                      Fotos del Negocio
                    </label>
                    <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-800/40 rounded-2xl p-6 text-center cursor-pointer transition-all group">
                      <div className="inline-flex items-center justify-center h-12 w-12 bg-slate-800 rounded-xl mb-3 group-hover:bg-emerald-600/15 transition-colors">
                        <Upload className="h-6 w-6 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <p className="text-sm text-slate-400 font-medium">Arrastra fotos aquí o haz clic para subir</p>
                      <p className="text-xs text-slate-600 mt-1">PNG, JPG hasta 5MB (opcional)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Revisión */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-800">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">Datos del Representante</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Nombre</p>
                        <p className="text-sm font-semibold text-white">{formData.name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="text-sm font-semibold text-white">{formData.email || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Contraseña</p>
                        <p className="text-sm font-semibold text-white">••••••••</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-800">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">Datos del Negocio</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Negocio</p>
                        <p className="text-sm font-semibold text-white">{formData.businessName || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Categoría</p>
                        <p className="text-sm font-semibold text-white">
                          {categories?.find((c: any) => c.id === formData.categoryId)?.name || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Teléfono</p>
                        <p className="text-sm font-semibold text-white">{formData.businessPhone || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Dirección</p>
                        <p className="text-sm font-semibold text-white">{formData.address || '—'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-600/10 border border-emerald-600/20 rounded-xl p-4">
                    <p className="text-sm text-emerald-400 leading-relaxed">
                      Al enviar, tu solicitud será revisada por nuestro equipo. Recibirás un correo de confirmación cuando tu cuenta sea aprobada (generalmente 24-48 horas).
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(s => s - 1)}
                    className="text-slate-400 hover:text-white font-bold text-sm transition-colors hover:scale-[1.02] transition-transform"
                  >
                    ← Atrás
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep(s => s + 1)}
                    disabled={!canNext()}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
                  >
                    Siguiente
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                  >
                    {registerMutation.isPending ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Enviar Solicitud
                      </>
                    )}
                  </button>
                )}
>>>>>>> develop
              </div>
            </form>

            <p className="text-center mt-6 text-sm text-slate-500">
              ¿Ya tienes una cuenta aprobada?{' '}
              <Link to="/business/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                Inicia sesión aquí
              </Link>
            </p>
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