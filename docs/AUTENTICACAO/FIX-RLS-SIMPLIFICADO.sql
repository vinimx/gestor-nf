-- =====================================================
-- FIX DEFINITIVO: RLS SIMPLIFICADO (SEM ROLES)
-- =====================================================
-- NOVA ARQUITETURA: Todos os usuários têm acesso completo
-- Não há mais verificação de roles (admin, accountant, viewer)
-- Acesso é apenas para o escritório (todos são admins)
-- =====================================================

BEGIN;

-- ========================================
-- PASSO 1: LIMPEZA TOTAL
-- ========================================

-- 1.1: Remover TODAS as políticas existentes
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users_profile'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users_profile', pol.policyname);
        RAISE NOTICE '🗑️  Política removida: %', pol.policyname;
    END LOOP;
END $$;

-- 1.2: Desabilitar RLS temporariamente
ALTER TABLE users_profile DISABLE ROW LEVEL SECURITY;

-- ========================================
-- PASSO 2: VERIFICAR/CRIAR PROFILE
-- ========================================

-- 2.1: Atualizar todos os usuários para role 'admin' (padrão)
UPDATE users_profile 
SET role = 'admin' 
WHERE role IS NULL OR role != 'admin';

-- 2.2: Garantir que seu profile existe como admin
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users_profile 
        WHERE id = 'aadd1d32-c7e4-41dd-85c3-ba1f68729000'
    ) THEN
        -- Criar se não existir
        INSERT INTO users_profile (id, email, role)
        VALUES (
            'aadd1d32-c7e4-41dd-85c3-ba1f68729000',
            'fiscal@ranicont.com.br',
            'admin'
        );
        RAISE NOTICE '✅ Profile criado com sucesso!';
    ELSE
        -- Confirmar que está como admin
        UPDATE users_profile 
        SET role = 'admin' 
        WHERE id = 'aadd1d32-c7e4-41dd-85c3-ba1f68729000';
        RAISE NOTICE '✅ Profile atualizado para admin!';
    END IF;
END $$;

-- ========================================
-- PASSO 3: PERMISSÕES DA TABELA
-- ========================================

-- 3.1: Garantir permissões completas para authenticated
GRANT ALL ON TABLE users_profile TO authenticated;
GRANT ALL ON TABLE users_profile TO service_role;

-- 3.2: Permitir anon apenas INSERT (para signup)
GRANT SELECT, INSERT ON TABLE users_profile TO anon;

-- ✅ Permissões configuradas!

-- ========================================
-- PASSO 4: HABILITAR RLS COM POLÍTICAS SIMPLIFICADAS
-- ========================================

-- 4.1: Habilitar RLS
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

-- 4.2: Política ÚNICA - Usuários autenticados podem ver e editar SEU PRÓPRIO perfil
CREATE POLICY "authenticated_users_all_own_profile"
ON users_profile
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4.3: Política para anon (signup)
CREATE POLICY "anon_insert_on_signup"
ON users_profile
FOR INSERT
TO anon
WITH CHECK (true);

-- ✅ Políticas RLS simplificadas criadas!

COMMIT;

-- ========================================
-- PASSO 5: VERIFICAÇÕES FINAIS
-- ========================================

-- 5.1: Confirmar que RLS está habilitado
SELECT 
    '✅ RLS Status' as "Verificação",
    CASE 
        WHEN rowsecurity THEN '🟢 HABILITADO' 
        ELSE '🔴 DESABILITADO' 
    END as "Status"
FROM pg_tables 
WHERE tablename = 'users_profile';

-- 5.2: Contar políticas ativas
SELECT 
    '✅ Total de Políticas' as "Verificação",
    COUNT(*)::text || ' políticas' as "Status"
FROM pg_policies 
WHERE tablename = 'users_profile';

-- 5.3: Listar todas as políticas
SELECT 
    '📋 ' || policyname as "Nome da Política",
    cmd as "Comando",
    CASE 
        WHEN roles = '{authenticated}' THEN '🔐 Authenticated'
        WHEN roles = '{anon}' THEN '👤 Anonymous'
        ELSE roles::text
    END as "Para Quem"
FROM pg_policies 
WHERE tablename = 'users_profile'
ORDER BY policyname;

-- 5.4: Verificar seu profile
SELECT 
    '✅ Seu Profile' as "Verificação",
    '🔴 ADMIN' as "Acesso",
    email as "Email"
FROM users_profile 
WHERE id = 'aadd1d32-c7e4-41dd-85c3-ba1f68729000';

-- 5.5: Contar total de usuários
SELECT 
    '👥 Total de Usuários' as "Verificação",
    COUNT(*)::text || ' usuários' as "Total",
    'Todos são admins agora' as "Observação"
FROM users_profile;

-- 5.6: Testar query simples (deve funcionar!)
SELECT 
    '🧪 Teste de Query' as "Verificação",
    'Executando SELECT * FROM users_profile...' as "Ação";

-- Isso deve retornar seu profile SEM ERRO 500!
SELECT * FROM users_profile 
WHERE id = 'aadd1d32-c7e4-41dd-85c3-ba1f68729000';

-- ========================================
-- RESULTADO ESPERADO
-- ========================================
-- ✅ RLS habilitado
-- ✅ 2 políticas criadas (muito mais simples!)
-- ✅ Seu profile como ADMIN
-- ✅ Query funciona sem erro 500!
-- ✅ Sistema mais simples e direto
-- ========================================

-- ========================================
-- NOVA ARQUITETURA SIMPLIFICADA
-- ========================================
-- 
-- ✅ Todos os usuários = Administradores
-- ✅ Sem verificação de roles
-- ✅ Sem hierarquia de permissões
-- ✅ Acesso completo para todos
-- ✅ Mais simples = Menos bugs
-- ✅ Mais rápido = Melhor performance
-- 
-- Se no futuro precisar de roles diferentes:
-- - Adicionar novamente as colunas
-- - Criar políticas específicas
-- - Mas por enquanto: KISS (Keep It Simple, Stupid!)
-- ========================================

