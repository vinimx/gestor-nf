-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create empresas table
CREATE TABLE empresas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  cnpj varchar(18) NOT NULL UNIQUE,
  inscricao_estadual varchar(20),
  endereco jsonb,
  telefone varchar(30),
  email varchar(255),
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users_profile table
CREATE TABLE users_profile (
  id uuid PRIMARY KEY, -- uses supabase auth user id
  email text NOT NULL,
  nome text,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'accountant', 'viewer')),
  empresa_id uuid REFERENCES empresas(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create competencias table
CREATE TABLE competencias (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  mes integer NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano integer NOT NULL CHECK (ano >= 2020 AND ano <= 2030),
  status text NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'fechada')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(empresa_id, mes, ano)
);

-- Create notas_fiscais table
CREATE TABLE notas_fiscais (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  fornecedor_id uuid REFERENCES empresas(id),
  competencia_id uuid REFERENCES competencias(id),
  tipo text NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  chave_acesso varchar(50) UNIQUE,
  numero varchar(50) NOT NULL,
  serie varchar(20),
  data_emissao date NOT NULL,
  data_entrada date,
  valor_total numeric(14,2) NOT NULL,
  base_calculo numeric(14,2),
  imposto_total numeric(14,2),
  arquivo_xml text,
  arquivo_pdf text,
  status text DEFAULT 'pendente' CHECK (status IN ('importado', 'pendente', 'cancelado')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create itens_nota table
CREATE TABLE itens_nota (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nota_id uuid NOT NULL REFERENCES notas_fiscais(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  ncm varchar(20),
  quantidade numeric(12,4) DEFAULT 1,
  unidade varchar(10),
  valor_unitario numeric(14,4) NOT NULL,
  valor_total numeric(14,2) NOT NULL,
  cfop varchar(10),
  aliquota_icms numeric(6,2)
);

-- Create impostos_nota table
CREATE TABLE impostos_nota (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nota_id uuid NOT NULL REFERENCES notas_fiscais(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  base_calculo numeric(14,2) NOT NULL,
  aliquota numeric(8,4) NOT NULL,
  valor numeric(14,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_notas_empresa_data ON notas_fiscais (empresa_id, data_emissao);
CREATE INDEX idx_notas_chave ON notas_fiscais (chave_acesso);
CREATE INDEX idx_notas_status ON notas_fiscais (status);
CREATE INDEX idx_itens_nota_id ON itens_nota (nota_id);
CREATE INDEX idx_impostos_nota_id ON impostos_nota (nota_id);
CREATE INDEX idx_users_empresa_id ON users_profile (empresa_id);
CREATE INDEX idx_competencias_empresa ON competencias (empresa_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competencias_updated_at BEFORE UPDATE ON competencias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notas_fiscais_updated_at BEFORE UPDATE ON notas_fiscais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_nota ENABLE ROW LEVEL SECURITY;
ALTER TABLE impostos_nota ENABLE ROW LEVEL SECURITY;

-- RLS Policies for empresas
CREATE POLICY "Users can view their company" ON empresas
  FOR SELECT USING (
    id IN (
      SELECT empresa_id FROM users_profile 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all companies" ON empresas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert companies" ON empresas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update companies" ON empresas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete companies" ON empresas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for users_profile
CREATE POLICY "Users can view their own profile" ON users_profile
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON users_profile
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users_profile
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON users_profile
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for competencias
CREATE POLICY "Users can view competencias from their company" ON competencias
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM users_profile 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Accountants and admins can manage competencias" ON competencias
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role IN ('admin', 'accountant')
      AND empresa_id = competencias.empresa_id
    )
  );

-- RLS Policies for notas_fiscais
CREATE POLICY "Users can view notas from their company" ON notas_fiscais
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM users_profile 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Accountants and admins can manage notas" ON notas_fiscais
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role IN ('admin', 'accountant')
      AND empresa_id = notas_fiscais.empresa_id
    )
  );

-- RLS Policies for itens_nota
CREATE POLICY "Users can view itens from their company notas" ON itens_nota
  FOR SELECT USING (
    nota_id IN (
      SELECT id FROM notas_fiscais 
      WHERE empresa_id IN (
        SELECT empresa_id FROM users_profile 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Accountants and admins can manage itens" ON itens_nota
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role IN ('admin', 'accountant')
      AND empresa_id IN (
        SELECT empresa_id FROM notas_fiscais 
        WHERE id = itens_nota.nota_id
      )
    )
  );

-- RLS Policies for impostos_nota
CREATE POLICY "Users can view impostos from their company notas" ON impostos_nota
  FOR SELECT USING (
    nota_id IN (
      SELECT id FROM notas_fiscais 
      WHERE empresa_id IN (
        SELECT empresa_id FROM users_profile 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Accountants and admins can manage impostos" ON impostos_nota
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role IN ('admin', 'accountant')
      AND empresa_id IN (
        SELECT empresa_id FROM notas_fiscais 
        WHERE id = impostos_nota.nota_id
      )
    )
  );
