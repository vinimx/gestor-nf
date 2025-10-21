-- Script para adicionar profiles para usuários existentes que não têm profile

-- Inserir profiles para usuários do auth.users que não estão em users_profile
INSERT INTO users_profile (id, email, role, created_at)
SELECT 
  u.id,
  u.email,
  'admin' as role,  -- Todos os usuários existentes serão admin por padrão
  NOW()
FROM 
  auth.users u
WHERE 
  NOT EXISTS (
    SELECT 1 
    FROM users_profile up 
    WHERE up.id = u.id
  )
ON CONFLICT (id) DO NOTHING;

-- Verificar quantos profiles foram criados
SELECT 
  COUNT(*) as total_usuarios,
  (SELECT COUNT(*) FROM users_profile) as usuarios_com_profile
FROM auth.users;

