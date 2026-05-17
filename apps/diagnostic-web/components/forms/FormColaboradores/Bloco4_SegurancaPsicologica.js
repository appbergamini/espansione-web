import { Campo, LegendSection } from './_ui';
import EscalaLikert from '../shared/EscalaLikert';

export default function Bloco4_SegurancaPsicologica({ dados, atualizar }) {
  const perguntas = [
    { campo: 'b4_discordar_lideranca',   label: '11. Me sinto à vontade para discordar da minha liderança.' },
    { campo: 'b4_errar_sem_medo',        label: '12. Quando erro, posso falar abertamente sem medo de punição ou julgamento.' },
    { campo: 'b4_ideias_novas',          label: '13. Trago ideias novas ou arriscadas em reuniões.' },
    { campo: 'b4_confia_colegas',        label: '14. Confio nos meus colegas de equipe.' },
    { campo: 'b4_colaboracao_areas',     label: '15. A colaboração entre áreas funciona bem.' },
  ];

  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Bloco 4 — Segurança psicológica e relações</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Perguntas sobre o quanto você se sente seguro(a) para ser você mesmo(a) no trabalho.
        Todas opcionais — responda só o que fizer sentido.
      </p>

      <LegendSection titulo="Escala 1 (Nunca) a 5 (Sempre)">
        {perguntas.map(p => (
          <Campo key={p.campo} label={p.label}>
            <EscalaLikert
              name={p.campo}
              value={dados[p.campo]}
              onChange={v => atualizar(p.campo, v)}
              escala={5}
              labelMin="Nunca"
              labelMax="Sempre"
            />
          </Campo>
        ))}
      </LegendSection>
    </section>
  );
}
