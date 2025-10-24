import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAuthFromRequest } from "@/lib/auth";
import { clienteQuerySchema, clienteCreateSchema, validarCPFCNPJ } from "@/lib/validations/clienteSchema";

// GET /api/empresa/[id]/clientes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: empresaId } = await params;
    
    if (!empresaId) {
      return NextResponse.json(
        { error: "ID da empresa é obrigatório" },
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

    // Validar parâmetros de query
    const { searchParams } = new URL(request.url);
    const query = clienteQuerySchema.parse({
      search: searchParams.get("search") ?? undefined,
      tipo: searchParams.get("tipo") ?? undefined,
      ativo: searchParams.get("ativo") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      order: searchParams.get("order") ?? undefined,
    });

    let supabaseQuery = supabaseAdmin
      .from('clientes')
      .select('*', { count: 'exact' })
      .eq('empresa_id', empresaId);

    // Aplicar filtros
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        `nome_razao_social.ilike.%${query.search}%,cpf_cnpj.ilike.%${query.search}%,email.ilike.%${query.search}%`
      );
    }

    if (query.tipo) {
      supabaseQuery = supabaseQuery.eq('tipo', query.tipo);
    }

    if (query.ativo !== undefined) {
      supabaseQuery = supabaseQuery.eq('ativo', query.ativo);
    }

    // Aplicar ordenação
    supabaseQuery = supabaseQuery.order(query.sort, {
      ascending: query.order === 'asc',
    });

    // Aplicar paginação
    supabaseQuery = supabaseQuery.range(
      query.offset,
      query.offset + query.limit - 1
    );

    const { data, error, count } = await supabaseQuery;

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / query.limit);
    const currentPage = Math.floor(query.offset / query.limit) + 1;

    return NextResponse.json({
      data: data || [],
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + query.limit < total,
        totalPages,
        currentPage,
      },
    });

  } catch (error) {
    console.error('Erro no endpoint clientes:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST /api/empresa/[id]/clientes
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: empresaId } = await params;
    
    if (!empresaId) {
      return NextResponse.json(
        { error: "ID da empresa é obrigatório" },
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
    const clienteData = clienteCreateSchema.parse({
      ...body,
      empresa_id: empresaId,
    });

    // Validar CPF/CNPJ
    if (!validarCPFCNPJ(clienteData.cpf_cnpj, clienteData.tipo)) {
      return NextResponse.json(
        { error: `${clienteData.tipo === 'FISICA' ? 'CPF' : 'CNPJ'} inválido` },
        { status: 400 }
      );
    }

    // Verificar se já existe cliente com mesmo CPF/CNPJ na empresa
    const { data: existingCliente } = await supabaseAdmin
      .from('clientes')
      .select('id')
      .eq('empresa_id', empresaId)
      .eq('cpf_cnpj', clienteData.cpf_cnpj)
      .single();

    if (existingCliente) {
      return NextResponse.json(
        { error: "Já existe um cliente com este CPF/CNPJ" },
        { status: 400 }
      );
    }

    // Criar cliente
    const { data, error } = await supabaseAdmin
      .from('clientes')
      .insert([clienteData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar cliente:', error);
      return NextResponse.json(
        { error: "Erro ao criar cliente" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Erro no endpoint criar cliente:', error);
    
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
