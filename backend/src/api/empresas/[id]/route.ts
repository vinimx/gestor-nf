import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { empresaSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";

// GET /api/empresas/[id] - Buscar empresa por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = createSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("empresas")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return NextResponse.json(
          { error: "Empresa não encontrada" },
          { status: 404 }
        );
      }

      console.error("Erro ao buscar empresa:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro na requisição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/empresas/[id] - Atualizar empresa
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      .update({
        ...validatedData,
        cnpj: validatedData.cnpj,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return NextResponse.json(
          { error: "Empresa não encontrada" },
          { status: 404 }
        );
      }

      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          { error: "CNPJ já cadastrado no sistema" },
          { status: 409 }
        );
      }

      console.error("Erro ao atualizar empresa:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
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

// DELETE /api/empresas/[id] - Excluir empresa
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    try {
      await requireAdmin();
    } catch (authErr: any) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    const supabaseAdmin = createSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from("empresas")
      .delete()
      .eq("id", params.id);

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return NextResponse.json(
          { error: "Empresa não encontrada" },
          { status: 404 }
        );
      }

      console.error("Erro ao excluir empresa:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Empresa excluída com sucesso" });
  } catch (error) {
    console.error("Erro na requisição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
