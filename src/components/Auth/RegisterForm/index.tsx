"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
} from "lucide-react";
import PasswordStrength from "../PasswordStrength";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    nome?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    nome?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  const nomeRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const { signUp, loading, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-foco no campo de nome ao montar
  useEffect(() => {
    nomeRef.current?.focus();
  }, []);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (user && !loading) {
      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
    }
  }, [user, loading, router, searchParams]);

  // Validações individuais
  const validateNome = (value: string): string | undefined => {
    if (!value) {
      return "Nome é obrigatório";
    }
    if (value.length < 3) {
      return "Nome deve ter pelo menos 3 caracteres";
    }
    if (value.length > 100) {
      return "Nome muito longo (máximo 100 caracteres)";
    }
    if (!/^[a-záàâãéèêíïóôõöúçñ\s]+$/i.test(value)) {
      return "Nome deve conter apenas letras";
    }
    return undefined;
  };

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
    if (value.length < 8) {
      return "Senha deve ter pelo menos 8 caracteres";
    }
    if (!/[A-Z]/.test(value)) {
      return "Deve conter pelo menos uma letra maiúscula";
    }
    if (!/[a-z]/.test(value)) {
      return "Deve conter pelo menos uma letra minúscula";
    }
    if (!/[0-9]/.test(value)) {
      return "Deve conter pelo menos um número";
    }
    return undefined;
  };

  const validateConfirmPassword = (value: string): string | undefined => {
    if (!value) {
      return "Confirme sua senha";
    }
    if (value !== password) {
      return "As senhas não coincidem";
    }
    return undefined;
  };

  // Validação completa do formulário
  const validateForm = (): boolean => {
    const nomeError = validateNome(nome);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);

    setErrors({
      nome: nomeError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    setTouched({
      nome: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    return !nomeError && !emailError && !passwordError && !confirmPasswordError;
  };

  // Handlers para validação em tempo real
  const handleNomeBlur = () => {
    setTouched((prev) => ({ ...prev, nome: true }));
    const error = validateNome(nome);
    setErrors((prev) => ({ ...prev, nome: error }));
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    const error = validateEmail(email);
    setErrors((prev) => ({ ...prev, email: error }));
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    const error = validatePassword(password);
    setErrors((prev) => ({ ...prev, password: error }));
    // Se confirm password já foi tocado, revalidar também
    if (touched.confirmPassword && confirmPassword) {
      const confirmError = validateConfirmPassword(confirmPassword);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleConfirmPasswordBlur = () => {
    setTouched((prev) => ({ ...prev, confirmPassword: true }));
    const error = validateConfirmPassword(confirmPassword);
    setErrors((prev) => ({ ...prev, confirmPassword: error }));
  };

  // Handlers para mudança de valor
  const handleNomeChange = (value: string) => {
    setNome(value);
    if (touched.nome) {
      const error = validateNome(value);
      setErrors((prev) => ({ ...prev, nome: error }));
    }
  };

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
    // Revalidar confirmação se já foi tocada
    if (touched.confirmPassword && confirmPassword) {
      const confirmError = value !== confirmPassword ? "As senhas não coincidem" : undefined;
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      const error = validateConfirmPassword(value);
      setErrors((prev) => ({ ...prev, confirmPassword: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulário
    if (!validateForm()) {
      // Focar no primeiro campo com erro
      if (errors.nome) {
        nomeRef.current?.focus();
      } else if (errors.email) {
        emailRef.current?.focus();
      } else if (errors.password) {
        passwordRef.current?.focus();
      } else if (errors.confirmPassword) {
        confirmPasswordRef.current?.focus();
      }
      return;
    }

    try {
      await signUp(email, password, nome);
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar sua conta.",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        // Redirecionar para página de verificação com email no state
        router.push(`/verificar-email?email=${encodeURIComponent(email)}`);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: error.message || "Tente novamente mais tarde",
      });
      
      // Focar no campo de email se o erro for relacionado a email duplicado
      if (error.message?.includes("email") || error.message?.includes("Email")) {
        emailRef.current?.focus();
        emailRef.current?.select();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Nome Completo */}
      <div className="space-y-2">
        <Label htmlFor="nome" className="text-sm font-medium">
          Nome Completo
        </Label>
        <div className="relative">
          <Input
            ref={nomeRef}
            id="nome"
            name="nome"
            type="text"
            autoComplete="name"
            value={nome}
            onChange={(e) => handleNomeChange(e.target.value)}
            onBlur={handleNomeBlur}
            placeholder="João da Silva"
            disabled={loading}
            className={`${
              errors.nome && touched.nome
                ? "border-red-500 focus:ring-red-500"
                : touched.nome && !errors.nome
                ? "border-green-500 focus:ring-green-500"
                : ""
            }`}
            aria-invalid={errors.nome && touched.nome ? "true" : "false"}
            aria-describedby={errors.nome && touched.nome ? "nome-error" : undefined}
          />
          {/* Ícone de status */}
          {touched.nome && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {errors.nome ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
          )}
        </div>
        {errors.nome && touched.nome && (
          <p id="nome-error" className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.nome}
          </p>
        )}
      </div>

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            onBlur={handlePasswordBlur}
            placeholder="••••••••"
            disabled={loading}
            className={`pr-20 ${
              errors.password && touched.password
                ? "border-red-500 focus:ring-red-500"
                : touched.password && !errors.password && password.length >= 8
                ? "border-green-500 focus:ring-green-500"
                : ""
            }`}
            aria-invalid={errors.password && touched.password ? "true" : "false"}
            aria-describedby={
              errors.password && touched.password
                ? "password-error"
                : password
                ? "password-strength"
                : undefined
            }
          />
          {/* Botões de ação */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Ícone de status */}
            {touched.password && (
              <div>
                {errors.password ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : password.length >= 8 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : null}
              </div>
            )}
            {/* Toggle senha */}
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
        {/* Indicador de força */}
        {password && (
          <div id="password-strength">
            <PasswordStrength password={password} />
          </div>
        )}
      </div>

      {/* Confirmar Senha */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirmar Senha
        </Label>
        <div className="relative">
          <Input
            ref={confirmPasswordRef}
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            onBlur={handleConfirmPasswordBlur}
            placeholder="••••••••"
            disabled={loading}
            className={`pr-20 ${
              errors.confirmPassword && touched.confirmPassword
                ? "border-red-500 focus:ring-red-500"
                : touched.confirmPassword && !errors.confirmPassword
                ? "border-green-500 focus:ring-green-500"
                : ""
            }`}
            aria-invalid={errors.confirmPassword && touched.confirmPassword ? "true" : "false"}
            aria-describedby={
              errors.confirmPassword && touched.confirmPassword ? "confirmPassword-error" : undefined
            }
          />
          {/* Botões de ação */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Ícone de status */}
            {touched.confirmPassword && (
              <div>
                {errors.confirmPassword ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
            )}
            {/* Toggle senha */}
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              tabIndex={-1}
              aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        {errors.confirmPassword && touched.confirmPassword && (
          <p id="confirmPassword-error" className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.confirmPassword}
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
        aria-label="Criar conta"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Criando conta...
          </>
        ) : (
          "Criar Conta"
        )}
      </Button>
    </form>
  );
}

