import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function calcReadTime(wordCount: number) {
  return Math.max(1, Math.round(wordCount / 200))
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  const { docId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, subtitle, content_html, content_md, status, seo_title, seo_desc } = body

  const plainText = stripHtml(content_html ?? '')
  const wordCount = plainText ? plainText.split(/\s+/).length : 0
  const excerpt = plainText.slice(0, 160)

  const { data, error } = await supabase
    .from('documents')
    .update({
      ...(title !== undefined && { title }),
      ...(subtitle !== undefined && { subtitle }),
      ...(content_html !== undefined && { content_html }),
      ...(content_md !== undefined && { content_md }),
      ...(status !== undefined && { status }),
      ...(seo_title !== undefined && { seo_title }),
      ...(seo_desc !== undefined && { seo_desc }),
      word_count: wordCount,
      read_time_min: calcReadTime(wordCount),
      excerpt,
      updated_at: new Date().toISOString(),
      ...(status === 'published' && { published_at: new Date().toISOString() }),
    })
    .eq('id', docId)
    .eq('author_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  const { docId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.from('documents').update({ status: 'archived' }).eq('id', docId).eq('author_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
