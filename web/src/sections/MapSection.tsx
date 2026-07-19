import { motion } from 'framer-motion'
import { useLang } from '../contexts/LangContext'

const pinData = [
  { x: '20%', y: '35%', color: '#1565C0', key: 'map.pin.centro' },
  { x: '45%', y: '25%', color: '#E65100', key: 'map.pin.hotel' },
  { x: '65%', y: '50%', color: '#2E7D32', key: 'map.pin.gastro' },
  { x: '35%', y: '60%', color: '#7B1FA2', key: 'map.pin.tourism' },
  { x: '75%', y: '30%', color: '#1565C0', key: 'map.pin.nightlife' },
  { x: '55%', y: '70%', color: '#E65100', key: 'map.pin.evento' },
  { x: '25%', y: '75%', color: '#2E7D32', key: 'map.pin.nature' },
]

export default function MapSection() {
  const { t } = useLang()
  return (
    <section id="mapa" className="bg-white py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center" aria-hidden="true">6</span>
          <span className="text-xs sm:text-sm font-medium border border-neutral-200 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-neutral-600">{t('map.badge')}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-neutral-900 leading-tight mb-4"
        >
          {t('map.title')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-lg text-neutral-500 mb-10 max-w-xl"
        >
          {t('map.desc')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative rounded-2xl overflow-hidden bg-neutral-100 aspect-[16/9] border border-neutral-200"
        >
          <div className="absolute inset-0">
            <svg viewBox="0 0 800 450" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-label="Mapa de Santa Cruz con lugares verificados" role="img">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E5E5" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="800" height="450" fill="#F5F5F5" />
              <rect width="800" height="450" fill="url(#grid)" />
              <path d="M0 200 Q200 180 400 220 T800 200" fill="none" stroke="#D4D4D4" strokeWidth="8" strokeLinecap="round" />
              <path d="M0 300 Q200 280 400 320 T800 300" fill="none" stroke="#D4D4D4" strokeWidth="6" strokeLinecap="round" />
              <path d="M300 0 Q280 150 320 300 T300 450" fill="none" stroke="#D4D4D4" strokeWidth="6" strokeLinecap="round" />
              <path d="M500 0 Q520 150 480 300 T500 450" fill="none" stroke="#D4D4D4" strokeWidth="6" strokeLinecap="round" />
              <ellipse cx="150" cy="120" rx="60" ry="40" fill="#C8E6C9" opacity="0.6" />
              <ellipse cx="650" cy="350" rx="80" ry="50" fill="#C8E6C9" opacity="0.6" />
              <path d="M0 380 Q200 360 400 390 Q600 420 800 380" fill="none" stroke="#BBDEFB" strokeWidth="12" strokeLinecap="round" opacity="0.5" />
            </svg>
          </div>

          {pinData.map((pin, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200 }}
              className="absolute"
              style={{ left: pin.x, top: pin.y }}
            >
              <div className="relative group cursor-pointer" tabIndex={0} aria-label={t(pin.key)}>
                <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: pin.color, opacity: 0.2, width: 16, height: 16, margin: 'auto' }} />
                <div className="w-4 h-4 rounded-full shadow-lg border-2 border-white" style={{ backgroundColor: pin.color }} />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-900 text-white text-[10px] font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none">
                  {t(pin.key)}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
