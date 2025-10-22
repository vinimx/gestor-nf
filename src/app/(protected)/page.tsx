import PainelAdmin from "@/components/Admin/PainelAdmin";

/**
 * Página Principal Protegida
 * 
 * Esta página está dentro do route group (protected)/ que:
 * - Tem AuthGuard no layout
 * - Protege contra acesso não autenticado
 * - Redireciona para /login se necessário
 */
export default function HomePage() {
  return <PainelAdmin />;
}

