'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getWorkspace } from '@/lib/localStorage/workspaces'
import { getTheme, setTheme } from '@/lib/localStorage/theme'
import { usePages } from '@/lib/hooks/usePages'
import SidebarManager from '@/components/sidebar/SidebarManager'
import RichEditor from '@/components/editor/RichEditor'
import DocViewer from '@/components/editor/DocViewer'
import ShareModal from '@/components/workspace/ShareModal'
import AIWritePanel from '@/components/editor/AIWritePanel'
import type { Page } from '@/lib/localStorage/pages'

const THEMES = [
  { id: 'glacier', label: 'Glacier', colors: ['#fff','#3b82f6'] },
  { id: 'midnight', label: 'Midnight', colors: ['#1e293b','#818cf8'] },
  { id: 'forest', label: 'Forest', colors: ['#0d1f0f','#22c55e'] },
  { id: 'sakura', label: 'Sakura', colors: ['#fff1f2','#f43f5e'] },
  { id: 'slate', label: 'Slate', colors: ['#f1f5f9','#475569'] },
]

export default function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const router = useRouter()
  const { pages, tree, createPage, updatePage, deletePage, duplicatePage, reorderPages, movePage } = usePages(workspaceId)
  const [wsName, setWsName] = useState('')
  const [currentPageId, setCurrentPageId] = useState<string|null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [themePanel, setThemePanel] = useState(false)
  const [activeTheme, setActiveTheme] = useState('midnight')
  const [mobileSidebar, setMobileSidebar] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const fileImportRef = useRef<HTMLInputElement>(null)
  const editorInsertRef = useRef<((html: string) => void) | null>(null)

  useEffect(() => {
    const ws = getWorkspace(workspaceId)
    if (!ws) { router.push('/dashboard'); return }
    setWsName(ws.name)
    const t = getTheme(); setActiveTheme(t)
    document.documentElement.setAttribute('data-theme', t)
  }, [workspaceId, router])

  // Auto-select first page
  useEffect(() => {
    if (!currentPageId && pages.length > 0) {
      const firstPage = pages.find(p => p.type === 'page')
      if (firstPage) setCurrentPageId(firstPage.id)
    }
  }, [pages, currentPageId])

  // When page changes: view mode if has content, edit mode if empty
  // Use a ref to only run ONCE per page navigation (not on every pages refresh)
  const editModeInitRef = useRef<string | null>(null)
  useEffect(() => {
    if (!currentPageId) return
    if (!pages.length) return              // pages not loaded yet — wait
    if (editModeInitRef.current === currentPageId) return  // already initialized for this page
    const p = pages.find(pg => pg.id === currentPageId)
    if (!p) return                         // page not in list yet — wait
    editModeInitRef.current = currentPageId
    const isEmpty = !p.content || p.content.trim() === '' || p.content === '<p>내용을 작성하세요...</p>'
    setIsEditing(isEmpty)
  }, [currentPageId, pages])

  const currentPage = pages.find(p => p.id === currentPageId) ?? null

  function handleCreatePage(parentId: string|null, type: 'page'|'folder'): string {
    const order = pages.filter(p => p.parentId === parentId).length
    const p = createPage({
      workspaceId, parentId, type, order,
      title: type === 'folder' ? '새 폴더' : '새 페이지',
      content: '',
    })
    if (type === 'page') { setCurrentPageId(p.id); setIsEditing(true) }
    return p.id
  }

  function handleDelete(id: string) {
    if (!confirm('삭제하시겠어요?')) return
    deletePage(id)
    if (currentPageId === id) setCurrentPageId(null)
  }

  function handleRename(id: string, title: string) {
    updatePage(id, { title })
  }

  function handleEmojiChange(id: string, emoji: string) {
    updatePage(id, { emoji: emoji || undefined })
  }

  // Called by autoSave (1.5s debounce) — saves silently, NO mode switch
  function handleSave(content: string, title: string) {
    if (!currentPageId) return
    updatePage(currentPageId, { content, title })
  }

  // Called by the explicit "완료" button in the editor — saves AND goes to view mode
  function handleSaveAndView(content: string, title: string) {
    if (!currentPageId) return
    updatePage(currentPageId, { content, title })
    setIsEditing(false)
  }

  function handleMove(id: string, newParentId: string | null) {
    movePage(id, newParentId)
  }

  function handleDuplicate(id: string) {
    const p = duplicatePage(id)
    setCurrentPageId(p.id)
    setIsEditing(false)
  }

  function handleExport() {
    const data = { workspace: { id: workspaceId, name: wsName }, pages, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `${wsName}-backup.json`; a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (Array.isArray(data.pages)) {
          data.pages.forEach((p: Parameters<typeof createPage>[0]) => {
            createPage({ ...p, workspaceId })
          })
        }
      } catch { alert('올바른 백업 파일이 아니에요') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleAIInsert(html: string) {
    if (editorInsertRef.current) {
      editorInsertRef.current(html)
    } else if (currentPageId) {
      // If in view mode, switch to edit and inject
      const existing = pages.find(p => p.id === currentPageId)
      const newContent = (existing?.content || '') + html
      updatePage(currentPageId, { content: newContent })
      setIsEditing(true)
    }
    setAiPanelOpen(false)
  }

  function handleTheme(t: string) {
    setTheme(t); setActiveTheme(t); setThemePanel(false)
  }

  // Generate TOC from content
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([])
  useEffect(() => {
    if (!currentPage?.content) { setToc([]); return }
    const div = document.createElement('div')
    div.innerHTML = currentPage.content
    const headings = Array.from(div.querySelectorAll('h1,h2,h3'))
    setToc(headings.map((h, i) => ({
      id: `h-${i}`,
      text: h.textContent || '',
      level: parseInt(h.tagName[1])
    })))
  }, [currentPage?.content])

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>
      {/* HEADER */}
      <header style={{ height:60, background:'var(--header-bg)', borderBottom:'1px solid var(--border)',
        position:'fixed', top:0, left:0, right:0, zIndex:50, display:'flex', alignItems:'center', padding:'0 16px', gap:12 }}>
        {/* Mobile toggle */}
        <button onClick={() => setMobileSidebar(o=>!o)} className="md-hide"
          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)',
            display:'flex', flexDirection:'column', gap:5, padding:6, borderRadius:6 }}>
          <span style={{ display:'block', width:18, height:2, background:'currentColor', borderRadius:2 }}/>
          <span style={{ display:'block', width:18, height:2, background:'currentColor', borderRadius:2 }}/>
          <span style={{ display:'block', width:18, height:2, background:'currentColor', borderRadius:2 }}/>
        </button>

        <button onClick={() => window.location.reload()}
          style={{ display:'flex', alignItems:'center', gap:6,
            background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <img src="/logo.png" alt="BlackCatBook" style={{ width:28, height:28, objectFit:'contain' }} />
          <span style={{ fontWeight:800, color:'var(--text)', fontSize:'0.95rem' }}>BlackCatBook</span>
        </button>
        <span style={{ color:'var(--border)' }}>›</span>
        <span style={{ fontSize:'0.875rem', color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:200 }}>{wsName}</span>

        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          {/* Export */}
          <button onClick={handleExport} title="내보내기"
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:6, borderRadius:6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          {/* Import */}
          <button onClick={() => fileImportRef.current?.click()} title="가져오기"
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:6, borderRadius:6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </button>
          <input ref={fileImportRef} type="file" accept=".json" style={{ display:'none' }} onChange={handleImport} />
          <button onClick={() => setShareOpen(true)}
            style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.82rem', fontWeight:600,
              padding:'6px 12px', borderRadius:8, border:'1px solid var(--border)',
              background:'var(--bg-secondary)', color:'var(--text-muted)', cursor:'pointer' }}
            title="공유">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            공유
          </button>
          <button onClick={() => setSidebarOpen(o=>!o)}
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:6, borderRadius:6 }} title="사이드바 토글">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
          <button onClick={() => setAiPanelOpen(o => !o)}
            style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.82rem', fontWeight:700,
              padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer',
              background: aiPanelOpen ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: aiPanelOpen ? 'white' : 'var(--text-muted)' }}
            title="AI 글쓰기">
            ✨ AI
          </button>
          <button onClick={() => handleCreatePage(null, 'page')}
            style={{ fontSize:'0.82rem', fontWeight:700, padding:'6px 14px', borderRadius:8,
              background:'var(--accent)', color:'white', border:'none', cursor:'pointer' }}>
            + 새 페이지
          </button>
        </div>
      </header>

      <div style={{ display:'flex', marginTop:60, flex:1 }}>
        {/* SIDEBAR */}
        {/* Desktop */}
        <aside style={{ width: sidebarOpen ? 260 : 0, flexShrink:0, overflow:'hidden',
          background:'var(--sidebar-bg)', borderRight: sidebarOpen ? '1px solid var(--border)' : 'none',
          position:'sticky', top:60, height:'calc(100vh - 60px)',
          transition:'width .25s', display:'flex', flexDirection:'column' }}>
          {sidebarOpen && (
            <SidebarManager
              workspaceId={workspaceId}
              workspaceName={wsName}
              tree={tree}
              pages={pages}
              currentPageId={currentPageId ?? undefined}
              onNavigate={id => { setCurrentPageId(id); setMobileSidebar(false); setIsEditing(false) }}
              onCreatePage={handleCreatePage}
              onDelete={handleDelete}
              onRename={handleRename}
                onEmojiChange={handleEmojiChange}
                onDuplicate={handleDuplicate}
                onMove={handleMove}
            />
          )}
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileSidebar && (
          <>
            <div style={{ position:'fixed', inset:0, zIndex:39, background:'rgba(0,0,0,.4)' }}
              onClick={() => setMobileSidebar(false)} />
            <aside style={{ position:'fixed', left:0, top:60, bottom:0, width:260, zIndex:40,
              background:'var(--sidebar-bg)', borderRight:'1px solid var(--border)',
              display:'flex', flexDirection:'column', overflow:'hidden' }}>
              <SidebarManager
                workspaceId={workspaceId}
                workspaceName={wsName}
                tree={tree}
                pages={pages}
                currentPageId={currentPageId ?? undefined}
                onNavigate={id => { setCurrentPageId(id); setMobileSidebar(false); setIsEditing(false) }}
                onCreatePage={handleCreatePage}
                onDelete={handleDelete}
                onRename={handleRename}
                onEmojiChange={handleEmojiChange}
                onDuplicate={handleDuplicate}
                onMove={handleMove}
              />
            </aside>
          </>
        )}

        {/* MAIN CONTENT */}
        <main style={{ flex:1, minWidth:0, display:'flex' }}>
          {!currentPage ? (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:16, color:'var(--text-faint)' }}>
              <img src="/logo.png" alt="" style={{ width:64, height:64, objectFit:'contain' }} />
              <div style={{ fontWeight:700, fontSize:'1.1rem', color:'var(--text)' }}>페이지를 선택하거나 새로 만드세요</div>
              <button onClick={() => handleCreatePage(null,'page')}
                style={{ padding:'10px 24px', borderRadius:10, background:'var(--accent)', color:'white',
                  border:'none', cursor:'pointer', fontWeight:700 }}>
                + 첫 페이지 만들기
              </button>
            </div>
          ) : (
            <>
              <div style={{ flex:1, minWidth:0, overflow:'auto' }}>
                {isEditing ? (
                  <RichEditor
                    key={currentPageId}
                    page={currentPage}
                    workspaceId={workspaceId}
                    onSave={handleSave}
                    onDone={handleSaveAndView}
                    onRegisterInsert={fn => { editorInsertRef.current = fn }}
                  />
                ) : (
                  <DocViewer
                    key={currentPageId}
                    page={currentPage}
                    onEdit={() => setIsEditing(true)}
                  />
                )}
              </div>

              {/* TOC */}
              {toc.length > 0 && (
                <aside style={{ width:200, flexShrink:0, padding:'40px 16px 40px 0',
                  position:'sticky', top:60, height:'calc(100vh - 60px)', overflow:'auto',
                  display:'flex', flexDirection:'column' }}>
                  <p style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase',
                    letterSpacing:'.09em', color:'var(--text-faint)', marginBottom:10 }}>이 페이지에서</p>
                  {toc.map(h => (
                    <a key={h.id} href={`#${h.id}`}
                      style={{ display:'block', fontSize:'0.78rem', color:'var(--text-faint)',
                        padding:`3px 0 3px ${(h.level-1)*12}px`,
                        borderLeft:'2px solid var(--border)', paddingLeft:(h.level-1)*12+8,
                        textDecoration:'none', transition:'color .15s, border-color .15s',
                        marginBottom:2 }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.color='var(--accent-text)'; (e.target as HTMLElement).style.borderColor='var(--accent)' }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.color='var(--text-faint)'; (e.target as HTMLElement).style.borderColor='var(--border)' }}>
                      {h.text}
                    </a>
                  ))}
                </aside>
              )}
            </>
          )}
        </main>
      </div>

      {/* AI WRITE PANEL */}
      {aiPanelOpen && (
        <div style={{ position:'fixed', top:60, right:0, bottom:0, zIndex:45, display:'flex', flexDirection:'column' }}>
          <AIWritePanel
            onInsert={handleAIInsert}
            onClose={() => setAiPanelOpen(false)}
          />
        </div>
      )}

      {/* THEME PANEL */}
      <div style={{ position:'fixed', bottom:24, right:24, zIndex:100 }}>
        {themePanel && (
          <div style={{ marginBottom:8, padding:12, borderRadius:14, background:'var(--bg)',
            border:'1px solid var(--border)', boxShadow:'var(--shadow-lg)', minWidth:150 }}>
            <p style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase',
              letterSpacing:'.08em', color:'var(--text-faint)', marginBottom:8 }}>테마</p>
            {THEMES.map(t => (
              <button key={t.id} onClick={() => handleTheme(t.id)}
                style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'6px 8px',
                  borderRadius:8, border: activeTheme===t.id ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                  background: activeTheme===t.id ? 'var(--accent-light)' : 'transparent',
                  color: activeTheme===t.id ? 'var(--accent-text)' : 'var(--text-muted)',
                  cursor:'pointer', fontSize:'0.85rem', fontWeight:500, marginBottom:2 }}>
                <span style={{ width:16, height:16, borderRadius:'50%',
                  background:`linear-gradient(135deg,${t.colors[0]} 50%,${t.colors[1]} 50%)`,
                  border:'1px solid var(--border)', flexShrink:0 }} />
                {t.label}
              </button>
            ))}
          </div>
        )}
        <button onClick={() => setThemePanel(o=>!o)}
          style={{ width:44, height:44, borderRadius:'50%', background:'var(--accent)', color:'white',
            border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'var(--shadow-lg)' }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M2 12H4M20 12h2M19.07 19.07l-1.41-1.41M5.34 5.34L3.93 3.93M12 2v2M12 20v2"/>
          </svg>
        </button>
      </div>

      {/* SHARE MODAL */}
      {shareOpen && (
        <ShareModal
          workspaceId={workspaceId}
          workspaceName={wsName}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  )
}
