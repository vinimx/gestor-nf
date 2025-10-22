"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { maskCNPJ, maskPhone, unmask, validateCNPJ } from "@/lib/masks";
import { empresaSchema } from "@/lib/validations";
import { Empresa } from "@/types/models";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { ZodError } from "zod";
import { CamposEndereco } from "./CamposEndereco";

interface FormEmpresaProps {
  empresa?: Empresa | null;
  onSubmit: (data: Partial<Empresa>) => Promise<void>;
  onCancel?: () => void;
}

export function FormEmpresa({ empresa, onSubmit, onCancel }: FormEmpresaProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: empresa?.nome || "",
    cnpj: empresa?.cnpj ? maskCNPJ(empresa.cnpj) : "",
    inscricao_estadual: empresa?.inscricao_estadual || "",
    telefone: empresa?.telefone ? maskPhone(empresa.telefone) : "",
    email: empresa?.email || "",
    ativo: empresa?.ativo ?? true,
    endereco: {
      cep: empresa?.endereco?.cep || "",
      logradouro: empresa?.endereco?.logradouro || "",
      numero: empresa?.endereco?.numero || "",
      complemento: empresa?.endereco?.complemento || "",
      bairro: empresa?.endereco?.bairro || "",
      cidade: empresa?.endereco?.cidade || "",
      uf: empresa?.endereco?.uf || "",
    },
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpa erro do campo ao editar
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleEnderecoChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value },
    }));
    // Limpa erro do campo ao editar
    const errorKey = `endereco.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCNPJ(e.target.value);
    handleChange("cnpj", masked);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskPhone(e.target.value);
    handleChange("telefone", masked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Valida CNPJ com dígito verificador
      const cnpjNumeros = unmask(formData.cnpj);
      if (cnpjNumeros.length > 0 && !validateCNPJ(cnpjNumeros)) {
        setErrors({ cnpj: "CNPJ inválido (verifique os dígitos)" });
        setLoading(false);
        return;
      }

      // Prepara dados para validação
      const dataToValidate = {
        nome: formData.nome,
        cnpj: cnpjNumeros,
        inscricao_estadual: formData.inscricao_estadual || undefined,
        telefone: unmask(formData.telefone) || undefined,
        email: formData.email || undefined,
        ativo: formData.ativo,
        endereco:
          formData.endereco.cep ||
          formData.endereco.logradouro ||
          formData.endereco.cidade
            ? {
                cep: formData.endereco.cep || undefined,
                logradouro: formData.endereco.logradouro || undefined,
                numero: formData.endereco.numero || undefined,
                complemento: formData.endereco.complemento || undefined,
                bairro: formData.endereco.bairro || undefined,
                cidade: formData.endereco.cidade || undefined,
                uf: formData.endereco.uf || undefined,
              }
            : undefined,
      };

      // Valida com Zod
      empresaSchema.parse(dataToValidate);

      // Submete
      await onSubmit(dataToValidate);

      // Limpa formulário se for criação
      if (!empresa) {
        setFormData({
          nome: "",
          cnpj: "",
          inscricao_estadual: "",
          telefone: "",
          email: "",
          ativo: true,
          endereco: {
            cep: "",
            logradouro: "",
            numero: "",
            complemento: "",
            bairro: "",
            cidade: "",
            uf: "",
          },
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        // Mapeia erros do Zod
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const field = err.path.join(".");
          newErrors[field] = err.message;
        });
        setErrors(newErrors);

        toast({
          title: "Erro de validação",
          description: "Verifique os campos do formulário.",
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Erro ao salvar empresa",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados Principais */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-muted-foreground">
          Dados da Empresa
        </div>

        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="nome">
            Nome da Empresa <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nome"
            placeholder="Empresa Exemplo Ltda"
            value={formData.nome}
            onChange={(e) => handleChange("nome", e.target.value)}
            className={errors.nome ? "border-destructive" : ""}
            required
          />
          {errors.nome && (
            <p className="text-xs text-destructive">{errors.nome}</p>
          )}
        </div>

        {/* CNPJ */}
        <div className="space-y-2">
          <Label htmlFor="cnpj">
            CNPJ <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cnpj"
            placeholder="00.000.000/0000-00"
            value={formData.cnpj}
            onChange={handleCNPJChange}
            maxLength={18}
            className={errors.cnpj ? "border-destructive" : ""}
            required
          />
          {errors.cnpj && (
            <p className="text-xs text-destructive">{errors.cnpj}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Inscrição Estadual */}
          <div className="space-y-2">
            <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
            <Input
              id="inscricao_estadual"
              placeholder="123.456.789.012"
              value={formData.inscricao_estadual}
              onChange={(e) =>
                handleChange("inscricao_estadual", e.target.value)
              }
              className={errors.inscricao_estadual ? "border-destructive" : ""}
            />
            {errors.inscricao_estadual && (
              <p className="text-xs text-destructive">
                {errors.inscricao_estadual}
              </p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={handlePhoneChange}
              maxLength={15}
              className={errors.telefone ? "border-destructive" : ""}
            />
            {errors.telefone && (
              <p className="text-xs text-destructive">{errors.telefone}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="contato@empresa.com.br"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Endereço */}
      <CamposEndereco
        values={formData.endereco}
        onChange={handleEnderecoChange}
        errors={Object.keys(errors)
          .filter((key) => key.startsWith("endereco."))
          .reduce((acc, key) => {
            const field = key.replace("endereco.", "");
            acc[field] = errors[key];
            return acc;
          }, {} as Record<string, string>)}
      />

      {/* Ações */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {empresa ? "Atualizar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}

