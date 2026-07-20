'use client'
import { useState } from 'react'

// 🐱 귀여운 플로팅 계산기 — 일반/공학용 토글
type Props = { onClose: () => void }

const SCI_KEYS = [
  ['sin', 'cos', 'tan', 'π'],
  ['ln', 'log', '√', '^'],
  ['(', ')', 'e', '!'],
]

const BASIC_KEYS = [
  ['7', '8', '9', '÷'],
  ['4', '5', '6', '×'],
  ['1', '2', '3', '−'],
  ['0', '.', '%', '+'],
]

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n) || n > 170) return NaN
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

function evaluate(expr: string, deg: boolean): string {
  let s = expr
    .replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-')
    .replace(/π/g, '(3.141592653589793)')
    .replace(/(?<![a-z])e(?![a-z])/g, '(2.718281828459045)')
    .replace(/√\(/g, 'sqrt(')
    .replace(/\^/g, '**')
    .replace(/(\d+(?:\.\d+)?)!/g, 'fact($1)')
    .replace(/(\d+(?:\.\d+)?)%/g, '($1/100)')
  // 허용 토큰만 남는지 검증 (안전한 계산)
  const stripped = s.replace(/sin|cos|tan|sqrt|ln|log|fact/g, '')
  if (/[^0-9+\-*/().\s]/.test(stripped.replace(/\*\*/g, ''))) return 'Error'
  const D = deg ? 'Math.PI/180*' : ''
  s = s
    .replace(/sin\(/g, `Math.sin(${D}`)
    .replace(/cos\(/g, `Math.cos(${D}`)
    .replace(/tan\(/g, `Math.tan(${D}`)
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/ln\(/g, 'Math.log(')
    .replace(/log\(/g, 'Math.log10(')
  try {
    const fn = new Function('fact', `"use strict"; return (${s});`)
    const v = fn(factorial)
    if (typeof v !== 'number' || !isFinite(v)) return 'Error'
    return String(Math.round(v * 1e10) / 1e10)
  } catch { return 'Error' }
}

export default function CalculatorPopup({ onClose }: Props) {
  const [expr, setExpr] = useState('')
  const [result, setResult] = useState('')
  const [sci, setSci] = useState(false)
  const [deg, setDeg] = useState(true)

  function press(k: string) {
    setResult('')
    if (k === 'sin' || k === 'cos' || k === 'tan' || k === 'ln' || k === 'log') setExpr(e => e + k + '(')
    else if (k === '√') setExpr(e => e + '√(')
    else setExpr(e => e + k)
  }

  function calc() { setResult(evaluate(expr, deg)) }

  const keyBtn = (k: string, wide = false): React.ReactNode => (
    <button key={k} onClick={() => press(k)}
      style={{ flex: wide ? 2 : 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
        border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)',
        fontSize: '0.95rem', fontWeight: 700 }}>
      {k}
    </button>
  )

  return (
    <div style={{ position: 'fixed', bottom: 90, right: 20, zIndex: 300, width: 268,
      background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', borderRadius: 20,
      boxShadow: '0 16px 48px rgba(0,0,0,.35)', padding: 14 }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <img src="/logo-black.png" alt="" style={{ width: 24, height: 24, borderRadius: 6 }} />
        <span style={{ fontWeight: 900, fontSize: '0.85rem', color: 'var(--text)' }}>냥산기</span>
        <button onClick={() => setSci(s => !s)}
          style={{ marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, cursor: 'pointer',
            border: '1px solid var(--border)', background: sci ? 'var(--accent-light)' : 'var(--bg)', color: sci ? 'var(--accent-text)' : 'var(--text-muted)' }}>
          공학용 {sci ? 'ON' : 'OFF'}
        </button>
        <button onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      {/* 디스플레이 */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12,
        padding: '10px 12px', marginBottom: 10, textAlign: 'right', minHeight: 58 }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', wordBreak: 'break-all', minHeight: 18 }}>{expr || '0'}</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: result === 'Error' ? '#dc2626' : 'var(--text)' }}>
          {result && `= ${result}`}
        </div>
      </div>
      {/* 공학 키 */}
      {sci && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
            <button onClick={() => setDeg(d => !d)}
              style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, cursor: 'pointer',
                border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--accent-text)' }}>
              {deg ? 'DEG (도)' : 'RAD (라디안)'}
            </button>
          </div>
          {SCI_KEYS.map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>{row.map(k => keyBtn(k))}</div>
          ))}
        </>
      )}
      {/* 기본 키 */}
      {BASIC_KEYS.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>{row.map(k => keyBtn(k))}</div>
      ))}
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => { setExpr(''); setResult('') }}
          style={{ flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer', border: '1px solid #fecdd3', background: '#fef2f2', color: '#dc2626', fontWeight: 800 }}>
          C
        </button>
        <button onClick={() => setExpr(e => e.slice(0, -1))}
          style={{ flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontWeight: 800 }}>
          ⌫
        </button>
        <button onClick={calc}
          style={{ flex: 2, padding: '10px 0', borderRadius: 10, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 900, fontSize: '1rem' }}>
          =
        </button>
      </div>
    </div>
  )
}
