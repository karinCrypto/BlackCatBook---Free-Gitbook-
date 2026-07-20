// 무료 즉시 편집 — AI API 없이 브라우저에서 즉시 실행되는 서식 변환 엔진.
// 토큰/키/네트워크 불필요. 글 종류 + 톤을 고르면 입력 텍스트를 그 형식의 문서로 재구성한다.

export type DocType = 'blog' | 'docs' | 'report' | 'summary' | 'guide' | 'diary' | 'sns'
export type Tone = 'clean' | 'warm' | 'pro' | 'fun'

export const DOC_TYPES: { id: DocType; label: string; desc: string }[] = [
  { id: 'blog',    label: '✍️ 블로그',   desc: '도입-소제목-마무리' },
  { id: 'docs',    label: '📖 기술 문서', desc: '개요와 섹션 구조' },
  { id: 'report',  label: '📊 보고서',   desc: '개요-핵심-상세-결론' },
  { id: 'summary', label: '📋 요약 정리', desc: '핵심 불릿 정리' },
  { id: 'guide',   label: '🚀 가이드',   desc: '단계별 안내' },
  { id: 'diary',   label: '🌙 일기',     desc: '날짜와 감성 문단' },
  { id: 'sns',     label: '📱 SNS 글',   desc: '짧은 문장 + 해시태그' },
]

export const TONES: { id: Tone; label: string }[] = [
  { id: 'clean', label: '🤍 깔끔한' },
  { id: 'pro',   label: '💼 전문적인' },
  { id: 'warm',  label: '🌸 감성적인' },
  { id: 'fun',   label: '⚡ 발랄한' },
]

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

type Parsed = { title: string; paragraphs: string[]; bullets: string[] }

function parse(text: string): Parsed {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (!lines.length) return { title: '제목 없음', paragraphs: [], bullets: [] }
  const bullets: string[] = []
  const paras: string[] = []
  for (const l of lines) {
    const m = l.match(/^([-•*·]|\d+[.)])\s*(.+)$/)
    if (m) bullets.push(m[2])
    else paras.push(l)
  }
  let title = paras[0] && paras[0].length <= 42 ? paras.shift()! : ''
  if (!title) {
    const first = (paras[0] || bullets[0] || '새 문서')
    title = first.split(/[.!?。]/)[0].slice(0, 38)
  }
  return { title: title.replace(/[#*]/g, ''), paragraphs: paras, bullets }
}

// 문단 첫 구절로 소제목 생성
function headOf(p: string): string {
  const h = p.split(/[,.!?~…을를이가은는]/)[0].trim()
  return (h.length >= 4 && h.length <= 24 ? h : p.slice(0, 18)).trim()
}

function sentences(paras: string[]): string[] {
  return paras.join(' ').split(/(?<=[.!?。])\s+/).map(s => s.trim()).filter(s => s.length > 3)
}

function keywords(text: string, n = 4): string[] {
  const words = text.match(/[가-힣A-Za-z]{2,}/g) || []
  const stop = new Set(['그리고', '하지만', '그래서', '있는', '있다', '한다', '했다', '것이', '너무', '정말', '오늘', '되는', '하는', '이다'])
  const freq = new Map<string, number>()
  for (const w of words) { if (!stop.has(w)) freq.set(w, (freq.get(w) || 0) + 1) }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(e => e[0])
}

const TONE_DECOR: Record<Tone, { intro: string; outro: string; hEmoji: string }> = {
  clean: { intro: '', outro: '', hEmoji: '' },
  pro:   { intro: '본 문서는 다음 내용을 다룹니다.', outro: '이상입니다. 문의는 언제든 환영합니다.', hEmoji: '' },
  warm:  { intro: '차분히 정리해 보았어요.', outro: '읽어주셔서 고마워요. 🌷', hEmoji: '🌸 ' },
  fun:   { intro: '자, 바로 시작해볼까요?! 🙌', outro: '오늘도 화이팅! ⚡', hEmoji: '✨ ' },
}

export function transform(text: string, type: DocType, tone: Tone): string {
  const { title, paragraphs, bullets } = parse(text)
  const d = TONE_DECOR[tone]
  const h = (lv: number, s: string) => `<h${lv}>${d.hEmoji}${esc(s)}</h${lv}>`
  const p = (s: string) => `<p>${esc(s)}</p>`
  const ul = (items: string[]) => items.length ? `<ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : ''
  const out: string[] = []

  switch (type) {
    case 'docs': {
      out.push(h(1, title))
      if (d.intro) out.push(p(d.intro))
      if (paragraphs.length) { out.push(h(2, '개요')); out.push(p(paragraphs[0])) }
      paragraphs.slice(1).forEach(pa => { out.push(h(2, headOf(pa))); out.push(p(pa)) })
      if (bullets.length) { out.push(h(2, '주요 항목')); out.push(ul(bullets)) }
      break
    }
    case 'guide': {
      out.push(h(1, title))
      if (d.intro) out.push(p(d.intro))
      const steps = bullets.length ? bullets : sentences(paragraphs)
      steps.forEach((s, i) => { out.push(h(3, `${i + 1}단계. ${headOf(s)}`)); out.push(p(s)) })
      if (d.outro) out.push(p(d.outro))
      break
    }
    case 'report': {
      out.push(h(1, title))
      out.push(h(2, '개요'))
      out.push(p(paragraphs[0] || bullets[0] || ''))
      const core = bullets.length ? bullets : sentences(paragraphs).slice(0, 5)
      out.push(h(2, '핵심 내용')); out.push(ul(core))
      if (paragraphs.length > 1) { out.push(h(2, '상세')); paragraphs.slice(1).forEach(pa => out.push(p(pa))) }
      out.push(h(2, '결론')); out.push(p(d.outro || (paragraphs[paragraphs.length - 1] || '요약을 바탕으로 후속 조치를 진행합니다.')))
      break
    }
    case 'summary': {
      out.push(h(1, `${title} — 핵심 정리`))
      const pts = bullets.length ? bullets : sentences(paragraphs)
      out.push(ul(pts.map(s => s.replace(/[.。]$/, ''))))
      const kw = keywords(text)
      if (kw.length) out.push(p('키워드: ' + kw.map(k => `#${k}`).join(' ')))
      break
    }
    case 'diary': {
      const today = new Date()
      out.push(h(1, `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`))
      out.push(h(3, title))
      paragraphs.forEach(pa => out.push(p(pa)))
      if (bullets.length) { out.push(h(3, '오늘의 기록')); out.push(ul(bullets)) }
      out.push(p(tone === 'fun' ? '내일의 나에게도 파이팅! ⚡' : '오늘 하루도 수고했어. 🌙'))
      break
    }
    case 'sns': {
      const pts = sentences(paragraphs).concat(bullets)
      out.push(p(`${title} ${tone === 'fun' ? '🔥' : tone === 'warm' ? '🌸' : ''}`.trim()))
      pts.slice(0, 5).forEach(s => out.push(p(s)))
      out.push(p(keywords(text, 6).map(k => `#${k}`).join(' ') || '#일상'))
      break
    }
    case 'blog':
    default: {
      out.push(h(1, title))
      out.push(p(d.intro || `${title}에 대해 이야기해 보려고 해요.`))
      paragraphs.forEach(pa => { out.push(h(2, headOf(pa))); out.push(p(pa)) })
      if (bullets.length) { out.push(h(2, '정리하면')); out.push(ul(bullets)) }
      out.push(p(d.outro || '오늘 글이 도움이 되었길 바라요. 다음 글에서 만나요!'))
      break
    }
  }
  return out.join('\n')
}

// ── SEO / GEO 생성기 (로컬, 토큰 무소모) ──────────────────────────────
export type SeoResult = {
  title: string
  description: string
  keywords: string[]
  geoKeywords: string[]
  metaHtml: string
  jsonLd: string
}

export function generateSeo(text: string, siteName = 'BlackCatBook'): SeoResult {
  const { title, paragraphs, bullets } = parse(text)
  const body = paragraphs.concat(bullets).join(' ')
  const description = (body.slice(0, 148) + (body.length > 148 ? '…' : '')).trim()
  const kw = keywords(text, 8)
  // GEO(생성형 엔진 최적화): AI 검색이 인용하기 좋은 질문형/롱테일 키워드
  const geo = [
    `${title}란?`,
    `${title} 방법`,
    `${title} 장단점`,
    ...kw.slice(0, 3).map(k => `${k} ${title}`.slice(0, 30)),
    `${title} 총정리 ${new Date().getFullYear()}`,
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 6)

  const metaHtml = [
    `<title>${esc(title)} | ${esc(siteName)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<meta name="keywords" content="${esc(kw.join(', '))}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:type" content="article">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ].join('\n')

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    keywords: kw.join(', '),
    publisher: { '@type': 'Organization', name: siteName },
    datePublished: new Date().toISOString().slice(0, 10),
  }, null, 2)

  return { title, description, keywords: kw, geoKeywords: geo, metaHtml, jsonLd }
}
