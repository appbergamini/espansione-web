import { Campo, LegendSection, RequiredMark, TextArea, TabelaParalela } from './_ui';
import EscalaLikert from '../shared/EscalaLikert';

export default function Bloco3_CulturaVivida({ dados, atualizar, erros }) {
  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Bloco 3 — Cultura vivida</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Como a empresa é, na prática, no dia a dia.
      </p>

      <LegendSection titulo="Cultura no dia a dia">
        <Campo id="b3_palavra_cultura" label="7. Em uma única palavra, como você descreveria nossa cultura hoje?">
          <input
            className="form-input"
            type="text"
            id="b3_palavra_cultura"
            maxLength={40}
            value={dados.b3_palavra_cultura || ''}
            onChange={e => atualizar('b3_palavra_cultura', e.target.value)}
          />
        </Campo>

        <Campo label={<>8. Na prática, os valores da empresa são vividos no dia a dia? <RequiredMark/></>} erro={erros.b3_valores_no_dia_a_dia}>
          <EscalaLikert
            name="b3_valores_no_dia_a_dia"
            value={dados.b3_valores_no_dia_a_dia}
            onChange={v => atualizar('b3_valores_no_dia_a_dia', v)}
            escala={5}
            labelMin="Nunca"
            labelMax="Sempre"
          />
        </Campo>

        <Campo label={<>9. Minha opinião é ouvida e considerada. <RequiredMark/></>} erro={erros.b3_opiniao_ouvida}>
          <EscalaLikert
            name="b3_opiniao_ouvida"
            value={dados.b3_opiniao_ouvida}
            onChange={v => atualizar('b3_opiniao_ouvida', v)}
            escala={5}
            labelMin="Nunca"
            labelMax="Sempre"
          />
        </Campo>

        <Campo label="10. O que mais fortalece e o que mais enfraquece nossa cultura hoje?">
          <TabelaParalela
            colunas={[
              { header: 'O que FORTALECE',   children: <TextArea id="b3_fortalece_cultura"  value={dados.b3_fortalece_cultura}  onChange={v => atualizar('b3_fortalece_cultura', v)}  rows={4} /> },
              { header: 'O que ENFRAQUECE', children: <TextArea id="b3_enfraquece_cultura" value={dados.b3_enfraquece_cultura} onChange={v => atualizar('b3_enfraquece_cultura', v)} rows={4} /> },
            ]}
          />
        </Campo>
      </LegendSection>
    </section>
  );
}
