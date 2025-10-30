"use client";

import { useState, useEffect, useRef } from "react";
import MenuNav from "../MenuNav";
import {
  Building2,
  CalendarDays,
  FileText,
  ArrowRight,
  MoreVertical,
  Edit,
  Trash2,
  X,
  Plus,
  Search,
} from "lucide-react";
import { ConfiguracaoFocusNfe } from "../../Empresas/ConfiguracaoFocusNfe";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEmpresas } from "@/hooks/useEmpresas";
import { Empresa } from "@/types/models";

export default function PainelAdmin() {
  // Ref para evitar múltiplas buscas simultâneas
  const isFetchingCep = useRef(false);

  // Função para buscar endereço pelo CEP
  async function fetchEnderecoPorCep(cep: string) {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;
    if (isFetchingCep.current) return;
    isFetchingCep.current = true;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.erro) return;
      setFormData((prev: typeof formData) => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          uf: data.uf || "",
          cep: data.cep || prev.endereco.cep,
        },
      }));
    } finally {
      isFetchingCep.current = false;
    }
  }
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    "edit" | "delete" | "create" | null
  >(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    inscricao_estadual: "",
    endereco: {
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      cep: "",
    },
    telefone: "",
    email: "",
    ativo: true,
    // Configurações FOCUS NFE
    focus_nfe_token: "",
    focus_nfe_environment: "homologacao" as 'homologacao' | 'producao',
    focus_nfe_ativo: false,
  });

  const {
    empresas,
    loading,
    error,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
  } = useEmpresas({
    search: searchTerm || undefined,
    limit: 50,
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      cnpj: "",
      inscricao_estadual: "",
      endereco: {
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        uf: "",
        cep: "",
      },
      telefone: "",
      email: "",
      ativo: true,
      // Configurações FOCUS NFE
      focus_nfe_token: "",
      focus_nfe_environment: "homologacao" as 'homologacao' | 'producao',
      focus_nfe_ativo: false,
    });
  };

  const formatCnpjForDisplay = (cnpjRaw?: string) => {
    if (!cnpjRaw) return "";
    const digits = cnpjRaw.replace(/\D/g, "");
    if (digits.length !== 14) return cnpjRaw;
    return digits.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  };

  const maskCnpjInput = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8)
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12)
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
        5,
        8
      )}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
      5,
      8
    )}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  };

  const validatePhone = (phone?: string) => {
    if (!phone) return true;
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 11;
  };

  const validateCep = (cep?: string) => {
    if (!cep) return true;
    const digits = cep.replace(/\D/g, "");
    return digits.length === 8;
  };

  const handleCreate = () => {
    resetForm();
    setSelectedEmpresa(null);
    setModalType("create");
    setModalOpen(true);
  };

  const handleEdit = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);

    setFormData({
      nome: empresa.nome,
      cnpj: formatCnpjForDisplay(empresa.cnpj),
      inscricao_estadual: empresa.inscricao_estadual || "",
      endereco: {
        logradouro: empresa.endereco?.logradouro || "",
        numero: empresa.endereco?.numero || "",
        complemento: empresa.endereco?.complemento || "",
        bairro: empresa.endereco?.bairro || "",
        cidade: empresa.endereco?.cidade || "",
        uf: empresa.endereco?.uf || "",
        cep: empresa.endereco?.cep || "",
      },
      telefone: empresa.telefone || "",
      email: empresa.email || "",
      ativo: empresa.ativo ?? true,
      // Configurações FOCUS NFE
      focus_nfe_token: empresa.focus_nfe_token || "",
      focus_nfe_environment: empresa.focus_nfe_environment || "homologacao",
      focus_nfe_ativo: empresa.focus_nfe_ativo || false,
    });
    setModalType("edit");
    setModalOpen(true);
  };

  const handleDelete = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setModalType("delete");
    setModalOpen(true);
  };

  const handleSave = async () => {
    // Client-side validations
    setFormError(null);
    setFieldErrors({});
    const cleanCnpj = (formData.cnpj || "").replace(/\D/g, "");
    if (!formData.nome || formData.nome.trim().length === 0) {
      setFieldErrors((prev) => ({ ...prev, nome: "Nome é obrigatório" }));
      setFormError("Preencha os campos obrigatórios.");
      return;
    }
    if (!cleanCnpj || cleanCnpj.length !== 14) {
      setFieldErrors((prev) => ({ ...prev, cnpj: "CNPJ inválido" }));
      setFormError("CNPJ inválido. Informe 14 dígitos.");
      return;
    }
    if (!validatePhone(formData.telefone)) {
      setFieldErrors((prev) => ({ ...prev, telefone: "Telefone inválido" }));
      setFormError("Telefone inválido.");
      return;
    }
    if (!validateCep(formData.endereco.cep)) {
      setFieldErrors((prev) => ({ ...prev, cep: "CEP inválido" }));
      setFormError("CEP inválido.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (modalType === "create") {
        await createEmpresa({ ...formData, cnpj: cleanCnpj });
      } else if (modalType === "edit" && selectedEmpresa) {
        await updateEmpresa(selectedEmpresa.id, {
          ...formData,
          cnpj: cleanCnpj,
        });
      }
      setModalOpen(false);
      resetForm();
    } catch (err: any) {
      // Mostrar mensagem amigável vinda do backend quando possível
      const message = err?.message || "Erro ao salvar empresa";
      setFormError(message);

      // Se o backend retornou detalhes de validação (Zod issues), mapear para mensagens de campo
      try {
        const details = (err as any).details;
        if (Array.isArray(details)) {
          const newFieldErrors: { [k: string]: string } = {};
          for (const issue of details) {
            // Zod issue path pode ser algo como ['endereco', 'cep'] ou ['email'] — construir chave string
            const path = Array.isArray(issue.path)
              ? issue.path.join(".")
              : String(issue.path);
            // Mensagem pode estar em `message` ou em `issues` nested
            const msg =
              issue.message || (issue as any).error || "Campo inválido";
            // Prefer map keys como 'endereco.cep' para casar com `fieldErrors` usados na UI
            newFieldErrors[path] = msg;
          }
          setFieldErrors((prev) => ({ ...prev, ...newFieldErrors }));
        }
      } catch (mapErr) {
        // ignore mapping errors
      }

      console.error("Erro ao salvar empresa:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedEmpresa) {
        await deleteEmpresa(selectedEmpresa.id);
        setModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao excluir empresa:", error);
    }
  };

  return (
    <MenuNav>
      <main>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--cor-texto)" }}
              >
                Gestão de Empresas
              </h1>
              <p className="text-sm" style={{ color: "var(--cor-texto)" }}>
                Selecione uma empresa para gerenciar as notas fiscais
              </p>
            </div>
            <Button
              onClick={handleCreate}
              className="flex items-center gap-2"
              style={{
                background: "var(--cor-primaria)",
                color: "#fff",
              }}
            >
              <Plus className="h-4 w-4" />
              Nova Empresa
            </Button>
          </div>

          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p style={{ color: "var(--cor-texto)" }}>
                  Carregando empresas...
                </p>
              </div>
            </div>
          ) : empresas.length === 0 ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p style={{ color: "var(--cor-texto)" }}>
                  {searchTerm
                    ? "Nenhuma empresa encontrada para a busca."
                    : "Nenhuma empresa cadastrada."}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={handleCreate}
                    className="mt-4"
                    style={{
                      background: "var(--cor-primaria)",
                      color: "#fff",
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar primeira empresa
                  </Button>
                )}
              </div>
            </div>
          ) : (
            empresas.map((empresa, idx) => (
              <div
                className="card shadow border group transition-transform hover:scale-[1.025] hover:shadow-lg relative"
                key={idx}
                style={{
                  background: "var(--background-color)",
                  borderColor: "var(--cor-borda)",
                }}
              >
                <div
                  className="card-header font-semibold flex items-center justify-between"
                  style={{ color: "var(--cor-primaria)" }}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <span className="truncate">{empresa.nome}</span>
                  </div>

                  {/* Menu de 3 pontos */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity"
                        style={{ color: "var(--cor-texto)" }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-40 z-50"
                      style={{
                        background: "var(--background-color)",
                        border: "1px solid var(--cor-borda)",
                        boxShadow: "var(--sombra-suave)",
                      }}
                    >
                      <DropdownMenuItem
                        onClick={() => handleEdit(empresa)}
                        className="flex items-center gap-2 cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(empresa)}
                        className="flex items-center gap-2 cursor-pointer px-3 py-2 text-sm text-red-600 hover:bg-red-50 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="card-body">
                  <div
                    className="mb-2 text-sm flex items-center gap-2"
                    style={{ color: "var(--cor-texto)" }}
                  >
                    <FileText className="h-4 w-4 opacity-70" />
                    <strong>CNPJ:</strong> {empresa.cnpj}
                  </div>
                  {empresa.email && (
                    <div
                      className="mb-2 text-sm flex items-center gap-2"
                      style={{ color: "var(--cor-texto)" }}
                    >
                      <CalendarDays className="h-4 w-4 opacity-70" />
                      <strong>Email:</strong> {empresa.email}
                    </div>
                  )}
                  {empresa.telefone && (
                    <div
                      className="mb-4 text-sm flex items-center gap-2"
                      style={{ color: "var(--cor-texto)" }}
                    >
                      <FileText className="h-4 w-4 opacity-70" />
                      <strong>Telefone:</strong> {empresa.telefone}
                    </div>
                  )}
                  <a
                    href={`/empresa/${empresa.id}/dashboard`}
                    className="btn w-full flex items-center justify-center gap-2 font-semibold transition-colors"
                    style={{
                      background: "var(--cor-primaria)",
                      border: "none",
                      color: "#fff",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#1256a3";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "var(--cor-primaria)";
                    }}
                  >
                    Entrar <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      {/* Modal de Edição/Exclusão */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            style={{
              background: "var(--background-color)",
              border: "1px solid var(--cor-borda)",
            }}
          >
            {/* Header do Modal */}
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: "var(--cor-borda)" }}
            >
              <h2
                className="text-xl font-semibold"
                style={{ color: "var(--cor-texto)" }}
              >
                {modalType === "create"
                  ? "Nova Empresa"
                  : modalType === "edit"
                  ? "Editar Empresa"
                  : "Excluir Empresa"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              {modalType !== "delete" ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--cor-texto)" }}
                      >
                        Nome da Empresa *
                      </label>
                      <Input
                        value={formData.nome}
                        onChange={(e) =>
                          setFormData({ ...formData, nome: e.target.value })
                        }
                        placeholder="Digite o nome da empresa"
                        required
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--cor-texto)" }}
                      >
                        CNPJ *
                      </label>
                      <Input
                        value={formData.cnpj}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cnpj: maskCnpjInput(e.target.value),
                          })
                        }
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                        required
                      />
                      {fieldErrors.cnpj && (
                        <p className="text-sm text-red-600 mt-1">
                          {fieldErrors.cnpj}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--cor-texto)" }}
                    >
                      Inscrição Estadual
                    </label>
                    <Input
                      value={formData.inscricao_estadual}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          inscricao_estadual: e.target.value,
                        })
                      }
                      placeholder="Digite a inscrição estadual"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--cor-texto)" }}
                      >
                        Email
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="email@empresa.com"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--cor-texto)" }}
                      >
                        Telefone
                      </label>
                      <Input
                        value={formData.telefone}
                        onChange={(e) =>
                          setFormData({ ...formData, telefone: e.target.value })
                        }
                        placeholder="(11) 99999-9999"
                      />
                      {fieldErrors.telefone && (
                        <p className="text-sm text-red-600 mt-1">
                          {fieldErrors.telefone}
                        </p>
                      )}
                    </div>
                  </div>


                  <div className="border-t pt-4">
                    <h3
                      className="text-lg font-medium mb-3"
                      style={{ color: "var(--cor-texto)" }}
                    >
                      Endereço
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--cor-texto)" }}
                        >
                          Logradouro
                        </label>
                        <Input
                          value={formData.endereco.logradouro}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endereco: {
                                ...formData.endereco,
                                logradouro: e.target.value,
                              },
                            })
                          }
                          placeholder="Rua, Avenida, etc."
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--cor-texto)" }}
                        >
                          Número
                        </label>
                        <Input
                          value={formData.endereco.numero}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endereco: {
                                ...formData.endereco,
                                numero: e.target.value,
                              },
                            })
                          }
                          placeholder="123"
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--cor-texto)" }}
                        >
                          Complemento
                        </label>
                        <Input
                          value={formData.endereco.complemento}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endereco: {
                                ...formData.endereco,
                                complemento: e.target.value,
                              },
                            })
                          }
                          placeholder="Sala 101"
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--cor-texto)" }}
                        >
                          Bairro
                        </label>
                        <Input
                          value={formData.endereco.bairro}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endereco: {
                                ...formData.endereco,
                                bairro: e.target.value,
                              },
                            })
                          }
                          placeholder="Centro"
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--cor-texto)" }}
                        >
                          Cidade
                        </label>
                        <Input
                          value={formData.endereco.cidade}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endereco: {
                                ...formData.endereco,
                                cidade: e.target.value,
                              },
                            })
                          }
                          placeholder="São Paulo"
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--cor-texto)" }}
                        >
                          UF
                        </label>
                        <Input
                          value={formData.endereco.uf}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endereco: {
                                ...formData.endereco,
                                uf: e.target.value.toUpperCase(),
                              },
                            })
                          }
                          placeholder="SP"
                          maxLength={2}
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--cor-texto)" }}
                        >
                          CEP
                        </label>
                        <Input
                          value={formData.endereco.cep}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endereco: {
                                ...formData.endereco,
                                cep: e.target.value,
                              },
                            })
                          }
                          onBlur={(e) => fetchEnderecoPorCep(e.target.value)}
                          placeholder="00000-000"
                          maxLength={9}
                        />
                        {fieldErrors.cep && (
                          <p className="text-sm text-red-600 mt-1">
                            {fieldErrors.cep}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Configuração Token Sefaz */}
                  <div className="border-t pt-6">
                    <ConfiguracaoFocusNfe
                      empresaId={selectedEmpresa?.id}
                      initialData={{
                        focus_nfe_token: formData.focus_nfe_token,
                        focus_nfe_environment: formData.focus_nfe_environment,
                        focus_nfe_ativo: formData.focus_nfe_ativo,
                      }}
                      onSave={async (focusData) => {
                        // Atualiza o estado local
                        setFormData(prev => ({
                          ...prev,
                          focus_nfe_token: focusData.focus_nfe_token,
                          focus_nfe_environment: focusData.focus_nfe_environment,
                          focus_nfe_ativo: focusData.focus_nfe_ativo,
                        }));
                      }}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-4">
                    <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <p style={{ color: "var(--cor-texto)" }}>
                      Tem certeza que deseja excluir a empresa
                    </p>
                    <p
                      className="font-semibold"
                      style={{ color: "var(--cor-primaria)" }}
                    >
                      {selectedEmpresa?.nome}?
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Esta ação não pode ser desfeita.
                  </p>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div
              className="flex justify-end gap-3 p-6 border-t"
              style={{ borderColor: "var(--cor-borda)" }}
            >
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              {formError && (
                <div className="text-left text-sm text-red-600 mr-auto">
                  {formError}
                </div>
              )}
              <Button
                onClick={
                  modalType === "delete" ? handleConfirmDelete : handleSave
                }
                disabled={isSubmitting}
                style={{
                  background:
                    modalType === "delete" ? "#e53935" : "var(--cor-primaria)",
                  color: "#fff",
                }}
              >
                {isSubmitting
                  ? "Aguarde..."
                  : modalType === "create"
                  ? "Criar"
                  : modalType === "edit"
                  ? "Salvar"
                  : "Excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MenuNav>
  );
}
