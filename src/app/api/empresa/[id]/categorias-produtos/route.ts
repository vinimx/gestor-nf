/**
 * API de Categorias de Produtos - CRUD Completo
 * FASE 3: Gestão de Produtos
 * 
 * Endpoints:
 * - POST   /api/empresa/[id]/categorias-produtos - Criar categoria
 * - GET    /api/empresa/[id]/categorias-produtos - Listar categorias
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuthFromRequest } from '@/lib/auth';
import { categoriaProdutoSchema } from '@/lib/validations/produtoSchema';
import { z } from 'zod';

/**
 * POST /api/empresa/[id]/categorias-produtos
 * Criar nova categoria
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

    // Validar dados da categoria
    const dadosValidados = categoriaProdutoSchema.parse(body);

    const supabaseAdmin = createSupabaseAdmin();

    // Inserir categoria no banco
    const { data: categoria, error } = await supabaseAdmin
      .from('categorias_produtos')
      .insert({
        empresa_id: empresaId,
        ...dadosValidados,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar categoria:', error);
      
      // Verificar se é erro de duplicação
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Já existe uma categoria com este nome' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Erro ao criar categoria', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: categoria,
      message: 'Categoria criada com sucesso'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro na API de criação de categoria:', error);

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
 * GET /api/empresa/[id]/categorias-produtos
 * Listar categorias da empresa
 */
export async function GET(
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
    
    const { searchParams } = new URL(request.url);

    const apenasAtivas = searchParams.get('ativo') === 'true';

    const supabaseAdmin = createSupabaseAdmin();

    // Buscar categorias
    let query = supabaseAdmin
      .from('categorias_produtos')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('nome', { ascending: true });

    if (apenasAtivas) {
      query = query.eq('ativo', true);
    }

    const { data: categorias, error } = await query;

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar categorias', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: categorias || []
    });

  } catch (error) {
    console.error('Erro na API de listagem de categorias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
