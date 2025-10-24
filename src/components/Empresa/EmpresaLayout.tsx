"use client";

import { useState } from "react";
import { EmpresaSidebar } from "./EmpresaSidebar";
import { EmpresaHeader } from "./EmpresaHeader";
import { Empresa } from "@/types/models";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu, X } from "lucide-react";

interface EmpresaLayoutProps {
  children: React.ReactNode;
  empresa: Empresa;
}

export function EmpresaLayout({ children, empresa }: EmpresaLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:inset-0
      `}>
        <EmpresaSidebar 
          empresa={empresa} 
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <EmpresaHeader 
          empresa={empresa}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
