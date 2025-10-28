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
    console.log('🚀 Criando tabelas de produtos...');
    
    // 1. Criar tabela categorias_produtos
    console.log('📋 Criando tabela categorias_produtos...');
    const { error: categoriasError } = await supabase
      .from('categorias_produtos')
      .select('count')
      .limit(1);
    
    if (categoriasError && categoriasError.code === 'PGRST116') {
      console.log('Tabela categorias_produtos não existe, criando...');
      // A tabela não existe, vamos criar via SQL direto
      const { error: createCategoriasError } = await supabase
        .rpc('exec', {
          sql: `
            CREATE TABLE categorias_produtos (
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
      
      if (createCategoriasError) {
        console.error('❌ Erro ao criar categorias_produtos:', createCategoriasError);
      } else {
        console.log('✅ Tabela categorias_produtos criada');
      }
    } else {
      console.log('✅ Tabela categorias_produtos já existe');
    }
    
    // 2. Criar tabela produtos
    console.log('📦 Criando tabela produtos...');
    const { error: produtosError } = await supabase
      .from('produtos')
      .select('count')
      .limit(1);
    
    if (produtosError && produtosError.code === 'PGRST116') {
      console.log('Tabela produtos não existe, criando...');
      const { error: createProdutosError } = await supabase
        .rpc('exec', {
          sql: `
            CREATE TABLE produtos (
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
      
      if (createProdutosError) {
        console.error('❌ Erro ao criar produtos:', createProdutosError);
      } else {
        console.log('✅ Tabela produtos criada');
      }
    } else {
      console.log('✅ Tabela produtos já existe');
    }
    
    // 3. Verificar se as tabelas existem agora
    console.log('🔍 Verificando tabelas...');
    
    const { data: produtos, error: produtosCheckError } = await supabase
      .from('produtos')
      .select('count')
      .limit(1);
    
    const { data: categorias, error: categoriasCheckError } = await supabase
      .from('categorias_produtos')
      .select('count')
      .limit(1);
    
    if (produtosCheckError) {
      console.error('❌ Erro ao verificar tabela produtos:', produtosCheckError);
    } else {
      console.log('✅ Tabela produtos: OK');
    }
    
    if (categoriasCheckError) {
      console.error('❌ Erro ao verificar tabela categorias_produtos:', categoriasCheckError);
    } else {
      console.log('✅ Tabela categorias_produtos: OK');
    }
    
    console.log('🎉 FASE 3 - Verificação concluída!');
    console.log('📝 Execute o script SQL no Supabase Dashboard para criar as tabelas definitivamente.');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createTables();
