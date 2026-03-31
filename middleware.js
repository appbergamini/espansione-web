import { NextResponse } from 'next/server'
import { updateSession } from './utils/supabase/auth'

export async function middleware(request) {
  const { supabaseResponse, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  // Protege rotas /adm
  if (pathname.startsWith('/adm')) {
    if (!user) {
      // Redireciona para o login se não estiver logado
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protege rotas /api/adm
  if (pathname.startsWith('/api/adm')) {
    if (!user) {
      // Retorna 401 Unauthorized se API chamada sem login
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/adm/:path*',
    '/api/adm/:path*'
  ],
}
