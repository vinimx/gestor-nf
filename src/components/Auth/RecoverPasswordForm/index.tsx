"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { Loader2, AlertCircle, CheckCircle2, Mail } from "lucide-react";

interface RecoverPasswordFormProps {
  onSuccess?: () => void;
}

export default function RecoverPasswordForm({
  onSuccess,
}: RecoverPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Auto-foco no campo de email ao montar
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const validateEmail = (value: string): string | undefined => {
    if (!value) {
      return "Email é obrigatório";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Email inválido";
    }
    return undefined;
  };

  const handleEmailBlur = () => {
    setTouched(true);
    const errorMsg = validateEmail(email);
    setError(errorMsg || "");
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched) {
      const errorMsg = validateEmail(value);
      setError(errorMsg || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar email
    setTouched(true);
    const errorMsg = validateEmail(email);
    setError(errorMsg || "");
    
    if (errorMsg) {
      emailRef.current?.focus();
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(email);
      
      // Marcar como enviado
      setEmailSent(true);
      
      toast({
        title: "Email enviado com sucesso!",
        description: "Se o email existir, você receberá instruções para redefinir sua senha.",
      });

      // Redirecionar após 5 segundos
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/login");
        }
      }, 5000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: error.message || "Tente novamente mais tarde",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Se email foi enviado, mostrar mensagem de sucesso
  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        {/* Ícone de sucesso */}
        <div className="flex justify-center">
          <div
            className="p-4 rounded-full"
            style={{
              background: "var(--cor-secundaria)",
              opacity: 0.1,
            }}
          >
            <Mail
              className="h-12 w-12"
              style={{ color: "var(--cor-secundaria)" }}
            />
          </div>
        </div>

        {/* Mensagem */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-800">
            Email Enviado!
          </h3>
          <p className="text-gray-600 text-sm">
            Se existe uma conta com o email <strong>{email}</strong>, você
            receberá as instruções para redefinir sua senha.
          </p>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg text-left">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">
                O que fazer agora?
              </p>
              <ul className="text-blue-800 space-y-1 list-disc list-inside">
                <li>Verifique sua caixa de entrada</li>
                <li>Procure também no spam/lixo eletrônico</li>
                <li>O link expira em 1 hora</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botão de voltar */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => router.push("/login")}
        >
          Voltar para Login
        </Button>

        <p className="text-xs text-gray-500">
          Redirecionando para login em 5 segundos...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <div className="relative">
          <Input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={handleEmailBlur}
            placeholder="seu@email.com"
            disabled={isLoading}
            className={`${
              error && touched
                ? "border-red-500 focus:ring-red-500"
                : touched && !error
                ? "border-green-500 focus:ring-green-500"
                : ""
            }`}
            aria-invalid={error && touched ? "true" : "false"}
            aria-describedby={error && touched ? "email-error" : undefined}
          />
          {/* Ícone de status */}
          {touched && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {error ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
          )}
        </div>
        {error && touched && (
          <p
            id="email-error"
            className="text-sm text-red-600 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Enviaremos um email com instruções para redefinir sua senha. O link
            será válido por 1 hora.
          </p>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full mt-6"
        disabled={isLoading}
        style={{
          background: "var(--cor-primaria)",
          color: "#fff",
        }}
        aria-label="Enviar email de recuperação"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Enviando...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
            Enviar Email de Recuperação
          </>
        )}
      </Button>
    </form>
  );
}

