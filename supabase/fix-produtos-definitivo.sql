-- Script DEFINITIVO para corrigir a tabela produtos
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. PRIMEIRO: Garantir que categorias_produtos existe
CREATE TABLE IF NOT EXISTS categorias_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, nome)
);

-- 2. SEGUNDO: Dropar a tabela produtos se existir (para recriar corretamente)
DROP TABLE IF EXISTS produtos CASCADE;

-- 3. TERCEIRO: Recriar a tabela produtos com TODAS as colunas corretas
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias_produtos(id) ON DELETE SET NULL,
  codigo VARCHAR(50) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('PRODUTO', 'SERVICO')) DEFAULT 'PRODUTO',
  unidade VARCHAR(10) NOT NULL,
  preco_venda DECIMAL(15,2) NOT NULL,
  custo DECIMAL(15,2),
  ncm VARCHAR(10) NOT NULL,
  cfop_saida VARCHAR(4) NOT NULL,
  cfop_entrada VARCHAR(4) NOT NULL,
  aliquota_icms DECIMAL(5,2) NOT NULL DEFAULT 0,
  aliquota_ipi DECIMAL(5,2) DEFAULT 0,
  aliquota_pis DECIMAL(5,2) DEFAULT 0,
  aliquota_cofins DECIMAL(5,2) DEFAULT 0,
  icms_situacao_tributaria VARCHAR(2) DEFAULT '00',
  icms_origem VARCHAR(1) DEFAULT '0',
  icms_modalidade_base_calculo VARCHAR(2) DEFAULT '0',
  icms_reducao_base_calculo DECIMAL(5,2) DEFAULT 0,
  ipi_codigo_enquadramento VARCHAR(3),
  ipi_situacao_tributaria VARCHAR(2) DEFAULT '00',
  pis_situacao_tributaria VARCHAR(2) DEFAULT '01',
  cofins_situacao_tributaria VARCHAR(2) DEFAULT '01',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_categorias_produtos_empresa_id ON categorias_produtos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_categorias_produtos_ativo ON categorias_produtos(empresa_id, ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_empresa_id ON produtos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON produtos(empresa_id, codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria_id ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(empresa_id, ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_tipo ON produtos(empresa_id, tipo);
CREATE INDEX IF NOT EXISTS idx_produtos_ncm ON produtos(ncm);

-- 5. Habilitar RLS
ALTER TABLE categorias_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS para categorias
DROP POLICY IF EXISTS "categorias_select_policy" ON categorias_produtos;
CREATE POLICY "categorias_select_policy" ON categorias_produtos
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM users_profile 
      WHERE id = auth.uid() AND role IN ('admin', 'accountant')
    )
  );

DROP POLICY IF EXISTS "categorias_all_policy" ON categorias_produtos;
CREATE POLICY "categorias_all_policy" ON categorias_produtos
  FOR ALL USING (
    empresa_id IN (
      SELECT empresa_id FROM users_profile 
      WHERE id = auth.uid() AND role IN ('admin', 'accountant')
    )
  );

-- 7. Criar políticas RLS para produtos
DROP POLICY IF EXISTS "produtos_select_policy" ON produtos;
CREATE POLICY "produtos_select_policy" ON produtos
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM users_profile 
      WHERE id = auth.uid() AND role IN ('admin', 'accountant')
    )
  );

DROP POLICY IF EXISTS "produtos_all_policy" ON produtos;
CREATE POLICY "produtos_all_policy" ON produtos
  FOR ALL USING (
    empresa_id IN (
      SELECT empresa_id FROM users_profile 
      WHERE id = auth.uid() AND role IN ('admin', 'accountant')
    )
  );

-- 8. Criar função para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Criar triggers
DROP TRIGGER IF EXISTS update_categorias_produtos_updated_at ON categorias_produtos;
CREATE TRIGGER update_categorias_produtos_updated_at 
  BEFORE UPDATE ON categorias_produtos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_produtos_updated_at ON produtos;
CREATE TRIGGER update_produtos_updated_at 
  BEFORE UPDATE ON produtos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Inserir categoria padrão
INSERT INTO categorias_produtos (empresa_id, nome, descricao) 
SELECT 
  id as empresa_id,
  'Geral' as nome,
  'Categoria padrão para produtos' as descricao
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

-- 11. VERIFICAÇÃO FINAL - Confirmar que categoria_id existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'produtos' 
      AND column_name = 'categoria_id'
      AND table_schema = 'public'
    ) THEN 'SUCESSO: Coluna categoria_id existe!'
    ELSE 'ERRO: Coluna categoria_id não existe!'
  END as status_categoria_id;

-- 12. Testar consulta com JOIN
SELECT 
  'Teste de JOIN' as status,
  COUNT(*) as total_registros
FROM produtos p
LEFT JOIN categorias_produtos c ON p.categoria_id = c.id;
