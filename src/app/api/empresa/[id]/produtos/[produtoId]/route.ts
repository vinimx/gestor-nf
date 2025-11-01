/**
 * API de Produto Individual - GET, PUT, DELETE
 * FASE 3: Gestão de Produtos com Integração FOCUS NFE
 * 
 * Endpoints:
 * - GET    /api/empresa/[id]/produtos/[produtoId] - Buscar produto
 * - PUT    /api/empresa/[id]/produtos/[produtoId] - Atualizar produto
 * - DELETE /api/empresa/[id]/produtos/[produtoId] - Excluir produto
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuthFromRequest } from '@/lib/auth';
import { produtoSchema } from '@/lib/validations/produtoSchema';
import { z } from 'zod';

/**
 * GET /api/empresa/[id]/produtos/[produtoId]
 * Buscar um produto específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; produtoId: string }> }
) {
  try {
    const { id: empresaId, produtoId } = await params;

    // Verificar autenticação
    const { user, error: authError } = await requireAuthFromRequest(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const supabaseAdmin = createSupabaseAdmin();

    // Buscar produto
    const { data: produto, error } = await supabaseAdmin
      .from('produtos')
      .select(`
        *,
        categoria:categorias_produtos(*)
      `)
      .eq('id', produtoId)
      .eq('empresa_id', empresaId)
      .single();

    if (error) {
      console.error('Erro ao buscar produto:', error);
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: produto
    });

  } catch (error) {
    console.error('Erro na API de busca de produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/empresa/[id]/produtos/[produtoId]
 * Atualizar produto existente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; produtoId: string }> }
) {
  try {
    const { id: empresaId, produtoId } = await params;
    
    // Verificar autenticação
    const { user, error: authError } = await requireAuthFromRequest(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const body = await request.json();

    // Validar dados do produto (partial para permitir atualizações parciais)
    const dadosValidados = produtoSchema.partial().parse(body);

    const supabaseAdmin = createSupabaseAdmin();

    // Verificar se produto existe e pertence à empresa
    const { data: produtoExistente, error: erroVerificacao } = await supabaseAdmin
      .from('produtos')
      .select('id')
      .eq('id', produtoId)
      .eq('empresa_id', empresaId)
      .single();

    if (erroVerificacao || !produtoExistente) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar produto
    const { data: produto, error } = await supabaseAdmin
      .from('produtos')
      .update({
        ...dadosValidados,
        updated_at: new Date().toISOString(),
      })
      .eq('id', produtoId)
      .eq('empresa_id', empresaId)
      .select(`
        *,
        categoria:categorias_produtos(*)
      `)
      .single();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar produto', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: produto,
      message: 'Produto atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro na API de atualização de produto:', error);

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
 * DELETE /api/empresa/[id]/produtos/[produtoId]
 * Excluir produto
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; produtoId: string }> }
) {
  try {
    const { id: empresaId, produtoId } = await params;

    // Verificar autenticação
    const { user, error: authError } = await requireAuthFromRequest(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const supabaseAdmin = createSupabaseAdmin();

    // Verificar se produto existe e pertence à empresa
    const { data: produtoExistente, error: erroVerificacao } = await supabaseAdmin
      .from('produtos')
      .select('id, nome')
      .eq('id', produtoId)
      .eq('empresa_id', empresaId)
      .single();

    if (erroVerificacao || !produtoExistente) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Soft delete (marcar como inativo) ao invés de deletar permanentemente
    // Isso mantém histórico para notas fiscais emitidas
    const { error } = await supabaseAdmin
      .from('produtos')
      .update({
        ativo: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', produtoId)
      .eq('empresa_id', empresaId);

    if (error) {
      console.error('Erro ao excluir produto:', error);
      return NextResponse.json(
        { error: 'Erro ao excluir produto', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Produto excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro na API de exclusão de produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
