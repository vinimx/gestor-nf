#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 Testando APIs do Gestor de Notas Fiscais...\n');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('❌ Variáveis de ambiente não configuradas!');
  console.log('   Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local\n');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente configuradas');
console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`);

// Testar conexão com Supabase
async function testSupabaseConnection() {
  try {
    console.log('🔗 Testando conexão com Supabase...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (response.ok) {
      console.log('✅ Conexão com Supabase estabelecida\n');
      return true;
    } else {
      console.log(`❌ Erro na conexão: ${response.status} ${response.statusText}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro na conexão: ${error.message}\n`);
    return false;
  }
}

// Testar se as tabelas existem
async function testTables() {
  try {
    console.log('📋 Testando existência das tabelas...');
    
    const tables = ['empresas', 'users_profile', 'notas_fiscais', 'itens_nota', 'impostos_nota'];
    
    for (const table of tables) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (response.ok) {
        console.log(`✅ Tabela ${table} existe`);
      } else {
        console.log(`❌ Tabela ${table} não existe ou não está acessível`);
      }
    }
    console.log('');
  } catch (error) {
    console.log(`❌ Erro ao testar tabelas: ${error.message}\n`);
  }
}

// Testar se os buckets de storage existem
async function testStorageBuckets() {
  try {
    console.log('🗂️ Testando buckets de storage...');
    
    const buckets = ['nf-xml', 'nf-pdf', 'profile-avatars'];
    
    for (const bucket of buckets) {
      const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${bucket}`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (response.ok) {
        console.log(`✅ Bucket ${bucket} existe`);
      } else {
        console.log(`❌ Bucket ${bucket} não existe`);
      }
    }
    console.log('');
  } catch (error) {
    console.log(`❌ Erro ao testar buckets: ${error.message}\n`);
  }
}

// Executar todos os testes
async function runTests() {
  const connected = await testSupabaseConnection();
  
  if (connected) {
    await testTables();
    await testStorageBuckets();
  }
  
  console.log('🎉 Testes concluídos!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Execute as migrações se alguma tabela estiver faltando');
  console.log('2. Configure os buckets de storage se necessário');
  console.log('3. Execute: npm run dev');
}

runTests().catch(console.error);
