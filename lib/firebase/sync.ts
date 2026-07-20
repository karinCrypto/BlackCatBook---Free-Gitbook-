'use client'
// 클라우드 동기화 엔진 — 로그인한 사용자의 워크스페이스/페이지를 Firestore에 백업.
// 저장 구조: bcb_users/{uid}/workspaces/{wsId} (메타+pageIds) + .../pages/{pageId}
// 전략: localStorage가 UI의 단일 소스, Firestore는 기기 간 백업.
//  - 푸시: 데이터 변경 2초 디바운스 후 전체 업서트 + 캐시 대비 삭제 반영
//  - 풀(로그인 시): 워크스페이스별 last-write-wins 병합
import { onAuthStateChanged, type User } from 'firebase/auth'
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore'
import { auth, db } from './client'
import { setSyncListener } from './syncBus'
import { getWorkspaces, type Workspace } from '@/lib/localStorage/workspaces'
import { getPages, type Page } from '@/lib/localStorage/pages'

const CACHE_KEY = 'bcb-sync-cache'

type SyncCache = {
  wsIds: string[]
  pageIds: Record<string, string[]>
}

function readCache(): SyncCache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{"wsIds":[],"pageIds":{}}')
  } catch { return { wsIds: [], pageIds: {} } }
}

function writeCache(c: SyncCache) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(c))
}

function wsLastModified(ws: Workspace, pages: Page[]): string {
  let max = ws.createdAt || ''
  for (const p of pages) if (p.updatedAt > max) max = p.updatedAt
  return max
}

let currentUser: User | null = null
let pushTimer: ReturnType<typeof setTimeout> | null = null
let pushing = false
let pendingPush = false
let started = false

export function getSyncUser(): User | null { return currentUser }

function schedulePush() {
  if (!currentUser) return
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => { void pushAll() }, 2000)
}

async function pushAll(): Promise<void> {
  const user = currentUser
  if (!user) return
  if (pushing) { pendingPush = true; return }
  pushing = true
  try {
    const cache = readCache()
    const workspaces = getWorkspaces()
    const ops: Array<(b: ReturnType<typeof writeBatch>) => void> = []
    const newCache: SyncCache = { wsIds: [], pageIds: {} }

    const wsCol = (uid: string) => collection(db, 'bcb_users', uid, 'workspaces')

    for (const ws of workspaces) {
      const pages = getPages(ws.id)
      const pageIds = pages.map(p => p.id)
      newCache.wsIds.push(ws.id)
      newCache.pageIds[ws.id] = pageIds
      const metaRef = doc(wsCol(user.uid), ws.id)
      ops.push(b => b.set(metaRef, { ...ws, pageIds, lastModified: wsLastModified(ws, pages) }))
      for (const p of pages) {
        const pRef = doc(collection(metaRef, 'pages'), p.id)
        ops.push(b => b.set(pRef, p))
      }
      // 이 기기에서 삭제된 페이지를 원격에서도 제거
      for (const oldId of cache.pageIds[ws.id] || []) {
        if (!pageIds.includes(oldId)) ops.push(b => b.delete(doc(collection(metaRef, 'pages'), oldId)))
      }
    }
    // 이 기기에서 삭제된 워크스페이스를 원격에서도 제거
    const localIds = new Set(workspaces.map(w => w.id))
    for (const oldWsId of cache.wsIds) {
      if (!localIds.has(oldWsId)) {
        const metaRef = doc(wsCol(user.uid), oldWsId)
        for (const pid of cache.pageIds[oldWsId] || []) {
          ops.push(b => b.delete(doc(collection(metaRef, 'pages'), pid)))
        }
        ops.push(b => b.delete(metaRef))
      }
    }

    // Firestore 배치 한도(500) 아래로 청크 커밋
    for (let i = 0; i < ops.length; i += 400) {
      const batch = writeBatch(db)
      for (const op of ops.slice(i, i + 400)) op(batch)
      await batch.commit()
    }
    writeCache(newCache)
  } catch (e) {
    console.error('[bcb-sync] push failed:', e)
  } finally {
    pushing = false
    if (pendingPush) { pendingPush = false; schedulePush() }
  }
}

async function pullAll(user: User): Promise<void> {
  try {
    const cache = readCache()
    const snap = await getDocs(collection(db, 'bcb_users', user.uid, 'workspaces'))
    const localWs = getWorkspaces()
    const localById = new Map(localWs.map(w => [w.id, w]))
    let mergedWs = [...localWs]
    let changed = false

    for (const d of snap.docs) {
      const remote = d.data() as Workspace & { pageIds?: string[]; lastModified?: string }
      const local = localById.get(remote.id)
      const locallyDeleted = !local && cache.wsIds.includes(remote.id)
      if (locallyDeleted) continue // 이 기기에서 지운 것 — 푸시 때 원격에서도 삭제됨

      const localModified = local ? wsLastModified(local, getPages(local.id)) : ''
      const remoteModified = remote.lastModified || ''
      if (!local || remoteModified > localModified) {
        // 원격이 최신 → 페이지까지 내려받아 로컬 덮어쓰기
        const pSnap = await getDocs(collection(d.ref, 'pages'))
        const pages = pSnap.docs.map(p => p.data() as Page)
        localStorage.setItem(`bcb-pages-${remote.id}`, JSON.stringify(pages))
        const { pageIds: _pi, lastModified: _lm, ...wsMeta } = remote
        if (local) {
          mergedWs = mergedWs.map(w => w.id === remote.id ? (wsMeta as Workspace) : w)
        } else {
          mergedWs = [wsMeta as Workspace, ...mergedWs]
        }
        changed = true
      }
    }

    if (changed) {
      localStorage.setItem('bcb-workspaces', JSON.stringify(mergedWs))
      window.dispatchEvent(new Event('bcb-cloud-updated'))
    }
    // 로컬에만 있는 데이터를 원격으로 올려 양방향 정합
    schedulePush()
  } catch (e) {
    console.error('[bcb-sync] pull failed:', e)
  }
}

export function startSync(onUser?: (u: User | null) => void) {
  if (typeof window === 'undefined') return
  if (started) return
  started = true
  setSyncListener(schedulePush)
  onAuthStateChanged(auth, user => {
    currentUser = user
    if (onUser) onUser(user)
    if (user) void pullAll(user)
  })
}
