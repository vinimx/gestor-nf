/**
 * Integração com a API ViaCEP
 */

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

/**
 * Busca endereço por CEP na API ViaCEP
 */
export async function buscarCEP(cep: string): Promise<ViaCEPResponse | null> {
  try {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, "");
    
    // Valida formato do CEP
    if (cepLimpo.length !== 8) {
      throw new Error("CEP inválido");
    }
    
    const response = await fetch(
      `https://viacep.com.br/ws/${cepLimpo}/json/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      throw new Error("Erro ao buscar CEP");
    }
    
    const data: ViaCEPResponse = await response.json();
    
    // ViaCEP retorna { erro: true } quando o CEP não existe
    if (data.erro) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    throw error;
  }
}

