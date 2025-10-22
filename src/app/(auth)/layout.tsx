import type { Metadata } from "next";
import Logo from "@/components/Auth/Logo";

export const metadata: Metadata = {
  title: "Autenticação - Gestor NF",
  description: "Sistema de gestão de notas fiscais",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background com gradiente e padrões */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg, var(--cor-primaria) 0%, var(--cor-secundaria) 100%),
            repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)
          `,
        }}
      >
        {/* Círculos decorativos animados */}
        <div
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: "var(--cor-secundaria)",
            animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: "var(--cor-primaria)",
            animation: "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Container principal */}
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Logo/Branding */}
        <div className="mb-8 fade-in">
          <Logo size="md" showText={true} />
        </div>

        {/* Card principal com formulário */}
        <div
          className="w-full max-w-md fade-in"
          style={{
            animation: "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both",
          }}
        >
          <div
            className="rounded-2xl p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-3xl"
            style={{
              background: "rgba(255, 255, 255, 0.98)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            }}
          >
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer
          className="mt-8 text-center fade-in"
          style={{
            animation: "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both",
          }}
        >
          <p className="text-sm text-white font-medium drop-shadow-md">
            © {new Date().getFullYear()} Gestor NF. Todos os direitos reservados.
          </p>
          <p className="text-xs text-white/90 mt-1 drop-shadow-sm">
            Desenvolvido por Marcos Rocha
          </p>
        </footer>
      </div>

      {/* Padrão de grid decorativo (apenas visual) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}
