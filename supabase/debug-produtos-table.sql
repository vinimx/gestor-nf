-- Script para debugar e analisar a tabela produtos
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Verificar se a tabela produtos existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'produtos' AND table_schema = 'public'
    ) THEN 'EXISTE'
    ELSE 'NÃO EXISTE'
  END as status_tabela_produtos;

-- 2. Listar TODAS as colunas da tabela produtos
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'produtos' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar especificamente se categoria_id existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'produtos' 
      AND column_name = 'categoria_id'
      AND table_schema = 'public'
    ) THEN 'EXISTE'
    ELSE 'NÃO EXISTE'
  END as status_coluna_categoria_id;

-- 4. Verificar se a tabela categorias_produtos existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'categorias_produtos' AND table_schema = 'public'
    ) THEN 'EXISTE'
    ELSE 'NÃO EXISTE'
  END as status_tabela_categorias;

-- 5. Se a tabela produtos existir, mostrar sua estrutura completa
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'produtos' AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '=== ESTRUTURA DA TABELA PRODUTOS ===';
        
        -- Mostrar estrutura da tabela
        DECLARE
            rec RECORD;
        BEGIN
            FOR rec IN 
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'produtos' AND table_schema = 'public'
                ORDER BY ordinal_position
            LOOP
                RAISE NOTICE 'Coluna: % | Tipo: % | Nullable: % | Default: %', 
                    rec.column_name, rec.data_type, rec.is_nullable, rec.column_default;
            END LOOP;
        END;
        
        RAISE NOTICE '=== FIM DA ESTRUTURA ===';
    ELSE
        RAISE NOTICE 'Tabela produtos não existe!';
    END IF;
END $$;
