'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TYPES = [
  { id: 'tech_docs', label: '📖 기술 문서', desc: 'API 문서, 가이드, 레퍼런스' },
  { id: 'blog', label: '✍️ 블로그', desc: '글, 포스트, 뉴스레터' },
  { id: 'portfolio', label: '🎨 포트폴리오', desc: '프로젝트, 작품, 이력서' },
]

export default function CreateWorkspaceButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('tech_docs')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function create() {
    if (!name.trim()) return
    setLoading(true)
    const res = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, description: desc }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.id) { setOpen(false); router.push(`/workspace/${data.id}`); router.refresh() }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: '0.875rem', outline: 'none', marginTop: 6,
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
        style={{ background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer' }}>
        + 새 워크스페이스
      </button>

      {open && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="modal">
            <h3 className="text-lg font-black mb-5" style={{ color: 'var(--text)' }}>새 워크스페이스</h3>

            <div className="mb-4">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>워크스페이스 이름</label>
              <input style={inputStyle} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="내 프로젝트 문서" autoFocus />
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>유형</label>
              <div className="flex flex-col gap-2 mt-2">
                {TYPES.map(t => (
                  <button key={t.id} onClick={() => setType(t.id)}
                    className="flex items-start gap-3 p-3 rounded-xl text-left transition-colors"
                    style={{
                      background: type === t.id ? 'var(--accent-light)' : 'var(--bg)',
                      border: type === t.id ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                      cursor: 'pointer',
                    }}>
                    <span className="font-semibold text-sm" style={{ color: type === t.id ? 'var(--accent-text)' : 'var(--text)' }}>{t.label}</span>
                    <span className="text-xs mt-0.5 block" style={{ color: 'var(--text-faint)' }}>{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>설명 (선택)</label>
              <input style={inputStyle} type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="간단한 설명을 입력하세요" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                취소
              </button>
              <button onClick={create} disabled={!name.trim() || loading} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer' }}>
                {loading ? '생성 중...' : '만들기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
