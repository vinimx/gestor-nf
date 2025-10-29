"use client";

import { useState, useEffect, useRef } from "react";
import { useFocusNFE } from "@/hooks/useFocusNFE";
import { FocusNCMData } from "@/types/produto";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SeletorNCMProps {
  value: string;
  onChange: (ncm: FocusNCMData) => void;
  onValidate?: (valid: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SeletorNCM({
  value,
  onChange,
  onValidate,
  placeholder = "Digite o código NCM...",
  disabled = false,
  className,
}: SeletorNCMProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedNCM, setSelectedNCM] = useState<FocusNCMData | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const { 
    buscarNCMs, 
    consultarNCM, 
    loadingNCM, 
    errorNCM 
  } = useFocusNFE();

  // Debounce para busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 2) {
        handleSearch();
      } else {
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Validar NCM quando value muda
  useEffect(() => {
    if (value && value.length === 8) {
      validateNCM(value);
    } else {
      setIsValid(false);
      setValidationMessage("");
      onValidate?.(false);
    }
  }, [value]);

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

  const handleSearch = async () => {
    if (searchTerm.length < 2) return;
    
    try {
      const results = await buscarNCMs(searchTerm);
      if (results.length > 0) {
        setShowResults(true);
      }
    } catch (error) {
      console.error("Erro ao buscar NCMs:", error);
    }
  };

  const validateNCM = async (codigo: string) => {
    if (codigo.length !== 8) {
      setIsValid(false);
      setValidationMessage("NCM deve ter 8 dígitos");
      onValidate?.(false);
      return;
    }

    try {
      const ncmData = await consultarNCM(codigo);
      if (ncmData) {
        setSelectedNCM(ncmData);
        setIsValid(true);
        setValidationMessage(ncmData.descricao);
        onValidate?.(true);
      } else {
        setIsValid(false);
        setValidationMessage("NCM não encontrado");
        onValidate?.(false);
      }
    } catch (error) {
      setIsValid(false);
      setValidationMessage("Erro ao validar NCM");
      onValidate?.(false);
    }
  };

  const handleNCMSelect = (ncm: FocusNCMData) => {
    setSelectedNCM(ncm);
    setSearchTerm(ncm.codigo);
    setValue(ncm.codigo);
    onChange(ncm);
    setShowResults(false);
    setIsValid(true);
    setValidationMessage(ncm.descricao);
    onValidate?.(true);
  };

  const setValue = (codigo: string) => {
    if (inputRef.current) {
      inputRef.current.value = codigo;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, ""); // Apenas números
    setSearchTerm(newValue);
    setValue(newValue);
    
    if (newValue.length === 8) {
      validateNCM(newValue);
    } else {
      setIsValid(false);
      setValidationMessage("");
      onValidate?.(false);
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.length >= 2) {
      setShowResults(true);
    }
  };

  const getStatusIcon = () => {
    if (loadingNCM) {
      return <LoadingSpinner size="sm" />;
    }
    
    if (errorNCM) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    
    if (isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (value && value.length === 8) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    return null;
  };

  const getStatusColor = () => {
    if (loadingNCM) return "border-blue-300";
    if (errorNCM) return "border-yellow-300";
    if (isValid) return "border-green-300";
    if (value && value.length === 8) return "border-red-300";
    return "border-gray-300";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="ncm">NCM (Nomenclatura Comum do Mercosul)</Label>
      
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            id="ncm"
            type="text"
            placeholder={placeholder}
            disabled={disabled}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className={cn(
              "pr-10",
              getStatusColor()
            )}
            maxLength={8}
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
            {loadingNCM ? (
              <div className="p-3 text-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm text-gray-600">Buscando NCMs...</span>
              </div>
            ) : (
              <div className="py-1">
                {searchTerm.length >= 2 && (
                  <div
                    className="px-3 py-2 text-sm text-gray-500 cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setSearchTerm("");
                      setShowResults(false);
                    }}
                  >
                    <Search className="inline h-4 w-4 mr-2" />
                    Buscar por: "{searchTerm}"
                  </div>
                )}
                
                {searchTerm.length >= 2 && (
                  <div className="border-t border-gray-100">
                    <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50">
                      Resultados da busca
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mensagem de validação */}
      {validationMessage && (
        <div className={cn(
          "text-sm",
          isValid ? "text-green-600" : "text-red-600"
        )}>
          {validationMessage}
        </div>
      )}

      {/* Erro da API */}
      {errorNCM && (
        <div className="text-sm text-yellow-600">
          <AlertCircle className="inline h-4 w-4 mr-1" />
          {errorNCM}
        </div>
      )}

      {/* Informações do NCM selecionado */}
      {selectedNCM && isValid && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-green-800">
                {selectedNCM.codigo} - {selectedNCM.descricao}
              </div>
              <div className="text-sm text-green-600 mt-1">
                Unidade: {selectedNCM.unidade}
              </div>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
}
