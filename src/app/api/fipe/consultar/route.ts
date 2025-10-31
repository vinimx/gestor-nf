import { NextRequest, NextResponse } from 'next/server';
import { fipeService } from '@/lib/services/fipeService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipoVeiculo = searchParams.get('tipo') as 'carros' | 'motos' | 'caminhoes' | null;
    const marcaCodigo = searchParams.get('marca');
    const modeloCodigo = searchParams.get('modelo');
    const anoCodigo = searchParams.get('ano');

    if (!tipoVeiculo || !['carros', 'motos', 'caminhoes'].includes(tipoVeiculo)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de veículo inválido' },
        { status: 400 }
      );
    }

    if (!marcaCodigo || !modeloCodigo || !anoCodigo) {
      return NextResponse.json(
        { success: false, error: 'Código da marca, modelo e ano são obrigatórios' },
        { status: 400 }
      );
    }

    const valor = await fipeService.consultarValor(tipoVeiculo, marcaCodigo, modeloCodigo, anoCodigo);

    return NextResponse.json({
      success: true,
      data: valor,
    });
  } catch (error: any) {
    console.error('[FIPE API] Erro ao consultar valor FIPE:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao consultar valor na API FIPE',
      },
      { status: 500 }
    );
  }
}

