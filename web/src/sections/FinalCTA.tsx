import { motion } from 'framer-motion'
import { useLang } from '../contexts/LangContext'

export default function FinalCTA() {
  const { t } = useLang()
  return (
    <section id="download" className="bg-slate-900 py-16 lg:py-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-15">
        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=60" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-slate-900/85" />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4"
        >
          {t('cta.title')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-lg text-white/70 mb-8"
        >
          {t('cta.subtitle')}
        </motion.p>

        {/* Store badges — same as Hero, consistent flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {/* TODO: replace href="#" with real store URLs when app is published */}
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Google Play - Próximamente" className="inline-flex items-center gap-3 px-6 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl border border-white/25 transition-colors">
            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.394 12l2.304-3.492zM5.864 2.658L16.8 9.09l-2.302 2.302L5.864 2.658z"/></svg>
            <div className="text-left">
              <p className="text-[10px] text-white/60 leading-none">{t('hero.store.get')}</p>
              <p className="text-sm text-white font-semibold">{t('hero.play')}</p>
            </div>
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="App Store - Próximamente" className="inline-flex items-center gap-3 px-6 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl border border-white/25 transition-colors">
            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            <div className="text-left">
              <p className="text-[10px] text-white/60 leading-none">{t('hero.store.get')}</p>
              <p className="text-sm text-white font-semibold">{t('hero.apple')}</p>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
