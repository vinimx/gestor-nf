import { NextRequest, NextResponse } from 'next/server';
import { fipeService } from '@/lib/services/fipeService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipoVeiculo = searchParams.get('tipo') as 'carros' | 'motos' | 'caminhoes' | null;
    const marcaCodigo = searchParams.get('marca');
    const modeloCodigo = searchParams.get('modelo');

    if (!tipoVeiculo || !['carros', 'motos', 'caminhoes'].includes(tipoVeiculo)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de veículo inválido' },
        { status: 400 }
      );
    }

    if (!marcaCodigo || !modeloCodigo) {
      return NextResponse.json(
        { success: false, error: 'Código da marca e modelo são obrigatórios' },
        { status: 400 }
      );
    }

    const anos = await fipeService.listarAnos(tipoVeiculo, marcaCodigo, modeloCodigo);

    return NextResponse.json({
      success: true,
      data: anos,
    });
  } catch (error: any) {
    console.error('[FIPE API] Erro ao buscar anos:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao consultar anos na API FIPE',
      },
      { status: 500 }
    );
  }
}

