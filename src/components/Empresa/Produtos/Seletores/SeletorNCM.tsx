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
  empresaId?: string;
}

export function SeletorNCM({
  value,
  onChange,
  onValidate,
  placeholder = "Digite o código NCM...",
  disabled = false,
  className,
  empresaId,
}: SeletorNCMProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedNCM, setSelectedNCM] = useState<FocusNCMData | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [results, setResults] = useState<FocusNCMData[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const { 
    buscarNCMs, 
    consultarNCM, 
    loadingNCM, 
    errorNCM 
  } = useFocusNFE(empresaId);

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

  // Validar NCM quando value muda (mas não se já está selecionado o mesmo código)
  useEffect(() => {
    // Pular validação se o searchTerm corresponde ao value (significa que acabamos de selecionar)
    if (value && value.length === 8 && searchTerm === value && selectedNCM && selectedNCM.codigo === value) {
      // Acabamos de selecionar este NCM, já está válido
      setIsValid(true);
      setValidationMessage("");
      onValidate?.(true);
      return;
    }
    
    if (value && value.length === 8) {
      // Só validar se não for o mesmo código já selecionado
      if (!selectedNCM || selectedNCM.codigo !== value) {
        validateNCM(value);
      } else {
        // Já temos este NCM selecionado, manter como válido
        setIsValid(true);
        setValidationMessage("");
        onValidate?.(true);
      }
    } else if (value && value.length > 0) {
      setIsValid(false);
      setValidationMessage("");
      onValidate?.(false);
    }
  }, [value, searchTerm]);

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
      // Se o termo é um número de 8 dígitos, buscar por código
      // Caso contrário, buscar por descrição
      const isNumeric = /^\d{8}$/.test(searchTerm);
      const searchParams = isNumeric 
        ? { codigo: searchTerm, limit: 100 }
        : { descricao: searchTerm, limit: 100 };
      
      const fetched = await buscarNCMs(searchParams);
      
      // Se não retornou resultados e há erro no hook, mostrar mensagem de erro
      if (fetched.length === 0 && errorNCM) {
        setIsValid(false);
        setValidationMessage(errorNCM);
        onValidate?.(false);
        return;
      }
      
      if (fetched.length > 0) {
        // Ordenar resultados: código que começa com o termo tem prioridade
        const ordered = [...fetched].sort((a, b) => {
          const aStarts = a.codigo.startsWith(searchTerm) ? 1 : 0;
          const bStarts = b.codigo.startsWith(searchTerm) ? 1 : 0;
          if (aStarts !== bStarts) return bStarts - aStarts;
          // fallback: descrição que contém termo primeiro
          const aDesc = a.descricao_completa.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
          const bDesc = b.descricao_completa.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
          return bDesc - aDesc;
        });
        setResults(ordered);
        setShowResults(true);
        setIsValid(true);
        setValidationMessage("");
      } else {
        // Se há erro no hook, mostrar mensagem de erro específica
        const errorMsg = errorNCM || "Nenhum NCM encontrado. Verifique se a integração FOCUS NFE está ativa.";
        setIsValid(false);
        setValidationMessage(errorMsg);
        onValidate?.(false);
      }
    } catch (error) {
      console.error("Erro ao buscar NCMs:", error);
      setIsValid(false);
      setValidationMessage("Erro ao buscar NCMs. Verifique a configuração da integração FOCUS NFE.");
      onValidate?.(false);
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
      
      // Se não encontrou e há erro no hook, mostrar mensagem de erro
      if (!ncmData && errorNCM) {
        setIsValid(false);
        setValidationMessage(errorNCM);
        onValidate?.(false);
        return;
      }
      
      if (ncmData) {
        setSelectedNCM(ncmData);
        setIsValid(true);
        setValidationMessage("");
        onValidate?.(true);
      } else {
        // Se há erro no hook, mostrar mensagem de erro específica
        const errorMsg = errorNCM || "NCM não encontrado. Verifique se a integração FOCUS NFE está ativa.";
        setIsValid(false);
        setValidationMessage(errorMsg);
        onValidate?.(false);
      }
    } catch (error) {
      setIsValid(false);
      setValidationMessage("Erro ao validar NCM. Verifique a configuração da integração FOCUS NFE.");
      onValidate?.(false);
    }
  };

  const handleNCMSelect = (ncm: FocusNCMData) => {
    // Quando seleciona da lista, o item já foi validado pela busca
    // Não precisa fazer nova validação - aceitar diretamente
    setSelectedNCM(ncm);
    setSearchTerm(ncm.codigo);
    setValue(ncm.codigo);
    setShowResults(false);
    setIsValid(true);
    setValidationMessage("");
    // Chamar onChange e onValidate ANTES de atualizar o valor do input
    // Isso evita que o useEffect dispare validação desnecessária
    onChange(ncm);
    onValidate?.(true);
    
    // Atualizar o input após o onChange para evitar conflitos
    if (inputRef.current) {
      inputRef.current.value = ncm.codigo;
    }
  };

  const setValue = (codigo: string) => {
    // Não atualizar o input se já tem o mesmo valor
    // Isso evita disparar handleInputChange desnecessariamente
    if (inputRef.current && inputRef.current.value !== codigo) {
      inputRef.current.value = codigo;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, ""); // Apenas números
    setSearchTerm(newValue);
    setValue(newValue);
    
    // Se já tem um NCM selecionado e o código mudou, limpar seleção
    if (selectedNCM && selectedNCM.codigo !== newValue) {
      setSelectedNCM(null);
    }
    
    if (newValue.length === 8) {
      // Validar apenas se não for o mesmo código já selecionado
      if (!selectedNCM || selectedNCM.codigo !== newValue) {
        validateNCM(newValue);
      }
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
              "pr-10 bg-white text-[var(--foreground)] border border-[var(--cor-primaria)]/30 focus:ring-2 focus:ring-[var(--cor-primaria)]/30",
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
            className="absolute z-50 w-full mt-1 bg-white text-[var(--foreground)] border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {loadingNCM ? (
              <div className="p-3 text-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm text-gray-600">Buscando NCMs...</span>
              </div>
            ) : (
              <div className="py-1">
                {results.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Nenhum NCM encontrado para "{searchTerm}"
                  </div>
                )}
                {results.length > 0 && (
                  <div className="divide-y divide-gray-100">
                    {results.map((item) => (
                      <div
                        key={item.codigo}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleNCMSelect(item)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-sm font-medium text-blue-600">
                              {item.codigo}
                            </div>
                            <div className="text-sm text-gray-700 line-clamp-2">
                              {item.descricao_completa}
                            </div>
                          </div>
                          {item.codigo === searchTerm && (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ajuda contextual */}
      <p className="text-xs text-gray-500">Digite 8 dígitos para validar automaticamente ou busque pela descrição.</p>

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
                {selectedNCM.codigo} - {selectedNCM.descricao_completa}
              </div>
              <div className="text-sm text-green-600 mt-1">
                NCM válido
              </div>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
}
