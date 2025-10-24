"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Empresa } from "@/types/models";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  X, 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  Settings,
  BarChart3,
  Receipt
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmpresaSidebarProps {
  empresa: Empresa;
  onClose?: () => void;
}

export function EmpresaSidebar({ empresa, onClose }: EmpresaSidebarProps) {
  const params = useParams();
  const pathname = usePathname();
  const empresaId = params.id as string;

  const navigation = [
    {
      name: "Dashboard",
      href: `/empresa/${empresaId}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      name: "Clientes",
      href: `/empresa/${empresaId}/clientes`,
      icon: Users,
    },
    {
      name: "Produtos",
      href: `/empresa/${empresaId}/produtos`,
      icon: Package,
    },
    {
      name: "Notas Fiscais",
      href: `/empresa/${empresaId}/notas`,
      icon: FileText,
    },
    {
      name: "Relatórios",
      href: `/empresa/${empresaId}/relatorios`,
      icon: BarChart3,
    },
    {
      name: "Configurações",
      href: `/empresa/${empresaId}/configuracoes`,
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    if (href === `/empresa/${empresaId}/dashboard`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {empresa.nome}
          </h1>
          <p className="text-sm text-gray-500 truncate">
            CNPJ: {empresa.cnpj}
          </p>
        </div>
        
        {/* Close button for mobile */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                active
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link href="/empresas">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onClose}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Admin
          </Button>
        </Link>
      </div>
    </div>
  );
}
