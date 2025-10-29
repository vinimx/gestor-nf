"use client";

import { useState, useEffect } from "react";
import { useFocusNFE } from "@/hooks/useFocusNFE";
import { Produto } from "@/types/produto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  RefreshCw,
  Shield,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  compatibility: {
    ncm_cfop: boolean;
    cfop_cst: boolean;
    cst_ncm: boolean;
  };
}

interface ValidadorFiscalProps {
  produto: Partial<Produto>;
  onValidationChange?: (result: ValidationResult) => void;
  className?: string;
}

export function ValidadorFiscal({
  produto,
  onValidationChange,
  className,
}: ValidadorFiscalProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);
  
  const { 
    validarProduto, 
    loadingValidation, 
    errorValidation 
  } = useFocusNFE();

  // Validar automaticamente quando produto muda
  useEffect(() => {
    if (produto && hasRequiredFields(produto)) {
      validateProduct();
    } else {
      setValidationResult(null);
    }
  }, [produto]);

  // Notificar mudanças na validação
  useEffect(() => {
    if (validationResult && onValidationChange) {
      onValidationChange(validationResult);
    }
  }, [validationResult, onValidationChange]);

  const hasRequiredFields = (produto: Partial<Produto>): boolean => {
    return !!(
      produto.ncm &&
      produto.cfop_saida &&
      produto.cfop_entrada &&
      produto.icms_situacao_tributaria &&
      produto.icms_origem &&
      produto.icms_modalidade_base_calculo
    );
  };

  const validateProduct = async () => {
    if (!hasRequiredFields(produto)) {
      setValidationResult({
        valid: false,
        errors: ["Campos obrigatórios não preenchidos"],
        warnings: [],
        suggestions: ["Preencha todos os campos fiscais obrigatórios"],
        compatibility: {
          ncm_cfop: false,
          cfop_cst: false,
          cst_ncm: false,
        },
      });
      return;
    }

    try {
      setIsValidating(true);
      
      // Converter produto para formato FOCUS NFE
      const focusProduto = {
        codigo_produto: produto.codigo || "",
        descricao: produto.nome || "",
        unidade_comercial: produto.unidade || "UN",
        unidade_tributavel: produto.unidade || "UN",
        valor_bruto: produto.preco_venda || 0,
        codigo_ncm: produto.ncm || "",
        cfop: produto.cfop_saida || "",
        inclui_no_total: 1,
        icms_situacao_tributaria: produto.icms_situacao_tributaria || "",
        icms_aliquota: produto.aliquota_icms || 0,
        icms_origem: produto.icms_origem || "",
        icms_modalidade_base_calculo: produto.icms_modalidade_base_calculo || "",
        icms_reducao_base_calculo: produto.icms_reducao_base_calculo || 0,
        ipi_codigo_enquadramento: produto.ipi_codigo_enquadramento || "",
        ipi_situacao_tributaria: produto.ipi_situacao_tributaria || "",
        ipi_aliquota: produto.aliquota_ipi || 0,
        pis_situacao_tributaria: produto.pis_situacao_tributaria || "",
        pis_aliquota_porcentual: produto.aliquota_pis || 0,
        cofins_situacao_tributaria: produto.cofins_situacao_tributaria || "",
        cofins_aliquota_porcentual: produto.aliquota_cofins || 0,
      };

      const result = await validarProduto(focusProduto);
      
      if (result.success) {
        const validation: ValidationResult = {
          valid: result.data?.valid || false,
          errors: result.data?.errors || [],
          warnings: result.data?.warnings || [],
          suggestions: generateSuggestions(produto),
          compatibility: {
            ncm_cfop: validateNCMCFOPCompatibility(produto),
            cfop_cst: validateCFOPCSTCompatibility(produto),
            cst_ncm: validateCSTNCMCompatibility(produto),
          },
        };
        
        setValidationResult(validation);
        setLastValidation(new Date());
      } else {
        setValidationResult({
          valid: false,
          errors: [result.error || "Erro na validação"],
          warnings: [],
          suggestions: ["Verifique os dados do produto"],
          compatibility: {
            ncm_cfop: false,
            cfop_cst: false,
            cst_ncm: false,
          },
        });
      }
    } catch (error: any) {
      console.error("Erro ao validar produto:", error);
      setValidationResult({
        valid: false,
        errors: [error.message || "Erro na validação"],
        warnings: [],
        suggestions: ["Tente novamente ou verifique os dados"],
        compatibility: {
          ncm_cfop: false,
          cfop_cst: false,
          cst_ncm: false,
        },
      });
    } finally {
      setIsValidating(false);
    }
  };

  const generateSuggestions = (produto: Partial<Produto>): string[] => {
    const suggestions: string[] = [];
    
    if (!produto.ncm || produto.ncm.length !== 8) {
      suggestions.push("Verifique se o NCM tem 8 dígitos");
    }
    
    if (!produto.cfop_saida || produto.cfop_saida.length !== 4) {
      suggestions.push("Verifique se o CFOP de saída tem 4 dígitos");
    }
    
    if (!produto.cfop_entrada || produto.cfop_entrada.length !== 4) {
      suggestions.push("Verifique se o CFOP de entrada tem 4 dígitos");
    }
    
    if (produto.aliquota_icms && produto.aliquota_icms > 25) {
      suggestions.push("Alíquota ICMS muito alta, verifique se está correta");
    }
    
    if (produto.aliquota_ipi && produto.aliquota_ipi > 50) {
      suggestions.push("Alíquota IPI muito alta, verifique se está correta");
    }
    
    return suggestions;
  };

  const validateNCMCFOPCompatibility = (produto: Partial<Produto>): boolean => {
    // Lógica básica de compatibilidade NCM + CFOP
    if (!produto.ncm || !produto.cfop_saida) return false;
    
    // CFOPs de saída (5xxx) são compatíveis com NCMs
    return produto.cfop_saida.startsWith('5');
  };

  const validateCFOPCSTCompatibility = (produto: Partial<Produto>): boolean => {
    // Lógica básica de compatibilidade CFOP + CST
    if (!produto.cfop_saida || !produto.icms_situacao_tributaria) return false;
    
    // CST 00 (tributada integralmente) é compatível com CFOPs de saída
    return produto.icms_situacao_tributaria === '00';
  };

  const validateCSTNCMCompatibility = (produto: Partial<Produto>): boolean => {
    // Lógica básica de compatibilidade CST + NCM
    if (!produto.icms_situacao_tributaria || !produto.ncm) return false;
    
    // CST 00 é compatível com qualquer NCM
    return produto.icms_situacao_tributaria === '00';
  };

  const getValidationIcon = () => {
    if (isValidating || loadingValidation) {
      return <LoadingSpinner size="sm" />;
    }
    
    if (errorValidation) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
    
    if (validationResult) {
      if (validationResult.valid) {
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      } else {
        return <XCircle className="h-5 w-5 text-red-500" />;
      }
    }
    
    return <Shield className="h-5 w-5 text-gray-400" />;
  };

  const getValidationColor = () => {
    if (isValidating || loadingValidation) return "border-blue-300";
    if (errorValidation) return "border-yellow-300";
    if (validationResult) {
      return validationResult.valid ? "border-green-300" : "border-red-300";
    }
    return "border-gray-300";
  };

  const getValidationTitle = () => {
    if (isValidating || loadingValidation) return "Validando...";
    if (errorValidation) return "Erro na Validação";
    if (validationResult) {
      return validationResult.valid ? "Validação Aprovada" : "Validação com Problemas";
    }
    return "Validador Fiscal";
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            {getValidationIcon()}
            <span className="ml-2">{getValidationTitle()}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={validateProduct}
            disabled={isValidating || loadingValidation || !hasRequiredFields(produto)}
          >
            <RefreshCw className={cn("h-4 w-4", (isValidating || loadingValidation) && "animate-spin")} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da validação */}
        {validationResult && (
          <div className={cn(
            "p-3 rounded-md border",
            validationResult.valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          )}>
            <div className="flex items-center">
              {validationResult.valid ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className={cn(
                "font-medium",
                validationResult.valid ? "text-green-800" : "text-red-800"
              )}>
                {validationResult.valid ? "Produto válido para emissão" : "Produto com problemas fiscais"}
              </span>
            </div>
          </div>
        )}

        {/* Erros */}
        {validationResult && validationResult.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-800 flex items-center">
              <XCircle className="h-4 w-4 mr-1" />
              Erros
            </h4>
            <ul className="space-y-1">
              {validationResult.errors.map((error, index) => (
                <li key={index} className="text-sm text-red-600 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Avisos */}
        {validationResult && validationResult.warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-yellow-800 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Avisos
            </h4>
            <ul className="space-y-1">
              {validationResult.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-yellow-600 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sugestões */}
        {validationResult && validationResult.suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-800 flex items-center">
              <Info className="h-4 w-4 mr-1" />
              Sugestões
            </h4>
            <ul className="space-y-1">
              {validationResult.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-blue-600 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Compatibilidade */}
        {validationResult && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-800 flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Compatibilidade Fiscal
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">NCM + CFOP:</span>
                {validationResult.compatibility.ncm_cfop ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CFOP + CST:</span>
                {validationResult.compatibility.cfop_cst ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CST + NCM:</span>
                {validationResult.compatibility.cst_ncm ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Erro da API */}
        {errorValidation && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
              <span className="text-sm text-yellow-600">{errorValidation}</span>
            </div>
          </div>
        )}

        {/* Última validação */}
        {lastValidation && (
          <div className="text-xs text-gray-500 text-center">
            Última validação: {lastValidation.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
