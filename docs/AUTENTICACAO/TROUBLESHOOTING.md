# 🔍 Troubleshooting - Sistema de Autenticação

## 🐛 Problema: Autenticação Não Completa

### Sintomas
- Timeout de 3s sendo atingido
- Tela de login fica travada
- Usuário não consegue autenticar
- Logs mostram início mas não fim do `checkUser()`

### Diagnóstico com Logs

Abra o console do navegador e procure pela sequência de logs:

#### ✅ Sequência CORRETA (Funciona)
```
🚀 AuthProvider montado
🔍 checkUser: INÍCIO
📞 checkUser: Criando Supabase client...
✅ checkUser: Supabase client criado
🔐 checkUser: Chamando getSession()...
✅ checkUser: getSession() retornou
✅ checkUser: Sessão encontrada para [email]
💾 checkUser: Definindo usuário básico...
✅ checkUser: Usuário definido!
🎯 checkUser: Liberando UI...
✅ checkUser: UI LIBERADA!
🔄 checkUser: Iniciando busca de profile em background...
🏁 checkUser: FIM (sucesso)
✅ Background: Profile carregado
```

#### ❌ Sequência INCORRETA (Trava)
```
🚀 AuthProvider montado
🔍 checkUser: INÍCIO
📞 checkUser: Criando Supabase client...
✅ checkUser: Supabase client criado
🔐 checkUser: Chamando getSession()...
[TRAVA AQUI - não aparece mais nada]
⚠️ Timeout de autenticação atingido após 3s
```

### Soluções

#### Solução 1: Problema no Supabase Client

Se os logs param em "Chamando getSession()", o problema pode ser:

**Causa**: Configuração inválida do Supabase

**Verificar**:
```bash
# Abra .env.local e verifique:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

**Testar**:
```typescript
// No console do navegador:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

**Solução**:
1. Verificar se as variáveis estão corretas
2. Reiniciar o servidor dev (`npm run dev`)
3. Limpar cache do navegador (Ctrl+Shift+Delete)

#### Solução 2: Problema de Rede

**Causa**: Não consegue conectar ao Supabase

**Verificar**:
1. Abra DevTools → Network
2. Procure por requisições para `supabase.co`
3. Veja se há erros (vermelho)

**Solução**:
1. Verificar conexão com internet
2. Verificar firewall/antivírus
3. Testar em outra rede
4. Verificar se Supabase está online: https://status.supabase.com/

#### Solução 3: Tabela users_profile Não Existe

**Causa**: Profile não pode ser buscado

**Verificar**:
```sql
-- No Supabase SQL Editor:
SELECT * FROM users_profile LIMIT 1;
```

**Solução**:
```sql
-- Criar tabela se não existir:
CREATE TABLE IF NOT EXISTS users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nome TEXT,
  role TEXT NOT NULL DEFAULT 'viewer',
  empresa_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Solução 4: RLS Bloqueando Acesso

**Causa**: Row Level Security impedindo leitura

**Verificar**:
```sql
-- No Supabase SQL Editor:
SELECT * FROM pg_policies WHERE tablename = 'users_profile';
```

**Solução Temporária** (apenas para teste):
```sql
-- ATENÇÃO: Só para DEBUG!
ALTER TABLE users_profile DISABLE ROW LEVEL SECURITY;
```

**Solução Permanente**:
```sql
-- Política correta:
CREATE POLICY "Users can view own profile" 
ON users_profile FOR SELECT 
USING (auth.uid() = id);
```

#### Solução 5: Limpar Estado do Navegador

**Causa**: Cache ou sessão corrompida

**Solução**:
1. Abrir DevTools (F12)
2. Application → Storage → Clear site data
3. Ou no console:
```javascript
// Limpar tudo:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Comandos Úteis de Debug

#### Ver Sessão Atual
```javascript
// No console do navegador:
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const { data, error } = await supabase.auth.getSession()
console.log('Sessão:', data)
console.log('Erro:', error)
```

#### Testar Conexão com Supabase
```javascript
// No console do navegador:
fetch('https://[SEU-PROJETO].supabase.co/rest/v1/')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

#### Ver Usuário Autenticado
```javascript
// No console do navegador:
const { data: { user } } = await supabase.auth.getUser()
console.log('Usuário:', user)
```

### Checklist Completo

Quando a autenticação não funcionar, verifique:

- [ ] ✅ Variáveis de ambiente estão corretas
- [ ] ✅ Servidor dev está rodando
- [ ] ✅ Supabase está online
- [ ] ✅ Tabela `users_profile` existe
- [ ] ✅ Políticas RLS estão corretas
- [ ] ✅ Conexão com internet funciona
- [ ] ✅ Nenhum firewall bloqueando
- [ ] ✅ Cache do navegador está limpo
- [ ] ✅ Sem erros no console
- [ ] ✅ Sem erros no Network tab

### Logs de Debug Avançados

Se ainda não funcionar, ative logs super detalhados:

**1. Modificar temporariamente `logger.ts`**:
```typescript
// Forçar logs em produção (APENAS PARA DEBUG!)
const isDev = true; // Temporariamente sempre true

export const logger = {
  info: (...args: any[]) => console.log(...args),
  debug: (...args: any[]) => console.log(...args),
  warn: (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args),
};
```

**2. Ver TODOS os eventos do Supabase**:
```typescript
// Adicionar em useAuth.tsx temporariamente:
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🎯 EVENTO SUPABASE:', {
    event,
    session: session ? 'existe' : 'null',
    user: session?.user?.email || 'sem user'
  });
});
```

### Quando Tudo Falhar

**Reset Completo**:

```bash
# 1. Parar servidor
Ctrl+C

# 2. Limpar node_modules e cache
rm -rf node_modules .next
npm install

# 3. Limpar navegador
# DevTools → Application → Clear site data

# 4. Reiniciar servidor
npm run dev

# 5. Testar em aba anônima
Ctrl+Shift+N
```

### Contato para Suporte

Se nada funcionar, reporte o problema com:

1. **Logs completos do console**
2. **Screenshot do Network tab**
3. **Versão do Node**: `node --version`
4. **Versão do Next**: Ver `package.json`
5. **Sistema operacional**
6. **Navegador e versão**

---

**Última atualização**: 2025-10-22  
**Versão**: 3.0.0  
**Responsável**: Marcos Rocha + Claude


