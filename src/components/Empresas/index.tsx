"use client";

import { useEmpresas } from "@/hooks/useEmpresas";
import { useToast } from "@/hooks/useToast";
import { Empresa } from "@/types/models";
import { useState } from "react";
import { ListaEmpresas } from "./ListaEmpresas";
import { ModalEmpresa } from "./ModalEmpresa";

/**
 * Componente principal de gerenciamento de empresas
 * Integra listagem, criação, edição e exclusão
 */
export function GerenciadorEmpresas() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [empresaParaEditar, setEmpresaParaEditar] = useState<Empresa | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Hook centralizado para CRUD
  const { createEmpresa, updateEmpresa } = useEmpresas();

  const handleNovaEmpresa = () => {
    setEmpresaParaEditar(null);
    setModalOpen(true);
  };

  const handleEditarEmpresa = (empresa: Empresa) => {
    setEmpresaParaEditar(empresa);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEmpresaParaEditar(null);
    // Força refresh da lista após criar/editar
    setRefreshKey((prev) => prev + 1);
  };

  const handleSubmitEmpresa = async (data: Partial<Empresa>) => {
    if (empresaParaEditar) {
      // Atualizar empresa existente
      await updateEmpresa(empresaParaEditar.id, data);
      toast({
        title: "Empresa atualizada!",
        description: `${data.nome} foi atualizada com sucesso.`,
        variant: "default",
      });
    } else {
      // Criar nova empresa
      await createEmpresa(data as Omit<Empresa, "id" | "created_at" | "updated_at">);
      toast({
        title: "Empresa criada!",
        description: `${data.nome} foi cadastrada com sucesso.`,
        variant: "default",
      });
    }
  };

  return (
    <>
      <ListaEmpresas
        key={refreshKey}
        onNovaEmpresa={handleNovaEmpresa}
        onEditarEmpresa={handleEditarEmpresa}
      />

      <ModalEmpresa
        open={modalOpen}
        onOpenChange={setModalOpen}
        empresa={empresaParaEditar}
        onSuccess={handleCloseModal}
        onSubmit={handleSubmitEmpresa}
      />
    </>
  );
}

// Exporta componentes individuais para uso isolado
export { FormEmpresa } from "./FormEmpresa";
export { ListaEmpresas } from "./ListaEmpresas";
export { ModalEmpresa } from "./ModalEmpresa";

