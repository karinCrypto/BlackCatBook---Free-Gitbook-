'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace, type Workspace } from '@/lib/localStorage/workspaces'
import { getPages } from '@/lib/localStorage/pages'
import { getTheme, setTheme } from '@/lib/localStorage/theme'
import { useT } from '@/lib/i18n'
import LangSwitcher from '@/components/layout/LangSwitcher'

const THEMES = [
  { id: 'glacier', label: 'Glacier', colors: ['#fff','#3b82f6'] },
  { id: 'midnight', label: 'Midnight', colors: ['#1e293b','#818cf8'] },
  { id: 'forest', label: 'Forest', colors: ['#0d1f0f','#22c55e'] },
  { id: 'sakura', label: 'Sakura', colors: ['#fff1f2','#f43f5e'] },
  { id: 'slate', label: 'Slate', colors: ['#f1f5f9','#475569'] },
]

const TYPE_META: Record<string, { gradient: string }> = {
  tech_docs:  { gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
  blog:       { gradient: 'linear-gradient(135deg,#f43f5e,#fb923c)' },
  portfolio:  { gradient: 'linear-gradient(135deg,#a855f7,#ec4899)' },
}

const TYPE_EMOJIS: Record<string, string> = {
  tech_docs: '📖', blog: '✍️', portfolio: '🎨',
}

const EMOJIS = ['📖','✍️','🎨','🚀','💡','🔬','🎵','🌍','⚙️','🦋','🐱','🔥','💎','🌙','🌿']

type Sort = 'recent' | 'name' | 'pages'

export default function DashboardPage() {
  const tr = useT()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [pageCounts, setPageCounts] = useState<Record<string, number>>({})
  const [modal, setModal] = useState(false)
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('tech_docs')
  const [desc, setDesc] = useState('')
  const [wsEmoji, setWsEmoji] = useState('📖')
  const [emojiPicker, setEmojiPicker] = useState(false)
  const [sort, setSort] = useState<Sort>('recent')
  const [search, setSearch] = useState('')
  const [themePanel, setThemePanel] = useState(false)
  const [activeTheme, setActiveTheme] = useState('midnight')
  const renameRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function refresh() {
    const ws = getWorkspaces()
    setWorkspaces(ws)
    const counts: Record<string, number> = {}
    ws.forEach(w => { counts[w.id] = getPages(w.id).filter(p => p.type === 'page').length })
    setPageCounts(counts)
  }

  useEffect(() => {
    refresh()
    const t = getTheme(); setActiveTheme(t)
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  useEffect(() => {
    if (renameId && renameRef.current) renameRef.current.focus()
  }, [renameId])

  function handleCreate() {
    if (!name.trim()) return
    const ws = createWorkspace({ name: name.trim(), type: type as Workspace['type'], theme: activeTheme, description: desc, emoji: wsEmoji } as Parameters<typeof createWorkspace>[0])
    refresh(); setModal(false); setName(''); setDesc(''); setWsEmoji('📖')
    router.push(`/workspace/${ws.id}`)
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    if (!confirm(tr('dashboard.delete.confirm'))) return
    deleteWorkspace(id); refresh()
  }

  function startRename(ws: Workspace, e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    setRenameId(ws.id); setRenameVal(ws.name)
  }

  function commitRename(id: string) {
    if (renameVal.trim()) updateWorkspace(id, { name: renameVal.trim() })
    setRenameId(null); refresh()
  }

  function handleTheme(t: string) { setTheme(t); setActiveTheme(t); setThemePanel(false) }

  const sorted = [...workspaces]
    .filter(ws => ws.name.toLowerCase().includes(search.toLowerCase()) || ws.description?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'pages') return (pageCounts[b.id] || 0) - (pageCounts[a.id] || 0)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const totalPages = Object.values(pageCounts).reduce((s, c) => s + c, 0)

  const inputStyle: React.CSSProperties = {
    width:'100%', padding:'10px 14px', borderRadius:8,
    border:'1px solid var(--border)', background:'var(--bg)',
    color:'var(--text)', fontSize:'0.875rem', outline:'none', marginTop:6,
  }

  const TYPES = [
    { id: 'tech_docs', label: `📖 ${tr('dashboard.type.tech_docs')}`, desc: tr('dashboard.type.tech_docs.desc') },
    { id: 'blog',      label: `✍️ ${tr('dashboard.type.blog')}`,      desc: tr('dashboard.type.blog.desc') },
    { id: 'portfolio', label: `🎨 ${tr('dashboard.type.portfolio')}`,  desc: tr('dashboard.type.portfolio.desc') },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {/* HEADER */}
      <header style={{ height:60, background:'var(--header-bg)', borderBottom:'1px solid var(--border)',
        position:'sticky', top:0, zIndex:50, display:'flex', alignItems:'center', padding:'0 24px', gap:12 }}>
        <img src="/logo.png" alt="BlackCatBook" style={{ width:32, height:32, objectFit:'contain' }} />
        <span style={{ fontWeight:800, fontSize:'1.05rem', color:'var(--text)' }}>BlackCatBook</span>
        <span style={{ fontSize:'0.68rem', fontWeight:700, padding:'2px 8px', borderRadius:20,
          background:'var(--accent-light)', color:'var(--accent-text)' }}>v1.0</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
          <LangSwitcher />
          <Link href="/login" style={{ fontSize:'0.82rem', color:'var(--text-muted)', padding:'6px 12px', borderRadius:8, textDecoration:'none' }}>
            {tr('common.login')}
          </Link>
          <button onClick={() => setModal(true)}
            style={{ fontSize:'0.85rem', fontWeight:700, padding:'8px 16px', borderRadius:8,
              background:'var(--accent)', color:'white', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {tr('dashboard.newWorkspace')}
          </button>
        </div>
      </header>

      <div style={{ maxWidth:1040, margin:'0 auto', padding:'36px 24px 80px' }}>
        {/* HERO */}
        <div style={{ marginBottom:32, display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <h1 style={{ fontSize:'1.8rem', fontWeight:800, color:'var(--text)', marginBottom:4 }}>{tr('dashboard.title')}</h1>
            <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', whiteSpace:'pre-line' }}>{tr('dashboard.subtitle')}</p>
          </div>
          {workspaces.length > 0 && (
            <div style={{ display:'flex', gap:12 }}>
              {[
                { label: tr('dashboard.stat.workspaces'), value: workspaces.length, icon:'🗂️' },
                { label: tr('dashboard.stat.pages'), value: totalPages, icon:'📄' },
              ].map(s => (
                <div key={s.label} style={{ padding:'10px 18px', borderRadius:12,
                  background:'var(--bg-secondary)', border:'1px solid var(--border)', textAlign:'center' }}>
                  <div style={{ fontSize:'1.35rem', fontWeight:800, color:'var(--accent-text)' }}>{s.icon} {s.value}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-faint)', marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {workspaces.length === 0 ? (
          <div>
            <div style={{ textAlign:'center', padding:'80px 24px', borderRadius:20,
              background:'var(--bg-secondary)', border:'2px dashed var(--border)', marginBottom:24 }}>
              <img src="/logo.png" alt="BlackCatBook" style={{ width:160, height:160, objectFit:'contain', display:'block', margin:'0 auto 20px' }} />
              <h2 style={{ color:'var(--text)', fontWeight:800, fontSize:'1.3rem', marginBottom:8 }}>{tr('dashboard.empty.title')}</h2>
              <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', marginBottom:8 }}>{tr('dashboard.empty.desc')}</p>
              <p style={{ color:'var(--text-faint)', fontSize:'0.82rem', marginBottom:28, whiteSpace:'pre-line' }}>{tr('dashboard.subtitle')}</p>
              <button onClick={() => setModal(true)}
                style={{ padding:'12px 28px', borderRadius:12, background:'var(--accent)',
                  color:'white', border:'none', cursor:'pointer', fontWeight:700, fontSize:'0.95rem' }}>
                {tr('dashboard.empty.btn')}
              </button>
            </div>
            <Link href="/notes/"
              style={{ display:'flex', alignItems:'center', gap:16, padding:'20px 24px', borderRadius:16,
                textDecoration:'none', background:'var(--bg-secondary)', border:'1px solid var(--border)',
                transition:'transform .18s, box-shadow .18s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(-2px)'; el.style.boxShadow='var(--shadow-lg)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow='' }}>
              <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#8b5cf6,#06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>🐱</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, fontSize:'1rem', color:'var(--text)', marginBottom:3 }}>BlackCatBook Notes & Tools</div>
                <div style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>리치 에디터 · 꿈 노트 · 감사 일기 · PDF 라이브러리 · 드로잉</div>
              </div>
              <span style={{ fontSize:'0.85rem', color:'var(--accent-text)', fontWeight:700 }}>열기 →</span>
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:200, display:'flex', alignItems:'center', gap:8, padding:'8px 12px',
                borderRadius:10, background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:'var(--text-faint)', flexShrink:0 }}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={tr('dashboard.search.placeholder')}
                  style={{ flex:1, border:'none', background:'transparent', color:'var(--text)', fontSize:'0.875rem', outline:'none' }} />
                {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-faint)', fontSize:16 }}>×</button>}
              </div>
              <div style={{ display:'flex', gap:4 }}>
                {(['recent','name','pages'] as Sort[]).map(s => (
                  <button key={s} onClick={() => setSort(s)}
                    style={{ padding:'8px 14px', borderRadius:10, border:'1px solid var(--border)',
                      background: sort===s ? 'var(--accent-light)' : 'var(--bg-secondary)',
                      color: sort===s ? 'var(--accent-text)' : 'var(--text-muted)',
                      cursor:'pointer', fontSize:'0.8rem', fontWeight:600 }}>
                    {s==='recent' ? tr('dashboard.sort.recent') : s==='name' ? tr('dashboard.sort.name') : tr('dashboard.sort.pages')}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:16 }}>
              {/* Notes & Tools quick-access card */}
              <Link href="/notes/"
                style={{ display:'block', borderRadius:16, textDecoration:'none',
                  background:'var(--bg-secondary)', border:'1px solid var(--border)',
                  overflow:'hidden', transition:'transform .18s, box-shadow .18s', position:'relative' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(-3px)'; el.style.boxShadow='var(--shadow-lg)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow='' }}>
                <div style={{ height:72, background:'linear-gradient(135deg,#8b5cf6,#06b6d4)', display:'flex', alignItems:'center', padding:'0 18px', gap:12 }}>
                  <span style={{ fontSize:28 }}>🐱</span>
                  <span style={{ fontSize:'0.78rem', fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(255,255,255,.22)', color:'white', letterSpacing:'.04em' }}>NOTES & TOOLS</span>
                </div>
                <div style={{ padding:'14px 18px 16px' }}>
                  <div style={{ fontWeight:800, fontSize:'1rem', color:'var(--text)', marginBottom:4 }}>BlackCatBook Notes</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:10 }}>꿈 노트 · 감사 일기 · PDF · 드로잉</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:'0.7rem', fontWeight:700, padding:'3px 8px', borderRadius:20, background:'var(--bg-tertiary)', color:'var(--text-faint)' }}>
                      ✏️ 리치 에디터
                    </span>
                    <span style={{ fontSize:'0.75rem', color:'var(--accent-text)', fontWeight:600 }}>열기 →</span>
                  </div>
                </div>
              </Link>
              {sorted.map(ws => {
                const meta = TYPE_META[ws.type] || TYPE_META.tech_docs
                const emoji = TYPE_EMOJIS[ws.type] || '📖'
                const typeLabel = tr(`dashboard.type.${ws.type}`)
                const pages = pageCounts[ws.id] || 0
                const isRenaming = renameId === ws.id
                return (
                  <Link key={ws.id} href={`/workspace/${ws.id}`}
                    style={{ display:'block', borderRadius:16, textDecoration:'none',
                      background:'var(--bg-secondary)', border:'1px solid var(--border)',
                      overflow:'hidden', transition:'transform .18s, box-shadow .18s', position:'relative' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(-3px)'; el.style.boxShadow='var(--shadow-lg)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow='' }}>
                    <div style={{ height:72, background: meta.gradient, position:'relative', display:'flex', alignItems:'center', padding:'0 18px', gap:12 }}>
                      <span style={{ fontSize:28 }}>{(ws as Workspace & {emoji?:string}).emoji || emoji}</span>
                      <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
                        <button onClick={e => startRename(ws, e)} title={tr('common.rename')}
                          style={{ width:28, height:28, borderRadius:8, border:'none', background:'rgba(255,255,255,.2)', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                        </button>
                        <button onClick={e => handleDelete(ws.id, e)} title={tr('common.delete')}
                          style={{ width:28, height:28, borderRadius:8, border:'none', background:'rgba(255,255,255,.2)', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    </div>
                    <div style={{ padding:'14px 18px 16px' }}>
                      {isRenaming ? (
                        <input ref={renameRef} value={renameVal}
                          onChange={e => setRenameVal(e.target.value)}
                          onBlur={() => commitRename(ws.id)}
                          onKeyDown={e => { if (e.key==='Enter') commitRename(ws.id); if (e.key==='Escape') setRenameId(null) }}
                          onClick={e => e.preventDefault()}
                          style={{ width:'100%', border:'1px solid var(--accent)', borderRadius:6, padding:'4px 8px', background:'var(--bg)', color:'var(--text)', fontSize:'1rem', fontWeight:700, outline:'none' }} />
                      ) : (
                        <div style={{ fontWeight:800, fontSize:'1rem', color:'var(--text)', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {ws.name}
                        </div>
                      )}
                      {ws.description && (
                        <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:10, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {ws.description}
                        </div>
                      )}
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: ws.description ? 0 : 8 }}>
                        <span style={{ fontSize:'0.7rem', fontWeight:700, padding:'3px 8px', borderRadius:20, background:'var(--bg-tertiary)', color:'var(--text-faint)' }}>
                          {emoji} {typeLabel}
                        </span>
                        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.75rem', color:'var(--text-faint)' }}>
                          <span>📄 {pages}{tr('dashboard.pages.count')}</span>
                          <span>{new Date(ws.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
              <button onClick={() => setModal(true)}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  gap:10, borderRadius:16, border:'2px dashed var(--border)', minHeight:156,
                  background:'transparent', color:'var(--text-faint)', cursor:'pointer', transition:'all .15s' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor='var(--accent)'; el.style.color='var(--accent-text)'; el.style.background='var(--accent-light)' }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor='var(--border)'; el.style.color='var(--text-faint)'; el.style.background='transparent' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', border:'2px dashed currentColor', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>+</div>
                <span style={{ fontSize:'0.85rem', fontWeight:600 }}>{tr('dashboard.newWorkspace')}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* THEME PANEL */}
      <div style={{ position:'fixed', bottom:24, right:24, zIndex:100 }}>
        {themePanel && (
          <div style={{ marginBottom:8, padding:12, borderRadius:14, background:'var(--bg)', border:'1px solid var(--border)', boxShadow:'var(--shadow-lg)', minWidth:160 }}>
            <p style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--text-faint)', marginBottom:8 }}>{tr('dashboard.theme')}</p>
            {THEMES.map(t => (
              <button key={t.id} onClick={() => handleTheme(t.id)}
                style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'6px 8px', borderRadius:8,
                  border: activeTheme===t.id ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                  background: activeTheme===t.id ? 'var(--accent-light)' : 'transparent',
                  color: activeTheme===t.id ? 'var(--accent-text)' : 'var(--text-muted)',
                  cursor:'pointer', fontSize:'0.85rem', fontWeight:500, marginBottom:2 }}>
                <span style={{ width:18, height:18, borderRadius:'50%', flexShrink:0, background:`linear-gradient(135deg,${t.colors[0]} 50%,${t.colors[1]} 50%)`, border:'1px solid var(--border)' }} />
                {t.label}
              </button>
            ))}
          </div>
        )}
        <button onClick={() => setThemePanel(o => !o)}
          style={{ width:44, height:44, borderRadius:'50%', background:'var(--accent)', color:'white', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-lg)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M2 12H4M20 12h2M19.07 19.07l-1.41-1.41M5.34 5.34L3.93 3.93M12 2v2M12 20v2"/>
          </svg>
        </button>
      </div>

      {/* CREATE MODAL */}
      {modal && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:18, width:'100%', maxWidth:460, boxShadow:'var(--shadow-lg)', overflow:'hidden' }}>
            <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ position:'relative' }}>
                <button onClick={() => setEmojiPicker(o=>!o)}
                  style={{ width:44, height:44, borderRadius:12, border:'1px solid var(--border)', background:'var(--bg-secondary)', fontSize:22, cursor:'pointer' }}>
                  {wsEmoji}
                </button>
                {emojiPicker && (
                  <>
                    <div style={{ position:'fixed', inset:0, zIndex:299 }} onClick={() => setEmojiPicker(false)} />
                    <div style={{ position:'absolute', top:'110%', left:0, zIndex:300, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:12, padding:10, boxShadow:'var(--shadow-lg)', display:'flex', flexWrap:'wrap', gap:4, width:200 }}>
                      {EMOJIS.map(em => (
                        <button key={em} onClick={() => { setWsEmoji(em); setEmojiPicker(false) }}
                          style={{ width:34, height:34, borderRadius:8, border:'none', background:'transparent', fontSize:18, cursor:'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.background='var(--bg-tertiary)')}
                          onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                          {em}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div style={{ flex:1 }}>
                <h3 style={{ color:'var(--text)', fontWeight:800, fontSize:'1.05rem', margin:0 }}>{tr('dashboard.modal.title')}</h3>
                <p style={{ color:'var(--text-faint)', fontSize:'0.75rem', marginTop:2 }}>{tr('dashboard.modal.emojiHint')}</p>
              </div>
              <button onClick={() => setModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-faint)', fontSize:20 }}>×</button>
            </div>
            <div style={{ padding:'20px 24px 24px' }}>
              <label style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.05em' }}>{tr('dashboard.modal.nameLabel')}</label>
              <input style={inputStyle} value={name} onChange={e => setName(e.target.value)}
                placeholder={tr('dashboard.modal.namePlaceholder')} autoFocus
                onKeyDown={e => e.key==='Enter' && handleCreate()} />
              <label style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.05em', display:'block', marginTop:16 }}>{tr('dashboard.modal.typeLabel')}</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:6 }}>
                {TYPES.map(t => (
                  <button key={t.id} onClick={() => { setType(t.id); setWsEmoji(TYPE_EMOJIS[t.id]) }}
                    style={{ padding:'10px 8px', borderRadius:10, textAlign:'center',
                      border: type===t.id ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                      background: type===t.id ? 'var(--accent-light)' : 'var(--bg)', cursor:'pointer' }}>
                    <div style={{ fontSize:20, marginBottom:4 }}>{TYPE_EMOJIS[t.id]}</div>
                    <div style={{ fontSize:'0.75rem', fontWeight:700, color: type===t.id ? 'var(--accent-text)' : 'var(--text)' }}>{tr(`dashboard.type.${t.id}`)}</div>
                  </button>
                ))}
              </div>
              <label style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.05em', display:'block', marginTop:16 }}>
                {tr('dashboard.modal.descLabel')} <span style={{ fontWeight:400, textTransform:'none' }}>{tr('dashboard.modal.descOptional')}</span>
              </label>
              <input style={inputStyle} value={desc} onChange={e => setDesc(e.target.value)} placeholder={tr('dashboard.modal.descPlaceholder')} />
              <div style={{ display:'flex', gap:10, marginTop:20 }}>
                <button onClick={() => setModal(false)}
                  style={{ flex:1, padding:'11px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-secondary)', color:'var(--text)', cursor:'pointer', fontWeight:600 }}>
                  {tr('common.cancel')}
                </button>
                <button onClick={handleCreate} disabled={!name.trim()}
                  style={{ flex:2, padding:'11px', borderRadius:10, border:'none', background:'var(--accent)', color:'white', cursor:'pointer', fontWeight:700, opacity: name.trim() ? 1 : 0.45, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  {tr('dashboard.modal.createBtn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
