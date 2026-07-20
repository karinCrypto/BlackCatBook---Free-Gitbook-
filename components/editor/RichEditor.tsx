'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import type { Page } from '@/lib/localStorage/pages'
import { uploadFile, FREE_FILE_LIMIT_MB, PREMIUM_FILE_LIMIT_MB } from '@/lib/firebase/upload'

const HIGHLIGHT_COLORS = [
  { color: '#fef08a', label: '노랑' },
  { color: '#bbf7d0', label: '초록' },
  { color: '#bfdbfe', label: '파랑' },
  { color: '#fecdd3', label: '분홍' },
  { color: '#fed7aa', label: '주황' },
  { color: '#e9d5ff', label: '보라' },
  { color: '#ffffff', label: '흰색' },
]

const TEXT_COLORS = [
  { color: '#000000', label: '검정' },
  { color: '#16a34a', label: '초록' },
  { color: '#2563eb', label: '파랑' },
  { color: '#dc2626', label: '빨강' },
  { color: '#db2777', label: '핑크' },
  { color: '#ca8a04', label: '노랑' },
  { color: '#ffffff', label: '흰색' },
]

type Props = {
  page: Page
  workspaceId: string
  onSave: (content: string, title: string) => void
  onDone?: (content: string, title: string) => void
  onRegisterInsert?: (fn: (html: string) => void) => void
}

export default function RichEditor({ page, onSave, onDone, onRegisterInsert }: Props) {
  const [title, setTitle] = useState(page.title)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date|null>(null)
  const [linkModal, setLinkModal] = useState(false)
  const [linkText, setLinkText] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [highlightOpen, setHighlightOpen] = useState(false)
  const [colorOpen, setColorOpen] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [imgToolbar, setImgToolbar] = useState<{ img: HTMLImageElement; x: number; y: number } | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const savedRange = useRef<Range|null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout>|null>(null)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = page.content || '<p>내용을 작성하세요...</p>'
      updateWordCount()
    }
    setImgToolbar(null)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [page.id])

  // Register AI insert function with parent
  useEffect(() => {
    if (!onRegisterInsert) return
    onRegisterInsert((html: string) => {
      if (!editorRef.current) return
      // Move cursor to end, insert HTML
      editorRef.current.focus()
      const sel = window.getSelection()
      if (sel) {
        sel.removeAllRanges()
        const range = document.createRange()
        range.selectNodeContents(editorRef.current)
        range.collapse(false)
        sel.addRange(range)
      }
      document.execCommand('insertHTML', false, html)
      autoSave()
    })
  }, [onRegisterInsert])

  function handleEditorClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement
      const rect = img.getBoundingClientRect()
      setImgToolbar({ img, x: rect.left, y: rect.bottom + 6 })
    } else {
      setImgToolbar(null)
    }
  }

  function setImgWidth(pct: number | null) {
    if (!imgToolbar) return
    if (pct === null) {
      imgToolbar.img.style.width = ''
      imgToolbar.img.style.maxWidth = '100%'
    } else {
      imgToolbar.img.style.width = `${pct}%`
      imgToolbar.img.style.maxWidth = `${pct}%`
    }
    autoSave()
    setImgToolbar(null)
  }

  function deleteImg() {
    if (!imgToolbar) return
    imgToolbar.img.remove()
    autoSave()
    setImgToolbar(null)
  }

  function updateWordCount() {
    const text = editorRef.current?.innerText.trim() || ''
    setWordCount(text ? text.split(/\s+/).length : 0)
  }

  const save = useCallback(() => {
    if (!editorRef.current) return
    const content = editorRef.current.innerHTML
    if (!content) return
    setSaving(true)
    onSave(content, title)
    setSaving(false)
    setLastSaved(new Date())
  }, [title, onSave])

  const autoSave = useCallback(() => {
    updateWordCount()
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(save, 1500)
  }, [save])

  function exec(cmd: string, value?: string) {
    editorRef.current?.focus()
    document.execCommand(cmd, false, value)
  }

  function highlight(color: string) {
    editorRef.current?.focus()
    document.execCommand('hiliteColor', false, color)
    setHighlightOpen(false)
  }

  function removeHighlight() {
    editorRef.current?.focus()
    document.execCommand('hiliteColor', false, 'transparent')
    setHighlightOpen(false)
  }

  async function insertImage(file: File) {
    // 로그인 사용자는 클라우드(Storage)에 업로드 — 문서가 가벼워지고 용량 한도가 넉넉해진다
    const up = await uploadFile(file)
    if (up.ok) { insertImageSrc(up.url, file.name); return }
    if (up.reason === 'too-large') {
      alert(`파일이 플랜 한도를 초과했어요.\n무료: 파일당 ${FREE_FILE_LIMIT_MB}MB / 프리미엄: 파일당 ${PREMIUM_FILE_LIMIT_MB}MB`)
      return
    }
    // 미로그인/오류 시 기존 방식(문서에 직접 포함)으로 폴백
    const reader = new FileReader()
    reader.onload = e => insertImageSrc(e.target?.result as string, file.name)
    reader.readAsDataURL(file)
  }

  function insertImageSrc(src: string, alt: string) {
    {
      const img = document.createElement('img')
      img.src = src
      img.alt = alt
      img.style.maxWidth = '100%'
      img.style.borderRadius = '8px'
      img.style.margin = '8px 0'
      img.style.border = '1px solid var(--border)'
      const sel = window.getSelection()
      if (sel?.rangeCount && editorRef.current?.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0)
        range.deleteContents(); range.insertNode(img)
        range.setStartAfter(img); sel.removeAllRanges(); sel.addRange(range)
      } else {
        editorRef.current?.appendChild(img)
      }
      autoSave()
    }
  }

  function insertCodeBlock() {
    editorRef.current?.focus()
    const pre = document.createElement('pre')
    const code = document.createElement('code')
    code.textContent = '// 코드를 입력하세요'
    pre.appendChild(code)
    const sel = window.getSelection()
    if (sel?.rangeCount) {
      const range = sel.getRangeAt(0)
      range.deleteContents(); range.insertNode(pre)
      const r2 = document.createRange()
      r2.selectNodeContents(code)
      sel.removeAllRanges(); sel.addRange(r2)
    } else {
      editorRef.current?.appendChild(pre)
    }
    autoSave()
  }

  function insertVideo() {
    const url = window.prompt('유튜브 영상 주소를 붙여넣으세요:\n예) https://youtu.be/abc123 또는 https://www.youtube.com/watch?v=abc123')
    if (!url) return
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{6,20})/)
    if (!m) { alert('유튜브 주소를 인식하지 못했어요. 전체 URL을 붙여넣어 주세요.'); return }
    editorRef.current?.focus()
    const html = `<div style="position:relative;padding-bottom:56.25%;height:0;margin:12px 0;border-radius:10px;overflow:hidden">`
      + `<iframe src="https://www.youtube.com/embed/${m[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`
      + `</div><p></p>`
    document.execCommand('insertHTML', false, html)
    autoSave()
  }

  function insertTable() {
    editorRef.current?.focus()
    const html = `<table><thead><tr><th>제목 1</th><th>제목 2</th><th>제목 3</th></tr></thead><tbody><tr><td>내용</td><td>내용</td><td>내용</td></tr><tr><td>내용</td><td>내용</td><td>내용</td></tr></tbody></table><p></p>`
    document.execCommand('insertHTML', false, html)
    autoSave()
  }

  function openLinkModal() {
    const sel = window.getSelection()
    if (sel?.rangeCount) savedRange.current = sel.getRangeAt(0).cloneRange()
    setLinkText(sel?.toString() || '')
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
    autoSave()
  }

  const btn = (title: string, onClick: () => void, content: React.ReactNode, active?: boolean): React.ReactNode => (
    <button title={title} onClick={onClick}
      style={{ width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center',
        border:'none', borderRadius:6, cursor:'pointer', fontSize:'0.85rem', flexShrink:0,
        background: active ? 'var(--accent-light)' : 'transparent',
        color: active ? 'var(--accent-text)' : 'var(--text-muted)',
        transition:'background .1s' }}>
      {content}
    </button>
  )

  const div = <div style={{ width:1, height:20, background:'var(--border)', margin:'0 3px', flexShrink:0 }} />

  const inputStyle: React.CSSProperties = {
    width:'100%', padding:'9px 12px', borderRadius:8,
    border:'1px solid var(--border)', background:'var(--bg-secondary)',
    color:'var(--text)', fontSize:'0.875rem', outline:'none', marginBottom:12,
  }

  function handleBack() {
    const c = editorRef.current?.innerHTML || ''
    if (onDone) onDone(c, title)
  }

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'32px 24px 80px' }}>
      {/* Back button */}
      {onDone && (
        <button onClick={handleBack}
          style={{ display:'inline-flex', alignItems:'center', gap:5, marginBottom:20,
            background:'none', border:'none', cursor:'pointer', padding:'4px 6px',
            color:'var(--text-faint)', fontSize:'0.82rem', fontWeight:500, borderRadius:6,
            transition:'color .15s' }}
          onMouseEnter={e => (e.currentTarget.style.color='var(--text-muted)')}
          onMouseLeave={e => (e.currentTarget.style.color='var(--text-faint)')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          워크스페이스
        </button>
      )}
      {/* Title row */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
        {page.emoji && <span style={{ fontSize:'2rem', lineHeight:1, flexShrink:0 }}>{page.emoji}</span>}
        <input value={title} onChange={e => { setTitle(e.target.value); autoSave() }}
          placeholder="페이지 제목"
          style={{ flex:1, border:'none', outline:'none', background:'transparent',
            fontSize:'2rem', fontWeight:800, color:'var(--text)',
            fontFamily:'inherit', lineHeight:1.2 }} />
      </div>

      {/* Meta */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20, paddingBottom:20,
        borderBottom:'1px solid var(--border)', fontSize:'0.78rem', color:'var(--text-faint)' }}>
        <span>{wordCount}단어</span>
        <span>{lastSaved ? `${lastSaved.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})} 자동저장됨` : '작성 중...'}</span>
      </div>

      {/* TOOLBAR */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:1, padding:'8px 10px',
        background:'var(--bg-secondary)', border:'1px solid var(--border)',
        borderBottom:'none', borderRadius:'8px 8px 0 0',
        position:'sticky', top:60, zIndex:10 }}>

        {/* Heading */}
        <select onChange={e => { exec('formatBlock', e.target.value); e.target.value='p' }}
          style={{ height:28, padding:'0 6px', border:'1px solid var(--border)', borderRadius:5,
            background:'var(--bg)', color:'var(--text)', fontSize:'0.78rem', cursor:'pointer', marginRight:2 }}>
          <option value="p">본문</option>
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
        </select>

        {div}

        {btn('굵게 (Ctrl+B)', () => exec('bold'), <b>B</b>)}
        {btn('기울임 (Ctrl+I)', () => exec('italic'), <i>I</i>)}
        {btn('밑줄 (Ctrl+U)', () => exec('underline'), <u>U</u>)}
        {btn('취소선', () => exec('strikeThrough'), <s>S</s>)}

        {div}

        {/* Highlight */}
        <div style={{ position:'relative' }}>
          <button onClick={() => setHighlightOpen(o=>!o)} title="형광펜"
            style={{ width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center',
              border:'none', borderRadius:6, cursor:'pointer', background: highlightOpen ? 'var(--accent-light)' : 'transparent',
              color:'var(--text-muted)', gap:2 }}>
            <span style={{ fontSize:'0.85rem', fontWeight:700 }}>A</span>
            <span style={{ width:14, height:3, background:'#fef08a', borderRadius:2, display:'block', marginBottom:-2 }} />
          </button>
          {highlightOpen && (
            <>
              <div style={{ position:'fixed', inset:0, zIndex:49 }} onClick={() => setHighlightOpen(false)} />
              <div style={{ position:'absolute', top:'110%', left:0, zIndex:50, background:'var(--bg)',
                border:'1px solid var(--border)', borderRadius:10, padding:10, boxShadow:'var(--shadow-lg)',
                display:'flex', flexDirection:'column', gap:6, minWidth:120 }}>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {HIGHLIGHT_COLORS.map(h => (
                    <button key={h.color} onClick={() => highlight(h.color)} title={h.label}
                      style={{ width:22, height:22, borderRadius:4, background:h.color,
                        border:'1px solid rgba(0,0,0,.15)', cursor:'pointer' }} />
                  ))}
                </div>
                <button onClick={removeHighlight}
                  style={{ fontSize:'0.75rem', color:'var(--text-faint)', background:'none',
                    border:'1px solid var(--border)', borderRadius:5, padding:'3px 6px', cursor:'pointer' }}>
                  형광펜 제거
                </button>
              </div>
            </>
          )}
        </div>

        {div}

        {/* 글자 색상 — preset palette */}
        <div style={{ position:'relative' }}>
          <button onClick={() => {
            const sel = window.getSelection()
            if (sel?.rangeCount) savedRange.current = sel.getRangeAt(0).cloneRange()
            setColorOpen(o => !o)
            setHighlightOpen(false)
          }} title="글자 색상"
            style={{ width:30, height:30, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              border:'none', borderRadius:6, cursor:'pointer',
              background: colorOpen ? 'var(--accent-light)' : 'transparent', gap:2 }}>
            <span style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--text-muted)', lineHeight:1 }}>A</span>
            <span id="color-indicator" style={{ width:14, height:3, background:'#2563eb', borderRadius:2, display:'block' }} />
          </button>
          {colorOpen && (
            <>
              <div style={{ position:'fixed', inset:0, zIndex:49 }} onClick={() => setColorOpen(false)} />
              <div style={{ position:'absolute', top:'110%', left:0, zIndex:50, background:'var(--bg)',
                border:'1px solid var(--border)', borderRadius:10, padding:10, boxShadow:'var(--shadow-lg)',
                display:'flex', flexDirection:'column', gap:6, minWidth:130 }}>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {TEXT_COLORS.map(c => (
                    <button key={c.color} onClick={() => {
                      const indicator = document.getElementById('color-indicator')
                      if (indicator) indicator.style.background = c.color
                      if (savedRange.current) {
                        const sel = window.getSelection()
                        sel?.removeAllRanges(); sel?.addRange(savedRange.current)
                      }
                      exec('foreColor', c.color)
                      setColorOpen(false)
                    }} title={c.label}
                      style={{ width:22, height:22, borderRadius:4, background:c.color,
                        border:'1px solid rgba(0,0,0,.2)', cursor:'pointer' }} />
                  ))}
                </div>
                <button onClick={() => {
                  if (savedRange.current) {
                    const sel = window.getSelection()
                    sel?.removeAllRanges(); sel?.addRange(savedRange.current)
                  }
                  exec('removeFormat')
                  setColorOpen(false)
                }} style={{ fontSize:'0.75rem', color:'var(--text-faint)', background:'none',
                  border:'1px solid var(--border)', borderRadius:5, padding:'3px 6px', cursor:'pointer' }}>
                  색상 제거
                </button>
              </div>
            </>
          )}
        </div>

        {div}

        {btn('왼쪽 정렬', () => exec('justifyLeft'),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>)}
        {btn('가운데 정렬', () => exec('justifyCenter'),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>)}

        {div}

        {btn('글머리 기호', () => exec('insertUnorderedList'),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>)}
        {btn('번호 목록', () => exec('insertOrderedList'),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10H6"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>)}
        {btn('인용구', () => exec('formatBlock','blockquote'),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>)}

        {div}

        {btn('링크', openLinkModal,
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>)}
        {btn('이미지', () => fileInputRef.current?.click(),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>)}
        {btn('유튜브 동영상', insertVideo,
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="3"/><polygon points="10 9 15 12 10 15 10 9" fill="currentColor"/></svg>)}
        {btn('코드 블록', insertCodeBlock,
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>)}
        {btn('표', insertTable,
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>)}
        {btn('구분선', () => exec('insertHorizontalRule'),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>)}

        {div}

        {btn('실행 취소', () => exec('undo'),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>)}
        {btn('다시 실행', () => exec('redo'),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>)}

        <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
          <span style={{ fontSize:'0.72rem', color: saving ? 'var(--accent-text)' : lastSaved ? 'var(--text-faint)' : 'var(--text-faint)',
            alignSelf:'center', whiteSpace:'nowrap' }}>
            {saving ? '저장 중...' : lastSaved ? '✓ 저장됨' : ''}
          </span>
          {onDone && (
            <button onClick={() => { const c = editorRef.current?.innerHTML||''; onDone(c, title) }}
              style={{ height:28, padding:'0 12px', borderRadius:6, border:'none',
                background:'var(--accent)', color:'white', fontSize:'0.8rem',
                fontWeight:700, cursor:'pointer' }}>
              완료
            </button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display:'none' }}
        onChange={e => { Array.from(e.target.files||[]).forEach(insertImage); e.target.value='' }} />

      {/* EDITOR */}
      <div ref={editorRef} contentEditable suppressContentEditableWarning
        className="editor-content"
        onInput={autoSave}
        onClick={handleEditorClick}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith('image/')).forEach(insertImage) }}
        onPaste={e => {
          const imgItem = Array.from(e.clipboardData.items).find(i=>i.type.startsWith('image/'))
          if (imgItem) { e.preventDefault(); const f=imgItem.getAsFile(); if(f) insertImage(f); return }
          const html = e.clipboardData.getData('text/html')
          if (html) {
            e.preventDefault()
            // Sanitize with DOMPurify — removes iframes, scripts, embeds, forms, event handlers
            const clean = DOMPurify.sanitize(html, {
              ALLOWED_TAGS: ['b','i','u','s','strong','em','a','p','br',
                'h1','h2','h3','h4','h5','h6','ul','ol','li',
                'blockquote','pre','code','table','thead','tbody','tr','th','td',
                'img','hr','span','div','sup','sub'],
              ALLOWED_ATTR: ['href','src','alt','target','rel','style'],
              ALLOW_DATA_ATTR: false,
            })
            // Strip inline styles down to safe-only (color, font-weight, text-decoration, background-color, font-style)
            const tmp = document.createElement('div')
            tmp.innerHTML = clean
            tmp.querySelectorAll<HTMLElement>('[style]').forEach(el => {
              const s = el.style
              const safe: string[] = []
              if (s.color) safe.push(`color:${s.color}`)
              if (s.fontWeight) safe.push(`font-weight:${s.fontWeight}`)
              if (s.textDecoration) safe.push(`text-decoration:${s.textDecoration}`)
              if (s.backgroundColor) safe.push(`background-color:${s.backgroundColor}`)
              if (s.fontStyle) safe.push(`font-style:${s.fontStyle}`)
              el.setAttribute('style', safe.join(';'))
            })
            tmp.querySelectorAll<HTMLImageElement>('img').forEach(img => {
              img.style.maxWidth = '100%'; img.removeAttribute('width'); img.removeAttribute('height')
            })
            document.execCommand('insertHTML', false, tmp.innerHTML)
            autoSave()
          }
        }}
        style={{ border:'1px solid var(--border)', borderRadius:'0 0 8px 8px', padding:'32px 40px',
          background:'var(--bg)', minHeight:500, outline:'none',
          overflowX:'hidden', wordBreak:'break-word', overflowWrap:'break-word' }}
      />

      {/* IMAGE RESIZE TOOLBAR */}
      {imgToolbar && (
        <>
          <div style={{ position:'fixed', inset:0, zIndex:99 }} onClick={() => setImgToolbar(null)} />
          <div style={{
            position:'fixed', left: imgToolbar.x, top: imgToolbar.y, zIndex:100,
            background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10,
            boxShadow:'var(--shadow-lg)', padding:'8px 10px',
            display:'flex', alignItems:'center', gap:6,
          }}>
            <span style={{ fontSize:'0.72rem', color:'var(--text-faint)', marginRight:2 }}>크기:</span>
            {[25,50,75,100].map(p => (
              <button key={p} onClick={() => setImgWidth(p)}
                style={{ padding:'4px 8px', borderRadius:6, border:'1px solid var(--border)',
                  background:'var(--bg-secondary)', color:'var(--text-muted)',
                  cursor:'pointer', fontSize:'0.75rem', fontWeight:600 }}>
                {p}%
              </button>
            ))}
            <button onClick={() => setImgWidth(null)}
              style={{ padding:'4px 8px', borderRadius:6, border:'1px solid var(--border)',
                background:'var(--bg-secondary)', color:'var(--text-muted)',
                cursor:'pointer', fontSize:'0.75rem', fontWeight:600 }}>
              원본
            </button>
            <div style={{ width:1, height:18, background:'var(--border)', margin:'0 2px' }} />
            <button onClick={deleteImg}
              style={{ padding:'4px 8px', borderRadius:6, border:'1px solid #fecdd3',
                background:'#fef2f2', color:'#dc2626',
                cursor:'pointer', fontSize:'0.75rem', fontWeight:600 }}>
              삭제
            </button>
          </div>
        </>
      )}

      <div style={{ fontSize:'0.75rem', color:'var(--text-faint)', marginTop:8, textAlign:'right' }}>
        이미지를 드래그하거나 붙여넣기 하세요
      </div>

      {/* LINK MODAL */}
      {linkModal && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,.5)',
          display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => e.target===e.currentTarget && setLinkModal(false)}>
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14,
            padding:24, width:'90%', maxWidth:400, boxShadow:'var(--shadow-lg)' }}>
            <h3 style={{ color:'var(--text)', fontWeight:700, marginBottom:16 }}>링크 삽입</h3>
            <label style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>텍스트</label>
            <input style={inputStyle} value={linkText} onChange={e=>setLinkText(e.target.value)} placeholder="링크 텍스트" />
            <label style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>URL</label>
            <input style={inputStyle} value={linkUrl} onChange={e=>setLinkUrl(e.target.value)} placeholder="https://" autoFocus />
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
              <button onClick={() => setLinkModal(false)}
                style={{ padding:'8px 16px', borderRadius:8, border:'1px solid var(--border)',
                  background:'var(--bg-secondary)', color:'var(--text)', cursor:'pointer', fontWeight:600, fontSize:'0.875rem' }}>
                취소
              </button>
              <button onClick={insertLink}
                style={{ padding:'8px 16px', borderRadius:8, border:'none',
                  background:'var(--accent)', color:'white', cursor:'pointer', fontWeight:700, fontSize:'0.875rem' }}>
                삽입
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
