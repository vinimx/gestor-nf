import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      razao_social: "Empresa Teste LTDA",
      cnpj: "12345678000195",
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
    }
  });
}
