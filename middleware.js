import { NextResponse } from 'next/server'
import { updateSession } from './utils/supabase/auth'

export async function middleware(request) {
  const { supabaseResponse, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  /* [TEMPORÁRIO] Removendo senha de acesso das rotas /adm e /api/adm a pedido
  // Protege rotas /adm
  if (pathname.startsWith('/adm')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protege rotas /api/adm
  if (pathname.startsWith('/api/adm')) {
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    }
  }
  */

  return supabaseResponse
}

export const config = {
  matcher: [
    '/adm/:path*',
    '/api/adm/:path*',
    '/dashboard/:path*',
    '/auth/callback',
  ],
}
