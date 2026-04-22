import { Campo, LegendSection, RequiredMark, TextArea, TextAreaLongo, TabelaParalela } from './_ui';
import { ARQUETIPOS } from '../../../lib/forms/socios_v4_schema';

function ArquetipoCards({ value, onChange, incluirNenhum = false }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.55rem', marginTop: '0.4rem' }}>
      {incluirNenhum && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={cardStyle(value === '' || !value)}
        >
          <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Nenhuma</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Só uma energia é suficiente</div>
        </button>
      )}
      {ARQUETIPOS.map(arq => {
        const selecionado = value === arq.key;
        return (
          <button
            key={arq.key}
            type="button"
            onClick={() => onChange(arq.key)}
            style={cardStyle(selecionado)}
          >
            <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{arq.label}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{arq.descricao}</div>
          </button>
        );
      })}
    </div>
  );
}

function cardStyle(selecionado) {
  return {
    textAlign: 'left', padding: '0.7rem 0.85rem',
    border: selecionado ? '1px solid var(--accent-blue, #6BA3FF)' : '1px solid var(--glass-border)',
    background: selecionado ? 'rgba(107,163,255,0.12)' : 'rgba(255,255,255,0.02)',
    borderRadius: 8, color: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
  };
}

export default function Parte3_PropositoEssencia({ dados, atualizar, erros }) {
  const setArquetipoPrimario = (k) => {
    atualizar('p3_arquetipo_primario', k);
    // se o secundário era igual, limpa
    if (dados.p3_arquetipo_secundario === k) atualizar('p3_arquetipo_secundario', '');
  };

  const setArquetipoSecundario = (k) => {
    if (k && k === dados.p3_arquetipo_primario) {
      atualizar('p3_arquetipo_secundario', '');
      return;
    }
    atualizar('p3_arquetipo_secundario', k);
  };

  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Parte 3 — Propósito e Essência</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        O porquê da empresa — a razão profunda pela qual ela existe, para além de produtos e resultados.
        A essência que alimenta toda a plataforma de marca.
      </p>

      <LegendSection titulo="3.1 Origem">
        <Campo id="p3_historia_criacao" label={<>1. Qual é a história da criação da sua empresa? Como tudo começou? <RequiredMark/></>}
          erro={erros.p3_historia_criacao}>
          <TextAreaLongo id="p3_historia_criacao" value={dados.p3_historia_criacao} onChange={v => atualizar('p3_historia_criacao', v)} rows={6} />
        </Campo>

        <Campo id="p3_problema_resolver" label={<>2. Que problema ou necessidade você (ou os fundadores) queriam resolver quando criaram o negócio? <RequiredMark/></>}
          erro={erros.p3_problema_resolver}>
          <TextAreaLongo id="p3_problema_resolver" value={dados.p3_problema_resolver} onChange={v => atualizar('p3_problema_resolver', v)} />
        </Campo>

        <Campo id="p3_vivi_problema_na_pele" label="3. Conte um momento da sua vida em que você viveu na pele o problema que sua empresa resolve hoje.">
          <TextAreaLongo id="p3_vivi_problema_na_pele" value={dados.p3_vivi_problema_na_pele} onChange={v => atualizar('p3_vivi_problema_na_pele', v)} />
        </Campo>

        <Campo id="p3_momento_epifania" label="4. Qual foi o momento em que você percebeu que essa empresa precisava existir?">
          <TextArea id="p3_momento_epifania" value={dados.p3_momento_epifania} onChange={v => atualizar('p3_momento_epifania', v)} rows={4} />
        </Campo>

        <Campo id="p3_indignacao_setor" label="5. Que indignação pessoal com o seu setor te fez começar — ou ainda te move hoje?">
          <TextArea id="p3_indignacao_setor" value={dados.p3_indignacao_setor} onChange={v => atualizar('p3_indignacao_setor', v)} rows={4} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="3.2 Propósito e causa">
        <Campo id="p3_por_que_acredita" label="6. Por que você acredita no produto ou serviço que sua empresa oferece?">
          <TextArea id="p3_por_que_acredita" value={dados.p3_por_que_acredita} onChange={v => atualizar('p3_por_que_acredita', v)} rows={4} />
        </Campo>

        <Campo id="p3_marca_positiva_negativa" label="7. Em que aspecto concreto da vida das pessoas sua empresa deixa marca positiva?"
          hint="E em qual aspecto pode também deixar marca negativa ou indiferente?">
          <TextAreaLongo id="p3_marca_positiva_negativa" value={dados.p3_marca_positiva_negativa} onChange={v => atualizar('p3_marca_positiva_negativa', v)} />
        </Campo>

        <Campo id="p3_impactos_intencionais" label="8. Quais impactos você pretende causar nas pessoas, na sociedade e no mercado em que a empresa está inserida?">
          <TextAreaLongo id="p3_impactos_intencionais" value={dados.p3_impactos_intencionais} onChange={v => atualizar('p3_impactos_intencionais', v)} />
        </Campo>

        <Campo id="p3_causas" label="9. Quais temas são grandes causas para você(s)?">
          <TextArea id="p3_causas" value={dados.p3_causas} onChange={v => atualizar('p3_causas', v)} rows={3}
            placeholder="sustentabilidade, inclusão, educação, inovação, saúde, etc." />
        </Campo>

        <Campo id="p3_contra_o_que_existe" label="10. Contra o que sua empresa existe? Que prática, crença ou hábito do mercado vocês combatem?">
          <TextAreaLongo id="p3_contra_o_que_existe" value={dados.p3_contra_o_que_existe} onChange={v => atualizar('p3_contra_o_que_existe', v)} />
        </Campo>

        <Campo id="p3_cliente_recusado" label="11. Qual cliente vocês se recusam a atender, mesmo se pagar? Por quê?">
          <TextArea id="p3_cliente_recusado" value={dados.p3_cliente_recusado} onChange={v => atualizar('p3_cliente_recusado', v)} rows={3} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="3.3 Valores e testes de verdade">
        <Campo id="p3_valores_inegociaveis" label={<>12. Quais valores são inegociáveis na sua atuação? <RequiredMark/></>}
          hint="O que jamais seria abandonado, mesmo diante de uma oportunidade financeira?"
          erro={erros.p3_valores_inegociaveis}>
          <TextAreaLongo id="p3_valores_inegociaveis" value={dados.p3_valores_inegociaveis} onChange={v => atualizar('p3_valores_inegociaveis', v)} />
        </Campo>

        <Campo label="13. Defina em uma frase o que cada valor significa na prática (o que é / o que não é):">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {[1, 2, 3].map(n => (
              <div key={n} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', alignItems: 'start' }}
                   className="valor-row">
                <input
                  className="form-input"
                  type="text"
                  placeholder={`Valor ${n}`}
                  value={dados[`p3_valor_${n}_nome`] || ''}
                  onChange={e => atualizar(`p3_valor_${n}_nome`, e.target.value)}
                />
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="O que significa na prática"
                  value={dados[`p3_valor_${n}_pratica`] || ''}
                  onChange={e => atualizar(`p3_valor_${n}_pratica`, e.target.value)}
                />
              </div>
            ))}
          </div>
          <style jsx>{`
            @media (max-width: 640px) {
              :global(.valor-row) {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </Campo>

        <Campo id="p3_se_empresa_morresse" label="14. Se a empresa deixasse de existir amanhã, o que morreria com ela — aquele algo maior, além da operação e dos negócios que ela administra?">
          <TextAreaLongo id="p3_se_empresa_morresse" value={dados.p3_se_empresa_morresse} onChange={v => atualizar('p3_se_empresa_morresse', v)} />
        </Campo>

        <Campo id="p3_decisao_cara_em_nome_proposito" label="15. Descreva a última vez que vocês tomaram uma decisão cara (financeiramente ou politicamente) em nome do propósito.">
          <TextAreaLongo id="p3_decisao_cara_em_nome_proposito" value={dados.p3_decisao_cara_em_nome_proposito} onChange={v => atualizar('p3_decisao_cara_em_nome_proposito', v)} />
        </Campo>

        <Campo id="p3_proposito_declarado" label="16. Sua empresa tem um propósito declarado e comunicado? Se sim, qual é?"
          hint="Cole a frase exata usada.">
          <TextArea id="p3_proposito_declarado" value={dados.p3_proposito_declarado} onChange={v => atualizar('p3_proposito_declarado', v)} rows={3} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="3.4 Arquétipo simbólico">
        <Campo id="p3_marca_personagem" label="17. Se a marca fosse um personagem de filme, livro ou história, qual seria? Por quê?">
          <TextArea id="p3_marca_personagem" value={dados.p3_marca_personagem} onChange={v => atualizar('p3_marca_personagem', v)} rows={3} />
        </Campo>

        <Campo label="18. Entre estas figuras arquetípicas, qual melhor traduz a energia da sua marca? Escolha 1 (a mais forte).">
          <ArquetipoCards value={dados.p3_arquetipo_primario} onChange={setArquetipoPrimario} />
        </Campo>

        <Campo label="Opcionalmente, escolha uma segunda energia arquetípica secundária."
          hint="Não pode ser igual à primária.">
          <ArquetipoCards value={dados.p3_arquetipo_secundario} onChange={setArquetipoSecundario} incluirNenhum />
          {dados.p3_arquetipo_secundario && dados.p3_arquetipo_secundario === dados.p3_arquetipo_primario && (
            <small style={{ display: 'block', color: 'var(--brand-red, #dc2626)', marginTop: '0.25rem' }}>
              O arquétipo secundário não pode ser igual ao primário.
            </small>
          )}
        </Campo>
      </LegendSection>
    </section>
  );
}
