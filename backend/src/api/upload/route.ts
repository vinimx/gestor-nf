import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

// POST /api/upload - Upload de arquivos para o Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin();
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;
    const path = formData.get("path") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo é obrigatório" },
        { status: 400 }
      );
    }

    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket é obrigatório" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ["application/xml", "text/xml", "application/pdf"];
    const allowedExtensions = [".xml", ".pdf"];

    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      return NextResponse.json(
        {
          error: "Tipo de arquivo não permitido. Apenas XML e PDF são aceitos.",
        },
        { status: 400 }
      );
    }

    // Validar tamanho do arquivo (máximo 10MB para XML, 50MB para PDF)
    const maxSize =
      fileExtension === ".xml" ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `Arquivo muito grande. Máximo permitido: ${
            fileExtension === ".xml" ? "10MB" : "50MB"
          }`,
        },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}_${randomString}${fileExtension}`;

    const fullPath = path ? `${path}/${fileName}` : fileName;

    // Upload do arquivo
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fullPath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Erro no upload:", error);
      return NextResponse.json(
        { error: "Erro ao fazer upload do arquivo" },
        { status: 500 }
      );
    }

    // Gerar URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fullPath);

    return NextResponse.json(
      {
        message: "Arquivo enviado com sucesso",
        data: {
          path: data.path,
          url: urlData.publicUrl,
          size: file.size,
          type: file.type,
          name: file.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// GET /api/upload - Obter URL assinada para upload direto
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get("bucket");
    const path = searchParams.get("path");
    const expiresIn = parseInt(searchParams.get("expiresIn") || "3600");

    if (!bucket || !path) {
      return NextResponse.json(
        { error: "Bucket e path são obrigatórios" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createSupabaseAdmin();
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(path, { expiresIn } as any);

    if (error) {
      console.error("Erro ao gerar URL assinada:", error);
      return NextResponse.json(
        { error: "Erro ao gerar URL de upload" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        signedUrl: data.signedUrl,
        token: data.token,
        path: data.path,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar URL assinada:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
