import { useState } from 'react'
import { Save, Globe, Bell, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
}

function SwitchToggle({ checked, onChange, label, description }: SwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      {(label || description) && (
        <div className="pr-4">
          {label && <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{label}</p>}
          {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label || 'Alternar opción'}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#38A169]/30 focus:ring-offset-1 min-w-[44px] min-h-[24px] ${
          checked ? 'bg-[#38A169]' : 'bg-slate-300 dark:bg-slate-600'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export default function AdminSettings() {
  const [platformName, setPlatformName] = useState('BoliviaExperience')
  const [contactEmail, setContactEmail] = useState('contacto@boliviaexperience.com')
  const [defaultLang, setDefaultLang] = useState('es')
  const [timezone, setTimezone] = useState('America/La_Paz')

  // Notification Toggles
  const [notifRegister, setNotifRegister] = useState(true)
  const [notifReviews, setNotifReviews] = useState(true)
  const [notifReports, setNotifReports] = useState(true)

  // Security Toggles
  const [enable2FA, setEnable2FA] = useState(false)
  const [concurrentSessions, setConcurrentSessions] = useState(true)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Configuración guardada exitosamente')
  }

<<<<<<< HEAD
  const inputCls =
    'w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-medium transition-all'

  const labelCls = 'block text-sm font-black text-slate-700 dark:text-slate-300 mb-1.5'

  return (
    <div className="space-y-8 pb-12">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Configuración</h1>
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">
          Ajustes globales de la plataforma
        </p>
      </div>

      <div className="space-y-6">

        {/* ── General Card ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">General</h2>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Configuración global de la aplicación</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Nombre de la plataforma</label>
              <input type="text" defaultValue="BoliviaExperience" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email de contacto</label>
              <input type="email" defaultValue="contacto@boliviaexperience.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Idioma por defecto</label>
              <select className={inputCls}>
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Zona horaria</label>
              <select className={inputCls}>
=======
  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/70 text-slate-900 dark:text-slate-100 focus:border-[#38A169] focus:ring-2 focus:ring-[#38A169]/20 outline-none h-11 transition-all text-sm'

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Configuración</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Administra las preferencias generales y parámetros del sistema
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Bloque General */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-[#38A169]">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">General</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ajustes principales de la plataforma</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nombre de la plataforma
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email de contacto
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Idioma por defecto
              </label>
              <select
                value={defaultLang}
                onChange={(e) => setDefaultLang(e.target.value)}
                className={inputClass}
              >
                <option value="es">Español (ES)</option>
                <option value="en">English (EN)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Zona horaria
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={inputClass}
              >
>>>>>>> develop
                <option value="America/La_Paz">America/La_Paz (UTC-4)</option>
              </select>
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* ── Notifications Card ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="h-10 w-10 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center">
              <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Notificaciones</h2>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Configura qué eventos generan alertas</p>
            </div>
          </div>
          <div className="space-y-5">
            {[
              { title: 'Nuevos registros', desc: 'Recibir notificación cuando un usuario se registre', defaultChecked: true },
              { title: 'Nuevas reseñas', desc: 'Recibir notificación cuando se publique una reseña', defaultChecked: true },
              { title: 'Reportes de contenido', desc: 'Recibir notificación cuando se reporte contenido', defaultChecked: true },
            ].map((item) => (
              <label key={item.title} className="flex items-start justify-between gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-all">
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={item.defaultChecked}
                  className="mt-1 h-5 w-5 rounded-lg border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 flex-shrink-0"
                />
              </label>
            ))}
          </div>
        </div>

        {/* ── Security Card ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-slate-700 dark:text-slate-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Seguridad</h2>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Configuración de autenticación y sesiones</p>
            </div>
          </div>
          <div className="space-y-5">
            {[
              { title: 'Autenticación de dos factores', desc: 'Requerir 2FA para cuentas de administrador', defaultChecked: false },
              { title: 'Sesiones concurrentes', desc: 'Permitir múltiples sesiones activas', defaultChecked: true },
            ].map((item) => (
              <label key={item.title} className="flex items-start justify-between gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-all">
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={item.defaultChecked}
                  className="mt-1 h-5 w-5 rounded-lg border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 flex-shrink-0"
                />
              </label>
            ))}
          </div>
        </div>

        {/* ── Save Action ── */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm rounded-2xl hover:bg-emerald-700 dark:hover:bg-slate-100 transition-all duration-300 shadow-xl shadow-slate-900/10 hover:-translate-y-0.5"
=======
        {/* Bloque Notificaciones */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-[#38A169]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Notificaciones</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Alertas del sistema y avisos por correo</p>
            </div>
          </div>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-700/50">
            <SwitchToggle
              label="Nuevos registros"
              description="Recibir notificación cuando un nuevo usuario o empresa se registre"
              checked={notifRegister}
              onChange={setNotifRegister}
            />
            <SwitchToggle
              label="Nuevas reseñas"
              description="Recibir notificación cuando un cliente publique una opinión"
              checked={notifReviews}
              onChange={setNotifReviews}
            />
            <SwitchToggle
              label="Reportes de contenido"
              description="Recibir aviso prioritario ante reportes de usuarios"
              checked={notifReports}
              onChange={setNotifReports}
            />
          </div>
        </div>

        {/* Bloque Seguridad */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-[#38A169]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Seguridad</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Políticas de acceso e inicio de sesión</p>
            </div>
          </div>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-700/50">
            <SwitchToggle
              label="Autenticación de dos factores (2FA)"
              description="Requerir verificación 2FA para todas las cuentas administrativas"
              checked={enable2FA}
              onChange={setEnable2FA}
            />
            <SwitchToggle
              label="Sesiones concurrentes"
              description="Permitir múltiples inicios de sesión simultáneos por cuenta"
              checked={concurrentSessions}
              onChange={setConcurrentSessions}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#38A169] hover:bg-[#2F855A] text-white font-medium rounded-xl shadow-sm hover:shadow transition-all min-h-[44px] text-sm"
>>>>>>> develop
          >
            <Save className="h-5 w-5" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  )
}
