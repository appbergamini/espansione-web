# Mapa de Competências — origem e re-sincronização

## De onde veio

Este app **não nasceu aqui**. Ele foi construído na plataforma
[Enter Pro](https://enter.pro) (Converge.AI), no workspace da Vanessa, e
sincronizado para o GitHub em `appbergamini/MapadeCompetencias`
(privado, branch `enter-main`).

Importado para o monorepo em 27/08/2026, a partir do commit `fb9518f`
("refactor(assessment): implement robust result persistence and integrity checks").

## Por que ele coexiste com o `competencias-web`

São **instrumentos diferentes**, não duas versões do mesmo:

| | `competencias-web` | `mapa-competencias` (este) |
|---|---|---|
| Formato | Escolha forçada (ipsativo) | Likert 1–7, 60 afirmações |
| Estrutura | 12 blocos × 12 competências, soma zero | 60 itens → 20 comportamentos bipolares → 17 competências |
| Taxonomia | 4 capacidades + 4 pilares | 3 macroáreas (Estratégicas, Laborais, Relacionais) |
| Backend | Supabase, sessão por token, relatório por IA | **nenhum** — 100% front-end |

Decisão de 27/08/2026: os dois coexistem. Este entra como um terceiro
instrumento, ao lado do teste de competências e do Mapeamento Comportamental.

## O que foi alterado na importação

Mudanças mínimas, só o necessário para o app viver no monorepo:

1. `package.json` → `name` passou de `vite_react_shadcn_ts` para `@espansione/mapa-competencias`.
2. `package.json` → `build` agora é `vite build` (produção), porque é o script
   que o turbo e a Vercel chamam. O build em modo development, que era o do
   preview do Enter, ficou preservado como `build:dev`.
3. `package.json` → adicionado `type-check`, para alinhar com a task do turbo.
4. Removido o `pnpm-lock.yaml` próprio — quem manda é o lockfile da raiz.

**Nada mais foi tocado.** O código-fonte em `src/` está idêntico ao do Enter,
de propósito: é o que mantém a re-sincronização barata.

## Como trazer atualizações do Enter

Se a Vanessa continuar construindo lá, os caminhos dos arquivos batem 1:1:

```bash
# uma vez:
git remote add enter https://github.com/appbergamini/MapadeCompetencias.git

# a cada vez:
git fetch enter
git diff enter/enter-main:src apps/mapa-competencias/src
```

Atenção: a sincronização do Enter é **bidirecional com o repo dele**, não com
este monorepo. Editar aqui não volta para lá.

## Pendências antes de qualquer deploy

- [ ] **Analytics do Enter.** `src/main.tsx` chama `bootstrapGeneratedSiteAnalytics()`
      no boot, e o bundle de produção carrega `https://api.enter.pro`. Sem token
      configurado ele provavelmente não envia nada, mas isso **não foi verificado**.
      Decidir se remove o SDK ou confirma que está inerte.
- [ ] **`vite-plugin-enter-dev`** roda também no build de produção (`enterProdPlugin`).
      Avaliar se sai.
- [ ] **i18n do template.** Sobrou `public/locales/en.json` e `zh-CN.json` e toda a
      infra de i18next. O produto é só PT. Limpar.
- [ ] **Sem backend.** Não há persistência: os resultados vivem em memória/localStorage.
      Ligar ao Supabase é trabalho à parte.
- [ ] **Marca.** Este app usa `#00326D` + Fraunces + Public Sans, e não o padrão
      do funil (navy `#001A3B` + Poppins + `#C72638`). Decisão de 27/08: manter
      o visual do protótipo por ora.
