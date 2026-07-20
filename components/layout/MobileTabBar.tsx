'use client'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { usePlan } from '@/lib/firebase/premium'
import FontSizeControl from './FontSizeControl'
import LangSwitcher from './LangSwitcher'

// 모바일 하단 탭바 — 768px 미만에서만 표시 (globals.css .bcb-mobile-tabbar)
// 헤더에서 잘리는 요소들(계정·플랜·글자크기·언어·로그아웃)은 "내정보" 시트에 담는다
export default function MobileTabBar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { plan } = usePlan()
  const [meOpen, setMeOpen] = useState(false)

  const tabs = [
    { icon: '🏠', label: '홈', onClick: () => { setMeOpen(false); router.push('/dashboard') }, active: pathname === '/dashboard' },
    { icon: '💎', label: '요금제', onClick: () => { setMeOpen(false); router.push('/pricing') }, active: pathname === '/pricing' },
    { icon: '❓', label: '도움말', onClick: () => { window.location.href = '/notes/' }, active: false },
    { icon: '👤', label: '내정보', onClick: () => setMeOpen(o => !o), active: meOpen },
  ]

  return (
    <>
      {meOpen && (
        <div className="bcb-mobile-tabbar" onClick={() => setMeOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 149, background: 'rgba(0,0,0,.45)' }} />
      )}
      {meOpen && (
        <div className="bcb-mobile-tabbar"
          style={{ position: 'fixed', left: 0, right: 0, bottom: 64, zIndex: 151,
            flexDirection: 'column', gap: 14, padding: '20px 20px 16px',
            background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)',
            borderRadius: '20px 20px 0 0', boxShadow: '0 -10px 40px rgba(0,0,0,.3)' }}>
          {/* 계정 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.displayName || user?.email || '게스트'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {plan === 'premium' ? '✨ 프리미엄 구독 중' : '무료 플랜'}
              </div>
            </div>
            {plan !== 'premium' && (
              <button onClick={() => { setMeOpen(false); router.push('/pricing') }}
                style={{ padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: '#f43f5e', color: 'white', fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                업그레이드
              </button>
            )}
          </div>
          {/* 설정들 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>글자 크기</span>
            <FontSizeControl />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>언어</span>
            <LangSwitcher />
          </div>
          <button onClick={() => { void logout().then(() => router.push('/login')) }}
            style={{ padding: '11px 0', borderRadius: 12, border: '1px solid var(--border)', cursor: 'pointer',
              background: 'var(--bg)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem' }}>
            🚪 로그아웃
          </button>
        </div>
      )}
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
    </>
  )
}
