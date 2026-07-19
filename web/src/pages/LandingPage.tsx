import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Users,
  Star,
  ArrowRight,
  Shield,
  ChevronRight
} from 'lucide-react'

const FEATURES = [
  {
    icon: Users,
    title: 'Llega a más clientes',
    description:
      'Aparece en las búsquedas de turistas locales e internacionales. Aumenta tu visibilidad sin costo extra.',
    token: 'emerald',
  },
  {
    icon: Star,
    title: 'Gestiona tu reputación',
    description:
      'Recibe reseñas, responde a comentarios y construye confianza con nuevos clientes a través de tu perfil oficial.',
    token: 'amber',
  },
  {
    icon: TrendingUp,
    title: 'Analiza tu impacto',
    description:
      'Métricas detalladas de cuántas personas ven tu perfil, te guardan como favorito y muestran interés en ir.',
    token: 'slate',
  },
] as const

const STATS = [
  { value: '50K+', label: 'Usuarios Activos' },
  { value: '1,200+', label: 'Negocios Registrados' },
  { value: '4.8/5', label: 'Calificación Promedio' },
  { value: '100%', label: 'Gratis para empezar' },
] as const

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Crea tu perfil',
    description: 'Registra tu negocio en menos de 3 minutos. Sin costos ocultos.',
  },
  {
    step: '02',
    title: 'Publica tus servicios',
    description: 'Agrega fotos, descripciones, precios y disponibilidad.',
  },
  {
    step: '03',
    title: 'Recibe reservas',
    description: 'Los turistas te encuentran y reservan directamente.',
  },
] as const

const LOCAL_SLIDES = [
  {
    title: 'Explora el reflejo del cielo',
    phrase: 'Salar de Uyuni',
    description: 'Encuentra rutas personalizadas, transporte local y los mejores spots fotográficos adaptados a tu presupuesto.',
    image: '/SalarUyuni.jpg',
    tag: 'Potosí'
  },
  {
    title: 'Siente los colores andinos',
    phrase: 'Laguna Colorada',
    description: 'Planifica tu próxima aventura en el corazón del altiplano y descubre gastronomía local verificada.',
    image: '/LagunaColorada.jpg',
    tag: 'Altiplano'
  },
  {
    title: 'Navega en las alturas del mito',
    phrase: 'Lago Titicaca',
    description: 'Visita Copacabana e islas sagradas sin intermediarios, conectando directo con los hospedajes de la zona.',
    image: '/LagoTiticaca.jpg',
    tag: 'La Paz'
  }
]

function FeatureIcon({ token }: { token: string }) {
  const map: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-700',
  }
  return map[token] ?? map.slate
}

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeRoleTab, setActiveRoleTab] = useState<'tourist' | 'business'>('tourist')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % LOCAL_SLIDES.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white selection:bg-emerald-500/20 text-slate-900">

      {/* ════════════════════════════════════════════════════════════
          HEADER
          ════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between gap-4">

          <Link to="/" className="flex items-center shrink-0">
            <img
              src="/LogoBoliviaExperience.png"
              alt="BoliviaExperience Logo"
              className="h-32 md:h-38 object-contain transition-transform duration-300 hover:scale-[1.02]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden font-black text-2xl text-slate-900">
              Bolivia<span className="text-emerald-600">Experience</span>
            </span>
          </Link>

          {/* Letras del menú principal subidas a text-base font-bold */}
          <nav className="hidden md:flex items-center gap-14 lg:gap-16">
            {[
              { href: '#features', label: 'Beneficios' },
              { href: '#how-it-works', label: 'Cómo Funciona' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-base font-bold text-slate-400 hover:text-slate-900 tracking-wide transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-6 shrink-0">
            <Link
              to="/business/login"
              className="text-base font-bold text-slate-500 hover:text-slate-900 transition-colors hidden sm:block px-2 py-1"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/business/register"
              className="inline-flex items-center justify-center px-6 py-3.5 text-base font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-600/10 hover:shadow-emerald-600/20 hover:-translate-y-0.5"
            >
              Registrar Negocio
            </Link>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════
          CINEMATIC BANNER SLIDER (Letras Agrandadas)
          ════════════════════════════════════════════════════════════ */}
      <section className="pt-8 pb-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="bg-slate-900 text-white rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-slate-800 flex flex-col lg:flex-row min-h-[580px] transition-all duration-500">

          <div className="w-full lg:w-1/2 relative min-h-[350px] lg:min-h-full overflow-hidden p-6">
            <div className="w-full h-full relative rounded-[2rem] overflow-hidden shadow-inner group">
              <img
                src={LOCAL_SLIDES[currentSlide].image}
                alt={LOCAL_SLIDES[currentSlide].phrase}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

              {/* Tag geográfico más visible (text-sm font-black) */}
              <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-black tracking-widest px-5 py-2.5 rounded-full uppercase">
                {LOCAL_SLIDES[currentSlide].tag}
              </span>

              <div className="absolute bottom-6 left-6 z-10 hidden sm:block">
                <span className="text-emerald-400 text-sm font-black uppercase tracking-widest block mb-1">Destino Turístico</span>
                <h4 className="text-2xl font-bold tracking-tight text-white">{LOCAL_SLIDES[currentSlide].phrase}</h4>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">

            {/* Pestañas de Roles más grandes (text-sm font-bold) */}
            <div className="flex bg-slate-800/60 p-1.5 rounded-2xl border border-slate-700/50 w-full max-w-sm mb-8">
              <button
                onClick={() => setActiveRoleTab('tourist')}
                className={`flex-1 text-sm font-bold py-3 rounded-xl uppercase tracking-wider transition-all ${activeRoleTab === 'tourist' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Soy Turista
              </button>
              <button
                onClick={() => setActiveRoleTab('business')}
                className={`flex-1 text-sm font-bold py-3 rounded-xl uppercase tracking-wider transition-all ${activeRoleTab === 'business' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Soy Empresa
              </button>
            </div>

            {/* Descripciones escaladas a text-lg e h1 robustos */}
            <div className="max-w-xl min-h-[250px] flex flex-col justify-between">
              {activeRoleTab === 'tourist' ? (
                <div className="animate-fade-in">
                  <span className="text-emerald-400 text-sm font-black uppercase tracking-widest block mb-3">
                    {LOCAL_SLIDES[currentSlide].phrase}
                  </span>
                  <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white mb-5">
                    {LOCAL_SLIDES[currentSlide].title}
                  </h1>
                  <p className="text-slate-300 text-base lg:text-lg mb-8 leading-relaxed">
                    {LOCAL_SLIDES[currentSlide].description} Descubre servicios certificados sin comisiones ni intermediarios.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-xl shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 gap-2"
                  >
                    Comenzar Aventura <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <span className="text-amber-400 text-sm font-black uppercase tracking-widest block mb-3">
                    Plataforma B2B Premium
                  </span>
                  <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white mb-5">
                    Digitaliza tu negocio y <span className="text-amber-400">multiplica tus ventas</span>
                  </h1>
                  <p className="text-slate-300 text-base lg:text-lg mb-8 leading-relaxed">
                    Muestra tus menús, habitaciones o tours a miles de usuarios activos que visitan la región diariamente. Control total desde tu panel de gestión.
                  </p>
                  <Link
                    to="/business/register"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-black text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-2xl shadow-xl shadow-amber-500/10 transition-all transform hover:-translate-y-0.5 gap-2"
                  >
                    Registrar Negocio Gratis <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              )}
            </div>

            <div className="absolute bottom-8 right-8 flex items-center gap-2">
              {LOCAL_SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 transition-all rounded-full ${index === currentSlide ? (activeRoleTab === 'tourist' ? 'w-7 bg-emerald-500' : 'w-7 bg-amber-500') : 'w-2.5 bg-slate-700'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Letras de señales de confianza subidas a text-sm font-bold */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-8 text-sm font-bold text-slate-400 uppercase tracking-widest">
          <span className="flex items-center gap-2"><Shield className="h-5 w-5 text-emerald-500" /> Entorno de Confianza Verificado</span>
          <span className="h-1.5 w-1.5 bg-slate-200 rounded-full" />
          <span>Filtros Dinámicos Inteligentes</span>
          <span className="h-1.5 w-1.5 bg-slate-200 rounded-full" />
          <span>Soporte e Infraestructura Local</span>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          STATS
          ════════════════════════════════════════════════════════════ */}
      <section className="py-18 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <p className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
                  {stat.value}
                </p>
                {/* Labels de estadísticas subidos a text-xs -> text-sm */}
                <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FEATURES
          ════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-28 lg:py-36">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4">
              Beneficios
            </p>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-6">
              Todo lo que necesitas para{' '}
              <span className="text-emerald-600">crecer</span>
            </h2>
            <p className="text-xl text-slate-500 leading-relaxed">
              Herramientas diseñadas específicamente para restaurantes, hoteles,
              tours y experiencias turísticas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500"
                >
                  <div
                    className={`h-14 w-14 ${FeatureIcon({
                      token: feature.token,
                    })} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                    {feature.title}
                  </h3>
                  {/* Párrafos de las tarjetas subidos a text-base/lg */}
                  <p className="text-slate-500 text-base lg:text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          HOW IT WORKS
          ════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-28 lg:py-36 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-4">
              Cómo Funciona
            </p>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Tres pasos para{' '}
              <span className="text-amber-500">despegar</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="relative">
                <span className="text-7xl font-black text-slate-200 select-none block mb-4 leading-none">
                  {item.step}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                  {item.title}
                </h3>
                {/* Texto explicativo subido a text-base/lg */}
                <p className="text-slate-500 text-base lg:text-lg leading-relaxed">
                  {item.description}
                </p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-14 -right-8 h-7 w-7 text-slate-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-16 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                Bolivia<span className="text-emerald-400">Experience</span>
              </span>
            </div>

            <nav className="flex items-center gap-8 text-base font-bold text-slate-400">
              <a href="#features" className="hover:text-white transition-colors">Beneficios</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">Cómo Funciona</a>
              <Link to="/business/login" className="hover:text-white transition-colors">Iniciar Sesión</Link>
            </nav>

            <p className="text-base text-slate-500">
              © {new Date().getFullYear()} BoliviaExperience. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}