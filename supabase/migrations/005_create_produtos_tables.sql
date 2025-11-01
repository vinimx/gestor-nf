-- Migração para criação das tabelas de produtos e categorias
-- FASE 3: Gestão de Produtos/Serviços

-- Tabela de categorias de produtos
CREATE TABLE categorias_produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(empresa_id, nome)
);

-- Tabela de produtos
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
    
    -- Dados fiscais obrigatórios
    ncm VARCHAR(10) NOT NULL,
    cfop_saida VARCHAR(4) NOT NULL,
    cfop_entrada VARCHAR(4) NOT NULL,
    
    -- Impostos
    aliquota_icms DECIMAL(5,2) NOT NULL DEFAULT 0,
    aliquota_ipi DECIMAL(5,2) DEFAULT 0,
    aliquota_pis DECIMAL(5,2) DEFAULT 0,
    aliquota_cofins DECIMAL(5,2) DEFAULT 0,
    
    -- Configurações ICMS
    icms_situacao_tributaria VARCHAR(2) DEFAULT '00',
    icms_origem VARCHAR(1) DEFAULT '0',
    icms_modalidade_base_calculo VARCHAR(2) DEFAULT '0',
    icms_reducao_base_calculo DECIMAL(5,2) DEFAULT 0,
    
    -- Configurações IPI
    ipi_codigo_enquadramento VARCHAR(3),
    ipi_situacao_tributaria VARCHAR(2) DEFAULT '00',
    
    -- Configurações PIS/COFINS
    pis_situacao_tributaria VARCHAR(2) DEFAULT '01',
    cofins_situacao_tributaria VARCHAR(2) DEFAULT '01',
    
    -- Status e controle
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(empresa_id, codigo)
);

-- Índices para performance
CREATE INDEX idx_categorias_produtos_empresa_id ON categorias_produtos(empresa_id);
CREATE INDEX idx_categorias_produtos_ativo ON categorias_produtos(empresa_id, ativo);
CREATE INDEX idx_produtos_empresa_id ON produtos(empresa_id);
CREATE INDEX idx_produtos_codigo ON produtos(empresa_id, codigo);
CREATE INDEX idx_produtos_categoria_id ON produtos(categoria_id);
CREATE INDEX idx_produtos_ativo ON produtos(empresa_id, ativo);
CREATE INDEX idx_produtos_tipo ON produtos(empresa_id, tipo);
CREATE INDEX idx_produtos_ncm ON produtos(ncm);

-- RLS (Row Level Security)
ALTER TABLE categorias_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorias
CREATE POLICY "Usuários podem ver categorias da sua empresa" ON categorias_produtos
    FOR SELECT USING (
        empresa_id IN (
            SELECT empresa_id FROM users_profile 
            WHERE id = auth.uid() AND role IN ('admin', 'accountant')
        )
    );

CREATE POLICY "Usuários podem gerenciar categorias da sua empresa" ON categorias_produtos
    FOR ALL USING (
        empresa_id IN (
            SELECT empresa_id FROM users_profile 
            WHERE id = auth.uid() AND role IN ('admin', 'accountant')
        )
    );

-- Políticas RLS para produtos
CREATE POLICY "Usuários podem ver produtos da sua empresa" ON produtos
    FOR SELECT USING (
        empresa_id IN (
            SELECT empresa_id FROM users_profile 
            WHERE id = auth.uid() AND role IN ('admin', 'accountant')
        )
    );

CREATE POLICY "Usuários podem gerenciar produtos da sua empresa" ON produtos
    FOR ALL USING (
        empresa_id IN (
            SELECT empresa_id FROM users_profile 
            WHERE id = auth.uid() AND role IN ('admin', 'accountant')
        )
    );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categorias_produtos_updated_at 
    BEFORE UPDATE ON categorias_produtos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at 
    BEFORE UPDATE ON produtos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir categorias padrão
INSERT INTO categorias_produtos (empresa_id, nome, descricao) 
SELECT 
    id as empresa_id,
    'Geral' as nome,
    'Categoria padrão para produtos' as descricao
FROM empresas;
