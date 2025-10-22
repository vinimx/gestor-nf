import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { empresaSchema } from "@/lib/validations";
import { ZodError } from "zod";

// GET /api/empresas/[id] - Buscar empresa por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    let supabaseAdmin;
    try {
      supabaseAdmin = createSupabaseAdmin();
    } catch (envErr) {
      console.error("Erro ao criar supabase admin:", envErr);
      return NextResponse.json(
        { error: "Supabase não está configurado" },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("empresas")
      .select("*")
      .eq("id", id)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Sanitizar: converter strings vazias para undefined
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
    
    // Normalizar CNPJ para apenas dígitos antes da validação
    if (sanitized?.cnpj && typeof sanitized.cnpj === "string") {
      sanitized.cnpj = sanitized.cnpj.replace(/\D/g, "");
    }
    
    const validatedData = empresaSchema.parse(sanitized);

    let supabaseAdmin;
    try {
      supabaseAdmin = createSupabaseAdmin();
    } catch (envErr) {
      console.error("Erro ao criar supabase admin:", envErr);
      if (process.env.NODE_ENV === "development") {
        // Em dev, retornar dados fake para permitir testes de UI
        return NextResponse.json({
          ...validatedData,
          id: id,
          updated_at: new Date().toISOString(),
        });
      }

      return NextResponse.json(
        { error: "Supabase não está configurado" },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("empresas")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
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
        { error: "Erro interno do servidor", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
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

// DELETE /api/empresas/[id] - Excluir empresa
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    let supabaseAdmin;
    try {
      supabaseAdmin = createSupabaseAdmin();
    } catch (envErr) {
      console.error("Erro ao criar supabase admin:", envErr);
      if (process.env.NODE_ENV === "development") {
        // Em dev, retornar sucesso fake para permitir testes de UI
        return NextResponse.json({ 
          message: "Empresa excluída com sucesso (modo dev)" 
        });
      }

      return NextResponse.json(
        { error: "Supabase não está configurado" },
        { status: 500 }
      );
    }

    const { error } = await supabaseAdmin
      .from("empresas")
      .delete()
      .eq("id", id);

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
        { error: "Erro interno do servidor", details: error },
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

