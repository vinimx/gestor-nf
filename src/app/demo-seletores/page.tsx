'use client';

import React, { useState } from 'react';
import { SeletorNCM } from '@/components/Produtos/Seletores/SeletorNCM';
import { SeletorCFOP } from '@/components/Produtos/Seletores/SeletorCFOP';
import { SeletorCST } from '@/components/Produtos/Seletores/SeletorCST';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface NCMItem {
  codigo: string;
  descricao_completa: string;
  capitulo: string;
  posicao: string;
  subposicao1: string;
  subposicao2: string;
  item1: string;
  item2: string;
  valid: boolean;
}

interface CFOPItem {
  codigo: string;
  descricao: string;
  valid: boolean;
  tipo: 'ENTRADA' | 'SAIDA';
}

interface CSTItem {
  codigo: string;
  descricao: string;
  tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS';
  aplicavel: boolean;
}

export default function DemoSeltoresPage() {
  const [ncmSelecionado, setNcmSelecionado] = useState<NCMItem | null>(null);
  const [cfopEntradaSelecionado, setCfopEntradaSelecionado] = useState<CFOPItem | null>(null);
  const [cfopSaidaSelecionado, setCfopSaidaSelecionado] = useState<CFOPItem | null>(null);
  const [cstICMSSelecionado, setCstICMSSelecionado] = useState<CSTItem | null>(null);
  const [cstIPISelecionado, setCstIPISelecionado] = useState<CSTItem | null>(null);
  const [cstPISSelecionado, setCstPISSelecionado] = useState<CSTItem | null>(null);
  const [cstCOFINSSelecionado, setCstCOFINSSelecionado] = useState<CSTItem | null>(null);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demonstração dos Seletores Fiscais
          </h1>
          <p className="text-gray-600">
            Teste os seletores inteligentes de NCM, CFOP e CST integrados com a API FOCUS NFE
          </p>
        </div>

        <div className="grid gap-6">
          {/* Seletor de NCM */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">NCM</Badge>
                Seletor de Nomenclatura Comum do Mercosul
              </CardTitle>
              <CardDescription>
                Busque por código NCM (8 dígitos) ou descrição do produto. 
                Integrado com a API FOCUS NFE para validação em tempo real.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SeletorNCM
                value={ncmSelecionado?.codigo}
                onChange={setNcmSelecionado}
                placeholder="Digite o código NCM ou descrição do produto..."
                className="w-full"
              />
              
              {ncmSelecionado && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">NCM Selecionado:</h4>
                  <div className="text-sm text-blue-800">
                    <p><strong>Código:</strong> {ncmSelecionado.codigo}</p>
                    <p><strong>Descrição:</strong> {ncmSelecionado.descricao_completa}</p>
                    <p><strong>Capítulo:</strong> {ncmSelecionado.capitulo}</p>
                    <p><strong>Posição:</strong> {ncmSelecionado.posicao}</p>
                    <p><strong>Subposição:</strong> {ncmSelecionado.subposicao1}.{ncmSelecionado.subposicao2}</p>
                    <p><strong>Item:</strong> {ncmSelecionado.item1}.{ncmSelecionado.item2}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seletores de CFOP */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">CFOP</Badge>
                Seletor de Código Fiscal de Operações e Prestações
              </CardTitle>
              <CardDescription>
                Selecione CFOPs para entrada e saída. Filtre por tipo de operação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CFOP de Entrada
                  </label>
                  <SeletorCFOP
                    value={cfopEntradaSelecionado?.codigo}
                    onChange={setCfopEntradaSelecionado}
                    placeholder="Buscar CFOP de entrada..."
                    tipo="ENTRADA"
                    showTipoFilter={false}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CFOP de Saída
                  </label>
                  <SeletorCFOP
                    value={cfopSaidaSelecionado?.codigo}
                    onChange={setCfopSaidaSelecionado}
                    placeholder="Buscar CFOP de saída..."
                    tipo="SAIDA"
                    showTipoFilter={false}
                  />
                </div>
              </div>

              {(cfopEntradaSelecionado || cfopSaidaSelecionado) && (
                <div className="mt-4 space-y-3">
                  {cfopEntradaSelecionado && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-1">CFOP Entrada:</h4>
                      <p className="text-sm text-blue-800">
                        <strong>{cfopEntradaSelecionado.codigo}</strong> - {cfopEntradaSelecionado.descricao}
                      </p>
                    </div>
                  )}
                  
                  {cfopSaidaSelecionado && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-1">CFOP Saída:</h4>
                      <p className="text-sm text-green-800">
                        <strong>{cfopSaidaSelecionado.codigo}</strong> - {cfopSaidaSelecionado.descricao}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seletores de CST */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">CST</Badge>
                Seletor de Código de Situação Tributária
              </CardTitle>
              <CardDescription>
                Configure os CSTs para cada tipo de imposto (ICMS, IPI, PIS, COFINS).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CST ICMS
                  </label>
                  <SeletorCST
                    value={cstICMSSelecionado?.codigo}
                    onChange={setCstICMSSelecionado}
                    tipo="ICMS"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CST IPI
                  </label>
                  <SeletorCST
                    value={cstIPISelecionado?.codigo}
                    onChange={setCstIPISelecionado}
                    tipo="IPI"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CST PIS
                  </label>
                  <SeletorCST
                    value={cstPISSelecionado?.codigo}
                    onChange={setCstPISSelecionado}
                    tipo="PIS"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CST COFINS
                  </label>
                  <SeletorCST
                    value={cstCOFINSSelecionado?.codigo}
                    onChange={setCstCOFINSSelecionado}
                    tipo="COFINS"
                  />
                </div>
              </div>

              {(cstICMSSelecionado || cstIPISelecionado || cstPISSelecionado || cstCOFINSSelecionado) && (
                <div className="mt-4">
                  <Separator className="mb-4" />
                  <h4 className="font-medium text-gray-900 mb-3">CSTs Selecionados:</h4>
                  <div className="grid gap-2">
                    {cstICMSSelecionado && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm">
                          <Badge variant="outline" className="mr-2">ICMS</Badge>
                          <strong>{cstICMSSelecionado.codigo}</strong> - {cstICMSSelecionado.descricao}
                        </p>
                      </div>
                    )}
                    
                    {cstIPISelecionado && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-sm">
                          <Badge variant="outline" className="mr-2">IPI</Badge>
                          <strong>{cstIPISelecionado.codigo}</strong> - {cstIPISelecionado.descricao}
                        </p>
                      </div>
                    )}
                    
                    {cstPISSelecionado && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm">
                          <Badge variant="outline" className="mr-2">PIS</Badge>
                          <strong>{cstPISSelecionado.codigo}</strong> - {cstPISSelecionado.descricao}
                        </p>
                      </div>
                    )}
                    
                    {cstCOFINSSelecionado && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm">
                          <Badge variant="outline" className="mr-2">COFINS</Badge>
                          <strong>{cstCOFINSSelecionado.codigo}</strong> - {cstCOFINSSelecionado.descricao}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo da Configuração */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Configuração Fiscal</CardTitle>
              <CardDescription>
                Visualize todas as configurações fiscais selecionadas para o produto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">NCM</h4>
                    <p className="text-sm text-gray-600">
                      {ncmSelecionado ? `${ncmSelecionado.codigo} - ${ncmSelecionado.descricao_completa}` : 'Não selecionado'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">CFOPs</h4>
                    <p className="text-sm text-gray-600">
                      Entrada: {cfopEntradaSelecionado ? cfopEntradaSelecionado.codigo : 'Não selecionado'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Saída: {cfopSaidaSelecionado ? cfopSaidaSelecionado.codigo : 'Não selecionado'}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">CSTs</h4>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <p>ICMS: {cstICMSSelecionado ? cstICMSSelecionado.codigo : 'Não selecionado'}</p>
                    <p>IPI: {cstIPISelecionado ? cstIPISelecionado.codigo : 'Não selecionado'}</p>
                    <p>PIS: {cstPISSelecionado ? cstPISSelecionado.codigo : 'Não selecionado'}</p>
                    <p>COFINS: {cstCOFINSSelecionado ? cstCOFINSSelecionado.codigo : 'Não selecionado'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
