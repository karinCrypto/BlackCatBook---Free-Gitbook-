'use client'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase 웹 클라이언트 설정 — 공개 가능한 값 (보안은 Firestore 규칙 + Auth가 담당)
const firebaseConfig = {
  apiKey: 'AIzaSyDki_mY7vJwqAY0RNh8XBe5WOEu2CixzO4',
  authDomain: 'timelift-9814d.firebaseapp.com',
  projectId: 'timelift-9814d',
  storageBucket: 'timelift-9814d.firebasestorage.app',
  messagingSenderId: '73804247863',
  appId: '1:73804247863:web:79a799c2316c681b9d60b2',
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

export function isFirebaseConfigured(): boolean {
  return true
}
