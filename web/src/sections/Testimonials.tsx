import { motion } from 'framer-motion'
import { useLang } from '../contexts/LangContext'

{/* Placeholder — reemplazar con testimonios reales post-beta */}
const testimonials = [
  { key: 'test.t1' as const, nameKey: 'test.t1.name' as const, roleKey: 'test.t1.role' as const, color: 'from-emerald-500 to-emerald-600' },
  { key: 'test.t2' as const, nameKey: 'test.t2.name' as const, roleKey: 'test.t2.role' as const, color: 'from-emerald-600 to-emerald-700' },
  { key: 'test.t3' as const, nameKey: 'test.t3.name' as const, roleKey: 'test.t3.role' as const, color: 'from-emerald-400 to-emerald-500' },
]

export default function Testimonials() {
  const { t } = useLang()
  return (
    <section id="testimonios" className="bg-white py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-center" aria-hidden="true">5</span>
          <span className="text-xs sm:text-sm font-medium border border-neutral-200 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-slate-500">{t('test.badge')}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-neutral-900 leading-tight mb-10"
        >
          {t('test.title')}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.1 * i, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex gap-0.5 mb-4" aria-hidden="true">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="h-4 w-4 fill-amber-400 text-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed mb-6">{t(item.key)}</p>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {t(item.nameKey).charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{t(item.nameKey)}</p>
                  <p className="text-xs text-neutral-400">{t(item.roleKey)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
