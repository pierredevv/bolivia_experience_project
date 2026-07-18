import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Menu, X, Download } from 'lucide-react'
import { useLang } from '../contexts/LangContext'

export default function Navbar() {
  const { lang, toggle, t } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Focus trap for mobile menu
  useEffect(() => {
    if (mobileOpen) {
      closeBtnRef.current?.focus()
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileOpen(false)
          menuBtnRef.current?.focus()
        }
      }
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    }
  }, [mobileOpen])

  const navLinks = [
    { href: '#como-funciona', label: t('nav.how') },
    { href: '#categorias', label: t('nav.categories') },
    { href: '#negocios', label: t('nav.business') },
    { href: '#faq', label: t('nav.faq') },
  ]

  return (
    <>
      <a href="#main-content" className="skip-link">{t('a11y.skip')}</a>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 shrink-0">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${scrolled ? 'bg-primary-700' : 'bg-white/20 backdrop-blur-sm'}`}>
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className={`text-lg font-bold tracking-tight transition-colors ${scrolled ? 'text-neutral-900' : 'text-white'}`}>
              Bolivia<span className={scrolled ? 'text-primary-700' : 'text-primary-300'}>Experience</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  scrolled ? 'text-neutral-600 hover:text-neutral-900' : 'text-white/70 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                scrolled
                  ? 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  : 'border-white/30 text-white/80 hover:border-white/50'
              }`}
              aria-label={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              {lang === 'es' ? 'EN' : 'ES'}
            </button>

            {/* Business partner login — visible on desktop only */}
            <a
              href="/business/login"
              className={`hidden md:inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                scrolled
                  ? 'text-neutral-500 hover:text-secondary-700'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {t('nav.business.login')}{' '}
              <span className={`font-semibold ${scrolled ? 'text-secondary-700' : 'text-white/80'}`}>{t('nav.business.login.cta')}</span>
            </a>

            <a
              href="#download"
              className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                scrolled
                  ? 'bg-primary-700 text-white hover:bg-primary-800'
                  : 'bg-white text-primary-700 hover:bg-white/90'
              }`}
            >
              <Download className="h-4 w-4" />
              {t('nav.download')}
            </a>

            <button
              ref={menuBtnRef}
              onClick={() => setMobileOpen(true)}
              className={`md:hidden p-2 transition-colors ${scrolled ? 'text-neutral-600' : 'text-white'}`}
              aria-label={t('nav.menu')}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={() => { setMobileOpen(false); menuBtnRef.current?.focus() }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl mx-3 mb-3 p-6"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={t('nav.menu')}
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-neutral-900">{t('nav.menu')}</span>
                <button
                  ref={closeBtnRef}
                  onClick={() => { setMobileOpen(false); menuBtnRef.current?.focus() }}
                  className="p-2 text-neutral-400 hover:text-neutral-600"
                  aria-label={t('a11y.close')}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-1" aria-label={t('nav.menu')}>
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => { setMobileOpen(false); menuBtnRef.current?.focus() }}
                    className="block py-3 text-2xl font-medium text-neutral-900 hover:text-primary-700 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-6 border-t border-neutral-100 flex flex-col gap-3">
                <button
                  onClick={toggle}
                  className="text-sm font-medium text-neutral-500 self-start"
                >
                  {lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
                </button>
                <a
                  href="#download"
                  onClick={() => { setMobileOpen(false); menuBtnRef.current?.focus() }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-700 text-white font-semibold rounded-full hover:bg-primary-800 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  {t('nav.download')}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
