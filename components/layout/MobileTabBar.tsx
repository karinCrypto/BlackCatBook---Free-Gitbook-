'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

// 모바일 하단 탭바 — 768px 미만에서만 표시 (globals.css .bcb-mobile-tabbar)
export default function MobileTabBar() {
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useAuth()

  const tabs = [
    { icon: '🏠', label: '홈', onClick: () => router.push('/dashboard'), active: pathname === '/dashboard' },
    { icon: '📔', label: '노트도구', onClick: () => { window.location.href = '/notes/' }, active: false },
    { icon: '💎', label: '요금제', onClick: () => router.push('/pricing'), active: pathname === '/pricing' },
    { icon: '🚪', label: '로그아웃', onClick: () => { void logout().then(() => router.push('/login')) }, active: false },
  ]

  return (
    <nav className="bcb-mobile-tabbar"
      style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 150,
        background: 'var(--header-bg)', borderTop: '1px solid var(--border)',
        justifyContent: 'space-around', alignItems: 'center',
        paddingTop: 8, paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>
      {tabs.map(t => (
        <button key={t.label} onClick={t.onClick}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px 10px',
            color: t.active ? 'var(--accent-text)' : 'var(--text-muted)' }}>
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{ fontSize: '0.62rem', fontWeight: 700 }}>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
