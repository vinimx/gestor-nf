import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'
import { notaFiscalSchema, notaFiscalQuerySchema } from '@/lib/validations'

// GET /api/notas - Listar notas fiscais com paginação e filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = notaFiscalQuerySchema.parse({
      empresa_id: searchParams.get('empresa_id'),
      data_inicio: searchParams.get('data_inicio'),
      data_fim: searchParams.get('data_fim'),
      chave: searchParams.get('chave'),
      tipo: searchParams.get('tipo'),
      status: searchParams.get('status'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    const offset = (query.page - 1) * query.limit

    const supabaseAdmin = createSupabaseAdmin();
    let supabaseQuery = supabaseAdmin
      .from('notas_fiscais')
      .select(`
        *,
        empresa:empresas(nome, cnpj),
        fornecedor:empresas!fornecedor_id(nome, cnpj)
      `, { count: 'exact' })

    // Aplicar filtros
    if (query.empresa_id) {
      supabaseQuery = supabaseQuery.eq('empresa_id', query.empresa_id)
    }

    if (query.data_inicio && query.data_fim) {
      supabaseQuery = supabaseQuery
        .gte('data_emissao', query.data_inicio)
        .lte('data_emissao', query.data_fim)
    }

    if (query.chave) {
      supabaseQuery = supabaseQuery.ilike('chave_acesso', `%${query.chave}%`)
    }

    if (query.tipo) {
      supabaseQuery = supabaseQuery.eq('tipo', query.tipo)
    }

    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status)
    }

    // Aplicar ordenação e paginação
    supabaseQuery = supabaseQuery
      .order('data_emissao', { ascending: false })
      .range(offset, offset + query.limit - 1)

    const { data, error, count } = await supabaseQuery

    if (error) {
      console.error('Erro ao buscar notas fiscais:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        total: count || 0,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil((count || 0) / query.limit),
        hasMore: query.page < Math.ceil((count || 0) / query.limit)
      }
    })
  } catch (error) {
    console.error('Erro na validação:', error)
    return NextResponse.json(
      { error: 'Parâmetros de consulta inválidos' },
      { status: 400 }
    )
  }
}

// POST /api/notas - Criar nova nota fiscal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = notaFiscalSchema.parse(body)

    const supabaseAdmin = createSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('notas_fiscais')
      .insert([validatedData])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar nota fiscal:', error)
      
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Chave de acesso já cadastrada no sistema' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
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
