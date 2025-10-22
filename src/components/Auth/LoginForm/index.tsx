"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  
  const { signIn, loading, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-foco no campo de email ao montar
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (user && !loading) {
      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
    }
  }, [user, loading, router, searchParams]);

  // Validação individual de campo
  const validateEmail = (value: string): string | undefined => {
    if (!value) {
      return "Email é obrigatório";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Email inválido";
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) {
      return "Senha é obrigatória";
    }
    if (value.length < 6) {
      return "Senha deve ter pelo menos 6 caracteres";
    }
    return undefined;
  };

  // Validação completa do formulário
  const validateForm = (): boolean => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setErrors({
      email: emailError,
      password: passwordError,
    });

    setTouched({
      email: true,
      password: true,
    });
    
    return !emailError && !passwordError;
  };

  // Handlers para validação em tempo real (onBlur)
  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    const error = validateEmail(email);
    setErrors((prev) => ({ ...prev, email: error }));
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    const error = validatePassword(password);
    setErrors((prev) => ({ ...prev, password: error }));
  };

  // Limpar erro ao digitar
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      const error = validateEmail(value);
      setErrors((prev) => ({ ...prev, email: error }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      const error = validatePassword(value);
      setErrors((prev) => ({ ...prev, password: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário
    if (!validateForm()) {
      // Focar no primeiro campo com erro
      if (errors.email) {
        emailRef.current?.focus();
      } else if (errors.password) {
        passwordRef.current?.focus();
      }
      return;
    }
    
    try {
      await signIn(email, password);
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando...",
      });
      
      // Redirecionar baseado no parâmetro ou callback
      if (onSuccess) {
        onSuccess();
      } else {
        const redirect = searchParams.get("redirect") || "/";
        router.push(redirect);
      }
    } catch (error: any) {
      // Focar no campo de senha para nova tentativa
      passwordRef.current?.focus();
      passwordRef.current?.select();
      
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message || "Email ou senha incorretos. Tente novamente.",
      });
    }
  };

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
            disabled={loading}
            className={`${
              errors.email && touched.email
                ? "border-red-500 focus:ring-red-500"
                : touched.email && !errors.email
                ? "border-green-500 focus:ring-green-500"
                : ""
            }`}
            aria-invalid={errors.email && touched.email ? "true" : "false"}
            aria-describedby={errors.email && touched.email ? "email-error" : undefined}
          />
          {/* Ícone de status */}
          {touched.email && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {errors.email ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
          )}
        </div>
        {errors.email && touched.email && (
          <p id="email-error" className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.email}
          </p>
        )}
      </div>

      {/* Senha */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Senha
        </Label>
        <div className="relative">
          <Input
            ref={passwordRef}
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            onBlur={handlePasswordBlur}
            placeholder="••••••••"
            disabled={loading}
            className={`pr-20 ${
              errors.password && touched.password
                ? "border-red-500 focus:ring-red-500"
                : touched.password && !errors.password
                ? "border-green-500 focus:ring-green-500"
                : ""
            }`}
            aria-invalid={errors.password && touched.password ? "true" : "false"}
            aria-describedby={errors.password && touched.password ? "password-error" : undefined}
          />
          {/* Botões de ação (status + toggle) */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Ícone de status */}
            {touched.password && (
              <div>
                {errors.password ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
            )}
            {/* Toggle mostrar/ocultar senha */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        {errors.password && touched.password && (
          <p id="password-error" className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.password}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full mt-6"
        disabled={loading}
        style={{
          background: "var(--cor-primaria)",
          color: "#fff",
        }}
        aria-label="Fazer login"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
}

