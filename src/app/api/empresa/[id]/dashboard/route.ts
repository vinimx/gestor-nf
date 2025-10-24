import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAuthFromRequest } from "@/lib/auth";

// GET /api/empresa/[id]/dashboard
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: empresaId } = await params;
    
    if (!empresaId) {
      return NextResponse.json(
        { error: "ID da empresa é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar autenticação
    const { user, error: authError } = await requireAuthFromRequest(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const supabaseAdmin = createSupabaseAdmin();

    // Verificar se o usuário tem acesso à empresa
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('empresa_id, role')
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json(
        { error: "Perfil de usuário não encontrado" },
        { status: 404 }
      );
    }

    // Admin pode acessar qualquer empresa, outros usuários só a própria
    if (userProfile.role !== 'admin' && userProfile.empresa_id !== empresaId) {
      return NextResponse.json(
        { error: "Acesso negado a esta empresa" },
        { status: 403 }
      );
    }

    // Buscar dados da empresa
    const { data: empresa, error: empresaError } = await supabaseAdmin
      .from('empresas')
      .select('*')
      .eq('id', empresaId)
      .single();

    if (empresaError) {
      console.error('Erro ao buscar empresa:', empresaError);
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    // Buscar configurações fiscais se existirem
    const { data: configuracoes } = await supabaseAdmin
      .from('configuracoes_fiscais')
      .select('*')
      .eq('empresa_id', empresaId)
      .single();

    // Buscar estatísticas básicas
    const [clientesResult, produtosResult, notasResult] = await Promise.all([
      supabaseAdmin
        .from('clientes')
        .select('id', { count: 'exact' })
        .eq('empresa_id', empresaId)
        .eq('ativo', true),
      
      supabaseAdmin
        .from('produtos')
        .select('id', { count: 'exact' })
        .eq('empresa_id', empresaId)
        .eq('ativo', true),
      
      supabaseAdmin
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

    const stats = {
      totalClientes,
      totalProdutos,
      totalNotas,
      notasMes: notasMes.length,
      valorTotalMes,
      notasPendentes,
    };

    return NextResponse.json({
      empresa,
      configuracoes,
      stats,
    });

  } catch (error) {
    console.error('Erro no endpoint dashboard:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
