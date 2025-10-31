import { NextRequest, NextResponse } from 'next/server';
import { getEmpresaFocusConfig } from '@/lib/services/empresaService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  // Capturar empresaId antes do try para usar no catch
  const { searchParams } = new URL(request.url);
  const empresaId = searchParams.get('empresa_id');
  
  try {
    const { codigo } = await params;

    if (!codigo || !/^\d{4}$/.test(codigo)) {
      return NextResponse.json(
        { success: false, error: 'Código CFOP inválido' },
        { status: 400 }
      );
    }
    
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
      const cfopLocal = getCFOPIndividualLocal(codigo);
      if (cfopLocal) {
        return NextResponse.json({
          success: true,
          data: cfopLocal,
          source: 'local'
        });
      }
      return NextResponse.json(
        { success: false, error: 'CFOP não encontrado' },
        { status: 404 }
      );
    }

    // Tentar ambos os ambientes
    const hosts: Array<{ env: 'homologacao' | 'producao'; url: string }> = [
      { env: environment, url: environment === 'homologacao' ? 'https://homologacao.focusnfe.com.br' : 'https://api.focusnfe.com.br' },
      { env: environment === 'producao' ? 'homologacao' : 'producao', url: environment === 'producao' ? 'https://homologacao.focusnfe.com.br' : 'https://api.focusnfe.com.br' },
    ];

    let data: any = null;
    let lastErrorText = '';
    let lastStatus = 0;

    for (const host of hosts) {
      const url = `${host.url}/v2/cfops/${codigo}`;
      console.log(`[CFOP] Tentando buscar CFOP individual: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(apiToken + ':').toString('base64')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        next: { revalidate: 0 }
      });

      if (!response.ok) {
        lastStatus = response.status;
        lastErrorText = await response.text();
        
        if (response.status === 401) {
          console.warn(`[CFOP] Token inválido (401) no ambiente ${host.env}, tentando próximo...`);
          continue;
        }
        
        console.warn(`[CFOP] Erro ${response.status}, tentando próximo ambiente...`);
        continue;
      }

      try {
        data = await response.json();
        console.log(`[CFOP] Sucesso! CFOP encontrado no ambiente ${host.env}`);
        break;
      } catch (e) {
        console.warn('[CFOP] Resposta não é JSON válido, tentando próximo...');
        continue;
      }
    }

    if (!data) {
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
      
      // Sem empresaId: tentar dados locais como fallback
      const cfopLocal = getCFOPIndividualLocal(codigo);
      if (cfopLocal) {
        return NextResponse.json({
          success: true,
          data: cfopLocal,
          source: 'local_fallback',
          error: `API FOCUS NFE retornou ${lastStatus}: ${lastErrorText}`
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'CFOP não encontrado' },
        { status: lastStatus || 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
      source: 'focus_nfe'
    });

  } catch (error) {
    console.error('[CFOP] Erro no proxy individual:', error);
    
    // Se empresaId presente, não retornar dados locais
    const { codigo } = await params;
    
    if (empresaId) {
      return NextResponse.json(
        {
          success: false,
          error: { codigo: 'ERRO_REDE', mensagem: error instanceof Error ? error.message : 'Erro de conexão com a API FOCUS NFE' }
        },
        { status: 500 }
      );
    }
    
    // Sem empresaId: tentar dados locais como fallback
    const cfopLocal = getCFOPIndividualLocal(codigo);
    if (cfopLocal) {
      return NextResponse.json({
        success: true,
        data: cfopLocal,
        source: 'local_fallback',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function getCFOPIndividualLocal(codigo: string) {
  const cfopsLocais: Record<string, any> = {
    '5101': {
      codigo: '5101',
      descricao: '5101 - Venda de produção do estabelecimento',
      valid: true,
      tipo: 'SAIDA'
    },
    '5102': {
      codigo: '5102',
      descricao: '5102 - Venda de mercadoria adquirida ou recebida de terceiros',
      valid: true,
      tipo: 'SAIDA'
    },
    '5103': {
      codigo: '5103',
      descricao: '5103 - Venda de mercadoria adquirida ou recebida de terceiros, efetuada fora do estabelecimento',
      valid: true,
      tipo: 'SAIDA'
    },
    '1101': {
      codigo: '1101',
      descricao: '1101 - Compra para industrialização',
      valid: true,
      tipo: 'ENTRADA'
    },
    '1102': {
      codigo: '1102',
      descricao: '1102 - Compra para comercialização',
      valid: true,
      tipo: 'ENTRADA'
    },
    '1103': {
      codigo: '1103',
      descricao: '1103 - Compra para industrialização de produto sujeito ao regime de substituição tributária',
      valid: true,
      tipo: 'ENTRADA'
    },
    '2151': {
      codigo: '2151',
      descricao: '2151 - Transferência p/ industrialização ou produção rural',
      valid: true,
      tipo: 'ENTRADA'
    },
    '2152': {
      codigo: '2152',
      descricao: '2152 - Transferência p/ comercialização',
      valid: true,
      tipo: 'ENTRADA'
    }
  };

  return cfopsLocais[codigo] || null;
}
