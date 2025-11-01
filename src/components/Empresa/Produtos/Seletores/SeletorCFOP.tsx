"use client";

import { useState, useEffect, useRef } from "react";
import { useFocusNFE } from "@/hooks/useFocusNFE";
import { FocusCFOPData } from "@/types/produto";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SeletorCFOPProps {
  value: string;
  onChange: (cfop: FocusCFOPData) => void;
  tipo: 'ENTRADA' | 'SAIDA';
  operacao?: string;
  onValidate?: (valid: boolean) => void;
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

  // Sincronizar searchTerm com value externo (importante para manter valor ao trocar de aba)
  useEffect(() => {
    // Evitar loop: só atualizar se realmente diferente E não estiver vazio
    if (value && value.length === 4 && searchTerm !== value) {
      setSearchTerm(value);
      // Atualizar o input visual também
      if (inputRef.current && inputRef.current.value !== value) {
        inputRef.current.value = value;
      }
    }
  }, [value]); // Não incluir searchTerm na dependência para evitar loop

  // Validar CFOP quando value muda (mas não se já está selecionado o mesmo código)
  useEffect(() => {
    // Pular validação se o searchTerm corresponde ao value (significa que acabamos de selecionar)
    if (value && value.length === 4 && searchTerm === value && selectedCFOP && selectedCFOP.codigo === value) {
      // Acabamos de selecionar este CFOP, já está válido
      setIsValid(true);
      setValidationMessage("");
      onValidate?.(true);
      return;
    }
    
    if (value && value.length === 4) {
      // Só validar se não for o mesmo código já selecionado
      if (!selectedCFOP || selectedCFOP.codigo !== value) {
        validateCFOP(value);
      } else {
        // Já temos este CFOP selecionado, manter como válido
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
      // Se o termo é um número de 4 dígitos, buscar por código
      // Caso contrário, buscar por descrição
      const isNumeric = /^\d{4}$/.test(searchTerm);
      const searchParams = isNumeric 
        ? { codigo: searchTerm, limit: 100 }
        : { descricao: searchTerm, limit: 100 };
      
      const fetched = await buscarCFOPs(searchParams);
      
      // Não exibir mensagem de erro, apenas processar resultados silenciosamente
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
        setIsValid(true);
        setValidationMessage("");
      } else {
        // Não exibir mensagem de erro, apenas limpar resultados
        setResults([]);
        setShowResults(false);
        setIsValid(false);
        setValidationMessage("");
        onValidate?.(false);
      }
    } catch (error) {
      // Log silencioso, sem mensagem ao usuário
      console.debug("Busca CFOP sem resultados:", error);
      setResults([]);
      setShowResults(false);
      setIsValid(false);
      setValidationMessage("");
      onValidate?.(false);
    }
  };

  const validateCFOP = async (codigo: string) => {
    if (codigo.length !== 4) {
      setIsValid(false);
      setValidationMessage("");
      onValidate?.(false);
      return;
    }

    try {
      const cfopData = await consultarCFOP(codigo);
      
      if (cfopData) {
        setSelectedCFOP(cfopData);
        setIsValid(true);
        setValidationMessage("");
        onChange(cfopData);
        onValidate?.(true);
      } else {
        // Não exibir mensagem de erro, apenas marcar como inválido
        setIsValid(false);
        setValidationMessage("");
        onValidate?.(false);
      }
    } catch (error) {
      // Log silencioso, sem mensagem ao usuário
      console.debug("Validação CFOP sem resultado:", error);
      setIsValid(false);
      setValidationMessage("");
      onValidate?.(false);
    }
  };

  const handleCFOPSelect = (cfop: FocusCFOPData) => {
    // Quando seleciona da lista, o item já foi validado pela busca
    // Não precisa fazer nova validação - aceitar diretamente
    setSelectedCFOP(cfop);
    setSearchTerm(cfop.codigo);
    setValue(cfop.codigo);
    setShowResults(false);
    setIsValid(true);
    setValidationMessage("");
    // Chamar onChange e onValidate ANTES de atualizar o valor do input
    // Isso evita que o useEffect dispare validação desnecessária
    onChange(cfop);
    onValidate?.(true);
    
    // Atualizar o input após o onChange para evitar conflitos
    if (inputRef.current) {
      inputRef.current.value = cfop.codigo;
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
    
    // Se já tem um CFOP selecionado e o código mudou, limpar seleção
    if (selectedCFOP && selectedCFOP.codigo !== newValue) {
      setSelectedCFOP(null);
    }
    
    if (newValue.length === 4) {
      // Validar apenas se não for o mesmo código já selecionado
      if (!selectedCFOP || selectedCFOP.codigo !== newValue) {
        validateCFOP(newValue);
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

  // Contar resultados por tipo
  const getResultadosPorTipo = () => {
    if (!results || results.length === 0) return { todos: 0, entrada: 0, saida: 0 };
    
    return {
      todos: results.length,
      entrada: results.filter(r => r.tipo === 'ENTRADA').length,
      saida: results.filter(r => r.tipo === 'SAIDA').length,
    };
  };

  const contadores = getResultadosPorTipo();

  // Placeholder dinâmico baseado no filtro
  const getPlaceholder = () => {
    switch (filtroTipo) {
      case 'TODOS':
        return "Digite o código ou descrição do CFOP...";
      case 'ENTRADA':
        return "Ex: 1102 (Compra para comercialização)...";
      case 'SAIDA':
        return "Ex: 5102 (Venda de mercadoria)...";
      default:
        return "Digite o código CFOP...";
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Label htmlFor="cfop" className="text-sm font-medium text-gray-700">
        CFOP (Código Fiscal de Operações e Prestações)
      </Label>
      
      {/* Filtro de Tipo - Tabs Visuais Modernos */}
      <div className="inline-flex items-center gap-1 p-1 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg shadow-sm">
        <button
          type="button"
          onClick={() => setFiltroTipo('TODOS')}
          className={cn(
            "relative px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out",
            filtroTipo === 'TODOS'
              ? "bg-white text-gray-900 shadow-md ring-1 ring-gray-900/10 scale-105"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
          )}
        >
          <span className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              filtroTipo === 'TODOS' ? "bg-gray-500 shadow-sm" : "bg-gray-400"
            )}></div>
            <span>Todos</span>
            {contadores.todos > 0 && filtroTipo === 'TODOS' && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-gray-200 text-gray-700 rounded-full">
                {contadores.todos}
              </span>
            )}
          </span>
        </button>
        
        <button
          type="button"
          onClick={() => setFiltroTipo('ENTRADA')}
          className={cn(
            "relative px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out",
            filtroTipo === 'ENTRADA'
              ? "bg-white text-blue-700 shadow-md ring-1 ring-blue-200 scale-105"
              : "text-gray-600 hover:text-blue-600 hover:bg-white/50"
          )}
        >
          <span className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              filtroTipo === 'ENTRADA' ? "bg-blue-500 shadow-sm" : "bg-blue-400"
            )}></div>
            <span>📥 Entrada</span>
            {contadores.entrada > 0 && filtroTipo === 'ENTRADA' && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                {contadores.entrada}
              </span>
            )}
          </span>
        </button>
        
        <button
          type="button"
          onClick={() => setFiltroTipo('SAIDA')}
          className={cn(
            "relative px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out",
            filtroTipo === 'SAIDA'
              ? "bg-white text-green-700 shadow-md ring-1 ring-green-200 scale-105"
              : "text-gray-600 hover:text-green-600 hover:bg-white/50"
          )}
        >
          <span className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              filtroTipo === 'SAIDA' ? "bg-green-500 shadow-sm" : "bg-green-400"
            )}></div>
            <span>📤 Saída</span>
            {contadores.saida > 0 && filtroTipo === 'SAIDA' && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                {contadores.saida}
              </span>
            )}
          </span>
        </button>
      </div>
      
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            id="cfop"
            type="text"
            placeholder={getPlaceholder()}
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
                        className={cn(
                          "px-3 py-2.5 cursor-pointer transition-all duration-150",
                          "hover:bg-gradient-to-r",
                          item.tipo === 'ENTRADA' 
                            ? "hover:from-blue-50 hover:to-blue-50/50 border-l-2 border-transparent hover:border-blue-400" 
                            : "hover:from-green-50 hover:to-green-50/50 border-l-2 border-transparent hover:border-green-400",
                          item.codigo === searchTerm && (
                            item.tipo === 'ENTRADA' ? "bg-blue-50/50 border-l-blue-500" : "bg-green-50/50 border-l-green-500"
                          )
                        )}
                        onClick={() => handleCFOPSelect(item)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={cn(
                                "font-mono text-sm font-bold px-2 py-0.5 rounded",
                                item.tipo === 'ENTRADA' 
                                  ? "text-blue-700 bg-blue-100" 
                                  : "text-green-700 bg-green-100"
                              )}>
                                {item.codigo}
                              </div>
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1",
                                item.tipo === 'ENTRADA' 
                                  ? "bg-blue-500 text-white" 
                                  : "bg-green-500 text-white"
                              )}>
                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                {item.tipo === 'ENTRADA' ? '📥 Entrada' : '📤 Saída'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-700 leading-relaxed">
                              {item.descricao}
                            </div>
                          </div>
                          {item.codigo === searchTerm && (
                            <div className="flex-shrink-0">
                              <CheckCircle className={cn(
                                "h-5 w-5",
                                item.tipo === 'ENTRADA' ? "text-blue-500" : "text-green-500"
                              )} />
                            </div>
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

      {/* Ajuda contextual por tipo de filtro */}
      <div className="flex items-start gap-2 text-xs">
        <div className={cn(
          "px-2.5 py-1.5 rounded-md border transition-all duration-200",
          filtroTipo === 'TODOS' ? "bg-gray-50 border-gray-200 text-gray-700" :
          filtroTipo === 'ENTRADA' ? "bg-blue-50 border-blue-200 text-blue-700" :
          "bg-green-50 border-green-200 text-green-700"
        )}>
          <span className="font-medium">
            {filtroTipo === 'TODOS' && "📋 Mostrando todos os CFOPs"}
            {filtroTipo === 'ENTRADA' && "📥 Apenas CFOPs de Entrada (compras, devoluções recebidas)"}
            {filtroTipo === 'SAIDA' && "📤 Apenas CFOPs de Saída (vendas, devoluções enviadas)"}
          </span>
        </div>
      </div>
      
      <p className="text-xs text-gray-500">
        Digite 4 dígitos ou pesquise pela descrição da operação.
      </p>

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
