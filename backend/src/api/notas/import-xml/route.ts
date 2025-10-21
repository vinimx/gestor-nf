import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'
import { NFEParser } from '@/lib/nfeParser'

// POST /api/notas/import-xml - Importar nota fiscal via XML
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const xmlFile = formData.get('xml') as File
    const empresaId = formData.get('empresa_id') as string

    if (!xmlFile) {
      return NextResponse.json(
        { error: 'Arquivo XML é obrigatório' },
        { status: 400 }
      )
    }

    if (!empresaId) {
      return NextResponse.json(
        { error: 'ID da empresa é obrigatório' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createSupabaseAdmin();
    // Verificar se a empresa existe
    const { data: empresa, error: empresaError } = await supabaseAdmin
      .from('empresas')
      .select('id')
      .eq('id', empresaId)
      .single()

    if (empresaError || !empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    // Ler conteúdo do XML
    const xmlContent = await xmlFile.text()
    
    // Fazer parse do XML
    const parser = new NFEParser()
    
    if (!parser.validateNFeXml(xmlContent)) {
      return NextResponse.json(
        { error: 'XML inválido ou não é uma NFe válida' },
        { status: 400 }
      )
    }

    const nfeData = parser.parseNFeXml(xmlContent)

    // Verificar se já existe nota com a mesma chave de acesso
    if (nfeData.nota.chave_acesso) {
      const { data: existingNota } = await supabaseAdmin
        .from('notas_fiscais')
        .select('id')
        .eq('chave_acesso', nfeData.nota.chave_acesso)
        .single()

      if (existingNota) {
        return NextResponse.json(
          { error: 'Nota fiscal com esta chave de acesso já existe' },
          { status: 409 }
        )
      }
    }

    // Upload do arquivo XML para o Storage
    const fileName = `${empresaId}/${new Date().getFullYear()}/${nfeData.nota.chave_acesso || Date.now()}.xml`
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('nf-xml')
      .upload(fileName, xmlFile)

    if (uploadError) {
      console.error('Erro no upload do XML:', uploadError)
      return NextResponse.json(
        { error: 'Erro ao fazer upload do arquivo XML' },
        { status: 500 }
      )
    }

    // Criar nota fiscal
    const notaFiscalData = {
      ...nfeData.nota,
      empresa_id: empresaId,
      arquivo_xml: uploadData.path,
      status: 'importado'
    }

    const { data: nota, error: notaError } = await supabaseAdmin
      .from('notas_fiscais')
      .insert([notaFiscalData])
      .select()
      .single()

    if (notaError) {
      console.error('Erro ao criar nota fiscal:', notaError)
      return NextResponse.json(
        { error: 'Erro ao criar nota fiscal' },
        { status: 500 }
      )
    }

    // Inserir itens da nota fiscal
    if (nfeData.itens && nfeData.itens.length > 0) {
      const itensData = nfeData.itens.map(item => ({
        ...item,
        nota_id: nota.id
      }))

      const { error: itensError } = await supabaseAdmin
        .from('itens_nota')
        .insert(itensData)

      if (itensError) {
        console.error('Erro ao inserir itens:', itensError)
        // Continuar mesmo com erro nos itens
      }
    }

    // Inserir impostos da nota fiscal
    if (nfeData.impostos && nfeData.impostos.length > 0) {
      const impostosData = nfeData.impostos.map(imposto => ({
        ...imposto,
        nota_id: nota.id
      }))

      const { error: impostosError } = await supabaseAdmin
        .from('impostos_nota')
        .insert(impostosData)

      if (impostosError) {
        console.error('Erro ao inserir impostos:', impostosError)
        // Continuar mesmo com erro nos impostos
      }
    }

    // Buscar nota completa com relacionamentos
    const { data: notaCompleta, error: fetchError } = await supabaseAdmin
      .from('notas_fiscais')
      .select(`
        *,
        empresa:empresas(nome, cnpj),
        itens:itens_nota(*),
        impostos:impostos_nota(*)
      `)
      .eq('id', nota.id)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar nota completa:', fetchError)
    }

    return NextResponse.json({
      message: 'Nota fiscal importada com sucesso',
      data: notaCompleta || nota
    }, { status: 201 })

  } catch (error) {
    console.error('Erro na importação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/notas/import-xml - Obter informações básicas do XML sem importar
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const xmlContent = searchParams.get('xml')

    if (!xmlContent) {
      return NextResponse.json(
        { error: 'Conteúdo XML é obrigatório' },
        { status: 400 }
      )
    }

    const parser = new NFEParser()
    
    if (!parser.validateNFeXml(xmlContent)) {
      return NextResponse.json(
        { error: 'XML inválido ou não é uma NFe válida' },
        { status: 400 }
      )
    }

    const basicInfo = parser.extractBasicInfo(xmlContent)

    return NextResponse.json({
      data: basicInfo
    })

  } catch (error) {
    console.error('Erro ao extrair informações do XML:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
