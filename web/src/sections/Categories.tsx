import { motion } from 'framer-motion'
import { Utensils, Hotel, Compass, Music, Calendar, Trees } from 'lucide-react'
import { useLang } from '../contexts/LangContext'

const categories = [
  { key: 'cat.gastro', icon: Utensils, img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80' },
  { key: 'cat.hotel', icon: Hotel, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80' },
  { key: 'cat.tourism', icon: Compass, img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80' },
  { key: 'cat.nightlife', icon: Music, img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80' },
  { key: 'cat.events', icon: Calendar, img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80' },
  { key: 'cat.nature', icon: Trees, img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80' },
]

export default function Categories() {
  const { t } = useLang()
  return (
    <section id="categorias" className="bg-white py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-center" aria-hidden="true">3</span>
          <span className="text-xs sm:text-sm font-medium border border-neutral-200 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-slate-500">{t('cat.badge')}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-neutral-900 leading-tight mb-10"
        >
          {t('cat.title')}
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.08 * i, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={t(cat.key)}
            >
              <img
                src={cat.img}
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <cat.icon className="h-6 w-6 text-white/80 mb-2" aria-hidden="true" />
                <p className="text-sm sm:text-base font-bold text-white">{t(cat.key)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
