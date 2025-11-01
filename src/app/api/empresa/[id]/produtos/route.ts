/**
 * API de Produtos - CRUD Completo
 * FASE 3: Gestão de Produtos com Integração FOCUS NFE
 * 
 * Endpoints:
 * - POST   /api/empresa/[id]/produtos - Criar produto
 * - GET    /api/empresa/[id]/produtos - Listar produtos
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuthFromRequest } from '@/lib/auth';
import { produtoSchema, produtoQuerySchema } from '@/lib/validations/produtoSchema';
import { z } from 'zod';

/**
 * POST /api/empresa/[id]/produtos
 * Criar novo produto
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: empresaId } = await params;
    
    // Verificar autenticação
    const { user, error: authError } = await requireAuthFromRequest(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validar dados do produto
    const dadosValidados = produtoSchema.parse(body);

    // Criar cliente Supabase Admin
    const supabaseAdmin = createSupabaseAdmin();
    
    // Verificar se o usuário tem acesso à empresa
    const { data: userProfile } = await supabaseAdmin
      .from('users_profile')
      .select('empresa_id, role')
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json(
        { error: "Perfil de usuário não encontrado" },
        { status: 404 }
      );
    }

    // Admin pode acessar qualquer empresa, outros usuários só a própria
    if (userProfile.role !== 'admin' && userProfile.empresa_id !== empresaId) {
      return NextResponse.json(
        { error: "Acesso negado a esta empresa" },
        { status: 403 }
      );
    }

    // Inserir produto no banco
    const { data: produto, error } = await supabaseAdmin
      .from('produtos')
      .insert({
        empresa_id: empresaId,
        ...dadosValidados,
      })
      .select(`
        *,
        categoria:categorias_produtos(*)
      `)
      .single();

    if (error) {
      console.error('Erro ao criar produto:', error);
      return NextResponse.json(
        { error: 'Erro ao criar produto', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: produto,
      message: 'Produto criado com sucesso'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro na API de criação de produto:', error);

    if (error instanceof z.ZodError) {
      const details = error.errors && Array.isArray(error.errors)
        ? error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        : [];
      
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/empresa/[id]/produtos
 * Listar produtos com filtros e paginação
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: empresaId } = await params;
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('[DEBUG GET /produtos] 1. EmpresaId:', empresaId);
    
    if (!empresaId) {
      return NextResponse.json(
        { error: "ID da empresa é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar autenticação
    console.log('[DEBUG GET /produtos] 2. Verificando autenticação...');
    const { user, error: authError } = await requireAuthFromRequest(request);
    if (authError || !user) {
      console.log('[DEBUG GET /produtos] ❌ Erro de autenticação:', authError);
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    console.log('[DEBUG GET /produtos] 3. ✅ Usuário autenticado:', user.id);

    const supabaseAdmin = createSupabaseAdmin();
    console.log('[DEBUG GET /produtos] 4. ✅ Cliente Supabase criado');

    // Verificar se o usuário tem acesso à empresa
    const { data: userProfile } = await supabaseAdmin
      .from('users_profile')
      .select('empresa_id, role')
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json(
        { error: "Perfil de usuário não encontrado" },
        { status: 404 }
      );
    }

    // Admin pode acessar qualquer empresa, outros usuários só a própria
    if (userProfile.role !== 'admin' && userProfile.empresa_id !== empresaId) {
      return NextResponse.json(
        { error: "Acesso negado a esta empresa" },
        { status: 403 }
      );
    }
    
    console.log('[DEBUG GET /produtos] 5. ✅ Autorização OK - Role:', userProfile.role);

    const { searchParams } = new URL(request.url);

    // Parsear query params
    const queryParams = {
      search: searchParams.get('search') || undefined,
      tipo: searchParams.get('tipo') as 'PRODUTO' | 'SERVICO' | undefined,
      categoria_id: searchParams.get('categoria_id') || undefined,
      ativo: searchParams.get('ativo') === 'true' ? true : searchParams.get('ativo') === 'false' ? false : undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sort: searchParams.get('sort') || 'nome',
      order: (searchParams.get('order') || 'asc') as 'asc' | 'desc',
    };

    console.log('[DEBUG GET /produtos] 6. Query params:', JSON.stringify(queryParams, null, 2));

    // Validar query params
    const validatedQuery = produtoQuerySchema.parse(queryParams);
    console.log('[DEBUG GET /produtos] 7. ✅ Validação Zod OK');

    // Construir query
    console.log('[DEBUG GET /produtos] 8. Construindo query...');
    
    let query = supabaseAdmin
      .from('produtos')
      .select(`
        *,
        categoria:categorias_produtos(*)
      `, { count: 'exact' })
      .eq('empresa_id', empresaId);

    // Aplicar filtros
    if (validatedQuery.search) {
      query = query.or(`nome.ilike.%${validatedQuery.search}%,codigo.ilike.%${validatedQuery.search}%,descricao.ilike.%${validatedQuery.search}%`);
    }

    if (validatedQuery.tipo) {
      query = query.eq('tipo', validatedQuery.tipo);
    }

    // Verificar se categoria_id é um UUID válido antes de filtrar
    if (validatedQuery.categoria_id && validatedQuery.categoria_id !== 'all') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(validatedQuery.categoria_id)) {
        query = query.eq('categoria_id', validatedQuery.categoria_id);
      }
    }

    if (validatedQuery.ativo !== undefined) {
      query = query.eq('ativo', validatedQuery.ativo);
    }

    // Ordenação
    query = query.order(validatedQuery.sort, { ascending: validatedQuery.order === 'asc' });

    // Paginação
    query = query.range(
      validatedQuery.offset,
      validatedQuery.offset + validatedQuery.limit - 1
    );

    console.log('[DEBUG GET /produtos] 10. Executando query...');
    const { data: produtos, error, count } = await query;
    console.log('[DEBUG GET /produtos] 11. ✅ Query executada - Count:', count, 'Produtos:', produtos?.length || 0);

    if (error) {
      console.error('[DEBUG GET /produtos] ❌ Erro do Supabase:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar produtos', details: error.message },
        { status: 400 }
      );
    }
    
    console.log('[DEBUG GET /produtos] 12. ✅ Preparando resposta...');

    // Calcular paginação
    const total = count || 0;
    const totalPages = Math.ceil(total / validatedQuery.limit);
    const currentPage = Math.floor(validatedQuery.offset / validatedQuery.limit) + 1;

    return NextResponse.json({
      success: true,
      data: produtos || [],
      pagination: {
        total,
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        hasMore: (validatedQuery.offset + validatedQuery.limit) < total,
        totalPages,
        currentPage,
      }
    });

  } catch (error) {
    console.error('[DEBUG GET /produtos] ❌ Erro na listagem:', error);

    if (error instanceof z.ZodError) {
      console.error('[DEBUG GET /produtos] Erros de validação:', error.errors);
      const errorMessages = error.errors && Array.isArray(error.errors)
        ? error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')
        : 'Erros de validação';
      
      return NextResponse.json(
        {
          error: 'Parâmetros inválidos',
          details: error.errors || [],
          message: errorMessages
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
