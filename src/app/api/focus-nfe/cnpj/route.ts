import type { NextRequest } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Reutiliza a implementação existente
import * as Consultar from '../consultar-cnpj/route';

export async function GET(request: NextRequest) {
  return Consultar.GET(request);
}

export async function POST(request: NextRequest) {
  return Consultar.POST(request);
}


