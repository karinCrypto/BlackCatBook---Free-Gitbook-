import RequireAuth from '@/components/auth/RequireAuth'
import MobileTabBar from '@/components/layout/MobileTabBar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="bcb-mobile-pad">{children}</div>
      <MobileTabBar />
    </RequireAuth>
  )
}
