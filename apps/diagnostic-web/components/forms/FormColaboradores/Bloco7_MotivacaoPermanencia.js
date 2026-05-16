import { Campo, LegendSection, RequiredMark, RadioGroup, TextArea, EscalaSlider } from './_ui';
import { INDICOU_VAGA_OPCOES } from '../../../lib/forms/colaboradores_v3_schema';

export default function Bloco7_MotivacaoPermanencia({ dados, atualizar, erros }) {
  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Bloco 7 — Motivação e permanência</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Vínculo com a empresa — o que move, o que trava, o que faria sair ou ficar.
      </p>

      <LegendSection titulo="Motivação">
        <Campo id="b7_motiva" label="22. O que mais te motiva na empresa?">
          <TextArea id="b7_motiva" value={dados.b7_motiva} onChange={v => atualizar('b7_motiva', v)} rows={4} />
        </Campo>

        <Campo id="b7_desmotiva" label="23. E o que mais te desmotiva?">
          <TextArea id="b7_desmotiva" value={dados.b7_desmotiva} onChange={v => atualizar('b7_desmotiva', v)} rows={4} />
        </Campo>

        <Campo id="b7_por_que_escolheu" label="24. Por que você escolheu trabalhar aqui?">
          <TextArea id="b7_por_que_escolheu" value={dados.b7_por_que_escolheu} onChange={v => atualizar('b7_por_que_escolheu', v)} rows={4} />
        </Campo>

        <Campo id="b7_o_que_faria_sair" label="25. O que poderia te fazer sair da empresa?">
          <TextArea id="b7_o_que_faria_sair" value={dados.b7_o_que_faria_sair} onChange={v => atualizar('b7_o_que_faria_sair', v)} rows={4} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="Recomendação (eNPS)">
        <Campo label={<>26. De 0 a 10, o quanto você recomendaria nossa empresa como um bom lugar para trabalhar? <RequiredMark/></>} erro={erros.b7_enps}>
          <EscalaSlider name="b7_enps" value={dados.b7_enps} onChange={v => atualizar('b7_enps', v)} />
        </Campo>

        <Campo id="b7_enps_porque" label={<>27. Por quê? <RequiredMark/></>} erro={erros.b7_enps_porque}>
          <TextArea id="b7_enps_porque" value={dados.b7_enps_porque} onChange={v => atualizar('b7_enps_porque', v)} rows={3} />
        </Campo>

        <Campo label="28. Nos últimos 12 meses, você já indicou alguém da sua rede para uma vaga aqui?">
          <RadioGroup
            name="b7_indicou_ultimos_12m"
            opcoes={INDICOU_VAGA_OPCOES}
            value={dados.b7_indicou_ultimos_12m}
            onChange={v => atualizar('b7_indicou_ultimos_12m', v)}
          />
        </Campo>
      </LegendSection>

      <LegendSection titulo="Barreiras e melhorias">
        <Campo id="b7_principal_barreira" label="29. Qual é a principal barreira que dificulta sua entrega no dia a dia?">
          <TextArea id="b7_principal_barreira" value={dados.b7_principal_barreira} onChange={v => atualizar('b7_principal_barreira', v)} rows={3} />
        </Campo>

        <Campo id="b7_melhoria_6_meses" label="30. Se pudesse melhorar uma coisa na empresa nos próximos 6 meses, o que priorizaria?">
          <TextArea id="b7_melhoria_6_meses" value={dados.b7_melhoria_6_meses} onChange={v => atualizar('b7_melhoria_6_meses', v)} rows={3} />
        </Campo>
      </LegendSection>
    </section>
  );
}
