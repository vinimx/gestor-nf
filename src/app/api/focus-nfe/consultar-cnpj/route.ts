import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cnpj } = body;

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

    // Simular dados de resposta
    const mockData = {
      razao_social: "Empresa Teste LTDA",
      cnpj: cnpjLimpo,
      situacao_cadastral: "ativa",
      cnae_principal: "6201-5/00",
      optante_simples_nacional: true,
      optante_mei: false,
      endereco: {
        codigo_municipio: "3550308",
        nome_municipio: "São Paulo",
        logradouro: "Rua Teste",
        complemento: "",
        numero: "123",
        bairro: "Centro",
        cep: "01000-000",
        uf: "SP"
      }
    };

    return NextResponse.json({
      success: true,
      data: mockData
    });

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