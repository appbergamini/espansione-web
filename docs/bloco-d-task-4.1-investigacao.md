# Fase A — Achados da investigação (TASK 4.1 · Bloco D)

## Estrutura de componentes

- **Localização:** `components/` (raiz do `web/`, não há `src/`)
- **Agrupamentos existentes:**
  - `components/forms/` com subpastas `FormSocios/`, `FormColaboradores/`, `FormClientes/` e `shared/` (BarraProgresso, EscalaLikert, RadarSliders, RankingDragDrop)
  - `components/pdf/` com `RelatorioDisc.js` (PDF client-side)
  - Componentes avulsos na raiz de `components/`: `DashboardLayout.js`, `Logo.js`, `Icon.js`, `RespondentesManager.js`, `OptInEntrevistasManager.js`, `PosicionamentoResults.js`, `RichTextEditor.js`
- **Componentes de visualização/gráfico existentes hoje:** nenhum. Há um `RadarSliders.js` em `forms/shared/` mas é só inputs de range, não um gráfico.
- **Paleta/tokens visuais:** `styles/globals.css` (248 linhas). Declara tokens `--brand-red`, `--accent-blue`, variáveis de background/texto. Já é a **fonte única de verdade de cores**.

## `package.json`

| Item | Valor |
|---|---|
| **React** | `19.2.4` |
| **Next.js** | `16.2.1` |
| **Tailwind** | `tailwindcss ^4.2.2` + `@tailwindcss/postcss ^4.2.2` (**Tailwind v4 via PostCSS plugin**, sem `tailwind.config.js`) |
| **Lib de UI** | nenhuma (shadcn/chakra/mantine/radix) |
| **Lib de gráficos** | nenhuma |
| **Storybook** | não instalado |
| **Linguagem** | **JavaScript puro** — zero arquivos `.tsx`/`.ts`, 39 `.js` em `components/`, sem `tsconfig.json` |
| **Linter/Formatter** | nenhum configurado (`.eslintrc*` ausente, `.prettierrc*` ausente) |
| **PDF** | `jspdf ^4.2.1` (client-side, usado em `lib/pdf/outputPdf.js`) + `@react-pdf/renderer ^4.3.2` (instalado mas sem uso ativo) |

## Convenções de código

Arquivos de referência olhados: `DashboardLayout.js`, `Logo.js`, `OptInEntrevistasManager.js`, `Icon.js`.

- **Export:** `export default function Name({ ...props })` para o componente principal; `export function HelperName` para secundários. Nenhum `export const Comp = () => {...}`.
- **Tipagem:** JSDoc curto em comentário de cabeçalho quando há; **não usa PropTypes nem TypeScript**. Props desestruturadas direto na assinatura.
- **Estilização:** híbrido — **inline styles (`style={...}`) predominam** (~467 ocorrências em `components/**.js`) versus **Tailwind classes** (~93 ocorrências). Exemplos:
  - `DashboardLayout.js` → Tailwind-forward (`className="flex items-center…"`).
  - `OptInEntrevistasManager.js` → inline styles + CSS custom properties (`backgroundColor: 'var(--glass-border)'`).
  - `Icon.js` → SVGs inline com path constants.
- **Nomenclatura:** `PascalCase` para componentes, `camelCase` para props/handlers.
- **Sem aliases de import:** tudo relativo (`../../lib/...`), sem `@/`.
- **Exemplo de referência (`Icon.js` cabeçalho):**
  ```js
  /**
   * ESPANSIONE · Icon set
   * Substitui emojis por SVGs Lucide. Tamanho padrão 20px, cor currentColor.
   */
  const PATHS = { home: '...', folder: '...' };
  export default function Icon({ name, size = 20, className = '', ...props }) { ... }
  export function StatusIcon({ done, size = 16 }) { ... }
  ```

## Instalações propostas para Fase B

| Lib | Versão-alvo | Justificativa |
|---|---|---|
| **`recharts`** | `^2.15` (última v2 estável) | Exigido pela spec para `RadarDISC` e `RadarMaturidade360` (gráficos multi-eixo). v3 ainda é beta em alguns recursos. |
| **`@storybook/nextjs`** + pacotes base (`@storybook/addon-essentials`, `@storybook/react`, `storybook`) | última estável compatível com Next 16 + React 19 | Exigido pela spec para catálogo visual dos 5 componentes + 4–5 stories cada. |

**Não vou instalar** nenhuma dep de tipagem (TypeScript, PropTypes) — o projeto inteiro é JS; manter consistência.

## Desvios propostos à spec da Fase C

A spec presume **TypeScript** (arquivos `.tsx`, `interface Props`). O projeto é **100% JavaScript**. Dois caminhos:

1. **Manter JavaScript puro com JSDoc (recomendado):** arquivos `.js`, props documentadas em JSDoc `@typedef`/`@param`. Zero fricção com o resto do codebase. Próximas tasks que consumirem esses componentes não precisam se adaptar.
2. **Introduzir TypeScript só para os 5 componentes:** mexe em `tsconfig.json` (criar), afeta build do Next, pode gerar eco nas próximas tasks. Alto custo pela ambiguidade.

→ **Proposta:** seguir caminho (1) — `.js` com JSDoc. A spec da Fase C cita `interface RadarDISCProps`; traduzirei para `@typedef` JSDoc.

A spec também usa **Tailwind com classes extensas** (`bg-primary/5 border-2 border-primary/20`, `className="flex items-center gap-3 py-2"`). Como Tailwind v4 está configurado no projeto, isso funciona, mas o codebase atual prefere **inline styles + vars CSS**. Proposta: **usar Tailwind v4** conforme a spec (é um upgrade de estilo coerente com as últimas features entregues), **mas manter um wrapper com `style` sempre que a cor vier dos tokens já definidos em `globals.css`** (`var(--accent-blue)` etc.), garantindo coerência com componentes pré-existentes como `OptInEntrevistasManager`. O arquivo `tokens.ts` da spec vira `tokens.js` que re-exporta os valores já definidos em CSS.

## Perguntas para o usuário antes de seguir

1. **TypeScript x JavaScript:** confirma seguir em `.js` com JSDoc (opção 1 acima)?
2. **Storybook na mesma versão do Next 16 + React 19:** `@storybook/nextjs` pode ter problemas de compatibilidade muito recentes. Posso pular Storybook e entregar os stories como páginas `/dev/visualizations-catalog` (página interna) se a instalação falhar — quer esse fallback pré-autorizado?
3. **Paleta:** a spec do `tokens.ts` traz `#00326D` (azul), `#10B981` (verde sustenta), `#F59E0B` (amarelo desenvolvendo), `#DC2626` (vermelho frágil). As variáveis atuais em `globals.css` têm `--brand-red` (`#DC2626`-ish), `--accent-blue` (`#6BA3FF`?). Confirma os 4 hex da spec ou prefere que eu mapeie para as vars já existentes em `globals.css`?
4. **`docs/bloco-d-task-4.1-investigacao.md`** (este arquivo) — aprovo salvar no repo? (Vai ser útil como registro; caso contrário, passo para a Fase B sem commitar.)

---

**GATE:** aguardo aprovação explícita aqui antes de executar a Fase B (instalação de `recharts` + `@storybook/nextjs`, criação da estrutura de pastas e do `tokens.js`).
