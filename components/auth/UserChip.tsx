'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

// 대시보드 우상단 로그인 상태 칩 — 로그인 시 클라우드 백업 동작 중임을 보여준다
export default function UserChip() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  if (loading) return null

  const chipStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '6px 12px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600,
    background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-muted)',
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
      <span title="클라우드 백업 동작 중" style={{ color: '#22c55e' }}>●</span>
      {user.displayName || user.email}
      <button onClick={() => { void logout() }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '0.75rem', padding: 0 }}>
        로그아웃
      </button>
    </span>
  )
}
