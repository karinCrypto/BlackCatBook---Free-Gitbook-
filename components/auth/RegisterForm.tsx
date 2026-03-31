'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client'

export default function RegisterForm() {
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
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name }, emailRedirectTo: `${location.origin}/auth/callback` }
      })
      if (error) { setError(error.message); setLoading(false); return }
      setDone(true)
    } catch {
      setError('회원가입 중 오류가 발생했습니다.')
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
      <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>이메일을 확인하세요!</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{email}로 확인 링크를 보냈어요.</p>
    </div>
  )

  return (
    <div style={{ padding: 32, borderRadius: 16, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, textAlign: 'center', color: 'var(--text)' }}>
        BlackCatBook 시작하기 🐱
      </h2>

      {/* Free mode banner */}
      <div style={{
        marginBottom: 20, padding: '10px 14px', borderRadius: 10,
        background: 'var(--accent-light)', border: '1px solid var(--border)',
        fontSize: '0.82rem', color: 'var(--accent-text)', textAlign: 'center'
      }}>
        로그인 없이도 무료로 사용할 수 있어요
      </div>

      <button
        onClick={() => router.push('/dashboard')}
        style={{
          width: '100%', padding: '12px 0', borderRadius: 12,
          background: 'var(--accent)', color: 'white', border: 'none',
          cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem',
          marginBottom: 16
        }}
      >
        🐱 바로 시작하기 (로그인 불필요)
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>또는 계정 만들기</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && (
          <div style={{ fontSize: '0.82rem', padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#dc2626' }}>
            {error}
          </div>
        )}
        {!supabaseReady && (
          <div style={{ fontSize: '0.78rem', padding: '10px 14px', borderRadius: 8,
            background: 'var(--bg-tertiary)', color: 'var(--text-faint)', textAlign: 'center' }}>
            계정 기능은 Supabase 연동 후 사용 가능합니다
          </div>
        )}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>이름</label>
          <input style={inputStyle} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" disabled={!supabaseReady} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>이메일</label>
          <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" disabled={!supabaseReady} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>비밀번호</label>
          <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="8자 이상" minLength={8} disabled={!supabaseReady} />
        </div>
        <button type="submit" disabled={loading || !supabaseReady}
          style={{
            padding: '11px 0', borderRadius: 12, border: 'none',
            background: supabaseReady ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: supabaseReady ? 'white' : 'var(--text-faint)',
            fontWeight: 700, fontSize: '0.875rem', cursor: supabaseReady ? 'pointer' : 'default',
            opacity: loading ? 0.6 : 1
          }}>
          {loading ? '처리 중...' : '계정 만들기'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '0.82rem', marginTop: 16, color: 'var(--text-faint)' }}>
        이미 계정이 있으신가요?{' '}
        <Link href="/login" style={{ fontWeight: 600, color: 'var(--accent-text)' }}>로그인</Link>
      </p>
    </div>
  )
}
