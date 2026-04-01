'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client'
import { useT } from '@/lib/i18n'
import LangSwitcher from '@/components/layout/LangSwitcher'

export default function RegisterForm() {
  const tr = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabaseReady = isSupabaseConfigured()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabaseReady) { router.push('/dashboard'); return }
    setLoading(true); setError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${location.origin}/auth/callback` } })
      if (error) { setError(error.message); setLoading(false); return }
      setDone(true)
    } catch {
      setError(tr('auth.register.error')); setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid var(--border)', background: 'var(--bg-secondary)',
    color: 'var(--text)', fontSize: '0.875rem', outline: 'none',
  }

  if (done) return (
    <div style={{ padding: 32, borderRadius: 16, textAlign: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>{tr('auth.register.done.title')}</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{email} {tr('auth.register.done.desc')}</p>
    </div>
  )

  return (
    <div style={{ padding: 32, borderRadius: 16, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <LangSwitcher />
      </div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, textAlign: 'center', color: 'var(--text)' }}>
        {tr('auth.register.title')}
      </h2>
      <div style={{ marginBottom: 20, padding: '10px 14px', borderRadius: 10, background: 'var(--accent-light)', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--accent-text)', textAlign: 'center' }}>
        {tr('auth.register.freebanner')}
      </div>
      <button onClick={() => router.push('/dashboard')}
        style={{ width: '100%', padding: '12px 0', borderRadius: 12, background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', marginBottom: 16 }}>
        {tr('auth.register.freeBtn')}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{tr('auth.register.orCreate')}</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div style={{ fontSize: '0.82rem', padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#dc2626' }}>{error}</div>}
        {!supabaseReady && (
          <div style={{ fontSize: '0.78rem', padding: '10px 14px', borderRadius: 8, background: 'var(--bg-tertiary)', color: 'var(--text-faint)', textAlign: 'center' }}>
            {tr('auth.register.supabaseNote')}
          </div>
        )}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>{tr('auth.register.name')}</label>
          <input style={inputStyle} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Hong Gildong" disabled={!supabaseReady} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>{tr('auth.register.email')}</label>
          <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" disabled={!supabaseReady} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>{tr('auth.register.password')}</label>
          <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={tr('auth.register.passwordHint')} minLength={8} disabled={!supabaseReady} />
        </div>
        <button type="submit" disabled={loading || !supabaseReady}
          style={{ padding: '11px 0', borderRadius: 12, border: 'none', background: supabaseReady ? 'var(--accent)' : 'var(--bg-tertiary)', color: supabaseReady ? 'white' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.875rem', cursor: supabaseReady ? 'pointer' : 'default', opacity: loading ? 0.6 : 1 }}>
          {loading ? tr('auth.register.btnLoading') : tr('auth.register.btn')}
        </button>
      </form>
      <p style={{ textAlign: 'center', fontSize: '0.82rem', marginTop: 16, color: 'var(--text-faint)' }}>
        {tr('auth.register.haveAccount')}{' '}
        <Link href="/login" style={{ fontWeight: 600, color: 'var(--accent-text)' }}>{tr('common.login')}</Link>
      </p>
    </div>
  )
}
