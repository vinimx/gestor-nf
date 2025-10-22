"use client";

import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const calculateStrength = (pwd: string): number => {
    let strength = 0;

    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    return strength;
  };

  const getRequirements = (pwd: string): Requirement[] => {
    return [
      {
        label: "Mínimo 8 caracteres",
        met: pwd.length >= 8,
      },
      {
        label: "Letra maiúscula (A-Z)",
        met: /[A-Z]/.test(pwd),
      },
      {
        label: "Letra minúscula (a-z)",
        met: /[a-z]/.test(pwd),
      },
      {
        label: "Número (0-9)",
        met: /[0-9]/.test(pwd),
      },
      {
        label: "Caractere especial (!@#$%)",
        met: /[^a-zA-Z0-9]/.test(pwd),
      },
    ];
  };

  const strength = calculateStrength(password);
  const requirements = getRequirements(password);

  const getStrengthLabel = (): string => {
    if (strength <= 1) return "Muito fraca";
    if (strength === 2) return "Fraca";
    if (strength === 3) return "Média";
    if (strength === 4) return "Forte";
    return "Muito forte";
  };

  const getStrengthColor = (): string => {
    if (strength <= 1) return "bg-red-500";
    if (strength === 2) return "bg-orange-500";
    if (strength === 3) return "bg-yellow-500";
    if (strength === 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthTextColor = (): string => {
    if (strength <= 1) return "text-red-600";
    if (strength === 2) return "text-orange-600";
    if (strength === 3) return "text-yellow-600";
    if (strength === 4) return "text-blue-600";
    return "text-green-600";
  };

  if (!password) return null;

  return (
    <div className="space-y-3 mt-3" role="status" aria-live="polite">
      {/* Barra de força */}
      <div className="space-y-2">
        <div className="flex gap-1" aria-label="Indicador de força da senha">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                level <= strength ? getStrengthColor() : "bg-gray-200"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600">
            Força da senha:{" "}
            <span className={`font-semibold ${getStrengthTextColor()}`}>
              {getStrengthLabel()}
            </span>
          </p>
          <p className="text-xs text-gray-500">
            {requirements.filter((r) => r.met).length}/5 requisitos
          </p>
        </div>
      </div>

      {/* Lista de requisitos */}
      <div className="space-y-1.5">
        {requirements.map((req, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-xs transition-colors"
          >
            {req.met ? (
              <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" aria-hidden="true" />
            ) : (
              <X className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" aria-hidden="true" />
            )}
            <span
              className={`${
                req.met ? "text-green-700 font-medium" : "text-gray-600"
              }`}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

