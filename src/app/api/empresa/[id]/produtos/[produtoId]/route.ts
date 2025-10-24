import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAuthFromRequest } from "@/lib/auth";
import { produtoUpdateSchema, validarNCM, validarCFOP } from "@/lib/validations/produtoSchema";

// GET /api/empresa/[id]/produtos/[produtoId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; produtoId: string }> }
) {
  try {
    const { id: empresaId, produtoId } = await params;
    
    if (!empresaId || !produtoId) {
      return NextResponse.json(
        { error: "ID da empresa e produto são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar autenticação
    const { user, error: authError } = await requireAuthFromRequest(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

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

    // Buscar produto
    const { data, error } = await supabaseAdmin
      .from('produtos')
      .select('*')
      .eq('id', produtoId)
      .eq('empresa_id', empresaId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "Produto não encontrado" },
          { status: 404 }
        );
      }
      console.error('Erro ao buscar produto:', error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro no endpoint buscar produto:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/empresa/[id]/produtos/[produtoId]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; produtoId: string }> }
) {
  try {
    const { id: empresaId, produtoId } = await params;
    
    if (!empresaId || !produtoId) {
      return NextResponse.json(
        { error: "ID da empresa e produto são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar autenticação
    const { user, error: authError } = await requireAuthFromRequest(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

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

    // Validar dados do produto
    const body = await request.json();
    const produtoData = produtoUpdateSchema.parse(body);

    // Se NCM foi alterado, validar
    if (produtoData.codigo_ncm && !validarNCM(produtoData.codigo_ncm)) {
      return NextResponse.json(
        { error: "NCM inválido" },
        { status: 400 }
      );
    }

    // Se CFOP foi alterado, validar
    if (produtoData.codigo_cfop && !validarCFOP(produtoData.codigo_cfop)) {
      return NextResponse.json(
        { error: "CFOP inválido" },
        { status: 400 }
      );
    }

    // Se código foi alterado, verificar se já existe outro produto com mesmo código na empresa
    if (produtoData.codigo) {
      const { data: existingProduto } = await supabaseAdmin
        .from('produtos')
        .select('id')
        .eq('empresa_id', empresaId)
        .eq('codigo', produtoData.codigo)
        .neq('id', produtoId)
        .single();

      if (existingProduto) {
        return NextResponse.json(
          { error: "Já existe um produto com este código" },
          { status: 400 }
        );
      }
    }

    // Atualizar produto
    const { data, error } = await supabaseAdmin
      .from('produtos')
      .update(produtoData)
      .eq('id', produtoId)
      .eq('empresa_id', empresaId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "Produto não encontrado" },
          { status: 404 }
        );
      }
      console.error('Erro ao atualizar produto:', error);
      return NextResponse.json(
        { error: "Erro ao atualizar produto" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro no endpoint atualizar produto:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/empresa/[id]/produtos/[produtoId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; produtoId: string }> }
) {
  try {
    const { id: empresaId, produtoId } = await params;
    
    if (!empresaId || !produtoId) {
      return NextResponse.json(
        { error: "ID da empresa e produto são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar autenticação
    const { user, error: authError } = await requireAuthFromRequest(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

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

    // Verificar se produto existe
    const { data: produto } = await supabaseAdmin
      .from('produtos')
      .select('id')
      .eq('id', produtoId)
      .eq('empresa_id', empresaId)
      .single();

    if (!produto) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Excluir produto
    const { error } = await supabaseAdmin
      .from('produtos')
      .delete()
      .eq('id', produtoId)
      .eq('empresa_id', empresaId);

    if (error) {
      console.error('Erro ao excluir produto:', error);
      return NextResponse.json(
        { error: "Erro ao excluir produto" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Produto excluído com sucesso" });

  } catch (error) {
    console.error('Erro no endpoint excluir produto:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
