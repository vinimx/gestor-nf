"use client";

import { useState, useEffect, useRef } from "react";
import { useFocusNFE } from "@/hooks/useFocusNFE";
import { FocusCFOPData } from "@/types/produto";
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
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SeletorCFOPProps {
  value: string;
  onChange: (cfop: FocusCFOPData) => void;
  tipo: 'ENTRADA' | 'SAIDA';
  operacao?: string;
  onValidate?: (valid: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  empresaId?: string;
}

export function SeletorCFOP({
  value,
  onChange,
  tipo,
  operacao,
  onValidate,
  placeholder = "Digite o código CFOP...",
  disabled = false,
  className,
  empresaId,
}: SeletorCFOPProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedCFOP, setSelectedCFOP] = useState<FocusCFOPData | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<'ENTRADA' | 'SAIDA' | 'TODOS'>(tipo);
  const [results, setResults] = useState<FocusCFOPData[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const { 
    buscarCFOPs, 
    consultarCFOP, 
    loadingCFOP, 
    errorCFOP 
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
  }, [searchTerm, filtroTipo]);

  // Validar CFOP quando value muda
  useEffect(() => {
    if (value && value.length === 4) {
      validateCFOP(value);
    } else {
      setIsValid(false);
      setValidationMessage("");
      onValidate?.(false);
    }
  }, [value]);

  // Atualizar filtro quando tipo muda
  useEffect(() => {
    setFiltroTipo(tipo);
  }, [tipo]);

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
      const fetched = await buscarCFOPs({
        descricao: searchTerm,
        limit: 20
      });
      let filtered = fetched;
      if (filtroTipo !== 'TODOS') {
        filtered = fetched.filter((i) => i.tipo === filtroTipo);
      }
      if (filtered.length > 0) {
        const ordered = [...filtered].sort((a, b) => {
          const aStarts = a.codigo.startsWith(searchTerm) ? 1 : 0;
          const bStarts = b.codigo.startsWith(searchTerm) ? 1 : 0;
          if (aStarts !== bStarts) return bStarts - aStarts;
          const aDesc = a.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
          const bDesc = b.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
          return bDesc - aDesc;
        });
        setResults(ordered);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Erro ao buscar CFOPs:", error);
    }
  };

  const validateCFOP = async (codigo: string) => {
    if (codigo.length !== 4) {
      setIsValid(false);
      setValidationMessage("CFOP deve ter 4 dígitos");
      onValidate?.(false);
      return;
    }

    try {
      const cfopData = await consultarCFOP(codigo);
      if (cfopData) {
        setSelectedCFOP(cfopData);
        setIsValid(true);
        setValidationMessage("");
        onValidate?.(true);
      } else {
        setIsValid(false);
        setValidationMessage("CFOP não encontrado");
        onValidate?.(false);
      }
    } catch (error) {
      setIsValid(false);
      setValidationMessage("Erro ao validar CFOP");
      onValidate?.(false);
    }
  };

  const handleCFOPSelect = (cfop: FocusCFOPData) => {
    setSelectedCFOP(cfop);
    setSearchTerm(cfop.codigo);
    setValue(cfop.codigo);
    onChange(cfop);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, ""); // Apenas números
    setSearchTerm(newValue);
    setValue(newValue);
    
    if (newValue.length === 4) {
      validateCFOP(newValue);
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
    if (loadingCFOP) {
      return <LoadingSpinner size="sm" />;
    }
    
    if (errorCFOP) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    
    if (isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (value && value.length === 4) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    return null;
  };

  const getStatusColor = () => {
    if (loadingCFOP) return "border-blue-300";
    if (errorCFOP) return "border-yellow-300";
    if (isValid) return "border-green-300";
    if (value && value.length === 4) return "border-red-300";
    return "border-gray-300";
  };

  const getTipoLabel = (tipo: 'ENTRADA' | 'SAIDA') => {
    return tipo === 'ENTRADA' ? 'Entrada' : 'Saída';
  };

  const getTipoColor = (tipo: 'ENTRADA' | 'SAIDA') => {
    return tipo === 'ENTRADA' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50';
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="cfop">CFOP (Código Fiscal de Operações e Prestações)</Label>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={filtroTipo} onValueChange={(value: 'ENTRADA' | 'SAIDA' | 'TODOS') => setFiltroTipo(value)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value="ENTRADA">Entrada</SelectItem>
              <SelectItem value="SAIDA">Saída</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            id="cfop"
            type="text"
            placeholder={placeholder}
            disabled={disabled}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className={cn(
              "pr-10 bg-white text-[var(--foreground)] border border-[var(--cor-primaria)]/30 focus:ring-2 focus:ring-[var(--cor-primaria)]/30",
              getStatusColor()
            )}
            maxLength={4}
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
            {loadingCFOP ? (
              <div className="p-3 text-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm text-gray-600">Buscando CFOPs...</span>
              </div>
            ) : (
              <div className="py-1">
                {results.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Nenhum CFOP encontrado para "{searchTerm}"
                  </div>
                )}
                {results.length > 0 && (
                  <div className="divide-y divide-gray-100">
                    {results.map((item) => (
                      <div
                        key={item.codigo}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleCFOPSelect(item)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <div className="font-mono text-sm font-medium text-blue-600">
                                {item.codigo}
                              </div>
                              <span className={cn("px-2 py-0.5 rounded text-xs", getTipoColor(item.tipo))}>
                                {getTipoLabel(item.tipo)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-700 line-clamp-2">
                              {item.descricao}
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
      <p className="text-xs text-gray-500">Digite 4 dígitos ou pesquise pela descrição. Use o filtro Entrada/Saída.</p>

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
      {errorCFOP && (
        <div className="text-sm text-yellow-600">
          <AlertCircle className="inline h-4 w-4 mr-1" />
          {errorCFOP}
        </div>
      )}

      {/* Informações do CFOP selecionado */}
      {selectedCFOP && isValid && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-green-800">
                {selectedCFOP.codigo} - {selectedCFOP.descricao}
              </div>
              <div className="text-sm text-green-600 mt-1">
                <span className={cn("px-2 py-1 rounded text-xs", getTipoColor(selectedCFOP.tipo))}>
                  {getTipoLabel(selectedCFOP.tipo)}
                </span>
              </div>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
}
