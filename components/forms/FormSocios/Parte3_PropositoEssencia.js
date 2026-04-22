import { Campo, LegendSection, RequiredMark, TextArea } from './_ui';
import { ARQUETIPOS } from '../../../lib/forms/socios_v4_schema';

export default function Parte3_PropositoEssencia({ dados, atualizar, erros }) {
  const arquetipoSelecionado = dados.p3_arquetipo || '';

  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Parte 3 — Propósito e Essência</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Arqueologia do fundador: a história, o problema que te move e o arquétipo da marca.
      </p>

      <LegendSection titulo="Arqueologia do fundador">
        <Campo id="p3_historia_criacao"
          label={<>1. Como e por que a empresa foi criada? Conte a história com o máximo de honestidade. <RequiredMark/></>}
          hint="O que te fez dar o primeiro passo, apesar do risco?"
          erro={erros.p3_historia_criacao}>
          <TextArea id="p3_historia_criacao" value={dados.p3_historia_criacao} onChange={v => atualizar('p3_historia_criacao', v)} rows={6} />
        </Campo>

        <Campo id="p3_problema_resolver"
          label={<>2. Que problema (do mundo, do cliente, seu) essa empresa existe para resolver? <RequiredMark/></>}
          erro={erros.p3_problema_resolver}>
          <TextArea id="p3_problema_resolver" value={dados.p3_problema_resolver} onChange={v => atualizar('p3_problema_resolver', v)} rows={5} />
        </Campo>

        <Campo id="p3_transformacao"
          label="3. Que transformação sua empresa provoca na vida do cliente? (antes X / depois Y)">
          <TextArea id="p3_transformacao" value={dados.p3_transformacao} onChange={v => atualizar('p3_transformacao', v)} rows={4} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="Valores e sombra">
        <Campo id="p3_valores_inegociaveis"
          label={<>4. Quais são os valores INEGOCIÁVEIS da empresa — aqueles que, se quebrados, colocariam em risco a essência? <RequiredMark/></>}
          hint="Preferir 3 a 5. Cada um com uma frase de justificativa."
          erro={erros.p3_valores_inegociaveis}>
          <TextArea id="p3_valores_inegociaveis" value={dados.p3_valores_inegociaveis} onChange={v => atualizar('p3_valores_inegociaveis', v)} rows={5} />
        </Campo>

        <Campo id="p3_contra_narrativa"
          label="5. O que você se RECUSA a fazer, mesmo que pagassem bem, por ir contra a essência?">
          <TextArea id="p3_contra_narrativa" value={dados.p3_contra_narrativa} onChange={v => atualizar('p3_contra_narrativa', v)} rows={4} />
        </Campo>

        <Campo id="p3_teste_verdade"
          label="6. Se um cliente perguntasse 'prova que isso é real', que caso concreto você contaria?">
          <TextArea id="p3_teste_verdade" value={dados.p3_teste_verdade} onChange={v => atualizar('p3_teste_verdade', v)} rows={4} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="Arquétipo da marca">
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 0 }}>
          Escolha <strong>um</strong> arquétipo que melhor represente a personalidade da marca.
          Não é uma amarra — é uma direção inicial que será refinada nas próximas etapas.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem', marginTop: '0.6rem' }}>
          {ARQUETIPOS.map(arq => {
            const selecionado = arquetipoSelecionado === arq.key;
            return (
              <button
                key={arq.key}
                type="button"
                onClick={() => atualizar('p3_arquetipo', arq.key)}
                style={{
                  textAlign: 'left',
                  padding: '0.75rem 0.85rem',
                  border: selecionado ? '1px solid var(--accent-blue, #6BA3FF)' : '1px solid var(--glass-border)',
                  background: selecionado ? 'rgba(107,163,255,0.12)' : 'rgba(255,255,255,0.02)',
                  borderRadius: 8,
                  color: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{arq.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{arq.descricao}</div>
              </button>
            );
          })}
        </div>

        <Campo id="p3_arquetipo_por_que" label="Por que este arquétipo? (opcional)">
          <TextArea id="p3_arquetipo_por_que" value={dados.p3_arquetipo_por_que} onChange={v => atualizar('p3_arquetipo_por_que', v)} rows={3} />
        </Campo>
      </LegendSection>

      <LegendSection titulo="Concorrência">
        <Campo id="p3_concorrentes" label="7. Quais são seus principais concorrentes (diretos e indiretos)?"
          hint="Lista livre, separada por vírgula.">
          <TextArea id="p3_concorrentes" value={dados.p3_concorrentes} onChange={v => atualizar('p3_concorrentes', v)} rows={2} />
        </Campo>
        <Campo id="p3_concorrentes_bem" label="8. O que os concorrentes fazem BEM (que você admira ou respeita)?">
          <TextArea id="p3_concorrentes_bem" value={dados.p3_concorrentes_bem} onChange={v => atualizar('p3_concorrentes_bem', v)} rows={3} />
        </Campo>
        <Campo id="p3_concorrentes_mal" label="9. O que fazem MAL (e é oportunidade)?">
          <TextArea id="p3_concorrentes_mal" value={dados.p3_concorrentes_mal} onChange={v => atualizar('p3_concorrentes_mal', v)} rows={3} />
        </Campo>
      </LegendSection>
    </section>
  );
}
