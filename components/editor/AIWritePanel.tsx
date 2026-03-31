'use client'
import { useState, useEffect, useRef } from 'react'

type Props = {
  onInsert: (html: string) => void
  onClose: () => void
}

const STYLES = [
  { id: 'docs',    label: '📖 기술 문서', desc: '체계적인 기술 문서' },
  { id: 'blog',    label: '✍️ 블로그',   desc: '읽기 쉬운 블로그 포스트' },
  { id: 'summary', label: '📋 요약 정리', desc: '핵심만 간결하게' },
  { id: 'guide',   label: '🚀 가이드',   desc: '단계별 설명' },
  { id: 'report',  label: '📊 보고서',   desc: '보고서 형식' },
]

const API_KEY_STORAGE = 'bcb-anthropic-key'

export default function AIWritePanel({ onInsert, onClose }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [showKeyGuide, setShowKeyGuide] = useState(false)
  const [topic, setTopic] = useState('')
  const [references, setReferences] = useState('')
  const [style, setStyle] = useState('docs')
  const [language, setLanguage] = useState('ko')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem(API_KEY_STORAGE)
    if (saved) { setApiKey(saved); setApiKeySaved(true) }
  }, [])

  function saveApiKey() {
    if (!apiKey.trim()) return
    localStorage.setItem(API_KEY_STORAGE, apiKey.trim())
    setApiKeySaved(true)
    setError('')
  }

  function clearApiKey() {
    localStorage.removeItem(API_KEY_STORAGE)
    setApiKey(''); setApiKeySaved(false)
  }

  function handleRefPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = Array.from(e.clipboardData.items)
    const imageItem = items.find(i => i.type.startsWith('image/'))
    if (imageItem) {
      e.preventDefault()
      const file = imageItem.getAsFile()
      if (!file) return
      const note = `[이미지 첨부됨: ${file.name || '붙여넣기 이미지'} — AI가 이미지 설명을 참고합니다]\n`
      setReferences(prev => prev + note)
    }
  }

  async function handleGenerate() {
    if (!apiKey.trim()) { setError('API 키를 먼저 저장해주세요.'); return }
    if (!topic.trim()) { setError('주제를 입력해주세요.'); return }
    setLoading(true); setError(''); setProgress('Claude에게 요청 중...')

    try {
      setProgress('문서 생성 중... (10~30초 소요)')
      const res = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim(), topic, references, style, language }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || '오류가 발생했어요'); setLoading(false); setProgress(''); return }
      setProgress('완료! 문서에 삽입 중...')
      onInsert(data.html)
      setProgress('')
      setTopic(''); setReferences('')
    } catch {
      setError('네트워크 오류가 발생했어요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: 360, flexShrink: 0,
      background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', height: '100%',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>✨</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)' }}>AI 글쓰기</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Claude로 문서 자동 생성</div>
          </div>
        </div>
        <button onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1 }}>×</button>
      </div>

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>

        {/* API Key Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={labelStyle}>🔑 Anthropic API 키</label>
            <button onClick={() => setShowKeyGuide(o => !o)}
              style={{ fontSize: '0.7rem', color: 'var(--accent-text)', background: 'none', border: 'none',
                cursor: 'pointer', fontWeight: 600, padding: 0 }}>
              {showKeyGuide ? '▲ 닫기' : '❓ 키 안내'}
            </button>
          </div>

          {/* API Key Guide */}
          {showKeyGuide && (
            <div style={{ marginBottom: 10, padding: '12px 14px', borderRadius: 10,
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              fontSize: '0.75rem', color: 'var(--text)', lineHeight: 1.7 }}>
              <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 8, fontSize: '0.8rem' }}>
                🤖 어떤 API 키를 쓰나요?
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: 'var(--accent-text)' }}>Anthropic API 키</strong>만 사용해요.
                <br/>형식: <code style={{ background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: 4, color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.8em' }}>sk-ant-api03-...</code>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6, fontSize: '0.78rem' }}>
                📋 발급 방법
              </div>
              <ol style={{ paddingLeft: 16, margin: 0, color: 'var(--text-muted)' }}>
                <li style={{ marginBottom: 4 }}>
                  <a href="https://console.anthropic.com/" target="_blank" rel="noopener"
                    style={{ color: 'var(--link)', fontWeight: 600 }}>console.anthropic.com</a> 접속
                </li>
                <li style={{ marginBottom: 4 }}>회원가입 또는 로그인</li>
                <li style={{ marginBottom: 4 }}>상단 메뉴 → <strong>API Keys</strong></li>
                <li style={{ marginBottom: 4 }}><strong>+ Create Key</strong> 클릭</li>
                <li>생성된 키를 복사해 아래에 붙여넣기</li>
              </ol>
              <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8,
                background: 'var(--accent-light)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                💡 <strong style={{ color: 'var(--text)' }}>무료 크레딧 제공</strong>: 신규 가입 시 $5 크레딧 지급
                <br/>· 문서 1건 생성 시 약 <strong style={{ color: 'var(--text)' }}>$0.01~0.03</strong> 소모
                <br/>· 키는 이 기기 브라우저에만 저장, 서버로 전송되지 않아요
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setApiKeySaved(false) }}
                placeholder="sk-ant-api03-..."
                style={{ ...inputStyle, paddingRight: 32, width: '100%', boxSizing: 'border-box' }}
              />
              <button onClick={() => setShowKey(s => !s)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14 }}>
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
            <button onClick={apiKeySaved ? clearApiKey : saveApiKey}
              style={{ padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700,
                fontSize: '0.78rem', flexShrink: 0, whiteSpace: 'nowrap',
                background: apiKeySaved ? '#fef2f2' : 'var(--accent)',
                color: apiKeySaved ? '#dc2626' : 'white' }}>
              {apiKeySaved ? '삭제' : '저장'}
            </button>
          </div>
          {apiKeySaved && (
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-text)', marginTop: 4 }}>
              ✓ 이 기기에 저장됨
            </div>
          )}
        </div>

        {/* Topic */}
        <div>
          <label style={labelStyle}>📌 주제 *</label>
          <input value={topic} onChange={e => setTopic(e.target.value)}
            placeholder="예: React 18 새로운 기능 정리, 카페 창업 가이드..."
            style={{ ...inputStyle, marginTop: 6 }}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleGenerate()} />
        </div>

        {/* Style */}
        <div>
          <label style={labelStyle}>🎨 문서 스타일</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
            {STYLES.map(s => (
              <button key={s.id} onClick={() => setStyle(s.id)}
                style={{ padding: '8px 10px', borderRadius: 8, textAlign: 'left', cursor: 'pointer',
                  border: style === s.id ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                  background: style === s.id ? 'var(--accent-light)' : 'var(--bg)',
                }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700,
                  color: style === s.id ? 'var(--accent-text)' : 'var(--text)' }}>{s.label}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1 }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div>
          <label style={labelStyle}>🌐 언어</label>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            {[{ id:'ko', label:'🇰🇷 한국어' }, { id:'en', label:'🇺🇸 영어' }].map(l => (
              <button key={l.id} onClick={() => setLanguage(l.id)}
                style={{ flex: 1, padding: '7px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                  border: language === l.id ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                  background: language === l.id ? 'var(--accent-light)' : 'var(--bg)',
                  color: language === l.id ? 'var(--accent-text)' : 'var(--text)' }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* References */}
        <div>
          <label style={labelStyle}>
            📎 참고 자료 <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.7rem', color: 'var(--text-muted)' }}>(선택)</span>
          </label>
          <textarea
            ref={textareaRef}
            value={references}
            onChange={e => setReferences(e.target.value)}
            onPaste={handleRefPaste}
            placeholder={`텍스트, 링크, 메모를 붙여넣으세요\nCtrl+V로 이미지도 붙여넣기 가능`}
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, marginTop: 6, fontFamily: 'inherit' }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2',
            border: '1px solid #fecdd3', color: '#dc2626', fontSize: '0.82rem', lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        {/* Progress */}
        {progress && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--accent-light)',
            border: '1px solid var(--border)', color: 'var(--accent-text)',
            fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: 16 }}>⏳</span>
            {progress}
          </div>
        )}

        {/* Generate button */}
        <button onClick={handleGenerate} disabled={loading || !topic.trim() || !apiKey.trim()}
          style={{ padding: '13px', borderRadius: 10, border: 'none', cursor: loading ? 'wait' : 'pointer',
            background: 'var(--accent)', color: 'white', fontWeight: 800, fontSize: '0.95rem',
            opacity: (loading || !topic.trim() || !apiKey.trim()) ? 0.5 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'opacity .15s' }}>
          {loading ? <><span>⏳</span> 생성 중...</> : <><span>✨</span> 문서 생성하기</>}
        </button>

        {/* Tips */}
        <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>💡 잘 쓰는 팁</div>
          <div>• 주제를 구체적으로 적을수록 좋아요</div>
          <div>• 참고 자료는 많을수록 더 정확해요</div>
          <div>• 생성 후 편집 모드에서 수정 가능해요</div>
          <div>• 기존 내용에 <strong style={{ color: 'var(--text)' }}>추가</strong>로 삽입돼요</div>
        </div>

      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)',
  textTransform: 'uppercase', letterSpacing: '.05em', display: 'block',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg)',
  color: 'var(--text)', fontSize: '0.875rem', outline: 'none',
  boxSizing: 'border-box',
}
