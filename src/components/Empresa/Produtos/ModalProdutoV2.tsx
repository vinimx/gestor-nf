"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { produtoSchema } from "@/lib/validations/produtoSchema";
import { Produto, ProdutoCreate, ProdutoUpdate, TIPOS_PRODUTO, UNIDADES_MEDIDA } from "@/types/produto";
import { useCategoriasProdutos } from "@/hooks/useProdutos";
import { 
  SeletorNCM, 
  SeletorCFOP, 
  SeletorCST, 
  CalculadoraImpostos
} from "./Seletores";
import { FocusNCMData, FocusCFOPData, FocusCSTData } from "@/types/produto";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputValorMonetario } from "@/components/ui/input-valor-monetario";
import { InputAliquota } from "@/components/ui/input-aliquota";
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
  
  // Estados de cálculos
  const [calculos, setCalculos] = useState<any>(null);

  const { toast } = useToast();
  // Usar empresaId da prop (prioritário) ou do produto (se editando)
  const empresaIdParaCategorias = empresaId || produto?.empresa_id || "";
  const { categorias, loading: categoriasLoading } = useCategoriasProdutos(empresaIdParaCategorias);
  const valorFipeProcessadoRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    trigger,
  } = useForm({
    resolver: zodResolver(produtoSchema),
    mode: "onChange", // Validar em tempo real
    defaultValues: {
      tipo: "PRODUTO" as const,
      unidade: "UN" as const,
      quantidade: 0,
      ativo: true,
      aliquota_icms: 0,
      aliquota_ipi: 0,
      aliquota_pis: 0,
      aliquota_cofins: 0,
      aliquota_ibs_cbs: 0,
      observacoes: "",
      icms_situacao_tributaria: "00",
      icms_origem: "0",
      icms_modalidade_base_calculo: "0",
      icms_reducao_base_calculo: 0,
      ipi_codigo_enquadramento: "999",
      ipi_situacao_tributaria: "00",
      pis_situacao_tributaria: "01",
      cofins_situacao_tributaria: "01",
    },
  });

  const watchedValues = watch();

  // Estabilizar objeto produto para evitar re-renders infinitos na CalculadoraImpostos
  const produtoParaCalculo = useMemo(() => ({
    ...watchedValues,
    preco_venda: Number(watchedValues.preco_venda) || 0,
    custo: watchedValues.custo ? Number(watchedValues.custo) : undefined,
    aliquota_icms: Number(watchedValues.aliquota_icms) || 0,
    aliquota_ipi: watchedValues.aliquota_ipi ? Number(watchedValues.aliquota_ipi) : undefined,
    aliquota_pis: watchedValues.aliquota_pis ? Number(watchedValues.aliquota_pis) : undefined,
    aliquota_cofins: watchedValues.aliquota_cofins ? Number(watchedValues.aliquota_cofins) : undefined,
    aliquota_ibs_cbs: watchedValues.aliquota_ibs_cbs ? Number(watchedValues.aliquota_ibs_cbs) : undefined,
    icms_reducao_base_calculo: watchedValues.icms_reducao_base_calculo ? Number(watchedValues.icms_reducao_base_calculo) : undefined,
  }), [
    watchedValues.preco_venda,
    watchedValues.custo,
    watchedValues.aliquota_icms,
    watchedValues.aliquota_ipi,
    watchedValues.aliquota_pis,
    watchedValues.aliquota_cofins,
    watchedValues.aliquota_ibs_cbs,
    watchedValues.icms_reducao_base_calculo,
  ]);

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
          aliquota_ibs_cbs: produto.aliquota_ibs_cbs || 0,
          observacoes: produto.observacoes || "",
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
          aliquota_ibs_cbs: 0,
          observacoes: "",
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

  const handleCalculationChange = useCallback((calculos: any) => {
    setCalculos(calculos);
  }, []);

  const onSubmitForm = async (data: any) => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('[ModalProdutoV2] 🔄 Iniciando submit do formulário');
    console.log('═══════════════════════════════════════════════════════');
    console.log('[DEBUG] 1. Dados do formulário:', data);
    console.log('[DEBUG] 2. Erros de validação:', errors);
    console.log('[DEBUG] 3. isValid:', isValid);
    console.log('[DEBUG] 4. isDirty:', isDirty);
    
    try {
      setLoading(true);
      
      // Preparar dados para envio
      const produtoData = {
        ...data,
        empresa_id: produto?.empresa_id,
      };

      console.log('[DEBUG] 5. Dados preparados para envio:', produtoData);

      if (produto) {
        console.log('[DEBUG] 6. Modo: ATUALIZAÇÃO');
        await onSubmit({ ...produtoData, id: produto.id } as ProdutoUpdate);
      } else {
        console.log('[DEBUG] 6. Modo: CRIAÇÃO');
        await onSubmit(produtoData as ProdutoCreate);
      }

      console.log('[DEBUG] 7. ✅ Produto salvo com sucesso!');
      
      toast({
        title: "Sucesso",
        description: produto ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!",
        variant: "default",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('═══════════════════════════════════════════════════════');
      console.error("[DEBUG] ❌ Erro ao salvar produto:");
      console.error("[DEBUG] Error message:", error.message);
      console.error("[DEBUG] Error stack:", error.stack);
      console.error("[DEBUG] Error object:", error);
      console.error('═══════════════════════════════════════════════════════');
      
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar produto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função de validação que verifica campos obrigatórios
  const isFormValid = () => {
    const camposObrigatorios = {
      codigo: !!watchedValues.codigo,
      nome: !!watchedValues.nome,
      ncm: !!watchedValues.ncm && watchedValues.ncm.length === 8,
      cfop_saida: !!watchedValues.cfop_saida && watchedValues.cfop_saida.length === 4,
      cfop_entrada: !!watchedValues.cfop_entrada && watchedValues.cfop_entrada.length === 4,
      preco_venda: Number(watchedValues.preco_venda) > 0,
    };
    
    const todosPreenchidos = Object.values(camposObrigatorios).every(v => v === true);
    const semErros = Object.keys(errors).length === 0;
    
    console.log('[DEBUG isFormValid] Campos obrigatórios:', camposObrigatorios);
    console.log('[DEBUG isFormValid] Todos preenchidos:', todosPreenchidos);
    console.log('[DEBUG isFormValid] Sem erros:', semErros);
    console.log('[DEBUG isFormValid] Resultado final:', todosPreenchidos && semErros);
    
    return todosPreenchidos && semErros;
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

        {/* Status de Validação no Topo */}
        {!isFormValid() && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Preencha todos os campos obrigatórios para criar o produto
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {Object.keys(errors).length > 0 
                    ? `${Object.keys(errors).length} erro(s) de validação - verifique os campos abaixo`
                    : 'Alguns campos obrigatórios ainda não foram preenchidos'}
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basico" className="flex items-center justify-between">
              <span className="flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Básico
              </span>
              {(!watchedValues.codigo || !watchedValues.nome || !(Number(watchedValues.preco_venda) > 0)) && (
                <span className="ml-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" title="Campos obrigatórios pendentes"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="fiscal" className="flex items-center justify-between">
              <span className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Fiscal
              </span>
              {(!watchedValues.ncm || watchedValues.ncm.length !== 8 || 
                !watchedValues.cfop_saida || watchedValues.cfop_saida.length !== 4 ||
                !watchedValues.cfop_entrada || watchedValues.cfop_entrada.length !== 4) && (
                <span className="ml-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" title="Campos obrigatórios pendentes"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="calculos" className="flex items-center">
              <Calculator className="h-4 w-4 mr-2" />
              Cálculos
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
            {/* Aba Básico */}
            <TabsContent value="basico" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codigo" className="flex items-center">
                    Código <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="codigo"
                    {...register("codigo")}
                    placeholder="Ex: PROD001"
                    className={errors.codigo ? "border-red-500 border-2" : ""}
                  />
                  {errors.codigo && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.codigo.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nome" className="flex items-center">
                    Nome <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="nome"
                    {...register("nome")}
                    placeholder="Nome do produto"
                    className={errors.nome ? "border-red-500 border-2" : ""}
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.nome.message}
                    </p>
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
                  <Label htmlFor="preco_venda" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                    Preço de Venda <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <InputValorMonetario
                    id="preco_venda"
                    name="preco_venda"
                    value={watchedValues.preco_venda as number}
                    onChange={(valor) => setValue('preco_venda', valor || 0)}
                    placeholder="0,00"
                    required
                    prefixo="R$"
                    error={errors.preco_venda?.message}
                  />
                  {!errors.preco_venda && !(Number(watchedValues.preco_venda) > 0) && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Campo obrigatório - Valor deve ser maior que zero
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="custo" className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Custo <span className="text-xs text-gray-500">(opcional)</span>
                  </Label>
                  <InputValorMonetario
                    id="custo"
                    name="custo"
                    value={watchedValues.custo as number}
                    onChange={(valor) => setValue('custo', valor)}
                    placeholder="0,00"
                    prefixo="R$"
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
                  <div>
                    <Label className="flex items-center mb-2">
                      NCM <span className="text-red-500 ml-1">*</span>
                      <span className="text-xs text-gray-500 ml-2">(8 dígitos)</span>
                    </Label>
                    <SeletorNCM
                      value={watchedValues.ncm || ""}
                      onChange={handleNCMChange}
                      placeholder="Digite o código NCM..."
                      empresaId={empresaId || produto?.empresa_id}
                    />
                    {errors.ncm && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.ncm.message}
                      </p>
                    )}
                    {!errors.ncm && !watchedValues.ncm && (
                      <p className="text-xs text-orange-600 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Campo obrigatório - Digite 8 dígitos do NCM
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="flex items-center mb-2">
                      CFOP de Saída <span className="text-red-500 ml-1">*</span>
                      <span className="text-xs text-gray-500 ml-2">(4 dígitos)</span>
                    </Label>
                    <SeletorCFOP
                      value={watchedValues.cfop_saida || ""}
                      onChange={handleCFOPSaidaChange}
                      tipo="SAIDA"
                      placeholder="CFOP de Saída..."
                      empresaId={empresaId || produto?.empresa_id}
                    />
                    {errors.cfop_saida && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.cfop_saida.message}
                      </p>
                    )}
                    {!errors.cfop_saida && !watchedValues.cfop_saida && (
                      <p className="text-xs text-orange-600 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Campo obrigatório - Digite 4 dígitos do CFOP
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="flex items-center mb-2">
                      CFOP de Entrada <span className="text-red-500 ml-1">*</span>
                      <span className="text-xs text-gray-500 ml-2">(4 dígitos)</span>
                    </Label>
                    <SeletorCFOP
                      value={watchedValues.cfop_entrada || ""}
                      onChange={handleCFOPEntradaChange}
                      tipo="ENTRADA"
                      placeholder="CFOP de Entrada..."
                      empresaId={empresaId || produto?.empresa_id}
                    />
                    {errors.cfop_entrada && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.cfop_entrada.message}
                      </p>
                    )}
                    {!errors.cfop_entrada && !watchedValues.cfop_entrada && (
                      <p className="text-xs text-orange-600 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Campo obrigatório - Digite 4 dígitos do CFOP
                      </p>
                    )}
                  </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputAliquota
                  id="aliquota_icms"
                  name="aliquota_icms"
                  label="Alíquota ICMS (%)"
                  value={watchedValues.aliquota_icms as number}
                  onChange={(valor) => setValue('aliquota_icms', valor || 0)}
                  placeholder="0,00"
                  error={errors.aliquota_icms?.message}
                  casasDecimais={2}
                />

                <InputAliquota
                  id="aliquota_ipi"
                  name="aliquota_ipi"
                  label="Alíquota IPI (%) - opcional"
                  value={watchedValues.aliquota_ipi as number}
                  onChange={(valor) => setValue('aliquota_ipi', valor || 0)}
                  placeholder="0,00"
                  casasDecimais={2}
                />

                <InputAliquota
                  id="aliquota_pis"
                  name="aliquota_pis"
                  label="Alíquota PIS (%) - opcional"
                  value={watchedValues.aliquota_pis as number}
                  onChange={(valor) => setValue('aliquota_pis', valor || 0)}
                  placeholder="0,00"
                  casasDecimais={4}
                  helpText="Até 4 casas decimais para maior precisão"
                />

                <InputAliquota
                  id="aliquota_cofins"
                  name="aliquota_cofins"
                  label="Alíquota COFINS (%) - opcional"
                  value={watchedValues.aliquota_cofins as number}
                  onChange={(valor) => setValue('aliquota_cofins', valor || 0)}
                  placeholder="0,00"
                  casasDecimais={4}
                  helpText="Até 4 casas decimais para maior precisão"
                />

                <InputAliquota
                  id="aliquota_ibs_cbs"
                  name="aliquota_ibs_cbs"
                  label={
                    <span>
                      Alíquota IBS/CBS (%)
                      <span className="text-xs text-blue-600 ml-1 font-normal">(Reforma Tributária)</span>
                    </span>
                  }
                  value={watchedValues.aliquota_ibs_cbs as number}
                  onChange={(valor) => setValue('aliquota_ibs_cbs', valor)}
                  placeholder="0,00"
                  casasDecimais={2}
                  helpText="Opcional - Novo tributo da Reforma Tributária"
                />
              </div>

              {/* Campo de Observações */}
              <div className="mt-4">
                <Label htmlFor="observacoes">
                  Observações
                  <span className="text-xs text-gray-500 ml-1">(aparecerá na nota fiscal)</span>
                </Label>
                <Textarea
                  id="observacoes"
                  {...register("observacoes")}
                  placeholder="Digite observações que aparecerão automaticamente na nota fiscal..."
                  maxLength={500}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Máximo de 500 caracteres. {watchedValues.observacoes?.length || 0}/500
                </p>
              </div>
            </TabsContent>

            {/* Aba Cálculos */}
            <TabsContent value="calculos">
              <CalculadoraImpostos
                produto={produtoParaCalculo}
                quantidade={Number((watchedValues as any).quantidade || 1)}
                valorUnitario={Number(watchedValues.preco_venda)}
                onCalculationChange={handleCalculationChange}
              />
            </TabsContent>

            {/* Painel de Validação */}
            {!isFormValid() && (() => {
              // Log de debug quando painel aparece
              if (Object.keys(errors).length > 0) {
                console.error('═══════════════════════════════════════════════════════');
                console.error('[ModalProdutoV2] ⚠️ ERROS DE VALIDAÇÃO DETECTADOS:');
                console.error('═══════════════════════════════════════════════════════');
                Object.keys(errors).forEach(campo => {
                  console.error(`❌ ${campo}:`, (errors as any)[campo]?.message || 'Erro desconhecido');
                });
                console.error('═══════════════════════════════════════════════════════');
              }
              
              return (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">
                        Preencha os campos obrigatórios:
                      </h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {!watchedValues.codigo && <li>• Código do produto</li>}
                        {!watchedValues.nome && <li>• Nome do produto</li>}
                        {(!watchedValues.ncm || watchedValues.ncm.length !== 8) && <li>• NCM (8 dígitos)</li>}
                        {(!watchedValues.cfop_saida || watchedValues.cfop_saida.length !== 4) && <li>• CFOP de Saída (4 dígitos)</li>}
                        {(!watchedValues.cfop_entrada || watchedValues.cfop_entrada.length !== 4) && <li>• CFOP de Entrada (4 dígitos)</li>}
                        {!(Number(watchedValues.preco_venda) > 0) && <li>• Preço de Venda (maior que zero)</li>}
                        {Object.keys(errors).length > 0 && (
                          <li className="text-red-600 font-medium">
                            • Corrija os erros de validação (veja abaixo de cada campo com erro)
                          </li>
                        )}
                      </ul>
                      
                      {/* Mostrar erros específicos */}
                      {Object.keys(errors).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-yellow-300">
                          <p className="text-xs font-semibold text-red-700 mb-2">Erros encontrados:</p>
                          <ul className="text-xs text-red-600 space-y-1">
                            {Object.keys(errors).map(campo => (
                              <li key={campo}>
                                • <strong>{campo}</strong>: {(errors as any)[campo]?.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

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
                className={!isFormValid() ? "opacity-50 cursor-not-allowed" : ""}
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
