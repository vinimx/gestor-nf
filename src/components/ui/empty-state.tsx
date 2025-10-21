import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  variant?: "default" | "error";
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  children,
}: EmptyStateProps) {
  const iconColor = variant === "error" ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-16">
      {Icon && <Icon className={`h-12 w-12 ${iconColor}`} />}
      <div className="text-center">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick}>
          {action.icon && <action.icon className="mr-2 h-4 w-4" />}
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}

