import { Campo, LegendSection, RequiredMark, TextArea, EscalaSlider } from './_ui';

export default function Secao6_FuturoRecomendacao({ dados, atualizar, erros, projetoMeta }) {
  const marca = projetoMeta?.nome_marca || 'a marca';

  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Seção 6 — Futuro e recomendação</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Fechamento e recomendação.
      </p>

      <LegendSection titulo="Futuro">
        <Campo id="s6_o_que_gostaria" label={<>33. Existe algo que você gostaria de encontrar com {marca} e que ainda não oferecemos?</>}>
          <TextArea id="s6_o_que_gostaria" value={dados.s6_o_que_gostaria} onChange={v => atualizar('s6_o_que_gostaria', v)} rows={4} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="Recomendação">
        <Campo label={<>34. De 0 a 10, o quanto você recomendaria {marca} para um amigo ou familiar? <RequiredMark/></>}
          erro={erros.s6_nps}>
          <EscalaSlider name="s6_nps" value={dados.s6_nps} onChange={v => atualizar('s6_nps', v)} />
        </Campo>

        <Campo id="s6_nps_porque" label={<>35. Por quê? <RequiredMark/></>}
          hint="Uma resposta em 1-2 frases já é suficiente."
          erro={erros.s6_nps_porque}>
          <TextArea id="s6_nps_porque" value={dados.s6_nps_porque} onChange={v => atualizar('s6_nps_porque', v)} rows={3} />
        </Campo>
      </LegendSection>
    </section>
  );
}
