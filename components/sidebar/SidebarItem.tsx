'use client'
import { useState, useRef } from 'react'
import type { PageTreeNode } from '@/lib/localStorage/pages'

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
  onNavigate: (id: string) => void
  onAddChild: (parentId: string, type: 'page'|'folder') => void
  onDelete: (id: string) => void
  onRename: (id: string, title: string) => void
  onEmojiChange?: (id: string, emoji: string) => void
  onDuplicate?: (id: string) => void
}

export default function SidebarItem({ node, depth, currentPageId, autoEdit, onNavigate, onAddChild, onDelete, onRename, onEmojiChange, onDuplicate }: Props) {
  const [open, setOpen] = useState(true)
  const [editing, setEditing] = useState(autoEdit ?? false)
  const [title, setTitle] = useState(node.title)
  const [menu, setMenu] = useState(false)
  const [emojiPicker, setEmojiPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function finishRename() {
    setEditing(false)
    if (title.trim() && title !== node.title) onRename(node.id, title.trim())
    else setTitle(node.title)
  }

  const isActive = currentPageId === node.id
  const isFolder = node.type === 'folder'
  const emoji = node.emoji

  return (
    <div>
      <div className="sidebar-row"
        style={{ display:'flex', alignItems:'center', gap:4, padding:`5px 8px 5px ${8 + depth*16}px`,
          borderRadius:7, cursor:'pointer', position:'relative',
          background: isActive ? 'var(--accent-light)' : 'transparent',
          color: isActive ? 'var(--accent-text)' : 'var(--text-muted)' }}
        onMouseEnter={e => { if(!isActive)(e.currentTarget as HTMLElement).style.background='var(--bg-tertiary)' }}
        onMouseLeave={e => { if(!isActive)(e.currentTarget as HTMLElement).style.background='transparent' }}>

        {/* Emoji or default icon — click to open picker */}
        <div style={{ position:'relative', flexShrink:0 }}>
          <button
            onClick={e => { e.stopPropagation(); setEmojiPicker(p => !p) }}
            title="이모지 변경"
            style={{ background:'none', border:'none', cursor:'pointer', padding:0, lineHeight:1,
              display:'flex', alignItems:'center', justifyContent:'center',
              width:18, height:18, fontSize: emoji ? 14 : 12, borderRadius:4,
              transition:'background .1s' }}
            onMouseEnter={e => (e.currentTarget.style.background='var(--bg-secondary)')}
            onMouseLeave={e => (e.currentTarget.style.background='none')}
          >
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

          {/* Emoji picker popup */}
          {emojiPicker && (
            <>
              <div style={{ position:'fixed', inset:0, zIndex:59 }} onClick={() => setEmojiPicker(false)} />
              <div style={{ position:'absolute', left:0, top:'110%', zIndex:60,
                background:'var(--bg)', border:'1px solid var(--border)', borderRadius:12,
                padding:10, boxShadow:'var(--shadow-lg)', width:220 }}>
                <div style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--text-faint)',
                  textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>이모지 선택</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:3, marginBottom:8 }}>
                  {PAGE_EMOJIS.map(em => (
                    <button key={em}
                      onClick={() => { onEmojiChange?.(node.id, em); setEmojiPicker(false) }}
                      style={{ width:30, height:30, borderRadius:6, border:'none',
                        background: node.emoji===em ? 'var(--accent-light)' : 'transparent',
                        fontSize:16, cursor:'pointer', transition:'background .1s' }}
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
                    이모지 제거
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Folder chevron (when has emoji) */}
        {isFolder && emoji && (
          <button onClick={() => setOpen(o=>!o)} style={{ background:'none', border:'none', cursor:'pointer',
            color:'inherit', padding:0, display:'flex', alignItems:'center', flexShrink:0 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition:'transform .2s', opacity:.5 }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}

        {/* Title */}
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
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', userSelect:'none' }}>
            {node.title}
          </span>
        )}

        {/* Action menu */}
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
                <button onClick={() => { setEditing(true); setMenu(false) }} style={menuBtnStyle}>✏️ 이름 변경</button>
                <button onClick={() => { setMenu(false); setEmojiPicker(true) }} style={menuBtnStyle}>😀 이모지 변경</button>
                {!isFolder && onDuplicate && (
                  <button onClick={() => { onDuplicate(node.id); setMenu(false) }} style={menuBtnStyle}>📋 복제</button>
                )}
                {!isFolder && <button onClick={() => { onAddChild(node.id, 'page'); setMenu(false) }} style={menuBtnStyle}>📄 하위 페이지</button>}
                <button onClick={() => { onAddChild(node.id, 'folder'); setMenu(false) }} style={menuBtnStyle}>📁 하위 폴더</button>
                <div style={{ height:1, background:'var(--border)', margin:'4px 0' }} />
                <button onClick={() => { onDelete(node.id); setMenu(false) }}
                  style={{ ...menuBtnStyle, color:'#ef4444' }}>🗑️ 삭제</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Children */}
      {open && node.children.length > 0 && (
        <div>
          {node.children.map(child => (
            <SidebarItem key={child.id} node={child} depth={depth+1}
              currentPageId={currentPageId} onNavigate={onNavigate}
              onAddChild={onAddChild} onDelete={onDelete} onRename={onRename}
              onEmojiChange={onEmojiChange} onDuplicate={onDuplicate} />
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
