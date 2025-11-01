-- Migração: Adicionar IBS/CBS e Observações aos Produtos
-- FASE 3: Reforma Tributária e Observações do Produto
-- Data: 2025-11-01

-- ======================================================================
-- ADICIONAR CAMPOS À TABELA PRODUTOS
-- ======================================================================

-- Adicionar campo de alíquota IBS/CBS (Reforma Tributária)
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS aliquota_ibs_cbs DECIMAL(5,2) DEFAULT 0;

-- Adicionar campo de observações (aparece na nota fiscal)
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Adicionar constraint para validar range de alíquota IBS/CBS
ALTER TABLE produtos 
DROP CONSTRAINT IF EXISTS check_aliquota_ibs_cbs_range;

ALTER TABLE produtos 
ADD CONSTRAINT check_aliquota_ibs_cbs_range 
CHECK (aliquota_ibs_cbs IS NULL OR (aliquota_ibs_cbs >= 0 AND aliquota_ibs_cbs <= 100));

-- Adicionar constraint para limitar tamanho das observações (500 caracteres)
ALTER TABLE produtos 
DROP CONSTRAINT IF EXISTS check_observacoes_length;

ALTER TABLE produtos 
ADD CONSTRAINT check_observacoes_length 
CHECK (observacoes IS NULL OR LENGTH(observacoes) <= 500);

-- ======================================================================
-- COMENTÁRIOS EXPLICATIVOS
-- ======================================================================

COMMENT ON COLUMN produtos.aliquota_ibs_cbs IS 
'Alíquota do IBS/CBS conforme Reforma Tributária brasileira. Campo único para IBS (Imposto sobre Bens e Serviços) e CBS (Contribuição sobre Bens e Serviços). Valor entre 0 e 100.';

COMMENT ON COLUMN produtos.observacoes IS 
'Observações do produto que aparecerão automaticamente na nota fiscal quando o produto for adicionado. Limite de 500 caracteres.';

-- ======================================================================
-- FIM DA MIGRAÇÃO
-- ======================================================================

-- Log de execução
DO $$ 
BEGIN 
    RAISE NOTICE 'Migration 009 executada com sucesso: Adicionados campos IBS/CBS e observações aos produtos'; 
END $$;
