import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

/**
 * Componente de Loading Spinner reutilizável
 * 
 * @example
 * // Spinner simples
 * <LoadingSpinner />
 * 
 * @example
 * // Spinner com texto
 * <LoadingSpinner size="lg" text="Carregando..." />
 * 
 * @example
 * // Spinner customizado
 * <LoadingSpinner size="xl" className="text-blue-600" />
 */
export function LoadingSpinner({
  size = "md",
  className,
  text,
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2
        className={cn("animate-spin", sizeClasses[size], className)}
      />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
}

/**
 * Loading Spinner em tela cheia
 * 
 * @example
 * <LoadingSpinnerFullScreen text="Carregando dados..." />
 */
export function LoadingSpinnerFullScreen({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="text-center">
        <LoadingSpinner size="xl" text={text || "Carregando..."} />
      </div>
    </div>
  );
}

/**
 * Loading Spinner inline (para botões)
 * 
 * @example
 * <Button disabled={loading}>
 *   {loading ? <LoadingSpinnerInline /> : "Salvar"}
 * </Button>
 */
export function LoadingSpinnerInline() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
}

