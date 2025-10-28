import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseAdmin';
import { produtoQuerySchema } from '@/lib/validations/produtoSchema';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: empresaId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Validar parâmetros da query
    const queryParams = {
      search: searchParams.get('search') || undefined,
      tipo: searchParams.get('tipo') || undefined,
      categoria_id: searchParams.get('categoria_id') || undefined,
      ativo: searchParams.get('ativo') === 'true' ? true : searchParams.get('ativo') === 'false' ? false : undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sort: searchParams.get('sort') || 'nome',
      order: (searchParams.get('order') || 'asc') as 'asc' | 'desc',
    };

    const validatedQuery = produtoQuerySchema.parse(queryParams);

    const supabase = createSupabaseAdmin();

    // Construir query
    let query = supabase
      .from('produtos')
      .select('*', { count: 'exact' })
      .eq('empresa_id', empresaId);

    // Aplicar filtros
    if (validatedQuery.search) {
      query = query.or(`nome.ilike.%${validatedQuery.search}%,codigo.ilike.%${validatedQuery.search}%`);
    }

    if (validatedQuery.tipo) {
      query = query.eq('tipo', validatedQuery.tipo);
    }

    if (validatedQuery.categoria_id) {
      query = query.eq('categoria_id', validatedQuery.categoria_id);
    }

    if (validatedQuery.ativo !== undefined) {
      query = query.eq('ativo', validatedQuery.ativo);
    }

    // Aplicar ordenação
    query = query.order(validatedQuery.sort, { ascending: validatedQuery.order === 'asc' });

    // Aplicar paginação
    query = query.range(validatedQuery.offset, validatedQuery.offset + validatedQuery.limit - 1);

    const { data: produtos, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar produtos' },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / validatedQuery.limit);
    const currentPage = Math.floor(validatedQuery.offset / validatedQuery.limit) + 1;

    return NextResponse.json({
      data: produtos || [],
      pagination: {
        total,
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        hasMore: validatedQuery.offset + validatedQuery.limit < total,
        totalPages,
        currentPage,
      },
    });

  } catch (error) {
    console.error('Erro na API de produtos:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: empresaId } = await params;
    const body = await request.json();

    // Validar dados do produto
    const { produtoSchema } = await import('@/lib/validations/produtoSchema');
    const validatedData = produtoSchema.parse(body);

    const supabase = createSupabaseAdmin();

    // Verificar se código já existe
    const { data: existingProduto } = await supabase
      .from('produtos')
      .select('id')
      .eq('empresa_id', empresaId)
      .eq('codigo', validatedData.codigo)
      .single();

    if (existingProduto) {
      return NextResponse.json(
        { error: 'Já existe um produto com este código' },
        { status: 400 }
      );
    }

    // Criar produto
    const { data: produto, error } = await supabase
      .from('produtos')
      .insert({
        ...validatedData,
        empresa_id: empresaId,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar produto:', error);
      return NextResponse.json(
        { error: 'Erro ao criar produto' },
        { status: 500 }
      );
    }

    return NextResponse.json(produto, { status: 201 });

  } catch (error) {
    console.error('Erro na API de produtos:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}