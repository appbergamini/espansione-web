-- ============================================================
-- NARRATIVA DO RELATÓRIO DE COMPETÊNCIAS — cache por sessão
--
-- Aditiva: só acrescenta colunas a comp_assessments.
--
-- Por que cachear, e não gerar a cada abertura:
--   1. O relatório é o entregável pago. O cliente abre, fecha, imprime,
--      manda pro sócio. Se o texto mudasse a cada abertura, ele deixaria
--      de ser um documento e viraria um oráculo — e a primeira pergunta
--      na sessão de leitura seria "mas ontem estava escrito outra coisa".
--   2. Custo e latência.
--
-- O que NÃO fica aqui: nenhum resultado. A narrativa é só texto. Posição,
-- nível, rota da trilha e pilar fora de faixa continuam vindo do motor
-- determinístico a cada render — é o que garante que a IA não possa
-- deslocar um resultado, só descrevê-lo.
-- ============================================================

alter table comp_assessments
  add column if not exists narrativa jsonb,
  add column if not exists narrativa_status text
    check (narrativa_status in ('gerando', 'ok', 'falhou')),
  add column if not exists narrativa_modelo text,
  -- Versão do prompt + do esquema. Bump invalida o cache e regenera:
  -- é assim que uma correção de voz alcança quem já tem relatório.
  add column if not exists narrativa_versao text,
  add column if not exists narrativa_em timestamptz,
  -- Trava de concorrência: dois requests simultâneos não geram em dobro.
  -- Timestamp, não boolean — um processo que morre no meio deixaria a
  -- trava presa para sempre, e o relatório nunca mais seria gerado.
  add column if not exists narrativa_iniciada_em timestamptz;

create index if not exists comp_assessments_narrativa_status_idx
  on comp_assessments (narrativa_status);
