import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "Erro ao carregar dados",
  message,
  onRetry,
  retryLabel = "Tentar novamente",
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <div className="text-center">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="outline"
          aria-label={`${retryLabel}`}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

