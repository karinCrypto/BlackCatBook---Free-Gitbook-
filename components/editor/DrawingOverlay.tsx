'use client'
import { useEffect, useRef, useState } from 'react'

type Tool = 'pen' | 'highlight' | 'eraser'

type Props = {
  onClose: () => void
}

export default function DrawingOverlay({ onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState('#ef4444')
  const [size, setSize] = useState(4)
  const [canUndo, setCanUndo] = useState(false)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const history = useRef<ImageData[]>([])

  // Resize canvas to fill window
  useEffect(() => {
    const canvas = canvasRef.current!
    function resize() {
      const saved = canvas.toDataURL()
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const img = new Image(); img.src = saved
      img.onload = () => canvas.getContext('2d')!.drawImage(img, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  function getPos(e: MouseEvent | TouchEvent) {
    const src = 'touches' in e ? e.touches[0] : e
    return { x: src.clientX, y: src.clientY }
  }

  function saveHistory() {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
    if (history.current.length > 50) history.current.shift()
    setCanUndo(true)
  }

  function undo() {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const prev = history.current.pop()
    if (prev) ctx.putImageData(prev, 0, 0)
    setCanUndo(history.current.length > 0)
  }

  function clear() {
    saveHistory()
    const canvas = canvasRef.current!
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
  }

  function save() {
    const a = document.createElement('a')
    a.download = `drawing-${Date.now()}.png`
    a.href = canvasRef.current!.toDataURL()
    a.click()
  }

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    function onStart(e: MouseEvent | TouchEvent) {
      e.preventDefault()
      saveHistory()
      drawing.current = true
      last.current = getPos(e)
    }

    function onMove(e: MouseEvent | TouchEvent) {
      e.preventDefault()
      if (!drawing.current || !last.current) return
      const p = getPos(e)
      ctx.beginPath()
      if (tool === 'eraser') {
        ctx.clearRect(p.x - size * 3, p.y - size * 3, size * 6, size * 6)
      } else if (tool === 'highlight') {
        ctx.globalAlpha = 0.35
        ctx.lineWidth = size * 5
        ctx.strokeStyle = color
        ctx.lineCap = 'square'
        ctx.moveTo(last.current.x, last.current.y)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
        ctx.globalAlpha = 1
      } else {
        ctx.lineWidth = size
        ctx.strokeStyle = color
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.moveTo(last.current.x, last.current.y)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
      }
      last.current = p
    }

    function onEnd() { drawing.current = false; last.current = null }

    canvas.addEventListener('mousedown', onStart)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseup', onEnd)
    canvas.addEventListener('mouseleave', onEnd)
    canvas.addEventListener('touchstart', onStart, { passive: false })
    canvas.addEventListener('touchmove', onMove, { passive: false })
    canvas.addEventListener('touchend', onEnd)

    return () => {
      canvas.removeEventListener('mousedown', onStart)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseup', onEnd)
      canvas.removeEventListener('mouseleave', onEnd)
      canvas.removeEventListener('touchstart', onStart)
      canvas.removeEventListener('touchmove', onMove)
      canvas.removeEventListener('touchend', onEnd)
    }
  }, [tool, color, size])

  const btnStyle = (active: boolean) => ({
    padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: active ? 'var(--accent)' : 'rgba(255,255,255,.15)',
    color: active ? '#fff' : 'rgba(255,255,255,.85)',
    fontSize: '0.82rem', fontWeight: 600, transition: 'background .15s',
  } as React.CSSProperties)

  return (
    <>
      {/* Full-screen canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', inset: 0, zIndex: 500,
          cursor: tool === 'eraser' ? 'cell' : 'crosshair',
          touchAction: 'none',
          pointerEvents: 'all',
        }}
      />

      {/* Floating palette */}
      <div style={{
        position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)',
        zIndex: 501,
        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center',
        background: 'rgba(20,20,30,.88)', backdropFilter: 'blur(12px)',
        borderRadius: 14, padding: '8px 14px',
        boxShadow: '0 4px 24px rgba(0,0,0,.4)',
        userSelect: 'none',
      }}>
        {/* Tools */}
        <button style={btnStyle(tool === 'pen')}       onClick={() => setTool('pen')}>✏️ 펜</button>
        <button style={btnStyle(tool === 'highlight')} onClick={() => setTool('highlight')}>🖊 형광펜</button>
        <button style={btnStyle(tool === 'eraser')}    onClick={() => setTool('eraser')}>🧹 지우개</button>

        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,.2)', margin: '0 2px' }} />

        {/* Color */}
        <input type="color" value={color} onChange={e => setColor(e.target.value)}
          style={{ width: 28, height: 28, borderRadius: 8, border: '2px solid rgba(255,255,255,.3)',
            cursor: 'pointer', padding: 2, background: 'none' }} title="색상" />

        {/* Size */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,.5)' }}>굵기</span>
          <input type="range" min={1} max={24} value={size} onChange={e => setSize(+e.target.value)}
            style={{ width: 72, accentColor: 'var(--accent)' }} />
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,.5)', minWidth: 16 }}>{size}</span>
        </div>

        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,.2)', margin: '0 2px' }} />

        {/* Actions */}
        <button onClick={undo} disabled={!canUndo}
          style={{ ...btnStyle(false), opacity: canUndo ? 1 : 0.4 }}>↩ 실행취소</button>
        <button onClick={clear} style={btnStyle(false)}>🗑 지우기</button>
        <button onClick={save} style={btnStyle(false)}>💾 저장</button>

        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,.2)', margin: '0 2px' }} />

        {/* Close */}
        <button onClick={onClose}
          style={{ ...btnStyle(false), background: 'rgba(239,68,68,.7)', color: '#fff' }}>
          ✕ 닫기
        </button>
      </div>
    </>
  )
}
