// Script para testar conexão com Supabase
const { createClient } = require('@supabase/supabase-js');

// Usar URL pública do Supabase
const supabaseUrl = 'https://jnatmqincwcetplbtmpo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudGFtcWluY3djZXRwbGJ0bXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MzQ5NzQsImV4cCI6MjA0ODMxMDk3NH0.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    
    // Testar conexão básica
    const { data, error } = await supabase
      .from('empresas')
      .select('id, nome')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
    } else {
      console.log('✅ Conexão funcionando');
      console.log('📊 Dados encontrados:', data);
    }
    
    // Verificar se as tabelas existem
    console.log('🔍 Verificando tabelas...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['produtos', 'categorias_produtos']);
    
    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError);
    } else {
      console.log('📋 Tabelas encontradas:', tables.map(t => t.table_name));
      
      if (tables.length === 0) {
        console.log('⚠️ Tabelas de produtos não existem. Precisa criar.');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testConnection();
