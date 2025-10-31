"use client";

import { useState, useEffect, useRef } from "react";
import { useFipe } from "@/hooks/useFipe";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Car, CheckCircle, TrendingUp, ChevronDown, Search, Package, Calendar, Building2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ConsultaFIPEProps {
  onValorConsultado?: (valor: string, dados: any) => void;
}

export function ConsultaFIPE({ onValorConsultado }: ConsultaFIPEProps) {
  const {
    marcas,
    modelos,
    anos,
    valorFipe,
    loadingMarcas,
    loadingModelos,
    loadingAnos,
    loadingConsulta,
    error,
    buscarMarcas,
    buscarModelos,
    buscarAnos,
    consultarValor,
    limpar,
  } = useFipe();

  const [tipoVeiculo, setTipoVeiculo] = useState<'carros' | 'motos' | 'caminhoes'>('carros');
  const [marcaSelecionada, setMarcaSelecionada] = useState<string>("");
  const [modeloSelecionado, setModeloSelecionado] = useState<string>("");
  const [anoSelecionado, setAnoSelecionado] = useState<string>("");
  const valorFipeProcessadoRef = useRef<string | null>(null);

  // Carregar marcas quando tipo de veículo mudar
  useEffect(() => {
    if (tipoVeiculo) {
      limpar();
      buscarMarcas(tipoVeiculo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoVeiculo]);

  // Carregar modelos quando marca for selecionada
  useEffect(() => {
    if (marcaSelecionada && tipoVeiculo) {
      setModeloSelecionado("");
      setAnoSelecionado("");
      buscarModelos(tipoVeiculo, marcaSelecionada);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marcaSelecionada, tipoVeiculo]);

  // Carregar anos quando modelo for selecionado
  useEffect(() => {
    if (modeloSelecionado && marcaSelecionada && tipoVeiculo) {
      setAnoSelecionado("");
      buscarAnos(tipoVeiculo, marcaSelecionada, modeloSelecionado);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeloSelecionado, marcaSelecionada, tipoVeiculo]);

  // Notificar quando valor for consultado (apenas uma vez por consulta)
  useEffect(() => {
    if (valorFipe && onValorConsultado) {
      // A API pode retornar Valor ou price, verificar ambos
      const valor = valorFipe.Valor || (valorFipe as any).price || '';
      const valorId = valor ? `${valor}-${valorFipe.Marca}-${valorFipe.Modelo}` : null;
      
      // Evitar chamar múltiplas vezes para o mesmo valor
      if (valor && valorId && valorFipeProcessadoRef.current !== valorId) {
        valorFipeProcessadoRef.current = valorId;
        onValorConsultado(valor, valorFipe);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valorFipe]);
  
  // Resetar flag quando limpar
  useEffect(() => {
    if (!valorFipe) {
      valorFipeProcessadoRef.current = null;
    }
  }, [valorFipe]);

  const handleConsultar = () => {
    if (tipoVeiculo && marcaSelecionada && modeloSelecionado && anoSelecionado) {
      consultarValor(tipoVeiculo, marcaSelecionada, modeloSelecionado, anoSelecionado);
    }
  };


  const podeConsultar = tipoVeiculo && marcaSelecionada && modeloSelecionado && anoSelecionado && !loadingConsulta;

  return (
    <Card className="w-full border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <Car className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg font-semibold text-gray-800">
            Consulta Tabela FIPE
          </CardTitle>
        </div>
        <CardDescription className="text-sm text-gray-600">
          Consulte o valor de mercado do veículo na Tabela FIPE
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tipo de Veículo */}
        <div className="space-y-2">
          <Label htmlFor="tipo-veiculo" className="text-sm font-semibold text-gray-800 flex items-center">
            <Car className="h-4 w-4 mr-2 text-blue-600" />
            Tipo de Veículo
          </Label>
          <Select value={tipoVeiculo} onValueChange={(value: 'carros' | 'motos' | 'caminhoes') => {
            setTipoVeiculo(value);
            setMarcaSelecionada("");
            setModeloSelecionado("");
            setAnoSelecionado("");
          }}>
            <SelectTrigger 
              id="tipo-veiculo"
              className="bg-white text-[var(--foreground)] border-2 border-blue-300 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11 text-base font-medium"
            >
              <SelectValue placeholder="Selecione o tipo" />
              <ChevronDown className="h-4 w-4 opacity-50" />
            </SelectTrigger>
            <SelectContent className="bg-white text-[var(--foreground)] shadow-xl border-2 border-blue-200 max-h-[300px]">
              <SelectItem key="tipo-carros" value="carros" className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 py-3">
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Carros</span>
                </div>
              </SelectItem>
              <SelectItem key="tipo-motos" value="motos" className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 py-3">
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Motos</span>
                </div>
              </SelectItem>
              <SelectItem key="tipo-caminhoes" value="caminhoes" className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 py-3">
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Caminhões</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Marca */}
        <div className="space-y-2">
          <Label htmlFor="marca" className="text-sm font-semibold text-gray-800 flex items-center">
            <Building2 className="h-4 w-4 mr-2 text-blue-600" />
            Marca
            {loadingMarcas && <Loader2 className="h-3 w-3 ml-2 animate-spin text-blue-600" />}
            {!loadingMarcas && marcas.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-500">({marcas.length} disponíveis)</span>
            )}
          </Label>
          <Select
            value={marcaSelecionada}
            onValueChange={setMarcaSelecionada}
            disabled={loadingMarcas || marcas.length === 0}
          >
            <SelectTrigger 
              id="marca"
              className={cn(
                "bg-white text-[var(--foreground)] border-2 h-11 text-base",
                loadingMarcas 
                  ? "border-blue-200 border-dashed" 
                  : marcaSelecionada
                    ? "border-green-400 hover:border-green-500"
                    : "border-blue-300 hover:border-blue-400",
                "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              )}
            >
              <SelectValue placeholder={loadingMarcas ? "Carregando marcas..." : marcas.length === 0 ? "Nenhuma marca disponível" : "Selecione a marca"} />
              {!loadingMarcas && marcaSelecionada && <CheckCircle className="h-4 w-4 text-green-600 ml-2" />}
              {loadingMarcas && <Loader2 className="h-4 w-4 animate-spin text-blue-600 ml-2" />}
              {!loadingMarcas && !marcaSelecionada && <ChevronDown className="h-4 w-4 opacity-50 ml-2" />}
            </SelectTrigger>
            <SelectContent className="bg-white text-[var(--foreground)] shadow-xl border-2 border-blue-200 max-h-[300px]">
              {loadingMarcas ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Carregando marcas...</span>
                </div>
              ) : marcas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 px-4">
                  <Package className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 text-center">Nenhuma marca encontrada</p>
                  <p className="text-xs text-gray-500 text-center mt-1">Tente selecionar outro tipo de veículo</p>
                </div>
              ) : (
                marcas.length > 0 ? (
                  marcas.map((marca, index) => {
                    // Debug: verificar estrutura dos dados
                    console.log('[ConsultaFIPE] Marca item:', { marca, index, codigo: marca?.codigo, nome: marca?.nome });
                    
                    // Suportar diferentes estruturas possíveis da API
                    const codigo = marca?.codigo || marca?.id || marca?.code || String(index);
                    const nome = marca?.nome || marca?.name || 'Marca desconhecida';
                    
                    return (
                      <SelectItem 
                        key={`marca-${codigo}-${index}`} 
                        value={String(codigo)}
                        className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 py-2.5"
                      >
                        {nome}
                      </SelectItem>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 px-4">
                    <Package className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 text-center">Array de marcas está vazio</p>
                    <p className="text-xs text-gray-500 text-center mt-1">Verifique o console para logs de debug</p>
                  </div>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Modelo */}
        <div className="space-y-2">
          <Label htmlFor="modelo" className="text-sm font-semibold text-gray-800 flex items-center">
            <Package className="h-4 w-4 mr-2 text-blue-600" />
            Modelo
            {loadingModelos && <Loader2 className="h-3 w-3 ml-2 animate-spin text-blue-600" />}
            {!loadingModelos && modelos.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-500">({modelos.length} disponíveis)</span>
            )}
          </Label>
          <Select
            value={modeloSelecionado}
            onValueChange={setModeloSelecionado}
            disabled={!marcaSelecionada || loadingModelos || modelos.length === 0}
          >
            <SelectTrigger 
              id="modelo"
              className={cn(
                "bg-white text-[var(--foreground)] border-2 h-11 text-base",
                !marcaSelecionada
                  ? "border-gray-200 bg-gray-50"
                  : loadingModelos
                    ? "border-blue-200 border-dashed"
                    : modeloSelecionado
                      ? "border-green-400 hover:border-green-500"
                      : "border-blue-300 hover:border-blue-400",
                "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              )}
            >
              <SelectValue 
                placeholder={
                  !marcaSelecionada 
                    ? "Selecione a marca primeiro" 
                    : loadingModelos 
                      ? "Carregando modelos..." 
                      : modelos.length === 0
                        ? "Nenhum modelo disponível"
                        : "Selecione o modelo"
                } 
              />
              {marcaSelecionada && !loadingModelos && modeloSelecionado && <CheckCircle className="h-4 w-4 text-green-600 ml-2" />}
              {loadingModelos && <Loader2 className="h-4 w-4 animate-spin text-blue-600 ml-2" />}
              {!loadingModelos && !modeloSelecionado && marcaSelecionada && <ChevronDown className="h-4 w-4 opacity-50 ml-2" />}
            </SelectTrigger>
            <SelectContent className="bg-white text-[var(--foreground)] shadow-xl border-2 border-blue-200 max-h-[300px]">
              {!marcaSelecionada ? (
                <div className="flex flex-col items-center justify-center py-6 px-4">
                  <Search className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 text-center">Selecione uma marca primeiro</p>
                </div>
              ) : loadingModelos ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Carregando modelos...</span>
                </div>
              ) : modelos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 px-4">
                  <Package className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 text-center">Nenhum modelo encontrado</p>
                  <p className="text-xs text-gray-500 text-center mt-1">Tente selecionar outra marca</p>
                </div>
              ) : (
                modelos.map((modelo, index) => (
                  <SelectItem 
                    key={`modelo-${modelo.codigo || index}`} 
                    value={modelo.codigo}
                    className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 py-2.5"
                  >
                    {modelo.nome}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Ano */}
        <div className="space-y-2">
          <Label htmlFor="ano" className="text-sm font-semibold text-gray-800 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
            Ano
            {loadingAnos && <Loader2 className="h-3 w-3 ml-2 animate-spin text-blue-600" />}
            {!loadingAnos && anos.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-500">({anos.length} disponíveis)</span>
            )}
          </Label>
          <Select
            value={anoSelecionado}
            onValueChange={setAnoSelecionado}
            disabled={!modeloSelecionado || loadingAnos || anos.length === 0}
          >
            <SelectTrigger 
              id="ano"
              className={cn(
                "bg-white text-[var(--foreground)] border-2 h-11 text-base",
                !modeloSelecionado
                  ? "border-gray-200 bg-gray-50"
                  : loadingAnos
                    ? "border-blue-200 border-dashed"
                    : anoSelecionado
                      ? "border-green-400 hover:border-green-500"
                      : "border-blue-300 hover:border-blue-400",
                "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              )}
            >
              <SelectValue 
                placeholder={
                  !modeloSelecionado 
                    ? "Selecione o modelo primeiro" 
                    : loadingAnos 
                      ? "Carregando anos..." 
                      : anos.length === 0
                        ? "Nenhum ano disponível"
                        : "Selecione o ano"
                } 
              />
              {modeloSelecionado && !loadingAnos && anoSelecionado && <CheckCircle className="h-4 w-4 text-green-600 ml-2" />}
              {loadingAnos && <Loader2 className="h-4 w-4 animate-spin text-blue-600 ml-2" />}
              {!loadingAnos && !anoSelecionado && modeloSelecionado && <ChevronDown className="h-4 w-4 opacity-50 ml-2" />}
            </SelectTrigger>
            <SelectContent className="bg-white text-[var(--foreground)] shadow-xl border-2 border-blue-200 max-h-[300px]">
              {!modeloSelecionado ? (
                <div className="flex flex-col items-center justify-center py-6 px-4">
                  <Search className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 text-center">Selecione um modelo primeiro</p>
                </div>
              ) : loadingAnos ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Carregando anos...</span>
                </div>
              ) : anos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 px-4">
                  <Calendar className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 text-center">Nenhum ano encontrado</p>
                  <p className="text-xs text-gray-500 text-center mt-1">Tente selecionar outro modelo</p>
                </div>
              ) : (
                anos.map((ano, index) => (
                  <SelectItem 
                    key={`ano-${ano.codigo || index}`} 
                    value={ano.codigo}
                    className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 py-2.5"
                  >
                    {ano.nome}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Botão Consultar */}
        <Button
          onClick={handleConsultar}
          disabled={!podeConsultar}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loadingConsulta ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Consultando...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Consultar Valor FIPE
            </>
          )}
        </Button>

        {/* Resultado */}
        {valorFipe && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-800">Valor FIPE Consultado</h4>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-2xl font-bold text-green-700">
                {valorFipe.Valor || (valorFipe as any).price || 'Valor não disponível'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Marca:</span> {valorFipe.Marca || (valorFipe as any).brand || 'N/A'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Modelo:</span> {valorFipe.Modelo || (valorFipe as any).model || 'N/A'} 
                {(valorFipe.AnoModelo || (valorFipe as any).year) && ` (${valorFipe.AnoModelo || (valorFipe as any).year})`}
              </p>
              {(valorFipe.Combustivel || (valorFipe as any).fuel) && (
                <p className="text-gray-600">
                  <span className="font-medium">Combustível:</span> {valorFipe.Combustivel || (valorFipe as any).fuel}
                </p>
              )}
              {(valorFipe.CodigoFipe || (valorFipe as any).code) && (
                <p className="text-gray-600">
                  <span className="font-medium">Código FIPE:</span> {valorFipe.CodigoFipe || (valorFipe as any).code}
                </p>
              )}
              {(valorFipe.MesReferencia || (valorFipe as any).monthReference) && (
                <p className="text-gray-500 text-xs mt-2">
                  Referência: {valorFipe.MesReferencia || (valorFipe as any).monthReference}
                  {valorFipe.DataConsulta && ` | Consultado em: ${new Date(valorFipe.DataConsulta).toLocaleDateString('pt-BR')}`}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

