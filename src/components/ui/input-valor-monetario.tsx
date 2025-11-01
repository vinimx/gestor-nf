/**
 * Input de Valor Monetário com Formatação Brasileira
 * 
 * Componente especializado para entrada de valores monetários (R$)
 * com formatação automática no padrão brasileiro.
 * 
 * Características:
 * - Aceita ponto (.) e vírgula (,) durante digitação
 * - Formata automaticamente ao perder foco
 * - 2 casas decimais para valores monetários
 * - Alinhamento à direita
 * - Validação de range (min/max)
 * - Experiência fluida sem travamentos
 * 
 * @component
 * @example
 * ```tsx
 * <InputValorMonetario
 *   value={produto.preco_venda}
 *   onChange={(valor) => setProduto({...produto, preco_venda: valor})}
 *   placeholder="0,00"
 * />
 * ```
 */

import React, { useState, useEffect, useRef } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';
import {
  formatarValorMonetario,
  parseValorBrasileiro,
  normalizarInput,
  validarRange
} from '@/lib/utils/formatacaoNumerica';

export interface InputValorMonetarioProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  casasDecimais?: number;
  className?: string;
  id?: string;
  name?: string;
  error?: string;
  prefixo?: string; // Ex: "R$"
  sufixo?: string;
}

export const InputValorMonetario = React.forwardRef<HTMLInputElement, InputValorMonetarioProps>(
  (
    {
      value,
      onChange,
      onBlur,
      placeholder = '0,00',
      disabled = false,
      required = false,
      min = 0,
      max = 999999999.99,
      casasDecimais = 2,
      className = '',
      id,
      name,
      error,
      prefixo,
      sufixo,
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sincronizar displayValue com value quando não está focado
    useEffect(() => {
      if (!isFocused) {
        if (value !== undefined && value !== null && !isNaN(value)) {
          setDisplayValue(formatarValorMonetario(value, casasDecimais));
        } else {
          setDisplayValue('');
        }
      }
    }, [value, isFocused, casasDecimais]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      
      // Normalizar input (remover caracteres inválidos)
      const normalizado = normalizarInput(input);
      
      // Atualizar display imediatamente para UX fluida
      setDisplayValue(normalizado);
      
      // Parsear e validar
      const numero = parseValorBrasileiro(normalizado);
      
      // Validar range
      if (numero !== undefined && !validarRange(numero, min, max)) {
        return; // Não atualizar se fora do range
      }
      
      // Atualizar valor no parent
      onChange(numero);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      
      // Selecionar tudo ao focar (facilita edição)
      setTimeout(() => {
        e.target.select();
      }, 0);
    };

    const handleBlur = () => {
      setIsFocused(false);
      
      // Formatar ao perder foco
      if (value !== undefined && value !== null && !isNaN(value)) {
        setDisplayValue(formatarValorMonetario(value, casasDecimais));
      } else {
        setDisplayValue('');
      }
      
      onBlur?.();
    };

    return (
      <>
        <div className="relative">
          {prefixo && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none font-medium">
              {prefixo}
            </div>
          )}
          
          <Input
            ref={inputRef}
            id={id}
            name={name}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={cn(
              "text-right font-mono",
              prefixo && "pl-10",
              sufixo && "pr-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500 border-2",
              className
            )}
          />
          
          {sufixo && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none font-medium">
              {sufixo}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600 mt-1 flex items-center">
            <span className="inline-block mr-1">⚠️</span>
            {error}
          </p>
        )}
      </>
    );
  }
);

InputValorMonetario.displayName = 'InputValorMonetario';

export default InputValorMonetario;

