import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Validação básica dos dados
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!body.codigo_produto) {
      errors.push('Código do produto é obrigatório');
    }
    
    if (!body.descricao) {
      errors.push('Descrição é obrigatória');
    }
    
    if (!body.codigo_ncm || !/^\d{8}$/.test(body.codigo_ncm)) {
      errors.push('NCM deve ter 8 dígitos');
    }
    
    if (!body.cfop || !/^\d{4}$/.test(body.cfop)) {
      errors.push('CFOP deve ter 4 dígitos');
    }
    
    if (body.valor_bruto <= 0) {
      errors.push('Valor bruto deve ser maior que zero');
    }
    
    if (body.icms_aliquota < 0 || body.icms_aliquota > 100) {
      warnings.push('Alíquota ICMS deve estar entre 0 e 100%');
    }
    
    if (body.ipi_aliquota && (body.ipi_aliquota < 0 || body.ipi_aliquota > 100)) {
      warnings.push('Alíquota IPI deve estar entre 0 e 100%');
    }
    
    if (body.pis_aliquota_porcentual && (body.pis_aliquota_porcentual < 0 || body.pis_aliquota_porcentual > 100)) {
      warnings.push('Alíquota PIS deve estar entre 0 e 100%');
    }
    
    if (body.cofins_aliquota_porcentual && (body.cofins_aliquota_porcentual < 0 || body.cofins_aliquota_porcentual > 100)) {
      warnings.push('Alíquota COFINS deve estar entre 0 e 100%');
    }
    
    const valid = errors.length === 0;
    
    return NextResponse.json({
      success: true,
      data: {
        valid,
        errors,
        warnings
      }
    });
  } catch (error) {
    console.error('Erro ao validar produto:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}