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

type Provider = 'anthropic' | 'openai' | 'gemini'

const PROVIDERS: { id: Provider; label: string; color: string; keyPrefix: string; keyFormat: string; models: { id: string; label: string }[]; guide: { url: string; steps: string[] } }[] = [
  {
    id: 'anthropic',
    label: '🤖 Claude',
    color: '#cc785c',
    keyPrefix: 'sk-ant',
    keyFormat: 'sk-ant-api03-...',
    models: [
      { id: 'claude-opus-4-6', label: 'Claude Opus (최고 품질)' },
      { id: 'claude-sonnet-4-6', label: 'Claude Sonnet (빠름)' },
    ],
    guide: {
      url: 'https://console.anthropic.com/',
      steps: ['console.anthropic.com 접속', '회원가입 / 로그인', 'API Keys 메뉴', '+ Create Key 클릭', '키 복사 후 붙여넣기'],
    },
  },
  {
    id: 'openai',
    label: '💚 GPT',
    color: '#10a37f',
    keyPrefix: 'sk-',
    keyFormat: 'sk-proj-... 또는 sk-...',
    models: [
      { id: 'gpt-4o', label: 'GPT-4o (최고 품질)' },
      { id: 'gpt-4o-mini', label: 'GPT-4o mini (빠름/저렴)' },
      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    ],
    guide: {
      url: 'https://platform.openai.com/api-keys',
      steps: ['platform.openai.com/api-keys 접속', '회원가입 / 로그인', '+ Create new secret key', '키 복사 후 붙여넣기', '결제 수단 등록 필요'],
    },
  },
  {
    id: 'gemini',
    label: '🔵 Gemini',
    color: '#4285f4',
    keyPrefix: 'AIza',
    keyFormat: 'AIzaSy...',
    models: [
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (무료/빠름)' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (고품질)' },
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    ],
    guide: {
      url: 'https://aistudio.google.com/app/apikey',
      steps: ['aistudio.google.com/app/apikey 접속', 'Google 계정으로 로그인', '+ Create API key', '키 복사 후 붙여넣기', '무료 tier 제공 (분당 요청 제한)'],
    },
  },
]

const STORAGE_PREFIX = 'bcb-ai-key-'

export default function AIWritePanel({ onInsert, onClose }: Props) {
  const [provider, setProvider] = useState<Provider>('anthropic')
  const [apiKeys, setApiKeys] = useState<Record<Provider, string>>({ anthropic: '', openai: '', gemini: '' })
  const [savedKeys, setSavedKeys] = useState<Record<Provider, boolean>>({ anthropic: false, openai: false, gemini: false })
  const [showKey, setShowKey] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [selectedModel, setSelectedModel] = useState<Record<Provider, string>>({ anthropic: 'claude-opus-4-6', openai: 'gpt-4o', gemini: 'gemini-1.5-flash' })
  const [topic, setTopic] = useState('')
  const [references, setReferences] = useState('')
  const [style, setStyle] = useState('docs')
  const [language, setLanguage] = useState('ko')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const keys: Record<Provider, string> = { anthropic: '', openai: '', gemini: '' }
    const saved: Record<Provider, boolean> = { anthropic: false, openai: false, gemini: false }
    for (const p of PROVIDERS) {
      const v = localStorage.getItem(STORAGE_PREFIX + p.id) || ''
      keys[p.id] = v
      saved[p.id] = !!v
    }
    setApiKeys(keys)
    setSavedKeys(saved)
  }, [])

  const current = PROVIDERS.find(p => p.id === provider)!
  const currentKey = apiKeys[provider]

  function saveKey() {
    if (!currentKey.trim()) return
    localStorage.setItem(STORAGE_PREFIX + provider, currentKey.trim())
    setSavedKeys(s => ({ ...s, [provider]: true }))
    setError('')
  }

  function clearKey() {
    localStorage.removeItem(STORAGE_PREFIX + provider)
    setApiKeys(k => ({ ...k, [provider]: '' }))
    setSavedKeys(s => ({ ...s, [provider]: false }))
  }

  function handleRefPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = Array.from(e.clipboardData.items)
    const imageItem = items.find(i => i.type.startsWith('image/'))
    if (imageItem) {
      e.preventDefault()
      const file = imageItem.getAsFile()
      if (!file) return
      setReferences(prev => prev + `[이미지 첨부됨: ${file.name || '붙여넣기 이미지'}]\n`)
    }
  }

  async function handleGenerate() {
    if (!currentKey.trim()) { setError('API 키를 먼저 저장해주세요.'); return }
    if (!topic.trim()) { setError('주제를 입력해주세요.'); return }
    setLoading(true); setError(''); setProgress(`${current.label}에게 요청 중...`)

    try {
      setProgress('문서 생성 중... (10~30초 소요)')
      const res = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: currentKey.trim(),
          provider,
          model: selectedModel[provider],
          topic, references, style, language,
        }),
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
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Claude · GPT · Gemini</div>
          </div>
        </div>
        <button onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1 }}>×</button>
      </div>

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>

        {/* Provider selector */}
        <div>
          <label style={labelStyle}>🤖 AI 제공자</label>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            {PROVIDERS.map(p => (
              <button key={p.id} onClick={() => { setProvider(p.id); setError(''); setShowGuide(false) }}
                style={{ flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer', fontWeight: 700,
                  fontSize: '0.75rem', border: provider === p.id ? `1.5px solid ${p.color}` : '1.5px solid var(--border)',
                  background: provider === p.id ? `${p.color}18` : 'var(--bg)',
                  color: provider === p.id ? p.color : 'var(--text-muted)' }}>
                {p.label}
                {savedKeys[p.id] && <span style={{ display: 'block', fontSize: '0.65rem', marginTop: 2, opacity: .7 }}>✓ 저장됨</span>}
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={labelStyle}>🔑 {current.label} API 키</label>
            <button onClick={() => setShowGuide(o => !o)}
              style={{ fontSize: '0.7rem', color: current.color, background: 'none', border: 'none',
                cursor: 'pointer', fontWeight: 600, padding: 0 }}>
              {showGuide ? '▲ 닫기' : '❓ 발급 방법'}
            </button>
          </div>

          {showGuide && (
            <div style={{ marginBottom: 10, padding: '12px 14px', borderRadius: 10,
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              fontSize: '0.75rem', color: 'var(--text)', lineHeight: 1.7 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                {current.label} 키 형식: <code style={{ background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace', fontSize: '0.8em', color: 'var(--text)' }}>{current.keyFormat}</code>
              </div>
              <ol style={{ paddingLeft: 16, margin: 0, color: 'var(--text-muted)' }}>
                {current.guide.steps.map((s, i) => (
                  <li key={i} style={{ marginBottom: 3 }}>
                    {i === 0 ? <a href={current.guide.url} target="_blank" rel="noopener" style={{ color: current.color, fontWeight: 600 }}>{s}</a> : s}
                  </li>
                ))}
              </ol>
              {provider === 'gemini' && (
                <div style={{ marginTop: 8, padding: '6px 8px', borderRadius: 7,
                  background: 'var(--accent-light)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                  💚 <strong style={{ color: 'var(--text)' }}>Gemini Flash는 무료</strong>로 사용 가능해요
                </div>
              )}
              {provider === 'anthropic' && (
                <div style={{ marginTop: 8, padding: '6px 8px', borderRadius: 7,
                  background: 'var(--accent-light)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                  💡 신규 가입 시 <strong style={{ color: 'var(--text)' }}>$5 무료 크레딧</strong> 지급
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={currentKey}
                onChange={e => { setApiKeys(k => ({ ...k, [provider]: e.target.value })); setSavedKeys(s => ({ ...s, [provider]: false })) }}
                placeholder={current.keyFormat}
                style={{ ...inputStyle, paddingRight: 32, width: '100%', boxSizing: 'border-box' }}
              />
              <button onClick={() => setShowKey(s => !s)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14 }}>
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
            <button onClick={savedKeys[provider] ? clearKey : saveKey}
              style={{ padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700,
                fontSize: '0.78rem', flexShrink: 0, whiteSpace: 'nowrap',
                background: savedKeys[provider] ? '#fef2f2' : current.color,
                color: savedKeys[provider] ? '#dc2626' : 'white' }}>
              {savedKeys[provider] ? '삭제' : '저장'}
            </button>
          </div>
          {savedKeys[provider] && (
            <div style={{ fontSize: '0.72rem', color: current.color, marginTop: 4 }}>✓ 이 기기에 저장됨</div>
          )}
        </div>

        {/* Model selector */}
        <div>
          <label style={labelStyle}>⚡ 모델</label>
          <select value={selectedModel[provider]}
            onChange={e => setSelectedModel(m => ({ ...m, [provider]: e.target.value }))}
            style={{ ...inputStyle, marginTop: 6, cursor: 'pointer' }}>
            {current.models.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
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
                  border: style === s.id ? `1.5px solid ${current.color}` : '1.5px solid var(--border)',
                  background: style === s.id ? `${current.color}15` : 'var(--bg)',
                }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700,
                  color: style === s.id ? current.color : 'var(--text)' }}>{s.label}</div>
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
                  border: language === l.id ? `1.5px solid ${current.color}` : '1.5px solid var(--border)',
                  background: language === l.id ? `${current.color}15` : 'var(--bg)',
                  color: language === l.id ? current.color : 'var(--text)' }}>
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
            <span style={{ display: 'inline-block', fontSize: 16 }}>⏳</span>
            {progress}
          </div>
        )}

        {/* Generate button */}
        <button onClick={handleGenerate} disabled={loading || !topic.trim() || !currentKey.trim()}
          style={{ padding: '13px', borderRadius: 10, border: 'none', cursor: loading ? 'wait' : 'pointer',
            background: current.color, color: 'white', fontWeight: 800, fontSize: '0.95rem',
            opacity: (loading || !topic.trim() || !currentKey.trim()) ? 0.5 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'opacity .15s' }}>
          {loading ? <><span>⏳</span> 생성 중...</> : <><span>✨</span> 문서 생성하기</>}
        </button>

        {/* Tips */}
        <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>💡 잘 쓰는 팁</div>
          <div>• 주제를 구체적으로 적을수록 좋아요</div>
          <div>• 참고 자료가 많을수록 더 정확해요</div>
          <div>• 생성 후 편집 모드에서 수정 가능해요</div>
          <div>• 기존 내용에 <strong style={{ color: 'var(--text)' }}>추가</strong>로 삽입돼요</div>
          <div>• 무료: <strong style={{ color: 'var(--text)' }}>Gemini Flash</strong></div>
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
