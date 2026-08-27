# CIS — Detalhamento das 16 Competências

Descrições editoriais das 16 competências derivadas do DISC. **Documento autoral do projeto** — o instrumento entrega apenas nome + score (0–100); estes textos foram redigidos para uso em relatórios, curadoria e narração dos agentes.

Referências de implementação:
- Lista canônica (snake_case): `COMPETENCIAS_KEYS` em `lib/cis/parseCis.js`
- Agrupamento por dimensão: `public/cis-app.js` (`compG`) e `components/pdf/RelatorioDisc.js`
- Cálculo: matriz de coeficientes `CC` em `public/cis-app.js` — cada competência é uma combinação ponderada dos scores DISC brutos, não uma escala independente do questionário.

## Como ler os scores

- **Score alto (≥70):** a competência é um motor natural da pessoa — tende a aparecer espontaneamente no trabalho.
- **Score médio (40–69):** competência disponível, mas exige intenção — aparece quando o contexto pede.
- **Score baixo (<40):** não é "defeito" — é um ponto de atenção. Pode ser compensado por processo, parceria ou desenvolvimento. Nunca usar linguagem de "deficiência" (regra do Agente 2: "em desenvolvimento", nunca "deficiente").

---

## D — Dominância

### Ousadia
Disposição para assumir riscos e apostar em caminhos não testados, agindo antes de ter todas as garantias. Score alto decide rápido em cenários de incerteza e tolera a possibilidade de erro; score baixo prefere validar, testar e reduzir a exposição antes de se comprometer.

### Comando
Capacidade de assumir a frente: dirigir pessoas, distribuir direção e tomar a palavra decisiva em situações de impasse. Score alto lidera de forma natural e é reconhecido como autoridade; score baixo prefere influenciar nos bastidores, por convencimento e não por posição.

### Objetividade
Foco no essencial: comunicação direta, decisões ancoradas em fatos e resultados, sem rodeios. Score alto vai direto ao ponto e desembola discussões longas; score baixo tende a ponderar demais contexto, nuances e impacto nas pessoas antes de concluir.

### Assertividade
Firmeza para expressar e sustentar posições, inclusive sob pressão — dizer "não", discordar, cobrar. Score alto defende o que acredita mesmo contra a maioria; score baixo cede para preservar a harmonia, podendo sair de conversas sem ter dito o que importava.

---

## I — Influência

### Persuasão
Capacidade de convencer e conquistar adesão: vender ideias, propostas e mudanças para pessoas e grupos. Score alto transforma céticos em aliados; score baixo comunica com clareza, mas depende de argumentos formais e hierarquia para obter adesão.

### Extroversão
Energia na interação: facilidade de iniciar conversas, ocupar espaços sociais e expandir a rede de contatos. Score alto ganha energia com gente e abre portas por relacionamento; score baixo prefere interações planejadas e em doses menores — o que não significa timidez, e sim economia social.

### Entusiasmo
Capacidade de contagiar: gerar energia positiva, engajar pessoas em causas e projetos, manter moral alta em momentos difíceis. Score alto é o "acendedor" emocional do time; score baixo tende a um engajamento mais sóbrio e reservado, que pode ser lido como distância.

### Sociabilidade
Habilidade de criar e manter relacionamentos: integração em grupos, leitura de clima social, construção de vínculos duradouros. Score alto tece a cola relacional do time; score baixo mantém relações funcionais e corretas, porém mais formais e circunscritas ao trabalho.

---

## S — Estabilidade

### Empatia
Perceber e responder às emoções dos outros: escuta genuína, consideração pelo impacto humano das decisões. Score alto é a antena emocional do time e sustenta confiança; score baixo decide mais pelo critério técnico, correndo o risco de não perceber desgastes relacionais.

### Paciência
Tolerância a ritmos mais lentos: esperar processos amadurecerem e pessoas se desenvolverem sem pressionar. Score alto sustenta trabalhos longos e desenvolvimento de gente; score baixo sente urgência constante e pode atropelar etapas e pessoas mais lentas.

### Persistência
Constância no esforço: manter o curso diante de obstáculos e não abandonar o que foi começado. Score alto entrega no longo prazo e atravessa fases árduas; score baixo perde energia quando o resultado demora e tende a migrar para frentes mais estimulantes.

### Planejamento
Estruturação antes de executar: organizar etapas, prever recursos e prazos, antecipar dependências. Score alto reduz improviso e surpresa; score baixo prefere começar e ajustar no caminho — ganha velocidade de saída, paga em retrabalho quando o projeto é complexo.

---

## C — Conformidade

### Organização
Ordem no trabalho: sistemas, rotinas, controle de informações, materiais e compromissos. Score alto mantém a operação previsível e encontrável; score baixo opera bem no caos controlado, mas gera dependência de memória e custo de coordenação para o time.

### Detalhismo
Atenção às minúcias: precisão, checagem de erros, qualidade no acabamento da entrega. Score alto é a última linha de defesa contra falhas; score baixo enxerga o todo com facilidade, mas deixa passar imperfeições que outros precisam capturar.

### Prudência
Cautela na decisão: avaliar riscos, consequências e conformidade com regras antes de agir. Score alto protege a empresa de passos maiores que as pernas; score baixo tende a agir primeiro e corrigir depois — complementar natural da Ousadia alta.

### Concentração
Foco sustentado: imunidade a distrações, profundidade em uma tarefa até concluí-la. Score alto produz trabalho denso e consistente; score baixo tem atenção multipista — ótimo para ambientes dinâmicos, arriscado para tarefas que exigem mergulho longo.
