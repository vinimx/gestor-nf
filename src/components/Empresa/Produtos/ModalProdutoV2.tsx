"use client";

import { useState, useEffect } from "react";
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

interface ModalProdutoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto?: Produto;
  onSuccess: () => void;
  onSubmit: (data: ProdutoCreate | ProdutoUpdate) => Promise<void>;
}

export function ModalProdutoV2({
  open,
  onOpenChange,
  produto,
  onSuccess,
  onSubmit,
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

  const watchedValues = watch();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (produto) {
        // Preencher formulário com dados do produto
        reset({
          ...produto,
          tipo: produto.tipo || "PRODUTO",
          unidade: produto.unidade || "UN",
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
      watchedValues.preco_venda > 0
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
                  <Select value={watchedValues.tipo} onValueChange={(value) => setValue("tipo", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_PRODUTO.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="unidade">Unidade</Label>
                  <Select value={watchedValues.unidade} onValueChange={(value) => setValue("unidade", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIDADES_MEDIDA.map((unidade) => (
                        <SelectItem key={unidade.value} value={unidade.value}>
                          {unidade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  value={watchedValues.categoria_id || ""} 
                  onValueChange={(value) => setValue("categoria_id", value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasLoading ? (
                      <SelectItem value="" disabled>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Carregando...</span>
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
                  />

                  <SeletorCFOP
                    value={watchedValues.cfop_saida || ""}
                    onChange={handleCFOPSaidaChange}
                    tipo="SAIDA"
                    placeholder="CFOP de Saída..."
                  />

                  <SeletorCFOP
                    value={watchedValues.cfop_entrada || ""}
                    onChange={handleCFOPEntradaChange}
                    tipo="ENTRADA"
                    placeholder="CFOP de Entrada..."
                  />
                </div>

                {/* Seletores CST */}
                <div className="space-y-4">
                  <SeletorCST
                    value={watchedValues.icms_situacao_tributaria || ""}
                    onChange={handleCSTICMSChange}
                    tipo="ICMS"
                    placeholder="CST ICMS..."
                  />

                  <SeletorCST
                    value={watchedValues.ipi_situacao_tributaria || ""}
                    onChange={handleCSTIPIChange}
                    tipo="IPI"
                    placeholder="CST IPI..."
                  />

                  <SeletorCST
                    value={watchedValues.pis_situacao_tributaria || ""}
                    onChange={handleCSTPISChange}
                    tipo="PIS"
                    placeholder="CST PIS..."
                  />

                  <SeletorCST
                    value={watchedValues.cofins_situacao_tributaria || ""}
                    onChange={handleCSTCOFINSChange}
                    tipo="COFINS"
                    placeholder="CST COFINS..."
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
                produto={watchedValues}
                quantidade={1}
                valorUnitario={watchedValues.preco_venda}
                onCalculationChange={handleCalculationChange}
              />
            </TabsContent>

            {/* Aba Validação */}
            <TabsContent value="validacao">
              <ValidadorFiscal
                produto={watchedValues}
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
