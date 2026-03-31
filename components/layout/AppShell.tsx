'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import ThemeSwitcher from './ThemeSwitcher'

type Props = {
  children: React.ReactNode
  profile: { display_name?: string; email: string; preferred_theme?: string } | null
  tokenBalance: { balance: number; plan: string } | null
}

export default function AppShell({ children, profile, tokenBalance }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  useEffect(() => {
    const theme = profile?.preferred_theme ?? 'midnight'
    document.documentElement.setAttribute('data-theme', theme)
  }, [profile?.preferred_theme])

  async function signOut() {
    if (isSupabaseConfigured()) {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* HEADER */}
      <header className="site-header flex items-center px-4 gap-3">
        <button onClick={() => setSidebarOpen(o => !o)}
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text-muted)', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text-muted)', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text-muted)', borderRadius: 2 }} />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 flex-1 no-underline">
          <span className="text-xl">🦇</span>
          <span className="font-black text-base hidden sm:block" style={{ color: 'var(--text)' }}>BlackCatBook</span>
        </Link>

        <div className="flex items-center gap-3 ml-auto">
          {tokenBalance && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full hidden sm:inline-flex items-center gap-1"
              style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}>
              ⚡ {tokenBalance.balance.toLocaleString()} 토큰
            </span>
          )}
          <div className="relative group">
            <button className="w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center"
              style={{ background: 'var(--accent)', color: 'white' }}>
              {(profile?.display_name ?? profile?.email ?? 'U')[0].toUpperCase()}
            </button>
            <div className="absolute right-0 top-10 w-48 rounded-xl shadow-lg hidden group-hover:block z-50"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{profile?.display_name}</p>
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{profile?.email}</p>
              </div>
              <Link href="/dashboard" className="block px-3 py-2 text-sm nav-link">대시보드</Link>
              <button onClick={signOut} className="w-full text-left px-3 py-2 text-sm nav-link">로그아웃</button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* MAIN */}
      <div className="flex" style={{ marginTop: 60 }}>
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      <ThemeSwitcher currentTheme={profile?.preferred_theme ?? 'midnight'} />
    </div>
  )
}
