'use client'
import { useState } from 'react'
import SidebarItem from './SidebarItem'
import type { Page, PageTreeNode } from '@/lib/localStorage/pages'
import { useT } from '@/lib/i18n'

type Props = {
  workspaceId: string
  workspaceName: string
  tree: PageTreeNode[]
  pages: Page[]
  currentPageId?: string
  onNavigate: (id: string) => void
  onCreatePage: (parentId: string|null, type: 'page'|'folder') => string
  onDelete: (id: string) => void
  onRename: (id: string, title: string) => void
  onEmojiChange: (id: string, emoji: string) => void
  onDuplicate: (id: string) => void
  onMove: (id: string, newParentId: string | null) => void
}

export default function SidebarManager({ workspaceName, tree, pages, currentPageId, onNavigate, onCreatePage, onDelete, onRename, onEmojiChange, onDuplicate, onMove }: Props) {
  const tr = useT()
  const [search, setSearch] = useState('')
  const [newItemId, setNewItemId] = useState<string|null>(null)

  function handleCreate(parentId: string|null, type: 'page'|'folder') {
    const id = onCreatePage(parentId, type)
    setNewItemId(id)
  }

  const filtered = search.trim()
    ? pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.content.replace(/<[^>]*>/g,'').toLowerCase().includes(search.toLowerCase()))
    : []

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ padding:'14px 12px 10px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ fontWeight:800, fontSize:'0.95rem', color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:10 }}>
          {workspaceName}
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={() => handleCreate(null, 'page')}
            style={{ flex:1, padding:'6px', borderRadius:7, border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', cursor:'pointer', fontSize:'0.78rem', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:4, transition:'background .15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-tertiary)')}
            onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {tr('sidebar.page')}
          </button>
          <button onClick={() => handleCreate(null, 'folder')}
            style={{ flex:1, padding:'6px', borderRadius:7, border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', cursor:'pointer', fontSize:'0.78rem', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:4, transition:'background .15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-tertiary)')}
            onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            {tr('sidebar.folder')}
          </button>
        </div>
      </div>

      <div style={{ padding:'8px 12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:8, background:'var(--bg-tertiary)', border:'1px solid var(--border)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:'var(--text-faint)', flexShrink:0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={tr('common.search')} style={{ flex:1, border:'none', background:'transparent', color:'var(--text)', fontSize:'0.82rem', outline:'none' }} />
          {search && <button onClick={()=>setSearch('')} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-faint)',fontSize:14 }}>×</button>}
        </div>
      </div>

      {search.trim() && (
        <div style={{ flex:1, overflow:'auto', padding:'0 8px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'20px 0', fontSize:'0.82rem', color:'var(--text-faint)' }}>{tr('common.noResults')}</div>
          ) : filtered.map(p => (
            <button key={p.id} onClick={()=>{ onNavigate(p.id); setSearch('') }}
              style={{ display:'block', width:'100%', textAlign:'left', padding:'8px 10px', borderRadius:8, border:'none', background: currentPageId===p.id ? 'var(--accent-light)' : 'transparent', color: currentPageId===p.id ? 'var(--accent-text)' : 'var(--text)', cursor:'pointer', fontSize:'0.85rem', fontWeight:500, marginBottom:2 }}>
              <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-faint)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {p.content.replace(/<[^>]*>/g,'').slice(0,60)}
              </div>
            </button>
          ))}
        </div>
      )}

      {!search.trim() && (
        <div style={{ flex:1, overflow:'auto', padding:'4px 8px' }}>
          {tree.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 0', fontSize:'0.82rem', color:'var(--text-faint)' }}>{tr('sidebar.noPages')}</div>
          ) : tree.map(node => (
            <SidebarItem key={node.id} node={node} depth={0}
              currentPageId={currentPageId}
              autoEdit={newItemId === node.id}
              allPages={pages}
              onNavigate={onNavigate}
              onAddChild={(parentId, type) => { const id = onCreatePage(parentId, type); setNewItemId(id) }}
              onDelete={onDelete}
              onRename={(id, title) => { onRename(id, title); setNewItemId(null) }}
              onEmojiChange={onEmojiChange}
              onDuplicate={onDuplicate}
              onMove={onMove} />
          ))}
        </div>
      )}
    </div>
  )
}
