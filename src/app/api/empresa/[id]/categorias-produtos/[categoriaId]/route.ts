import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseAdmin';
import { z } from 'zod';

const categoriaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoriaId: string }> }
) {
  try {
    const { id: empresaId, categoriaId } = await params;

    const supabase = createSupabaseAdmin();

    const { data: categoria, error } = await supabase
      .from('categorias_produtos')
      .select('*')
      .eq('id', categoriaId)
      .eq('empresa_id', empresaId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Categoria não encontrada' },
          { status: 404 }
        );
      }
      
      console.error('Erro ao buscar categoria:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar categoria' },
        { status: 500 }
      );
    }

    return NextResponse.json(categoria);

  } catch (error) {
    console.error('Erro na API de categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoriaId: string }> }
) {
  try {
    const { id: empresaId, categoriaId } = await params;
    const body = await request.json();

    const validatedData = categoriaSchema.parse(body);

    const supabase = createSupabaseAdmin();

    // Verificar se categoria existe
    const { data: existingCategoria } = await supabase
      .from('categorias_produtos')
      .select('id')
      .eq('id', categoriaId)
      .eq('empresa_id', empresaId)
      .single();

    if (!existingCategoria) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se nome já existe (exceto para a própria categoria)
    if (validatedData.nome) {
      const { data: nomeExists } = await supabase
        .from('categorias_produtos')
        .select('id')
        .eq('empresa_id', empresaId)
        .eq('nome', validatedData.nome)
        .neq('id', categoriaId)
        .single();

      if (nomeExists) {
        return NextResponse.json(
          { error: 'Já existe uma categoria com este nome' },
          { status: 400 }
        );
      }
    }

    // Atualizar categoria
    const { data: categoria, error } = await supabase
      .from('categorias_produtos')
      .update(validatedData)
      .eq('id', categoriaId)
      .eq('empresa_id', empresaId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar categoria:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar categoria' },
        { status: 500 }
      );
    }

    return NextResponse.json(categoria);

  } catch (error) {
    console.error('Erro na API de categoria:', error);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoriaId: string }> }
) {
  try {
    const { id: empresaId, categoriaId } = await params;

    const supabase = createSupabaseAdmin();

    // Verificar se categoria existe
    const { data: existingCategoria } = await supabase
      .from('categorias_produtos')
      .select('id')
      .eq('id', categoriaId)
      .eq('empresa_id', empresaId)
      .single();

    if (!existingCategoria) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se há produtos usando esta categoria
    const { data: produtosComCategoria } = await supabase
      .from('produtos')
      .select('id')
      .eq('categoria_id', categoriaId)
      .limit(1);

    if (produtosComCategoria && produtosComCategoria.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir categoria que possui produtos' },
        { status: 400 }
      );
    }

    // Excluir categoria
    const { error } = await supabase
      .from('categorias_produtos')
      .delete()
      .eq('id', categoriaId)
      .eq('empresa_id', empresaId);

    if (error) {
      console.error('Erro ao excluir categoria:', error);
      return NextResponse.json(
        { error: 'Erro ao excluir categoria' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro na API de categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
