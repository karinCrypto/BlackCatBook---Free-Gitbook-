import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { apiKey, topic, references, style, language } = await req.json()

    if (!apiKey?.trim()) {
      return NextResponse.json({ error: 'API 키를 입력해주세요.' }, { status: 400 })
    }
    if (!topic?.trim()) {
      return NextResponse.json({ error: '주제를 입력해주세요.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: apiKey.trim() })

    const styleGuide: Record<string, string> = {
      docs:      '기술 문서 스타일로 — 명확한 제목, 소제목, 코드 블록, 표 등을 활용해 체계적으로 작성하세요.',
      blog:      '블로그 포스트 스타일로 — 친근하고 읽기 쉽게, 소제목과 단락을 나눠 작성하세요.',
      summary:   '핵심만 간결하게 요약 정리하세요. 불릿 포인트와 굵은 텍스트를 활용하세요.',
      report:    '보고서 형식으로 — 배경, 내용, 결론 구조로 작성하세요.',
      guide:     '단계별 가이드로 — 번호 목록과 명확한 설명으로 따라하기 쉽게 작성하세요.',
    }

    const prompt = `다음 정보를 바탕으로 완성도 높은 문서를 HTML 형식으로 작성해주세요.

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

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: '응답 생성 실패' }, { status: 500 })
    }

    // Strip any accidental markdown code fences
    let html = content.text.trim()
    html = html.replace(/^```html\n?/i, '').replace(/\n?```$/i, '').trim()

    return NextResponse.json({ html })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '알 수 없는 오류'
    if (msg.includes('401') || msg.includes('invalid_api_key')) {
      return NextResponse.json({ error: 'API 키가 올바르지 않아요. 확인 후 다시 시도해주세요.' }, { status: 401 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
