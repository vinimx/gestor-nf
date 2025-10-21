-- Normalize existing CNPJ values to digits-only and change column type to varchar(14)

-- Remove non-digits from existing cnpj values
UPDATE empresas SET cnpj = regexp_replace(cnpj, '\\D', '', 'g') WHERE cnpj IS NOT NULL;

-- If there is any cnpj longer than 14 after normalization, truncate (defensive)
UPDATE empresas SET cnpj = substring(cnpj from 1 for 14) WHERE length(cnpj) > 14;

-- Drop existing unique constraint/index if exists (name may vary)
DO $$
BEGIN
  IF (SELECT COUNT(1) FROM pg_indexes WHERE tablename = 'empresas' AND indexname = 'empresas_cnpj_key') > 0 THEN
    EXECUTE 'DROP INDEX IF EXISTS empresas_cnpj_key;';
  END IF;
END$$;

-- Alter column type to varchar(14)
ALTER TABLE empresas ALTER COLUMN cnpj TYPE varchar(14);

-- Recreate unique index on cnpj
CREATE UNIQUE INDEX IF NOT EXISTS idx_empresas_cnpj_unique ON empresas (cnpj);

-- Ensure no null cnpj duplicates exist
DELETE FROM empresas a USING empresas b WHERE a.id <> b.id AND a.cnpj = b.cnpj AND a.id > b.id;

-- Note: run on maintenance window as this may lock the table.
