import { Campo, LegendSection, TextArea } from './_ui';

export default function Secao6_FuturoRecomendacao({ dados, atualizar, erros, projetoMeta }) {
  const marca = projetoMeta?.nome_marca || 'a marca';

  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Seção 6 — Futuro</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Fechamento.
      </p>

      <LegendSection titulo="Futuro">
        <Campo id="s6_o_que_gostaria" label={<>29. Existe algo que você gostaria de encontrar com {marca} e que ainda não oferecemos?</>}>
          <TextArea id="s6_o_que_gostaria" value={dados.s6_o_que_gostaria} onChange={v => atualizar('s6_o_que_gostaria', v)} rows={4} />
        </Campo>
      </LegendSection>
    </section>
  );
}
