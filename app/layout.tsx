import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'BlackCatBook', template: '%s | BlackCatBook' },
  description: '마크다운 기반 문서화 플랫폼 — 기술 문서, 블로그, 포트폴리오를 한 곳에서',
  keywords: ['documentation', 'docs', 'markdown', 'blog', 'portfolio'],
  openGraph: {
    type: 'website',
    siteName: 'BlackCatBook',
    title: 'BlackCatBook',
    description: '마크다운 기반 문서화 플랫폼',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="midnight" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* Apply saved theme BEFORE paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('bcb-theme') || 'midnight';
              document.documentElement.setAttribute('data-theme', t);
            } catch(e){}
          })();
        `}} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
