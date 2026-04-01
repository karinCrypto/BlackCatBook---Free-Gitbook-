import Link from 'next/link'
import LangSwitcher from '@/components/layout/LangSwitcher'
import LandingContent from '@/components/layout/LandingContent'

export default function LandingPage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--header-bg)' }}
        className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center px-6">
        <div className="flex items-center gap-2 flex-1">
          <img src="/logo.png" alt="BlackCatBook" style={{ width:32, height:32, objectFit:'contain' }} />
          <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>BlackCatBook</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full ml-1"
            style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}>v1.0</span>
        </div>
        <div className="flex items-center gap-3">
          <LangSwitcher />
          <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            로그인
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold px-4 py-2 rounded-lg" style={{ background: 'var(--accent)', color: 'white' }}>
            무료 시작
          </Link>
        </div>
      </header>
      <LandingContent />
    </main>
  )
}
