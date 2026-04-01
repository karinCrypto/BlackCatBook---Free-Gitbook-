'use client'
import { useState, useEffect } from 'react'
import { getLang, setLang, type Lang } from '@/lib/i18n'

export default function LangSwitcher() {
  const [lang, setLangState] = useState<Lang>('ko')

  useEffect(() => {
    setLangState(getLang())
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2,
      background: 'var(--bg-tertiary)', borderRadius: 8, padding: 2, border: '1px solid var(--border)' }}>
      {(['ko', 'en'] as Lang[]).map(l => (
        <button key={l} onClick={() => setLang(l)}
          style={{
            padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
            fontSize: '0.78rem', fontWeight: 700,
            background: lang === l ? 'var(--accent)' : 'transparent',
            color: lang === l ? 'white' : 'var(--text-muted)',
            transition: 'all .15s',
          }}>
          {l === 'ko' ? '한' : 'EN'}
        </button>
      ))}
    </div>
  )
}
