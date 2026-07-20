'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { usePlan } from '@/lib/firebase/premium'

// 대시보드 우상단 로그인 상태 칩 — 로그인 시 클라우드 백업 동작 중임을 보여준다
export default function UserChip() {
  const { user, loading, logout } = useAuth()
  const { plan } = usePlan()
  const router = useRouter()

  if (loading) return null

  const chipStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '6px 12px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600,
    background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-muted)',
    whiteSpace: 'nowrap', maxWidth: '100%',
  }

  if (!user) {
    return (
      <button onClick={() => router.push('/login')} style={{ ...chipStyle, cursor: 'pointer' }}>
        ☁️ 로그인하고 클라우드 백업
      </button>
    )
  }

  return (
    <span style={chipStyle}>
      <span title="클라우드 백업 동작 중" style={{ color: '#22c55e', flexShrink: 0 }}>●</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>
        {user.displayName || user.email}
      </span>
      {plan === 'premium' ? (
        <span style={{ background: '#f43f5e', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '2px 7px', borderRadius: 100, whiteSpace: 'nowrap', flexShrink: 0 }}>PRO</span>
      ) : (
        <button onClick={() => router.push('/pricing')}
          style={{ background: 'none', border: '1px solid #f43f5e', color: '#f43f5e', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
          업그레이드
        </button>
      )}
      <button onClick={() => { void logout() }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '0.75rem', padding: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
        로그아웃
      </button>
    </span>
  )
}
