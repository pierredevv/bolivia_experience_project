import { motion } from 'framer-motion'
import { Users, BarChart3, Star, Check } from 'lucide-react'
import { useLang } from '../contexts/LangContext'

const benefits = [
  { icon: Users, key: 'biz.f1' as const },
  { icon: BarChart3, key: 'biz.f2' as const },
  { icon: Star, key: 'biz.f3' as const },
]

export default function ForBusiness() {
  const { t } = useLang()

  return (
    <section id="negocios" className="bg-neutral-900 py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-center" aria-hidden="true">4</span>
          <span className="text-xs sm:text-sm font-medium border border-white/20 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-white/70">{t('biz.badge')}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-white leading-tight mb-4"
        >
          {t('biz.title')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-lg text-white/60 mb-10 max-w-xl"
        >
          {t('biz.subtitle')}
        </motion.p>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          {benefits.map((b, i) => (
            <motion.div
              key={b.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.1 * i, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-600/20 flex items-center justify-center shrink-0">
                <b.icon className="h-5 w-5 text-emerald-400" aria-hidden="true" />
              </div>
              <span className="text-white font-medium text-sm">{t(b.key)}</span>
            </motion.div>
          ))}
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">{t('biz.plan.free')}</p>
            <p className="text-3xl font-bold text-white mb-1">{t('biz.plan.free.price')}</p>
            <p className="text-sm text-white/50 mb-6">{t('biz.plan.free.desc')}</p>
            <ul className="space-y-3 mb-8">
              {[1, 2].map(i => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-white/70">
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />
                  {t(`biz.plan.free.f${i}`)}
                </li>
              ))}
            </ul>
            <a href="/business/register" className="block w-full text-center py-2.5 text-sm font-semibold rounded-xl border border-slate-700 text-white hover:border-slate-600 transition-colors">
              {t('biz.plan.free.cta')}
            </a>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="rounded-2xl border-2 border-emerald-500 bg-slate-900 p-6 relative shadow-lg shadow-emerald-600/20"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded-full">
              {t('biz.popular')}
            </div>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">{t('biz.plan.pro')}</p>
            <p className="text-3xl font-bold text-white mb-1">{t('biz.plan.pro.price')}</p>
            <p className="text-sm text-white/60 mb-6">{t('biz.plan.pro.desc')}</p>
            <ul className="space-y-3 mb-8">
              {[1, 2, 3].map(i => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-white/80">
                  <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
                  {t(`biz.plan.pro.f${i}`)}
                </li>
              ))}
            </ul>
            <a href="/business/register" className="block w-full text-center py-2.5 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
              {t('biz.plan.pro.cta')}
            </a>
          </motion.div>

          {/* Enterprise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">{t('biz.plan.ent')}</p>
            <p className="text-3xl font-bold text-white mb-1">{t('biz.plan.ent.price')}</p>
            <p className="text-sm text-white/50 mb-6">{t('biz.plan.ent.desc')}</p>
            <ul className="space-y-3 mb-8">
              {[1, 2, 3].map(i => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-white/70">
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />
                  {t(`biz.plan.ent.f${i}`)}
                </li>
              ))}
            </ul>
            <a href="/business/register" className="block w-full text-center py-2.5 text-sm font-semibold rounded-xl border border-slate-700 text-white hover:border-slate-600 transition-colors">
              {t('biz.plan.ent.cta')}
            </a>
          </motion.div>
        </div>

        {/* CTA — navigates to /business/register, no inline form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mt-12"
        >
          <a
            href="/business/register"
            className="inline-flex items-center gap-2 px-8 py-3 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            {t('biz.cta')}
          </a>
          <p className="mt-4 text-sm text-white/50">
            {t('nav.business.login')}{' '}
            <a href="/business/login" className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2 transition-colors">
              {t('nav.business.login.cta')}
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
