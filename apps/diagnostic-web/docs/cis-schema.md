# CIS — Schema estável (produzido por `getCisParsed`)

Documento oficial do schema que `lib/cis/parseCis.js::getCisParsed` entrega a partir de um registro bruto de `cis_assessments`. Os prompts dos agentes (especialmente o Agente 2) devem assumir este schema sem fazer interpretação adicional.

---

## Entrada

Qualquer registro de `cis_assessments` com:

- `id` (uuid)
- `scores_json` (jsonb) — bruto do instrumento, sem garantia de estrutura
- `perfil_label` (text) — opcional
- `nome` / `participante_nome` — opcional
- `papel` — opcional (`socio` | `colaborador`)

## Saída (`CisParsed`)

```jsonc
{
  "disc": {
    "D": 70,          // 0-100 ou null
    "I": 50,
    "S": 20,
    "C": 10,
    "dominante": "D"  // "D" | "I" | "S" | "C" | null
  },
  "disc_adaptado": {
    "D": 65,          // mesmo formato, representa comportamento sob pressão
    "I": 45,
    "S": 30,
    "C": 15,
    "dominante": "D"
  },
  "jung": {
    "extroversao_introversao": null,   // "E" | "I" | null
    "sensacao_intuicao": null,         // "S" | "N" | null
    "pensamento_sentimento": null,     // "T" | "F" | null
    "julgamento_percepcao": null,      // "J" | "P" | null
    "tipo": null                       // "ENTJ" etc. ou null
  },
  "competencias": {
    "ousadia": 80,          // 0-100 ou null
    "comando": 75,
    "objetividade": 70,
    "assertividade": 65,
    "empatia": 40,
    "paciencia": 35,        // normalização: "Paciência" → "paciencia"
    "persistencia": 85,
    "planejamento": 60,
    "persuasao": 55,        // "Persuasão" → "persuasao"
    "extroversao": 70,
    "entusiasmo": 65,
    "sociabilidade": 60,
    "organizacao": 75,      // "Organização" → "organizacao"
    "detalhismo": 50,
    "prudencia": 45,        // "Prudência" → "prudencia"
    "concentracao": 70      // "Concentração" → "concentracao"
  },
  "estilo_lideranca": "Executivo",   // "Executivo" | "Motivador" | "Metodico" | "Sistematico" | null
  "perfil_label": "DI",              // string curta do instrumento (ex.: "DI", "SC", "Analítico-Estável") ou null
  "meta": {
    "assessment_id": "abc-123",
    "participante_nome": "Ana Teste" | null,
    "papel": "socio" | "colaborador" | null,
    "completo": true                 // DISC completo (4) + >= 12 das 16 competências
  }
}
```

## Invariantes

1. **`getCisParsed(null)` retorna `null`** — sem exceção.
2. **Campos ausentes retornam `null`** (nunca `undefined`) — schema estável.
3. **`meta.completo`** é sempre booleano. Agentes devem usar isso como filtro de confiabilidade.
4. **Nomes de competências** são sempre `snake_case` sem acentos (usar a lista `COMPETENCIAS_KEYS` exportada).
5. **Estilos de liderança** vêm capitalizados, sem acentos: `Executivo`, `Motivador`, `Metodico`, `Sistematico`. Legado `"Executor"` é mapeado para `"Executivo"`.
6. **`disc_adaptado`** é o DISC sob ambiente externo/pressão (fonte `dA` no Formato A novo, `discA` no Formato B legado). Mesma estrutura do `disc` self.

## Agregação — `aggregateCisByProject(assessments)`

```jsonc
{
  "total": 11,                 // assessments recebidos
  "completos": 3,              // passaram no filtro meta.completo
  "disc_coletivo": {           // média dos scores DISC self entre os completos
    "D": 50,
    "I": 45,
    "S": 35,
    "C": 30
  },
  "competencias_coletivas": {  // média por competência (null quando nenhum indivíduo tem score)
    "ousadia": 60,
    "comando": 55,
    // ... (todas as 16)
    "concentracao": 70
  },
  "jung_coletivo": {           // contagem de preferências por eixo (geralmente zeros no instrumento atual)
    "E": 0, "I": 0,
    "S": 0, "N": 0,
    "T": 0, "F": 0,
    "J": 0, "P": 0
  },
  "estilos_distribuicao": {    // quantos indivíduos em cada estilo de liderança
    "Executivo": 2,
    "Motivador": 1,
    "Metodico": 0,
    "Sistematico": 0
  },
  "individuos": [ /* CisParsed[] — só os completos */ ]
}
```

Array vazio → `total: 0, completos: 0, disc_coletivo: null, competencias_coletivas: null, individuos: []`.

## Formatos tolerados na entrada (scores_json)

O parser aceita tanto o **Formato A** (instrumento atual) quanto o **Formato B** (legado — DISC-alinhamento não garantido para competências/estilos). Ver comentário de auditoria no topo de `lib/cis/parseCis.js` para detalhes das chaves encontradas em produção.

## Como os agentes consomem

Agente 2 (Consolidado VI) chama `aggregateCisByProject(context.cisAssessments)` e usa:

- `disc_coletivo` + `competencias_coletivas` para a seção **"Cultura Comportamental e Competências do Time"** (Parte 1.1 do entregável final).
- `individuos` para leitura DISC em 3 níveis (individual, coletivo, cultura × aspiração) do Passo 1.3 da spec do Agente 2.
- `meta.completo = false` em muitos assessments → sinalizar limitação no topo do documento.
