import { NextRequest, NextResponse } from 'next/server';
import { fipeService } from '@/lib/services/fipeService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipoVeiculo = searchParams.get('tipo') as 'carros' | 'motos' | 'caminhoes' | null;
    const marcaCodigo = searchParams.get('marca');

    if (!tipoVeiculo || !['carros', 'motos', 'caminhoes'].includes(tipoVeiculo)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de veículo inválido' },
        { status: 400 }
      );
    }

    if (!marcaCodigo) {
      return NextResponse.json(
        { success: false, error: 'Código da marca é obrigatório' },
        { status: 400 }
      );
    }

    const modelos = await fipeService.listarModelos(tipoVeiculo, marcaCodigo);

    return NextResponse.json({
      success: true,
      data: modelos,
    });
  } catch (error: any) {
    console.error('[FIPE API] Erro ao buscar modelos:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao consultar modelos na API FIPE',
      },
      { status: 500 }
    );
  }
}

