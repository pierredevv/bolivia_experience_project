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
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 text-center border border-neutral-100 dark:border-neutral-700">
          <div className="inline-flex items-center justify-center h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6 text-green-600 dark:text-green-500">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">¡Solicitud Enviada!</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Hemos recibido los datos de tu empresa. Nuestro equipo validará la información y te notificaremos por correo electrónico cuando tu cuenta sea aprobada.
          </p>
          <Link
            to="/business/login"
            className="inline-block w-full py-3 bg-secondary-700 text-white font-medium rounded-xl hover:bg-secondary-800 transition-colors"
          >
            Volver al Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center p-4 py-12 transition-colors relative">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-secondary-700 dark:hover:text-secondary-400">
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm font-medium hidden sm:block">Volver a inicio</span>
      </Link>
      
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl overflow-hidden border border-neutral-100 dark:border-neutral-700">
          <div className="bg-secondary-700 px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl mb-4 border border-white/30">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Registra tu Negocio</h1>
              <p className="text-secondary-100">Únete a BoliviaExperience y llega a más clientes hoy mismo.</p>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {registerMutation.isError && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>
                    {(registerMutation.error as any)?.response?.data?.error?.message ||
                      'Ocurrió un error al procesar tu solicitud. Revisa tus datos e intenta de nuevo.'}
                  </span>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Datos de Usuario */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-700 pb-2">
                    Datos del Representante
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-neutral-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none transition-all"
                        placeholder="Ej. Juan Pérez"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-neutral-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none transition-all"
                        placeholder="correo@ejemplo.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-neutral-400" />
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">Mínimo 6 caracteres</p>
                  </div>
                </div>

                {/* Datos del Negocio */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-700 pb-2">
                    Datos del Negocio
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Nombre del Negocio
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-neutral-400" />
                      </div>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none transition-all"
                        placeholder="Ej. Restaurante El Sabor"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Categoría Principal
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none transition-all"
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
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Teléfono de Contacto
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-neutral-400" />
                      </div>
                      <input
                        type="tel"
                        name="businessPhone"
                        value={formData.businessPhone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none transition-all"
                        placeholder="+591 71234567"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Dirección Completa
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Map className="h-5 w-5 text-neutral-400" />
                      </div>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none transition-all"
                        placeholder="Av. Principal #123, Zona Centro"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full py-4 bg-secondary-700 text-white rounded-xl font-bold hover:bg-secondary-800 transition-colors shadow-lg shadow-secondary-700/20 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {registerMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enviando solicitud...
                    </span>
                  ) : (
                    'Solicitar Registro de Negocio'
                  )}
                </button>
                <p className="text-center mt-6 text-sm text-neutral-600 dark:text-neutral-400">
                  ¿Ya tienes una cuenta aprobada?{' '}
                  <Link to="/business/login" className="font-medium text-secondary-700 dark:text-secondary-400 hover:underline">
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
