# Mapa de Competências — SOMENTE LEITURA

## Não edite nada aqui

Este app é **espelho** de `appbergamini/MapadeCompetencias` (branch `enter-main`),
o repo que a plataforma [Enter Pro](https://enter.pro) sincroniza a partir do
workspace da Vanessa. **Ela continua construindo lá.**

O fluxo tem um sentido só:

```
Vanessa no Enter Pro  →  MapadeCompetencias  →  PR neste monorepo
```

Nada volta. Uma alteração feita aqui **não chega ao Enter** e é **desfeita no
próximo sync** — que roda todo dia útil pela Action
`.github/workflows/sync-mapa-competencias.yml`.

Isso vale para `src/`, `public/`, configs, tudo. As três exceções são arquivos
que nascem aqui e o Enter desconhece, preservados pelo script de sync:
`IMPORTACAO.md`, `CLAUDE.md` e este `AGENTS.md`.

## Onde então mexer

- **Precisa mudar o produto** (texto, tela, metodologia, motor): peça à Vanessa,
  ou entre no Enter. A fonte é lá.
- **Precisa de algo que só existe no nosso lado** (ligar no Supabase, tirar o
  SDK de analytics do Enter, rota no funil): construa **fora deste diretório**.
  Um app ou pacote irmão que consome este; nunca uma edição aqui dentro.
- **O `package.json` é a única exceção parcial:** ele não é copiado cru. O script
  parte do arquivo do Enter e reaplica 4 mudanças (nome do pacote, `build` de
  produção, `build:dev`, `type-check`). Se precisar de uma quinta, ela vai em
  `scripts/sync-mapa-competencias.sh`, não neste arquivo — senão some no sync.

## Trazer as mudanças do Enter na mão

```bash
git fetch enter                       # remote já cadastrado
git worktree add /tmp/enter enter/enter-main
bash scripts/sync-mapa-competencias.sh /tmp/enter
git diff -- apps/mapa-competencias
```

Rodar o script duas vezes a partir do mesmo commit do Enter tem de dar diff
vazio. Se não der, o script divergiu do que a importação fez — conserte o
script, não o resultado.

## Contexto

`IMPORTACAO.md` explica de onde veio, por que coexiste com o `competencias-web`
(são instrumentos diferentes, não duas versões do mesmo) e o que está pendente
antes de qualquer deploy — com destaque para o SDK de analytics que ainda aponta
para `api.enter.pro`.

## Publicação

Vive em **`desenvolvimento.crescimentointegrado.com.br`**, projeto Vercel
`mapa-competencias` (`prj_EvSuXaVJnABjWbj2X8gwTyAGlzl5`), Root Directory
`apps/mapa-competencias`.

**Subdomínio, e não um subcaminho do funil, por causa do somente-leitura:** o app
assume que vive na raiz (`base: '/'` no `vite.config.ts`, `createBrowserRouter`
sem `basename`, as 10 rotas absolutas). Servi-lo sob `/desenvolvimento` exigiria
mexer no `App.tsx` — mudança que sumiria no sync seguinte. Se um dia o subcaminho
for necessário, o caminho certo é pedir à Vanessa o
`basename: import.meta.env.BASE_URL` **no Enter**, para vir pela fonte.

O `vercel.json` daqui não aceita comentários (a Vercel rejeita chaves `//`), por
isso ficam aqui: o rewrite catch-all é o fallback de SPA — as rewrites rodam
depois da checagem de arquivo estático, então `/assets/*` continua servido; e o
`X-Robots-Tag: noindex` existe porque isto é protótipo em evolução e carrega o
banco de itens da metodologia.

## O SDK de analytics do Enter — o que ele faz, medido

`src/main.tsx` chama `bootstrapGeneratedSiteAnalytics()` no boot, e o SDK
(`@enter-pro/analytics-sdk`) tem `https://api.enter.pro/code/api/v1/track`
embutido. Auditado em 27/08/2026 sobre o bundle **de produção**:

**Não envia nada hoje, e isso está verificado.** O `import.meta.env` inlined no
build é `{BASE_URL:"/",DEV:false,MODE:"production",PROD:true,SSR:false}` — nenhuma
chave `VITE_ENTER_*`. Sem token, o bootstrap para em
`if (!config.enabled || !config.endpoint || !config.token) return;` antes de criar
transporte ou coletor. O `index.html` tem o comentário "DO NOT REMOVE THIS SCRIPT
TAG" mas nenhuma script tag: nada injeta `__ENTER_ANALYTICS_ENV__` em runtime.

**Duas ressalvas que importam:**

1. **Marca o visitante mesmo desligado.** `getOrCreateVisitorIdentity()` roda
   ANTES do portão e grava um UUID persistente + `first_seen_at` em
   **localStorage e cookie** (`enter.analytics.visitor_id`). Só para de gravar se
   `bootstrapGeneratedSiteAnalytics()` não for chamado — ou seja, exige mudança
   no `main.tsx`, **e ela tem de vir do Enter** para sobreviver ao sync.
2. **O SDK é fail-open.** `enabled: enabledRaw !== "false"` (com comentário no
   fonte: "ligado por padrão, só um false explícito desliga"). A única coisa que
   impedia a transmissão era a ausência do token.

**Trava aplicada:** `VITE_ENTER_ANALYTICS_ENABLED=false` como env var do projeto
Vercel, nos três ambientes. O Vite embute variáveis `VITE_*` no build, então
`enabled` sai `false` dentro do bundle e o SDK desiste mesmo que um token
apareça. **Não remova essa variável** sem trocar a trava por outra.

Se algum dia o SDK for ativado, o payload leva: `visitor_id`, `session_id`, URL,
path, título, referrer, UTMs, tipo de dispositivo, browser, SO, idioma, resolução
de tela, eventos de sessão, **mensagens de erro** e métricas de performance. E o
sistema de definições de evento suporta extratores `formField`/`formFields` — num
app com formulário de identificação e 60 afirmações, uma definição remota
conseguiria capturar respostas. Esse caminho exige também
`VITE_ENTER_ANALYTICS_DEFINITIONS_ENDPOINT`, que não está definida.
