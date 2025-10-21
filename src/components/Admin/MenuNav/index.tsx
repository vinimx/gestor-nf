"use client";

import type React from "react";
import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuNavProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { icon: Building2, label: "Empresas", href: "/", active: true },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

export default function MenuNav({ children }: MenuNavProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
                <Button variant="ghost" size="icon">
                  <User
                    className="h-5 w-5"
                    style={{ color: "var(--cor-texto)" }}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 sm:w-56"
                style={{
                  background: "var(--background-color)",
                  boxShadow: "var(--sombra-suave)",
                  border: "1px solid var(--cor-borda)",
                }}
              >
                <DropdownMenuItem
                  className="cursor-pointer transition-colors flex items-center gap-2 px-3 py-2 text-sm"
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
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer transition-colors flex items-center gap-2 px-3 py-2 text-sm"
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
                <DropdownMenuItem
                  className="cursor-pointer transition-colors flex items-center gap-2 px-3 py-2 text-sm"
                  style={
                    {
                      "--hover-bg": "#e53935",
                      "--hover-color": "#fff",
                    } as React.CSSProperties
                  }
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#e53935";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background =
                      "var(--background-color)";
                    e.currentTarget.style.color = "var(--cor-texto)";
                  }}
                >
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  <span>Sair</span>
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
