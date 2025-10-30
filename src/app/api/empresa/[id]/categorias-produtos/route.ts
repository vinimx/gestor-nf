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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: empresaId } = await params;
    const { searchParams } = new URL(request.url);
    
    const ativo = searchParams.get('ativo');
    const order = searchParams.get('order') || 'nome';

    const supabase = createSupabaseAdmin();

    let query = supabase
      .from('categorias_produtos')
      .select('*', { count: 'exact' })
      .eq('empresa_id', empresaId);

    if (ativo !== null) {
      query = query.eq('ativo', ativo === 'true');
    }

    query = query.order(order, { ascending: true });

    const { data: categorias, error } = await query;

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar categorias' },
        { status: 500 }
      );
    }

    return NextResponse.json(categorias || []);

  } catch (error) {
    console.error('Erro na API de categorias:', error);
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

    const validatedData = categoriaSchema.parse(body);

    const supabase = createSupabaseAdmin();

    // Verificar se nome já existe
    const { data: existingCategoria } = await supabase
      .from('categorias_produtos')
      .select('id')
      .eq('empresa_id', empresaId)
      .eq('nome', validatedData.nome)
      .single();

    if (existingCategoria) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este nome' },
        { status: 400 }
      );
    }

    // Criar categoria
    const { data: categoria, error } = await supabase
      .from('categorias_produtos')
      .insert({
        ...validatedData,
        empresa_id: empresaId,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar categoria:', error);
      return NextResponse.json(
        { error: 'Erro ao criar categoria' },
        { status: 500 }
      );
    }

    return NextResponse.json(categoria, { status: 201 });

  } catch (error) {
    console.error('Erro na API de categorias:', error);
    
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