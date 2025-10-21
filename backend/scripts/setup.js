#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando o Gestor de Notas Fiscais...\n');

// Verificar se o arquivo .env.local existe
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Criando arquivo .env.local...');
  
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env.local criado!');
  console.log('⚠️  Lembre-se de configurar suas credenciais do Supabase no arquivo .env.local\n');
} else {
  console.log('✅ Arquivo .env.local já existe\n');
}

// Verificar se as dependências estão instaladas
console.log('📦 Verificando dependências...');
try {
  require('@supabase/supabase-js');
  require('zod');
  require('fast-xml-parser');
  console.log('✅ Todas as dependências estão instaladas\n');
} catch (error) {
  console.log('❌ Algumas dependências estão faltando. Execute: npm install\n');
}

// Verificar se o Supabase CLI está instalado
console.log('🔧 Verificando Supabase CLI...');
try {
  execSync('supabase --version', { stdio: 'pipe' });
  console.log('✅ Supabase CLI está instalado\n');
} catch (error) {
  console.log('❌ Supabase CLI não está instalado.');
  console.log('   Instale com: npm install -g supabase\n');
}

console.log('🎉 Setup concluído!\n');
console.log('📋 Próximos passos:');
console.log('1. Configure suas credenciais do Supabase no arquivo .env.local');
console.log('2. Execute as migrações no Supabase Dashboard');
console.log('3. Configure os buckets de storage (nf-xml, nf-pdf, profile-avatars)');
console.log('4. Execute: npm run dev');
console.log('\n📚 Consulte o README.md para instruções detalhadas');
