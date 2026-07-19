import { Save, Globe, Bell, Shield } from 'lucide-react'

export default function AdminSettings() {
  const handleSave = () => {
    // Settings not persisted to API yet - show success feedback
    alert('Configuración guardada (localmente)')
  }

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
                <option value="America/La_Paz">America/La_Paz (UTC-4)</option>
              </select>
            </div>
          </div>
        </div>

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
          >
            <Save className="h-5 w-5" />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  )
}
