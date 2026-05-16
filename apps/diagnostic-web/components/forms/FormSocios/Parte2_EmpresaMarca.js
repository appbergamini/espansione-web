import { Campo, LegendSection, RequiredMark, TextArea, TextAreaLongo, TabelaParalela, CheckboxGrid } from './_ui';

// FIX.30 — opções híbridas pras perguntas críticas que alimentam o
// agente de Clusters Externos Lean. Ordem por frequência típica em PMEs.

const OPCOES_MOTIVOS_GANHO = [
  'Confiança na empresa',
  'Relacionamento com sócios/equipe',
  'Qualidade técnica',
  'Preço',
  'Prazo / agilidade',
  'Atendimento',
  'Especialização no segmento',
  'Indicação',
  'Reputação',
  'Portfólio / cases',
  'Conveniência',
  'Experiência anterior positiva',
  'Capacidade de resolver problema complexo',
];

const OPCOES_MOTIVOS_PERDA = [
  'Concorrente direto mais barato',
  'Concorrente mais conhecido / com mais marca',
  'Freelancer / profissional independente',
  'Solução interna do cliente (in-house)',
  'Empresa mais rápida / ágil',
  'Empresa mais digital / moderna',
  'Falta de prova de resultado',
  'Cliente não percebeu valor suficiente',
  'Cliente adiou a decisão',
  'Cliente desistiu de comprar',
  'Conflito de relacionamento',
  'Falha na nossa proposta / pitch',
];

const OPCOES_OBJECOES = [
  'Preço',
  'Prazo',
  'Medo de não dar resultado',
  'Falta de clareza sobre o que será entregue',
  'Comparação com concorrentes',
  'Preferência por fornecedor conhecido',
  'Dúvida sobre capacidade técnica',
  'Dúvida sobre ROI',
  'Falta de urgência',
  'Processo decisório lento',
  'Cliente acha que consegue fazer internamente',
  'Receio de mudar de fornecedor atual',
];

const OPCOES_CONCORRENTES_TIPOS = [
  'Concorrente direto da mesma categoria',
  'Concorrente indireto / categoria adjacente',
  'Freelancer ou profissional independente',
  'Time interno do cliente (in-house)',
  'Plataforma / software / SaaS',
  'Solução improvisada / "puxadinho"',
  'Não fazer nada (status quo)',
];

export default function Parte2_EmpresaMarca({ dados, atualizar, erros }) {
  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Parte 2 — A Empresa e sua Marca</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Fotografia do presente — como a marca se apresenta hoje, o que diferencia, como é percebida.
      </p>

      <LegendSection titulo="2.1 Oferta e cliente">
        <Campo id="p2_oferta_cliente" label={<>1. O que vocês vendem e para quem? <RequiredMark/></>}
          hint="Descreva o produto/serviço principal, o canal de venda, o ticket médio e o perfil do cliente ideal."
          erro={erros.p2_oferta_cliente}>
          <TextAreaLongo id="p2_oferta_cliente" value={dados.p2_oferta_cliente} onChange={v => atualizar('p2_oferta_cliente', v)} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="2.2 Personalidade e percepção">
        <Campo id="p2_personalidade_marca" label={<>2. Se sua marca fosse uma pessoa, como você descreveria a personalidade dela? <RequiredMark/></>}
          hint="Tom, jeito de falar, postura, energia."
          erro={erros.p2_personalidade_marca}>
          <TextArea id="p2_personalidade_marca" value={dados.p2_personalidade_marca} onChange={v => atualizar('p2_personalidade_marca', v)} rows={4} />
        </Campo>

        <Campo label="3. Liste 3 palavras para cada lado:">
          <TabelaParalela
            colunas={[
              {
                header: '3 palavras que você GOSTARIA que usassem (ambição)',
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {[1, 2, 3].map(n => (
                      <input
                        key={n}
                        className="form-input"
                        type="text"
                        placeholder={`Palavra ${n}`}
                        value={dados[`p2_palavra_ambicao_${n}`] || ''}
                        onChange={e => atualizar(`p2_palavra_ambicao_${n}`, e.target.value)}
                      />
                    ))}
                  </div>
                ),
              },
              {
                header: '3 palavras que as pessoas REALMENTE usam hoje (percepção atual)',
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {[1, 2, 3].map(n => (
                      <input
                        key={n}
                        className="form-input"
                        type="text"
                        placeholder={`Palavra ${n}`}
                        value={dados[`p2_palavra_real_${n}`] || ''}
                        onChange={e => atualizar(`p2_palavra_real_${n}`, e.target.value)}
                      />
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </Campo>

        <Campo id="p2_como_sabe_palavras_reais" label="4. Como você sabe que essas são as palavras que as pessoas realmente usam hoje?">
          <TextArea id="p2_como_sabe_palavras_reais"
            value={dados.p2_como_sabe_palavras_reais}
            onChange={v => atualizar('p2_como_sabe_palavras_reais', v)}
            rows={4}
            placeholder="Pesquisa formal, feedback direto, observação em reuniões, comentários em redes, intuição..." />
        </Campo>
      </LegendSection>

      <LegendSection titulo="2.3 Diferenciação e concorrência">
        <Campo id="p2_diferenciais" label={<>5. O que diferencia sua empresa dos concorrentes? <RequiredMark/></>}
          hint="Por que um cliente escolheria vocês em vez de outra opção? Busque diferenciais defensáveis, não slogans."
          erro={erros.p2_diferenciais}>
          <TextAreaLongo id="p2_diferenciais" value={dados.p2_diferenciais} onChange={v => atualizar('p2_diferenciais', v)} />
        </Campo>

        {/* FIX.30 — Perguntas 6/7/8 híbridas: multiselect com opções
            comuns + textarea preservada como exemplo real. Alimentam
            o agente de Clusters Externos Lean. */}

        <Campo label="6.1 Quando vocês ganham um cliente, quais costumam ser os principais motivos?"
          hint="Marque até 3 — os mais frequentes.">
          <CheckboxGrid
            value={dados.p2_motivos_ganho_opcoes}
            onChange={v => atualizar('p2_motivos_ganho_opcoes', v)}
            opcoes={OPCOES_MOTIVOS_GANHO}
            max={3}
          />
        </Campo>

        <Campo id="p2_quando_vencemos" label="6.2 Conte um exemplo real de quando vocês ganharam um cliente — e por quê.">
          <TextArea id="p2_quando_vencemos" value={dados.p2_quando_vencemos} onChange={v => atualizar('p2_quando_vencemos', v)} rows={3}
            placeholder="Ex.: Ganhamos a conta da X porque o decisor já tinha trabalhado conosco antes e confiava no nosso prazo." />
        </Campo>

        <Campo label="6.3 Quando perdem uma venda, costumam perder para quem ou para quê?"
          hint="Marque até 3 — os mais frequentes.">
          <CheckboxGrid
            value={dados.p2_motivos_perda_opcoes}
            onChange={v => atualizar('p2_motivos_perda_opcoes', v)}
            opcoes={OPCOES_MOTIVOS_PERDA}
            max={3}
          />
        </Campo>

        <Campo id="p2_quando_perdemos" label="6.4 Conte um exemplo real de quando perderam uma venda — e por quê.">
          <TextArea id="p2_quando_perdemos" value={dados.p2_quando_perdemos} onChange={v => atualizar('p2_quando_perdemos', v)} rows={3}
            placeholder="Ex.: Perdemos a conta da Y porque o cliente preferiu uma agência maior que tinha case na indústria automotiva." />
        </Campo>

        <Campo label="7.1 Quais são as objeções mais frequentes antes da compra?"
          hint="Marque até 5.">
          <CheckboxGrid
            value={dados.p2_objecoes_opcoes}
            onChange={v => atualizar('p2_objecoes_opcoes', v)}
            opcoes={OPCOES_OBJECOES}
            max={5}
          />
        </Campo>

        <Campo id="p2_objecoes_frequentes" label="7.2 Dê um exemplo de objeção real que vocês escutam.">
          <TextArea id="p2_objecoes_frequentes" value={dados.p2_objecoes_frequentes} onChange={v => atualizar('p2_objecoes_frequentes', v)} rows={3}
            placeholder='Ex.: "Está mais caro do que orçamos", "Adorei mas preciso de algo mais ágil", "Como sei que vai dar resultado?"' />
        </Campo>

        <Campo label="8.1 De que tipos de concorrente vocês mais perdem?"
          hint="Pode marcar quantos forem relevantes.">
          <CheckboxGrid
            value={dados.p2_concorrentes_tipos}
            onChange={v => atualizar('p2_concorrentes_tipos', v)}
            opcoes={OPCOES_CONCORRENTES_TIPOS}
          />
        </Campo>

        <Campo id="p2_concorrentes_analise" label="8.2 Quem são seus principais concorrentes (com nome)? Pontos fortes e fracos de cada um."
          hint="Liste 3-5 concorrentes nominalmente. 1-2 linhas por concorrente.">
          <TextAreaLongo id="p2_concorrentes_analise" value={dados.p2_concorrentes_analise} onChange={v => atualizar('p2_concorrentes_analise', v)} rows={6} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="2.4 Referências admiradas">
        <Campo id="p2_marca_admirada" label="9. Alguma marca (de qualquer segmento) que você admira? Qual e por quê?">
          <TextArea id="p2_marca_admirada" value={dados.p2_marca_admirada} onChange={v => atualizar('p2_marca_admirada', v)} rows={4} />
        </Campo>

        <Campo id="p2_emprestar_atributo" label="10. Se pudesse 'emprestar' um atributo de outra marca para a sua, qual atributo seria e de qual marca?">
          <TextArea id="p2_emprestar_atributo" value={dados.p2_emprestar_atributo} onChange={v => atualizar('p2_emprestar_atributo', v)} rows={3} />
        </Campo>
      </LegendSection>
    </section>
  );
}
