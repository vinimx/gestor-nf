import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

/**
 * Skeleton Loader para Cards de Empresa
 * 
 * @example
 * {loading ? <SkeletonEmpresaCard count={3} /> : <EmpresasGrid />}
 */
export function SkeletonEmpresaCard({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border rounded-lg p-6 space-y-4 bg-white shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>

          {/* Content */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>

          {/* Button */}
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </>
  );
}

/**
 * Skeleton Loader para Formulário
 * 
 * @example
 * {loading ? <SkeletonForm /> : <Form />}
 */
export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-full mt-6" />
    </div>
  );
}

/**
 * Skeleton Loader para Tabela
 * 
 * @example
 * {loading ? <SkeletonTable /> : <DataTable />}
 */
export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, index) => (
          <Skeleton key={index} className="h-10 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Loader para Menu/Dropdown
 * 
 * @example
 * {loading ? <SkeletonMenu /> : <UserMenu />}
 */
export function SkeletonMenu({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: items }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

/**
 * Skeleton Loader para Avatar
 * 
 * @example
 * {loading ? <SkeletonAvatar /> : <Avatar />}
 */
export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return <Skeleton className={cn("rounded-full", sizeClasses[size])} />;
}

/**
 * Skeleton Loader para Texto (parágrafos)
 * 
 * @example
 * {loading ? <SkeletonText lines={3} /> : <p>{text}</p>}
 */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "h-4",
            index === lines - 1 ? "w-3/4" : "w-full" // Última linha menor
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton Loader para Dashboard/Painel
 * 
 * @example
 * {loading ? <SkeletonDashboard /> : <Dashboard />}
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Search */}
      <Skeleton className="h-10 w-full max-w-md" />

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonEmpresaCard count={6} />
      </div>
    </div>
  );
}

