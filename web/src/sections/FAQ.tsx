import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useLang } from '../contexts/LangContext'

const touristQ = ['faq.t1', 'faq.t2', 'faq.t3', 'faq.t4', 'faq.t5'] as const
const businessQ = ['faq.b1', 'faq.b2', 'faq.b3', 'faq.b4'] as const

function AccordionItem({ q, a, isOpen, onClick }: { q: string; a: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={onClick}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-50 transition-colors"
      >
        <span className="text-sm font-semibold text-neutral-800 pr-4">{q}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" aria-hidden="true" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
            role="region"
          >
            <div className="px-5 pb-4">
              <p className="text-sm text-neutral-500 leading-relaxed">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const { t } = useLang()
  const [tab, setTab] = useState<'tourists' | 'business'>('tourists')
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const items = tab === 'tourists' ? touristQ : businessQ

  return (
    <section id="faq" className="bg-white py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-center" aria-hidden="true">7</span>
          <span className="text-xs sm:text-sm font-medium border border-neutral-200 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-slate-500">{t('faq.badge')}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-neutral-900 leading-tight mb-8"
        >
          {t('faq.title')}
        </motion.h2>

        {/* Tabs with ARIA */}
        <div className="flex gap-2 mb-8" role="tablist" aria-label="FAQ categories">
          {(['tourists', 'business'] as const).map((tabKey) => (
            <button
              key={tabKey}
              role="tab"
              aria-selected={tab === tabKey}
              aria-controls="faq-panel"
              onClick={() => { setTab(tabKey); setOpenIdx(null) }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                tab === tabKey
                  ? 'bg-emerald-600 text-white px-4 py-2 rounded-xl font-black'
                  : 'text-slate-400 font-bold bg-slate-900/40 px-4 py-2 rounded-xl hover:text-white transition-colors'
              }`}
            >
              {tabKey === 'tourists' ? t('faq.tab.tourists') : t('faq.tab.business')}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div id="faq-panel" role="tabpanel" className="space-y-3 max-w-2xl">
          {items.map((prefix, i) => (
            <AccordionItem
              key={`${tab}-${i}`}
              q={t(`${prefix}.q`)}
              a={t(`${prefix}.a`)}
              isOpen={openIdx === i}
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
