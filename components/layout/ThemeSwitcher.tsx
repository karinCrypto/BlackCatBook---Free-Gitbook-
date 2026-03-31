'use client'
import { useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

const THEMES = [
  { id: 'glacier', label: 'Glacier', colors: ['#fff', '#3b82f6'] },
  { id: 'midnight', label: 'Midnight', colors: ['#1e293b', '#818cf8'] },
  { id: 'forest', label: 'Forest', colors: ['#0d1f0f', '#22c55e'] },
  { id: 'sakura', label: 'Sakura', colors: ['#fff1f2', '#f43f5e'] },
  { id: 'slate', label: 'Slate', colors: ['#f1f5f9', '#475569'] },
]

export default function ThemeSwitcher({ currentTheme }: { currentTheme: string }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(currentTheme)
  async function setTheme(themeId: string) {
    document.documentElement.setAttribute('data-theme', themeId)
    setActive(themeId)
    setOpen(false)
    localStorage.setItem('bbb-theme', themeId)
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient()
        const uid = (await supabase.auth.getUser()).data.user?.id
        if (uid) await supabase.from('profiles').update({ preferred_theme: themeId }).eq('id', uid)
      } catch { /* ignore if not configured */ }
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
      {open && (
        <div className="mb-2 p-3 rounded-2xl flex flex-col gap-2"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', minWidth: 160 }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-faint)' }}>테마 선택</p>
          {THEMES.map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg w-full text-left text-sm font-medium transition-colors"
              style={{
                background: active === t.id ? 'var(--accent-light)' : 'transparent',
                color: active === t.id ? 'var(--accent-text)' : 'var(--text-muted)',
                border: active === t.id ? '1.5px solid var(--accent)' : '1.5px solid transparent',
              }}>
              <span className="w-5 h-5 rounded-full flex-shrink-0" style={{
                background: `linear-gradient(135deg, ${t.colors[0]} 50%, ${t.colors[1]} 50%)`,
                border: '1px solid var(--border)',
              }} />
              {t.label}
            </button>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(o => !o)}
        className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110"
        style={{ background: 'var(--accent)', color: 'white', boxShadow: 'var(--shadow-lg)', border: 'none', cursor: 'pointer' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M2 12H4M20 12h2M19.07 19.07l-1.41-1.41M5.34 5.34L3.93 3.93M12 2v2M12 20v2"/>
        </svg>
      </button>
    </div>
  )
}
