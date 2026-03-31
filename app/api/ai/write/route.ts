import { NextRequest, NextResponse } from 'next/server'

const styleGuide: Record<string, string> = {
  docs:    '기술 문서 스타일로 — 명확한 제목, 소제목, 코드 블록, 표 등을 활용해 체계적으로 작성하세요.',
  blog:    '블로그 포스트 스타일로 — 친근하고 읽기 쉽게, 소제목과 단락을 나눠 작성하세요.',
  summary: '핵심만 간결하게 요약 정리하세요. 불릿 포인트와 굵은 텍스트를 활용하세요.',
  report:  '보고서 형식으로 — 배경, 내용, 결론 구조로 작성하세요.',
  guide:   '단계별 가이드로 — 번호 목록과 명확한 설명으로 따라하기 쉽게 작성하세요.',
}

function buildPrompt(topic: string, style: string, language: string, references: string): string {
  return `다음 정보를 바탕으로 완성도 높은 문서를 HTML 형식으로 작성해주세요.

**주제:** ${topic}

**작성 스타일:** ${styleGuide[style] || styleGuide.docs}

**언어:** ${language === 'ko' ? '한국어' : language === 'en' ? '영어' : '한국어'}

${references ? `**참고 자료 / 내용:**\n${references}` : ''}

---

**작성 규칙:**
- HTML 태그만 사용 (h1, h2, h3, p, ul, ol, li, strong, em, blockquote, code, pre, table, thead, tbody, tr, th, td, hr)
- 마크다운 문법 사용 금지
- \`\`\`html 코드 블록으로 감싸지 말고 순수 HTML만 출력
- 문서 전체를 빠짐없이 완성해서 출력
- 제목은 h1 한 개, 소제목은 h2/h3 사용
- 중요 키워드는 <strong> 태그로 강조
- 핵심 내용은 표나 리스트로 정리
- 참고 자료의 핵심 내용을 문서에 통합해서 작성`
}

function stripCodeFence(text: string): string {
  return text.trim()
    .replace(/^```html\n?/i, '')
    .replace(/^```\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim()
}

// ── Anthropic (Claude) ──────────────────────────────────────────────────────
async function generateWithAnthropic(apiKey: string, prompt: string): Promise<string> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic({ apiKey })
  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })
  const content = message.content[0]
  if (content.type !== 'text') throw new Error('응답 생성 실패')
  return content.text
}

// ── OpenAI (GPT) ────────────────────────────────────────────────────────────
async function generateWithOpenAI(apiKey: string, model: string, prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || `OpenAI API 오류 (${res.status})`
    if (res.status === 401) throw new Error('API 키가 올바르지 않아요.')
    throw new Error(msg)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

// ── Google Gemini ───────────────────────────────────────────────────────────
async function generateWithGemini(apiKey: string, model: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 4096 },
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || `Gemini API 오류 (${res.status})`
    if (res.status === 400 || res.status === 403) throw new Error('API 키가 올바르지 않아요.')
    throw new Error(msg)
  }
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// ── Main handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { apiKey, provider, model, topic, references, style, language } = await req.json()

    if (!apiKey?.trim()) return NextResponse.json({ error: 'API 키를 입력해주세요.' }, { status: 400 })
    if (!topic?.trim()) return NextResponse.json({ error: '주제를 입력해주세요.' }, { status: 400 })

    const prompt = buildPrompt(topic, style, language, references)
    let raw = ''

    switch (provider) {
      case 'openai':
        raw = await generateWithOpenAI(apiKey.trim(), model || 'gpt-4o', prompt)
        break
      case 'gemini':
        raw = await generateWithGemini(apiKey.trim(), model || 'gemini-1.5-flash', prompt)
        break
      case 'anthropic':
      default:
        raw = await generateWithAnthropic(apiKey.trim(), prompt)
        break
    }

    const html = stripCodeFence(raw)
    return NextResponse.json({ html })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '알 수 없는 오류'
    if (msg.includes('401') || msg.includes('invalid_api_key') || msg.includes('올바르지')) {
      return NextResponse.json({ error: msg.includes('올바르지') ? msg : 'API 키가 올바르지 않아요.' }, { status: 401 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
