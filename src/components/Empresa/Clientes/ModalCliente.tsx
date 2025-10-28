"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinnerInline } from "@/components/ui/loading-spinner";
import { Cliente } from "@/types/cliente";
import { 
  maskCPF, 
  maskCNPJ, 
  maskTelefone, 
  maskCEP,
  removeMaskCPF,
  removeMaskCNPJ,
  removeMaskTelefone,
  removeMaskCEP,
  detectarTipoCPFCNPJ,
} from "@/lib/masks/clienteMasks";
import { validarCPFCNPJ } from "@/lib/validations/clienteSchema";
import { 
  validarDocumentoCompleto, 
  obterDadosCnpjCompleto,
  ValidationResult 
} from "@/lib/validations/cpfCnpjValidationService";

interface ModalClienteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente | null;
  onSuccess: () => void;
  onSubmit: (data: Partial<Cliente>) => Promise<void>;
}

export function ModalCliente({
  open,
  onOpenChange,
  cliente,
  onSuccess,
  onSubmit,
}: ModalClienteProps) {
  const [loading, setLoading] = useState(false);
  const [validatingDocument, setValidatingDocument] = useState(false);
  const [documentValidation, setDocumentValidation] = useState<ValidationResult | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'FISICA' as 'FISICA' | 'JURIDICA',
    nome_razao_social: '',
    cpf_cnpj: '',
    inscricao_estadual: '',
    email: '',
    telefone: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: '',
    },
    ativo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preencher formulário quando cliente for fornecido (edição)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    if (cliente) {
      setFormData({
        tipo: cliente.tipo,
        nome_razao_social: cliente.nome_razao_social,
        cpf_cnpj: cliente.cpf_cnpj,
        inscricao_estadual: cliente.inscricao_estadual || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        endereco: {
          ...cliente.endereco,
          complemento: cliente.endereco.complemento || '',
        },
        ativo: cliente.ativo,
      });
    } else {
      // Reset form para novo cliente
      setFormData({
        tipo: 'FISICA',
        nome_razao_social: '',
        cpf_cnpj: '',
        inscricao_estadual: '',
        email: '',
        telefone: '',
        endereco: {
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          uf: '',
          cep: '',
        },
        ativo: true,
      });
    }
    setErrors({});
  }, [cliente, open, isMounted]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleBooleanChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleEnderecoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        [field]: value,
      },
    }));
    
    // Limpar erro do campo
    if (errors[`endereco.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`endereco.${field}`]: '',
      }));
    }
  };

  const handleCPFCNPJChange = (value: string) => {
    const tipo = detectarTipoCPFCNPJ(value);
    setFormData(prev => ({
      ...prev,
      tipo,
      cpf_cnpj: value,
    }));
    
    // Limpar erro do campo
    if (errors.cpf_cnpj) {
      setErrors(prev => ({
        ...prev,
        cpf_cnpj: '',
      }));
    }
  };

  const handleTipoChange = (tipo: 'FISICA' | 'JURIDICA') => {
    setFormData(prev => ({
      ...prev,
      tipo,
      cpf_cnpj: '', // Limpar CPF/CNPJ ao mudar tipo
    }));
  };

  const buscarCEP = async (cep: string) => {
    const cepLimpo = removeMaskCEP(cep);
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            uf: data.uf || '',
          },
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome_razao_social.trim()) {
      newErrors.nome_razao_social = 'Nome/Razão Social é obrigatório';
    }

    if (!formData.cpf_cnpj.trim()) {
      newErrors.cpf_cnpj = 'CPF/CNPJ é obrigatório';
    } else {
      const cpfCnpjLimpo = formData.tipo === 'FISICA' 
        ? removeMaskCPF(formData.cpf_cnpj)
        : removeMaskCNPJ(formData.cpf_cnpj);
      
      if (!validarCPFCNPJ(cpfCnpjLimpo, formData.tipo)) {
        newErrors.cpf_cnpj = `${formData.tipo === 'FISICA' ? 'CPF' : 'CNPJ'} inválido`;
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.endereco.logradouro.trim()) {
      newErrors['endereco.logradouro'] = 'Logradouro é obrigatório';
    }

    if (!formData.endereco.numero.trim()) {
      newErrors['endereco.numero'] = 'Número é obrigatório';
    }

    if (!formData.endereco.bairro.trim()) {
      newErrors['endereco.bairro'] = 'Bairro é obrigatório';
    }

    if (!formData.endereco.cidade.trim()) {
      newErrors['endereco.cidade'] = 'Cidade é obrigatória';
    }

    if (!formData.endereco.uf.trim()) {
      newErrors['endereco.uf'] = 'UF é obrigatório';
    }

    if (!formData.endereco.cep.trim()) {
      newErrors['endereco.cep'] = 'CEP é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para validar documento com API FOCUS NFE
  const handleValidateDocument = async () => {
    if (!formData.cpf_cnpj.trim()) return;

    setValidatingDocument(true);
    setDocumentValidation(null);

    try {
      const cpfCnpjLimpo = formData.tipo === 'FISICA' 
        ? removeMaskCPF(formData.cpf_cnpj)
        : removeMaskCNPJ(formData.cpf_cnpj);

      const validation = await validarDocumentoCompleto(cpfCnpjLimpo, formData.tipo);
      setDocumentValidation(validation);

      // Se for CNPJ e válido, tentar obter dados para preenchimento automático
      if (formData.tipo === 'JURIDICA' && validation.valido && validation.dados) {
        try {
          const dadosCnpj = await obterDadosCnpjCompleto(cpfCnpjLimpo);
          if (dadosCnpj.success && dadosCnpj.data) {
            // Preencher automaticamente os dados da empresa
            setFormData(prev => ({
              ...prev,
              nome_razao_social: dadosCnpj.data.razao_social,
              endereco: {
                ...prev.endereco,
                logradouro: dadosCnpj.data.endereco.logradouro,
                numero: dadosCnpj.data.endereco.numero,
                complemento: dadosCnpj.data.endereco.complemento || '',
                bairro: dadosCnpj.data.endereco.bairro,
                cidade: dadosCnpj.data.endereco.cidade,
                uf: dadosCnpj.data.endereco.uf,
                cep: dadosCnpj.data.endereco.cep,
              }
            }));
          }
        } catch (error) {
          console.warn('Erro ao obter dados do CNPJ:', error);
        }
      }
    } catch (error) {
      console.error('Erro na validação do documento:', error);
      setDocumentValidation({
        valido: false,
        erro: 'Erro na validação do documento',
        fonte: 'local'
      });
    } finally {
      setValidatingDocument(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Preparar dados para envio
      const submitData = {
        ...formData,
        cpf_cnpj: formData.tipo === 'FISICA' 
          ? removeMaskCPF(formData.cpf_cnpj)
          : removeMaskCNPJ(formData.cpf_cnpj),
        telefone: removeMaskTelefone(formData.telefone),
        endereco: {
          ...formData.endereco,
          cep: removeMaskCEP(formData.endereco.cep),
        },
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  // Evitar hidratação mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {cliente ? 'Atualize as informações do cliente' : 'Preencha os dados do novo cliente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo e Nome */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <select
                id="tipo"
                value={formData.tipo}
                onChange={(e) => handleTipoChange(e.target.value as 'FISICA' | 'JURIDICA')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="FISICA">Pessoa Física</option>
                <option value="JURIDICA">Pessoa Jurídica</option>
              </select>
            </div>

            <div>
              <Label htmlFor="nome_razao_social">
                {formData.tipo === 'FISICA' ? 'Nome *' : 'Razão Social *'}
              </Label>
              <Input
                id="nome_razao_social"
                value={formData.nome_razao_social}
                onChange={(e) => handleInputChange('nome_razao_social', e.target.value)}
                placeholder={formData.tipo === 'FISICA' ? 'Nome completo' : 'Razão social'}
                className={errors.nome_razao_social ? 'border-red-500' : ''}
              />
              {errors.nome_razao_social && (
                <p className="text-sm text-red-500 mt-1">{errors.nome_razao_social}</p>
              )}
            </div>
          </div>

          {/* CPF/CNPJ e Inscrição Estadual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cpf_cnpj">
                {formData.tipo === 'FISICA' ? 'CPF *' : 'CNPJ *'}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="cpf_cnpj"
                  value={formData.cpf_cnpj}
                  onChange={(e) => {
                    const masked = formData.tipo === 'FISICA' 
                      ? maskCPF(e.target.value)
                      : maskCNPJ(e.target.value);
                    handleCPFCNPJChange(masked);
                  }}
                  placeholder={formData.tipo === 'FISICA' ? '000.000.000-00' : '00.000.000/0000-00'}
                  className={`${errors.cpf_cnpj ? 'border-red-500' : ''} ${
                    documentValidation?.valido ? 'border-green-500' : 
                    documentValidation?.valido === false ? 'border-red-500' : ''
                  }`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleValidateDocument}
                  disabled={!formData.cpf_cnpj.trim() || validatingDocument}
                  className="px-3 whitespace-nowrap"
                >
                  {validatingDocument ? (
                    <LoadingSpinnerInline />
                  ) : (
                    'Validar'
                  )}
                </Button>
              </div>
              
              {/* Feedback de validação */}
              {documentValidation && (
                <div className="mt-2">
                  {documentValidation.valido ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>
                        {formData.tipo === 'FISICA' ? 'CPF' : 'CNPJ'} válido
                        {documentValidation.ativo !== undefined && (
                          documentValidation.ativo ? ' e ativo' : ' mas inativo'
                        )}
                        {documentValidation.fonte === 'api' && ' (via Receita Federal)'}
                        {documentValidation.fonte === 'hibrido' && ' (validação local)'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>
                        {documentValidation.erro || `${formData.tipo === 'FISICA' ? 'CPF' : 'CNPJ'} inválido`}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {errors.cpf_cnpj && (
                <p className="text-sm text-red-500 mt-1">{errors.cpf_cnpj}</p>
              )}
            </div>

            <div>
              <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
              <Input
                id="inscricao_estadual"
                value={formData.inscricao_estadual}
                onChange={(e) => handleInputChange('inscricao_estadual', e.target.value)}
                placeholder="Inscrição estadual"
              />
            </div>
          </div>

          {/* Email e Telefone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@exemplo.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', maskTelefone(e.target.value))}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Endereço</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="logradouro">Logradouro *</Label>
                <Input
                  id="logradouro"
                  value={formData.endereco.logradouro}
                  onChange={(e) => handleEnderecoChange('logradouro', e.target.value)}
                  placeholder="Rua, Avenida, etc."
                  className={errors['endereco.logradouro'] ? 'border-red-500' : ''}
                />
                {errors['endereco.logradouro'] && (
                  <p className="text-sm text-red-500 mt-1">{errors['endereco.logradouro']}</p>
                )}
              </div>

              <div>
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  value={formData.endereco.numero}
                  onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                  placeholder="123"
                  className={errors['endereco.numero'] ? 'border-red-500' : ''}
                />
                {errors['endereco.numero'] && (
                  <p className="text-sm text-red-500 mt-1">{errors['endereco.numero']}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={formData.endereco.complemento}
                onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                placeholder="Apartamento, sala, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  value={formData.endereco.bairro}
                  onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                  placeholder="Bairro"
                  className={errors['endereco.bairro'] ? 'border-red-500' : ''}
                />
                {errors['endereco.bairro'] && (
                  <p className="text-sm text-red-500 mt-1">{errors['endereco.bairro']}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  value={formData.endereco.cidade}
                  onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                  placeholder="Cidade"
                  className={errors['endereco.cidade'] ? 'border-red-500' : ''}
                />
                {errors['endereco.cidade'] && (
                  <p className="text-sm text-red-500 mt-1">{errors['endereco.cidade']}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="uf">UF *</Label>
                <Input
                  id="uf"
                  value={formData.endereco.uf}
                  onChange={(e) => handleEnderecoChange('uf', e.target.value.toUpperCase())}
                  placeholder="SP"
                  maxLength={2}
                  className={errors['endereco.uf'] ? 'border-red-500' : ''}
                />
                {errors['endereco.uf'] && (
                  <p className="text-sm text-red-500 mt-1">{errors['endereco.uf']}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cep">CEP *</Label>
                <Input
                  id="cep"
                  value={formData.endereco.cep}
                  onChange={(e) => {
                    const masked = maskCEP(e.target.value);
                    handleEnderecoChange('cep', masked);
                    if (masked.length === 9) { // CEP completo
                      buscarCEP(masked);
                    }
                  }}
                  placeholder="00000-000"
                  className={errors['endereco.cep'] ? 'border-red-500' : ''}
                />
                {errors['endereco.cep'] && (
                  <p className="text-sm text-red-500 mt-1">{errors['endereco.cep']}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="ativo">Status</Label>
            <select
              id="ativo"
              value={formData.ativo ? 'true' : 'false'}
              onChange={(e) => handleBooleanChange('ativo', e.target.value === 'true')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              style={{
                background: "var(--cor-primaria)",
                color: "#fff",
              }}
            >
              {loading ? (
                <>
                  <LoadingSpinnerInline />
                  Salvando...
                </>
              ) : (
                cliente ? 'Atualizar' : 'Criar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
