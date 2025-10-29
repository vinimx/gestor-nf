// Script para testar o token da FOCUS NFE
const testToken = async () => {
  try {
    console.log('🔑 Testando token da FOCUS NFE...\n');
    
    // Simular a autenticação que está sendo feita
    const token = process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN;
    const environment = process.env.NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT || 'homologacao';
    
    console.log('📋 Configurações:');
    console.log('Token configurado:', token ? 'Sim' : 'Não');
    console.log('Token (primeiros 10 chars):', token ? token.substring(0, 10) + '...' : 'Não configurado');
    console.log('Ambiente:', environment);
    
    if (!token) {
      console.log('\n❌ ERRO: Token não configurado!');
      console.log('Configure NEXT_PUBLIC_FOCUS_NFE_TOKEN no arquivo .env.local');
      return;
    }
    
    // URL base
    const baseUrl = environment === 'homologacao' 
      ? 'https://homologacao.focusnfe.com.br' 
      : 'https://api.focusnfe.com.br';
    
    console.log('\n🌐 URL base:', baseUrl);
    
    // Testar autenticação com um endpoint simples
    console.log('\n🧪 Testando autenticação...');
    
    const authHeader = `Basic ${Buffer.from(token + ':').toString('base64')}`;
    console.log('Header de autenticação:', authHeader.substring(0, 20) + '...');
    
    // Teste 1: Endpoint de NCMs
    console.log('\n1️⃣ Testando endpoint de NCMs...');
    try {
      const response = await fetch(`${baseUrl}/v2/ncms?limit=1`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ SUCESSO: Token válido!');
        console.log('Dados recebidos:', data.length, 'NCMs');
        console.log('Primeiro NCM:', data[0]?.codigo, data[0]?.descricao_completa?.substring(0, 50) + '...');
      } else {
        const errorText = await response.text();
        console.log('❌ ERRO:', response.status, errorText);
        
        if (response.status === 401) {
          console.log('\n🚨 DIAGNÓSTICO 401:');
          console.log('- Token pode estar inválido ou expirado');
          console.log('- Verifique se o token está correto no painel da FOCUS NFE');
          console.log('- Confirme se a conta tem acesso à API');
        }
      }
    } catch (error) {
      console.log('❌ Erro de rede:', error.message);
    }
    
    // Teste 2: Endpoint de CFOPs
    console.log('\n2️⃣ Testando endpoint de CFOPs...');
    try {
      const response = await fetch(`${baseUrl}/v2/cfops?limit=1`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ SUCESSO: Token válido para CFOPs!');
        console.log('Dados recebidos:', data.length, 'CFOPs');
        console.log('Primeiro CFOP:', data[0]?.codigo, data[0]?.descricao?.substring(0, 50) + '...');
      } else {
        const errorText = await response.text();
        console.log('❌ ERRO:', response.status, errorText);
      }
    } catch (error) {
      console.log('❌ Erro de rede:', error.message);
    }
    
    console.log('\n💡 SOLUÇÕES POSSÍVEIS:');
    console.log('=====================');
    console.log('1. Verifique o token no painel da FOCUS NFE');
    console.log('2. Confirme se a conta tem acesso à API');
    console.log('3. Teste com um novo token');
    console.log('4. Verifique se está usando o ambiente correto (homologacao/producao)');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

testToken();
