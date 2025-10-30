'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, AlertCircle, Loader2 } from 'lucide-react';
import { focusProdutoService } from '@/lib/services/focusProdutoService';
import { cn } from '@/lib/utils';

interface NCMItem {
  codigo: string;
  descricao_completa: string;
  capitulo: string;
  posicao: string;
  subposicao1: string;
  subposicao2: string;
  item1: string;
  item2: string;
  valid: boolean;
}

interface SeletorNCMProps {
  value?: string;
  onChange: (ncm: NCMItem | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
}

export function SeletorNCM({
  value,
  onChange,
  placeholder = "Buscar NCM...",
  className,
  disabled = false,
  error
}: SeletorNCMProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<NCMItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NCMItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar item selecionado quando value muda
  useEffect(() => {
    if (value && value !== selectedItem?.codigo) {
      loadSelectedNCM(value);
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

  const loadSelectedNCM = async (codigo: string) => {
    try {
      setLoading(true);
      const response = await focusProdutoService.consultarNCM(codigo);
      
      if (response.success && response.data && response.data.length > 0) {
        setSelectedItem(response.data[0]);
        setSearchTerm(response.data[0].descricao_completa);
      } else {
        setSelectedItem(null);
        setSearchTerm('');
        setErrorMessage('NCM não encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar NCM:', error);
      setErrorMessage('Erro ao carregar NCM');
    } finally {
      setLoading(false);
    }
  };

  const searchNCMs = async (term: string) => {
    if (!term || term.length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      
      const response = await focusProdutoService.buscarNCMs({
        descricao: term,
        limit: 20
      });

      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setResults([]);
        setErrorMessage(response.error || 'Nenhum NCM encontrado');
      }
    } catch (error) {
      console.error('Erro na busca de NCMs:', error);
      setErrorMessage('Erro na busca de NCMs');
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

    // Se o termo for um código NCM (8 dígitos), buscar diretamente
    if (/^\d{8}$/.test(term)) {
      searchTimeoutRef.current = setTimeout(() => {
        loadSelectedNCM(term);
      }, 500);
    } else {
      // Buscar por descrição
      searchTimeoutRef.current = setTimeout(() => {
        searchNCMs(term);
        setIsOpen(true);
      }, 300);
    }
  };

  const handleSelectItem = (item: NCMItem) => {
    setSelectedItem(item);
    setSearchTerm(item.descricao_completa);
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
                        <span className="text-xs text-gray-500">
                          Cap. {item.capitulo}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-900 line-clamp-2">
                        {item.descricao_completa}
                      </p>
                      <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                        <span>Pos: {item.posicao}</span>
                        <span>Sub: {item.subposicao1}.{item.subposicao2}</span>
                        <span>Item: {item.item1}.{item.item2}</span>
                      </div>
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
              {errorMessage || 'Nenhum NCM encontrado'}
            </div>
          ) : null}
        </div>
      )}

      {/* Informações do NCM selecionado */}
      {selectedItem && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-medium text-green-800">
                  {selectedItem.codigo}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Válido
                </span>
              </div>
              <p className="mt-1 text-sm text-green-700">
                {selectedItem.descricao_completa}
              </p>
              <div className="mt-2 flex items-center space-x-4 text-xs text-green-600">
                <span>Capítulo: {selectedItem.capitulo}</span>
                <span>Posição: {selectedItem.posicao}</span>
                <span>Subposição: {selectedItem.subposicao1}.{selectedItem.subposicao2}</span>
                <span>Item: {selectedItem.item1}.{selectedItem.item2}</span>
              </div>
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
