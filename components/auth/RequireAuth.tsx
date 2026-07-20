'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

// 로그인 필수 가드 — 미로그인 시 /login으로 보낸다
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <img src="/logo-black.png" alt="" style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover' }} />
        로딩 중...
      </div>
    )
  }

  return <>{children}</>
}
