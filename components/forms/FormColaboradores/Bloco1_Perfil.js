import { Campo, LegendSection, RequiredMark, RadioGroup } from './_ui';
import { AREAS, TEMPOS_CASA } from '../../../lib/forms/colaboradores_v3_schema';

export default function Bloco1_Perfil({ dados, atualizar, erros, totalColaboradores }) {
  const equipePequena = typeof totalColaboradores === 'number' && totalColaboradores > 0 && totalColaboradores <= 10;

  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Bloco 1 — Perfil</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Dois dados amplos, suficientes para análise por cluster e insuficientes para identificação individual.
      </p>

      {equipePequena && (
        <div style={{
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
          borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.88rem', lineHeight: 1.55,
        }}>
          ⚠️ Como nossa equipe é pequena, algumas combinações de área e tempo de casa podem tornar você
          identificável. Responda apenas o que se sentir à vontade.
        </div>
      )}

      <LegendSection titulo="Contexto de trabalho">
        <Campo label={<>A. Em qual área você atua? <RequiredMark/></>} erro={erros.b1_area}>
          <RadioGroup name="b1_area" opcoes={AREAS} value={dados.b1_area} onChange={v => atualizar('b1_area', v)} />
          {dados.b1_area === 'Outro' && (
            <input
              className="form-input"
              type="text"
              placeholder="Especifique (opcional)…"
              value={dados.b1_area_outro || ''}
              onChange={e => atualizar('b1_area_outro', e.target.value)}
              style={{ marginTop: '0.5rem' }}
            />
          )}
        </Campo>

        <Campo label={<>B. Há quanto tempo você está na empresa? <RequiredMark/></>} erro={erros.b1_tempo_casa}>
          <RadioGroup name="b1_tempo_casa" opcoes={TEMPOS_CASA} value={dados.b1_tempo_casa} onChange={v => atualizar('b1_tempo_casa', v)} />
        </Campo>
      </LegendSection>
    </section>
  );
}
