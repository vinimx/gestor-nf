"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoriaProdutoSchema, categoriaProdutoUpdateSchema } from "@/lib/validations/produtoSchema";
import { CategoriaProduto, CategoriaProdutoCreate, CategoriaProdutoUpdate } from "@/types/produto";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/useToast";
import { Loader2, Tag } from "lucide-react";

interface ModalCategoriaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria?: CategoriaProduto;
  onSuccess: () => void;
  onSubmit: (data: CategoriaProdutoCreate | CategoriaProdutoUpdate) => Promise<void>;
}

export function ModalCategoria({
  open,
  onOpenChange,
  categoria,
  onSuccess,
  onSubmit,
}: ModalCategoriaProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoriaProdutoCreate>({
    resolver: zodResolver(categoriaProdutoSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      ativo: true,
    },
  });

  // Reset form quando modal abrir/fechar
  React.useEffect(() => {
    if (open) {
      if (categoria) {
        reset(categoria);
      } else {
        reset();
      }
    }
  }, [open, categoria, reset]);

  const onSubmitForm = async (data: CategoriaProdutoCreate) => {
    try {
      setLoading(true);

      if (categoria) {
        await onSubmit({ ...data, id: categoria.id } as CategoriaProdutoUpdate);
      } else {
        await onSubmit(data);
      }

      toast({
        title: "Sucesso",
        description: `Categoria ${categoria ? 'atualizada' : 'criada'} com sucesso`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar categoria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {categoria ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
          <DialogDescription>
            {categoria ? 'Atualize as informações da categoria' : 'Crie uma nova categoria para organizar seus produtos'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Categoria *</Label>
            <Input
              id="nome"
              {...register('nome')}
              placeholder="Ex: Eletrônicos, Roupas, Alimentos"
            />
            {errors.nome && (
              <p className="text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              {...register('descricao')}
              placeholder="Descrição opcional da categoria"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {categoria ? 'Atualizar' : 'Criar'} Categoria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
