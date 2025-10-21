"use client";

import { Empresa } from "@/types/models";
import { useState } from "react";
import { ListaEmpresas } from "./ListaEmpresas";
import { ModalEmpresa } from "./ModalEmpresa";

/**
 * Componente principal de gerenciamento de empresas
 * Integra listagem, criação, edição e exclusão
 */
export function GerenciadorEmpresas() {
  const [modalOpen, setModalOpen] = useState(false);
  const [empresaParaEditar, setEmpresaParaEditar] = useState<Empresa | null>(
    null
  );

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
  };

  return (
    <>
      <ListaEmpresas
        onNovaEmpresa={handleNovaEmpresa}
        onEditarEmpresa={handleEditarEmpresa}
      />

      <ModalEmpresa
        open={modalOpen}
        onOpenChange={setModalOpen}
        empresa={empresaParaEditar}
        onSuccess={handleCloseModal}
      />
    </>
  );
}

// Exporta componentes individuais para uso isolado
export { FormEmpresa } from "./FormEmpresa";
export { ListaEmpresas } from "./ListaEmpresas";
export { ModalEmpresa } from "./ModalEmpresa";

