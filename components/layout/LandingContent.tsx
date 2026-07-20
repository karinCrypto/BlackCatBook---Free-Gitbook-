'use client'
import Link from 'next/link'
import { useT } from '@/lib/i18n'

export default function LandingContent() {
  const tr = useT()

  const features = [
    { icon: '🌑', title: 'Dark Mode First', desc: tr('landing.feat.darkmode.desc') },
    { icon: '✍️', title: 'Markdown', desc: tr('landing.feat.markdown.desc') },
    { icon: '🐆', title: 'Fast Search', desc: tr('landing.feat.search.desc') },
    { icon: '🔍', title: 'SEO', desc: tr('landing.feat.seo.desc') },
    { icon: '🤖', title: 'AI Writing', desc: tr('landing.feat.ai.desc'), soon: true },
    { icon: '🔐', title: 'Team', desc: tr('landing.feat.team.desc') },
    { icon: '📁', title: 'Workspace', desc: tr('landing.feat.workspace.desc') },
    { icon: '🚀', title: 'Vercel Deploy', desc: tr('landing.feat.deploy.desc') },
  ]

  return (
    <>
      {/* 히어로 — 아기 검은고양이 사진의 소프트 핑크 + 블랙 톤 */}
      <section className="flex flex-col items-center justify-center text-center pt-36 pb-20 px-6"
        style={{ background: 'linear-gradient(180deg, #FFD9DF 0%, #FFE6EA 68%, var(--bg) 100%)' }}>
        <img src="/logo.png" alt="BlackCatBook 로고"
          style={{ width: 132, height: 132, objectFit: 'contain', marginBottom: 20, borderRadius: 32, boxShadow: '0 18px 44px rgba(31,17,20,0.18)' }} />
        <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight" style={{ color: '#1F1114' }}>
          {tr('landing.hero.title1')}<br />
          <span style={{ color: '#E85D75' }}>BlackCatBook</span>
        </h1>
        <p className="text-xl max-w-2xl mb-10 whitespace-pre-line" style={{ color: '#6B4C52' }}>
          {tr('landing.hero.desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard" className="px-8 py-4 rounded-xl text-base font-bold transition-all hover:scale-105"
            style={{ background: '#1F1114', color: '#FFD9DF', boxShadow: '0 12px 30px rgba(31,17,20,0.25)' }}>
            {tr('landing.cta.start')}
          </Link>
          <Link href="/login" className="px-8 py-4 rounded-xl text-base font-semibold"
            style={{ background: 'rgba(255,255,255,0.8)', color: '#1F1114', border: '1px solid rgba(31,17,20,0.12)' }}>
            {tr('common.login')}
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f) => (
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
          <img src="/logo-black.png" alt="" style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', margin: '0 auto 16px', display: 'block' }} />
          <h2 className="text-2xl font-black mb-3" style={{ color: 'var(--text)' }}>{tr('landing.cta2.title')}</h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>{tr('landing.cta2.desc')}</p>
          <Link href="/dashboard" className="block w-full py-3 rounded-xl font-bold text-center transition-all hover:opacity-90"
            style={{ background: 'var(--accent)', color: 'white' }}>
            {tr('landing.cta2.btn')}
          </Link>
        </div>
      </section>

      <footer className="text-center py-8 text-sm" style={{ color: 'var(--text-faint)', borderTop: '1px solid var(--border)' }}>
        {tr('landing.footer')}
      </footer>
    </>
  )
}
