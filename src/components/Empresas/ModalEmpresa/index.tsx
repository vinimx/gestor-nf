"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Empresa } from "@/types/models";
import { FormEmpresa } from "../FormEmpresa";

interface ModalEmpresaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa?: Empresa | null;
  onSuccess?: () => void;
  onSubmit: (data: Partial<Empresa>) => Promise<void>;
}

export function ModalEmpresa({
  open,
  onOpenChange,
  empresa,
  onSuccess,
  onSubmit,
}: ModalEmpresaProps) {
  const handleSubmit = async (data: Partial<Empresa>) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Erro já tratado no hook/FormEmpresa
      console.error("Erro ao salvar empresa:", error);
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

