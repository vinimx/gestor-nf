import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseAdmin';
import { produtoSchema } from '@/lib/validations/produtoSchema';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; produtoId: string }> }
) {
  try {
    const { id: empresaId, produtoId } = await params;

    const supabase = createSupabaseAdmin();

    const { data: produto, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', produtoId)
      .eq('empresa_id', empresaId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Produto não encontrado' },
          { status: 404 }
        );
      }
      
      console.error('Erro ao buscar produto:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar produto' },
        { status: 500 }
      );
    }

    return NextResponse.json(produto);

  } catch (error) {
    console.error('Erro na API de produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; produtoId: string }> }
) {
  try {
    const { id: empresaId, produtoId } = await params;
    const body = await request.json();

    const validatedData = produtoSchema.parse(body);

    const supabase = createSupabaseAdmin();

    // Verificar se produto existe
    const { data: existingProduto } = await supabase
      .from('produtos')
      .select('id')
      .eq('id', produtoId)
      .eq('empresa_id', empresaId)
      .single();

    if (!existingProduto) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se código já existe (exceto para o próprio produto)
    if (validatedData.codigo) {
      const { data: codigoExists } = await supabase
        .from('produtos')
        .select('id')
        .eq('empresa_id', empresaId)
        .eq('codigo', validatedData.codigo)
        .neq('id', produtoId)
        .single();

      if (codigoExists) {
        return NextResponse.json(
          { error: 'Já existe um produto com este código' },
          { status: 400 }
        );
      }
    }

    // Atualizar produto
    const { data: produto, error } = await supabase
      .from('produtos')
      .update(validatedData)
      .eq('id', produtoId)
      .eq('empresa_id', empresaId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar produto' },
        { status: 500 }
      );
    }

    return NextResponse.json(produto);

  } catch (error) {
    console.error('Erro na API de produto:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; produtoId: string }> }
) {
  try {
    const { id: empresaId, produtoId } = await params;

    const supabase = createSupabaseAdmin();

    // Verificar se produto existe
    const { data: existingProduto } = await supabase
      .from('produtos')
      .select('id')
      .eq('id', produtoId)
      .eq('empresa_id', empresaId)
      .single();

    if (!existingProduto) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Excluir produto
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', produtoId)
      .eq('empresa_id', empresaId);

    if (error) {
      console.error('Erro ao excluir produto:', error);
      return NextResponse.json(
        { error: 'Erro ao excluir produto' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro na API de produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}