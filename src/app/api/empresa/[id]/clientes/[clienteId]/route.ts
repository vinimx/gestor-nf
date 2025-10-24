import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAuthFromRequest } from "@/lib/auth";
import { clienteUpdateSchema, validarCPFCNPJ } from "@/lib/validations/clienteSchema";

// GET /api/empresa/[id]/clientes/[clienteId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; clienteId: string }> }
) {
  try {
    const { id: empresaId, clienteId } = await params;
    
    if (!empresaId || !clienteId) {
      return NextResponse.json(
        { error: "ID da empresa e cliente são obrigatórios" },
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

    // Buscar cliente
    const { data, error } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .eq('id', clienteId)
      .eq('empresa_id', empresaId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "Cliente não encontrado" },
          { status: 404 }
        );
      }
      console.error('Erro ao buscar cliente:', error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro no endpoint buscar cliente:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/empresa/[id]/clientes/[clienteId]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; clienteId: string }> }
) {
  try {
    const { id: empresaId, clienteId } = await params;
    
    if (!empresaId || !clienteId) {
      return NextResponse.json(
        { error: "ID da empresa e cliente são obrigatórios" },
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

    // Validar dados do cliente
    const body = await request.json();
    const clienteData = clienteUpdateSchema.parse(body);

    // Se CPF/CNPJ foi alterado, validar
    if (clienteData.cpf_cnpj && clienteData.tipo) {
      if (!validarCPFCNPJ(clienteData.cpf_cnpj, clienteData.tipo)) {
        return NextResponse.json(
          { error: `${clienteData.tipo === 'FISICA' ? 'CPF' : 'CNPJ'} inválido` },
          { status: 400 }
        );
      }

      // Verificar se já existe outro cliente com mesmo CPF/CNPJ na empresa
      const { data: existingCliente } = await supabaseAdmin
        .from('clientes')
        .select('id')
        .eq('empresa_id', empresaId)
        .eq('cpf_cnpj', clienteData.cpf_cnpj)
        .neq('id', clienteId)
        .single();

      if (existingCliente) {
        return NextResponse.json(
          { error: "Já existe um cliente com este CPF/CNPJ" },
          { status: 400 }
        );
      }
    }

    // Atualizar cliente
    const { data, error } = await supabaseAdmin
      .from('clientes')
      .update(clienteData)
      .eq('id', clienteId)
      .eq('empresa_id', empresaId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "Cliente não encontrado" },
          { status: 404 }
        );
      }
      console.error('Erro ao atualizar cliente:', error);
      return NextResponse.json(
        { error: "Erro ao atualizar cliente" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro no endpoint atualizar cliente:', error);
    
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

// DELETE /api/empresa/[id]/clientes/[clienteId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; clienteId: string }> }
) {
  try {
    const { id: empresaId, clienteId } = await params;
    
    if (!empresaId || !clienteId) {
      return NextResponse.json(
        { error: "ID da empresa e cliente são obrigatórios" },
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

    // Verificar se cliente existe
    const { data: cliente } = await supabaseAdmin
      .from('clientes')
      .select('id')
      .eq('id', clienteId)
      .eq('empresa_id', empresaId)
      .single();

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Excluir cliente
    const { error } = await supabaseAdmin
      .from('clientes')
      .delete()
      .eq('id', clienteId)
      .eq('empresa_id', empresaId);

    if (error) {
      console.error('Erro ao excluir cliente:', error);
      return NextResponse.json(
        { error: "Erro ao excluir cliente" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Cliente excluído com sucesso" });

  } catch (error) {
    console.error('Erro no endpoint excluir cliente:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
