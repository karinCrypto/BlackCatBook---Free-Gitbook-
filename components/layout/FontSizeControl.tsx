'use client'
import { useEffect, useState } from 'react'

// 글자 크기 조절 (80%~150%) — 루트 폰트 크기를 바꿔 rem 기반 텍스트 전체에 적용
const KEY = 'bcb-font-scale'
const MIN = 80, MAX = 150, STEP = 10

function apply(scale: number) {
  document.documentElement.style.fontSize = scale + '%'
}

export default function FontSizeControl() {
  const [scale, setScale] = useState(100)

  useEffect(() => {
    const saved = parseInt(localStorage.getItem(KEY) || '100', 10)
    const s = isNaN(saved) ? 100 : Math.min(MAX, Math.max(MIN, saved))
    setScale(s); apply(s)
  }, [])

  function change(delta: number) {
    const s = Math.min(MAX, Math.max(MIN, scale + delta))
    setScale(s); apply(s)
    localStorage.setItem(KEY, String(s))
  }

  const btn: React.CSSProperties = {
    width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)',
    background: 'var(--bg-tertiary)', color: 'var(--text)', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  }

  return (
    <span title="글자 크기 조절" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <button onClick={() => change(-STEP)} disabled={scale <= MIN} style={{ ...btn, fontSize: 11, opacity: scale <= MIN ? 0.4 : 1 }}>A−</button>
      <button onClick={() => change(STEP)} disabled={scale >= MAX} style={{ ...btn, fontSize: 14, fontWeight: 700, opacity: scale >= MAX ? 0.4 : 1 }}>A+</button>
      {scale !== 100 && (
        <button onClick={() => change(100 - scale)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--text-faint)', padding: '0 2px' }}>
          {scale}%↺
        </button>
      )}
    </span>
  )
}
