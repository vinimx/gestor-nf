"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmpresaLayout } from "@/components/Empresa/EmpresaLayout";
import { Empresa } from "@/types/models";
import { getSupabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface EmpresaLayoutProps {
  children: React.ReactNode;
}

export default function EmpresaLayoutWrapper({ children }: EmpresaLayoutProps) {
  const params = useParams();
  const empresaId = params.id as string;
  const { user } = useAuth();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmpresa() {
      if (!empresaId || !user) return;

      try {
        setLoading(true);
        const supabase = getSupabase();
        
        // Verificar se o usuário tem acesso à empresa
        const { data: userProfile } = await supabase
          .from('users_profile')
          .select('empresa_id, role')
          .eq('id', user.id)
          .single();

        if (!userProfile) {
          setError('Perfil de usuário não encontrado');
          return;
        }

        // Admin pode acessar qualquer empresa, outros usuários só a própria
        if (userProfile.role !== 'admin' && userProfile.empresa_id !== empresaId) {
          setError('Acesso negado a esta empresa');
          return;
        }

        // Buscar dados da empresa
        const { data: empresaData, error: empresaError } = await supabase
          .from('empresas')
          .select('*')
          .eq('id', empresaId)
          .single();

        if (empresaError) {
          console.error('Erro ao buscar empresa:', empresaError);
          setError('Empresa não encontrada');
          return;
        }

        setEmpresa(empresaData);
      } catch (err) {
        console.error('Erro ao carregar empresa:', err);
        setError('Erro ao carregar dados da empresa');
      } finally {
        setLoading(false);
      }
    }

    fetchEmpresa();
  }, [empresaId, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !empresa) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-gray-600 mb-4">{error || 'Empresa não encontrada'}</p>
          <a 
            href="/empresas" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Voltar ao Painel Admin
          </a>
        </div>
      </div>
    );
  }

  return (
    <EmpresaLayout empresa={empresa}>
      {children}
    </EmpresaLayout>
  );
}
