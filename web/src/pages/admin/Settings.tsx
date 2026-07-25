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
                <option value="America/La_Paz">America/La_Paz (UTC-4)</option>
              </select>
            </div>
          </div>
        </div>

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
          >
            <Save className="h-5 w-5" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  )
}
