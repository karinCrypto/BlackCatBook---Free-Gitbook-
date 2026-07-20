'use client'
import { useAuth } from '@/components/auth/AuthProvider'
import { usePlan, FREE_LIMITS } from '@/lib/firebase/premium'

// 결제 링크: 결제사(토스페이먼츠/Stripe) 연동 후 환경변수로 주입
const PAYMENT_LINK = process.env.NEXT_PUBLIC_PREMIUM_PAYMENT_LINK || ''

const FREE_FEATURES = [
  `워크스페이스 ${FREE_LIMITS.workspaces}개`,
  `워크스페이스당 문서 ${FREE_LIMITS.pagesPerWorkspace}개`,
  '클라우드 자동 백업',
  '구글 · 이메일 · 휴대폰 로그인',
]

const PREMIUM_FEATURES = [
  '워크스페이스 무제한',
  '문서 무제한',
  'AI 글쓰기 도우미 우선 사용',
  'PDF 라이브러리 무제한',
  '신기능 우선 체험',
]

export default function PricingPage() {
  const { user } = useAuth()
  const { plan } = usePlan()

  function subscribe() {
    if (!PAYMENT_LINK) {
      alert('결제 시스템 오픈 준비 중이에요! 곧 프리미엄 구독이 열립니다 🐱')
      return
    }
    // 결제 페이지에 uid를 전달해 웹훅에서 프리미엄 부여에 사용
    const url = PAYMENT_LINK + (PAYMENT_LINK.includes('?') ? '&' : '?') + 'client_reference_id=' + (user?.uid || '')
    window.open(url, '_blank')
  }

  const card: React.CSSProperties = {
    flex: 1, minWidth: 260, maxWidth: 360, padding: 28, borderRadius: 20,
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', gap: 0,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '48px 24px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
        <a href="/dashboard" style={{ textDecoration: 'none' }}>
          <img src="/logo.png" alt="BlackCatBook" style={{ width: 64, height: 64, objectFit: 'contain', margin: '0 auto 12px', display: 'block' }} />
        </a>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', marginBottom: 8 }}>요금제</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 36 }}>
          기록은 무료로, 무제한은 프리미엄으로 🐾
        </p>

        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', textAlign: 'left' }}>
          {/* FREE */}
          <div style={card}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>무료</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', marginBottom: 18 }}>₩0<span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-faint)' }}> /월</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {FREE_FEATURES.map(f => (
                <li key={f} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>✓ {f}</li>
              ))}
            </ul>
            <div style={{ marginTop: 22, padding: '11px 0', borderRadius: 12, textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              {plan === 'free' ? '현재 이용 중' : '기본 플랜'}
            </div>
          </div>

          {/* PREMIUM */}
          <div style={{ ...card, border: '2px solid #f43f5e', position: 'relative' }}>
            <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#f43f5e', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '3px 12px', borderRadius: 100 }}>
              🐱 추천
            </span>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f43f5e', marginBottom: 6 }}>프리미엄</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', marginBottom: 18 }}>₩4,900<span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-faint)' }}> /월</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {PREMIUM_FEATURES.map(f => (
                <li key={f} style={{ fontSize: '0.85rem', color: 'var(--text)' }}>✓ {f}</li>
              ))}
            </ul>
            {plan === 'premium' ? (
              <div style={{ marginTop: 22, padding: '11px 0', borderRadius: 12, textAlign: 'center', fontWeight: 800, fontSize: '0.85rem', background: '#f43f5e', color: 'white' }}>
                ✨ 구독 중 — 감사합니다!
              </div>
            ) : (
              <button onClick={subscribe}
                style={{ marginTop: 22, padding: '12px 0', borderRadius: 12, border: 'none', background: '#f43f5e', color: 'white', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}>
                프리미엄 구독하기
              </button>
            )}
          </div>
        </div>

        <p style={{ marginTop: 28, fontSize: '0.75rem', color: 'var(--text-faint)' }}>
          구독은 언제든 해지할 수 있어요. 결제 관련 문의: karin.blockdev@gmail.com
        </p>
      </div>
    </div>
  )
}
