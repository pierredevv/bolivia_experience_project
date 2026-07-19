import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useLang } from '../contexts/LangContext'

const items = ['proof.places', 'proof.lang', 'proof.offline', 'proof.free'] as const

export default function SocialProofStrip() {
  const { t } = useLang()
  return (
    <section className="bg-primary-50 py-6 border-b border-primary-100">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-x-8 gap-y-3"
        >
          {items.map((key) => (
            <span key={key} className="flex items-center gap-2 text-sm font-medium text-neutral-900">
              <Check className="h-4 w-4 text-success-700 shrink-0" />
              {t(key)}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
