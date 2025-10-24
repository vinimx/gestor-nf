"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Package, 
  FileText, 
  Settings, 
  TrendingUp,
  Calendar,
  DollarSign,
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Activity
} from "lucide-react";
import { getSupabase } from "@/lib/supabaseClient";

interface DashboardStats {
  totalClientes: number;
  totalProdutos: number;
  totalNotas: number;
  notasMes: number;
  valorTotalMes: number;
  notasPendentes: number;
}

export default function DashboardPage() {
  const params = useParams();
  const empresaId = params.id as string;
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    totalProdutos: 0,
    totalNotas: 0,
    notasMes: 0,
    valorTotalMes: 0,
    notasPendentes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardStats() {
      if (!empresaId) return;

      try {
        setLoading(true);
        const supabase = getSupabase();

        // Buscar estatísticas básicas
        const [clientesResult, produtosResult, notasResult] = await Promise.all([
          supabase
            .from('clientes')
            .select('id', { count: 'exact' })
            .eq('empresa_id', empresaId)
            .eq('ativo', true),
          
          supabase
            .from('produtos')
            .select('id', { count: 'exact' })
            .eq('empresa_id', empresaId)
            .eq('ativo', true),
          
          supabase
            .from('notas_fiscais')
            .select('id, valor_total, data_emissao, status', { count: 'exact' })
            .eq('empresa_id', empresaId)
        ]);

        const totalClientes = clientesResult.count || 0;
        const totalProdutos = produtosResult.count || 0;
        const totalNotas = notasResult.count || 0;

        // Calcular estatísticas do mês atual
        const mesAtual = new Date();
        const inicioMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
        const fimMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);

        const notasMes = notasResult.data?.filter(nota => {
          const dataEmissao = new Date(nota.data_emissao);
          return dataEmissao >= inicioMes && dataEmissao <= fimMes;
        }) || [];

        const valorTotalMes = notasMes.reduce((total, nota) => total + (nota.valor_total || 0), 0);
        const notasPendentes = notasResult.data?.filter(nota => 
          nota.status === 'RASCUNHO' || nota.status === 'VALIDADA'
        ).length || 0;

        setStats({
          totalClientes,
          totalProdutos,
          totalNotas,
          notasMes: notasMes.length,
          valorTotalMes,
          notasPendentes,
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, [empresaId]);

  const statCards = [
    {
      title: "Clientes Ativos",
      value: stats.totalClientes,
      icon: Users,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-[var(--cor-primaria)] to-[var(--anexo-1-hover)]",
      borderColor: "border-[var(--cor-primaria)]",
      shadowColor: "shadow-[var(--sombra-destaque)]",
    },
    {
      title: "Produtos Cadastrados",
      value: stats.totalProdutos,
      icon: Package,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-[var(--cor-secundaria)] to-[var(--anexo-2-hover)]",
      borderColor: "border-[var(--cor-secundaria)]",
      shadowColor: "shadow-[0_8px_15px_rgba(33,155,157,0.1)]",
    },
    {
      title: "Notas Fiscais",
      value: stats.totalNotas,
      icon: FileText,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-[var(--anexo-3)] to-[var(--anexo-3-hover)]",
      borderColor: "border-[var(--anexo-3)]",
      shadowColor: "shadow-[0_8px_15px_rgba(79,195,247,0.1)]",
    },
    {
      title: "Notas Este Mês",
      value: stats.notasMes,
      icon: Calendar,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-[var(--anexo-4)] to-[var(--anexo-4-hover)]",
      borderColor: "border-[var(--anexo-4)]",
      shadowColor: "shadow-[0_8px_15px_rgba(13,71,161,0.1)]",
    },
    {
      title: "Valor Total (Mês)",
      value: `R$ ${stats.valorTotalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-[var(--anexo-5)] to-[var(--anexo-5-hover)]",
      borderColor: "border-[var(--anexo-5)]",
      shadowColor: "shadow-[0_8px_15px_rgba(55,71,79,0.1)]",
    },
    {
      title: "Pendentes",
      value: stats.notasPendentes,
      icon: TrendingUp,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-[var(--destructive)] to-[#d32f2f]",
      borderColor: "border-[var(--destructive)]",
      shadowColor: "shadow-[0_8px_15px_rgba(244,67,54,0.1)]",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background-color)] p-3">
      {/* Header com gradiente */}
      <div className="mb-3">
        <div className="bg-gradient-to-r from-[var(--cor-primaria)] to-[var(--cor-secundaria)] rounded-2xl p-3 text-white shadow-[var(--sombra-destaque)]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
              <p className="text-white/90">Visão geral das atividades da empresa</p>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid principal com melhor aproveitamento do espaço */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Coluna esquerda - Stats Cards */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index} 
                  className={`p-4 border-2 ${stat.borderColor} ${stat.shadowColor} hover:scale-105 transition-all duration-300 cursor-pointer`}
                >
                  <div className={`${stat.bgColor} rounded-xl p-3 mb-3`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/90 text-xs font-medium">{stat.title}</p>
                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-[var(--muted-foreground)]">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>Última atualização: agora</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Seção de Ações Rápidas melhorada */}
          <Card className="p-4 border-2 border-[var(--cor-primaria)]/20 shadow-[var(--sombra-destaque)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--foreground)]">Ações Rápidas</h2>
              <div className="bg-[var(--cor-primaria)]/10 rounded-full p-2">
                <Plus className="h-4 w-4 text-[var(--cor-primaria)]" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a
                href={`/empresa/${empresaId}/clientes`}
                className="group flex items-center p-4 bg-gradient-to-r from-[var(--cor-primaria)]/5 to-[var(--cor-primaria)]/10 border border-[var(--cor-primaria)]/20 rounded-xl hover:from-[var(--cor-primaria)]/10 hover:to-[var(--cor-primaria)]/20 transition-all duration-300"
              >
                <div className="bg-[var(--cor-primaria)] rounded-lg p-2 mr-3 group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--foreground)]">Gerenciar Clientes</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">Cadastrar e editar clientes</p>
                </div>
                <ArrowRight className="h-5 w-5 text-[var(--cor-primaria)] group-hover:translate-x-1 transition-transform" />
              </a>
              
              <a
                href={`/empresa/${empresaId}/produtos`}
                className="group flex items-center p-4 bg-gradient-to-r from-[var(--cor-secundaria)]/5 to-[var(--cor-secundaria)]/10 border border-[var(--cor-secundaria)]/20 rounded-xl hover:from-[var(--cor-secundaria)]/10 hover:to-[var(--cor-secundaria)]/20 transition-all duration-300"
              >
                <div className="bg-[var(--cor-secundaria)] rounded-lg p-2 mr-3 group-hover:scale-110 transition-transform">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--foreground)]">Gerenciar Produtos</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">Cadastrar produtos e serviços</p>
                </div>
                <ArrowRight className="h-5 w-5 text-[var(--cor-secundaria)] group-hover:translate-x-1 transition-transform" />
              </a>
              
              <a
                href={`/empresa/${empresaId}/notas/nova`}
                className="group flex items-center p-4 bg-gradient-to-r from-[var(--anexo-3)]/5 to-[var(--anexo-3)]/10 border border-[var(--anexo-3)]/20 rounded-xl hover:from-[var(--anexo-3)]/10 hover:to-[var(--anexo-3)]/20 transition-all duration-300"
              >
                <div className="bg-[var(--anexo-3)] rounded-lg p-2 mr-3 group-hover:scale-110 transition-transform">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--foreground)]">Nova Nota Fiscal</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">Emitir nova nota fiscal</p>
                </div>
                <ArrowRight className="h-5 w-5 text-[var(--anexo-3)] group-hover:translate-x-1 transition-transform" />
              </a>
              
              <a
                href={`/empresa/${empresaId}/configuracoes`}
                className="group flex items-center p-4 bg-gradient-to-r from-[var(--anexo-5)]/5 to-[var(--anexo-5)]/10 border border-[var(--anexo-5)]/20 rounded-xl hover:from-[var(--anexo-5)]/10 hover:to-[var(--anexo-5)]/20 transition-all duration-300"
              >
                <div className="bg-[var(--anexo-5)] rounded-lg p-2 mr-3 group-hover:scale-110 transition-transform">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--foreground)]">Configurações</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">Configurar empresa</p>
                </div>
                <ArrowRight className="h-5 w-5 text-[var(--anexo-5)] group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </Card>
        </div>

        {/* Coluna direita - Informações adicionais */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card de Status */}
          <Card className="p-4 border-2 border-[var(--cor-secundaria)]/20 shadow-[0_8px_15px_rgba(33,155,157,0.1)]">
            <div className="flex items-center mb-4">
              <div className="bg-[var(--cor-secundaria)] rounded-lg p-2 mr-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Status do Sistema</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Sistema Online</span>
                <div className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium">Ativo</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Última Sincronização</span>
                <span className="text-sm font-medium text-[var(--foreground)]">Agora</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Versão</span>
                <span className="text-sm font-medium text-[var(--foreground)]">v1.0.0</span>
              </div>
            </div>
          </Card>

          {/* Card de Atividades Recentes */}
          <Card className="p-4 border-2 border-[var(--anexo-3)]/20 shadow-[0_8px_15px_rgba(79,195,247,0.1)]">
            <div className="flex items-center mb-4">
              <div className="bg-[var(--anexo-3)] rounded-lg p-2 mr-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Atividades Recentes</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-[var(--cor-primaria)]/10 rounded-full p-1 mt-1">
                  <Users className="h-4 w-4 text-[var(--cor-primaria)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">Sistema inicializado</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Há alguns segundos</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-[var(--cor-secundaria)]/10 rounded-full p-1 mt-1">
                  <Package className="h-4 w-4 text-[var(--cor-secundaria)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">Dashboard carregado</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Há alguns segundos</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-[var(--anexo-3)]/10 rounded-full p-1 mt-1">
                  <FileText className="h-4 w-4 text-[var(--anexo-3)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">Estatísticas atualizadas</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Há alguns segundos</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Card de Próximos Passos */}
          <Card className="p-4 border-2 border-[var(--anexo-4)]/20 shadow-[0_8px_15px_rgba(13,71,161,0.1)]">
            <div className="flex items-center mb-4">
              <div className="bg-[var(--anexo-4)] rounded-lg p-2 mr-3">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Próximos Passos</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-[var(--cor-primaria)] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <span className="text-sm text-[var(--foreground)]">Cadastrar seus primeiros clientes</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-[var(--cor-secundaria)] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <span className="text-sm text-[var(--foreground)]">Adicionar produtos e serviços</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-[var(--anexo-3)] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <span className="text-sm text-[var(--foreground)]">Emitir sua primeira nota fiscal</span>
              </div>
            </div>
            <Button 
              className="w-full mt-4 bg-gradient-to-r from-[var(--cor-primaria)] to-[var(--cor-secundaria)] hover:from-[var(--anexo-1-hover)] hover:to-[var(--anexo-2-hover)] text-white border-0"
              style={{ background: "var(--cor-primaria)" }}
            >
              Começar Agora
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
