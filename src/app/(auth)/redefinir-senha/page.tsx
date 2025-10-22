import ResetPasswordForm from "@/components/Auth/ResetPasswordForm";
import { Lock } from "lucide-react";

export default function RedefinirSenhaPage() {
  return (
    <div className="space-y-6" role="main" aria-labelledby="reset-title">
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
            <Lock className="h-6 w-6" style={{ color: "var(--accent)" }} />
          </div>
        </div>
        <h2
          id="reset-title"
          className="text-2xl font-bold text-gray-800"
        >
          Redefinir Senha
        </h2>
        <p className="text-gray-600">Digite sua nova senha abaixo</p>
      </div>

      {/* Formulário */}
      <ResetPasswordForm />
    </div>
  );
}

