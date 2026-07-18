import { motion } from 'framer-motion'
import { Check, MapPin } from 'lucide-react'
import { useLang } from '../contexts/LangContext'

const features = ['feat.f1', 'feat.f2', 'feat.f3', 'feat.f4'] as const

export default function FeaturesPreview() {
  const { t } = useLang()
  return (
    <section id="features" className="bg-neutral-100 py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16">
          {/* Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center" aria-hidden="true">2</span>
              <span className="text-xs sm:text-sm font-medium border border-neutral-300 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-neutral-600">{t('feat.badge')}</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-neutral-900 leading-tight mb-8"
            >
              {t('feat.title')}
            </motion.h2>

            <div className="space-y-4">
              {features.map((key, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ delay: 0.15 * i, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex items-start gap-3"
                >
                  <div className="h-6 w-6 rounded-full bg-success-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-neutral-700 font-medium">{t(key)}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Phone mockup — decorative, hidden from screen readers */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex justify-center lg:justify-end"
            aria-hidden="true"
          >
            <div className="w-[280px] h-[560px] rounded-[3rem] bg-neutral-800 border-[3px] border-neutral-700 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-neutral-800 rounded-b-2xl z-20" />
              <div className="w-full h-full bg-gradient-to-b from-blue-50 to-green-50 relative">
                <div className="absolute inset-0 opacity-30">
                  <svg viewBox="0 0 400 800" className="w-full h-full">
                    <path d="M0 400 Q100 350 200 400 T400 400" fill="none" stroke="#90CAF9" strokeWidth="3" />
                    <path d="M0 300 Q150 250 300 300 T600 300" fill="none" stroke="#81C784" strokeWidth="2" />
                    <path d="M50 500 Q200 450 350 500" fill="none" stroke="#FFB74D" strokeWidth="2" />
                    <circle cx="120" cy="350" r="4" fill="#1976D2" />
                    <circle cx="250" cy="280" r="4" fill="#E65100" />
                    <circle cx="180" cy="450" r="4" fill="#2E7D32" />
                    <circle cx="300" cy="380" r="4" fill="#7B1FA2" />
                    <circle cx="100" cy="500" r="4" fill="#1976D2" />
                  </svg>
                </div>
                <div className="h-10 bg-primary-700/90 backdrop-blur flex items-end px-5 pb-1 relative z-10">
                  <span className="text-[10px] text-white/80 font-medium">9:41</span>
                </div>
                <div className="absolute top-14 left-4 right-4 z-10">
                  <div className="bg-white rounded-xl shadow-lg px-3 py-2.5 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary-700" />
                    <span className="text-xs text-neutral-500">Buscar en Santa Cruz...</span>
                  </div>
                </div>
                <div className="absolute top-[40%] left-[30%] z-10">
                  <div className="bg-primary-700 text-white text-[8px] font-bold px-2 py-1 rounded-full shadow-lg">Restaurante</div>
                </div>
                <div className="absolute top-[55%] left-[60%] z-10">
                  <div className="bg-secondary-700 text-white text-[8px] font-bold px-2 py-1 rounded-full shadow-lg">Hotel</div>
                </div>
                <div className="absolute top-[70%] left-[40%] z-10">
                  <div className="bg-green-700 text-white text-[8px] font-bold px-2 py-1 rounded-full shadow-lg">Lomas</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
