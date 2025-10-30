"use client";

import { useState, useEffect, useRef } from "react";
import { useFocusNFE } from "@/hooks/useFocusNFE";
import { FocusCSTData } from "@/types/produto";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  AlertCircle,
  Filter,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SeletorCSTProps {
  value: string;
  onChange: (cst: FocusCSTData) => void;
  tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS';
  onValidate?: (valid: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SeletorCST({
  value,
  onChange,
  tipo,
  onValidate,
  placeholder = "Selecione o CST...",
  disabled = false,
  className,
}: SeletorCSTProps) {
  const [showResults, setShowResults] = useState(false);
  const [selectedCST, setSelectedCST] = useState<FocusCSTData | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [cstOptions, setCstOptions] = useState<FocusCSTData[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const { 
    buscarCSTs, 
    loadingCST, 
    errorCST 
  } = useFocusNFE();

  // Carregar CSTs quando o tipo muda
  useEffect(() => {
    loadCSTs();
  }, [tipo]);

  // Validar CST quando value muda
  useEffect(() => {
    if (value && cstOptions.length > 0) {
      const cst = cstOptions.find(c => c.codigo === value);
      if (cst) {
        setSelectedCST(cst);
        setIsValid(true);
        setValidationMessage("");
        onValidate?.(true);
      } else {
        setIsValid(false);
        setValidationMessage("CST inválido");
        onValidate?.(false);
      }
    } else {
      setIsValid(false);
      setValidationMessage("");
      onValidate?.(false);
    }
  }, [value, cstOptions]);

  // Fechar resultados ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadCSTs = async () => {
    try {
      const results = await buscarCSTs(tipo);
      // Deduplicar por código
      const unique = Array.from(new Map(results.map((x) => [x.codigo, x])).values());
      setCstOptions(unique);
    } catch (error) {
      console.error("Erro ao carregar CSTs:", error);
    }
  };

  const handleCSTSelect = (cst: FocusCSTData) => {
    setSelectedCST(cst);
    setValue(cst.codigo);
    onChange(cst);
    setShowResults(false);
    setIsValid(true);
    setValidationMessage("");
    onValidate?.(true);
  };

  const setValue = (codigo: string) => {
    if (inputRef.current) {
      inputRef.current.value = codigo;
    }
  };

  const handleInputFocus = () => {
    setShowResults(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (newValue) {
      const cst = cstOptions.find(c => c.codigo === newValue);
      if (cst) {
        handleCSTSelect(cst);
      } else {
        setIsValid(false);
        setValidationMessage("CST não encontrado");
        onValidate?.(false);
      }
    } else {
      setIsValid(false);
      setValidationMessage("");
      onValidate?.(false);
    }
  };

  const getStatusIcon = () => {
    if (loadingCST) {
      return <LoadingSpinner size="sm" />;
    }
    
    if (errorCST) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    
    if (isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (value) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    return null;
  };

  const getStatusColor = () => {
    if (loadingCST) return "border-blue-300";
    if (errorCST) return "border-yellow-300";
    if (isValid) return "border-green-300";
    if (value) return "border-red-300";
    return "border-gray-300";
  };

  const getTipoLabel = (tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS') => {
    const labels = {
      ICMS: 'ICMS',
      IPI: 'IPI',
      PIS: 'PIS',
      COFINS: 'COFINS'
    };
    return labels[tipo];
  };

  const getTipoColor = (tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS') => {
    const colors = {
      ICMS: 'text-blue-600 bg-blue-50',
      IPI: 'text-purple-600 bg-purple-50',
      PIS: 'text-orange-600 bg-orange-50',
      COFINS: 'text-green-600 bg-green-50'
    };
    return colors[tipo];
  };

  const getTipoDescription = (tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS') => {
    const descriptions = {
      ICMS: 'Imposto sobre Circulação de Mercadorias e Serviços',
      IPI: 'Imposto sobre Produtos Industrializados',
      PIS: 'Programa de Integração Social',
      COFINS: 'Contribuição para o Financiamento da Seguridade Social'
    };
    return descriptions[tipo];
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="cst">CST {getTipoLabel(tipo)}</Label>
        <div className="flex items-center space-x-2" />
      </div>
      
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            id="cst"
            type="text"
            placeholder={placeholder}
            disabled={disabled}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className={cn(
              "pr-10",
              getStatusColor()
            )}
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getStatusIcon()}
          </div>
        </div>

        {/* Resultados da busca */}
        {showResults && (
          <div
            ref={resultsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {loadingCST ? (
              <div className="p-3 text-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm text-gray-600">Carregando CSTs...</span>
              </div>
            ) : (
              <div className="py-1">
                <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                  <div className="flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    {getTipoDescription(tipo)}
                  </div>
                </div>
                
                {cstOptions.map((cst) => (
                  <div
                    key={cst.codigo}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    onClick={() => handleCSTSelect(cst)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {cst.codigo} - {cst.descricao}
                        </div>
                      </div>
                      {selectedCST?.codigo === cst.codigo && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mensagem de validação */}
      {!isValid && validationMessage && (
        <div className={cn(
          "text-sm",
          isValid ? "text-green-600" : "text-red-600"
        )}>
          {validationMessage}
        </div>
      )}

      {/* Erro da API */}
      {errorCST && (
        <div className="text-sm text-yellow-600">
          <AlertCircle className="inline h-4 w-4 mr-1" />
          {errorCST}
        </div>
      )}

      {/* Informações do CST selecionado */}
      {selectedCST && isValid && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-green-800">
                {selectedCST.codigo} - {selectedCST.descricao}
              </div>
              <div className="text-sm text-green-600 mt-1">CST {getTipoLabel(selectedCST.tipo)}</div>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
}
