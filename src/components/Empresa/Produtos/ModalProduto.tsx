"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { produtoSchema, produtoToFocusFormat } from "@/lib/validations/produtoSchema";
import { focusProdutoService } from "@/lib/services/focusProdutoService";
import { Produto, ProdutoCreate, ProdutoUpdate, TIPOS_PRODUTO, UNIDADES_MEDIDA } from "@/types/produto";
import { useCategoriasProdutos } from "@/hooks/useProdutos";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/useToast";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Package,
  Wrench,
  Search,
  Info
} from "lucide-react";

interface ModalProdutoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto?: Produto;
  onSuccess: () => void;
  onSubmit: (data: ProdutoCreate | ProdutoUpdate) => Promise<void>;
}

interface ValidationState {
  ncm: { valid: boolean; loading: boolean; message?: string; descricao?: string };
  cfopSaida: { valid: boolean; loading: boolean; message?: string; descricao?: string };
  cfopEntrada: { valid: boolean; loading: boolean; message?: string; descricao?: string };
  focus: { valid: boolean; loading: boolean; message?: string };
  descricao: { valid: boolean; loading: boolean; message?: string };
}

interface NCMResult {
  codigo: string;
  descricao: string;
  valid: boolean;
}

interface CFOPResult {
  codigo: string;
  descricao: string;
  valid: boolean;
  tipo: 'ENTRADA' | 'SAIDA';
}

interface CSTResult {
  codigo: string;
  descricao: string;
  tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS';
}

export function ModalProduto({
  open,
  onOpenChange,
  produto,
  onSuccess,
  onSubmit,
}: ModalProdutoProps) {
  const [loading, setLoading] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>({
    ncm: { valid: false, loading: false },
    cfopSaida: { valid: false, loading: false },
    cfopEntrada: { valid: false, loading: false },
    focus: { valid: false, loading: false },
    descricao: { valid: false, loading: false },
  });
  const [ncmResults, setNcmResults] = useState<NCMResult[]>([]);
  const [cfopResults, setCfopResults] = useState<CFOPResult[]>([]);
  const [cstResults, setCstResults] = useState<CSTResult[]>([]);
  const [showNcmResults, setShowNcmResults] = useState(false);
  const [showCfopSaidaResults, setShowCfopSaidaResults] = useState(false);
  const [showCfopEntradaResults, setShowCfopEntradaResults] = useState(false);
  const [showCstResults, setShowCstResults] = useState(false);
  const [currentCstType, setCurrentCstType] = useState<'ICMS' | 'IPI' | 'PIS' | 'COFINS' | null>(null);

  const { toast } = useToast();
  const { categorias, loading: categoriasLoading } = useCategoriasProdutos(produto?.empresa_id || "");

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

  const watchedNcm = watch("ncm");
  const watchedCfopSaida = watch("cfop_saida");
  const watchedCfopEntrada = watch("cfop_entrada");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (produto) {
        reset({
          ...produto,
          categoria_id: produto.categoria_id || undefined,
        });
      } else {
        reset({
          tipo: "PRODUTO",
          unidade: "UN",
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
    }
  }, [open, produto, reset]);

  // Buscar NCM conforme digita
  useEffect(() => {
    const searchNcm = async () => {
      if (!watchedNcm || watchedNcm.length < 4) {
        setNcmResults([]);
        setShowNcmResults(false);
        return;
      }

      try {
        setValidationState(prev => ({
          ...prev,
          ncm: { ...prev.ncm, loading: true }
        }));

        const result = await focusProdutoService.consultarNCM(watchedNcm);
        
        if (result.success && result.data) {
          setNcmResults([{
            codigo: watchedNcm,
            descricao: result.data.descricao,
            valid: true
          }]);
          setShowNcmResults(true);
          setValidationState(prev => ({
            ...prev,
            ncm: { valid: true, loading: false, message: "NCM válido", descricao: result.data?.descricao }
          }));
          clearErrors("ncm");
        } else {
          setNcmResults([]);
          setShowNcmResults(false);
          setValidationState(prev => ({
            ...prev,
            ncm: { valid: false, loading: false, message: "NCM não encontrado" }
          }));
          setError("ncm", { message: "NCM não encontrado" });
        }
      } catch (error) {
        console.error("Erro ao consultar NCM:", error);
        setNcmResults([]);
        setShowNcmResults(false);
        setValidationState(prev => ({
          ...prev,
          ncm: { valid: false, loading: false, message: "Erro ao consultar NCM" }
        }));
      }
    };

    const timeoutId = setTimeout(searchNcm, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedNcm, setError, clearErrors]);

  // Buscar CFOP Saída conforme digita
  useEffect(() => {
    const searchCfopSaida = async () => {
      if (!watchedCfopSaida || watchedCfopSaida.length < 4) {
        setCfopResults([]);
        setShowCfopSaidaResults(false);
        return;
      }

      try {
        setValidationState(prev => ({
          ...prev,
          cfopSaida: { ...prev.cfopSaida, loading: true }
        }));

        const result = await focusProdutoService.consultarCFOP(watchedCfopSaida);
        
        if (result.success && result.data) {
          setCfopResults([{
            codigo: watchedCfopSaida,
            descricao: result.data.descricao,
            valid: true,
            tipo: 'SAIDA'
          }]);
          setShowCfopSaidaResults(true);
          setValidationState(prev => ({
            ...prev,
            cfopSaida: { valid: true, loading: false, message: "CFOP válido", descricao: result.data?.descricao }
          }));
          clearErrors("cfop_saida");
        } else {
          setCfopResults([]);
          setShowCfopSaidaResults(false);
          setValidationState(prev => ({
            ...prev,
            cfopSaida: { valid: false, loading: false, message: "CFOP não encontrado" }
          }));
          setError("cfop_saida", { message: "CFOP não encontrado" });
        }
      } catch (error) {
        console.error("Erro ao consultar CFOP Saída:", error);
        setCfopResults([]);
        setShowCfopSaidaResults(false);
        setValidationState(prev => ({
          ...prev,
          cfopSaida: { valid: false, loading: false, message: "Erro ao consultar CFOP" }
        }));
      }
    };

    const timeoutId = setTimeout(searchCfopSaida, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedCfopSaida, setError, clearErrors]);

  // Buscar CFOP Entrada conforme digita
  useEffect(() => {
    const searchCfopEntrada = async () => {
      if (!watchedCfopEntrada || watchedCfopEntrada.length < 4) {
        setCfopResults([]);
        setShowCfopEntradaResults(false);
        return;
      }

      try {
        setValidationState(prev => ({
          ...prev,
          cfopEntrada: { ...prev.cfopEntrada, loading: true }
        }));

        const result = await focusProdutoService.consultarCFOP(watchedCfopEntrada);
        
        if (result.success && result.data) {
          setCfopResults([{
            codigo: watchedCfopEntrada,
            descricao: result.data.descricao,
            valid: true,
            tipo: 'ENTRADA'
          }]);
          setShowCfopEntradaResults(true);
          setValidationState(prev => ({
            ...prev,
            cfopEntrada: { valid: true, loading: false, message: "CFOP válido", descricao: result.data?.descricao }
          }));
          clearErrors("cfop_entrada");
        } else {
          setCfopResults([]);
          setShowCfopEntradaResults(false);
          setValidationState(prev => ({
            ...prev,
            cfopEntrada: { valid: false, loading: false, message: "CFOP não encontrado" }
          }));
          setError("cfop_entrada", { message: "CFOP não encontrado" });
        }
      } catch (error) {
        console.error("Erro ao consultar CFOP Entrada:", error);
        setCfopResults([]);
        setShowCfopEntradaResults(false);
        setValidationState(prev => ({
          ...prev,
          cfopEntrada: { valid: false, loading: false, message: "Erro ao consultar CFOP" }
        }));
      }
    };

    const timeoutId = setTimeout(searchCfopEntrada, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedCfopEntrada, setError, clearErrors]);

  // Função para buscar CSTs
  const buscarCSTs = async (tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS') => {
    try {
      setCurrentCstType(tipo);
      const result = await focusProdutoService.buscarCSTs(tipo);
      
      if (result.success && result.data) {
        setCstResults(result.data);
        setShowCstResults(true);
      } else {
        setCstResults([]);
        setShowCstResults(false);
        toast({
          title: "Erro ao buscar CSTs",
          description: result.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CSTs:", error);
      setCstResults([]);
      setShowCstResults(false);
      toast({
        title: "Erro ao buscar CSTs",
        description: "Erro de conexão",
        variant: "destructive",
      });
    }
  };

  // Função para selecionar CST
  const selecionarCST = (cst: CSTResult) => {
    const fieldName = `cst_${cst.tipo.toLowerCase()}` as keyof any;
    setValue(fieldName, cst.codigo);
    setShowCstResults(false);
    setCurrentCstType(null);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setLoading(true);

      // Validar com FOCUS NFE se todos os campos estão preenchidos
      if (data.ncm && data.cfop_saida && data.cfop_entrada) {
        const focusData = produtoToFocusFormat(data);
        const validation = await focusProdutoService.validarProduto(focusData);
        
        if (!validation.success) {
          toast({
            title: "Erro de validação",
            description: validation.error || "Erro ao validar produto com FOCUS NFE",
            variant: "destructive",
          });
          return;
        }
      }

      await onSubmit(data);
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast({
        title: "Erro ao salvar produto",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getValidationIcon = (state: { valid: boolean; loading: boolean }) => {
    if (state.loading) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (state.valid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getValidationMessage = (state: { valid: boolean; loading: boolean; message?: string; descricao?: string }) => {
    if (state.loading) return "Validando...";
    if (state.valid && state.descricao) return state.descricao;
    if (state.message) return state.message;
    return "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {produto ? (
              <>
                <Package className="h-5 w-5" />
                Editar Produto
              </>
            ) : (
              <>
                <Package className="h-5 w-5" />
                Novo Produto
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {produto 
              ? "Edite as informações do produto abaixo" 
              : "Preencha as informações do produto abaixo"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)] border-b border-[var(--cor-primaria)]/20 pb-2">
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={watch("tipo")}
                  onValueChange={(value) => setValue("tipo", value as "PRODUTO" | "SERVICO")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_PRODUTO.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        <div className="flex items-center gap-2">
                          {tipo.value === "PRODUTO" ? (
                            <Package className="h-4 w-4" />
                          ) : (
                            <Wrench className="h-4 w-4" />
                          )}
                          {tipo.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipo && (
                  <p className="text-sm text-red-500">{errors.tipo.message}</p>
                )}
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="categoria_id">Categoria</Label>
                <Select
                  value={watch("categoria_id") || "none"}
                  onValueChange={(value) => setValue("categoria_id", value === "none" ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem categoria</SelectItem>
                    {categoriasLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Carregando categorias...
                        </div>
                      </SelectItem>
                    ) : (
                      categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.categoria_id && (
                  <p className="text-sm text-red-500">{errors.categoria_id.message}</p>
                )}
              </div>

              {/* Código */}
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  {...register("codigo")}
                  placeholder="Ex: PROD001"
                />
                {errors.codigo && (
                  <p className="text-sm text-red-500">{errors.codigo.message}</p>
                )}
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  {...register("nome")}
                  placeholder="Nome do produto"
                />
                {errors.nome && (
                  <p className="text-sm text-red-500">{errors.nome.message}</p>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                {...register("descricao")}
                placeholder="Descrição detalhada do produto"
                rows={3}
              />
              {errors.descricao && (
                <p className="text-sm text-red-500">{errors.descricao.message}</p>
              )}
            </div>
          </div>

          {/* Informações Comerciais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)] border-b border-[var(--cor-primaria)]/20 pb-2">
              Informações Comerciais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Unidade */}
              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade de Medida *</Label>
                <Select
                  value={watch("unidade")}
                  onValueChange={(value) => setValue("unidade", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES_MEDIDA.map((unidade) => (
                      <SelectItem key={unidade.value} value={unidade.value}>
                        {unidade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unidade && (
                  <p className="text-sm text-red-500">{errors.unidade.message}</p>
                )}
              </div>

              {/* Preço de Venda */}
              <div className="space-y-2">
                <Label htmlFor="preco_venda">Preço de Venda *</Label>
                <Input
                  id="preco_venda"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("preco_venda", { valueAsNumber: true })}
                  placeholder="0,00"
                />
                {errors.preco_venda && (
                  <p className="text-sm text-red-500">{errors.preco_venda.message}</p>
                )}
              </div>

              {/* Custo */}
              <div className="space-y-2">
                <Label htmlFor="custo">Custo</Label>
                <Input
                  id="custo"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("custo", { valueAsNumber: true })}
                  placeholder="0,00"
                />
                {errors.custo && (
                  <p className="text-sm text-red-500">{errors.custo.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informações Fiscais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)] border-b border-[var(--cor-primaria)]/20 pb-2">
              Informações Fiscais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NCM */}
              <div className="space-y-2">
                <Label htmlFor="ncm">NCM *</Label>
                <div className="relative">
                  <Input
                    id="ncm"
                    {...register("ncm")}
                    placeholder="Ex: 12345678"
                    maxLength={8}
                    className="pr-10"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getValidationIcon(validationState.ncm)}
                  </div>
                </div>
                {validationState.ncm.message && (
                  <p className={`text-sm flex items-center gap-1 ${
                    validationState.ncm.valid ? 'text-green-600' : 'text-red-500'
                  }`}>
                    <Info className="h-3 w-3" />
                    {getValidationMessage(validationState.ncm)}
                  </p>
                )}
                {errors.ncm && (
                  <p className="text-sm text-red-500">{errors.ncm.message}</p>
                )}
              </div>

              {/* CFOP Saída */}
              <div className="space-y-2">
                <Label htmlFor="cfop_saida">CFOP Saída *</Label>
                <div className="relative">
                  <Input
                    id="cfop_saida"
                    {...register("cfop_saida")}
                    placeholder="Ex: 5102"
                    maxLength={4}
                    className="pr-10"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getValidationIcon(validationState.cfopSaida)}
                  </div>
                </div>
                {validationState.cfopSaida.message && (
                  <p className={`text-sm flex items-center gap-1 ${
                    validationState.cfopSaida.valid ? 'text-green-600' : 'text-red-500'
                  }`}>
                    <Info className="h-3 w-3" />
                    {getValidationMessage(validationState.cfopSaida)}
                  </p>
                )}
                {errors.cfop_saida && (
                  <p className="text-sm text-red-500">{errors.cfop_saida.message}</p>
                )}
              </div>

              {/* CFOP Entrada */}
              <div className="space-y-2">
                <Label htmlFor="cfop_entrada">CFOP Entrada *</Label>
                <div className="relative">
                  <Input
                    id="cfop_entrada"
                    {...register("cfop_entrada")}
                    placeholder="Ex: 1102"
                    maxLength={4}
                    className="pr-10"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getValidationIcon(validationState.cfopEntrada)}
                  </div>
                </div>
                {validationState.cfopEntrada.message && (
                  <p className={`text-sm flex items-center gap-1 ${
                    validationState.cfopEntrada.valid ? 'text-green-600' : 'text-red-500'
                  }`}>
                    <Info className="h-3 w-3" />
                    {getValidationMessage(validationState.cfopEntrada)}
                  </p>
                )}
                {errors.cfop_entrada && (
                  <p className="text-sm text-red-500">{errors.cfop_entrada.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Alíquotas de Impostos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)] border-b border-[var(--cor-primaria)]/20 pb-2">
              Alíquotas de Impostos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* ICMS */}
              <div className="space-y-2">
                <Label htmlFor="aliquota_icms">ICMS (%)</Label>
                <Input
                  id="aliquota_icms"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register("aliquota_icms", { valueAsNumber: true })}
                  placeholder="0,00"
                />
                {errors.aliquota_icms && (
                  <p className="text-sm text-red-500">{errors.aliquota_icms.message}</p>
                )}
              </div>

              {/* IPI */}
              <div className="space-y-2">
                <Label htmlFor="aliquota_ipi">IPI (%)</Label>
                <Input
                  id="aliquota_ipi"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register("aliquota_ipi", { valueAsNumber: true })}
                  placeholder="0,00"
                />
                {errors.aliquota_ipi && (
                  <p className="text-sm text-red-500">{errors.aliquota_ipi.message}</p>
                )}
              </div>

              {/* PIS */}
              <div className="space-y-2">
                <Label htmlFor="aliquota_pis">PIS (%)</Label>
                <Input
                  id="aliquota_pis"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register("aliquota_pis", { valueAsNumber: true })}
                  placeholder="0,00"
                />
                {errors.aliquota_pis && (
                  <p className="text-sm text-red-500">{errors.aliquota_pis.message}</p>
                )}
              </div>

              {/* COFINS */}
              <div className="space-y-2">
                <Label htmlFor="aliquota_cofins">COFINS (%)</Label>
                <Input
                  id="aliquota_cofins"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register("aliquota_cofins", { valueAsNumber: true })}
                  placeholder="0,00"
                />
                {errors.aliquota_cofins && (
                  <p className="text-sm text-red-500">{errors.aliquota_cofins.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* CSTs (Códigos de Situação Tributária) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)] border-b border-[var(--cor-primaria)]/20 pb-2">
              Códigos de Situação Tributária (CSTs)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CST ICMS */}
              <div className="space-y-2">
                <Label htmlFor="cst_icms">CST ICMS</Label>
                <div className="flex gap-2">
                  <Input
                    id="cst_icms"
                    {...register("cst_icms")}
                    placeholder="Ex: 00"
                    maxLength={2}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => buscarCSTs('ICMS')}
                    className="px-3"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {errors.cst_icms && (
                  <p className="text-sm text-red-500">{errors.cst_icms.message}</p>
                )}
              </div>

              {/* CST IPI */}
              <div className="space-y-2">
                <Label htmlFor="cst_ipi">CST IPI</Label>
                <div className="flex gap-2">
                  <Input
                    id="cst_ipi"
                    {...register("cst_ipi")}
                    placeholder="Ex: 00"
                    maxLength={2}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => buscarCSTs('IPI')}
                    className="px-3"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {errors.cst_ipi && (
                  <p className="text-sm text-red-500">{errors.cst_ipi.message}</p>
                )}
              </div>

              {/* CST PIS */}
              <div className="space-y-2">
                <Label htmlFor="cst_pis">CST PIS</Label>
                <div className="flex gap-2">
                  <Input
                    id="cst_pis"
                    {...register("cst_pis")}
                    placeholder="Ex: 01"
                    maxLength={2}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => buscarCSTs('PIS')}
                    className="px-3"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {errors.cst_pis && (
                  <p className="text-sm text-red-500">{errors.cst_pis.message}</p>
                )}
              </div>

              {/* CST COFINS */}
              <div className="space-y-2">
                <Label htmlFor="cst_cofins">CST COFINS</Label>
                <div className="flex gap-2">
                  <Input
                    id="cst_cofins"
                    {...register("cst_cofins")}
                    placeholder="Ex: 01"
                    maxLength={2}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => buscarCSTs('COFINS')}
                    className="px-3"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {errors.cst_cofins && (
                  <p className="text-sm text-red-500">{errors.cst_cofins.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)] border-b border-[var(--cor-primaria)]/20 pb-2">
              Status
            </h3>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ativo"
                {...register("ativo")}
                className="rounded border-gray-300"
              />
              <Label htmlFor="ativo">Produto ativo</Label>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-[var(--cor-primaria)]/20">
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
              disabled={loading}
              className="bg-gradient-to-r from-[var(--cor-primaria)] to-[var(--anexo-1-hover)] hover:from-[var(--anexo-1-hover)] hover:to-[var(--cor-primaria)] text-white border-0 shadow-[var(--sombra-destaque)]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </div>
              ) : (
                produto ? "Atualizar" : "Criar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Modal de Seleção de CSTs */}
      {showCstResults && (
        <Dialog open={showCstResults} onOpenChange={setShowCstResults}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Selecionar CST {currentCstType}
              </DialogTitle>
              <DialogDescription>
                Escolha o código de situação tributária para {currentCstType}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {cstResults.map((cst) => (
                <div
                  key={`${cst.tipo}-${cst.codigo}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => selecionarCST(cst)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-[var(--cor-primaria)]">
                        {cst.codigo}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {cst.tipo}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {cst.descricao}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      selecionarCST(cst);
                    }}
                  >
                    Selecionar
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCstResults(false);
                  setCurrentCstType(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}