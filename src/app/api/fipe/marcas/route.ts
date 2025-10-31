import { NextRequest, NextResponse } from 'next/server';
import { fipeService } from '@/lib/services/fipeService';

export async function GET(request: NextRequest) {
  try {
    console.log('[FIPE API Route] Rota /api/fipe/marcas chamada');
    const { searchParams } = new URL(request.url);
    const tipoVeiculo = searchParams.get('tipo') as 'carros' | 'motos' | 'caminhoes' | null;

    console.log('[FIPE API Route] Tipo veículo recebido:', tipoVeiculo);

    if (!tipoVeiculo || !['carros', 'motos', 'caminhoes'].includes(tipoVeiculo)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de veículo inválido. Use: carros, motos ou caminhoes' },
        { status: 400 }
      );
    }

    console.log('[FIPE API Route] Chamando fipeService.listarMarcas...');
    const marcas = await fipeService.listarMarcas(tipoVeiculo);
    console.log('[FIPE API Route] Marcas recebidas:', marcas?.length || 0);

    return NextResponse.json({
      success: true,
      data: marcas,
    });
  } catch (error: any) {
    console.error('[FIPE API Route] Erro completo:', error);
    console.error('[FIPE API Route] Stack:', error.stack);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao consultar marcas na API FIPE',
      },
      { status: 500 }
    );
  }
}

