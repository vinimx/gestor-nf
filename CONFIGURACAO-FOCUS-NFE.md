# Configuração da API FOCUS NFE

## 🔑 **Configuração do Token**

Para usar a API real da FOCUS NFE, você precisa configurar seu token de autenticação.

### **1. Obter Token da FOCUS NFE**

1. Acesse [https://focusnfe.com.br](https://focusnfe.com.br)
2. Crie uma conta ou faça login
3. Acesse o painel da API
4. Gere um token de acesso
5. Copie o token gerado

### **2. Configurar Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# Configurações da FOCUS NFE
NEXT_PUBLIC_FOCUS_API_URL=https://api.focusnfe.com.br
FOCUS_API_TOKEN=seu_token_aqui
FOCUS_API_ENVIRONMENT=homologacao

# Configurações do Supabase (se necessário)
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_supabase
```

### **3. Ambientes Disponíveis**

- **homologacao**: Ambiente de testes (recomendado para desenvolvimento)
- **producao**: Ambiente de produção (apenas para uso em produção)

## 🚀 **Funcionalidades Implementadas**

### **✅ Integração Híbrida**
- **API Real**: Usa a API da FOCUS NFE quando o token está configurado
- **Fallback Local**: Usa dados mock quando a API não está disponível
- **Validação Robusta**: Sistema de validação completo

### **✅ Endpoints Implementados**
- **NCM**: Consulta e busca de códigos NCM
- **CFOP**: Consulta e busca de códigos CFOP
- **CSTs**: Códigos de Situação Tributária para ICMS, IPI, PIS, COFINS
- **Validação**: Validação completa de produtos

### **✅ Estratégia de Fallback**
1. **Primeiro**: Tenta usar a API real da FOCUS NFE
2. **Segundo**: Se falhar, usa dados mock locais
3. **Terceiro**: Se não houver token, usa apenas dados locais

## 🔧 **Como Funciona**

### **Sem Token Configurado**
- Sistema usa dados mock locais
- Funciona offline
- Ideal para desenvolvimento

### **Com Token Configurado**
- Sistema tenta usar API real primeiro
- Fallback para dados locais se API falhar
- Dados sempre atualizados da FOCUS NFE

## 📊 **Status da Integração**

- ✅ **NCM**: Integração completa com API real
- ✅ **CFOP**: Integração completa com API real
- ✅ **CSTs**: Integração completa com API real
- ✅ **Validação**: Sistema híbrido funcionando
- ✅ **Fallback**: Sistema de fallback robusto

## 🎯 **Próximos Passos**

1. **Configure seu token** no arquivo `.env.local`
2. **Teste a integração** com dados reais
3. **Monitore os logs** para verificar funcionamento
4. **Ajuste configurações** conforme necessário

## 🔍 **Verificação**

Para verificar se a integração está funcionando:

1. Abra o console do navegador
2. Tente validar um produto
3. Verifique os logs para ver se está usando API real ou fallback
4. Mensagens de log indicam a fonte dos dados

---

**A integração está pronta para uso! Configure seu token e comece a usar a API real da FOCUS NFE.**
