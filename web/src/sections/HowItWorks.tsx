import { motion } from 'framer-motion'
import { Search, MapPin, Heart } from 'lucide-react'
import { useLang } from '../contexts/LangContext'

const steps = [
  { icon: Search, key: 'how.s1' as const, color: 'bg-emerald-50 text-emerald-700' },
  { icon: MapPin, key: 'how.s2' as const, color: 'bg-emerald-50 text-emerald-700' },
  { icon: Heart, key: 'how.s3' as const, color: 'bg-emerald-50 text-emerald-700' },
]

export default function HowItWorks() {
  const { t } = useLang()
  return (
    <section id="como-funciona" className="bg-white py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-center" aria-hidden="true">1</span>
          <span className="text-xs sm:text-sm font-medium border border-neutral-200 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-slate-500">{t('how.badge')}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-neutral-900 leading-tight mb-12 lg:mb-16"
        >
          {t('how.title')}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.1 * i, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center"
            >
              <div className={`inline-flex h-14 w-14 rounded-2xl items-center justify-center mb-5 ${step.color}`}>
                <step.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{t(`${step.key}.title`)}</h3>
              <p className="text-neutral-600 leading-relaxed">{t(`${step.key}.desc`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
