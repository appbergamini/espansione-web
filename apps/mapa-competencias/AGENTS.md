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
