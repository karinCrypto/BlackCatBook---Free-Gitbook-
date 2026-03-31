'use client'
import { useEffect, useRef } from 'react'
import type { Page } from '@/lib/localStorage/pages'

type Props = {
  page: Page
  onEdit: () => void
}

export default function DocViewer({ page, onEdit }: Props) {
  const contentRef = useRef<HTMLDivElement>(null)

  // Assign heading IDs for TOC anchor links
  useEffect(() => {
    if (!contentRef.current) return
    contentRef.current.querySelectorAll('h1,h2,h3').forEach((el, i) => {
      if (!el.id) el.id = `h-${i}`
    })
  }, [page.content])

  const updatedAt = new Date(page.updatedAt)
  const formatted = updatedAt.toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' })

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 32px 100px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 16 }}>
        <h1 style={{
          fontSize: '2.25rem', fontWeight: 800, color: 'var(--text)',
          lineHeight: 1.2, margin: 0, flex: 1, display:'flex', alignItems:'center', gap:12
        }}>
          {page.emoji && <span style={{ fontSize:'2rem' }}>{page.emoji}</span>}
          {page.title || '제목 없음'}
        </h1>
        <button
          onClick={onEdit}
          style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--bg-secondary)',
            color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem',
            fontWeight: 600, transition: 'all .15s', marginTop: 8,
          }}
          onMouseEnter={e => {
            const t = e.currentTarget
            t.style.background = 'var(--accent-light)'
            t.style.color = 'var(--accent-text)'
            t.style.borderColor = 'var(--accent)'
          }}
          onMouseLeave={e => {
            const t = e.currentTarget
            t.style.background = 'var(--bg-secondary)'
            t.style.color = 'var(--text-muted)'
            t.style.borderColor = 'var(--border)'
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          편집
        </button>
      </div>

      {/* Meta */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        fontSize: '0.78rem', color: 'var(--text-faint)',
        paddingBottom: 24, marginBottom: 32,
        borderBottom: '1px solid var(--border)'
      }}>
        <span>마지막 수정: {formatted}</span>
        {page.type === 'page' && (
          <span style={{
            padding: '2px 8px', borderRadius: 20,
            background: 'var(--accent-light)', color: 'var(--accent-text)',
            fontSize: '0.7rem', fontWeight: 700
          }}>
            문서
          </span>
        )}
      </div>

      {/* Content */}
      {page.content ? (
        <div
          ref={contentRef}
          className="prose"
          dangerouslySetInnerHTML={{ __html: page.content }}
          style={{ maxWidth: '100%' }}
        />
      ) : (
        <div style={{
          textAlign: 'center', padding: '60px 0',
          color: 'var(--text-faint)', fontSize: '0.9rem'
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
          <div style={{ marginBottom: 16 }}>아직 내용이 없어요</div>
          <button
            onClick={onEdit}
            style={{
              padding: '8px 20px', borderRadius: 8,
              background: 'var(--accent)', color: 'white',
              border: 'none', cursor: 'pointer', fontWeight: 700
            }}
          >
            작성 시작하기
          </button>
        </div>
      )}
    </div>
  )
}
