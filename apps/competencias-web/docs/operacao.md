# Operação da zona do Teste de Competências

Estado em 16/08/2026. Complementa `docs/plano-app-competencias-2026-08-16.md` (raiz do repo), que tem o porquê das decisões. Aqui está o como.

---

## Infra

| Item | Valor |
|---|---|
| Projeto Vercel | `competencias-web` · `prj_512aU760R6GOyecVWaq4C54CYVoj` |
| Root Directory | `apps/competencias-web` |
| Branch de produção | `master` |
| URL própria | `competencias-web-appbergaminis-projects.vercel.app` |
| Supabase | mesmo projeto do funil (`qjmokydtdwisznttipvi`) |

O Vercel **pula o build quando o commit não toca `apps/competencias-web/`**. Isso é o comportamento desejado num monorepo: um commit que só mexe no `diagnostic-web` não redeploya a zona, e vice-versa. Um deploy `CANCELED` com essa causa não é erro.

### Variáveis de ambiente

| Nome | Para quê | Production | Preview | Development |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | conexão | ✅ | ⚠️ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | **todo** acesso da zona passa por aqui | ✅ | ⚠️ | ✅ |
| `AVALIADOR_TOKEN` | protege `/api/avaliador/*` | ✅ | ⚠️ | ✅ |

⚠️ **Preview está pendente.** O `vercel@51` tem um bug: pede `<gitbranch>` mesmo no comando que ele próprio sugere para "todas as branches de preview". Como o fluxo do repo é push direto em `master`, preview vale pouco. Para resolver: painel do Vercel → Settings → Environment Variables → marcar Preview nas três. Ou atualizar o CLI (`npm i -g vercel@latest`) e repetir.

> Ao setar por CLI, use **`--value`**, nunca pipe. Pipe adiciona `\n` ao final do valor — uma service role key com newline é um JWT inválido, e o erro que aparece depois não diz isso.

---

## Rodar local

```bash
pnpm --filter @espansione/competencias-web dev     # http://localhost:3000/teste
```

O `.env.local` da zona já existe (gitignored). Se precisar recriar, são as três variáveis acima — as duas do Supabase são as mesmas do `diagnostic-web`.

### Regenerar o catálogo depois de editar as planilhas

```bash
pnpm --filter @espansione/competencias-web catalog
```

Lê `data/competencias/itens_v1.xlsx` + `faixas_v5.xlsx` + `ancorados_rascunho_v1.json` e reescreve `lib/competencias/catalog.generated.js`. **Nunca editar o `.generated.js` à mão.**

O builder recusa a gerar se: o desenho estiver desbalanceado, um bloco repetir capacidade ou competência, uma faixa tiver mínimo ≥ máximo, ou um item ancorado violar as regras de escrita (situação > 15 palavras, opção > 18, ou opção contendo a palavra que nomeia a própria competência).

**Trocar 12 por 15 blocos é editar a planilha e rodar isto.** Nada de código muda — `N_BLOCOS` e `K_APARICOES` saem do que estiver lá.

### Testes

```bash
pnpm --filter @espansione/competencias-web test    # 95 testes, sem banco
pnpm test                                          # monorepo inteiro
```

### Smoke contra o banco real

```bash
cd apps/competencias-web
node --env-file=../diagnostic-web/.env.local scripts/smoke-e2e.mjs
```

Cria uma sessão descartável, responde os dois instrumentos, gera o relatório e **apaga tudo no fim**.

⚠️ As respostas são uniformemente aleatórias, o que produz um perfil comportamental artificialmente **central** — os 4 pilares saem perto de 50. Isso faz o Índice de Ajuste sair alto e a trilha cair em `tecnica` com muito mais frequência que em produção. **Não calibrar nada por este script.**

### 🔴 Limpar sessão de teste: NUNCA por filtro largo

Incidente em 16/08: rodei `delete from comp_assessments where email is null` para limpar sessões de smoke, e **apaguei a sessão de um usuário real que estava respondendo naquele momento**. O `/api/sessao/criar` não pede email, então `email is null` casa com **toda** sessão do fluxo normal — não só com as de teste.

Regra: apagar **por id ou por token**, um a um, e só o que você mesmo acabou de criar.

```sql
-- certo
delete from comp_assessments where token = '<token que eu criei agora>';

-- errado, em qualquer variação
delete from comp_assessments where email is null;
delete from comp_assessments where concluido_em is null;
delete from comp_assessments;
```

O `smoke-e2e.mjs` já faz o certo: guarda o id da sessão que criou e apaga só ele, num `finally`.

---

## Ligar a zona no domínio

O `diagnostic-web` é o dono do domínio e o roteador de borda. As regras de rewrite já estão no `next.config.mjs` dele, **inertes até a variável existir**:

1. No projeto `appbergamini` (o do funil), adicionar em Production:
   ```
   TESTE_ORIGIN = https://competencias-web.vercel.app
   ```
2. **A variável precisa estar declarada em `turbo.json` → `tasks.build.env`.** Já está.
3. Fazer o funil **rebuildar de verdade** (ver armadilha abaixo).
4. `crescimentointegrado.com.br/teste` passa a servir a zona.

Para desligar: apagar a variável e rebuildar. Não precisa mexer em código.

### ⚠️ Duas armadilhas que custaram tempo aqui

**1. Turbo filtra variáveis de ambiente.** O que não está em `turbo.json` → `tasks.build.env` **não chega ao build** — e, pior, não entra no hash do cache, então o turbo replica o build anterior em vez de refazer. O sintoma é cruel: variável setada, deploy `READY`, e a rota continua 404.

O aviso aparece nos logs de build (*"set on your Vercel project, but missing from turbo.json"*) e é fácil de ignorar por estar entre outros avisos.

Só variável lida em **build time** precisa estar ali. As lidas em runtime pelas funções (chaves de API, service role) a Vercel injeta na função — declará-las no turbo só aumentaria cache miss.

**2. `vercel redeploy` reusa o build.** Ele cria um deployment novo com `action: redeploy` e `originalDeploymentId`, mas aproveita o build anterior — então **não** pega variável de ambiente nova. Para forçar rebuild: um commit que toque o app (ou o `turbo.json`), ou o botão de redeploy no painel com o cache desmarcado.

---

## O que ainda falta para vender

### 1. Linha em `produtos_checkout`

Nome, descrição e preço são decisão comercial. O `fulfillment` **não** pode ser `identidade`:

```sql
insert into produtos_checkout (slug, nome, descricao, preco_centavos, fulfillment, ativo)
values ('competencias', '<nome>', '<descrição>', <centavos>, 'competencias', true);
```

O webhook do InfinitePay não precisa de alteração: o ramo genérico dele já registra o pagamento para qualquer `fulfillment` diferente de `identidade`. A sessão do teste nasce depois, na primeira visita a `/teste/acesso`.

### 2. URL de retorno no InfinitePay

```
https://crescimentointegrado.com.br/teste/acesso?order=<order_nsu>
```

### 3. Caminho B — trocar a porta

Decidido: **sem camada grátis**. O teste pago vira a entrada.

- CTA da home (`public/home/index.html`) e da LP (`public/crescimento/index.html`) passam a apontar para o checkout, não para `/mapa`.
- `/mapa` **continua no ar** e continua respondendo. Só sai da porta.
- A coluna `comp_assessments.origem` aceita `'gratuito'`, mas nada cria sessão assim. Fica inerte — é a porta aberta caso o caminho A volte à mesa.

### 4. Calibração dos 22 itens ancorados

Os itens em `data/competencias/ancorados_rascunho_v1.json` estão marcados `rascunho: true`, e o catálogo exporta `ANCORADOS_EM_RASCUNHO`. Enquanto for maior que zero, **o relatório não deve tratar nível como validado**.

Falta a checagem 2 do piloto: a opção 3 é de fato mais avançada que a 2 na percepção de quem responde? Método da SPEC: cruzar a opção escolhida com critério externo (faturamento, tempo de empresa, avaliação de mentor).

---

## Painel do avaliador

```bash
curl -H "x-avaliador-token: $AVALIADOR_TOKEN" \
  https://crescimentointegrado.com.br/teste/api/avaliador/calibracao
```

O que olhar, em ordem de importância:

1. **`amostra.pctAmbos`** — o percentual que conclui **os dois** instrumentos. É a métrica-chefe. Quem não completa não recebe relatório, e quem não recebe relatório não compra o próximo passo.
2. **`desejabilidade.desequilibrados`** — afirmações escolhidas como MAIS (ou MENOS) em ≥40% dos casos. O esperado é 25%. Quem passa disso está inflada e precisa ser reescrita ou trocada de bloco. **Precisa de 150 a 200 respondentes** — não dá para resolver por julgamento.
3. **`tempoMedianoMin.etapa1`** — se passar de ~5 min, os blocos estão difíceis demais.
4. **`corte`** — quantos cortes saíram `por_score` e quantos `por_escolha`. A proporção de `por_escolha` mede o quanto o empate no corte é real na base de vocês (a simulação previu ~44%).

Sessão individual: `/teste/api/avaliador/<token>`. É o **único** lugar onde número aparece.

---

## Coisas que não podem regredir

- **Nenhum resultado antes dos dois instrumentos.** Nem no fim do teste, nem no fim do comportamental. Há teste varrendo as duas telas finais.
- **A varredura de QA** (`varrerRelatorio`) roda antes de publicar qualquer relatório: termo proibido, chave de tradução crua no corpo, número exposto.
- **Nunca baixar o δ** para "achar alguma coisa" num respondente. Ele é versionado justamente para que isso não passe sem rastro.
- **`packages/cis/__tests__/golden.test.js`** compara o pacote contra o `public/cis-app.js` real em 2000 respostas. Se falhar, as duas cópias do instrumento divergiram — reconciliar, nunca "consertar o teste".
- **A palavra "aderência" está aposentada.** Use posição na faixa, Índice de Ajuste ou Índice de Coerência.

---

## Dívida conhecida

| O quê | Onde | Gravidade |
|---|---|---|
| Env de Preview não configurada | Vercel `competencias-web` | baixa |
| `mapa_answers`, `mapa_assessments`, `id_v2_assessments` e `pagamentos` com **RLS desligada** em produção, com anon key pública | Supabase | ⚠️ **alta, e é pré-existente** — não foi introduzida por este trabalho e não foi tocada |
| 22 itens ancorados sem calibração | `ancorados_rascunho_v1.json` | média |
| Duas cópias do instrumento comportamental (pacote + `public/cis-app.js`) | segurada pelo golden test | baixa |
