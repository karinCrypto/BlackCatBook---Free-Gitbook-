import type { MetadataRoute } from 'next'

// PWA 매니페스트 — 모바일에서 "홈 화면에 추가"하면 네이티브 앱처럼 실행된다
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BlackCatBook',
    short_name: 'BlackCatBook',
    description: '붙여넣으면 3초 만에 문서 완성 — 노트·플래너·칸반·AI 편집',
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#1e293b',
    theme_color: '#1f1114',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
