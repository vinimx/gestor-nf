'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, AlertCircle, Loader2, Filter } from 'lucide-react';
import { focusProdutoService } from '@/lib/services/focusProdutoService';
import { cn } from '@/lib/utils';

interface CSTItem {
  codigo: string;
  descricao: string;
  tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS';
  aplicavel: boolean;
}

interface SeletorCSTProps {
  value?: string;
  onChange: (cst: CSTItem | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS';
}

export function SeletorCST({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  error,
  tipo
}: SeletorCSTProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<CSTItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CSTItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Carregar CSTs quando o componente monta ou o tipo muda
  useEffect(() => {
    loadCSTs();
  }, [tipo]);

  // Carregar item selecionado quando value muda
  useEffect(() => {
    if (value && results.length > 0) {
      const item = results.find(cst => cst.codigo === value);
      if (item) {
        setSelectedItem(item);
        setSearchTerm(item.descricao);
      }
    }
  }, [value, results]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCSTs = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      const response = await focusProdutoService.buscarCSTs(tipo);

      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setResults([]);
        setErrorMessage(response.error || 'Erro ao carregar CSTs');
      }
    } catch (error) {
      console.error('Erro ao carregar CSTs:', error);
      setErrorMessage('Erro ao carregar CSTs');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCSTs = (term: string) => {
    if (!term || term.length < 1) {
      return results;
    }

    return results.filter(cst => 
      cst.codigo.includes(term) || 
      cst.descricao.toLowerCase().includes(term.toLowerCase())
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    // Limpar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Se o termo for um código CST (2 dígitos), buscar diretamente
    if (/^\d{2}$/.test(term)) {
      const item = results.find(cst => cst.codigo === term);
      if (item) {
        setSelectedItem(item);
        setSearchTerm(item.descricao);
        onChange(item);
        setErrorMessage('');
      }
    } else {
      // Filtrar por descrição
      searchTimeoutRef.current = setTimeout(() => {
        setIsOpen(true);
      }, 100);
    }
  };

  const handleSelectItem = (item: CSTItem) => {
    setSelectedItem(item);
    setSearchTerm(item.descricao);
    setIsOpen(false);
    onChange(item);
    setErrorMessage('');
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClear = () => {
    setSelectedItem(null);
    setSearchTerm('');
    onChange(null);
    setErrorMessage('');
    inputRef.current?.focus();
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      ICMS: 'bg-blue-100 text-blue-800',
      IPI: 'bg-purple-100 text-purple-800',
      PIS: 'bg-orange-100 text-orange-800',
      COFINS: 'bg-red-100 text-red-800'
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTipoLabel = (tipo: string) => {
    return tipo;
  };

  const filteredResults = filterCSTs(searchTerm);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder || `Buscar CST ${tipo}...`}
          disabled={disabled}
          className={cn(
            "block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
            error || errorMessage
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300",
            disabled && "bg-gray-50 cursor-not-allowed"
          )}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          )}
          {!loading && selectedItem && (
            <Check className="h-4 w-4 text-green-500" />
          )}
          {!loading && !selectedItem && (error || errorMessage) && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>

      {/* Indicador do tipo de CST */}
      <div className="mt-2 flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <span className={cn(
          "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
          getTipoColor(tipo)
        )}>
          CST {getTipoLabel(tipo)}
        </span>
        <span className="text-xs text-gray-500">
          {results.length} opções disponíveis
        </span>
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredResults.length > 0 ? (
            <div className="py-1">
              {filteredResults.map((item) => (
                <div
                  key={item.codigo}
                  onClick={() => handleSelectItem(item)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-medium text-blue-600">
                          {item.codigo}
                        </span>
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                          getTipoColor(item.tipo)
                        )}>
                          {getTipoLabel(item.tipo)}
                        </span>
                        {item.aplicavel && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Aplicável
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-900 line-clamp-2">
                        {item.descricao}
                      </p>
                    </div>
                    {item.aplicavel && (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm && !loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Nenhum CST encontrado para "{searchTerm}"
            </div>
          ) : null}
        </div>
      )}

      {/* Informações do CST selecionado */}
      {selectedItem && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-medium text-green-800">
                  {selectedItem.codigo}
                </span>
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                  getTipoColor(selectedItem.tipo)
                )}>
                  {getTipoLabel(selectedItem.tipo)}
                </span>
                {selectedItem.aplicavel && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Aplicável
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-green-700">
                {selectedItem.descricao}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="ml-2 text-green-600 hover:text-green-800"
            >
              <span className="sr-only">Limpar seleção</span>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Mensagem de erro */}
      {(error || errorMessage) && !selectedItem && (
        <p className="mt-1 text-sm text-red-600">
          {error || errorMessage}
        </p>
      )}
    </div>
  );
}
