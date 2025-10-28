// Script para aplicar migração de produtos no Supabase remoto
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase (você precisa configurar essas variáveis)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jnatmqincwcetplbtmpo.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada');
  console.error('Configure a variável de ambiente SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🚀 Aplicando migração de produtos no Supabase remoto...');
    
    // Ler arquivo de migração
    const migrationPath = path.join(__dirname, '../supabase/migrations/005_create_produtos_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Conteúdo da migração:');
    console.log(migrationSQL.substring(0, 200) + '...');
    
    // Executar migração usando RPC
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Erro ao aplicar migração:', error);
      
      // Tentar executar as queries individualmente
      console.log('🔄 Tentando executar queries individualmente...');
      
      const queries = migrationSQL.split(';').filter(q => q.trim());
      
      for (const query of queries) {
        if (query.trim()) {
          console.log('📝 Executando:', query.substring(0, 50) + '...');
          
          const { error: queryError } = await supabase.rpc('exec_sql', {
            sql: query + ';'
          });
          
          if (queryError) {
            console.error('❌ Erro na query:', queryError);
          } else {
            console.log('✅ Query executada com sucesso');
          }
        }
      }
    } else {
      console.log('✅ Migração aplicada com sucesso!');
    }
    
    // Verificar se as tabelas foram criadas
    console.log('🔍 Verificando tabelas criadas...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['produtos', 'categorias_produtos']);
    
    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError);
    } else {
      console.log('📋 Tabelas encontradas:', tables.map(t => t.table_name));
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

applyMigration();
