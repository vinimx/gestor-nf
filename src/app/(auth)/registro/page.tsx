import RegisterForm from "@/components/Auth/RegisterForm";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="space-y-6" role="main" aria-labelledby="register-title">
      {/* Cabeçalho */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center mb-2">
          <div
            className="p-2 rounded-full"
            style={{
              background: "var(--cor-secundaria)",
              opacity: 0.1,
            }}
          >
            <UserPlus
              className="h-6 w-6"
              style={{ color: "var(--cor-secundaria)" }}
            />
          </div>
        </div>
        <h2
          id="register-title"
          className="text-2xl font-bold text-gray-800"
        >
          Criar Conta
        </h2>
        <p className="text-gray-600">
          Preencha os dados para criar sua conta
        </p>
      </div>

      {/* Formulário */}
      <RegisterForm />

      {/* Link de navegação */}
      <div
        className="text-center text-sm border-t pt-3"
        style={{ borderColor: "var(--cor-borda)" }}
      >
        <span className="text-gray-600">Já tem uma conta? </span>
        <Link
          href="/login"
          className="font-semibold transition-colors hover:underline"
          style={{ color: "var(--cor-primaria)" }}
          aria-label="Fazer login em conta existente"
        >
          Fazer login
        </Link>
      </div>
    </div>
  );
}

