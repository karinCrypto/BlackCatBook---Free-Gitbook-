'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client'
import { useT } from '@/lib/i18n'
import LangSwitcher from '@/components/layout/LangSwitcher'

export default function LoginForm() {
  const tr = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabaseReady = isSupabaseConfigured()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabaseReady) { router.push('/dashboard'); return }
    setLoading(true); setError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/dashboard'); router.refresh()
    } catch {
      setError(tr('auth.login.error')); setLoading(false)
    }
  }

  async function handleGoogle() {
    if (!supabaseReady) { router.push('/dashboard'); return }
    try {
      const supabase = createClient()
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback` } })
    } catch {
      setError(tr('auth.login.googleError'))
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid var(--border)', background: 'var(--bg-secondary)',
    color: 'var(--text)', fontSize: '0.875rem', outline: 'none',
  }

  return (
    <div style={{ padding: 32, borderRadius: 16, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <LangSwitcher />
      </div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, textAlign: 'center', color: 'var(--text)' }}>
        {tr('auth.login.title')}
      </h2>
      <div style={{ marginBottom: 20, padding: '10px 14px', borderRadius: 10, background: 'var(--accent-light)', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--accent-text)', textAlign: 'center' }}>
        {tr('auth.login.freebanner')}
      </div>
      <button onClick={() => router.push('/dashboard')}
        style={{ width: '100%', padding: '12px 0', borderRadius: 12, background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', marginBottom: 16 }}>
        {tr('auth.login.freeBtn')}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{tr('auth.login.orLogin')}</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>
      <button onClick={handleGoogle}
        style={{ width: '100%', padding: '11px 0', borderRadius: 12, fontWeight: 600, fontSize: '0.875rem', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', background: 'var(--bg-tertiary)', color: 'var(--text)', border: '1px solid var(--border)', opacity: supabaseReady ? 1 : 0.5 }}>
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {tr('auth.login.google')} {!supabaseReady && tr('auth.login.googleDisabled')}
      </button>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div style={{ fontSize: '0.82rem', padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#dc2626' }}>{error}</div>}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>{tr('auth.login.email')}</label>
          <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>{tr('auth.login.password')}</label>
          <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading}
          style={{ padding: '11px 0', borderRadius: 12, border: 'none', background: supabaseReady ? 'var(--accent)' : 'var(--bg-tertiary)', color: supabaseReady ? 'white' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? tr('auth.login.btnLoading') : supabaseReady ? tr('auth.login.btn') : tr('auth.login.btnDisabled')}
        </button>
      </form>
      <p style={{ textAlign: 'center', fontSize: '0.82rem', marginTop: 16, color: 'var(--text-faint)' }}>
        {tr('auth.login.noAccount')}{' '}
        <Link href="/register" style={{ fontWeight: 600, color: 'var(--accent-text)' }}>{tr('common.register')}</Link>
      </p>
    </div>
  )
}
