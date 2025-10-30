-- Migration: Adicionar campos FOCUS NFE na tabela empresas
-- Data: 2025-01-27
-- Descrição: Adiciona campos para configuração individual de token FOCUS NFE por empresa

-- Adicionar campos FOCUS NFE na tabela empresas
ALTER TABLE empresas 
ADD COLUMN focus_nfe_token TEXT,
ADD COLUMN focus_nfe_environment VARCHAR(20) DEFAULT 'homologacao' CHECK (focus_nfe_environment IN ('homologacao', 'producao')),
ADD COLUMN focus_nfe_ativo BOOLEAN DEFAULT false,
ADD COLUMN focus_nfe_ultima_validacao TIMESTAMP WITH TIME ZONE,
ADD COLUMN focus_nfe_erro_validacao TEXT;

-- Adicionar comentários para documentação
COMMENT ON COLUMN empresas.focus_nfe_token IS 'Token da API FOCUS NFE específico da empresa';
COMMENT ON COLUMN empresas.focus_nfe_environment IS 'Ambiente da API FOCUS NFE (homologacao ou producao)';
COMMENT ON COLUMN empresas.focus_nfe_ativo IS 'Indica se a integração FOCUS NFE está ativa para esta empresa';
COMMENT ON COLUMN empresas.focus_nfe_ultima_validacao IS 'Data da última validação do token FOCUS NFE';
COMMENT ON COLUMN empresas.focus_nfe_erro_validacao IS 'Último erro de validação do token FOCUS NFE';

-- Criar índice para busca por empresas com FOCUS NFE ativo
CREATE INDEX idx_empresas_focus_nfe_ativo ON empresas(focus_nfe_ativo) WHERE focus_nfe_ativo = true;

-- Atualizar RLS para permitir que empresas vejam apenas seus próprios dados FOCUS NFE
-- (já existe política RLS, mas vamos garantir que os novos campos sejam incluídos)
