-- Tabela de produtos/serviços
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('PRODUTO', 'SERVICO')),
    unidade_medida VARCHAR(10) NOT NULL,
    valor_unitario DECIMAL(15,2) NOT NULL,
    codigo_ncm VARCHAR(10),
    codigo_cfop VARCHAR(10),
    aliquota_icms DECIMAL(5,2) DEFAULT 0,
    aliquota_ipi DECIMAL(5,2) DEFAULT 0,
    aliquota_pis DECIMAL(5,2) DEFAULT 0,
    aliquota_cofins DECIMAL(5,2) DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(empresa_id, codigo)
);

-- Índices para performance
CREATE INDEX idx_produtos_empresa_id ON produtos(empresa_id);
CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_produtos_empresa_ativo ON produtos(empresa_id, ativo);
CREATE INDEX idx_produtos_tipo ON produtos(tipo);
CREATE INDEX idx_produtos_nome ON produtos(nome);

-- RLS (Row Level Security)
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
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
CREATE TRIGGER update_produtos_updated_at 
    BEFORE UPDATE ON produtos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
