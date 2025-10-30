-- Adiciona coluna quantidade à tabela produtos
-- FASE 3: Gestão de Produtos/Serviços

ALTER TABLE produtos
ADD COLUMN IF NOT EXISTS quantidade NUMERIC(18,4) DEFAULT 0 NOT NULL;

COMMENT ON COLUMN produtos.quantidade IS 'Quantidade padrão do produto para emissão e cálculos';


