-- =====================================================================
-- Mapa de Maturidade — opção "Não sei" (valor -1, excluído do score)
-- =====================================================================
-- "Não sei" é uma resposta válida que o respondente pode dar quando não tem
-- visibilidade. Não conta no score do pilar (nem soma, nem denominador).
-- Persistida como value = -1; o check de 0–3 é relaxado para aceitar -1.

alter table public.mapa_answers drop constraint if exists mapa_answers_value_check;
alter table public.mapa_answers add constraint mapa_answers_value_check check (value >= -1 and value <= 3);
