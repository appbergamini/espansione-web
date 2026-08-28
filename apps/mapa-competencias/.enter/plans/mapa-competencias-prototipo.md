# Protótipo Visual — Mapa de Competências para o Próximo Nível

## Contexto

O usuário quer um protótipo 100% visual de um instrumento de autopercepção comportamental para empreendedores, sócios e lideranças, da marca **Espansione – Crescimento Integrado**. O produto leva o usuário por um fluxo de 10 telas: landing → contexto do participante → assessment (60 afirmações) → transição → resultados (dashboard, competências, comportamental, matriz, prioridades, plano).

**Nesta etapa NÃO haverá:** banco de dados, autenticação, pagamento, IA, nem lógica definitiva de cálculo. Todos os resultados usam dados fictícios de **"Participante Exemplo"**. O objetivo é aprovar IA (arquitetura de informação), telas e visual.

**Decisões confirmadas com o usuário:**
- Assessment começa em branco, com botão **"Preencher respostas de exemplo"** para agilizar a revisão.
- Navegação: fluxo linear natural (voltar/avançar) + **sub-menu de resultados** (Dashboard, Competências, Comportamental, Matriz, Prioridades, Plano) nas telas 5–10.

**Stack atual (reutilizar):** React + Vite + TypeScript + Tailwind v3 + shadcn/ui + `react-router-dom` v7 + `lucide-react` + `framer-motion` + `recharts`. Conteúdo em português direto no código (sem i18n nesta fase).

---

## Direção visual

- **Tipografia:** serifada de display **Fraunces** (headlines) + **Public Sans** (corpo/UI), via Google Fonts no `index.html`. Sofisticado, editorial e corporativo — sem aparência de "teste psicológico genérico".
- **Paleta (tokens em `index.css` + `tailwind.config.ts`):**
  - `#00326D` (azul-marinho profundo) → fundos escuros, títulos, footer
  - `#004198` (azul médio) → `--primary` (CTAs, destaques)
  - `#6BA8FF` (azul claro) → `--accent`, estado "Em observação"
  - `#FFFFFF` / `#F0F0F0` → `--background` / `--secondary`
  - `#C72437` (vermelho) → **apenas pequenos destaques**: estado "Prioridade de desenvolvimento", marcações no quadrante prioritário
  - Estados: **Base de sustentação** (neutro/contorno azul) · **Em observação** (azul claro) · **Prioridade de desenvolvimento** (vermelho)
- **Princípios:** muito espaço em branco, cards elegantes com borda sutil e sombra suave, tipografia grande, ícones lineares (`lucide-react`), layout responsivo (desktop/mobile), `border-radius` maior (`--radius: 0.75rem`), gradiente sutil da marca no hero, animações suaves (`framer-motion`).
- **Metodologia visível no produto:** nenhum polo é "melhor"; o centro não é ideal; "competência é comportamento em ação, adequado ao contexto e orientado ao resultado". Nenhum percentual de competência.

---

## Dados fictícios (`src/data/`)

- `types.ts` — tipos: `Participant`, `Challenge`, `Behavior` (id, nome, poloA, poloB, score 0–100, contribuições[], atenções[], macroárea), `Competency` (id, nome, macroárea, descrição, relevância, behaviorIds, estado, coordsMatriz {relevancia, necessidade}, e para as 3 prioridades: contribuição, limitação, movimento, treinamento), `Statement` (id, texto, behaviorId oculto, respostaExemplo 1–7).
- `behaviors.ts` — **20 características comportamentais** bipolares fictícias (ex.: "Cético/Cauteloso ↔ Confiança/Positividade", "Controlador/Centralizador ↔ Delegador/Capacitador"), cada uma com score 0–100, 2–3 pontos de contribuição e 2–3 pontos de atenção, agrupadas por macroárea para exibição.
- `competencies.ts` — **15 competências** (5 Estratégicas, 5 Laborais, 5 Relacionais), cada uma ligada a 4–5 comportamentos, com descrição e relevância para o próximo nível. **3 prioridades** (uma por macroárea, história coerente: "fundador que precisa sair do operacional, sistematizar e delegar"): **Visão Estratégica** (Estratégicas), **Gestão de Processos** (Laborais), **Delegação e Fortalecimento do Time** (Relacionais) — com todos os campos de detalhamento (Tela 9) e treinamento recomendado.
- `statements.ts` — **60 afirmações** em PT (3 por comportamento), cada uma com `behaviorId` (nunca exibido) e `respostaExemplo` 1–7 coerente com os scores.
- `challenges.ts` — ~12 desafios ("Escalar vendas", "Reduzir dependência do fundador", "Estruturar e delegar processos", "Formar lideranças", etc.). Selecionados (3) para o Participante Exemplo: **Escalar vendas e ampliar a carteira**, **Reduzir a dependência do fundador**, **Estruturar e delegar processos internos**.
- `participant.ts` — contexto fictício: "Participante Exemplo", atuação "CEO e fundador — empresa de serviços B2B", 10–49 funcionários, lidera pessoas "Sim", participa de vendas/negociação "Sim".

---

## Estado do protótipo (`src/prototype/context.tsx`)

- `PrototypeProvider` + hook `usePrototype()` (em memória, suficiente para revisão).
- Guarda: dados do participante (form Tela 2), desafios selecionados (até 3), respostas do assessment (`(1–7 | null)[60]`), ações `setParticipant`, `toggleChallenge`, `setAnswer`, `fillExampleAnswers` (preenche as 60 com `respostaExemplo`), `reset`.
- Resultados (telas 5–10) leem diretamente os dados fictícios fixos (sem lógica de cálculo).

## Componentes compartilhados (`src/components/`)

- `layout/PrototypeLayout.tsx` — header com marca Espansione, indicador de passo no fluxo (Landing→Contexto→Assessment) nas telas 1–4, sub-menu de resultados nas telas 5–10, footer.
- `layout/ResultsNav.tsx` — sub-menu horizontal (Dashboard, Competências, Comportamental, Matriz, Prioridades, Plano) com ícones `lucide`.
- `bipolar-bar.tsx` — gráfico bipolar horizontal reutilizável: Polo A — linha com marcador central tracejado (neutro) — posição da pessoa — Polo B — score 0–100; nota visual de que nenhum polo é "melhor". Usado nas telas 6, 7 e 9.
- `status-badge.tsx` — badge dos 3 estados com ícone e cor.
- `competency-sheet.tsx` — drawer (`Sheet` shadcn) com o detalhamento completo de uma competência (descrição, relevância, comportamentos com posição atual, pontos de contribuição e atenção) — reutilizado nas telas 6 e 8.
- `scale-option.tsx` — botão da escala 1–7 do assessment.

## Páginas (`src/pages/`, subdiretório por página)

1. **`landing/`** (`/`) — hero com headline "O que o próximo nível do seu negócio exige de você?", subheadline, CTA **"Iniciar meu Mapa"**, faixa de princípios da metodologia (sem certo/errado, eixos bipolares, competência em ação), footer da marca.
2. **`contexto/`** (`/contexto`) — form pré-preenchido com Participante Exemplo: Nome, Atuação atual, Tamanho da empresa (select), Lidera pessoas (sim/não), Participa de vendas/negociação (sim/não). Depois: "O que precisa acontecer para seu negócio avançar para o próximo nível?" com cards de desafios (até 3, contador "X de 3"). "Continuar" habilitado com nome + ≥1 desafio.
3. **`assessment/`** (`/assessment`) — 60 afirmações em 6 blocos de 10; escala 1–7 por linha; legendas extremas ("Não representa minha forma de agir" ↔ "Representa muito minha forma de agir"); barra de progresso (respondidas/60); botão **"Preencher respostas de exemplo"**; aviso "não há respostas certas ou erradas"; `behaviorId` nunca exibido; "Concluir" exige 60/60 (com contagem de faltantes).
4. **`transicao/`** (`/organizando`) — "Organizando seu Mapa." com animação e auto-redirecionamento para `/dashboard` (~2,5s).
5. **`dashboard/`** (`/dashboard`) — título "O que o seu próximo nível está exigindo de você"; card "Desafio declarado" (3 selecionados); 3 cards de competências prioritárias (macroárea + badge + comportamentos principais + link "Ver detalhes"); seção compacta das demais por estado (Base de sustentação / Em observação); legenda dos estados. Sem percentuais.
6. **`competencias/`** (`/competencias`) — 15 cards agrupados por macroárea (Estratégicas, Laborais, Relacionais); clique abre `competency-sheet`.
7. **`comportamental/`** (`/comportamental`) — 20 `bipolar-bar`s agrupados por macroárea; nota introdutória sobre eixos bipolares (nenhum lado é melhor). Sem radar.
8. **`matriz/`** (`/matriz`) — gráfico de quadrantes **SVG próprio** (mais controle visual): eixo X "Baixa → Alta relevância para o próximo nível", eixo Y "Menor → Maior necessidade de desenvolvimento"; 15 pontos rotulados; quadrante de maior prioridade destacado (sombra/vermelho); 3 prioridades com pontos maiores; clique abre `competency-sheet`; horizontal scroll no mobile.
9. **`prioridades/`** (`/prioridades`) — detalhamento das 3 prioridades em seções numeradas: competência → por que é importante → comportamentos (bipolar-bar) → como podem contribuir → onde podem limitar → movimento de desenvolvimento → treinamento recomendado.
10. **`plano/`** (`/plano`) — jornada visual por prioridade: **Competência → Comportamento → Desenvolvimento → Treinamento** (passos conectados); "Intenção em Ação" com pergunta + textarea; botão **"Imprimir / Salvar PDF"** (`window.print()`); estilos `@media print` (esconder nav/botões, fundo branco, layout de impressão limpo).

## Rotas (`src/router.tsx`)

Adicionar: `/contexto`, `/assessment`, `/organizando`, `/dashboard`, `/competencias`, `/comportamental`, `/matriz`, `/prioridades`, `/plano` (todas dentro de um layout que renderiza `PrototypeLayout`). Manter o catch-all `*` (NotFound).

## Design system (`src/index.css` + `tailwind.config.ts`)

- Tokens de cor da marca (HSL) mapeados para `--background/--foreground/--primary/--secondary/--accent/--muted/--border/--destructive` e novos `--navy`/`--status-*`.
- `--radius: 0.75rem`; fontes `--font-display`/`--font-sans` + `fontFamily.display/sans` no Tailwind.
- Gradiente de marca, sombras suaves, keyframes de entrada suave.
- Bloco `@media print` para a Tela 10.
- Atualizar `CodeGuideline.md` (estrutura de pastas novas).

## Checklist de implementação

- [ ] Fontes (Fraunces + Public Sans) carregadas no `index.html`.
- [ ] Tokens de cor/marca, fontes, sombras, radius e `@media print` em `index.css` e `tailwind.config.ts`.
- [ ] `src/data/types.ts` com todos os tipos.
- [ ] `src/data/behaviors.ts` com 20 comportamentos bipolares (poloA/poloB/score/contribuições/atenções/macroárea).
- [ ] `src/data/competencies.ts` com 15 competências, 3 prioridades completas (treinamento etc.) e coordenadas da matriz.
- [ ] `src/data/statements.ts` com 60 afirmações + `respostaExemplo`.
- [ ] `src/data/challenges.ts` (~12) e `src/data/participant.ts` (Participante Exemplo + 3 desafios selecionados).
- [ ] `src/prototype/context.tsx` (provider, hook, `fillExampleAnswers`).
- [ ] `PrototypeLayout` + `ResultsNav` + `StatusBadge` + `BipolarBar` + `CompetencySheet` + `ScaleOption`.
- [ ] Tela 1 `landing/` com headline/sub/CTA e princípios da metodologia.
- [ ] Tela 2 `contexto/` com form pré-preenchido e seleção de até 3 desafios.
- [ ] Tela 3 `assessment/` com 6 blocos × 10, escala 1–7, progresso e "Preencher respostas de exemplo".
- [ ] Tela 4 `transicao/` com auto-redirecionamento.
- [ ] Tela 5 `dashboard/` com prioridades, comportamentos, resumo do desafio e estados.
- [ ] Tela 6 `competencias/` com 15 cards + `competency-sheet` ao clicar.
- [ ] Tela 7 `comportamental/` com 20 gráficos bipolares horizontais (sem radar).
- [ ] Tela 8 `matriz/` com gráfico SVG de quadrantes e destaque da prioridade.
- [ ] Tela 9 `prioridades/` com detalhamento completo das 3 prioridades.
- [ ] Tela 10 `plano/` com jornada, "Intenção em Ação" e versão de impressão/PDF.
- [ ] Rotas registradas em `router.tsx` e `CodeGuideline.md` atualizado.

## Checklist de verificação

- [ ] `pnpm lint` e build passam sem erros (rodados pelo framework ao fim do turno).
- [ ] Fluxo linear navegável de ponta a ponta: Landing → Contexto → Assessment → "Organizando" → Dashboard.
- [ ] "Preencher respostas de exemplo" preenche 60/60 e habilita "Concluir".
- [ ] Sub-menu de resultados acessível e ativo nas telas 5–10.
- [ ] Nenhuma tela exibe percentual de competência; nenhuma classifica polo como bom/ruim; `behaviorId` nunca aparece no assessment.
- [ ] `competency-sheet` abre para todas as 15 competências (telas 6 e 8).
- [ ] Matriz mostra 15 pontos, quadrante prioritário destacado e legenda.
- [ ] Responsivo no mobile: hero, cards, escala 1–7, gráficos bipolares e matriz (scroll horizontal) funcionam sem quebra.
- [ ] Tela 10: `window.print()` gera layout limpo (nav/botões ocultos, fundo branco).
- [ ] `website_screenshot` nas telas principais (landing, assessment, dashboard, comportamental, matriz, plano) para conferência visual de desktop e mobile.
