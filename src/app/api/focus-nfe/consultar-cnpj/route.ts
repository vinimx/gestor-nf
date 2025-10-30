import { NextRequest, NextResponse } from "next/server";
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { getEmpresaFocusConfig } from '@/lib/services/empresaService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cnpj = searchParams.get('cnpj');
  const empresaId = searchParams.get('empresa_id');

  if (!cnpj) {
    // Healthcheck/diagnóstico
    return NextResponse.json({
      success: true,
      message: 'Rota ativa. Use POST com { cnpj } ou GET com ?cnpj= e opcional empresa_id.'
    });
  }

  // Reusar lógica do POST
  return POST(
    new NextRequest(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnpj, empresa_id: empresaId })
    })
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cnpj } = body;
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresa_id');

    if (!cnpj) {
      return NextResponse.json(
        { error: "CNPJ é obrigatório" },
        { status: 400 }
      );
    }

    // Validar formato do CNPJ (14 dígitos)
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) {
      return NextResponse.json(
        { error: "CNPJ deve ter 14 dígitos" },
        { status: 400 }
      );
    }

    // Carregar token/env: empresa -> fallback .env
    let apiToken = process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN || '';
    let environment = (process.env.NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT as 'homologacao' | 'producao') || 'homologacao';

    if (empresaId) {
      try {
        const empresaConfig = await getEmpresaFocusConfig(empresaId);
        if (empresaConfig?.focus_nfe_token && empresaConfig.focus_nfe_ativo) {
          apiToken = empresaConfig.focus_nfe_token;
          environment = empresaConfig.focus_nfe_environment;
          console.log(`[CNPJ] Usando token FOCUS NFE da empresa ${empresaId} (${environment})`);
        } else {
          console.warn(`[CNPJ] Empresa ${empresaId} sem token ativo. Usando token global/env.`);
        }
      } catch (e) {
        console.warn('[CNPJ] Falha ao obter config da empresa. Usando token global/env.');
      }
    }

    if (!apiToken) {
      return NextResponse.json(
        {
          success: false,
          error: { codigo: 'TOKEN_INDISPONIVEL', mensagem: 'Token FOCUS NFE não configurado' }
        },
        { status: 400 }
      );
    }

    const hosts: Array<{ env: 'homologacao' | 'producao'; url: string }> = [
      { env: environment, url: environment === 'producao' ? 'https://api.focusnfe.com.br' : 'https://homologacao.focusnfe.com.br' },
      { env: environment === 'producao' ? 'homologacao' : 'producao', url: environment === 'producao' ? 'https://homologacao.focusnfe.com.br' : 'https://api.focusnfe.com.br' },
    ];

    const buildCandidates = (base: string) => [
      `${base}/v2/cnpj/${cnpjLimpo}`,
      `${base}/v2/cnpj/${cnpjLimpo}/`,
      `${base}/v2/cnpjs/${cnpjLimpo}`,
      `${base}/v2/cnpjs/${cnpjLimpo}/`,
      `${base}/v1/cnpj/${cnpjLimpo}`,
      `${base}/v1/cnpj/${cnpjLimpo}/`,
      `${base}/v2/cnpj?cnpj=${cnpjLimpo}`,
      `${base}/v1/cnpj?cnpj=${cnpjLimpo}`,
    ];

    let data: any = null;
    let lastErrorText = '';
    let lastStatus = 0;
    let usedEnv: 'homologacao' | 'producao' = environment;

    outer: for (const host of hosts) {
      const endpoints = buildCandidates(host.url);
      for (const url of endpoints) {
        const resp = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(apiToken + ':').toString('base64')}`,
            'Accept': 'application/json',
            'User-Agent': 'gestor-nf/1.0 (+https://localhost)'
          },
          next: { revalidate: 0 }
        });

        if (!resp.ok) {
          lastStatus = resp.status;
          lastErrorText = await resp.text();
          if (resp.status === 401) {
            return NextResponse.json({ success: false, error: { codigo: 'NAO_AUTORIZADO', mensagem: 'Token inválido ou ambiente incorreto' } }, { status: 401 });
          }
          // tenta próxima variação
          continue;
        }

        try {
          data = await resp.json();
        } catch {
          const text = await resp.text();
          try { data = JSON.parse(text); } catch { data = null; }
        }

        if (data) { usedEnv = host.env; break outer; }
      }
    }

    if (!data) {
      console.error('[CNPJ] Erro Focus NFe (última tentativa):', lastStatus, lastErrorText);
      return NextResponse.json({ success: false, error: { codigo: 'ERRO_API', mensagem: lastErrorText || 'Endpoint não encontrado na API Focus NFe' } }, { status: lastStatus || 502 });
    }

    // Normalização mínima para front
    const normalizado = {
      razao_social: data.razao_social || data.nome || '',
      cnpj: data.cnpj || cnpjLimpo,
      situacao_cadastral: data.situacao_cadastral || data.situacao || '',
      cnae_principal: data.cnae_principal || data.cnae || '',
      optante_simples_nacional: !!(data.optante_simples_nacional ?? data.simples_nacional),
      optante_mei: !!(data.optante_mei ?? data.mei),
      logradouro: data.logradouro || data.endereco?.logradouro || '',
      numero: data.numero || data.endereco?.numero || '',
      complemento: data.complemento || data.endereco?.complemento || '',
      bairro: data.bairro || data.endereco?.bairro || '',
      nome_municipio: data.nome_municipio || data.endereco?.cidade || '',
      uf: data.uf || data.endereco?.uf || '',
      cep: data.cep || data.endereco?.cep || '',
    };

    return NextResponse.json({ success: true, data: normalizado, environment_used: usedEnv });

  } catch (error) {
    console.error('Erro na API de consulta CNPJ:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          codigo: 'ERRO_REDE',
          mensagem: 'Erro de conexão com a API FOCUS NFE'
        }
      },
      { status: 500 }
    );
  }
}