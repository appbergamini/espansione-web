import { Campo, LegendSection, RequiredMark, TextArea, TabelaParalela, EscalaSlider } from './_ui';

export default function Bloco5_LiderancaImediata({ dados, atualizar, erros }) {
  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Bloco 5 — Liderança imediata</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Sobre quem lidera seu dia a dia.
      </p>

      <LegendSection titulo="Avaliação da liderança">
        <Campo label={<>16. De 0 a 10, que nota você daria à sua liderança imediata? <RequiredMark/></>} erro={erros.b5_nota_lideranca}>
          <EscalaSlider name="b5_nota_lideranca" value={dados.b5_nota_lideranca} onChange={v => atualizar('b5_nota_lideranca', v)} />
        </Campo>

        <Campo label="17. Sobre sua liderança imediata: quais são os pontos fortes e o que poderia melhorar?">
          <TabelaParalela
            colunas={[
              { header: 'Pontos FORTES',         children: <TextArea id="b5_pontos_fortes"    value={dados.b5_pontos_fortes}    onChange={v => atualizar('b5_pontos_fortes', v)}    rows={4} /> },
              { header: 'O que poderia MELHORAR', children: <TextArea id="b5_pontos_melhorar"  value={dados.b5_pontos_melhorar}  onChange={v => atualizar('b5_pontos_melhorar', v)}  rows={4} /> },
            ]}
          />
        </Campo>
      </LegendSection>
    </section>
  );
}
