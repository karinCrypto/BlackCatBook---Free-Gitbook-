'use client'
import { useState, useEffect } from 'react'

type Invitee = {
  email: string
  invitedAt: string
  status: 'pending' | 'accepted'
}

type Props = {
  workspaceId: string
  workspaceName: string
  onClose: () => void
}

function storageKey(workspaceId: string) { return `bcb-invites-${workspaceId}` }

function getInvitees(workspaceId: string): Invitee[] {
  try { return JSON.parse(localStorage.getItem(storageKey(workspaceId)) || '[]') } catch { return [] }
}

function saveInvitees(workspaceId: string, list: Invitee[]) {
  localStorage.setItem(storageKey(workspaceId), JSON.stringify(list))
}

export default function ShareModal({ workspaceId, workspaceName, onClose }: Props) {
  const [invitees, setInvitees] = useState<Invitee[]>([])
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const MAX = 5

  useEffect(() => { setInvitees(getInvitees(workspaceId)) }, [workspaceId])

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/workspace/${workspaceId}`
    : ''

  function addInvitee() {
    setError('')
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError('올바른 이메일 주소를 입력해주세요'); return }
    if (invitees.length >= MAX) { setError(`최대 ${MAX}명까지 초대할 수 있어요`); return }
    if (invitees.some(i => i.email === trimmed)) { setError('이미 초대된 이메일이에요'); return }
    const updated = [...invitees, { email: trimmed, invitedAt: new Date().toISOString(), status: 'pending' as const }]
    setInvitees(updated)
    saveInvitees(workspaceId, updated)
    setEmail('')
  }

  function removeInvitee(em: string) {
    const updated = invitees.filter(i => i.email !== em)
    setInvitees(updated)
    saveInvitees(workspaceId, updated)
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,.6)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width:'100%', maxWidth:480, background:'var(--bg)',
        border:'1px solid var(--border)', borderRadius:16, boxShadow:'var(--shadow-lg)',
        padding:28, animation:'slideUp .2s ease' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--text)', marginBottom:2 }}>
              워크스페이스 공유
            </h2>
            <p style={{ fontSize:'0.78rem', color:'var(--text-faint)' }}>{workspaceName}</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer',
            color:'var(--text-muted)', fontSize:20, lineHeight:1 }}>×</button>
        </div>

        {/* Share link */}
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700,
            color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>
            공유 링크
          </label>
          <div style={{ display:'flex', gap:8 }}>
            <input readOnly value={shareUrl}
              style={{ flex:1, padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)',
                background:'var(--bg-secondary)', color:'var(--text-muted)', fontSize:'0.82rem', outline:'none' }} />
            <button onClick={copyLink}
              style={{ padding:'9px 16px', borderRadius:8, border:'none', cursor:'pointer',
                background: copied ? '#dcfce7' : 'var(--accent)',
                color: copied ? '#16a34a' : 'white',
                fontWeight:700, fontSize:'0.82rem', flexShrink:0, transition:'all .2s' }}>
              {copied ? '✓ 복사됨' : '복사'}
            </button>
          </div>
        </div>

        {/* Invite by email */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700,
            color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>
            이메일로 초대 ({invitees.length}/{MAX})
          </label>
          <div style={{ display:'flex', gap:8 }}>
            <input value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addInvitee()}
              placeholder="이메일 주소 입력"
              disabled={invitees.length >= MAX}
              style={{ flex:1, padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)',
                background:'var(--bg-secondary)', color:'var(--text)', fontSize:'0.875rem',
                outline:'none', opacity: invitees.length >= MAX ? 0.5 : 1 }} />
            <button onClick={addInvitee} disabled={invitees.length >= MAX}
              style={{ padding:'9px 16px', borderRadius:8, border:'none', cursor:'pointer',
                background:'var(--accent)', color:'white', fontWeight:700, fontSize:'0.82rem',
                flexShrink:0, opacity: invitees.length >= MAX ? 0.4 : 1 }}>
              초대
            </button>
          </div>
          {error && <p style={{ fontSize:'0.78rem', color:'#ef4444', marginTop:6 }}>{error}</p>}
        </div>

        {/* Invitee list */}
        {invitees.length > 0 && (
          <div style={{ border:'1px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
            {invitees.map((inv, i) => (
              <div key={inv.email} style={{
                display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                borderBottom: i < invitees.length - 1 ? '1px solid var(--border)' : 'none',
                background: 'var(--bg-secondary)'
              }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--accent-light)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'var(--accent-text)', fontWeight:700, fontSize:'0.85rem', flexShrink:0 }}>
                  {inv.email[0].toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text)',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {inv.email}
                  </div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-faint)' }}>
                    {inv.status === 'pending' ? '초대 대기 중' : '수락됨'} · {new Date(inv.invitedAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
                <span style={{ fontSize:'0.7rem', fontWeight:700, padding:'3px 8px', borderRadius:20,
                  background: inv.status === 'pending' ? 'var(--bg-tertiary)' : '#dcfce7',
                  color: inv.status === 'pending' ? 'var(--text-faint)' : '#16a34a' }}>
                  {inv.status === 'pending' ? '대기' : '수락'}
                </span>
                <button onClick={() => removeInvitee(inv.email)}
                  style={{ background:'none', border:'none', cursor:'pointer',
                    color:'var(--text-faint)', fontSize:16, lineHeight:1, padding:'0 2px',
                    flexShrink:0 }}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {invitees.length === 0 && (
          <div style={{ textAlign:'center', padding:'20px 0', fontSize:'0.82rem', color:'var(--text-faint)' }}>
            아직 초대한 사람이 없어요. 위에서 이메일을 입력해 초대하세요.
          </div>
        )}

        {/* Notice */}
        <div style={{ marginTop:16, padding:'10px 14px', borderRadius:8,
          background:'var(--accent-light)', border:'1px solid var(--border)',
          fontSize:'0.75rem', color:'var(--accent-text)', lineHeight:1.5 }}>
          💡 현재는 링크 공유 방식이에요. 초대받은 분께 링크를 직접 전달해주세요.
          Supabase 연동 시 자동 이메일 발송이 지원됩니다.
        </div>
      </div>
    </div>
  )
}
