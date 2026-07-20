'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase/client'
import { useT } from '@/lib/i18n'
import LangSwitcher from '@/components/layout/LangSwitcher'

function friendlyError(code: string, fallback: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return '이메일 또는 비밀번호가 올바르지 않습니다.'
    case 'auth/invalid-email':
      return '이메일 형식이 올바르지 않습니다.'
    case 'auth/too-many-requests':
      return '시도가 너무 많습니다. 잠시 후 다시 시도해주세요.'
    default:
      return fallback
  }
}

export default function LoginForm() {
  const tr = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetMsg, setResetMsg] = useState('')
  const [phone, setPhone] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [confirmRes, setConfirmRes] = useState<ConfirmationResult | null>(null)
  const [phoneLoading, setPhoneLoading] = useState(false)
  const router = useRouter()
  const authReady = isFirebaseConfigured()

  async function handleSendCode() {
    setError(''); setResetMsg('')
    const raw = phone.replace(/[^0-9+]/g, '')
    if (!raw) { setError('휴대폰 번호를 입력해주세요. 예) 010-1234-5678'); return }
    // 한국 번호를 국제형식(E.164)으로 변환
    const e164 = raw.startsWith('+') ? raw : '+82' + raw.replace(/^0/, '')
    setPhoneLoading(true)
    try {
      const w = window as unknown as { _bcbRecaptcha?: RecaptchaVerifier }
      if (!w._bcbRecaptcha) {
        w._bcbRecaptcha = new RecaptchaVerifier(auth, 'bcb-recaptcha', { size: 'invisible' })
      }
      const res = await signInWithPhoneNumber(auth, e164, w._bcbRecaptcha)
      setConfirmRes(res)
      setResetMsg('📱 인증번호를 문자로 보냈어요. 6자리 숫자를 입력해주세요.')
    } catch (err) {
      const code = (err as { code?: string })?.code || ''
      if (code === 'auth/invalid-phone-number') setError('휴대폰 번호 형식이 올바르지 않습니다.')
      else if (code === 'auth/too-many-requests') setError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.')
      else setError('인증번호 발송에 실패했습니다. (' + code + ')')
    } finally { setPhoneLoading(false) }
  }

  async function handleVerifyCode() {
    if (!confirmRes) return
    setError('')
    try {
      await confirmRes.confirm(smsCode.trim())
      router.push('/dashboard'); router.refresh()
    } catch {
      setError('인증번호가 올바르지 않습니다. 다시 확인해주세요.')
    }
  }

  async function handleReset() {
    setError(''); setResetMsg('')
    if (!email.trim()) { setError('비밀번호를 재설정할 이메일을 먼저 입력해주세요.'); return }
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setResetMsg(`📬 ${email.trim()} 로 비밀번호 재설정 메일을 보냈어요. 받은편지함(스팸함 포함)을 확인해주세요.`)
    } catch (err) {
      const code = (err as { code?: string })?.code || ''
      if (code === 'auth/user-not-found') setError('가입되지 않은 이메일입니다. 구글로 가입하셨다면 위의 구글 로그인을 이용해주세요.')
      else if (code === 'auth/invalid-email') setError('이메일 형식이 올바르지 않습니다.')
      else setError('재설정 메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!authReady) { router.push('/dashboard'); return }
    setLoading(true); setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/dashboard'); router.refresh()
    } catch (err) {
      const code = (err as { code?: string })?.code || ''
      setError(friendlyError(code, tr('auth.login.error')))
      setLoading(false)
    }
  }

  async function handleGoogle() {
    if (!authReady) { router.push('/dashboard'); return }
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      router.push('/dashboard'); router.refresh()
    } catch (err) {
      const code = (err as { code?: string })?.code || ''
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError(tr('auth.login.googleError'))
      }
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
        ☁️ 로그인하면 모든 문서가 클라우드에 안전하게 저장돼요
      </div>
      <button onClick={handleGoogle}
        style={{ width: '100%', padding: '11px 0', borderRadius: 12, fontWeight: 600, fontSize: '0.875rem', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', background: 'var(--bg-tertiary)', color: 'var(--text)', border: '1px solid var(--border)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {tr('auth.login.google')}
      </button>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div style={{ fontSize: '0.82rem', padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#dc2626' }}>{error}</div>}
        {resetMsg && <div style={{ fontSize: '0.82rem', padding: '10px 14px', borderRadius: 8, background: '#f0fdf4', color: '#16a34a' }}>{resetMsg}</div>}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>{tr('auth.login.email')}</label>
          <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>{tr('auth.login.password')}</label>
          <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading}
          style={{ padding: '11px 0', borderRadius: 12, border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? tr('auth.login.btnLoading') : tr('auth.login.btn')}
        </button>
      </form>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>또는 휴대폰으로 로그인</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>
      {!confirmRes ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ ...inputStyle, flex: 1 }} type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="010-1234-5678" />
          <button type="button" onClick={handleSendCode} disabled={phoneLoading}
            style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', opacity: phoneLoading ? 0.6 : 1 }}>
            {phoneLoading ? '전송 중...' : '인증번호 받기'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ ...inputStyle, flex: 1, letterSpacing: 4, textAlign: 'center' }} type="text" inputMode="numeric" maxLength={6}
            value={smsCode} onChange={e => setSmsCode(e.target.value)} placeholder="123456" />
          <button type="button" onClick={handleVerifyCode}
            style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            확인
          </button>
          <button type="button" onClick={() => { setConfirmRes(null); setSmsCode('') }}
            style={{ padding: '10px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            재입력
          </button>
        </div>
      )}
      <div id="bcb-recaptcha" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <button type="button" onClick={handleReset}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-faint)', textDecoration: 'underline', padding: 0 }}>
          비밀번호를 잊으셨나요?
        </button>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>아이디는 가입한 이메일이에요</span>
      </div>
      <p style={{ textAlign: 'center', fontSize: '0.82rem', marginTop: 12, color: 'var(--text-faint)' }}>
        {tr('auth.login.noAccount')}{' '}
        <Link href="/register" style={{ fontWeight: 600, color: 'var(--accent-text)' }}>{tr('common.register')}</Link>
      </p>
    </div>
  )
}
