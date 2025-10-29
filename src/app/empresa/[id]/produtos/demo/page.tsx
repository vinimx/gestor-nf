"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { 
  SeletorNCM, 
  SeletorCFOP, 
  SeletorCST, 
  CalculadoraImpostos, 
  ValidadorFiscal 
} from "@/components/Empresa/Produtos/Seletores";
import { FocusNCMData, FocusCFOPData, FocusCSTData } from "@/types/produto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Calculator, 
  Shield, 
  CheckCircle,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function DemoSeletoresFiscais() {
  const params = useParams();
  const empresaId = params.id as string;

  // Estados dos seletores
  const [ncm, setNCM] = useState<FocusNCMData | null>(null);
  const [cfopSaida, setCFOPSaida] = useState<FocusCFOPData | null>(null);
  const [cfopEntrada, setCFOPEntrada] = useState<FocusCFOPData | null>(null);
  const [cstICMS, setCSTICMS] = useState<FocusCSTData | null>(null);
  const [cstIPI, setCSTIPI] = useState<FocusCSTData | null>(null);
  const [cstPIS, setCSTPIS] = useState<FocusCSTData | null>(null);
  const [cstCOFINS, setCSTCOFINS] = useState<FocusCSTData | null>(null);

  // Estados do produto
  const [produto, setProduto] = useState({
    codigo: "PROD001",
    nome: "Produto de Demonstração",
    descricao: "Produto para demonstração dos seletores fiscais",
    tipo: "PRODUTO" as const,
    unidade: "UN" as const,
    preco_venda: 100.00,
    ncm: "",
    cfop_saida: "",
    cfop_entrada: "",
    icms_situacao_tributaria: "",
    icms_origem: "0",
    icms_modalidade_base_calculo: "0",
    icms_reducao_base_calculo: 0,
    aliquota_icms: 18,
    aliquota_ipi: 10,
    aliquota_pis: 1.65,
    aliquota_cofins: 7.6,
    ipi_situacao_tributaria: "",
    pis_situacao_tributaria: "",
    cofins_situacao_tributaria: "",
    ativo: true,
  });

  // Handlers dos seletores
  const handleNCMChange = (ncmData: FocusNCMData) => {
    setNCM(ncmData);
    setProduto(prev => ({ ...prev, ncm: ncmData.codigo }));
  };

  const handleCFOPSaidaChange = (cfopData: FocusCFOPData) => {
    setCFOPSaida(cfopData);
    setProduto(prev => ({ ...prev, cfop_saida: cfopData.codigo }));
  };

  const handleCFOPEntradaChange = (cfopData: FocusCFOPData) => {
    setCFOPEntrada(cfopData);
    setProduto(prev => ({ ...prev, cfop_entrada: cfopData.codigo }));
  };

  const handleCSTICMSChange = (cstData: FocusCSTData) => {
    setCSTICMS(cstData);
    setProduto(prev => ({ ...prev, icms_situacao_tributaria: cstData.codigo }));
  };

  const handleCSTIPIChange = (cstData: FocusCSTData) => {
    setCSTIPI(cstData);
    setProduto(prev => ({ ...prev, ipi_situacao_tributaria: cstData.codigo }));
  };

  const handleCSTPISChange = (cstData: FocusCSTData) => {
    setCSTPIS(cstData);
    setProduto(prev => ({ ...prev, pis_situacao_tributaria: cstData.codigo }));
  };

  const handleCSTCOFINSChange = (cstData: FocusCSTData) => {
    setCSTCOFINS(cstData);
    setProduto(prev => ({ ...prev, cofins_situacao_tributaria: cstData.codigo }));
  };

  const resetDemo = () => {
    setNCM(null);
    setCFOPSaida(null);
    setCFOPEntrada(null);
    setCSTICMS(null);
    setCSTIPI(null);
    setCSTPIS(null);
    setCSTCOFINS(null);
    setProduto(prev => ({
      ...prev,
      ncm: "",
      cfop_saida: "",
      cfop_entrada: "",
      icms_situacao_tributaria: "",
      ipi_situacao_tributaria: "",
      pis_situacao_tributaria: "",
      cofins_situacao_tributaria: "",
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/empresa/${empresaId}/produtos`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Demo - Seletores Fiscais Inteligentes</h1>
            <p className="text-gray-600">Demonstração dos seletores NCM, CFOP e CST com integração FOCUS NFE</p>
          </div>
        </div>
        <Button onClick={resetDemo} variant="outline">
          Reset Demo
        </Button>
      </div>

      {/* Grid de seletores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Seletores */}
        <div className="space-y-6">
          {/* Informações do Produto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Informações do Produto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={produto.codigo}
                    onChange={(e) => setProduto(prev => ({ ...prev, codigo: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={produto.nome}
                    onChange={(e) => setProduto(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="preco">Preço de Venda</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  value={produto.preco_venda}
                  onChange={(e) => setProduto(prev => ({ ...prev, preco_venda: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Seletor NCM */}
          <Card>
            <CardHeader>
              <CardTitle>Seletor NCM</CardTitle>
            </CardHeader>
            <CardContent>
              <SeletorNCM
                value={produto.ncm}
                onChange={handleNCMChange}
                placeholder="Digite o código NCM (8 dígitos)..."
              />
            </CardContent>
          </Card>

          {/* Seletores CFOP */}
          <Card>
            <CardHeader>
              <CardTitle>Seletores CFOP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SeletorCFOP
                value={produto.cfop_saida}
                onChange={handleCFOPSaidaChange}
                tipo="SAIDA"
                placeholder="CFOP de Saída..."
              />
              <SeletorCFOP
                value={produto.cfop_entrada}
                onChange={handleCFOPEntradaChange}
                tipo="ENTRADA"
                placeholder="CFOP de Entrada..."
              />
            </CardContent>
          </Card>

          {/* Seletores CST */}
          <Card>
            <CardHeader>
              <CardTitle>Seletores CST</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SeletorCST
                value={produto.icms_situacao_tributaria}
                onChange={handleCSTICMSChange}
                tipo="ICMS"
                placeholder="CST ICMS..."
              />
              <SeletorCST
                value={produto.ipi_situacao_tributaria}
                onChange={handleCSTIPIChange}
                tipo="IPI"
                placeholder="CST IPI..."
              />
              <SeletorCST
                value={produto.pis_situacao_tributaria}
                onChange={handleCSTPISChange}
                tipo="PIS"
                placeholder="CST PIS..."
              />
              <SeletorCST
                value={produto.cofins_situacao_tributaria}
                onChange={handleCSTCOFINSChange}
                tipo="COFINS"
                placeholder="CST COFINS..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Calculadora e Validador */}
        <div className="space-y-6">
          {/* Calculadora de Impostos */}
          <CalculadoraImpostos
            produto={produto}
            quantidade={1}
            valorUnitario={produto.preco_venda}
          />

          {/* Validador Fiscal */}
          <ValidadorFiscal
            produto={produto}
          />

          {/* Resumo dos Dados Selecionados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Resumo dos Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ncm && (
                <div className="p-2 bg-green-50 border border-green-200 rounded">
                  <div className="text-sm font-medium text-green-800">NCM Selecionado</div>
                  <div className="text-sm text-green-600">{ncm.codigo} - {ncm.descricao}</div>
                </div>
              )}
              
              {cfopSaida && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-sm font-medium text-blue-800">CFOP Saída</div>
                  <div className="text-sm text-blue-600">{cfopSaida.codigo} - {cfopSaida.descricao}</div>
                </div>
              )}
              
              {cfopEntrada && (
                <div className="p-2 bg-purple-50 border border-purple-200 rounded">
                  <div className="text-sm font-medium text-purple-800">CFOP Entrada</div>
                  <div className="text-sm text-purple-600">{cfopEntrada.codigo} - {cfopEntrada.descricao}</div>
                </div>
              )}
              
              {cstICMS && (
                <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                  <div className="text-sm font-medium text-orange-800">CST ICMS</div>
                  <div className="text-sm text-orange-600">{cstICMS.codigo} - {cstICMS.descricao}</div>
                </div>
              )}
              
              {cstIPI && (
                <div className="p-2 bg-pink-50 border border-pink-200 rounded">
                  <div className="text-sm font-medium text-pink-800">CST IPI</div>
                  <div className="text-sm text-pink-600">{cstIPI.codigo} - {cstIPI.descricao}</div>
                </div>
              )}
              
              {cstPIS && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-sm font-medium text-yellow-800">CST PIS</div>
                  <div className="text-sm text-yellow-600">{cstPIS.codigo} - {cstPIS.descricao}</div>
                </div>
              )}
              
              {cstCOFINS && (
                <div className="p-2 bg-indigo-50 border border-indigo-200 rounded">
                  <div className="text-sm font-medium text-indigo-800">CST COFINS</div>
                  <div className="text-sm text-indigo-600">{cstCOFINS.codigo} - {cstCOFINS.descricao}</div>
                </div>
              )}
              
              {!ncm && !cfopSaida && !cfopEntrada && !cstICMS && !cstIPI && !cstPIS && !cstCOFINS && (
                <div className="text-center text-gray-500 py-4">
                  <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Nenhum dado selecionado</p>
                  <p className="text-sm">Use os seletores acima para começar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
