import Link from 'next/link'

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
          <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>로그인</Link>
          <Link href="/dashboard" className="text-sm font-semibold px-4 py-2 rounded-lg" style={{ background: 'var(--accent)', color: 'white' }}>무료 시작</Link>
        </div>
      </header>

      <section className="flex flex-col items-center justify-center text-center pt-40 pb-24 px-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
          style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', border: '1px solid var(--border)' }}>
          🦇 AI 글쓰기 기능 출시 예정
        </div>
        <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight" style={{ color: 'var(--text)' }}>
          문서화의 새로운 기준,<br />
          <span style={{ color: 'var(--accent)' }}>BlackCatBook</span>
        </h1>
        <p className="text-xl max-w-2xl mb-10" style={{ color: 'var(--text-muted)' }}>
          기술 문서, 블로그, 포트폴리오를 하나의 플랫폼에서.
          마크다운, 리치 에디터, AI 자동 정리까지 모두 지원합니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard" className="px-8 py-4 rounded-xl text-base font-bold transition-all hover:scale-105"
            style={{ background: 'var(--accent)', color: 'white', boxShadow: 'var(--shadow-lg)' }}>
            무료로 시작하기 →
          </Link>
          <Link href="/login" className="px-8 py-4 rounded-xl text-base font-semibold"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text)', border: '1px solid var(--border)' }}>
            로그인
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: '🌑', title: 'Dark Mode First', desc: '다크 테마 기본 제공. 5가지 테마 완벽 커스터마이징.' },
          { icon: '✍️', title: 'Markdown 지원', desc: 'Markdown 작성 → 즉시 퍼블리시. 리치 에디터도 제공.' },
          { icon: '🐆', title: '빠른 검색', desc: '스마트 인덱싱으로 원하는 정보를 즉시 탐색.' },
          { icon: '🔍', title: 'SEO 자동화', desc: '메타태그, JSON-LD 스키마 자동 생성.' },
          { icon: '🤖', title: 'AI 글쓰기', desc: 'AI가 문서를 자동 정리·요약·초안 생성. (출시 예정)', soon: true },
          { icon: '🔐', title: '팀 협업', desc: '멀티 유저, 역할 기반 권한, 퍼블릭/프라이빗 워크스페이스.' },
          { icon: '📁', title: '워크스페이스', desc: '기술 문서·블로그·포트폴리오 타입별 최적화.' },
          { icon: '🚀', title: 'Vercel 배포', desc: '코드 푸시만으로 자동 배포. 전 세계 CDN 빠른 속도.' },
        ].map((f) => (
          <div key={f.title} className="p-5 rounded-2xl relative"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            {f.soon && (
              <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}>Soon</span>
            )}
            <div className="text-3xl mb-3">{f.icon}</div>
            <div className="font-bold mb-1" style={{ color: 'var(--text)' }}>{f.title}</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{f.desc}</div>
          </div>
        ))}
      </section>

      <section className="text-center pb-24 px-6">
        <div className="inline-block p-10 rounded-3xl max-w-lg w-full"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="text-4xl mb-4">🦇</div>
          <h2 className="text-2xl font-black mb-3" style={{ color: 'var(--text)' }}>지금 바로 시작하세요</h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>무료 플랜으로 시작 · 신용카드 불필요</p>
          <Link href="/dashboard" className="block w-full py-3 rounded-xl font-bold text-center transition-all hover:opacity-90"
            style={{ background: 'var(--accent)', color: 'white' }}>
            무료 계정 만들기
          </Link>
        </div>
      </section>

      <footer className="text-center py-8 text-sm" style={{ color: 'var(--text-faint)', borderTop: '1px solid var(--border)' }}>
        © 2026 BlackCatBook · 모든 권리 보유
      </footer>
    </main>
  )
}
