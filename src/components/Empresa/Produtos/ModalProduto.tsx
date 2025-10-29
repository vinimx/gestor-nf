"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { produtoSchema, produtoToFocusFormat } from "@/lib/validations/produtoSchema";
import { focusProdutoService } from "@/lib/services/focusProdutoService";
import { SeletorNCM } from "@/components/Produtos/Seletores/SeletorNCM";
import { SeletorCFOP } from "@/components/Produtos/Seletores/SeletorCFOP";
import { SeletorCST } from "@/components/Produtos/Seletores/SeletorCST";
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
                <SeletorNCM
                  value={watch("ncm")}
                  onChange={(ncmData) => {
                    if (ncmData) {
                      setValue("ncm", ncmData.codigo);
                      setValidationState(prev => ({
                        ...prev,
                        ncm: { valid: true, loading: false, message: "NCM válido", descricao: ncmData.descricao_completa }
                      }));
                      clearErrors("ncm");
                    } else {
                      setValue("ncm", "");
                      setValidationState(prev => ({
                        ...prev,
                        ncm: { valid: false, loading: false, message: "NCM não selecionado" }
                      }));
                    }
                  }}
                  placeholder="Digite o NCM ou descrição..."
                  className="w-full"
                />
                {errors.ncm && (
                  <p className="text-sm text-red-500">{errors.ncm.message}</p>
                )}
              </div>

              {/* CFOP Saída */}
              <div className="space-y-2">
                <SeletorCFOP
                  value={watch("cfop_saida")}
                  onChange={(cfopData) => {
                    if (cfopData) {
                      setValue("cfop_saida", cfopData.codigo);
                      setValidationState(prev => ({
                        ...prev,
                        cfopSaida: { valid: true, loading: false, message: "CFOP válido", descricao: cfopData.descricao }
                      }));
                      clearErrors("cfop_saida");
                    } else {
                      setValue("cfop_saida", "");
                      setValidationState(prev => ({
                        ...prev,
                        cfopSaida: { valid: false, loading: false, message: "CFOP não selecionado" }
                      }));
                    }
                  }}
                  placeholder="Digite o CFOP de saída..."
                  tipo="SAIDA"
                  showTipoFilter={false}
                  className="w-full"
                />
                {errors.cfop_saida && (
                  <p className="text-sm text-red-500">{errors.cfop_saida.message}</p>
                )}
              </div>

              {/* CFOP Entrada */}
              <div className="space-y-2">
                <SeletorCFOP
                  value={watch("cfop_entrada")}
                  onChange={(cfopData) => {
                    if (cfopData) {
                      setValue("cfop_entrada", cfopData.codigo);
                      setValidationState(prev => ({
                        ...prev,
                        cfopEntrada: { valid: true, loading: false, message: "CFOP válido", descricao: cfopData.descricao }
                      }));
                      clearErrors("cfop_entrada");
                    } else {
                      setValue("cfop_entrada", "");
                      setValidationState(prev => ({
                        ...prev,
                        cfopEntrada: { valid: false, loading: false, message: "CFOP não selecionado" }
                      }));
                    }
                  }}
                  placeholder="Digite o CFOP de entrada..."
                  tipo="ENTRADA"
                  showTipoFilter={false}
                  className="w-full"
                />
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
                <SeletorCST
                  value={watch("cst_icms")}
                  onChange={(cstData) => {
                    if (cstData) {
                      setValue("cst_icms", cstData.codigo);
                    } else {
                      setValue("cst_icms", "");
                    }
                  }}
                  tipo="ICMS"
                  className="w-full"
                />
                {errors.cst_icms && (
                  <p className="text-sm text-red-500">{errors.cst_icms.message}</p>
                )}
              </div>

              {/* CST IPI */}
              <div className="space-y-2">
                <SeletorCST
                  value={watch("cst_ipi")}
                  onChange={(cstData) => {
                    if (cstData) {
                      setValue("cst_ipi", cstData.codigo);
                    } else {
                      setValue("cst_ipi", "");
                    }
                  }}
                  tipo="IPI"
                  className="w-full"
                />
                {errors.cst_ipi && (
                  <p className="text-sm text-red-500">{errors.cst_ipi.message}</p>
                )}
              </div>

              {/* CST PIS */}
              <div className="space-y-2">
                <SeletorCST
                  value={watch("cst_pis")}
                  onChange={(cstData) => {
                    if (cstData) {
                      setValue("cst_pis", cstData.codigo);
                    } else {
                      setValue("cst_pis", "");
                    }
                  }}
                  tipo="PIS"
                  className="w-full"
                />
                {errors.cst_pis && (
                  <p className="text-sm text-red-500">{errors.cst_pis.message}</p>
                )}
              </div>

              {/* CST COFINS */}
              <div className="space-y-2">
                <SeletorCST
                  value={watch("cst_cofins")}
                  onChange={(cstData) => {
                    if (cstData) {
                      setValue("cst_cofins", cstData.codigo);
                    } else {
                      setValue("cst_cofins", "");
                    }
                  }}
                  tipo="COFINS"
                  className="w-full"
                />
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

    </Dialog>
  );
}