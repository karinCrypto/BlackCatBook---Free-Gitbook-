import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, type, description, is_public } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const slug = name.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-').slice(0, 50) + '-' + Date.now()

  const { data, error } = await supabase.from('workspaces').insert({
    owner_id: user.id,
    name: name.trim(),
    slug,
    type: type ?? 'tech_docs',
    description: description ?? '',
    is_public: is_public ?? false,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
