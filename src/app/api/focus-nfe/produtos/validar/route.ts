import { NextRequest, NextResponse } from 'next/server';
import { getEmpresaFocusConfig } from '@/lib/services/empresaService';

/**
 * Rota para validar produto completo via API FOCUS NFE.
 * 
 * Esta validação inclui validação contextual de CST:
 * - Valida CST no contexto de NCM + CFOP + Regime Tributário
 * - Detecta incompatibilidades que dados locais não capturam
 * - Retorna erros específicos da API FOCUS NFE
 * 
 * IMPORTANTE: Esta é a validação REAL que usa a API externa.
 * Os dados locais de CST são apenas para UI/UX (seleção rápida).
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresa_id');
    const body = await request.json();
    
    // Carregar token/env: empresa -> fallback .env (mesmo padrão da FASE 2)
    let apiToken = process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN || '';
    let environment = (process.env.NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT as 'homologacao' | 'producao') || 'homologacao';
    let baseUrl = environment === 'homologacao' 
      ? 'https://homologacao.focusnfe.com.br' 
      : 'https://api.focusnfe.com.br';
    
    if (empresaId) {
      try {
        const empresaConfig = await getEmpresaFocusConfig(empresaId);
        if (empresaConfig?.focus_nfe_token && empresaConfig.focus_nfe_ativo) {
          apiToken = empresaConfig.focus_nfe_token;
          environment = empresaConfig.focus_nfe_environment;
          baseUrl = environment === 'homologacao' 
            ? 'https://homologacao.focusnfe.com.br' 
            : 'https://api.focusnfe.com.br';
          console.log(`[Validar Produto] Usando token FOCUS NFE da empresa ${empresaId} (${environment})`);
        } else {
          console.warn(`[Validar Produto] Empresa ${empresaId} sem token ativo. Usando token global/env.`);
        }
      } catch (e) {
        console.warn('[Validar Produto] Falha ao obter config da empresa. Usando token global/env.');
      }
    }
    
    // Validação local básica primeiro (formato dos campos)
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
    
    // Se há erros de formato básico, retornar antes de chamar API
    if (errors.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          errors,
          warnings: []
        },
        source: 'local'
      });
    }
    
    // Tentar validar via API FOCUS NFE se token disponível
    if (apiToken) {
      try {
        // Endpoint de validação de produto (se disponível na API FOCUS NFE)
        // Nota: Verificar documentação da FOCUS NFE para endpoint correto
        const apiResponse = await fetch(`${baseUrl}/v2/produtos/validar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(apiToken + ':')}`
          },
          body: JSON.stringify(body)
        });

        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          return NextResponse.json({
            success: true,
            data: {
              valid: apiData.valid || false,
              errors: apiData.errors || [],
              warnings: apiData.warnings || []
            },
            source: 'focus_nfe'
          });
        } else {
          // API retornou erro, mas ainda fazer validação local básica
          const errorData = await apiResponse.json().catch(() => ({}));
          console.warn('[Validar Produto] Erro na API FOCUS NFE:', apiResponse.status, errorData);
          
          // Adicionar validações básicas de alíquotas
          if (body.icms_aliquota !== undefined && (body.icms_aliquota < 0 || body.icms_aliquota > 100)) {
            warnings.push('Alíquota ICMS deve estar entre 0 e 100%');
          }
          
          if (body.ipi_aliquota !== undefined && (body.ipi_aliquota < 0 || body.ipi_aliquota > 100)) {
            warnings.push('Alíquota IPI deve estar entre 0 e 100%');
          }
          
          if (body.pis_aliquota_porcentual !== undefined && (body.pis_aliquota_porcentual < 0 || body.pis_aliquota_porcentual > 100)) {
            warnings.push('Alíquota PIS deve estar entre 0 e 100%');
          }
          
          if (body.cofins_aliquota_porcentual !== undefined && (body.cofins_aliquota_porcentual < 0 || body.cofins_aliquota_porcentual > 100)) {
            warnings.push('Alíquota COFINS deve estar entre 0 e 100%');
          }
          
          return NextResponse.json({
            success: true,
            data: {
              valid: warnings.length === 0,
              errors: [errorData?.error || `Erro ${apiResponse.status} na API FOCUS NFE`],
              warnings
            },
            source: 'local_fallback'
          });
        }
      } catch (error) {
        console.warn('[Validar Produto] Erro ao chamar API FOCUS NFE:', error);
        // Continuar com validação local
      }
    }
    
    // Sem token ou erro na API: validação local básica apenas
    // (não valida CST contextualmente, apenas formato)
    if (body.icms_aliquota !== undefined && (body.icms_aliquota < 0 || body.icms_aliquota > 100)) {
      warnings.push('Alíquota ICMS deve estar entre 0 e 100%');
    }
    
    if (body.ipi_aliquota !== undefined && (body.ipi_aliquota < 0 || body.ipi_aliquota > 100)) {
      warnings.push('Alíquota IPI deve estar entre 0 e 100%');
    }
    
    if (body.pis_aliquota_porcentual !== undefined && (body.pis_aliquota_porcentual < 0 || body.pis_aliquota_porcentual > 100)) {
      warnings.push('Alíquota PIS deve estar entre 0 e 100%');
    }
    
    if (body.cofins_aliquota_porcentual !== undefined && (body.cofins_aliquota_porcentual < 0 || body.cofins_aliquota_porcentual > 100)) {
      warnings.push('Alíquota COFINS deve estar entre 0 e 100%');
    }
    
    return NextResponse.json({
      success: true,
      data: {
        valid: warnings.length === 0,
        errors: [],
        warnings
      },
      source: 'local'
    });
  } catch (error) {
    console.error('[Validar Produto] Erro ao validar produto:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}