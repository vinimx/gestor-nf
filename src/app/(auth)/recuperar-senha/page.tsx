import RecoverPasswordForm from "@/components/Auth/RecoverPasswordForm";
import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";

export default function RecuperarSenhaPage() {
  return (
    <div className="space-y-6" role="main" aria-labelledby="recover-title">
      {/* Cabeçalho */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center mb-2">
          <div
            className="p-2 rounded-full"
            style={{
              background: "var(--accent)",
              opacity: 0.1,
            }}
          >
            <KeyRound className="h-6 w-6" style={{ color: "var(--accent)" }} />
          </div>
        </div>
        <h2
          id="recover-title"
          className="text-2xl font-bold text-gray-800"
        >
          Recuperar Senha
        </h2>
        <p className="text-gray-600">
          Informe seu email para receber instruções
        </p>
      </div>

      {/* Formulário */}
      <RecoverPasswordForm />

      {/* Link de navegação */}
      <div
        className="text-center text-sm border-t pt-3"
        style={{ borderColor: "var(--cor-borda)" }}
      >
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-medium transition-colors hover:underline"
          style={{ color: "var(--cor-primaria)" }}
          aria-label="Voltar para página de login"
        >
          <ArrowLeft className="h-3 w-3" />
          Voltar para login
        </Link>
      </div>
    </div>
  );
}

