import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/auth/AuthProvider'

export const metadata: Metadata = {
  metadataBase: new URL('https://blackcatbook.io'),
  title: { default: 'BlackCatBook — 붙여넣으면 3초 만에 문서 완성', template: '%s | BlackCatBook' },
  description: '메모를 붙여넣으면 AI가 블로그·보고서·기술문서로 즉시 변환! 무료 AI 편집, SEO 자동 생성, 클라우드 저장까지. 지금 무료로 시작하세요 🐾',
  keywords: ['documentation', 'docs', 'markdown', 'blog', 'portfolio', 'AI 글쓰기', 'SEO'],
  openGraph: {
    type: 'website',
    siteName: 'BlackCatBook',
    title: 'BlackCatBook — 붙여넣으면 3초 만에 문서 완성',
    description: '메모를 붙여넣으면 AI가 블로그·보고서로 즉시 변환! 무료 AI 편집 · SEO 자동 생성 · 클라우드 저장. 지금 무료로 시작하세요 🐾',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'BlackCatBook — 붙여넣으면 3초 만에 문서 완성' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlackCatBook — 붙여넣으면 3초 만에 문서 완성',
    description: '무료 AI 편집 · SEO 자동 생성 · 클라우드 저장 🐾',
    images: ['/og-image.png'],
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
              var fs = parseInt(localStorage.getItem('bcb-font-scale') || '100', 10);
              if (fs && fs !== 100) document.documentElement.style.fontSize = fs + '%';
            } catch(e){}
          })();
        `}} />
      </head>
      <body className="min-h-screen"><AuthProvider>{children}</AuthProvider></body>
    </html>
  )
}
