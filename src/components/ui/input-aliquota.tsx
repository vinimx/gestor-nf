/**
 * Input de Alíquota Percentual com Formatação Brasileira
 * 
 * Componente especializado para entrada de alíquotas percentuais
 * com formatação automática no padrão brasileiro.
 * 
 * Características:
 * - Aceita ponto (.) e vírgula (,) durante digitação
 * - Formata automaticamente ao perder foco
 * - Até 4 casas decimais para precisão fiscal
 * - Alinhamento à direita
 * - Símbolo % automático
 * - Validação de range (0-100%)
 * - Experiência fluida sem travamentos
 * 
 * @component
 * @example
 * ```tsx
 * <InputAliquota
 *   value={produto.aliquota_icms}
 *   onChange={(valor) => setProduto({...produto, aliquota_icms: valor})}
 *   label="Alíquota ICMS (%)"
 * />
 * ```
 */

import React, { useState, useEffect, useRef } from 'react';
import { Input } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';
import {
  formatarAliquota,
  parseValorBrasileiro,
  normalizarInput,
  validarRange
} from '@/lib/utils/formatacaoNumerica';

export interface InputAliquotaProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  onBlur?: () => void;
  label?: string;
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
  helpText?: string;
}

export const InputAliquota = React.forwardRef<HTMLInputElement, InputAliquotaProps>(
  (
    {
      value,
      onChange,
      onBlur,
      label,
      placeholder = '0,00',
      disabled = false,
      required = false,
      min = 0,
      max = 100,
      casasDecimais = 2,
      className = '',
      id,
      name,
      error,
      helpText,
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
          setDisplayValue(formatarAliquota(value, casasDecimais));
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
      
      // Validar range (0-100% para alíquotas)
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
        setDisplayValue(formatarAliquota(value, casasDecimais));
      } else {
        setDisplayValue('');
      }
      
      onBlur?.();
    };

    // Determinar cor do indicador baseado no valor
    const getIndicatorColor = () => {
      if (value === undefined || value === 0) return 'bg-gray-300';
      if (value < 5) return 'bg-green-500';
      if (value < 15) return 'bg-yellow-500';
      if (value < 25) return 'bg-orange-500';
      return 'bg-red-500';
    };

    return (
      <div className={cn("space-y-1.5", className)}>
        {label && (
          <Label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
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
            "text-right font-mono pr-10 tracking-wide",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500 border-2"
          )}
          />
          
          {/* Símbolo % */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            {/* Indicador visual de alíquota */}
            {value !== undefined && value > 0 && (
              <span className={cn(
                "w-1.5 h-1.5 rounded-full inline-block transition-colors duration-200",
                getIndicatorColor()
              )} />
            )}
            <span className="text-gray-500 font-semibold">%</span>
          </div>
        </div>
        
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
        
        {!error && helpText && (
          <p className="text-xs text-gray-500 mt-1">{helpText}</p>
        )}
        
        {!error && !helpText && value !== undefined && value > 0 && (
          <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
            <span className={cn("w-2 h-2 rounded-full inline-block", getIndicatorColor())} />
            <span>
              Alíquota: {formatarAliquota(value, casasDecimais)}%
              {value >= 20 && <span className="text-orange-600 ml-1">(alta)</span>}
              {value >= 5 && value < 20 && <span className="text-yellow-600 ml-1">(média)</span>}
              {value < 5 && value > 0 && <span className="text-green-600 ml-1">(baixa)</span>}
            </span>
          </div>
        )}
      </div>
    );
  }
);

InputAliquota.displayName = 'InputAliquota';

export default InputAliquota;

