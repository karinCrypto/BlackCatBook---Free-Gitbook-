'use client'
import { useState, useRef } from 'react'
import { getPdfBooks, savePdfBook, deletePdfBook, updatePdfBook, type PdfBook } from '@/lib/localStorage/pdfLibrary'
import PdfFlipViewer from './PdfFlipViewer'

type Props = { workspaceId: string }

export default function PdfLibraryPage({ workspaceId }: Props) {
  const [books, setBooks] = useState<PdfBook[]>(() => getPdfBooks(workspaceId))
  const [viewing, setViewing] = useState<PdfBook | null>(null)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function refresh() { setBooks(getPdfBooks(workspaceId)) }

  async function handleFiles(files: FileList | null) {
    if (!files) return
    setUploading(true)
    for (const file of Array.from(files)) {
      if (file.type !== 'application/pdf') continue
      const dataUrl = await readAsDataUrl(file)
      savePdfBook({
        workspaceId,
        title: file.name.replace(/\.pdf$/i, ''),
        fileName: file.name,
        dataUrl,
        pageCount: 0,
      })
    }
    setUploading(false)
    refresh()
  }

  function readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target!.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  function startEdit(book: PdfBook) {
    setEditingId(book.id)
    setEditTitle(book.title)
  }

  function saveEdit(book: PdfBook) {
    if (editTitle.trim()) {
      updatePdfBook(workspaceId, book.id, { title: editTitle.trim() })
      refresh()
    }
    setEditingId(null)
  }

  function handleDelete(id: string) {
    if (!confirm('이 PDF를 삭제할까요?')) return
    deletePdfBook(workspaceId, id)
    refresh()
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 28px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: '2rem' }}>📚</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>PDF 도서관</h1>
      </div>
      <p style={{ color: 'var(--text-faint)', fontSize: '0.875rem', marginBottom: 32 }}>
        PDF를 업로드하면 책처럼 넘기며 읽을 수 있어요.
      </p>

      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed var(--border)', borderRadius: 14,
          padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
          background: 'var(--bg-secondary)', marginBottom: 32,
          transition: 'border-color .15s, background .15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--accent-light)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)' }}
      >
        <input ref={inputRef} type="file" accept=".pdf" multiple style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)} />
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>
          {uploading ? '⏳' : '📄'}
        </div>
        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          {uploading ? 'PDF 처리 중...' : 'PDF 파일을 드래그하거나 클릭해서 추가'}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>
          여러 파일을 한 번에 올릴 수 있어요
        </div>
      </div>

      {/* Grid */}
      {books.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '40px 0', fontSize: '0.9rem' }}>
          아직 추가된 PDF가 없어요
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 20,
        }}>
          {books.map(book => (
            <div key={book.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Book cover */}
              <div
                onClick={() => setViewing(book)}
                style={{
                  position: 'relative', cursor: 'pointer',
                  borderRadius: '4px 10px 10px 4px',
                  overflow: 'hidden',
                  aspectRatio: '3/4',
                  background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-tertiary) 100%)',
                  boxShadow: '-3px 3px 0 rgba(0,0,0,.15), -6px 6px 0 rgba(0,0,0,.08), 0 8px 24px rgba(0,0,0,.12)',
                  transition: 'transform .2s, box-shadow .2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px) rotateY(-8deg)'; el.style.boxShadow = '-5px 8px 0 rgba(0,0,0,.18), -10px 12px 0 rgba(0,0,0,.1), 0 16px 32px rgba(0,0,0,.18)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '-3px 3px 0 rgba(0,0,0,.15), -6px 6px 0 rgba(0,0,0,.08), 0 8px 24px rgba(0,0,0,.12)' }}
              >
                {/* Spine */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: 10,
                  background: 'linear-gradient(to right, rgba(0,0,0,.18), rgba(0,0,0,.06))',
                }} />
                <div style={{ fontSize: '2.5rem', textAlign: 'center' }}>📖</div>
                {/* Overlay on hover */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,.0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background .2s',
                  color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,.35)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0)'}
                >
                  <span style={{ opacity: 0, transition: 'opacity .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0' }}>
                    펼쳐보기
                  </span>
                </div>
              </div>

              {/* Title */}
              {editingId === book.id ? (
                <input
                  autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  onBlur={() => saveEdit(book)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(book); if (e.key === 'Escape') setEditingId(null) }}
                  style={{ fontSize: '0.78rem', padding: '3px 6px', borderRadius: 5,
                    border: '1px solid var(--accent)', outline: 'none',
                    background: 'var(--bg-secondary)', color: 'var(--text)', width: '100%' }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                  <span
                    onClick={() => startEdit(book)}
                    style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)',
                      flex: 1, cursor: 'text', lineHeight: 1.4,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                    title={book.title}
                  >
                    {book.title}
                  </span>
                  <button onClick={() => handleDelete(book.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-faint)', fontSize: '0.75rem', padding: '0 2px',
                      flexShrink: 0, lineHeight: 1.4 }}
                    title="삭제">
                    ✕
                  </button>
                </div>
              )}
              <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
                {new Date(book.addedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Viewer */}
      {viewing && (
        <PdfFlipViewer
          dataUrl={viewing.dataUrl}
          title={viewing.title}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  )
}
