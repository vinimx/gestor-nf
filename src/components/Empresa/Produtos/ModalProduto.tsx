"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { LoadingSpinnerInline } from "@/components/ui/loading-spinner";
import { Produto } from "@/types/produto";
import { TIPOS_PRODUTO, UNIDADES_MEDIDA } from "@/lib/validations/produtoSchema";

interface ModalProdutoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto?: Produto | null;
  onSuccess: () => void;
  onSubmit: (data: Partial<Produto>) => Promise<void>;
}

export function ModalProduto({
  open,
  onOpenChange,
  produto,
  onSuccess,
  onSubmit,
}: ModalProdutoProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    tipo: 'PRODUTO' as 'PRODUTO' | 'SERVICO',
    unidade_medida: 'UN',
    valor_unitario: 0,
    codigo_ncm: '',
    codigo_cfop: '',
    aliquota_icms: 0,
    aliquota_ipi: 0,
    aliquota_pis: 0,
    aliquota_cofins: 0,
    ativo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preencher formulário quando produto for fornecido (edição)
  useEffect(() => {
    if (produto) {
      setFormData({
        codigo: produto.codigo,
        nome: produto.nome,
        descricao: produto.descricao || '',
        tipo: produto.tipo,
        unidade_medida: produto.unidade_medida,
        valor_unitario: produto.valor_unitario,
        codigo_ncm: produto.codigo_ncm || '',
        codigo_cfop: produto.codigo_cfop || '',
        aliquota_icms: produto.aliquota_icms,
        aliquota_ipi: produto.aliquota_ipi,
        aliquota_pis: produto.aliquota_pis,
        aliquota_cofins: produto.aliquota_cofins,
        ativo: produto.ativo,
      });
    } else {
      // Reset form para novo produto
      setFormData({
        codigo: '',
        nome: '',
        descricao: '',
        tipo: 'PRODUTO',
        unidade_medida: 'UN',
        valor_unitario: 0,
        codigo_ncm: '',
        codigo_cfop: '',
        aliquota_icms: 0,
        aliquota_ipi: 0,
        aliquota_pis: 0,
        aliquota_cofins: 0,
        ativo: true,
      });
    }
    setErrors({});
  }, [produto, open]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'Código é obrigatório';
    }

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.unidade_medida.trim()) {
      newErrors.unidade_medida = 'Unidade de medida é obrigatória';
    }

    if (formData.valor_unitario <= 0) {
      newErrors.valor_unitario = 'Valor unitário deve ser maior que zero';
    }

    if (formData.codigo_ncm && formData.codigo_ncm.replace(/\D/g, '').length !== 8) {
      newErrors.codigo_ncm = 'NCM deve ter 8 dígitos';
    }

    if (formData.codigo_cfop && formData.codigo_cfop.replace(/\D/g, '').length !== 4) {
      newErrors.codigo_cfop = 'CFOP deve ter 4 dígitos';
    }

    if (formData.aliquota_icms < 0 || formData.aliquota_icms > 100) {
      newErrors.aliquota_icms = 'Alíquota ICMS deve estar entre 0 e 100';
    }

    if (formData.aliquota_ipi < 0 || formData.aliquota_ipi > 100) {
      newErrors.aliquota_ipi = 'Alíquota IPI deve estar entre 0 e 100';
    }

    if (formData.aliquota_pis < 0 || formData.aliquota_pis > 100) {
      newErrors.aliquota_pis = 'Alíquota PIS deve estar entre 0 e 100';
    }

    if (formData.aliquota_cofins < 0 || formData.aliquota_cofins > 100) {
      newErrors.aliquota_cofins = 'Alíquota COFINS deve estar entre 0 e 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        codigo_ncm: formData.codigo_ncm || undefined,
        codigo_cfop: formData.codigo_cfop || undefined,
        descricao: formData.descricao || undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {produto ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Código e Nome */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => handleInputChange('codigo', e.target.value)}
                placeholder="Código do produto"
                className={errors.codigo ? 'border-red-500' : ''}
              />
              {errors.codigo && (
                <p className="text-sm text-red-500 mt-1">{errors.codigo}</p>
              )}
            </div>

            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Nome do produto"
                className={errors.nome ? 'border-red-500' : ''}
              />
              {errors.nome && (
                <p className="text-sm text-red-500 mt-1">{errors.nome}</p>
              )}
            </div>
          </div>

          {/* Tipo e Unidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => handleInputChange('tipo', value as 'PRODUTO' | 'SERVICO')}
              >
                {TIPOS_PRODUTO.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="unidade_medida">Unidade de Medida *</Label>
              <Select
                value={formData.unidade_medida}
                onValueChange={(value) => handleInputChange('unidade_medida', value)}
              >
                {UNIDADES_MEDIDA.map((unidade) => (
                  <option key={unidade.value} value={unidade.value}>
                    {unidade.label}
                  </option>
                ))}
              </Select>
              {errors.unidade_medida && (
                <p className="text-sm text-red-500 mt-1">{errors.unidade_medida}</p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Descrição do produto"
            />
          </div>

          {/* Valor Unitário */}
          <div>
            <Label htmlFor="valor_unitario">Valor Unitário *</Label>
            <Input
              id="valor_unitario"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor_unitario}
              onChange={(e) => handleInputChange('valor_unitario', parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              className={errors.valor_unitario ? 'border-red-500' : ''}
            />
            {errors.valor_unitario && (
              <p className="text-sm text-red-500 mt-1">{errors.valor_unitario}</p>
            )}
          </div>

          {/* Códigos Fiscais */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Códigos Fiscais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo_ncm">NCM</Label>
                <Input
                  id="codigo_ncm"
                  value={formData.codigo_ncm}
                  onChange={(e) => handleInputChange('codigo_ncm', e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="00000000"
                  className={errors.codigo_ncm ? 'border-red-500' : ''}
                />
                {errors.codigo_ncm && (
                  <p className="text-sm text-red-500 mt-1">{errors.codigo_ncm}</p>
                )}
              </div>

              <div>
                <Label htmlFor="codigo_cfop">CFOP</Label>
                <Input
                  id="codigo_cfop"
                  value={formData.codigo_cfop}
                  onChange={(e) => handleInputChange('codigo_cfop', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="0000"
                  className={errors.codigo_cfop ? 'border-red-500' : ''}
                />
                {errors.codigo_cfop && (
                  <p className="text-sm text-red-500 mt-1">{errors.codigo_cfop}</p>
                )}
              </div>
            </div>
          </div>

          {/* Alíquotas de Impostos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Alíquotas de Impostos (%)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aliquota_icms">ICMS</Label>
                <Input
                  id="aliquota_icms"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.aliquota_icms}
                  onChange={(e) => handleInputChange('aliquota_icms', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className={errors.aliquota_icms ? 'border-red-500' : ''}
                />
                {errors.aliquota_icms && (
                  <p className="text-sm text-red-500 mt-1">{errors.aliquota_icms}</p>
                )}
              </div>

              <div>
                <Label htmlFor="aliquota_ipi">IPI</Label>
                <Input
                  id="aliquota_ipi"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.aliquota_ipi}
                  onChange={(e) => handleInputChange('aliquota_ipi', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className={errors.aliquota_ipi ? 'border-red-500' : ''}
                />
                {errors.aliquota_ipi && (
                  <p className="text-sm text-red-500 mt-1">{errors.aliquota_ipi}</p>
                )}
              </div>

              <div>
                <Label htmlFor="aliquota_pis">PIS</Label>
                <Input
                  id="aliquota_pis"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.aliquota_pis}
                  onChange={(e) => handleInputChange('aliquota_pis', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className={errors.aliquota_pis ? 'border-red-500' : ''}
                />
                {errors.aliquota_pis && (
                  <p className="text-sm text-red-500 mt-1">{errors.aliquota_pis}</p>
                )}
              </div>

              <div>
                <Label htmlFor="aliquota_cofins">COFINS</Label>
                <Input
                  id="aliquota_cofins"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.aliquota_cofins}
                  onChange={(e) => handleInputChange('aliquota_cofins', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className={errors.aliquota_cofins ? 'border-red-500' : ''}
                />
                {errors.aliquota_cofins && (
                  <p className="text-sm text-red-500 mt-1">{errors.aliquota_cofins}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="ativo">Status</Label>
            <Select
              value={formData.ativo ? 'true' : 'false'}
              onValueChange={(value) => handleInputChange('ativo', value === 'true')}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </Select>
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
                produto ? 'Atualizar' : 'Criar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
