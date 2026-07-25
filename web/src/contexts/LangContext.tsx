import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations } from '../i18n/translations'

type Lang = 'es' | 'en'

interface LangContextType {
  lang: Lang
  toggle: () => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextType | null>(null)

function getInitialLang(): Lang {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('boliviaexperience-lang')
    if (stored === 'es' || stored === 'en') return stored
  }
  return 'es'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getInitialLang)

  const toggle = () => setLang(l => {
    const next = l === 'es' ? 'en' : 'es'
    localStorage.setItem('boliviaexperience-lang', next)
    return next
  })

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const t = (key: string) => (translations[lang] as Record<string, string>)[key] ?? key

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
