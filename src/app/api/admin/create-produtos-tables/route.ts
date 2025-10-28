import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin();
    
    console.log('🚀 Criando tabelas de produtos...');
    
    // 1. Criar tabela categorias_produtos
    console.log('📝 Criando tabela categorias_produtos...');
    const { error: categoriaError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS categorias_produtos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
          nome VARCHAR(100) NOT NULL,
          descricao TEXT,
          ativo BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(empresa_id, nome)
        );
      `
    });
    
    if (categoriaError) {
      console.error('❌ Erro ao criar categorias_produtos:', categoriaError);
      return NextResponse.json({ error: 'Erro ao criar categorias_produtos', details: categoriaError }, { status: 500 });
    }
    
    // 2. Criar tabela produtos
    console.log('📝 Criando tabela produtos...');
    const { error: produtoError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS produtos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
          categoria_id UUID REFERENCES categorias_produtos(id) ON DELETE SET NULL,
          codigo VARCHAR(50) NOT NULL,
          nome VARCHAR(255) NOT NULL,
          descricao TEXT,
          tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('PRODUTO', 'SERVICO')) DEFAULT 'PRODUTO',
          unidade VARCHAR(10) NOT NULL,
          preco_venda DECIMAL(15,2) NOT NULL,
          custo DECIMAL(15,2),
          ncm VARCHAR(10) NOT NULL,
          cfop_saida VARCHAR(4) NOT NULL,
          cfop_entrada VARCHAR(4) NOT NULL,
          aliquota_icms DECIMAL(5,2) NOT NULL DEFAULT 0,
          aliquota_ipi DECIMAL(5,2) DEFAULT 0,
          aliquota_pis DECIMAL(5,2) DEFAULT 0,
          aliquota_cofins DECIMAL(5,2) DEFAULT 0,
          icms_situacao_tributaria VARCHAR(2) DEFAULT '00',
          icms_origem VARCHAR(1) DEFAULT '0',
          icms_modalidade_base_calculo VARCHAR(2) DEFAULT '0',
          icms_reducao_base_calculo DECIMAL(5,2) DEFAULT 0,
          ipi_codigo_enquadramento VARCHAR(3),
          ipi_situacao_tributaria VARCHAR(2) DEFAULT '00',
          pis_situacao_tributaria VARCHAR(2) DEFAULT '01',
          cofins_situacao_tributaria VARCHAR(2) DEFAULT '01',
          ativo BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(empresa_id, codigo)
        );
      `
    });
    
    if (produtoError) {
      console.error('❌ Erro ao criar produtos:', produtoError);
      return NextResponse.json({ error: 'Erro ao criar produtos', details: produtoError }, { status: 500 });
    }
    
    // 3. Criar índices
    console.log('📝 Criando índices...');
    const { error: indexError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_categorias_produtos_empresa_id ON categorias_produtos(empresa_id);
        CREATE INDEX IF NOT EXISTS idx_categorias_produtos_ativo ON categorias_produtos(empresa_id, ativo);
        CREATE INDEX IF NOT EXISTS idx_produtos_empresa_id ON produtos(empresa_id);
        CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON produtos(empresa_id, codigo);
        CREATE INDEX IF NOT EXISTS idx_produtos_categoria_id ON produtos(categoria_id);
        CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(empresa_id, ativo);
        CREATE INDEX IF NOT EXISTS idx_produtos_tipo ON produtos(empresa_id, tipo);
        CREATE INDEX IF NOT EXISTS idx_produtos_ncm ON produtos(ncm);
      `
    });
    
    if (indexError) {
      console.error('❌ Erro ao criar índices:', indexError);
    }
    
    // 4. Habilitar RLS
    console.log('📝 Configurando RLS...');
    const { error: rlsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE categorias_produtos ENABLE ROW LEVEL SECURITY;
        ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (rlsError) {
      console.error('❌ Erro ao configurar RLS:', rlsError);
    }
    
    // 5. Criar políticas RLS
    console.log('📝 Criando políticas RLS...');
    const { error: policyError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        -- Políticas para categorias
        CREATE POLICY IF NOT EXISTS "Usuários podem ver categorias da sua empresa" ON categorias_produtos
          FOR SELECT USING (
            empresa_id IN (
              SELECT empresa_id FROM user_profiles 
              WHERE id = auth.uid() AND role IN ('admin', 'accountant')
            )
          );

        CREATE POLICY IF NOT EXISTS "Usuários podem gerenciar categorias da sua empresa" ON categorias_produtos
          FOR ALL USING (
            empresa_id IN (
              SELECT empresa_id FROM user_profiles 
              WHERE id = auth.uid() AND role IN ('admin', 'accountant')
            )
          );

        -- Políticas para produtos
        CREATE POLICY IF NOT EXISTS "Usuários podem ver produtos da sua empresa" ON produtos
          FOR SELECT USING (
            empresa_id IN (
              SELECT empresa_id FROM user_profiles 
              WHERE id = auth.uid() AND role IN ('admin', 'accountant')
            )
          );

        CREATE POLICY IF NOT EXISTS "Usuários podem gerenciar produtos da sua empresa" ON produtos
          FOR ALL USING (
            empresa_id IN (
              SELECT empresa_id FROM user_profiles 
              WHERE id = auth.uid() AND role IN ('admin', 'accountant')
            )
          );
      `
    });
    
    if (policyError) {
      console.error('❌ Erro ao criar políticas:', policyError);
    }
    
    // 6. Criar triggers para updated_at
    console.log('📝 Criando triggers...');
    const { error: triggerError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        -- Função para updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        -- Triggers
        DROP TRIGGER IF EXISTS update_categorias_produtos_updated_at ON categorias_produtos;
        CREATE TRIGGER update_categorias_produtos_updated_at 
          BEFORE UPDATE ON categorias_produtos 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_produtos_updated_at ON produtos;
        CREATE TRIGGER update_produtos_updated_at 
          BEFORE UPDATE ON produtos 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    });
    
    if (triggerError) {
      console.error('❌ Erro ao criar triggers:', triggerError);
    }
    
    // 7. Inserir categoria padrão
    console.log('📝 Inserindo categoria padrão...');
    const { error: insertError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        INSERT INTO categorias_produtos (empresa_id, nome, descricao) 
        SELECT 
          id as empresa_id,
          'Geral' as nome,
          'Categoria padrão para produtos' as descricao
        FROM empresas
        ON CONFLICT (empresa_id, nome) DO NOTHING;
      `
    });
    
    if (insertError) {
      console.error('❌ Erro ao inserir categoria padrão:', insertError);
    }
    
    console.log('🎉 Migração concluída com sucesso!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Tabelas de produtos criadas com sucesso!' 
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor', 
      details: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}
