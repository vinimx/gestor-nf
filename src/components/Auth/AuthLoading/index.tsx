"use client";

import { Loader2 } from "lucide-react";

interface AuthLoadingProps {
  message?: string;
}

/**
 * Componente de loading exibido durante verificação de autenticação
 */
export default function AuthLoading({ message = "Carregando..." }: AuthLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600">
      <div className="text-center space-y-6">
        {/* Logo/Ícone */}
        <div className="flex justify-center">
          <div
            className="p-6 rounded-full animate-pulse"
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Loader2
              className="h-12 w-12 text-white animate-spin"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Texto */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">
            Gestor NF
          </h2>
          <p className="text-white/90 text-sm drop-shadow-md">{message}</p>
        </div>

        {/* Barra de progresso animada */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full animate-pulse"
              style={{
                animation: "loading 1.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 75%;
            margin-left: 12.5%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
      `}</style>
    </div>
  );
}

