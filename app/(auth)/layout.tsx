export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="BlackCatBook" style={{ width:80, height:80, objectFit:'contain', margin:'0 auto', display:'block' }} />
          <h1 className="text-2xl font-black mt-3" style={{ color: 'var(--text)' }}>BlackCatBook</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
