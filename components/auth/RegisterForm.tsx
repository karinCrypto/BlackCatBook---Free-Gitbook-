'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase/client'
import { useT } from '@/lib/i18n'
import LangSwitcher from '@/components/layout/LangSwitcher'

function friendlyError(code: string, fallback: string): string {
  switch (code) {
    case 'auth/email-already-in-use': return '이미 가입된 이메일입니다. 로그인해주세요.'
    case 'auth/invalid-email': return '이메일 형식이 올바르지 않습니다.'
    case 'auth/weak-password': return '비밀번호는 8자 이상으로 설정해주세요.'
    default: return fallback
  }
}

export default function RegisterForm() {
  const tr = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabaseReady = isFirebaseConfigured()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabaseReady) { router.push('/dashboard'); return }
    setLoading(true); setError('')
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() })
      // Firebase는 이메일 인증 대기 없이 즉시 로그인 상태 — 바로 대시보드로
      router.push('/dashboard'); router.refresh()
    } catch (err) {
      const code = (err as { code?: string })?.code || ''
      setError(friendlyError(code, tr('auth.register.error')))
      setLoading(false)
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
        ☁️ 가입하면 모든 문서가 클라우드에 안전하게 저장돼요
      </div>
      <button onClick={async () => {
        setError('')
        try {
          await signInWithPopup(auth, googleProvider)
          router.push('/dashboard'); router.refresh()
        } catch (err) {
          const code = (err as { code?: string })?.code || ''
          if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') setError(tr('auth.register.error'))
        }
      }}
        style={{ width: '100%', padding: '11px 0', borderRadius: 12, fontWeight: 600, fontSize: '0.875rem', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', background: 'var(--bg-tertiary)', color: 'var(--text)', border: '1px solid var(--border)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        구글로 가입하기
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{tr('auth.register.orCreate')}</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div style={{ fontSize: '0.82rem', padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#dc2626' }}>{error}</div>}
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
