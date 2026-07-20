'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

declare global {
  interface Window {
    pdfjsLib: any
  }
}

type Props = {
  dataUrl: string
  title: string
  onClose: () => void
}

export default function PdfFlipViewer({ dataUrl, title, onClose }: Props) {
  const [pages, setPages] = useState<string[]>([])       // canvas data URLs per page
  const [loading, setLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)
  const [currentSpread, setCurrentSpread] = useState(0)  // index of left-page (0, 2, 4, …)
  const [flipping, setFlipping] = useState<'next' | 'prev' | null>(null)
  const [pdfjsReady, setPdfjsReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load PDF.js from CDN once
  useEffect(() => {
    if (window.pdfjsLib) { setPdfjsReady(true); return }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      setPdfjsReady(true)
    }
    document.head.appendChild(script)
  }, [])

  // Render PDF pages to canvas data URLs
  useEffect(() => {
    if (!pdfjsReady || !dataUrl) return

    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setPages([])
        const raw = atob(dataUrl.split(',')[1])
        const bytes = new Uint8Array(raw.length)
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)

        const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise
        const total = pdf.numPages
        const rendered: string[] = []

        for (let i = 1; i <= total; i++) {
          if (cancelled) return
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: 1.8 })
          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise
          rendered.push(canvas.toDataURL('image/jpeg', 0.85))
          setLoadProgress(Math.round((i / total) * 100))
          if (!cancelled) setPages([...rendered])
        }
        if (!cancelled) setLoading(false)
      } catch (err) {
        console.error(err)
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [pdfjsReady, dataUrl])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')  goPrev()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const totalPages = pages.length
  // Spreads: cover alone (spread 0 = page 0 only), then pairs (1-2, 3-4…), last might be alone
  const maxSpread = Math.max(0, totalPages - 1)

  function goNext() {
    if (flipping || currentSpread >= maxSpread) return
    setFlipping('next')
    setTimeout(() => {
      setCurrentSpread(s => Math.min(s + 2, maxSpread))
      setFlipping(null)
    }, 600)
  }

  function goPrev() {
    if (flipping || currentSpread <= 0) return
    setFlipping('prev')
    setTimeout(() => {
      setCurrentSpread(s => Math.max(s - 2, 0))
      setFlipping(null)
    }, 600)
  }

  // Which pages to show: left = currentSpread, right = currentSpread + 1
  const leftPage  = pages[currentSpread]  ?? null
  const rightPage = pages[currentSpread + 1] ?? null

  const isCover = currentSpread === 0 && totalPages > 0

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,10,20,.92)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)',
        color: '#fff', zIndex: 10,
      }}>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          📖 {title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!loading && (
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,.6)' }}>
              {currentSpread + 1}{rightPage ? `–${currentSpread + 2}` : ''} / {totalPages}
            </span>
          )}
          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff',
              width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            ✕
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📚</div>
          <div style={{ fontSize: '0.9rem', marginBottom: 12, color: 'rgba(255,255,255,.7)' }}>
            PDF 불러오는 중... {loadProgress}%
          </div>
          <div style={{ width: 200, height: 4, background: 'rgba(255,255,255,.2)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${loadProgress}%`, height: '100%', background: '#818cf8', transition: 'width .3s', borderRadius: 4 }} />
          </div>
        </div>
      )}

      {/* Book */}
      {!loading && pages.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, userSelect: 'none' }}>
          {/* Prev button */}
          <button onClick={goPrev} disabled={currentSpread <= 0 || !!flipping}
            style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: currentSpread <= 0 ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.15)',
              color: currentSpread <= 0 ? 'rgba(255,255,255,.2)' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
              transition: 'background .15s', flexShrink: 0 }}>
            ‹
          </button>

          {/* Book spread container */}
          <div ref={containerRef} style={{
            position: 'relative',
            perspective: '2000px',
            display: 'flex',
          }}>
            {/* Book shadow */}
            <div style={{
              position: 'absolute', bottom: -16, left: '10%', right: '10%', height: 40,
              background: 'rgba(0,0,0,.6)', filter: 'blur(16px)', borderRadius: '50%',
              zIndex: -1,
            }} />

            {/* Left page */}
            <div style={{
              position: 'relative',
              width: 'clamp(160px, 28vw, 380px)',
              height: 'clamp(220px, 38vw, 540px)',
              transformOrigin: 'right center',
              transform: flipping === 'prev'
                ? 'rotateY(160deg)'
                : 'rotateY(0deg)',
              transition: flipping === 'prev' ? 'transform .6s cubic-bezier(.4,0,.2,1)' : 'none',
              transformStyle: 'preserve-3d',
              borderRadius: '4px 0 0 4px',
              overflow: 'hidden',
              boxShadow: '-4px 0 12px rgba(0,0,0,.4), inset -3px 0 8px rgba(0,0,0,.15)',
            }}>
              {leftPage ? (
                <img src={leftPage} alt={`페이지 ${currentSpread + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                    borderRadius: '4px 0 0 4px' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#f8f6f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#ccc', fontSize: '2rem', borderRadius: '4px 0 0 4px' }}>
                  📄
                </div>
              )}
              {/* Page curl effect */}
              <div style={{
                position: 'absolute', top: 0, right: 0, bottom: 0, width: 24,
                background: 'linear-gradient(to left, rgba(0,0,0,.08) 0%, transparent 100%)',
                pointerEvents: 'none',
              }} />
            </div>

            {/* Spine */}
            <div style={{
              width: 6, flexShrink: 0,
              background: 'linear-gradient(to right, #888, #bbb 40%, #888)',
              boxShadow: '0 0 8px rgba(0,0,0,.5)',
              zIndex: 2,
            }} />

            {/* Right page */}
            <div style={{
              position: 'relative',
              width: 'clamp(160px, 28vw, 380px)',
              height: 'clamp(220px, 38vw, 540px)',
              transformOrigin: 'left center',
              transform: flipping === 'next'
                ? 'rotateY(-160deg)'
                : 'rotateY(0deg)',
              transition: flipping === 'next' ? 'transform .6s cubic-bezier(.4,0,.2,1)' : 'none',
              transformStyle: 'preserve-3d',
              borderRadius: '0 4px 4px 0',
              overflow: 'hidden',
              boxShadow: '4px 0 12px rgba(0,0,0,.4), inset 3px 0 8px rgba(0,0,0,.15)',
            }}>
              {rightPage ? (
                <img src={rightPage} alt={`페이지 ${currentSpread + 2}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                    borderRadius: '0 4px 4px 0' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#f8f6f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#ccc', fontSize: '2rem', borderRadius: '0 4px 4px 0' }}>
                  {currentSpread + 1 >= totalPages ? '끝' : '📄'}
                </div>
              )}
              {/* Page curl left edge */}
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0, width: 24,
                background: 'linear-gradient(to right, rgba(0,0,0,.08) 0%, transparent 100%)',
                pointerEvents: 'none',
              }} />
            </div>
          </div>

          {/* Next button */}
          <button onClick={goNext} disabled={currentSpread >= maxSpread || !!flipping}
            style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: currentSpread >= maxSpread ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.15)',
              color: currentSpread >= maxSpread ? 'rgba(255,255,255,.2)' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
              transition: 'background .15s', flexShrink: 0 }}>
            ›
          </button>
        </div>
      )}

      {/* Bottom hint */}
      {!loading && pages.length > 0 && (
        <div style={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,.35)', fontSize: '0.72rem', letterSpacing: '.04em' }}>
          ← → 방향키로 넘기기 · ESC로 닫기
        </div>
      )}
    </div>
  )
}
