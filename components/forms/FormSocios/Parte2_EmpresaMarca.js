import { Campo, LegendSection, RequiredMark, TextArea, TextAreaLongo, TabelaParalela } from './_ui';

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

        <Campo label="6. Em quais situações vocês costumam vencer uma concorrência? E em quais costumam perder?">
          <TabelaParalela
            colunas={[
              {
                header: 'Quando VENCEMOS',
                children: <TextArea id="p2_quando_vencemos" value={dados.p2_quando_vencemos} onChange={v => atualizar('p2_quando_vencemos', v)} rows={4} />,
              },
              {
                header: 'Quando PERDEMOS',
                children: <TextArea id="p2_quando_perdemos" value={dados.p2_quando_perdemos} onChange={v => atualizar('p2_quando_perdemos', v)} rows={4} />,
              },
            ]}
          />
        </Campo>

        <Campo id="p2_objecoes_frequentes" label="7. Quais são as objeções mais frequentes do cliente no processo de compra?"
          hint="O que faz o cliente hesitar, questionar ou desistir?">
          <TextAreaLongo id="p2_objecoes_frequentes" value={dados.p2_objecoes_frequentes} onChange={v => atualizar('p2_objecoes_frequentes', v)} />
        </Campo>

        <Campo id="p2_concorrentes_analise" label="8. Quem são seus principais concorrentes diretos e indiretos?"
          hint="Liste nomes. Para cada concorrente, 1-2 linhas sobre pontos fortes e fracos.">
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
