import EscalaLikert from '../shared/EscalaLikert';
import { PILARES_360, AFIRMACOES_360 } from '../../../lib/forms/socios_v4_schema';

const CORES_PILAR = {
  estrategia: 'rgba(107,163,255,0.12)',
  financas:   'rgba(16,185,129,0.10)',
  comercial:  'rgba(245,158,11,0.10)',
  marketing:  'rgba(167,139,250,0.12)',
  pessoas:    'rgba(251,113,133,0.10)',
  operacao:   'rgba(125,211,252,0.10)',
};

export default function Parte6_Diagnostico360({ dados, atualizar, erros }) {
  const respondidas = Array.from({ length: 48 }, (_, i) => i + 1)
    .filter(n => typeof dados[`parte6_q${n}`] === 'number').length;

  return (
    <section>
      <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>Parte 6 — Diagnóstico 360° do Negócio</h2>
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1rem' }}>
        48 afirmações em 6 pilares (Estratégia, Finanças, Comercial, Marketing, Pessoas, Operação).
        Atribua uma nota de <strong>1 (nunca/não é verdade)</strong> a <strong>4 (sempre/plenamente verdade)</strong>.
      </p>

      <div style={{
        background: 'rgba(107,163,255,0.08)', border: '1px solid rgba(107,163,255,0.2)',
        borderRadius: 8, padding: '0.65rem 0.9rem', marginBottom: '1rem',
        fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem',
      }}>
        <span>Progresso: <strong>{respondidas} de 48</strong> respondidas</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Mínimo recomendado: 38 (80%)</span>
      </div>

      {erros._p6_completude && (
        <p style={{ color: 'var(--brand-red, #dc2626)', fontSize: '0.85rem', margin: '0 0 0.75rem 0' }}>
          {erros._p6_completude}
        </p>
      )}

      {Object.entries(PILARES_360).map(([chave, pilar]) => (
        <fieldset key={chave} style={{
          border: '1px solid var(--glass-border)',
          background: CORES_PILAR[chave] || 'rgba(255,255,255,0.02)',
          borderRadius: 10,
          padding: '1rem 1.1rem',
          marginBottom: '1rem',
        }}>
          <legend style={{ fontWeight: 700, padding: '0 0.5rem', color: 'var(--accent-blue, #6BA3FF)', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {pilar.nome} ({pilar.inicio}–{pilar.fim})
          </legend>
          {Array.from({ length: pilar.fim - pilar.inicio + 1 }, (_, i) => {
            const q = pilar.inicio + i;
            const campo = `parte6_q${q}`;
            return (
              <div key={q} style={{ marginBottom: '0.9rem', paddingBottom: '0.9rem', borderBottom: i < (pilar.fim - pilar.inicio) ? '1px dashed rgba(255,255,255,0.05)' : 'none' }}>
                <p style={{ margin: '0 0 0.45rem 0', fontSize: '0.92rem', lineHeight: 1.45 }}>
                  <strong style={{ color: 'var(--accent-blue, #6BA3FF)' }}>{q}.</strong> {AFIRMACOES_360[q - 1]}
                </p>
                <EscalaLikert
                  name={campo}
                  value={dados[campo]}
                  onChange={v => atualizar(campo, v)}
                  escala={4}
                  labelMin="Nunca"
                  labelMax="Sempre"
                />
              </div>
            );
          })}
        </fieldset>
      ))}
    </section>
  );
}
