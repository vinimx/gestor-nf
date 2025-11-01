/**
 * API de Categoria Individual - PUT, DELETE
 * FASE 3: Gestão de Produtos
 * 
 * Endpoints:
 * - PUT    /api/empresa/[id]/categorias-produtos/[categoriaId] - Atualizar categoria
 * - DELETE /api/empresa/[id]/categorias-produtos/[categoriaId] - Excluir categoria
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuthFromRequest } from '@/lib/auth';
import { categoriaProdutoSchema } from '@/lib/validations/produtoSchema';
import { z } from 'zod';

/**
 * PUT /api/empresa/[id]/categorias-produtos/[categoriaId]
 * Atualizar categoria existente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; categoriaId: string } }
) {
  try {
    const { id: empresaId, categoriaId } = params;
    
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
    const dadosValidados = categoriaProdutoSchema.partial().parse(body);

    const supabaseAdmin = createSupabaseAdmin();

    // Verificar se categoria existe e pertence à empresa
    const { data: categoriaExistente, error: erroVerificacao } = await supabaseAdmin
      .from('categorias_produtos')
      .select('id')
      .eq('id', categoriaId)
      .eq('empresa_id', empresaId)
      .single();

    if (erroVerificacao || !categoriaExistente) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar categoria
    const { data: categoria, error } = await supabaseAdmin
      .from('categorias_produtos')
      .update({
        ...dadosValidados,
        updated_at: new Date().toISOString(),
      })
      .eq('id', categoriaId)
      .eq('empresa_id', empresaId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar categoria:', error);
      
      // Verificar se é erro de duplicação
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Já existe uma categoria com este nome' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Erro ao atualizar categoria', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: categoria,
      message: 'Categoria atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro na API de atualização de categoria:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors
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
 * DELETE /api/empresa/[id]/categorias-produtos/[categoriaId]
 * Excluir categoria (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoriaId: string }> }
) {
  try {
    const { id: empresaId, categoriaId } = await params;

    // Verificar autenticação
    const { user, error: authError } = await requireAuthFromRequest(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const supabaseAdmin = createSupabaseAdmin();

    // Verificar se categoria existe e pertence à empresa
    const { data: categoriaExistente, error: erroVerificacao } = await supabaseAdmin
      .from('categorias_produtos')
      .select('id, nome')
      .eq('id', categoriaId)
      .eq('empresa_id', empresaId)
      .single();

    if (erroVerificacao || !categoriaExistente) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se há produtos usando esta categoria
    const { count, error: erroContagem } = await supabaseAdmin
      .from('produtos')
      .select('id', { count: 'exact', head: true })
      .eq('categoria_id', categoriaId)
      .eq('ativo', true);

    if (erroContagem) {
      console.error('Erro ao verificar produtos da categoria:', erroContagem);
    }

    if (count && count > 0) {
      return NextResponse.json(
        {
          error: 'Não é possível excluir esta categoria',
          message: `Existem ${count} produto(s) ativo(s) nesta categoria. Desative ou mova os produtos antes de excluir.`
        },
        { status: 400 }
      );
    }

    // Soft delete (marcar como inativa)
    const { error } = await supabaseAdmin
      .from('categorias_produtos')
      .update({
        ativo: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', categoriaId)
      .eq('empresa_id', empresaId);

    if (error) {
      console.error('Erro ao excluir categoria:', error);
      return NextResponse.json(
        { error: 'Erro ao excluir categoria', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Categoria excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro na API de exclusão de categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
