import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware de Autenticação e Autorização
 * 
 * Protege rotas automaticamente no servidor, antes da página carregar.
 * Implementa verificação de sessão e roles para controle de acesso.
 */
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })
  
  // Criar cliente Supabase com cookies da request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Verificar sessão atual
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname, search } = req.nextUrl

  // Debug: Logar informações de sessão em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Middleware executado para:', pathname);
    console.log('📍 Sessão encontrada:', session ? '✅ SIM' : '❌ NÃO');
    if (session) {
      console.log('📧 Email:', session.user.email);
    }
  }

  // ============================================
  // DEFINIÇÃO DE ROTAS
  // ============================================

  /**
   * Rotas públicas - acessíveis sem autenticação
   */
  const publicRoutes = [
    '/login',
    '/registro',
    '/recuperar-senha',
    '/redefinir-senha',
    '/verificar-email',
  ]

  /**
   * Rotas que requerem role específico
   */
  const adminRoutes = [
    '/admin',
    '/usuarios',
  ]

  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================

  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  const isAdminRoute = adminRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  // ============================================
  // LÓGICA DE PROTEÇÃO DE ROTAS
  // ============================================

  // 1. USUÁRIO NÃO AUTENTICADO
  if (!session) {
    // Se tentando acessar rota protegida, redirecionar para login
    if (!isPublicRoute) {
      const redirectUrl = new URL('/login', req.url)
      // Preservar URL original para redirecionar após login
      redirectUrl.searchParams.set('redirect', pathname + search)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔒 Middleware: Redirecionando usuário não autenticado de ${pathname} para /login`)
      }
      
      return NextResponse.redirect(redirectUrl)
    }
    
    // Rota pública, permitir acesso
    return res
  }

  // 2. USUÁRIO AUTENTICADO
  
  // Se está em rota pública, redirecionar para home (já está logado)
  if (isPublicRoute) {
    // Verificar se há parâmetro de redirect na URL
    const redirectParam = req.nextUrl.searchParams.get('redirect')
    const redirectTo = redirectParam && redirectParam !== '/' ? redirectParam : '/'
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🏠 Middleware: Usuário autenticado em rota pública, redirecionando para ${redirectTo}`)
    }
    
    return NextResponse.redirect(new URL(redirectTo, req.url))
  }

  // 3. VERIFICAÇÃO DE ROLES PARA ROTAS ADMIN
  if (isAdminRoute) {
    try {
      // Buscar profile do usuário para verificar role
      const { data: profile, error } = await supabase
        .from('users_profile')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (error || !profile) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠️ Middleware: Erro ao buscar profile do usuário:`, error?.message)
        }
        
        // Se não conseguiu buscar profile, redirecionar para home com aviso
        const url = new URL('/', req.url)
        url.searchParams.set('error', 'profile_not_found')
        return NextResponse.redirect(url)
      }

      // Verificar se tem role de admin
      if (profile.role !== 'admin') {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`🚫 Middleware: Acesso negado - Role ${profile.role} tentou acessar rota admin: ${pathname}`)
        }
        
        // Não é admin, redirecionar para home com mensagem
        const url = new URL('/', req.url)
        url.searchParams.set('error', 'unauthorized')
        return NextResponse.redirect(url)
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Middleware: Acesso admin autorizado para ${pathname}`)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ Middleware: Erro ao verificar role:`, error)
      }
      
      // Em caso de erro, negar acesso por segurança (fail secure)
      const url = new URL('/', req.url)
      url.searchParams.set('error', 'verification_failed')
      return NextResponse.redirect(url)
    }
  }

  // 4. ROTA PROTEGIDA NORMAL - PERMITIR ACESSO
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Middleware: Acesso autorizado para ${pathname}`)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

