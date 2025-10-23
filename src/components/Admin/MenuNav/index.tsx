"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings,
  Search,
  Menu,
  X,
  Plus,
  User,
  LogOut,
  Building2,
  Users,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

interface MenuNavProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { icon: Building2, label: "Empresas", href: "/", active: true },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

// Sistema simplificado: Todos os usuários têm acesso completo
// Não há mais sistema de roles (admin, accountant, viewer)

/**
 * Gera iniciais do nome do usuário
 */
function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Componente de Avatar com fallback para iniciais
 */
function UserAvatar({ name, email }: { name?: string; email?: string }) {
  const displayName = name || email || "Usuário";
  const initials = getInitials(displayName);

  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white"
      style={{
        background: "linear-gradient(135deg, var(--cor-primaria) 0%, var(--cor-secundaria) 100%)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      }}
    >
      {initials}
    </div>
  );
}

export default function MenuNav({ children }: MenuNavProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { user, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  /**
   * Handles user logout with loading state and feedback
   */
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      
      toast({
        title: "Logout realizado",
        description: "Você saiu com sucesso do sistema.",
      });
      
      // Pequeno delay para garantir que o toast seja exibido
      setTimeout(() => {
        router.push("/login");
      }, 500);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      
      // Mesmo em caso de erro, redirecionar para login
      // pois o estado local já foi limpo
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado do sistema.",
      });
      
      setTimeout(() => {
        router.push("/login");
      }, 500);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Extrair informações do usuário
  const userName = user?.profile?.nome || user?.email?.split("@")[0] || "Usuário";
  const userEmail = user?.email || "";

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background-color)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 w-full border-b backdrop-blur"
        style={{
          background: "var(--background-color)",
          borderColor: "var(--cor-borda)",
          boxShadow: "var(--sombra-suave)",
        }}
      >
        <div className="container flex h-16 items-center justify-between px-2 sm:px-4">
          {/* Left side - Logo and Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/logo.png"
                  alt="RaniCont"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <h1
                  className="text-base sm:text-lg font-semibold truncate"
                  style={{ color: "var(--cor-primaria)" }}
                >
                  Gestor de NFs
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Escritório Ranicont
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Search, Actions and User Menu */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            {/* Search - Hidden on mobile, visible on tablet+ */}
            <div className="hidden lg:flex items-center gap-2">
              <Search
                className="h-4 w-4"
                style={{ color: "var(--cor-texto)" }}
              />
              <Input
                placeholder="Buscar empresa..."
                className="w-48 xl:w-64"
                style={{
                  background: "var(--background-color)",
                  color: "var(--cor-texto)",
                  borderColor: "var(--cor-borda)",
                }}
              />
            </div>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              title="Buscar"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0 hover:opacity-80 transition-opacity"
                >
                  <UserAvatar name={userName} email={userEmail} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64"
                style={{
                  background: "var(--background-color)",
                  boxShadow: "var(--sombra-suave)",
                  border: "1px solid var(--cor-borda)",
                }}
              >
                       {/* User Info Header */}
                       <DropdownMenuLabel className="font-normal">
                         <div className="flex items-start gap-3 p-2">
                           <UserAvatar name={userName} email={userEmail} />
                           <div className="flex flex-col space-y-1 flex-1 min-w-0">
                             <p className="text-sm font-semibold leading-none text-gray-900 truncate">
                               {userName}
                             </p>
                             <p className="text-xs leading-none text-gray-500 truncate">
                               {userEmail}
                             </p>
                             <p className="text-xs leading-none text-gray-400 mt-1">
                               Escritório Ranicont
                             </p>
                           </div>
                         </div>
                       </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1" />

                {/* Menu Items */}
                <DropdownMenuItem
                  className="cursor-pointer transition-colors flex items-center gap-2 px-3 py-2 text-sm"
                  onClick={() => router.push("/perfil")}
                  style={
                    {
                      "--hover-bg": "var(--cor-primaria, #1976d2)",
                      "--hover-color": "#fff",
                    } as React.CSSProperties
                  }
                  onMouseOver={(e) => {
                    e.currentTarget.style.background =
                      "var(--cor-primaria, #1976d2)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background =
                      "var(--background-color)";
                    e.currentTarget.style.color = "var(--cor-texto)";
                  }}
                >
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span>Meu Perfil</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer transition-colors flex items-center gap-2 px-3 py-2 text-sm"
                  onClick={() => router.push("/configuracoes")}
                  style={
                    {
                      "--hover-bg": "var(--cor-secundaria, #219b9d)",
                      "--hover-color": "#fff",
                    } as React.CSSProperties
                  }
                  onMouseOver={(e) => {
                    e.currentTarget.style.background =
                      "var(--cor-secundaria, #219b9d)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background =
                      "var(--background-color)";
                    e.currentTarget.style.color = "var(--cor-texto)";
                  }}
                >
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  <span>Configurações</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                {/* Logout with loading state */}
                <DropdownMenuItem
                  className="cursor-pointer transition-colors flex items-center gap-2 px-3 py-2 text-sm"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  style={
                    {
                      "--hover-bg": "#e53935",
                      "--hover-color": "#fff",
                    } as React.CSSProperties
                  }
                  onMouseOver={(e) => {
                    if (!isLoggingOut) {
                      e.currentTarget.style.background = "#e53935";
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isLoggingOut) {
                      e.currentTarget.style.background =
                        "var(--background-color)";
                      e.currentTarget.style.color = "var(--cor-texto)";
                    }
                  }}
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div
            className="lg:hidden border-t px-4 py-3"
            style={{ borderColor: "var(--cor-borda)" }}
          >
            <div className="flex items-center gap-2">
              <Search
                className="h-4 w-4"
                style={{ color: "var(--cor-texto)" }}
              />
              <Input
                placeholder="Buscar empresa..."
                className="flex-1"
                autoFocus
                style={{
                  background: "var(--background-color)",
                  color: "var(--cor-texto)",
                  borderColor: "var(--cor-borda)",
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 border-r transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
          style={{
            background: "var(--background-color)",
            borderColor: "var(--cor-borda)",
            color: "var(--cor-texto)",
            boxShadow: "var(--sombra-suave)",
          }}
        >
          <div className="flex h-full flex-col pt-16 md:pt-0">
            <div className="flex-1 overflow-auto py-4">
              <nav className="space-y-1 px-3">
                {sidebarItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={cn(
                      "group w-full justify-start gap-3 h-10 px-3 rounded-md",
                      "hover:scale-[1.02] hover:shadow-sm",
                      item.active
                        ? "bg-[var(--cor-primaria)] text-white shadow-sm border border-[var(--cor-primaria)]/20 hover:bg-[var(--cor-primaria)]/90 hover:text-white"
                        : "text-[var(--cor-texto)] hover:bg-[var(--cor-primaria-hover)] hover:text-[var(--cor-primaria)] hover:border-[var(--cor-primaria)]/20"
                    )}
                    style={{
                      fontWeight: item.active ? 600 : 500,
                      fontFamily: "var(--font-inter), sans-serif",
                      border: item.active
                        ? "1px solid var(--cor-primaria)"
                        : "1px solid transparent",
                      boxShadow: item.active ? "var(--sombra-suave)" : "none",
                      transition: "var(--transicao-suave)",
                    }}
                    onMouseEnter={(e) => {
                      if (!item.active) {
                        e.currentTarget.style.background =
                          "var(--cor-primaria-active)";
                        e.currentTarget.style.boxShadow = "var(--sombra-suave)";
                        e.currentTarget.style.transform = "translateX(4px)";
                      } else {
                        // Para item ativo, apenas adiciona um leve escurecimento
                        e.currentTarget.style.background =
                          "var(--cor-primaria)";
                        e.currentTarget.style.opacity = "0.9";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!item.active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateX(0)";
                      } else {
                        // Para item ativo, volta ao estado original
                        e.currentTarget.style.background =
                          "var(--cor-primaria)";
                        e.currentTarget.style.opacity = "1";
                      }
                    }}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4",
                        item.active
                          ? "text-white group-hover:text-white"
                          : "text-[var(--cor-texto)] group-hover:text-[var(--cor-primaria)]"
                      )}
                      style={{ transition: "var(--transicao-suave)" }}
                    />
                    <span
                      className={cn(
                        item.active
                          ? "text-white group-hover:text-white"
                          : "group-hover:text-[var(--cor-primaria)]"
                      )}
                      style={{ transition: "var(--transicao-suave)" }}
                    >
                      {item.label}
                    </span>
                    {item.active && (
                      <div
                        className="ml-auto w-2 h-2 rounded-full bg-white/30"
                        style={{
                          boxShadow: "0 0 8px rgba(255, 255, 255, 0.3)",
                        }}
                      />
                    )}
                  </Button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
