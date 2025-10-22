"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

/**
 * Componente para lidar com erros de autenticação/autorização
 * vindos do middleware via query parameters
 */
export default function AuthErrorHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const error = searchParams.get("error");

    if (!error) return;

    // Mapear erros para mensagens amigáveis
    const errorMessages: Record<string, { title: string; description: string }> = {
      unauthorized: {
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta página.",
      },
      profile_not_found: {
        title: "Erro de Autenticação",
        description: "Não foi possível verificar suas permissões. Tente fazer login novamente.",
      },
      verification_failed: {
        title: "Erro de Verificação",
        description: "Ocorreu um erro ao verificar suas credenciais. Tente novamente.",
      },
      session_expired: {
        title: "Sessão Expirada",
        description: "Sua sessão expirou. Por favor, faça login novamente.",
      },
    };

    const errorData = errorMessages[error];

    if (errorData) {
      toast({
        title: errorData.title,
        description: errorData.description,
        variant: "destructive",
      });

      // Limpar o parâmetro de erro da URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("error");
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [searchParams, router, toast]);

  return null; // Este componente não renderiza nada
}

