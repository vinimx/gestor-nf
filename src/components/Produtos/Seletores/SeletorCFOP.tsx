'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, AlertCircle, Loader2, Filter } from 'lucide-react';
import { focusProdutoService } from '@/lib/services/focusProdutoService';
import { cn } from '@/lib/utils';

interface CFOPItem {
  codigo: string;
  descricao: string;
  valid: boolean;
  tipo: 'ENTRADA' | 'SAIDA';
}

interface SeletorCFOPProps {
  value?: string;
  onChange: (cfop: CFOPItem | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  tipo?: 'ENTRADA' | 'SAIDA';
  showTipoFilter?: boolean;
}

export function SeletorCFOP({
  value,
  onChange,
  placeholder = "Buscar CFOP...",
  className,
  disabled = false,
  error,
  tipo,
  showTipoFilter = true
}: SeletorCFOPProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<CFOPItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CFOPItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedTipo, setSelectedTipo] = useState<'ENTRADA' | 'SAIDA' | undefined>(tipo);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar item selecionado quando value muda
  useEffect(() => {
    if (value && value !== selectedItem?.codigo) {
      loadSelectedCFOP(value);
    }
  }, [value]);

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

  const loadSelectedCFOP = async (codigo: string) => {
    try {
      setLoading(true);
      const response = await focusProdutoService.consultarCFOP(codigo);
      
      if (response.success && response.data && response.data.length > 0) {
        setSelectedItem(response.data[0]);
        setSearchTerm(response.data[0].descricao);
      } else {
        setSelectedItem(null);
        setSearchTerm('');
        setErrorMessage('CFOP não encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar CFOP:', error);
      setErrorMessage('Erro ao carregar CFOP');
    } finally {
      setLoading(false);
    }
  };

  const searchCFOPs = async (term: string, tipoFilter?: 'ENTRADA' | 'SAIDA') => {
    if (!term || term.length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      
      const response = await focusProdutoService.buscarCFOPs({
        descricao: term,
        limit: 20
      });

      if (response.success && response.data) {
        let filteredResults = response.data;
        
        // Filtrar por tipo se especificado
        if (tipoFilter) {
          filteredResults = filteredResults.filter(cfop => cfop.tipo === tipoFilter);
        }
        
        setResults(filteredResults);
      } else {
        setResults([]);
        setErrorMessage(response.error || 'Nenhum CFOP encontrado');
      }
    } catch (error) {
      console.error('Erro na busca de CFOPs:', error);
      setErrorMessage('Erro na busca de CFOPs');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    // Limpar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Se o termo for um código CFOP (4 dígitos), buscar diretamente
    if (/^\d{4}$/.test(term)) {
      searchTimeoutRef.current = setTimeout(() => {
        loadSelectedCFOP(term);
      }, 500);
    } else {
      // Buscar por descrição
      searchTimeoutRef.current = setTimeout(() => {
        searchCFOPs(term, selectedTipo);
        setIsOpen(true);
      }, 300);
    }
  };

  const handleSelectItem = (item: CFOPItem) => {
    setSelectedItem(item);
    setSearchTerm(item.descricao);
    setIsOpen(false);
    onChange(item);
    setErrorMessage('');
  };

  const handleInputFocus = () => {
    if (searchTerm && results.length > 0) {
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    setSelectedItem(null);
    setSearchTerm('');
    setResults([]);
    onChange(null);
    setErrorMessage('');
    inputRef.current?.focus();
  };

  const handleTipoChange = (newTipo: 'ENTRADA' | 'SAIDA' | undefined) => {
    setSelectedTipo(newTipo);
    if (searchTerm) {
      searchCFOPs(searchTerm, newTipo);
    }
  };

  const getTipoColor = (tipo: 'ENTRADA' | 'SAIDA') => {
    return tipo === 'ENTRADA' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  const getTipoLabel = (tipo: 'ENTRADA' | 'SAIDA') => {
    return tipo === 'ENTRADA' ? 'Entrada' : 'Saída';
  };

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
          placeholder={placeholder}
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

      {/* Filtro de tipo */}
      {showTipoFilter && (
        <div className="mt-2 flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleTipoChange(undefined)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full border",
                !selectedTipo
                  ? "bg-gray-100 text-gray-800 border-gray-300"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              )}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => handleTipoChange('ENTRADA')}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full border",
                selectedTipo === 'ENTRADA'
                  ? "bg-blue-100 text-blue-800 border-blue-300"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              )}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => handleTipoChange('SAIDA')}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full border",
                selectedTipo === 'SAIDA'
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              )}
            >
              Saída
            </button>
          </div>
        </div>
      )}

      {/* Dropdown de resultados */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {results.length > 0 ? (
            <div className="py-1">
              {results.map((item) => (
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
                      </div>
                      <p className="mt-1 text-sm text-gray-900">
                        {item.descricao}
                      </p>
                    </div>
                    {item.valid && (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm && !loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              {errorMessage || 'Nenhum CFOP encontrado'}
            </div>
          ) : null}
        </div>
      )}

      {/* Informações do CFOP selecionado */}
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
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Válido
                </span>
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
