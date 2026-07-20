'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { signOut, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { startSync } from '@/lib/firebase/sync'

type AuthState = { user: User | null; loading: boolean; logout: () => Promise<void> }

const AuthContext = createContext<AuthState>({ user: null, loading: true, logout: async () => {} })

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    startSync(u => { setUser(u); setLoading(false) })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, logout: () => signOut(auth) }}>
      {children}
    </AuthContext.Provider>
  )
}
