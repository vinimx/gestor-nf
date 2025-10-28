// Script para aplicar migração de produtos no Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🚀 Aplicando migração de produtos...');
    
    // Ler arquivo de migração
    const migrationPath = path.join(__dirname, '../supabase/migrations/005_create_produtos_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Executar migração
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Erro ao aplicar migração:', error);
      process.exit(1);
    }
    
    console.log('✅ Migração aplicada com sucesso!');
    
    // Verificar se as tabelas foram criadas
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['produtos', 'categorias_produtos']);
    
    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError);
    } else {
      console.log('📋 Tabelas criadas:', tables.map(t => t.table_name));
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    process.exit(1);
  }
}

applyMigration();
