import { motion } from 'framer-motion'
import { Download, MapPin } from 'lucide-react'
import { useLang } from '../contexts/LangContext'

export default function Hero() {
  const { t } = useLang()

  return (
    <section id="inicio" className="relative min-h-[90vh] flex items-end overflow-hidden bg-neutral-900">
      {/* Animated gradient background — the "wow" effect */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover opacity-60"
          fetchPriority="high"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-neutral-900/60 to-secondary-900/40" />
        <motion.div
          className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-primary-700/20 blur-[120px]"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-secondary-700/15 blur-[100px]"
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
      </div>

      {/* Phone mockup — decorative, hidden from screen readers */}
      <div className="hidden lg:block absolute right-[8%] top-1/2 -translate-y-1/2 z-10" aria-hidden="true">
        <motion.div
          initial={{ opacity: 0, y: 40, rotateY: -10 }}
          animate={{ opacity: 1, y: 0, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative"
        >
          <div className="w-[280px] h-[560px] rounded-[3rem] bg-neutral-800 border-[3px] border-neutral-700 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-neutral-800 rounded-b-2xl z-20" />
            <div className="w-full h-full bg-gradient-to-b from-primary-50 to-white overflow-hidden">
              <div className="h-10 bg-primary-700 flex items-end px-5 pb-1">
                <span className="text-[10px] text-white/80 font-medium">9:41</span>
              </div>
              <div className="bg-white px-4 py-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-primary-700 rounded-md flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs font-bold text-neutral-900">BoliviaExperience</span>
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="bg-neutral-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" strokeWidth="2"/><path strokeWidth="2" d="m21 21-4.35-4.35"/></svg>
                  <span className="text-[11px] text-neutral-400">Buscar lugares...</span>
                </div>
              </div>
              <div className="px-4 pb-2 flex gap-1.5 overflow-hidden">
                {['🍽️ Gastronomía', '🏨 Hoteles', '🎭 Turismo'].map((c) => (
                  <span key={c} className="text-[9px] bg-primary-50 text-primary-700 px-2 py-1 rounded-full whitespace-nowrap font-medium">{c}</span>
                ))}
              </div>
              <div className="px-4 space-y-2.5 mt-1">
                {[
                  { name: 'Restaurante El Churrasquito', cat: 'Gastronomía', rating: '4.5', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=70' },
                  { name: 'Hotel Buganvilia', cat: 'Hoteles', rating: '4.8', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&q=70' },
                  { name: 'Lomas de Arena', cat: 'Turismo', rating: '4.7', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=70' },
                ].map((place) => (
                  <div key={place.name} className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden flex">
                    <img src={place.img} alt="" className="w-16 h-16 object-cover" loading="lazy" />
                    <div className="px-2.5 py-2 flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-neutral-900 truncate">{place.name}</p>
                      <p className="text-[9px] text-neutral-400">{place.cat}</p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <svg className="h-2.5 w-2.5 fill-amber-400 text-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        <span className="text-[9px] font-semibold text-neutral-700">{place.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -inset-10 bg-primary-500/10 rounded-full blur-3xl -z-10" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pb-14 sm:pb-16 lg:pb-20 pt-32">
        <div className="max-w-[600px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-medium mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse" />
              {t('hero.badge')}
            </span>

            <h1 className="text-[clamp(2rem,6vw,4rem)] font-bold text-white leading-[1.1] tracking-tight mb-5">
              {t('hero.title')}
            </h1>

            <p className="text-lg text-white/80 leading-relaxed mb-8">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <motion.a
                href="#download"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 text-base font-semibold text-primary-700 bg-white rounded-full shadow-xl hover:shadow-2xl transition-shadow"
              >
                <Download className="h-5 w-5" />
                {t('hero.cta')}
              </motion.a>
              <motion.a
                href="#negocios"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 text-base font-semibold text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10 rounded-full transition-all"
              >
                {t('hero.cta2')}
              </motion.a>
            </div>

            {/* Store badges — TODO: replace href="#" with real store URLs when app is published */}
            <div className="flex gap-3">
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Google Play - Próximamente" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 transition-colors">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.394 12l2.304-3.492zM5.864 2.658L16.8 9.09l-2.302 2.302L5.864 2.658z"/></svg>
                <div>
                  <p className="text-[9px] text-white/60 leading-none">{t('hero.store.get')}</p>
                  <p className="text-xs text-white font-semibold">{t('hero.play')}</p>
                </div>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="App Store - Próximamente" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 transition-colors">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <div>
                  <p className="text-[9px] text-white/60 leading-none">{t('hero.store.get')}</p>
                  <p className="text-xs text-white font-semibold">{t('hero.apple')}</p>
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
