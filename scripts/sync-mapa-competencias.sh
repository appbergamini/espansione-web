#!/usr/bin/env bash
# =====================================================================
# Sincroniza apps/mapa-competencias com o repo que a plataforma Enter Pro
# publica a partir do workspace da Vanessa (appbergamini/MapadeCompetencias,
# branch enter-main).
#
# O fluxo tem UM sentido: Enter -> monorepo. Nada volta para la.
# Por isso apps/mapa-competencias/ e SOMENTE LEITURA do nosso lado; ver o
# CLAUDE.md de la.
#
# Uso: bash scripts/sync-mapa-competencias.sh [caminho-do-checkout-do-enter]
#      (o default, .enter-src, e o que a Action usa)
# =====================================================================
set -euo pipefail

SRC="${1:-.enter-src}"
DST="apps/mapa-competencias"

[ -d "$SRC/src" ] || { echo "ERRO: '$SRC' nao parece o repo do Enter (nao tem src/)." >&2; exit 1; }
[ -d "$DST" ]     || { echo "ERRO: '$DST' nao existe. Rode a partir da raiz do monorepo." >&2; exit 1; }

# Arquivos que nascem AQUI e o Enter desconhece. O sync os preserva.
NOSSOS=(IMPORTACAO.md CLAUDE.md AGENTS.md)

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
for f in "${NOSSOS[@]}"; do
  [ -f "$DST/$f" ] && cp "$DST/$f" "$tmp/$f"
done

# Espelhar, nao mesclar: apaga o que sumiu la e traz o que mudou.
# node_modules e dist ficam de fora so para nao forcar reinstall local.
find "$DST" -mindepth 1 -maxdepth 1 ! -name node_modules ! -name dist -exec rm -rf {} +

( cd "$SRC" && tar --exclude=./.git --exclude=./package.json --exclude=./pnpm-lock.yaml -cf - . ) \
  | ( cd "$DST" && tar -xf - )

for f in "${NOSSOS[@]}"; do
  [ -f "$tmp/$f" ] && cp "$tmp/$f" "$DST/$f"
done

# package.json: parte do arquivo DO ENTER e reaplica as nossas mudancas.
# Feito assim, e nao preservando o nosso, porque senao dependencia nova
# adicionada la sumiria no sync e o build quebraria sem explicacao.
node - "$SRC/package.json" "$DST/package.json" <<'JS'
const fs = require("fs");
const [, , origem, destino] = process.argv;
const p = JSON.parse(fs.readFileSync(origem, "utf8"));
const s = p.scripts || {};
p.name = "@espansione/mapa-competencias";
p.scripts = {
  dev: s.dev,
  build: "vite build",           // no monorepo "build" precisa ser o de producao: e o que o turbo chama
  "build:dev": s.build,          // o build em modo development era o do preview do Enter
  "type-check": "tsc --noEmit",  // alinha com a task do turbo
  lint: s.lint,
  check: s.check,
  preview: s.preview,
};
for (const k of Object.keys(p.scripts)) if (!p.scripts[k]) delete p.scripts[k];
fs.writeFileSync(destino, JSON.stringify(p, null, 2) + "\n");
JS

echo "Sincronizado: $DST <- $SRC ($(git -C "$SRC" rev-parse --short HEAD 2>/dev/null || echo '?'))"
