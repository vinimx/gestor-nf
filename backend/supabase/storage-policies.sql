-- Políticas de Storage para o Gestor de Notas Fiscais
-- Execute este script no SQL Editor do Supabase Dashboard

-- Habilitar RLS no storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Políticas para o bucket nf-xml
CREATE POLICY "Users can upload XML files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'nf-xml' AND
  auth.role() = 'authenticated' AND
  -- Verificar se o usuário tem permissão para a empresa
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM empresas 
    WHERE id IN (
      SELECT empresa_id FROM users_profile 
      WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can view XML files from their companies" ON storage.objects
FOR SELECT USING (
  bucket_id = 'nf-xml' AND
  auth.role() = 'authenticated' AND
  (
    -- Usuários podem ver arquivos da sua empresa
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM empresas 
      WHERE id IN (
        SELECT empresa_id FROM users_profile 
        WHERE id = auth.uid()
      )
    )
    OR
    -- Admins podem ver todos os arquivos
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Users can update XML files from their companies" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'nf-xml' AND
  auth.role() = 'authenticated' AND
  (
    -- Usuários podem atualizar arquivos da sua empresa
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM empresas 
      WHERE id IN (
        SELECT empresa_id FROM users_profile 
        WHERE id = auth.uid() AND role IN ('admin', 'accountant')
      )
    )
    OR
    -- Admins podem atualizar todos os arquivos
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Users can delete XML files from their companies" ON storage.objects
FOR DELETE USING (
  bucket_id = 'nf-xml' AND
  auth.role() = 'authenticated' AND
  (
    -- Usuários podem deletar arquivos da sua empresa
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM empresas 
      WHERE id IN (
        SELECT empresa_id FROM users_profile 
        WHERE id = auth.uid() AND role IN ('admin', 'accountant')
      )
    )
    OR
    -- Admins podem deletar todos os arquivos
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- Políticas para o bucket nf-pdf
CREATE POLICY "Users can upload PDF files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'nf-pdf' AND
  auth.role() = 'authenticated' AND
  -- Verificar se o usuário tem permissão para a empresa
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM empresas 
    WHERE id IN (
      SELECT empresa_id FROM users_profile 
      WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can view PDF files from their companies" ON storage.objects
FOR SELECT USING (
  bucket_id = 'nf-pdf' AND
  auth.role() = 'authenticated' AND
  (
    -- Usuários podem ver arquivos da sua empresa
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM empresas 
      WHERE id IN (
        SELECT empresa_id FROM users_profile 
        WHERE id = auth.uid()
      )
    )
    OR
    -- Admins podem ver todos os arquivos
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Users can update PDF files from their companies" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'nf-pdf' AND
  auth.role() = 'authenticated' AND
  (
    -- Usuários podem atualizar arquivos da sua empresa
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM empresas 
      WHERE id IN (
        SELECT empresa_id FROM users_profile 
        WHERE id = auth.uid() AND role IN ('admin', 'accountant')
      )
    )
    OR
    -- Admins podem atualizar todos os arquivos
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Users can delete PDF files from their companies" ON storage.objects
FOR DELETE USING (
  bucket_id = 'nf-pdf' AND
  auth.role() = 'authenticated' AND
  (
    -- Usuários podem deletar arquivos da sua empresa
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM empresas 
      WHERE id IN (
        SELECT empresa_id FROM users_profile 
        WHERE id = auth.uid() AND role IN ('admin', 'accountant')
      )
    )
    OR
    -- Admins podem deletar todos os arquivos
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- Políticas para o bucket profile-avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-avatars' AND
  auth.role() = 'authenticated' AND
  -- Verificar se o usuário está fazendo upload do seu próprio avatar
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own avatar" ON storage.objects
FOR SELECT USING (
  bucket_id = 'profile-avatars' AND
  auth.role() = 'authenticated' AND
  (
    -- Usuários podem ver seu próprio avatar
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Admins podem ver todos os avatars
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-avatars' AND
  auth.role() = 'authenticated' AND
  (
    -- Usuários podem atualizar seu próprio avatar
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Admins podem atualizar todos os avatars
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-avatars' AND
  auth.role() = 'authenticated' AND
  (
    -- Usuários podem deletar seu próprio avatar
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Admins podem deletar todos os avatars
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);
