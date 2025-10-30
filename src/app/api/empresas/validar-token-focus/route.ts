import { NextRequest, NextResponse } from 'next/server';

interface FocusTokenValidationResponse {
  success: boolean;
  valid: boolean;
  message?: string;
  environment?: string;
  empresa?: {
    nome?: string;
    cnpj?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { token, environment = 'homologacao' } = await request.json();

    if (!token) {
      return NextResponse.json({
        success: false,
        valid: false,
        message: 'Token é obrigatório'
      }, { status: 400 });
    }

    // Determinar URL base baseada no ambiente
    const baseUrl = environment === 'producao' 
      ? 'https://api.focusnfe.com.br'
      : 'https://homologacao.focusnfe.com.br';

    // Testar o token fazendo uma requisição simples para a API FOCUS NFE
    const testUrl = `${baseUrl}/v2/ncms?limit=1`;
    
    // Usar a mesma autenticação que as outras rotas FOCUS NFE
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(token + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Validação token FOCUS NFE:', {
      environment,
      baseUrl,
      testUrl,
      status: response.status,
      statusText: response.statusText
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = { message: 'Resposta não é JSON válido' };
    }

    if (response.ok) {
      // Token válido
      console.log('Token válido! Resposta da API:', responseData);
      return NextResponse.json({
        success: true,
        valid: true,
        message: `Token válido e funcionando corretamente no ambiente ${environment === 'producao' ? 'PRODUÇÃO' : 'HOMOLOGAÇÃO'}`,
        environment: environment,
        empresa: {
          // A API FOCUS NFE não retorna dados da empresa diretamente,
          // mas podemos indicar que o token está funcionando
        }
      });
    } else if (response.status === 401) {
      // Token inválido ou expirado
      console.error('Token inválido (401):', responseData);
      
      // Verificar se é um problema de ambiente
      const isEnvironmentMismatch = environment === 'homologacao' && responseData.message?.includes('Unauthorized');
      
      return NextResponse.json({
        success: true,
        valid: false,
        message: isEnvironmentMismatch 
          ? 'Token de PRODUÇÃO detectado, mas você está testando em HOMOLOGAÇÃO. Use o ambiente "Produção" ou obtenha um token de homologação no painel FOCUS NFE.'
          : 'Token inválido ou expirado. Verifique suas credenciais no painel FOCUS NFE.',
        environment: environment,
        suggestion: isEnvironmentMismatch ? 'Tente selecionar "Produção" no campo Ambiente' : 'Verifique se o token está correto e ativo',
        debug: {
          status: response.status,
          response: responseData
        }
      });
    } else if (response.status === 403) {
      // Token sem permissão
      console.error('Token sem permissão (403):', responseData);
      return NextResponse.json({
        success: true,
        valid: false,
        message: 'Token sem permissão para acessar a API. Verifique as permissões no painel FOCUS NFE.',
        environment: environment,
        suggestion: 'Verifique se o token tem permissão para acessar a API de consulta de NCMs',
        debug: {
          status: response.status,
          response: responseData
        }
      });
    } else {
      // Outros erros
      console.error('Erro na validação do token:', {
        status: response.status,
        statusText: response.statusText,
        response: responseData
      });
      return NextResponse.json({
        success: true,
        valid: false,
        message: `Erro na validação (${response.status}): ${responseData.message || response.statusText || 'Erro desconhecido'}`,
        environment: environment,
        suggestion: 'Verifique sua conexão com a internet e tente novamente',
        debug: {
          status: response.status,
          statusText: response.statusText,
          response: responseData
        }
      });
    }

  } catch (error) {
    console.error('Erro na validação do token FOCUS NFE:', error);
    
    return NextResponse.json({
      success: false,
      valid: false,
      message: 'Erro interno do servidor ao validar token'
    }, { status: 500 });
  }
}
