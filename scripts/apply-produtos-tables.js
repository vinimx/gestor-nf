const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.error('Verifique se NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    console.log('🚀 Aplicando script de criação de tabelas...');
    
    // Script SQL simplificado
    const sql = `
      -- Criar tabela categorias_produtos se não existir
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

      -- Criar tabela produtos se não existir
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

      -- Habilitar RLS
      ALTER TABLE categorias_produtos ENABLE ROW LEVEL SECURITY;
      ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

      -- Criar políticas RLS para categorias_produtos
      DROP POLICY IF EXISTS categorias_select_policy ON categorias_produtos;
      CREATE POLICY categorias_select_policy ON categorias_produtos
        FOR SELECT USING (
          empresa_id IN (
            SELECT empresa_id FROM users_profile
            WHERE id = auth.uid() AND role IN ('admin', 'accountant')
          )
        );

      DROP POLICY IF EXISTS categorias_all_policy ON categorias_produtos;
      CREATE POLICY categorias_all_policy ON categorias_produtos
        FOR ALL USING (
          empresa_id IN (
            SELECT empresa_id FROM users_profile
            WHERE id = auth.uid() AND role IN ('admin', 'accountant')
          )
        );

      -- Criar políticas RLS para produtos
      DROP POLICY IF EXISTS produtos_select_policy ON produtos;
      CREATE POLICY produtos_select_policy ON produtos
        FOR SELECT USING (
          empresa_id IN (
            SELECT empresa_id FROM users_profile
            WHERE id = auth.uid() AND role IN ('admin', 'accountant')
          )
        );

      DROP POLICY IF EXISTS produtos_all_policy ON produtos;
      CREATE POLICY produtos_all_policy ON produtos
        FOR ALL USING (
          empresa_id IN (
            SELECT empresa_id FROM users_profile
            WHERE id = auth.uid() AND role IN ('admin', 'accountant')
          )
        );

      -- Criar índices
      CREATE INDEX IF NOT EXISTS idx_produtos_empresa_id ON produtos(empresa_id);
      CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON produtos(empresa_id, codigo);
      CREATE INDEX IF NOT EXISTS idx_produtos_categoria_id ON produtos(categoria_id);
      CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(empresa_id, ativo);
      CREATE INDEX IF NOT EXISTS idx_produtos_tipo ON produtos(empresa_id, tipo);
      CREATE INDEX IF NOT EXISTS idx_produtos_ncm ON produtos(ncm);
      CREATE INDEX IF NOT EXISTS idx_categorias_empresa_id ON categorias_produtos(empresa_id);
      CREATE INDEX IF NOT EXISTS idx_categorias_ativo ON categorias_produtos(empresa_id, ativo);

      -- Criar trigger para updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_produtos_updated_at ON produtos;
      CREATE TRIGGER update_produtos_updated_at
          BEFORE UPDATE ON produtos
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_categorias_updated_at ON categorias_produtos;
      CREATE TRIGGER update_categorias_updated_at
          BEFORE UPDATE ON categorias_produtos
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `;
    
    // Executar o script SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ Erro ao executar script:', error);
      return;
    }
    
    console.log('✅ Tabelas criadas com sucesso!');
    console.log('📊 Verificando tabelas...');
    
    // Verificar se as tabelas foram criadas
    const { data: produtos, error: produtosError } = await supabase
      .from('produtos')
      .select('count')
      .limit(1);
    
    const { data: categorias, error: categoriasError } = await supabase
      .from('categorias_produtos')
      .select('count')
      .limit(1);
    
    if (produtosError) {
      console.error('❌ Erro ao verificar tabela produtos:', produtosError);
    } else {
      console.log('✅ Tabela produtos: OK');
    }
    
    if (categoriasError) {
      console.error('❌ Erro ao verificar tabela categorias_produtos:', categoriasError);
    } else {
      console.log('✅ Tabela categorias_produtos: OK');
    }
    
    console.log('🎉 FASE 3 - Tabelas de produtos criadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createTables();
