import { NextResponse, type NextRequest } from 'next/server'

// Free tier: localStorage-based, no auth required for app routes
// Phase 2: Supabase cloud sync will be opt-in
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
