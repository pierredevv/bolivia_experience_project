import { Save, Globe, Bell, Shield, Database } from 'lucide-react'

export default function AdminSettings() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Configuración</h1>
        <p className="text-neutral-500 mt-1">Configura los ajustes de la plataforma</p>
      </div>

      <div className="space-y-6">
        {/* General */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-primary-700" />
            <h2 className="text-lg font-semibold text-neutral-900">General</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nombre de la plataforma
              </label>
              <input
                type="text"
                defaultValue="BoliviaExperience"
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email de contacto
              </label>
              <input
                type="email"
                defaultValue="contacto@boliviaexperience.com"
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Idioma por defecto
              </label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Zona horaria
              </label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                <option value="America/La_Paz">America/La_Paz (UTC-4)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-primary-700" />
            <h2 className="text-lg font-semibold text-neutral-900">Notificaciones</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">Nuevos registros</p>
                <p className="text-sm text-neutral-500">Recibir notificación cuando un usuario se registre</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded border-neutral-300" />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">Nuevas reseñas</p>
                <p className="text-sm text-neutral-500">Recibir notificación cuando se publique una reseña</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded border-neutral-300" />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">Reportes de contenido</p>
                <p className="text-sm text-neutral-500">Recibir notificación cuando se reporte contenido</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded border-neutral-300" />
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-primary-700" />
            <h2 className="text-lg font-semibold text-neutral-900">Seguridad</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">Autenticación de dos factores</p>
                <p className="text-sm text-neutral-500">Requerir 2FA para cuentas de administrador</p>
              </div>
              <input type="checkbox" className="rounded border-neutral-300" />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">Sesiones concurrentes</p>
                <p className="text-sm text-neutral-500">Permitir múltiples sesiones activas</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded border-neutral-300" />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors">
            <Save className="h-5 w-5" />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  )
}
