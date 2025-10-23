# ⚡ Guia Rápido: Fix do Erro 500

## 🎯 O Problema

**Erro**: `42P17 - infinite recursion detected in policy for relation "users_profile"`

**Tradução**: As políticas RLS estavam causando um loop infinito.

---

## ✅ Solução em 3 Passos

### **PASSO 1: Executar o Script SQL** 🛠️

1. Abra o **Supabase SQL Editor**
2. Abra o arquivo: **`docs/AUTENTICACAO/FIX-RLS-SEM-RECURSAO.sql`**
3. **Copie TODO o conteúdo** do arquivo
4. **Cole** no SQL Editor
5. Clique em **Run** (Executar)
6. Aguarde até ver as mensagens de sucesso

**Resultado esperado**:
```
✅ Políticas antigas removidas
✅ Profile atualizado para admin!
✅ Permissões configuradas!
✅ Políticas RLS criadas sem recursão!
✅ 4 políticas criadas
```

---

### **PASSO 2: Limpar o Cache** 🧹

1. No navegador, pressione: **Ctrl + Shift + Delete**
2. Marque:
   - ☑️ Cookies e dados de sites
   - ☑️ Imagens e arquivos em cache
3. Clique em **Limpar dados**
4. **Feche COMPLETAMENTE** o navegador
5. **Reabra** o navegador

---

### **PASSO 3: Testar** 🧪

1. Acesse: `http://localhost:3001`
2. Faça **login** novamente
3. Abra o **Console** (F12)
4. **Procure por**:
   - ✅ `✅ Profile carregado com sucesso`
   - ❌ **NÃO** deve ter mais erro 500

---

## 🎉 Pronto!

Se você viu as mensagens de sucesso e não há mais erro 500, **está funcionando**!

---

## ❓ Ainda Tem Erro?

Se o erro 500 persistir, me envie:

1. **Output completo** do SQL Editor (copie e cole)
2. **Logs do console** do navegador (os últimos 20-30 logs)
3. **Screenshot** do erro (se possível)

---

## 📖 Quer Entender Melhor?

Leia: **`docs/AUTENTICACAO/EXPLICACAO-RECURSAO-INFINITA.md`**

Lá eu explico:
- Por que aconteceu o erro
- Como a solução funciona
- O que cada política faz
- Próximos passos (se necessário)

