import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'
import { notaFiscalSchema } from '@/lib/validations'

// GET /api/notas/[id] - Buscar nota fiscal por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = createSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('notas_fiscais')
      .select(`
        *,
        empresa:empresas(nome, cnpj),
        fornecedor:empresas!fornecedor_id(nome, cnpj),
        itens:itens_nota(*),
        impostos:impostos_nota(*)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return NextResponse.json(
          { error: 'Nota fiscal não encontrada' },
          { status: 404 }
        )
      }
      
      console.error('Erro ao buscar nota fiscal:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro na requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/notas/[id] - Atualizar nota fiscal
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = notaFiscalSchema.parse(body)

    const supabaseAdmin = createSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('notas_fiscais')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return NextResponse.json(
          { error: 'Nota fiscal não encontrada' },
          { status: 404 }
        )
      }
      
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Chave de acesso já cadastrada no sistema' },
          { status: 409 }
        )
      }
      
      console.error('Erro ao atualizar nota fiscal:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro na validação:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/notas/[id] - Excluir nota fiscal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = createSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('notas_fiscais')
      .delete()
      .eq('id', params.id)

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return NextResponse.json(
          { error: 'Nota fiscal não encontrada' },
          { status: 404 }
        )
      }
      
      console.error('Erro ao excluir nota fiscal:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Nota fiscal excluída com sucesso' })
  } catch (error) {
    console.error('Erro na requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
