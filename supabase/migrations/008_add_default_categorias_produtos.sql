-- Migração para adicionar categorias padrão de produtos fiscais
-- Categorias comuns no contexto fiscal brasileiro para NFe

-- Inserir categorias padrão para todas as empresas existentes
INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Mercado para Revenda' as nome,
    'Produtos destinados à revenda em mercados, supermercados e varejo' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Veículo Usado' as nome,
    'Veículos usados - requer documentação específica (RENAVAM, placa, etc.)' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Combustível' as nome,
    'Combustíveis líquidos e gasosos - regras fiscais específicas (ANP)' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Insumo' as nome,
    'Insumos para produção industrial ou agrícola' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Matéria-Prima' as nome,
    'Matérias-primas para processos de transformação' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Embalagem' as nome,
    'Embalagens, rótulos e materiais de acondicionamento' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Produto Acabado' as nome,
    'Produtos finalizados prontos para comercialização' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Material de Escritório' as nome,
    'Papelaria, equipamentos e materiais de escritório' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Eletrônicos' as nome,
    'Equipamentos eletrônicos, eletroeletrônicos e acessórios' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Medicamentos' as nome,
    'Medicamentos e produtos farmacêuticos - requer ANVISA' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Alimentos' as nome,
    'Alimentos e bebidas - requer ANVISA/Vigilância Sanitária' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Cosméticos' as nome,
    'Produtos de higiene, cosméticos e perfumaria' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Vestuário e Calçados' as nome,
    'Roupas, calçados e acessórios de vestuário' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Material de Construção' as nome,
    'Materiais para construção civil e reforma' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Máquinas e Equipamentos' as nome,
    'Máquinas, equipamentos industriais e ferramentas' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Pecas e Acessórios' as nome,
    'Peças, componentes e acessórios diversos' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Produto para Uso e Consumo' as nome,
    'Produtos destinados ao uso e consumo interno da empresa' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Exportação' as nome,
    'Produtos destinados à exportação' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Importação' as nome,
    'Produtos importados' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) 
SELECT 
    id as empresa_id,
    'Geral' as nome,
    'Categoria geral para produtos diversos' as descricao,
    true as ativo
FROM empresas
ON CONFLICT (empresa_id, nome) DO NOTHING;

-- Função para criar categorias padrão para uma empresa
CREATE OR REPLACE FUNCTION criar_categorias_padrao_produtos(p_empresa_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO categorias_produtos (empresa_id, nome, descricao, ativo) VALUES
        (p_empresa_id, 'Mercado para Revenda', 'Produtos destinados à revenda em mercados, supermercados e varejo', true),
        (p_empresa_id, 'Veículo Usado', 'Veículos usados - requer documentação específica (RENAVAM, placa, etc.)', true),
        (p_empresa_id, 'Combustível', 'Combustíveis líquidos e gasosos - regras fiscais específicas (ANP)', true),
        (p_empresa_id, 'Insumo', 'Insumos para produção industrial ou agrícola', true),
        (p_empresa_id, 'Matéria-Prima', 'Matérias-primas para processos de transformação', true),
        (p_empresa_id, 'Embalagem', 'Embalagens, rótulos e materiais de acondicionamento', true),
        (p_empresa_id, 'Produto Acabado', 'Produtos finalizados prontos para comercialização', true),
        (p_empresa_id, 'Material de Escritório', 'Papelaria, equipamentos e materiais de escritório', true),
        (p_empresa_id, 'Eletrônicos', 'Equipamentos eletrônicos, eletroeletrônicos e acessórios', true),
        (p_empresa_id, 'Medicamentos', 'Medicamentos e produtos farmacêuticos - requer ANVISA', true),
        (p_empresa_id, 'Alimentos', 'Alimentos e bebidas - requer ANVISA/Vigilância Sanitária', true),
        (p_empresa_id, 'Cosméticos', 'Produtos de higiene, cosméticos e perfumaria', true),
        (p_empresa_id, 'Vestuário e Calçados', 'Roupas, calçados e acessórios de vestuário', true),
        (p_empresa_id, 'Material de Construção', 'Materiais para construção civil e reforma', true),
        (p_empresa_id, 'Máquinas e Equipamentos', 'Máquinas, equipamentos industriais e ferramentas', true),
        (p_empresa_id, 'Pecas e Acessórios', 'Peças, componentes e acessórios diversos', true),
        (p_empresa_id, 'Produto para Uso e Consumo', 'Produtos destinados ao uso e consumo interno da empresa', true),
        (p_empresa_id, 'Exportação', 'Produtos destinados à exportação', true),
        (p_empresa_id, 'Importação', 'Produtos importados', true),
        (p_empresa_id, 'Geral', 'Categoria geral para produtos diversos', true)
    ON CONFLICT (empresa_id, nome) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar categorias padrão automaticamente quando uma empresa é criada
CREATE OR REPLACE FUNCTION trigger_criar_categorias_padrao()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM criar_categorias_padrao_produtos(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger (se ainda não existir)
DROP TRIGGER IF EXISTS trigger_empresa_categorias_padrao ON empresas;
CREATE TRIGGER trigger_empresa_categorias_padrao
    AFTER INSERT ON empresas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_criar_categorias_padrao();

-- Comentário explicativo
COMMENT ON TABLE categorias_produtos IS 'Categorias de produtos com tratamento fiscal específico conforme legislação brasileira. Algumas categorias requerem campos adicionais na NFe (ex: veículo usado, medicamentos, combustíveis).';
COMMENT ON FUNCTION criar_categorias_padrao_produtos(UUID) IS 'Função para criar categorias padrão de produtos fiscais para uma empresa. Pode ser chamada manualmente ou é executada automaticamente via trigger quando uma empresa é criada.';

