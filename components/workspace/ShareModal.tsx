'use client'
import { useState, useEffect } from 'react'
import { useT } from '@/lib/i18n'

type Invitee = { email: string; invitedAt: string; status: 'pending' | 'accepted' }
type Props = { workspaceId: string; workspaceName: string; onClose: () => void }

function storageKey(id: string) { return `bcb-invites-${id}` }
function getInvitees(id: string): Invitee[] {
  try { return JSON.parse(localStorage.getItem(storageKey(id)) || '[]') } catch { return [] }
}
function saveInvitees(id: string, list: Invitee[]) {
  localStorage.setItem(storageKey(id), JSON.stringify(list))
}

export default function ShareModal({ workspaceId, workspaceName, onClose }: Props) {
  const tr = useT()
  const [invitees, setInvitees] = useState<Invitee[]>([])
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const MAX = 5

  useEffect(() => { setInvitees(getInvitees(workspaceId)) }, [workspaceId])

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/workspace/${workspaceId}` : ''

  function addInvitee() {
    setError('')
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError(tr('share.error.invalid')); return }
    if (invitees.length >= MAX) { setError(`최대 ${MAX}${tr('share.error.max')}`); return }
    if (invitees.some(i => i.email === trimmed)) { setError(tr('share.error.duplicate')); return }
    const updated = [...invitees, { email: trimmed, invitedAt: new Date().toISOString(), status: 'pending' as const }]
    setInvitees(updated); saveInvitees(workspaceId, updated); setEmail('')
  }

  function removeInvitee(em: string) {
    const updated = invitees.filter(i => i.email !== em)
    setInvitees(updated); saveInvitees(workspaceId, updated)
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,.6)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width:'100%', maxWidth:480, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:16, boxShadow:'var(--shadow-lg)', padding:28 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--text)', marginBottom:2 }}>{tr('share.title')}</h2>
            <p style={{ fontSize:'0.78rem', color:'var(--text-faint)' }}>{workspaceName}</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:20, lineHeight:1 }}>×</button>
        </div>

        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>{tr('share.link')}</label>
          <div style={{ display:'flex', gap:8 }}>
            <input readOnly value={shareUrl} style={{ flex:1, padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-secondary)', color:'var(--text-muted)', fontSize:'0.82rem', outline:'none' }} />
            <button onClick={copyLink} style={{ padding:'9px 16px', borderRadius:8, border:'none', cursor:'pointer', background: copied ? '#dcfce7' : 'var(--accent)', color: copied ? '#16a34a' : 'white', fontWeight:700, fontSize:'0.82rem', flexShrink:0, transition:'all .2s' }}>
              {copied ? tr('common.copied') : tr('common.copy')}
            </button>
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>
            {tr('share.invite')} ({invitees.length}/{MAX})
          </label>
          <div style={{ display:'flex', gap:8 }}>
            <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && addInvitee()}
              placeholder={tr('share.invite.placeholder')} disabled={invitees.length >= MAX}
              style={{ flex:1, padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-secondary)', color:'var(--text)', fontSize:'0.875rem', outline:'none', opacity: invitees.length >= MAX ? 0.5 : 1 }} />
            <button onClick={addInvitee} disabled={invitees.length >= MAX}
              style={{ padding:'9px 16px', borderRadius:8, border:'none', cursor:'pointer', background:'var(--accent)', color:'white', fontWeight:700, fontSize:'0.82rem', flexShrink:0, opacity: invitees.length >= MAX ? 0.4 : 1 }}>
              {tr('common.invite')}
            </button>
          </div>
          {error && <p style={{ fontSize:'0.78rem', color:'#ef4444', marginTop:6 }}>{error}</p>}
        </div>

        {invitees.length > 0 && (
          <div style={{ border:'1px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
            {invitees.map((inv, i) => (
              <div key={inv.email} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom: i < invitees.length - 1 ? '1px solid var(--border)' : 'none', background:'var(--bg-secondary)' }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent-text)', fontWeight:700, fontSize:'0.85rem', flexShrink:0 }}>
                  {inv.email[0].toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inv.email}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-faint)' }}>
                    {inv.status === 'pending' ? tr('share.pending') : tr('share.accepted')} · {new Date(inv.invitedAt).toLocaleDateString()}
                  </div>
                </div>
                <span style={{ fontSize:'0.7rem', fontWeight:700, padding:'3px 8px', borderRadius:20, background: inv.status === 'pending' ? 'var(--bg-tertiary)' : '#dcfce7', color: inv.status === 'pending' ? 'var(--text-faint)' : '#16a34a' }}>
                  {inv.status === 'pending' ? tr('share.status.pending') : tr('share.status.accepted')}
                </span>
                <button onClick={() => removeInvitee(inv.email)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-faint)', fontSize:16, lineHeight:1, padding:'0 2px', flexShrink:0 }}>×</button>
              </div>
            ))}
          </div>
        )}

        {invitees.length === 0 && (
          <div style={{ textAlign:'center', padding:'20px 0', fontSize:'0.82rem', color:'var(--text-faint)' }}>{tr('share.empty')}</div>
        )}

        <div style={{ marginTop:16, padding:'10px 14px', borderRadius:8, background:'var(--accent-light)', border:'1px solid var(--border)', fontSize:'0.75rem', color:'var(--accent-text)', lineHeight:1.5 }}>
          {tr('share.notice')}
        </div>
      </div>
    </div>
  )
}
