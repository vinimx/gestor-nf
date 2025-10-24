"use client";

import { Empresa } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Menu, Bell, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface EmpresaHeaderProps {
  empresa: Empresa;
  onMenuClick: () => void;
}

export function EmpresaHeader({ empresa, onMenuClick }: EmpresaHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left side - Menu button and breadcrumb */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden lg:block">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <a 
                    href="/empresas" 
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Empresas
                  </a>
                </li>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
                <li>
                  <span className="text-sm font-medium text-gray-900">
                    {empresa.nome}
                  </span>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Right side - User info and notifications */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button>

          {/* User info */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500">
                {empresa.nome}
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
