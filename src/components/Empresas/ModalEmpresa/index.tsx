"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import { useEmpresas } from "@/hooks/useEmpresas";
import { Empresa } from "@/types/models";
import { useState } from "react";
import { FormEmpresa } from "../FormEmpresa";

interface ModalEmpresaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa?: Empresa | null;
  onSuccess?: () => void;
}

export function ModalEmpresa({
  open,
  onOpenChange,
  empresa,
  onSuccess,
}: ModalEmpresaProps) {
  const { toast } = useToast();
  const { createEmpresa, updateEmpresa } = useEmpresas();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: Partial<Empresa>) => {
    setSubmitting(true);
    try {
      if (empresa) {
        // Atualizar empresa existente
        await updateEmpresa(empresa.id, data);
      } else {
        // Criar nova empresa
        await createEmpresa(data as Omit<Empresa, "id" | "created_at" | "updated_at">);
      }

      toast({
        title: empresa ? "Empresa atualizada!" : "Empresa criada!",
        description: `${data.nome} foi ${empresa ? "atualizada" : "cadastrada"} com sucesso.`,
        variant: "default",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Erro já tratado no FormEmpresa
      console.error("Erro ao salvar empresa:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {empresa ? "Editar Empresa" : "Nova Empresa"}
          </DialogTitle>
          <DialogDescription>
            {empresa
              ? "Atualize os dados da empresa abaixo."
              : "Preencha os dados para cadastrar uma nova empresa."}
          </DialogDescription>
        </DialogHeader>

        <FormEmpresa
          empresa={empresa}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

