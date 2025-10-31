"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { produtoSchema } from "@/lib/validations/produtoSchema";
import { Produto, ProdutoCreate, ProdutoUpdate, TIPOS_PRODUTO, UNIDADES_MEDIDA } from "@/types/produto";
import { useCategoriasProdutos } from "@/hooks/useProdutos";
import { 
  SeletorNCM, 
  SeletorCFOP, 
  SeletorCST, 
  CalculadoraImpostos, 
  ValidadorFiscal 
} from "./Seletores";
import { FocusNCMData, FocusCFOPData, FocusCSTData } from "@/types/produto";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/useToast";
import { 
  Package,
  Calculator,
  Shield,
  Settings,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { ConsultaFIPE } from "./ConsultaFIPE";

interface ModalProdutoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto?: Produto;
  onSuccess: () => void;
  onSubmit: (data: ProdutoCreate | ProdutoUpdate) => Promise<void>;
  empresaId?: string;
  regimeTributario?: 'SIMPLES' | 'PRESUMIDO' | 'REAL';
}

export function ModalProdutoV2({
  open,
  onOpenChange,
  produto,
  onSuccess,
  onSubmit,
  empresaId,
  regimeTributario,
}: ModalProdutoProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basico");
  
  // Estados dos seletores fiscais
  const [ncmData, setNcmData] = useState<FocusNCMData | null>(null);
  const [cfopSaidaData, setCFOPSaidaData] = useState<FocusCFOPData | null>(null);
  const [cfopEntradaData, setCFOPEntradaData] = useState<FocusCFOPData | null>(null);
  const [cstICMSData, setCSTICMSData] = useState<FocusCSTData | null>(null);
  const [cstIPIData, setCSTIPIData] = useState<FocusCSTData | null>(null);
  const [cstPISData, setCSTPISData] = useState<FocusCSTData | null>(null);
  const [cstCOFINSData, setCSTCOFINSData] = useState<FocusCSTData | null>(null);
  
  // Estados de validação
  const [validationResult, setValidationResult] = useState<any>(null);
  const [calculos, setCalculos] = useState<any>(null);

  const { toast } = useToast();
  // Usar empresaId da prop (prioritário) ou do produto (se editando)
  const empresaIdParaCategorias = empresaId || produto?.empresa_id || "";
  const { categorias, loading: categoriasLoading } = useCategoriasProdutos(empresaIdParaCategorias);
  const valorFipeProcessadoRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      tipo: "PRODUTO" as const,
      unidade: "UN" as const,
      quantidade: 0,
      ativo: true,
      aliquota_icms: 0,
      aliquota_ipi: 0,
      aliquota_pis: 0,
      aliquota_cofins: 0,
      icms_situacao_tributaria: "00",
      icms_origem: "0",
      icms_modalidade_base_calculo: "0",
      icms_reducao_base_calculo: 0,
      ipi_situacao_tributaria: "00",
      pis_situacao_tributaria: "01",
      cofins_situacao_tributaria: "01",
    },
  });

  const watchedValues = watch();

  // Callback memoizado para evitar loops infinitos (depois de useForm para ter acesso a setValue)
  const handleValorFipeConsultado = useCallback((valor: string, dados: any) => {
    // Evitar processar o mesmo valor múltiplas vezes
    const valorId = `${valor}-${dados?.Marca || dados?.brand || ''}-${dados?.Modelo || dados?.model || ''}`;
    if (valorFipeProcessadoRef.current === valorId) {
      return; // Já foi processado
    }
    valorFipeProcessadoRef.current = valorId;
    
    // Validar se valor existe e é string
    if (!valor || typeof valor !== 'string') {
      console.error('[ModalProdutoV2] Valor FIPE inválido:', valor);
      toast({
        title: "Erro ao aplicar valor FIPE",
        description: "Valor não disponível ou em formato inválido",
        variant: "destructive",
      });
      return;
    }

    try {
      // Extrair apenas o número do valor (remover "R$ " e pontos)
      const valorLimpo = valor
        .replace('R$', '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
        .trim();
      
      const valorNumerico = parseFloat(valorLimpo);
      
      if (!isNaN(valorNumerico) && valorNumerico > 0) {
        setValue('preco_venda', valorNumerico);
        
        // Extrair informações do veículo (com fallback para diferentes estruturas)
        const marca = dados?.Marca || dados?.brand || dados?.marca || 'Veículo';
        const modelo = dados?.Modelo || dados?.model || dados?.modelo || '';
        const anoModelo = dados?.AnoModelo || dados?.year || dados?.anoModelo || dados?.Ano || '';
        
        if (marca && modelo && anoModelo) {
          setValue('nome', `${marca} ${modelo} ${anoModelo}`);
        } else if (marca && modelo) {
          setValue('nome', `${marca} ${modelo}`);
        }
        
        toast({
          title: "Valor FIPE aplicado",
          description: `Valor FIPE de ${valor} foi aplicado ao preço de venda`,
        });
      } else {
        console.error('[ModalProdutoV2] Valor numérico inválido:', valorLimpo);
        toast({
          title: "Erro ao aplicar valor FIPE",
          description: "Não foi possível converter o valor para número",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('[ModalProdutoV2] Erro ao processar valor FIPE:', error);
      toast({
        title: "Erro ao aplicar valor FIPE",
        description: "Erro ao processar o valor retornado",
        variant: "destructive",
      });
    }
  }, [setValue, toast]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (produto) {
        // Preencher formulário com dados do produto
        reset({
          ...produto,
          tipo: produto.tipo || "PRODUTO",
          unidade: produto.unidade || "UN",
          quantidade: (produto as any).quantidade ?? 0,
          ativo: produto.ativo ?? true,
          aliquota_icms: produto.aliquota_icms || 0,
          aliquota_ipi: produto.aliquota_ipi || 0,
          aliquota_pis: produto.aliquota_pis || 0,
          aliquota_cofins: produto.aliquota_cofins || 0,
          icms_situacao_tributaria: produto.icms_situacao_tributaria || "00",
          icms_origem: produto.icms_origem || "0",
          icms_modalidade_base_calculo: produto.icms_modalidade_base_calculo || "0",
          icms_reducao_base_calculo: produto.icms_reducao_base_calculo || 0,
          ipi_situacao_tributaria: produto.ipi_situacao_tributaria || "00",
          pis_situacao_tributaria: produto.pis_situacao_tributaria || "01",
          cofins_situacao_tributaria: produto.cofins_situacao_tributaria || "01",
        });
      } else {
        // Reset para novo produto
        reset({
          tipo: "PRODUTO",
          unidade: "UN",
          quantidade: 0,
          ativo: true,
          aliquota_icms: 0,
          aliquota_ipi: 0,
          aliquota_pis: 0,
          aliquota_cofins: 0,
          icms_situacao_tributaria: "00",
          icms_origem: "0",
          icms_modalidade_base_calculo: "0",
          icms_reducao_base_calculo: 0,
          ipi_situacao_tributaria: "00",
          pis_situacao_tributaria: "01",
          cofins_situacao_tributaria: "01",
        });
      }
    } else {
      // Limpar estados quando modal fecha
      setNcmData(null);
      setCFOPSaidaData(null);
      setCFOPEntradaData(null);
      setCSTICMSData(null);
      setCSTIPIData(null);
      setCSTPISData(null);
      setCSTCOFINSData(null);
      setValidationResult(null);
      setCalculos(null);
      setActiveTab("basico");
    }
  }, [open, produto, reset]);

  // Handlers dos seletores fiscais
  const handleNCMChange = (ncm: FocusNCMData) => {
    setNcmData(ncm);
    setValue("ncm", ncm.codigo);
    clearErrors("ncm");
  };

  const handleCFOPSaidaChange = (cfop: FocusCFOPData) => {
    setCFOPSaidaData(cfop);
    setValue("cfop_saida", cfop.codigo);
    clearErrors("cfop_saida");
  };

  const handleCFOPEntradaChange = (cfop: FocusCFOPData) => {
    setCFOPEntradaData(cfop);
    setValue("cfop_entrada", cfop.codigo);
    clearErrors("cfop_entrada");
  };

  const handleCSTICMSChange = (cst: FocusCSTData) => {
    setCSTICMSData(cst);
    setValue("icms_situacao_tributaria", cst.codigo);
    clearErrors("icms_situacao_tributaria");
  };

  const handleCSTIPIChange = (cst: FocusCSTData) => {
    setCSTIPIData(cst);
    setValue("ipi_situacao_tributaria", cst.codigo);
    clearErrors("ipi_situacao_tributaria");
  };

  const handleCSTPISChange = (cst: FocusCSTData) => {
    setCSTPISData(cst);
    setValue("pis_situacao_tributaria", cst.codigo);
    clearErrors("pis_situacao_tributaria");
  };

  const handleCSTCOFINSChange = (cst: FocusCSTData) => {
    setCSTCOFINSData(cst);
    setValue("cofins_situacao_tributaria", cst.codigo);
    clearErrors("cofins_situacao_tributaria");
  };

  const handleValidationChange = (result: any) => {
    setValidationResult(result);
  };

  const handleCalculationChange = (calculos: any) => {
    setCalculos(calculos);
  };

  const onSubmitForm = async (data: any) => {
    try {
      setLoading(true);
      
      // Preparar dados para envio
      const produtoData = {
        ...data,
        empresa_id: produto?.empresa_id,
        ncm_validado: !!ncmData,
        cfop_validado: !!(cfopSaidaData && cfopEntradaData),
        cst_validado: !!(cstICMSData && cstIPIData && cstPISData && cstCOFINSData),
        ultima_validacao: new Date().toISOString(),
      };

      if (produto) {
        await onSubmit({ ...produtoData, id: produto.id } as ProdutoUpdate);
      } else {
        await onSubmit(produtoData as ProdutoCreate);
      }

      toast({
        title: "Sucesso",
        description: produto ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!",
        variant: "default",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar produto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      watchedValues.codigo &&
      watchedValues.nome &&
      watchedValues.ncm &&
      watchedValues.cfop_saida &&
      watchedValues.cfop_entrada &&
      Number(watchedValues.preco_venda) > 0
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            {produto ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
          <DialogDescription>
            {produto 
              ? "Edite as informações do produto e configure os dados fiscais"
              : "Preencha as informações do produto e configure os dados fiscais"
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basico" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Básico
            </TabsTrigger>
            <TabsTrigger value="fiscal" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Fiscal
            </TabsTrigger>
            <TabsTrigger value="calculos" className="flex items-center">
              <Calculator className="h-4 w-4 mr-2" />
              Cálculos
            </TabsTrigger>
            <TabsTrigger value="validacao" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Validação
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
            {/* Aba Básico */}
            <TabsContent value="basico" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    {...register("codigo")}
                    placeholder="Ex: PROD001"
                  />
                  {errors.codigo && (
                    <p className="text-sm text-red-600 mt-1">{errors.codigo.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    {...register("nome")}
                    placeholder="Nome do produto"
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-600 mt-1">{errors.nome.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={watchedValues.tipo} onValueChange={(value: "PRODUTO" | "SERVICO") => setValue("tipo", value)}>
                    <SelectTrigger className="bg-white text-[var(--foreground)] border border-[var(--cor-primaria)]/30 hover:border-[var(--cor-primaria)]/50 focus:ring-2 focus:ring-[var(--cor-primaria)]/30">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-[var(--foreground)] shadow-lg border border-gray-200">
                      <SelectItem value="PRODUTO">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span>Produto</span>
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Estoque
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SERVICO">
                        <div className="flex items-center space-x-2">
                          <Settings className="h-4 w-4 text-purple-600" />
                          <span>Serviço</span>
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Sem estoque
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-2">
                    {watchedValues.tipo === 'PRODUTO' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        <Package className="h-3 w-3 mr-1" /> Produto
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                        <Settings className="h-3 w-3 mr-1" /> Serviço
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="unidade">Unidade</Label>
                  <Select value={watchedValues.unidade} onValueChange={(value: "UN" | "KG" | "L" | "M" | "M2" | "M3" | "PC" | "CX" | "DZ") => setValue("unidade", value)}>
                    <SelectTrigger className="bg-white text-[var(--foreground)] border border-[var(--cor-primaria)]/30 hover:border-[var(--cor-primaria)]/50 focus:ring-2 focus:ring-[var(--cor-primaria)]/30">
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-[var(--foreground)] shadow-lg border border-gray-200">
                      {UNIDADES_MEDIDA.map((unidade) => (
                        <SelectItem key={unidade.value} value={unidade.value}>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {unidade.value}
                            </span>
                            <span className="truncate">{unidade.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-700">
                      {UNIDADES_MEDIDA.find(u => u.value === watchedValues.unidade)?.value}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {UNIDADES_MEDIDA.find(u => u.value === watchedValues.unidade)?.label}
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="preco_venda">Preço de Venda *</Label>
                  <Input
                    id="preco_venda"
                    type="number"
                    step="0.01"
                    {...register("preco_venda", { valueAsNumber: true })}
                    placeholder="0,00"
                  />
                  {errors.preco_venda && (
                    <p className="text-sm text-red-600 mt-1">{errors.preco_venda.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="custo">Custo</Label>
                  <Input
                    id="custo"
                    type="number"
                    step="0.01"
                    {...register("custo", { valueAsNumber: true })}
                    placeholder="0,00"
                  />
                </div>

              <div>
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  step="0.0001"
                  {...register("quantidade", { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors as any && (errors as any).quantidade && (
                  <p className="text-sm text-red-600 mt-1">{(errors as any).quantidade.message as string}</p>
                )}
              </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  {...register("descricao")}
                  placeholder="Descrição do produto"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="categoria_id">Categoria</Label>
                <Select 
                  value={watchedValues.categoria_id ?? undefined} 
                  onValueChange={(value) => setValue("categoria_id", value || undefined)}
                >
                  <SelectTrigger className="bg-white text-[var(--foreground)] border border-[var(--cor-primaria)]/30 hover:border-[var(--cor-primaria)]/50 focus:ring-2 focus:ring-[var(--cor-primaria)]/30">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-[var(--foreground)] shadow-lg border border-gray-200">
                    {categoriasLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center">
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Carregando categorias...</span>
                        </div>
                      </SelectItem>
                    ) : categorias.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-gray-500">
                        <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>Nenhuma categoria cadastrada</p>
                        <p className="text-xs mt-1">Crie uma categoria na página de produtos</p>
                      </div>
                    ) : (
                      categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <span className="truncate">{categoria.nome}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {watchedValues.categoria_id && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      <Package className="h-3 w-3 mr-1" />
                      {categorias.find(c => c.id === watchedValues.categoria_id)?.nome || 'Categoria selecionada'}
                    </span>
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">Use categorias para aplicar padrões fiscais e facilitar o cadastro.</p>

                {/* Consulta FIPE para Veículo Usado */}
                {watchedValues.categoria_id && categorias.find(c => c.id === watchedValues.categoria_id)?.nome === 'Veículo Usado' && (
                  <div className="mt-4">
                    <ConsultaFIPE
                      onValorConsultado={handleValorFipeConsultado}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Aba Fiscal */}
            <TabsContent value="fiscal" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Seletores Fiscais */}
                <div className="space-y-4">
                  <SeletorNCM
                    value={watchedValues.ncm || ""}
                    onChange={handleNCMChange}
                    placeholder="Digite o código NCM..."
                  empresaId={empresaId || produto?.empresa_id}
                  />

                  <SeletorCFOP
                    value={watchedValues.cfop_saida || ""}
                    onChange={handleCFOPSaidaChange}
                    tipo="SAIDA"
                    placeholder="CFOP de Saída..."
                  empresaId={empresaId || produto?.empresa_id}
                  />

                  <SeletorCFOP
                    value={watchedValues.cfop_entrada || ""}
                    onChange={handleCFOPEntradaChange}
                    tipo="ENTRADA"
                    placeholder="CFOP de Entrada..."
                  empresaId={empresaId || produto?.empresa_id}
                  />
                </div>

                {/* Seletores CST */}
                <div className="space-y-4">
                  <SeletorCST
                    value={watchedValues.icms_situacao_tributaria || ""}
                    onChange={handleCSTICMSChange}
                    tipo="ICMS"
                    placeholder="CST ICMS..."
                  regime={regimeTributario}
                  empresaId={empresaId || produto?.empresa_id}
                  />

                  <SeletorCST
                    value={watchedValues.ipi_situacao_tributaria || ""}
                    onChange={handleCSTIPIChange}
                    tipo="IPI"
                    placeholder="CST IPI..."
                  empresaId={empresaId || produto?.empresa_id}
                  />

                  <SeletorCST
                    value={watchedValues.pis_situacao_tributaria || ""}
                    onChange={handleCSTPISChange}
                    tipo="PIS"
                    placeholder="CST PIS..."
                  empresaId={empresaId || produto?.empresa_id}
                  />

                  <SeletorCST
                    value={watchedValues.cofins_situacao_tributaria || ""}
                    onChange={handleCSTCOFINSChange}
                    tipo="COFINS"
                    placeholder="CST COFINS..."
                  empresaId={empresaId || produto?.empresa_id}
                  />
                </div>
              </div>

              {/* Configurações de Alíquotas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="aliquota_icms">Alíquota ICMS (%)</Label>
                  <Input
                    id="aliquota_icms"
                    type="number"
                    step="0.01"
                    {...register("aliquota_icms", { valueAsNumber: true })}
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <Label htmlFor="aliquota_ipi">Alíquota IPI (%)</Label>
                  <Input
                    id="aliquota_ipi"
                    type="number"
                    step="0.01"
                    {...register("aliquota_ipi", { valueAsNumber: true })}
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <Label htmlFor="aliquota_pis">Alíquota PIS (%)</Label>
                  <Input
                    id="aliquota_pis"
                    type="number"
                    step="0.01"
                    {...register("aliquota_pis", { valueAsNumber: true })}
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <Label htmlFor="aliquota_cofins">Alíquota COFINS (%)</Label>
                  <Input
                    id="aliquota_cofins"
                    type="number"
                    step="0.01"
                    {...register("aliquota_cofins", { valueAsNumber: true })}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Aba Cálculos */}
            <TabsContent value="calculos">
              <CalculadoraImpostos
                produto={{
                  ...watchedValues,
                  preco_venda: Number(watchedValues.preco_venda),
                  custo: watchedValues.custo ? Number(watchedValues.custo) : undefined,
                  aliquota_icms: Number(watchedValues.aliquota_icms),
                  aliquota_ipi: watchedValues.aliquota_ipi ? Number(watchedValues.aliquota_ipi) : undefined,
                  aliquota_pis: watchedValues.aliquota_pis ? Number(watchedValues.aliquota_pis) : undefined,
                  aliquota_cofins: watchedValues.aliquota_cofins ? Number(watchedValues.aliquota_cofins) : undefined,
                  icms_reducao_base_calculo: watchedValues.icms_reducao_base_calculo ? Number(watchedValues.icms_reducao_base_calculo) : undefined,
                }}
                quantidade={Number((watchedValues as any).quantidade || 1)}
                valorUnitario={Number(watchedValues.preco_venda)}
                onCalculationChange={handleCalculationChange}
              />
            </TabsContent>

            {/* Aba Validação */}
            <TabsContent value="validacao">
              <ValidadorFiscal
                produto={{
                  ...watchedValues,
                  preco_venda: Number(watchedValues.preco_venda),
                  custo: watchedValues.custo ? Number(watchedValues.custo) : undefined,
                  aliquota_icms: Number(watchedValues.aliquota_icms),
                  aliquota_ipi: watchedValues.aliquota_ipi ? Number(watchedValues.aliquota_ipi) : undefined,
                  aliquota_pis: watchedValues.aliquota_pis ? Number(watchedValues.aliquota_pis) : undefined,
                  aliquota_cofins: watchedValues.aliquota_cofins ? Number(watchedValues.aliquota_cofins) : undefined,
                  icms_reducao_base_calculo: watchedValues.icms_reducao_base_calculo ? Number(watchedValues.icms_reducao_base_calculo) : undefined,
                }}
                onValidationChange={handleValidationChange}
              />
            </TabsContent>

            {/* Botões de ação */}
            <div className="flex justify-end space-x-2 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !isFormValid()}
              >
                {loading && <LoadingSpinner size="sm" className="mr-2" />}
                {produto ? "Atualizar" : "Criar"} Produto
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
