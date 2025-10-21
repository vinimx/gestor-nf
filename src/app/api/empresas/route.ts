import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { empresaSchema, empresaQuerySchema } from "@/lib/validations";
import { ZodError } from "zod";

// GET /api/empresas - Listar empresas com paginação e filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // URLSearchParams.get() retorna null quando a chave não existe.
    // Converter explicitamente null -> undefined para que os defaults do Zod sejam aplicados.
    const query = empresaQuerySchema.parse({
      search: searchParams.get("search") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      order: searchParams.get("order") ?? undefined,
      ativo: searchParams.get("ativo") ?? undefined,
    });

    // Criar o client do supabase admin sob demanda. Se falhar, tratar abaixo.
    let supabaseAdmin;
    try {
      supabaseAdmin = createSupabaseAdmin();
    } catch (envErr) {
      console.error("Erro ao criar supabase admin:", envErr);
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json(
          {
            data: [],
            pagination: {
              total: 0,
              limit: query.limit,
              offset: query.offset,
              hasMore: false,
            },
            offline: true,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: "Supabase environment variables are not configured" },
        { status: 500 }
      );
    }

    let supabaseQuery = supabaseAdmin
      .from("empresas")
      .select("*", { count: "exact" });

    // Aplicar filtro de busca
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        `nome.ilike.%${query.search}%,cnpj.ilike.%${query.search}%`
      );
    }

    // Aplicar filtro de status ativo/inativo
    if (query.ativo !== undefined) {
      supabaseQuery = supabaseQuery.eq("ativo", query.ativo);
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

    let data, error, count;
    try {
      const res = await supabaseQuery;
      data = res.data;
      error = res.error;
      count = res.count;
    } catch (err) {
      console.error("Erro ao buscar empresas:", err);
      // Em desenvolvimento, retornar empty set ao invés de 502 para permitir QA da UI
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json(
          {
            data: [],
            pagination: {
              total: 0,
              limit: query.limit,
              offset: query.offset,
              hasMore: false,
            },
            offline: true,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          error: "Erro ao conectar com o serviço de dados",
          details: String(err),
        },
        { status: 502 }
      );
    }

    if (error) {
      console.error("Erro ao buscar empresas:", error);

      // Detectar erro de esquema ausente (PostgREST PGRST205)
      const msg = String(error.message || "");
      if (
        msg.includes("Could not find the table") ||
        msg.includes("PGRST205")
      ) {
        const friendly =
          "Tabela 'empresas' não encontrada no banco. Execute as migrations.";
        if (process.env.NODE_ENV === "development") {
          return NextResponse.json(
            {
              data: [],
              pagination: {
                total: 0,
                limit: query.limit,
                offset: query.offset,
                hasMore: false,
              },
              offline: true,
              warning: friendly,
            },
            { status: 200 }
          );
        }
        return NextResponse.json(
          { error: friendly, details: error },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "Erro interno do servidor", details: error },
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
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Parâmetros de consulta inválidos", details: error.issues },
        { status: 400 }
      );
    }
    // Em desenvolvimento, enviar fallback para não quebrar a UI durante desenvolvimento
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        {
          data: [],
          pagination: { total: 0, limit: 10, offset: 0, hasMore: false },
          offline: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Parâmetros de consulta inválidos" },
      { status: 400 }
    );
  }
}

// POST /api/empresas - Criar nova empresa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Sanitizar: converter strings vazias para undefined para campos opcionais
    function sanitizeEmptyStrings(obj: any): any {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj === "string") {
        const s = obj.trim();
        return s === "" ? undefined : s;
      }
      if (Array.isArray(obj)) return obj.map(sanitizeEmptyStrings);
      if (typeof obj === "object") {
        const out: any = {};
        for (const key of Object.keys(obj)) {
          out[key] = sanitizeEmptyStrings(obj[key]);
        }
        return out;
      }
      return obj;
    }

    const sanitized = sanitizeEmptyStrings(body);
    const validatedData = empresaSchema.parse(sanitized);

    let supabaseAdmin;
    try {
      supabaseAdmin = createSupabaseAdmin();
    } catch (envErr) {
      console.error("Erro ao criar supabase admin:", envErr);
      if (process.env.NODE_ENV === "development") {
        // Em dev, retornar um objeto fake para permitir testes de UI
        return NextResponse.json(
          {
            ...validatedData,
            id: "local-fake-id",
            created_at: new Date().toISOString(),
          },
          { status: 201 }
        );
      }

      return NextResponse.json(
        { error: "Supabase environment variables are not configured" },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("empresas")
      .insert([validatedData])
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

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
