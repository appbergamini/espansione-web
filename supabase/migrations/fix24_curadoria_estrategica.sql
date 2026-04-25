-- FIX.24 — Curadoria Estratégica do Relatório
-- Cria 3 tabelas (analysis_blocks, analysis_block_versions,
-- analysis_block_comments) + 1 coluna em outputs (findings_json).
-- Retroativo: outputs antigos têm findings_json populado por parser
-- heurístico (ver lib/curadoria/extractFindings.js).
--
-- Aplicar UMA vez via Supabase Studio SQL Editor:
-- https://supabase.com/dashboard/project/qjmokydtdwisznttipvi/sql/new

-- ─── outputs.findings_json ───────────────────────────────────────────
ALTER TABLE outputs
  ADD COLUMN IF NOT EXISTS findings_json jsonb;

COMMENT ON COLUMN outputs.findings_json IS
  'Array de achados estruturados emitidos pelo agente: [{ categoria, titulo, evidencia, interpretacao, recomendacao, confianca }]. Materializa em analysis_blocks via lib/curadoria/extractFindings.js.';

-- ─── analysis_blocks ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analysis_blocks (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id            uuid NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  output_id             uuid REFERENCES outputs(id) ON DELETE SET NULL,
  agent_num             integer NOT NULL,
  categoria             text NOT NULL,
  titulo                text NOT NULL,
  -- Camadas IA (originais, nunca sobrescritas)
  ai_evidencia          text,
  ai_interpretacao      text,
  ai_recomendacao       text,
  ai_confianca          text,
  -- Camadas editadas pelo consultor (precedência sobre ai_*)
  edited_titulo         text,
  edited_evidencia      text,
  edited_interpretacao  text,
  edited_recomendacao   text,
  -- Estado editorial
  status                text NOT NULL DEFAULT 'pendente_revisao'
    CHECK (status IN (
      'pendente_revisao','aprovado','editado','excluido',
      'somente_bastidor','levar_discussao','reanalise_solicitada','validado_cliente'
    )),
  incluir_no_relatorio  boolean NOT NULL DEFAULT false,
  notas_internas        text,
  notas_cliente         text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  reviewed_at           timestamptz,
  reviewed_by           uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_analysis_blocks_projeto ON analysis_blocks(projeto_id);
CREATE INDEX IF NOT EXISTS idx_analysis_blocks_output  ON analysis_blocks(output_id);
CREATE INDEX IF NOT EXISTS idx_analysis_blocks_status  ON analysis_blocks(status);
CREATE INDEX IF NOT EXISTS idx_analysis_blocks_categ   ON analysis_blocks(categoria);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION analysis_blocks_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_analysis_blocks_updated_at ON analysis_blocks;
CREATE TRIGGER trg_analysis_blocks_updated_at
  BEFORE UPDATE ON analysis_blocks
  FOR EACH ROW
  EXECUTE FUNCTION analysis_blocks_set_updated_at();

-- ─── analysis_block_versions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analysis_block_versions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id        uuid NOT NULL REFERENCES analysis_blocks(id) ON DELETE CASCADE,
  tipo            text NOT NULL CHECK (tipo IN (
    'ai_original','edicao_consultor','validacao_cliente','reanalise'
  )),
  snapshot_json   jsonb NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_block_versions_block ON analysis_block_versions(block_id);

-- ─── analysis_block_comments ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analysis_block_comments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id      uuid NOT NULL REFERENCES analysis_blocks(id) ON DELETE CASCADE,
  autor_tipo    text NOT NULL CHECK (autor_tipo IN ('consultor','cliente')),
  autor_id      uuid REFERENCES auth.users(id),
  comentario    text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_block_comments_block ON analysis_block_comments(block_id);

-- ─── RLS (alinhar com padrão do projeto: master/admin via service role) ─
-- A API server-side usa supabaseAdmin (service role), então RLS abaixo
-- protege apenas leituras diretas (anon/auth client) — improvável aqui.
ALTER TABLE analysis_blocks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_block_versions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_block_comments  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS analysis_blocks_admin_all ON analysis_blocks;
CREATE POLICY analysis_blocks_admin_all ON analysis_blocks
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('master','admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('master','admin')
    )
  );

DROP POLICY IF EXISTS block_versions_admin_all ON analysis_block_versions;
CREATE POLICY block_versions_admin_all ON analysis_block_versions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('master','admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('master','admin')
    )
  );

DROP POLICY IF EXISTS block_comments_admin_all ON analysis_block_comments;
CREATE POLICY block_comments_admin_all ON analysis_block_comments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('master','admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('master','admin')
    )
  );
