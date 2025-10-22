import LoginForm from "@/components/Auth/LoginForm";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="space-y-6" role="main" aria-labelledby="login-title">
      {/* Cabeçalho */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center mb-2">
          <div
            className="p-2 rounded-full"
            style={{
              background: "var(--cor-primaria)",
              opacity: 0.1,
            }}
          >
            <LogIn className="h-6 w-6" style={{ color: "var(--cor-primaria)" }} />
          </div>
        </div>
        <h2
          id="login-title"
          className="text-2xl font-bold text-gray-800"
        >
          Bem-vindo de volta
        </h2>
        <p className="text-gray-600">
          Entre com suas credenciais para acessar o sistema
        </p>
      </div>

      {/* Formulário */}
      <LoginForm />

      {/* Links de navegação */}
      <div className="space-y-3 text-center text-sm">
        <Link
          href="/recuperar-senha"
          className="block font-medium transition-colors hover:underline"
          style={{ color: "var(--cor-primaria)" }}
          aria-label="Recuperar senha esquecida"
        >
          Esqueci minha senha
        </Link>

        <div
          className="border-t pt-3"
          style={{ borderColor: "var(--cor-borda)" }}
        >
          <span className="text-gray-600">Não tem uma conta? </span>
          <Link
            href="/registro"
            className="font-semibold transition-colors hover:underline"
            style={{ color: "var(--cor-primaria)" }}
            aria-label="Criar nova conta"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}

