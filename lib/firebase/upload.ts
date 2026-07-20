'use client'
// 파일 업로드 — 로그인 시 Firebase Storage에 저장하고 URL을 돌려준다.
// 서버 규칙이 플랜별 한도를 강제한다 (무료 10MB/파일, 프리미엄 100MB/파일).
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth } from './client'

export const FREE_FILE_LIMIT_MB = 10
export const PREMIUM_FILE_LIMIT_MB = 100

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; reason: 'not-logged-in' | 'too-large' | 'error' }

export async function uploadFile(file: File): Promise<UploadResult> {
  const user = auth.currentUser
  if (!user) return { ok: false, reason: 'not-logged-in' }
  try {
    const storage = getStorage()
    const safeName = file.name.replace(/[^\w.\-가-힣]/g, '_').slice(0, 80)
    const path = `bcb/${user.uid}/files/${Date.now()}-${safeName}`
    const snap = await uploadBytes(ref(storage, path), file, { contentType: file.type })
    const url = await getDownloadURL(snap.ref)
    return { ok: true, url }
  } catch (e) {
    const code = (e as { code?: string })?.code || ''
    // 규칙 위반(용량 초과)은 unauthorized로 온다
    if (code === 'storage/unauthorized') return { ok: false, reason: 'too-large' }
    console.error('[bcb-upload]', e)
    return { ok: false, reason: 'error' }
  }
}
