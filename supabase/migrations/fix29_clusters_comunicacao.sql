-- FIX.29 (Fase B) — Clusters de Comunicação.
-- Etapa intermediária entre os outputs e o Agente 13. O consultor define
-- clusters formais (lente AC para comunicação ≠ Personas, que são pra
-- experiência) com nome, afinidades, motivações e objetivo de negócio.
-- O Agente 13 consome esses clusters como input direto.

CREATE TABLE IF NOT EXISTS clusters_comunicacao (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id        uuid NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  nome              text NOT NULL,
  descricao         text,
  afinidades        text,           -- o que une as pessoas deste cluster
  motivacoes        text,           -- o que move este cluster (job to be done, dor)
  objetivo_negocio  text,           -- o que a empresa quer DESTE cluster (conversão, retenção, advocacy, atração)
  mensagem_ancora   text,           -- 1 frase âncora — material pro Agente 13 trabalhar
  ordem             integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clusters_projeto ON clusters_comunicacao(projeto_id);
CREATE INDEX IF NOT EXISTS idx_clusters_ordem   ON clusters_comunicacao(projeto_id, ordem);

CREATE OR REPLACE FUNCTION clusters_comunicacao_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clusters_updated_at ON clusters_comunicacao;
CREATE TRIGGER trg_clusters_updated_at
  BEFORE UPDATE ON clusters_comunicacao
  FOR EACH ROW
  EXECUTE FUNCTION clusters_comunicacao_set_updated_at();

ALTER TABLE clusters_comunicacao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS clusters_admin_all ON clusters_comunicacao;
CREATE POLICY clusters_admin_all ON clusters_comunicacao
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
