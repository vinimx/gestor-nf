import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonEmpresa() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        {/* Ícone e info principal */}
        <div className="flex items-start gap-4 flex-1">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-3">
            {/* Nome da empresa */}
            <Skeleton className="h-5 w-3/4" />
            {/* CNPJ */}
            <Skeleton className="h-4 w-1/2" />
            {/* Email e telefone */}
            <div className="flex items-center gap-4 mt-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        {/* Badge e menu */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* Endereço (quando disponível) */}
      <div className="mt-4 pt-4 border-t">
        <Skeleton className="h-4 w-full" />
      </div>
    </Card>
  );
}

export function SkeletonListaEmpresas({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonEmpresa key={i} />
      ))}
    </div>
  );
}

