"use client";

import { useState, useCallback, useEffect } from "react";
import { Produto } from "@/types/produto";

interface CalculosImpostos {
  icms: {
    baseCalculo: number;
    aliquota: number;
    valor: number;
    reducao?: number;
  };
  ipi: {
    baseCalculo: number;
    aliquota: number;
    valor: number;
  };
  pis: {
    baseCalculo: number;
    aliquota: number;
    valor: number;
  };
  cofins: {
    baseCalculo: number;
    aliquota: number;
    valor: number;
  };
  total: {
    valorProdutos: number;
    valorImpostos: number;
    valorTotal: number;
  };
}

interface UseCalculadoraImpostosResult {
  calculos: CalculosImpostos | null;
  loading: boolean;
  error: string | null;
  calcularImpostos: (produto: Partial<Produto>, quantidade?: number, valorUnitario?: number) => void;
  limparCalculos: () => void;
}

export function useCalculadoraImpostos(): UseCalculadoraImpostosResult {
  const [calculos, setCalculos] = useState<CalculosImpostos | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para calcular ICMS
  const calcularICMS = useCallback((
    valorProduto: number,
    aliquota: number,
    reducaoBaseCalculo: number = 0
  ): { baseCalculo: number; valor: number } => {
    const baseCalculo = valorProduto * (1 - reducaoBaseCalculo / 100);
    const valor = baseCalculo * (aliquota / 100);
    
    return {
      baseCalculo: Math.round(baseCalculo * 100) / 100,
      valor: Math.round(valor * 100) / 100,
    };
  }, []);

  // Função para calcular IPI
  const calcularIPI = useCallback((
    valorProduto: number,
    aliquota: number
  ): { baseCalculo: number; valor: number } => {
    const baseCalculo = valorProduto;
    const valor = baseCalculo * (aliquota / 100);
    
    return {
      baseCalculo: Math.round(baseCalculo * 100) / 100,
      valor: Math.round(valor * 100) / 100,
    };
  }, []);

  // Função para calcular PIS/COFINS
  const calcularPISCofins = useCallback((
    valorProduto: number,
    aliquotaPIS: number,
    aliquotaCOFINS: number
  ): { 
    pis: { baseCalculo: number; valor: number };
    cofins: { baseCalculo: number; valor: number };
  } => {
    const baseCalculo = valorProduto;
    
    const pis = {
      baseCalculo: Math.round(baseCalculo * 100) / 100,
      valor: Math.round(baseCalculo * (aliquotaPIS / 100) * 100) / 100,
    };
    
    const cofins = {
      baseCalculo: Math.round(baseCalculo * 100) / 100,
      valor: Math.round(baseCalculo * (aliquotaCOFINS / 100) * 100) / 100,
    };
    
    return { pis, cofins };
  }, []);

  // Função principal para calcular impostos
  const calcularImpostos = useCallback((
    produto: Partial<Produto>,
    quantidade: number = 1,
    valorUnitario?: number
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Usar valor unitário fornecido ou preço de venda do produto
      const valorProduto = (valorUnitario || produto.preco_venda || 0) * quantidade;
      
      if (valorProduto <= 0) {
        setCalculos(null);
        return;
      }

      // Calcular ICMS
      const icms = calcularICMS(
        valorProduto,
        produto.aliquota_icms || 0,
        produto.icms_reducao_base_calculo || 0
      );

      // Calcular IPI
      const ipi = calcularIPI(
        valorProduto,
        produto.aliquota_ipi || 0
      );

      // Calcular PIS/COFINS
      const pisCofins = calcularPISCofins(
        valorProduto,
        produto.aliquota_pis || 0,
        produto.aliquota_cofins || 0
      );

      // Calcular totais
      const valorImpostos = icms.valor + ipi.valor + pisCofins.pis.valor + pisCofins.cofins.valor;
      const valorTotal = valorProduto + valorImpostos;

      const novosCalculos: CalculosImpostos = {
        icms: {
          baseCalculo: icms.baseCalculo,
          aliquota: produto.aliquota_icms || 0,
          valor: icms.valor,
          reducao: produto.icms_reducao_base_calculo || 0,
        },
        ipi: {
          baseCalculo: ipi.baseCalculo,
          aliquota: produto.aliquota_ipi || 0,
          valor: ipi.valor,
        },
        pis: {
          baseCalculo: pisCofins.pis.baseCalculo,
          aliquota: produto.aliquota_pis || 0,
          valor: pisCofins.pis.valor,
        },
        cofins: {
          baseCalculo: pisCofins.cofins.baseCalculo,
          aliquota: produto.aliquota_cofins || 0,
          valor: pisCofins.cofins.valor,
        },
        total: {
          valorProdutos: valorProduto,
          valorImpostos: valorImpostos,
          valorTotal: valorTotal,
        },
      };

      setCalculos(novosCalculos);
    } catch (err: any) {
      console.error('Erro ao calcular impostos:', err);
      setError(err.message || 'Erro ao calcular impostos');
      setCalculos(null);
    } finally {
      setLoading(false);
    }
  }, [calcularICMS, calcularIPI, calcularPISCofins]);

  // Função para limpar cálculos
  const limparCalculos = useCallback(() => {
    setCalculos(null);
    setError(null);
  }, []);

  return {
    calculos,
    loading,
    error,
    calcularImpostos,
    limparCalculos,
  };
}
