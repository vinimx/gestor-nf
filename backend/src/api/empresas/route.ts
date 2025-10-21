import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { empresaSchema, empresaQuerySchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";

// GET /api/empresas - Listar empresas com paginação e filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = empresaQuerySchema.parse({
      search: searchParams.get("search") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      order: searchParams.get("order") ?? undefined,
    });

    const supabaseAdmin = createSupabaseAdmin();
    let supabaseQuery = supabaseAdmin
      .from("empresas")
      .select("*", { count: "exact" });

    // Aplicar filtro de busca
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        `nome.ilike.%${query.search}%,cnpj.ilike.%${query.search}%`
      );
    }

    // Aplicar ordenação
    supabaseQuery = supabaseQuery.order(query.sort, {
      ascending: query.order === "asc",
    });

    // Aplicar paginação
    supabaseQuery = supabaseQuery.range(
      query.offset,
      query.offset + query.limit - 1
    );

    const { data, error, count } = await supabaseQuery;

    if (error) {
      console.error("Erro ao buscar empresas:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        total: count || 0,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + query.limit < (count || 0),
      },
    });
  } catch (error) {
    console.error("Erro na validação:", error);
    return NextResponse.json(
      { error: "Parâmetros de consulta inválidos" },
      { status: 400 }
    );
  }
}

// POST /api/empresas - Criar nova empresa
export async function POST(request: NextRequest) {
  try {
    // Autorizar apenas admins
    try {
      await requireAdmin();
    } catch (authErr: any) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    const body = await request.json();
    // Normalize CNPJ to digits-only before validation
    if (body?.cnpj && typeof body.cnpj === "string") {
      body.cnpj = body.cnpj.replace(/\D/g, "");
    }
    const validatedData = empresaSchema.parse(body);

    const supabaseAdmin = createSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("empresas")
      // Store CNPJ as digits-only (14 chars)
      .insert([{ ...validatedData, cnpj: validatedData.cnpj }])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar empresa:", error);

      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          { error: "CNPJ já cadastrado no sistema" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Erro na validação:", error);

    if (error && (error as any).issues) {
      // Zod error
      console.error("Zod validation error:", (error as any).issues);
      return NextResponse.json(
        { error: "Dados inválidos", details: (error as any).issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
