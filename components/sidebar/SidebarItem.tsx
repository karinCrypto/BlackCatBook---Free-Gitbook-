'use client'
import { useState, useRef } from 'react'
import type { Page, PageTreeNode } from '@/lib/localStorage/pages'
import { useT } from '@/lib/i18n'

const PAGE_EMOJIS = [
  '📄','📝','📖','📚','📋','📌','📍','🗒️','🗂️','📁',
  '🚀','💡','🔬','⚙️','🛠️','💻','🖥️','📡','🔐','🧩',
  '✍️','🎨','🎵','🎬','🌍','🌿','🔥','💎','⭐','🏆',
  '🐱','🦋','🌙','☀️','❤️','💜','💙','🟢','🟡','🔴',
]

type Props = {
  node: PageTreeNode
  depth: number
  currentPageId?: string
  autoEdit?: boolean
  allPages: Page[]
  onNavigate: (id: string) => void
  onAddChild: (parentId: string, type: 'page'|'folder') => void
  onDelete: (id: string) => void
  onRename: (id: string, title: string) => void
  onEmojiChange?: (id: string, emoji: string) => void
  onDuplicate?: (id: string) => void
  onMove?: (id: string, newParentId: string | null) => void
}

export default function SidebarItem({ node, depth, currentPageId, autoEdit, allPages, onNavigate, onAddChild, onDelete, onRename, onEmojiChange, onDuplicate, onMove }: Props) {
  const tr = useT()
  const [open, setOpen] = useState(true)
  const [editing, setEditing] = useState(autoEdit ?? false)
  const [title, setTitle] = useState(node.title)
  const [menu, setMenu] = useState(false)
  const [emojiPicker, setEmojiPicker] = useState(false)
  const [movePicker, setMovePicker] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function finishRename() {
    setEditing(false)
    if (title.trim() && title !== node.title) onRename(node.id, title.trim())
    else setTitle(node.title)
  }

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('text/plain', node.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent) {
    if (node.type !== 'folder') return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (node.type !== 'folder') return
    const draggedId = e.dataTransfer.getData('text/plain')
    if (!draggedId || draggedId === node.id) return
    if (isDescendant(draggedId, node.id)) return
    onMove?.(draggedId, node.id)
    setOpen(true)
  }

  function isDescendant(ancestorId: string, nodeId: string): boolean {
    const children = allPages.filter(p => p.parentId === nodeId)
    return children.some(c => c.id === ancestorId || isDescendant(ancestorId, c.id))
  }

  const isActive = currentPageId === node.id
  const isFolder = node.type === 'folder'
  const emoji = node.emoji

  const folders = allPages.filter(p =>
    p.type === 'folder' &&
    p.id !== node.id &&
    !isDescendant(p.id, node.id)
  )

  return (
    <div>
      <div className="sidebar-row"
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ display:'flex', alignItems:'center', gap:4, padding:`5px 8px 5px ${8 + depth*16}px`,
          borderRadius:7, cursor:'grab', position:'relative',
          background: dragOver ? 'var(--accent-light)' : isActive ? 'var(--accent-light)' : 'transparent',
          color: isActive ? 'var(--accent-text)' : 'var(--text-muted)',
          outline: dragOver ? '2px dashed var(--accent)' : 'none',
          transition:'background .1s' }}
        onMouseEnter={e => { if(!isActive && !dragOver)(e.currentTarget as HTMLElement).style.background='var(--bg-tertiary)' }}
        onMouseLeave={e => { if(!isActive && !dragOver)(e.currentTarget as HTMLElement).style.background='transparent' }}>

        <div style={{ position:'relative', flexShrink:0 }}>
          <button
            onClick={e => { e.stopPropagation(); setEmojiPicker(p => !p) }}
            title={tr('sidebar.menu.emoji')}
            style={{ background:'none', border:'none', cursor:'pointer', padding:0, lineHeight:1,
              display:'flex', alignItems:'center', justifyContent:'center',
              width:18, height:18, fontSize: emoji ? 14 : 12, borderRadius:4 }}>
            {emoji ? (
              <span>{emoji}</span>
            ) : isFolder ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition:'transform .2s' }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity:.5 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            )}
          </button>

          {emojiPicker && (
            <>
              <div style={{ position:'fixed', inset:0, zIndex:59 }} onClick={() => setEmojiPicker(false)} />
              <div style={{ position:'absolute', left:0, top:'110%', zIndex:60,
                background:'var(--bg)', border:'1px solid var(--border)', borderRadius:12,
                padding:10, boxShadow:'var(--shadow-lg)', width:220 }}>
                <div style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--text-faint)',
                  textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>{tr('sidebar.emoji.title')}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:3, marginBottom:8 }}>
                  {PAGE_EMOJIS.map(em => (
                    <button key={em}
                      onClick={() => { onEmojiChange?.(node.id, em); setEmojiPicker(false) }}
                      style={{ width:30, height:30, borderRadius:6, border:'none',
                        background: node.emoji===em ? 'var(--accent-light)' : 'transparent',
                        fontSize:16, cursor:'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background='var(--bg-tertiary)')}
                      onMouseLeave={e => (e.currentTarget.style.background = node.emoji===em ? 'var(--accent-light)' : 'transparent')}>
                      {em}
                    </button>
                  ))}
                </div>
                {emoji && (
                  <button onClick={() => { onEmojiChange?.(node.id, ''); setEmojiPicker(false) }}
                    style={{ width:'100%', padding:'5px', borderRadius:7, border:'1px solid var(--border)',
                      background:'transparent', color:'var(--text-faint)', cursor:'pointer',
                      fontSize:'0.75rem', fontWeight:600 }}>
                    {tr('sidebar.emoji.remove')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {isFolder && emoji && (
          <button onClick={() => setOpen(o=>!o)} style={{ background:'none', border:'none', cursor:'pointer',
            color:'inherit', padding:0, display:'flex', alignItems:'center', flexShrink:0 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition:'transform .2s', opacity:.5 }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}

        {editing ? (
          <input ref={inputRef} value={title} onChange={e=>setTitle(e.target.value)}
            onBlur={finishRename}
            onKeyDown={e=>{ if(e.key==='Enter') finishRename(); if(e.key==='Escape'){setEditing(false);setTitle(node.title)} }}
            autoFocus
            style={{ flex:1, border:'1px solid var(--accent)', borderRadius:4, padding:'1px 4px',
              background:'var(--bg)', color:'var(--text)', fontSize:'0.875rem', outline:'none' }} />
        ) : (
          <span
            onClick={() => isFolder ? setOpen(o=>!o) : onNavigate(node.id)}
            onDoubleClick={() => setEditing(true)}
            style={{ flex:1, fontSize:'0.875rem', fontWeight: isActive ? 600 : 500,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', userSelect:'none',
              color: isActive ? 'var(--accent-text)' : 'var(--text)' }}>
            {node.title}
          </span>
        )}

        <div style={{ position:'relative', marginLeft:'auto' }}>
          <button onClick={e => { e.stopPropagation(); setMenu(m=>!m) }}
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-faint)',
              padding:'0 2px', fontSize:16, lineHeight:1, display:'flex', alignItems:'center', opacity: menu ? 1 : 0 }}
            className="sidebar-item-menu-btn">
            ···
          </button>
          {menu && (
            <>
              <div style={{ position:'fixed', inset:0, zIndex:49 }} onClick={() => setMenu(false)} />
              <div style={{ position:'absolute', right:0, top:'100%', zIndex:50, background:'var(--bg)',
                border:'1px solid var(--border)', borderRadius:10, boxShadow:'var(--shadow-lg)', minWidth:160, padding:4 }}>
                <button onClick={() => { setEditing(true); setMenu(false) }} style={menuBtnStyle}>{tr('sidebar.menu.rename')}</button>
                <button onClick={() => { setMenu(false); setEmojiPicker(true) }} style={menuBtnStyle}>{tr('sidebar.menu.emoji')}</button>
                {!isFolder && onMove && (
                  <button onClick={() => { setMenu(false); setMovePicker(true) }} style={menuBtnStyle}>{tr('sidebar.menu.move')}</button>
                )}
                {!isFolder && onDuplicate && (
                  <button onClick={() => { onDuplicate(node.id); setMenu(false) }} style={menuBtnStyle}>{tr('sidebar.menu.duplicate')}</button>
                )}
                {!isFolder && <button onClick={() => { onAddChild(node.id, 'page'); setMenu(false) }} style={menuBtnStyle}>{tr('sidebar.menu.subpage')}</button>}
                <button onClick={() => { onAddChild(node.id, 'folder'); setMenu(false) }} style={menuBtnStyle}>{tr('sidebar.menu.subfolder')}</button>
                <div style={{ height:1, background:'var(--border)', margin:'4px 0' }} />
                <button onClick={() => { onDelete(node.id); setMenu(false) }}
                  style={{ ...menuBtnStyle, color:'#ef4444' }}>{tr('sidebar.menu.delete')}</button>
              </div>
            </>
          )}
        </div>
      </div>

      {movePicker && (
        <>
          <div style={{ position:'fixed', inset:0, zIndex:59 }} onClick={() => setMovePicker(false)} />
          <div style={{ position:'fixed', left:'260px', top:'50%', transform:'translateY(-50%)', zIndex:60,
            background:'var(--bg)', border:'1px solid var(--border)', borderRadius:12,
            boxShadow:'var(--shadow-lg)', minWidth:200, padding:8 }}>
            <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-faint)',
              textTransform:'uppercase', letterSpacing:'.06em', padding:'4px 8px 8px' }}>{tr('sidebar.move.title')}</div>
            {node.parentId !== null && (
              <button onClick={() => { onMove?.(node.id, null); setMovePicker(false) }} style={menuBtnStyle}>
                {tr('sidebar.move.root')}
              </button>
            )}
            {folders.map(f => (
              <button key={f.id}
                onClick={() => { onMove?.(node.id, f.id); setMovePicker(false) }}
                style={{ ...menuBtnStyle, fontWeight: f.id === node.parentId ? 700 : 400 }}>
                {f.emoji || '📁'} {f.title}
                {f.id === node.parentId && <span style={{ color:'var(--text-faint)', fontSize:'0.72rem', marginLeft:4 }}>{tr('sidebar.move.current')}</span>}
              </button>
            ))}
            {folders.length === 0 && node.parentId === null && (
              <div style={{ padding:'8px 12px', fontSize:'0.82rem', color:'var(--text-faint)' }}>
                {tr('sidebar.move.noFolders')}
              </div>
            )}
          </div>
        </>
      )}

      {open && node.children.length > 0 && (
        <div>
          {node.children.map(child => (
            <SidebarItem key={child.id} node={child} depth={depth+1}
              currentPageId={currentPageId} allPages={allPages}
              onNavigate={onNavigate}
              onAddChild={onAddChild} onDelete={onDelete} onRename={onRename}
              onEmojiChange={onEmojiChange} onDuplicate={onDuplicate} onMove={onMove} />
          ))}
        </div>
      )}
    </div>
  )
}

const menuBtnStyle: React.CSSProperties = {
  display:'block', width:'100%', textAlign:'left', padding:'7px 12px',
  background:'none', border:'none', cursor:'pointer', fontSize:'0.85rem',
  color:'var(--text)', borderRadius:7, transition:'background .1s',
}
