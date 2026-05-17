import { Campo, LegendSection, RequiredMark, RadioGroup } from './_ui';
import { CANAIS_CONTATO, HORARIOS_PREFERIDOS } from '../../../lib/forms/clientes_v2_schema';

export default function Secao7_OptInEntrevista({ dados, atualizar, erros }) {
  const topa = dados.s7_topa_entrevista === 'sim';

  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Seção 7 — Participação opcional em entrevista em profundidade</h2>

      <div style={{
        background: 'rgba(107,163,255,0.08)',
        border: '1px solid rgba(107,163,255,0.25)',
        borderRadius: 8, padding: '0.9rem 1.1rem', marginBottom: '1.25rem',
        fontSize: '0.92rem', lineHeight: 1.55,
      }}>
        <p style={{ margin: 0 }}>
          Queremos entender alguns pontos em mais profundidade com um grupo pequeno de clientes.
          São conversas de <strong>cerca de 45 minutos</strong>, por vídeo ou presencial, confidenciais
          e muito valiosas para nossa construção.
        </p>
        <p style={{ margin: '0.5rem 0 0 0' }}>
          Se topar participar, deixe seu contato e preferências abaixo.
        </p>
      </div>

      <Campo label="36. Você toparia participar de uma conversa de ~45 minutos?">
        <RadioGroup
          name="s7_topa_entrevista"
          opcoes={['Sim, podem me convidar', 'No momento não, prefiro apenas as respostas do formulário']}
          value={dados.s7_topa_entrevista === 'sim' ? 'Sim, podem me convidar'
               : dados.s7_topa_entrevista === 'nao' ? 'No momento não, prefiro apenas as respostas do formulário'
               : null}
          onChange={label => atualizar('s7_topa_entrevista', label === 'Sim, podem me convidar' ? 'sim' : 'nao')}
        />
      </Campo>

      {topa && (
        <LegendSection titulo="Dados para contato">
          <Campo label={<>37. Melhor forma de contato <RequiredMark/></>} erro={erros.s7_canal_preferido}>
            <RadioGroup name="s7_canal_preferido" opcoes={CANAIS_CONTATO}
              value={dados.s7_canal_preferido} onChange={v => atualizar('s7_canal_preferido', v)} />
          </Campo>

          <Campo id="s7_contato" label={<>38. WhatsApp / e-mail / telefone para contato <RequiredMark/></>} erro={erros.s7_contato}>
            <input className="form-input" type="text" id="s7_contato"
              value={dados.s7_contato || ''} onChange={e => atualizar('s7_contato', e.target.value)} />
          </Campo>

          <Campo label={<>39. Melhor horário para conversar <RequiredMark/></>} erro={erros.s7_horario}>
            <RadioGroup name="s7_horario" opcoes={HORARIOS_PREFERIDOS}
              value={dados.s7_horario} onChange={v => atualizar('s7_horario', v)} />
          </Campo>

          <small style={{ display: 'block', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5, marginTop: '0.6rem' }}>
            Ao informar seu contato, você autoriza o uso dessas informações exclusivamente
            para agendamento da entrevista sobre sua experiência com a marca.
          </small>
        </LegendSection>
      )}
    </section>
  );
}
