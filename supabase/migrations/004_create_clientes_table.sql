-- Tabela de clientes
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('FISICA', 'JURIDICA')),
    nome_razao_social VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(18) NOT NULL,
    inscricao_estadual VARCHAR(20),
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco JSONB NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(empresa_id, cpf_cnpj)
);

-- Índices para performance
CREATE INDEX idx_clientes_empresa_id ON clientes(empresa_id);
CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX idx_clientes_empresa_ativo ON clientes(empresa_id, ativo);
CREATE INDEX idx_clientes_tipo ON clientes(tipo);

-- RLS (Row Level Security)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver clientes da sua empresa" ON clientes
    FOR SELECT USING (
        empresa_id IN (
            SELECT empresa_id FROM users_profile 
            WHERE id = auth.uid() AND role IN ('admin', 'accountant')
        )
    );

CREATE POLICY "Usuários podem gerenciar clientes da sua empresa" ON clientes
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

CREATE TRIGGER update_clientes_updated_at 
    BEFORE UPDATE ON clientes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
