"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Lock,
} from "lucide-react";
import { getSupabase } from "@/lib/supabaseClient";
import PasswordStrength from "../PasswordStrength";

interface ResetPasswordFormProps {
  onSuccess?: () => void;
}

export default function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    password?: boolean;
    confirmPassword?: boolean;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const router = useRouter();

  // Auto-foco no campo de senha ao montar
  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  // Valid ações individuais
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
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);

    setErrors({
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    setTouched({
      password: true,
      confirmPassword: true,
    });

    return !passwordError && !confirmPasswordError;
  };

  // Handlers para validação em tempo real
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

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      const error = validatePassword(value);
      setErrors((prev) => ({ ...prev, password: error }));
    }
    // Revalidar confirmação se já foi tocada
    if (touched.confirmPassword && confirmPassword) {
      const confirmError =
        value !== confirmPassword ? "As senhas não coincidem" : undefined;
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
      if (errors.password) {
        passwordRef.current?.focus();
      } else if (errors.confirmPassword) {
        confirmPasswordRef.current?.focus();
      }
      return;
    }

    try {
      setIsLoading(true);
      const supabase = getSupabase();
      
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast({
        title: "Senha redefinida com sucesso!",
        description: "Você já pode fazer login com sua nova senha.",
      });

      // Redirecionar após 2 segundos
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/login");
        }
      }, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: error.message || "Tente novamente mais tarde",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Nova Senha */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Nova Senha
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
            disabled={isLoading}
            className={`pr-20 ${
              errors.password && touched.password
                ? "border-red-500 focus:ring-red-500"
                : touched.password &&
                  !errors.password &&
                  password.length >= 8
                ? "border-green-500 focus:ring-green-500"
                : ""
            }`}
            aria-invalid={
              errors.password && touched.password ? "true" : "false"
            }
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
          <p
            id="password-error"
            className="text-sm text-red-600 flex items-center gap-1"
          >
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

      {/* Confirmar Nova Senha */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirmar Nova Senha
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
            disabled={isLoading}
            className={`pr-20 ${
              errors.confirmPassword && touched.confirmPassword
                ? "border-red-500 focus:ring-red-500"
                : touched.confirmPassword && !errors.confirmPassword
                ? "border-green-500 focus:ring-green-500"
                : ""
            }`}
            aria-invalid={
              errors.confirmPassword && touched.confirmPassword
                ? "true"
                : "false"
            }
            aria-describedby={
              errors.confirmPassword && touched.confirmPassword
                ? "confirmPassword-error"
                : undefined
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
              aria-label={
                showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
              }
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
          <p
            id="confirmPassword-error"
            className="text-sm text-red-600 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" />
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Info box de segurança */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-900 mb-1">
              Por segurança:
            </p>
            <ul className="text-amber-800 space-y-1 text-xs">
              <li>• Após redefinir, você será desconectado de todos os dispositivos</li>
              <li>• Use uma senha forte e única</li>
              <li>• Não compartilhe sua senha com ninguém</li>
            </ul>
          </div>
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
        aria-label="Redefinir senha"
      >
        {isLoading ? (
          <>
            <Loader2
              className="mr-2 h-4 w-4 animate-spin"
              aria-hidden="true"
            />
            Redefinindo...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
            Redefinir Senha
          </>
        )}
      </Button>
    </form>
  );
}

