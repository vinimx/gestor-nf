"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { maskCEP, UFS } from "@/lib/masks";
import { buscarCEP } from "@/lib/viaCep";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface CamposEnderecoProps {
  values: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
  };
  onChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
}

export function CamposEndereco({
  values,
  onChange,
  errors = {},
}: CamposEnderecoProps) {
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [erroCEP, setErroCEP] = useState<string | null>(null);

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cepFormatado = maskCEP(e.target.value);
    onChange("cep", cepFormatado);
    setErroCEP(null);

    // Remove máscara para validar
    const cepNumeros = cepFormatado.replace(/\D/g, "");

    // Busca apenas quando tiver 8 dígitos
    if (cepNumeros.length === 8) {
      setBuscandoCEP(true);
      try {
        const endereco = await buscarCEP(cepNumeros);

        if (endereco) {
          onChange("logradouro", endereco.logradouro);
          onChange("bairro", endereco.bairro);
          onChange("cidade", endereco.localidade);
          onChange("uf", endereco.uf);
          setErroCEP(null);
        } else {
          setErroCEP("CEP não encontrado");
        }
      } catch (error) {
        setErroCEP("Erro ao buscar CEP");
      } finally {
        setBuscandoCEP(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-muted-foreground">
        Endereço (opcional)
      </div>

      {/* CEP */}
      <div className="space-y-2">
        <Label htmlFor="cep">CEP</Label>
        <div className="relative">
          <Input
            id="cep"
            placeholder="00000-000"
            value={values.cep || ""}
            onChange={handleCEPChange}
            maxLength={9}
            className={errors.cep ? "border-destructive" : ""}
          />
          {buscandoCEP && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {(errors.cep || erroCEP) && (
          <p className="text-xs text-destructive">{errors.cep || erroCEP}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Logradouro */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="logradouro">Logradouro</Label>
          <Input
            id="logradouro"
            placeholder="Rua, Avenida, etc"
            value={values.logradouro || ""}
            onChange={(e) => onChange("logradouro", e.target.value)}
            className={errors.logradouro ? "border-destructive" : ""}
          />
          {errors.logradouro && (
            <p className="text-xs text-destructive">{errors.logradouro}</p>
          )}
        </div>

        {/* Número */}
        <div className="space-y-2">
          <Label htmlFor="numero">Número</Label>
          <Input
            id="numero"
            placeholder="123"
            value={values.numero || ""}
            onChange={(e) => onChange("numero", e.target.value)}
            className={errors.numero ? "border-destructive" : ""}
          />
          {errors.numero && (
            <p className="text-xs text-destructive">{errors.numero}</p>
          )}
        </div>

        {/* Complemento */}
        <div className="space-y-2">
          <Label htmlFor="complemento">Complemento</Label>
          <Input
            id="complemento"
            placeholder="Apto, Sala, etc"
            value={values.complemento || ""}
            onChange={(e) => onChange("complemento", e.target.value)}
            className={errors.complemento ? "border-destructive" : ""}
          />
          {errors.complemento && (
            <p className="text-xs text-destructive">{errors.complemento}</p>
          )}
        </div>

        {/* Bairro */}
        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro</Label>
          <Input
            id="bairro"
            placeholder="Centro"
            value={values.bairro || ""}
            onChange={(e) => onChange("bairro", e.target.value)}
            className={errors.bairro ? "border-destructive" : ""}
          />
          {errors.bairro && (
            <p className="text-xs text-destructive">{errors.bairro}</p>
          )}
        </div>

        {/* Cidade */}
        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            placeholder="São Paulo"
            value={values.cidade || ""}
            onChange={(e) => onChange("cidade", e.target.value)}
            className={errors.cidade ? "border-destructive" : ""}
          />
          {errors.cidade && (
            <p className="text-xs text-destructive">{errors.cidade}</p>
          )}
        </div>
      </div>

      {/* UF */}
      <div className="space-y-2">
        <Label htmlFor="uf">Estado (UF)</Label>
        <Select value={values.uf || ""} onValueChange={(val) => onChange("uf", val)}>
          <SelectTrigger
            id="uf"
            className={errors.uf ? "border-destructive" : ""}
          >
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {UFS.map((uf) => (
              <SelectItem key={uf.value} value={uf.value}>
                {uf.label} ({uf.value})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.uf && <p className="text-xs text-destructive">{errors.uf}</p>}
      </div>
    </div>
  );
}

