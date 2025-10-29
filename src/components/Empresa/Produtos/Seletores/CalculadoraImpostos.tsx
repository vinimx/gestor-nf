"use client";

import { useState, useEffect } from "react";
import { useCalculadoraImpostos } from "@/hooks/useCalculadoraImpostos";
import { Produto } from "@/types/produto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface CalculadoraImpostosProps {
  produto: Partial<Produto>;
  quantidade?: number;
  valorUnitario?: number;
  onCalculationChange?: (calculos: any) => void;
  className?: string;
}

export function CalculadoraImpostos({
  produto,
  quantidade = 1,
  valorUnitario,
  onCalculationChange,
  className,
}: CalculadoraImpostosProps) {
  const [localQuantidade, setLocalQuantidade] = useState(quantidade);
  const [localValorUnitario, setLocalValorUnitario] = useState(valorUnitario || produto.preco_venda || 0);
  
  const { 
    calculos, 
    loading, 
    error, 
    calcularImpostos, 
    limparCalculos 
  } = useCalculadoraImpostos();

  // Recalcular quando produto ou valores mudam
  useEffect(() => {
    if (produto && (produto.preco_venda || localValorUnitario)) {
      calcularImpostos(produto, localQuantidade, localValorUnitario);
    }
  }, [produto, localQuantidade, localValorUnitario, calcularImpostos]);

  // Notificar mudanças nos cálculos
  useEffect(() => {
    if (calculos && onCalculationChange) {
      onCalculationChange(calculos);
    }
  }, [calculos, onCalculationChange]);

  const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantidade = parseFloat(e.target.value) || 0;
    setLocalQuantidade(newQuantidade);
  };

  const handleValorUnitarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValor = parseFloat(e.target.value) || 0;
    setLocalValorUnitario(newValor);
  };

  const getImpostoColor = (valor: number) => {
    if (valor === 0) return "text-gray-500";
    if (valor < 10) return "text-green-600";
    if (valor < 20) return "text-yellow-600";
    return "text-red-600";
  };

  const getImpostoIcon = (valor: number) => {
    if (valor === 0) return <CheckCircle className="h-4 w-4 text-gray-400" />;
    if (valor < 10) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (valor < 20) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  if (!produto || (!produto.preco_venda && !localValorUnitario)) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Calculadora de Impostos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Configure o produto para ver os cálculos de impostos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Calculadora de Impostos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Inputs para quantidade e valor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input
              id="quantidade"
              type="number"
              min="0"
              step="0.001"
              value={localQuantidade}
              onChange={handleQuantidadeChange}
              placeholder="1"
            />
          </div>
          <div>
            <Label htmlFor="valor-unitario">Valor Unitário</Label>
            <Input
              id="valor-unitario"
              type="number"
              min="0"
              step="0.01"
              value={localValorUnitario}
              onChange={handleValorUnitarioChange}
              placeholder="0,00"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-sm text-gray-600">Calculando impostos...</span>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          </div>
        )}

        {/* Cálculos */}
        {calculos && !loading && (
          <div className="space-y-4">
            {/* Resumo dos impostos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">ICMS</span>
                  {getImpostoIcon(calculos.icms.aliquota)}
                </div>
                <div className={cn("text-lg font-bold", getImpostoColor(calculos.icms.aliquota))}>
                  {calculos.icms.aliquota.toFixed(2)}%
                </div>
                <div className="text-sm text-blue-600">
                  {formatCurrency(calculos.icms.valor)}
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-800">IPI</span>
                  {getImpostoIcon(calculos.ipi.aliquota)}
                </div>
                <div className={cn("text-lg font-bold", getImpostoColor(calculos.ipi.aliquota))}>
                  {calculos.ipi.aliquota.toFixed(2)}%
                </div>
                <div className="text-sm text-purple-600">
                  {formatCurrency(calculos.ipi.valor)}
                </div>
              </div>

              <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-800">PIS</span>
                  {getImpostoIcon(calculos.pis.aliquota)}
                </div>
                <div className={cn("text-lg font-bold", getImpostoColor(calculos.pis.aliquota))}>
                  {calculos.pis.aliquota.toFixed(2)}%
                </div>
                <div className="text-sm text-orange-600">
                  {formatCurrency(calculos.pis.valor)}
                </div>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">COFINS</span>
                  {getImpostoIcon(calculos.cofins.aliquota)}
                </div>
                <div className={cn("text-lg font-bold", getImpostoColor(calculos.cofins.aliquota))}>
                  {calculos.cofins.aliquota.toFixed(2)}%
                </div>
                <div className="text-sm text-green-600">
                  {formatCurrency(calculos.cofins.valor)}
                </div>
              </div>
            </div>

            {/* Totais */}
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Valor dos Produtos:</span>
                  <span className="font-medium">{formatCurrency(calculos.total.valorProdutos)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Impostos:</span>
                  <span className="font-medium text-red-600">{formatCurrency(calculos.total.valorImpostos)}</span>
                </div>
                
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-base font-semibold">Valor Total:</span>
                  <span className="text-lg font-bold text-green-600">{formatCurrency(calculos.total.valorTotal)}</span>
                </div>
              </div>
            </div>

            {/* Detalhes dos cálculos */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Detalhes dos Cálculos</h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Base de Cálculo ICMS:</span>
                  <span>{formatCurrency(calculos.icms.baseCalculo)}</span>
                </div>
                {calculos.icms.reducao && calculos.icms.reducao > 0 && (
                  <div className="flex justify-between">
                    <span>Redução ICMS:</span>
                    <span>{calculos.icms.reducao.toFixed(2)}%</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Base de Cálculo IPI:</span>
                  <span>{formatCurrency(calculos.ipi.baseCalculo)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Base de Cálculo PIS:</span>
                  <span>{formatCurrency(calculos.pis.baseCalculo)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Base de Cálculo COFINS:</span>
                  <span>{formatCurrency(calculos.cofins.baseCalculo)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
