'use client'
// 프리미엄 플랜 상태 — bcb_users/{uid}/meta/billing 문서에서 읽는다.
// 이 문서는 보안규칙상 클라이언트 쓰기 불가(서버 전용)라서 플랜 위조가 불가능하다.
import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from './client'
import { useAuth } from '@/components/auth/AuthProvider'

export type Plan = 'free' | 'premium'

export type Billing = {
  plan: Plan
  premiumUntil?: string // ISO — 이 시점 전이면 프리미엄 유효
}

export function usePlan(): { plan: Plan; loading: boolean } {
  const { user } = useAuth()
  const [plan, setPlan] = useState<Plan>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setPlan('free'); setLoading(false); return }
    const ref = doc(db, 'bcb_users', user.uid, 'meta', 'billing')
    const unsub = onSnapshot(ref, snap => {
      const b = snap.data() as Billing | undefined
      const active = b?.plan === 'premium' && (!b.premiumUntil || b.premiumUntil > new Date().toISOString())
      setPlan(active ? 'premium' : 'free')
      setLoading(false)
    }, () => { setPlan('free'); setLoading(false) })
    return unsub
  }, [user])

  return { plan, loading }
}

// 무료 플랜 한도 — 초과 시 요금제 페이지로 유도
export const FREE_LIMITS = {
  workspaces: 3,
  pagesPerWorkspace: 30,
}
