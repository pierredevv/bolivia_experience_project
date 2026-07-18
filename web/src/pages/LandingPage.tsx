import { Link } from 'react-router-dom'
import { MapPin, TrendingUp, Users, Star, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors selection:bg-primary-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary-700 rounded-lg flex items-center justify-center shadow-sm">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-secondary-700 bg-clip-text text-transparent">
              BoliviaExperience
            </span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-sm font-medium text-neutral-600 hover:text-primary-700 dark:text-neutral-300 dark:hover:text-primary-400 transition-colors">Beneficios</a>
            <a href="#how-it-works" className="text-sm font-medium text-neutral-600 hover:text-primary-700 dark:text-neutral-300 dark:hover:text-primary-400 transition-colors">Cómo Funciona</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link 
              to="/business/login" 
              className="text-sm font-medium text-neutral-700 hover:text-primary-700 dark:text-neutral-200 dark:hover:text-primary-400 transition-colors hidden sm:block"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/business/register"
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 rounded-full shadow-sm hover:shadow transition-all"
            >
              Registrar Negocio
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-800 dark:to-neutral-900 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-6">
            Conecta tu negocio con <br className="hidden md:block" />
            <span className="text-primary-700 dark:text-primary-500">miles de visitantes</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-neutral-600 dark:text-neutral-300 mb-10">
            Únete a la plataforma turística más grande de Bolivia. Muestra tus servicios, gestiona tus reservas y haz crecer tus ventas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/business/register"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-primary-700 hover:bg-primary-800 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all gap-2"
            >
              Empezar ahora <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-neutral-700 bg-white hover:bg-neutral-50 dark:text-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full shadow-sm border border-neutral-200 dark:border-neutral-700 transition-all"
            >
              Ver demostración
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-neutral-200 dark:divide-neutral-800">
            <div>
              <p className="text-3xl font-bold text-primary-700 dark:text-primary-500">50K+</p>
              <p className="text-sm font-medium text-neutral-500 mt-1">Usuarios Activos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-700 dark:text-primary-500">1,200+</p>
              <p className="text-sm font-medium text-neutral-500 mt-1">Negocios Registrados</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-700 dark:text-primary-500">4.8/5</p>
              <p className="text-sm font-medium text-neutral-500 mt-1">Calificación Promedio</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-700 dark:text-primary-500">100%</p>
              <p className="text-sm font-medium text-neutral-500 mt-1">Gratis para empezar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">Todo lo que necesitas para crecer</h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Herramientas diseñadas específicamente para restaurantes, hoteles, tours y experiencias turísticas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Llega a más clientes</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Aparece en las búsquedas de turistas locales e internacionales. Aumenta tu visibilidad sin costo extra.
              </p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-secondary-50 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400 rounded-xl flex items-center justify-center mb-6">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Gestiona tu reputación</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Recibe reseñas, responde a comentarios y construye confianza con nuevos clientes a través de tu perfil oficial.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Analiza tu impacto</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Métricas detalladas de cuántas personas ven tu perfil, te guardan como favorito y muestran interés en ir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518104593124-ac2e82a5eb9b?q=80&w=2070')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para llevar tu negocio al siguiente nivel?
          </h2>
          <p className="text-primary-100 text-lg mb-10">
            Únete a cientos de empresas que ya están multiplicando sus reservas con BoliviaExperience.
          </p>
          <Link
            to="/business/register"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-primary-900 bg-white hover:bg-neutral-50 rounded-full shadow-xl hover:scale-105 transition-all"
          >
            Crear mi cuenta gratis
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-neutral-900 py-12 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <MapPin className="h-6 w-6 text-primary-500" />
            <span className="text-lg font-bold text-white">BoliviaExperience</span>
          </div>
          <p className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} BoliviaExperience. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
