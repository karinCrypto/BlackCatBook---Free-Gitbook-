'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Doc = {
  id: string
  title: string
  subtitle?: string
  content_html: string
  status: string
  seo_title?: string
  seo_desc?: string
}

export default function DocEditor({ doc, workspaceId }: { doc: Doc; workspaceId: string }) {
  const [title, setTitle] = useState(doc.title)
  const [subtitle, setSubtitle] = useState(doc.subtitle ?? '')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [linkModal, setLinkModal] = useState(false)
  const [linkText, setLinkText] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const savedRange = useRef<Range | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = doc.content_html || '<p>여기에 내용을 작성하세요...</p>'
    }
  }, [doc.content_html])

  const save = useCallback(async (status?: string) => {
    setSaving(true)
    await fetch(`/api/documents/${doc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, subtitle,
        content_html: editorRef.current?.innerHTML ?? '',
        ...(status && { status }),
      }),
    })
    setSaving(false)
    setLastSaved(new Date())
  }, [doc.id, title, subtitle])

  const autoSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(), 2000)
  }, [save])

  function exec(cmd: string, value?: string) {
    editorRef.current?.focus()
    document.execCommand(cmd, false, value)
  }

  function insertImage(file: File) {
    const reader = new FileReader()
    reader.onload = e => {
      const img = document.createElement('img')
      img.src = e.target?.result as string
      img.alt = file.name
      img.className = ''
      const sel = window.getSelection()
      if (sel?.rangeCount && editorRef.current?.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0)
        range.deleteContents()
        range.insertNode(img)
        range.setStartAfter(img)
        sel.removeAllRanges(); sel.addRange(range)
      } else {
        editorRef.current?.appendChild(img)
      }
    }
    reader.readAsDataURL(file)
  }

  function openLinkModal() {
    const sel = window.getSelection()
    if (sel?.rangeCount) savedRange.current = sel.getRangeAt(0).cloneRange()
    setLinkText(sel?.toString() ?? '')
    setLinkUrl('')
    setLinkModal(true)
  }

  function insertLink() {
    if (!linkUrl) { setLinkModal(false); return }
    editorRef.current?.focus()
    if (savedRange.current) {
      const sel = window.getSelection()
      sel?.removeAllRanges(); sel?.addRange(savedRange.current)
    }
    document.execCommand('insertHTML', false, `<a href="${linkUrl}" target="_blank" rel="noopener">${linkText || linkUrl}</a>`)
    setLinkModal(false)
  }

  const btnStyle = (active?: boolean): React.CSSProperties => ({
    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem',
    background: active ? 'var(--accent-light)' : 'transparent',
    color: active ? 'var(--accent-text)' : 'var(--text-muted)',
    transition: 'background .15s',
  })

  const divider = <div style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 4px' }} />

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--bg-secondary)',
    color: 'var(--text)', fontSize: '0.875rem', outline: 'none', marginBottom: 14,
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
      {/* Title */}
      <input
        value={title}
        onChange={e => { setTitle(e.target.value); autoSave() }}
        placeholder="문서 제목"
        style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent',
          fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginBottom: 8, fontFamily: 'inherit' }}
      />
      <input
        value={subtitle}
        onChange={e => { setSubtitle(e.target.value); autoSave() }}
        placeholder="부제목 (선택)"
        style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent',
          fontSize: '1rem', color: 'var(--text-muted)', marginBottom: 24, fontFamily: 'inherit',
          borderBottom: '1px solid var(--border)', paddingBottom: 20 }}
      />

      {/* TOOLBAR */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2,
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderBottom: 'none', borderRadius: '8px 8px 0 0', padding: '8px 10px',
        position: 'sticky', top: 60, zIndex: 10 }}>

        <select onChange={e => exec('formatBlock', e.target.value)}
          style={{ height: 32, padding: '0 8px', border: '1px solid var(--border)', borderRadius: 6,
            background: 'var(--bg)', color: 'var(--text)', fontSize: '0.8rem', cursor: 'pointer' }}>
          <option value="p">본문</option>
          <option value="h1">제목 1</option>
          <option value="h2">제목 2</option>
          <option value="h3">제목 3</option>
        </select>

        {divider}

        <button style={btnStyle()} onClick={() => exec('bold')} title="굵게"><b>B</b></button>
        <button style={btnStyle()} onClick={() => exec('italic')} title="기울임"><i>I</i></button>
        <button style={btnStyle()} onClick={() => exec('underline')} title="밑줄"><u>U</u></button>
        <button style={btnStyle()} onClick={() => exec('strikeThrough')} title="취소선"><s>S</s></button>

        {divider}

        <button style={btnStyle()} onClick={() => exec('insertUnorderedList')} title="목록">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
        </button>
        <button style={btnStyle()} onClick={() => exec('insertOrderedList')} title="번호 목록">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10H6"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
        </button>
        <button style={btnStyle()} onClick={() => exec('formatBlock', 'blockquote')} title="인용">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        </button>

        {divider}

        <button style={btnStyle()} onClick={openLinkModal} title="링크">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </button>
        <button style={btnStyle()} onClick={() => fileInputRef.current?.click()} title="이미지">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </button>
        <button style={btnStyle()} onClick={() => {
          const pre = document.createElement('pre')
          pre.innerHTML = '<code>// 코드</code>'
          const sel = window.getSelection()
          if (sel?.rangeCount) { const r = sel.getRangeAt(0); r.deleteContents(); r.insertNode(pre) }
          else editorRef.current?.appendChild(pre)
        }} title="코드">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </button>
        <button style={btnStyle()} onClick={() => exec('insertHorizontalRule')} title="구분선">—</button>

        {divider}

        <button style={btnStyle()} onClick={() => exec('undo')} title="실행취소">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
        </button>
        <button style={btnStyle()} onClick={() => exec('redo')} title="다시실행">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', alignSelf: 'center' }}>
            {saving ? '저장 중...' : lastSaved ? `${lastSaved.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 저장됨` : ''}
          </span>
          <button onClick={() => save('draft')}
            style={{ height: 32, padding: '0 12px', borderRadius: 6, border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
            저장
          </button>
          <button onClick={() => save('published')}
            style={{ height: 32, padding: '0 12px', borderRadius: 6, border: 'none',
              background: 'var(--accent)', color: 'white', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
            게시
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={e => { Array.from(e.target.files ?? []).forEach(insertImage); e.target.value = '' }} />

      {/* EDITOR AREA */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="editor-content"
        onInput={autoSave}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).forEach(insertImage)
        }}
        onPaste={e => {
          const img = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'))
          if (img) { e.preventDefault(); const f = img.getAsFile(); if (f) insertImage(f) }
        }}
        style={{ border: '1px solid var(--border)', borderRadius: '0 0 8px 8px',
          padding: '32px 40px', background: 'var(--bg)', minHeight: 500 }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.75rem', color: 'var(--text-faint)' }}>
        <span>이미지를 드래그하거나 붙여넣기 하세요</span>
        <button onClick={() => { save(); router.push(`/workspace/${workspaceId}/docs/${doc.id}`) }}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: '0.75rem' }}>
          ← 미리보기로 돌아가기
        </button>
      </div>

      {/* LINK MODAL */}
      {linkModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setLinkModal(false)}>
          <div className="modal">
            <h3 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 16 }}>링크 삽입</h3>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>텍스트</label>
            <input style={inputStyle} value={linkText} onChange={e => setLinkText(e.target.value)} placeholder="링크 텍스트" />
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>URL</label>
            <input style={inputStyle} value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://" autoFocus />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setLinkModal(false)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                취소
              </button>
              <button onClick={insertLink}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
                삽입
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
