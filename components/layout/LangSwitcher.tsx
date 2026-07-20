'use client'
import { useState, useEffect } from 'react'
import { getLang, setLang, type Lang } from '@/lib/i18n'

const LABELS: Record<Lang, string> = { ko: '🌐 한국어', en: '🌐 English', ja: '🌐 日本語', zh: '🌐 中文' }

// 콤팩트 언어 드롭다운 — 공간을 거의 차지하지 않는다
export default function LangSwitcher() {
  const [lang, setLangState] = useState<Lang>('ko')

  useEffect(() => {
    setLangState(getLang())
  }, [])

  return (
    <select value={lang} onChange={e => setLang(e.target.value as Lang)} title="언어 / Language"
      style={{ padding: '5px 6px', borderRadius: 8, border: '1px solid var(--border)',
        background: 'var(--bg-tertiary)', color: 'var(--text-muted)',
        fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', outline: 'none', maxWidth: 96 }}>
      {(Object.keys(LABELS) as Lang[]).map(l => (
        <option key={l} value={l}>{LABELS[l]}</option>
      ))}
    </select>
  )
}
