import { NextRequest, NextResponse } from 'next/server';
import { getEmpresaFocusConfig } from '@/lib/services/empresaService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get('codigo');
    const descricao = searchParams.get('descricao');
    const limit = parseInt(searchParams.get('limit') || '50'); // FOCUS NFE retorna 50 por padrão
    const offset = parseInt(searchParams.get('offset') || '0');

    const empresaId = searchParams.get('empresa_id');
    
    // Carregar token/env: empresa -> fallback .env (mesmo padrão da FASE 2)
    let apiToken = process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN || '';
    let environment = (process.env.NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT as 'homologacao' | 'producao') || 'homologacao';
    
    if (empresaId) {
      try {
        const empresaConfig = await getEmpresaFocusConfig(empresaId);
        if (empresaConfig?.focus_nfe_token && empresaConfig.focus_nfe_ativo) {
          apiToken = empresaConfig.focus_nfe_token;
          environment = empresaConfig.focus_nfe_environment;
          console.log(`[CFOP] Usando token FOCUS NFE da empresa ${empresaId} (${environment})`);
        } else {
          console.warn(`[CFOP] Empresa ${empresaId} sem token ativo. Usando token global/env.`);
        }
      } catch (e) {
        console.warn('[CFOP] Falha ao obter config da empresa. Usando token global/env.');
      }
    }
    
    // Se não há token, retornar erro (se empresaId presente) ou dados locais (sem empresaId)
    if (!apiToken) {
      if (empresaId) {
        return NextResponse.json(
          {
            success: false,
            error: { codigo: 'TOKEN_INDISPONIVEL', mensagem: 'Token FOCUS NFE não configurado' }
          },
          { status: 400 }
        );
      }
      console.warn('[CFOP] Token FOCUS NFE não configurado, usando dados locais');
      return NextResponse.json({
        success: true,
        data: getCFOPsLocais(codigo, descricao, limit, offset),
        totalCount: 8,
        source: 'local'
      });
    }

    // Construir URLs (tentar múltiplas variações como na FASE 2)
    const baseUrl = environment === 'homologacao' 
      ? 'https://homologacao.focusnfe.com.br' 
      : 'https://api.focusnfe.com.br';

    const buildCandidates = (base: string) => [
      `${base}/v2/cfops`,
      `${base}/v2/cfops/`,
    ];

    const queryParams = new URLSearchParams();
    
    // Parâmetros conforme documentação FOCUS NFE
    if (codigo) queryParams.append('codigo', codigo);
    if (descricao) queryParams.append('descricao', descricao);
    if (limit > 0) queryParams.append('limit', limit.toString());
    if (offset > 0) queryParams.append('offset', offset.toString());

    const hosts: Array<{ env: 'homologacao' | 'producao'; url: string }> = [
      { env: environment, url: baseUrl },
      { env: environment === 'producao' ? 'homologacao' : 'producao', url: environment === 'producao' ? 'https://homologacao.focusnfe.com.br' : 'https://api.focusnfe.com.br' },
    ];

    let data: any = null;
    let lastErrorText = '';
    let lastStatus = 0;
    let usedEnv: 'homologacao' | 'producao' = environment;

    console.log('[CFOP] Tentando buscar da API FOCUS NFE...');

    outer: for (const host of hosts) {
      const endpoints = buildCandidates(host.url);
      for (let baseUrlCandidate of endpoints) {
        const queryString = queryParams.toString();
        const fullUrl = queryString ? `${baseUrlCandidate}?${queryString}` : baseUrlCandidate;
        
        console.log(`[CFOP] Tentando: ${fullUrl}`);

        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(apiToken + ':').toString('base64')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'gestor-nf/1.0 (+https://localhost)'
          },
          next: { revalidate: 0 }
        });

        if (!response.ok) {
          lastStatus = response.status;
          const errorText = await response.text();
          lastErrorText = errorText;
          
          // Não retornar 401 imediatamente - tentar todos os hosts primeiro
          if (response.status === 401) {
            console.warn(`[CFOP] Token inválido (401) no ambiente ${host.env}, tentando próximo...`);
            // Continuar para tentar próximo host/ambiente
            continue;
          }
          
          console.warn(`[CFOP] Erro ${response.status}, tentando próximo endpoint...`);
          continue;
        }

        try {
          data = await response.json();
          if (data && Array.isArray(data)) {
            usedEnv = host.env;
            console.log(`[CFOP] Sucesso! Recebidos ${data.length} CFOPs do ambiente ${usedEnv}`);
            break outer;
          }
        } catch (e) {
          console.warn('[CFOP] Resposta não é JSON válido, tentando próximo...');
          continue;
        }
      }
    }

    if (!data || !Array.isArray(data)) {
      console.error('[CFOP] Erro Focus NFe (última tentativa):', lastStatus, lastErrorText);
      
      // Se 401 após tentar todos os hosts, token está inválido
      if (lastStatus === 401) {
        const mensagemErro = empresaId
          ? 'Token FOCUS NFE inválido. Configure um token válido na empresa ou no sistema.'
          : 'Token FOCUS NFE não configurado ou inválido. Configure NEXT_PUBLIC_FOCUS_NFE_TOKEN no .env ou configure token na empresa.';
        
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              codigo: 'NAO_AUTORIZADO', 
              mensagem: mensagemErro 
            } 
          }, 
          { status: 401 }
        );
      }
      
      // Se empresaId presente, não retornar dados locais
      if (empresaId) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              codigo: 'ERRO_API', 
              mensagem: lastErrorText || 'Erro ao conectar com a API Focus NFe. Verifique sua conexão.' 
            } 
          }, 
          { status: lastStatus || 502 }
        );
      }
      
      // Sem empresaId: retornar dados locais como fallback
      return NextResponse.json({
        success: true,
        data: getCFOPsLocais(codigo, descricao, limit, offset),
        totalCount: 8,
        source: 'local_fallback',
        error: `API FOCUS NFE retornou ${lastStatus}: ${lastErrorText}`
      });
    }

    // Extrair totalCount se disponível
    const totalCount = data.length; // Default: usar tamanho do array

    return NextResponse.json({
      success: true,
      data: data,
      totalCount: totalCount,
      source: 'focus_nfe',
      environment_used: usedEnv
    });

  } catch (error) {
    console.error('[CFOP] Erro no proxy:', error);
    
    // Se empresaId presente, não retornar dados locais
    const empresaId = new URL(request.url).searchParams.get('empresa_id');
    if (empresaId) {
      return NextResponse.json(
        {
          success: false,
          error: { codigo: 'ERRO_REDE', mensagem: error instanceof Error ? error.message : 'Erro de conexão com a API FOCUS NFE' }
        },
        { status: 500 }
      );
    }
    
    // Sem empresaId: retornar dados locais como fallback
    return NextResponse.json({
      success: true,
      data: getCFOPsLocais(),
      totalCount: 8,
      source: 'local_fallback',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

function getCFOPsLocais(codigo?: string | null, descricao?: string | null, limit: number = 20, offset: number = 0) {
  const cfopsLocais = [
    {
      codigo: '5101',
      descricao: '5101 - Venda de produção do estabelecimento',
      valid: true,
      tipo: 'SAIDA'
    },
    {
      codigo: '5102',
      descricao: '5102 - Venda de mercadoria adquirida ou recebida de terceiros',
      valid: true,
      tipo: 'SAIDA'
    },
    {
      codigo: '5103',
      descricao: '5103 - Venda de mercadoria adquirida ou recebida de terceiros, efetuada fora do estabelecimento',
      valid: true,
      tipo: 'SAIDA'
    },
    {
      codigo: '1101',
      descricao: '1101 - Compra para industrialização',
      valid: true,
      tipo: 'ENTRADA'
    },
    {
      codigo: '1102',
      descricao: '1102 - Compra para comercialização',
      valid: true,
      tipo: 'ENTRADA'
    },
    {
      codigo: '1103',
      descricao: '1103 - Compra para industrialização de produto sujeito ao regime de substituição tributária',
      valid: true,
      tipo: 'ENTRADA'
    },
    {
      codigo: '2151',
      descricao: '2151 - Transferência p/ industrialização ou produção rural',
      valid: true,
      tipo: 'ENTRADA'
    },
    {
      codigo: '2152',
      descricao: '2152 - Transferência p/ comercialização',
      valid: true,
      tipo: 'ENTRADA'
    }
  ];

  let resultados = cfopsLocais;

  // Aplicar filtros
  if (codigo) {
    resultados = resultados.filter(cfop => 
      cfop.codigo.includes(codigo)
    );
  }

  if (descricao) {
    resultados = resultados.filter(cfop => 
      cfop.descricao.toLowerCase().includes(descricao.toLowerCase())
    );
  }

  // Aplicar paginação
  const startIndex = offset;
  const endIndex = startIndex + limit;
  resultados = resultados.slice(startIndex, endIndex);

  return resultados;
}
