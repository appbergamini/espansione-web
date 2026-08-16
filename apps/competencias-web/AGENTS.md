# Zona do Teste de Competências

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## O que este app é

Uma **zona** do domínio `crescimentointegrado.com.br`, servida sob `/teste`. O dono do domínio continua sendo `apps/diagnostic-web`, que roteia por rewrites. Este app tem `basePath: '/teste'` — as rotas aqui são escritas sem o prefixo, o Next aplica.

Plano de referência: `docs/plano-app-competencias-2026-08-16.md`.

## Regras que não se negociam

- **Nomenclatura.** Nenhum termo do instrumento de origem (DISC, Dominância, Influência, Estabilidade, Conformidade) em superfície de cliente. Os 4 pilares são Determinação, Conexão, Constância, Precisão. O instrumento comportamental chama-se **Mapeamento Comportamental** — nunca "CIS", nunca "Perfil Comportamental".
- As **16 do instrumento comportamental** são *características*. As **12 do teste** são *competências*. Nunca as duas com o mesmo nome na mesma tela.
- **"Aderência" está aposentada** como palavra do sistema: use *posição na faixa*, *Índice de Ajuste* ou *Índice de Coerência*, conforme o caso.
- Nunca "deficiente", "fraco", "ruim", "problema" — use "em desenvolvimento", "ponto de atenção", "exige intenção".
- Nada de número de pilar, de característica ou de gap exposto ao respondente.
- **Links para fora da zona** (`/area`, `/mapa`, home) usam `<a>`, nunca `<Link>`.

## Código compartilhado

- `@espansione/cis` — instrumento comportamental, cálculo, derivação dos 4 pilares. Cópia única. Enquanto `diagnostic-web/public/cis-app.js` mantiver a dele, o teste `packages/cis/__tests__/golden.test.js` impede que divirjam.
- `@espansione/brand` — tokens da marca, sincronizados com `mapaTheme.js` por teste.

## Testes

`node --test` puro, como no resto do repo. Sem framework.
