import MapaMaturidadeCard from '../MapaMaturidadeCard';
import { STATUS } from '../../lib/cockpit/journey';

// =====================================================================
// Cockpit da empresa — componentes de UI (header, stepper, abas, resumo,
// módulos, ações). Tema dark, paleta semântica. Sem lógica de negócio
// (vem do lib/cockpit/journey via endpoint).
// =====================================================================

const SU = {
  [STATUS.COMPLETED]: { label: 'Concluído', c: '#86efac', bg: 'rgba(34,197,94,0.15)', dot: '#22c55e' },
  [STATUS.IN_PROGRESS]: { label: 'Em andamento', c: '#fde68a', bg: 'rgba(234,179,8,0.14)', dot: '#eab308' },
  [STATUS.ATTENTION]: { label: 'Atenção', c: '#fdba74', bg: 'rgba(249,115,22,0.14)', dot: '#f97316' },
  [STATUS.BLOCKED]: { label: 'Bloqueado', c: '#94a3b8', bg: 'rgba(255,255,255,0.05)', dot: '#475569' },
  [STATUS.NOT_STARTED]: { label: 'Não iniciado', c: '#94a3b8', bg: 'rgba(255,255,255,0.05)', dot: '#475569' },
  [STATUS.NOT_APPLICABLE]: { label: 'Não aplicável', c: '#94a3b8', bg: 'rgba(255,255,255,0.05)', dot: '#475569' },
};
const su = (s) => SU[s] || SU[STATUS.NOT_STARTED];

export function StatusBadge({ status, label }) {
  const u = su(status);
  return <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.18rem 0.55rem', borderRadius: 99, color: u.c, background: u.bg, whiteSpace: 'nowrap' }}>{label || u.label}</span>;
}

function fmtData(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('pt-BR'); } catch { return '—'; }
}

// ── Header da empresa ───────────────────────────────────────────────
export function CompanyHeader({ company, nextAction, onAction }) {
  return (
    <div className="glass-card" style={{ padding: '1.4rem 1.6rem', position: 'relative', overflow: 'hidden', marginBottom: '1rem' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #Da3144, rgba(218,49,68,0.08))' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={c.eyebrow}>Cockpit da jornada</div>
          <h1 style={{ margin: '0.15rem 0 0.5rem', fontSize: '1.7rem' }}>{company.name}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1.1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>🏢 {company.segment}</span>
            <span>👥 {company.size}</span>
            <span>🙋 {company.owner}</span>
            <span>🕒 Atualizado {fmtData(company.last_updated)}</span>
          </div>
          <div style={{ marginTop: '0.6rem', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Status: </span><b>{company.journey_status}</b>
          </div>
        </div>
        {nextAction && (
          <div style={{ textAlign: 'right', maxWidth: 280 }}>
            <div style={{ ...c.eyebrow, color: '#9bb8e0' }}>Próxima ação</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, margin: '0.3rem 0 0.6rem' }}>{nextAction.title}</div>
            <button className="btn-primary" onClick={() => onAction?.(nextAction)} style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem' }}>{nextAction.cta || 'Abrir'} →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Stepper da jornada ──────────────────────────────────────────────
export function JourneyStepper({ journey, current }) {
  return (
    <div className="glass-card" style={{ padding: '1.1rem 1.2rem', marginBottom: '1.2rem' }}>
      <div style={c.eyebrow}>Jornada do Método Espansione</div>
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginTop: '0.7rem', paddingBottom: '0.3rem' }}>
        {journey.map((s, i) => {
          const u = su(s.status);
          const isCurrent = s.key === current;
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
              <div title={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', minWidth: 92, padding: '0.5rem 0.4rem', borderRadius: 10, background: isCurrent ? 'rgba(218,49,68,0.1)' : 'transparent', border: isCurrent ? '1px solid rgba(218,49,68,0.3)' : '1px solid transparent' }}>
                <div style={{ width: 30, height: 30, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', background: u.bg, border: `1px solid ${u.dot}` }}>
                  {s.status === STATUS.COMPLETED ? '✓' : s.status === STATUS.BLOCKED ? '🔒' : s.icon}
                </div>
                <span style={{ fontSize: '0.68rem', textAlign: 'center', color: isCurrent ? '#fff' : 'var(--text-secondary)', fontWeight: isCurrent ? 700 : 500, lineHeight: 1.2 }}>{s.short}</span>
              </div>
              {i < journey.length - 1 && <span style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>›</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Barra de abas ───────────────────────────────────────────────────
export function AdminTabs({ active, onChange, tabs }) {
  return (
    <div style={{ display: 'flex', gap: '0.3rem', overflowX: 'auto', borderBottom: '1px solid var(--glass-border, rgba(255,255,255,0.1))', marginBottom: '1.3rem' }}>
      {tabs.map((t) => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          flexShrink: 0, background: 'none', border: 'none', borderBottom: active === t.key ? '2px solid #Da3144' : '2px solid transparent',
          color: active === t.key ? '#fff' : 'var(--text-secondary)', padding: '0.6rem 0.9rem', cursor: 'pointer',
          fontSize: '0.86rem', fontWeight: active === t.key ? 700 : 500, whiteSpace: 'nowrap',
        }}>{t.label}{typeof t.badge === 'number' && t.badge > 0 ? ` · ${t.badge}` : ''}</button>
      ))}
    </div>
  );
}

// ── Visão Geral (cards-resumo + módulos + ações) ────────────────────
export function VisaoGeral({ cockpit, projetoId, onAction }) {
  const s = cockpit.summary;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem' }}>
      {/* cards-resumo executivos */}
      <div style={c.grid}>
        <ResumoCard titulo="Maturidade" status={s.maturity.status}>
          {s.maturity.score != null ? (
            <>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#Da3144', lineHeight: 1 }}>{s.maturity.score}<span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/100</span></div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.maturity.level}</div>
              {s.maturity.critical.length > 0 && <div style={c.small}>Críticos: <b style={{ color: '#fca5a5' }}>{s.maturity.critical.join(', ')}</b></div>}
            </>
          ) : <Empty texto="Ainda não concluído." />}
        </ResumoCard>

        <ResumoCard titulo="Identidade" status={s.identity.status}>
          {s.identity.top_gap && <div style={c.small}>Maior divergência: <b>{s.identity.top_gap.indicador}</b> (gap {Math.round(s.identity.top_gap.gap)})</div>}
          <div style={{ marginTop: '0.4rem', display: 'grid', gap: '0.2rem' }}>
            {s.identity.forms.map((f) => (
              <div key={f.type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{f.label}{f.obrigatorio ? ' *' : ''}</span>
                <StatusBadge status={mapFormStatus(f.status)} />
              </div>
            ))}
          </div>
        </ResumoCard>

        <ResumoCard titulo="Pessoas">
          <Linha k="Sócios cadastrados" v={s.people.socios.total} />
          <Linha k="Sócios com DISC" v={`${s.people.socios.concluidos}/${s.people.socios.total}`} />
          <Linha k="Equipe cadastrada" v={s.people.equipe.total} />
          <Linha k="Equipe com DISC" v={`${s.people.equipe.concluidos}/${s.people.equipe.total}`} />
        </ResumoCard>

        <ResumoCard titulo="Entregáveis">
          <Linha k="PDF Maturidade" v={s.deliverables.pdf_maturidade ? '✓' : '—'} />
          <Linha k="PDF Identidade" v={s.deliverables.pdf_identidade_blocked ? '🔒' : 'Disponível'} />
          <Linha k="Leitura Guiada" v={s.deliverables.leitura_blocked ? '🔒' : 'Liberada'} />
          <Linha k="Trilhas" v={s.deliverables.trilhas_blocked ? '🔒' : 'Liberadas'} />
        </ResumoCard>

        <ResumoCard titulo="Pendências">
          {s.pending.length ? (
            <ol style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.3rem' }}>
              {s.pending.map((p, i) => <li key={i} style={c.small}>{p}</li>)}
            </ol>
          ) : <Empty texto="Sem pendências." />}
        </ResumoCard>

        {s.next_action && (
          <ResumoCard titulo="Próxima ação" destaque>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: '0.3rem' }}>{s.next_action.title}</div>
            <div style={c.small}>{s.next_action.reason}</div>
            <button className="btn-primary" onClick={() => onAction?.(s.next_action)} style={{ marginTop: '0.7rem', fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}>{s.next_action.cta} →</button>
          </ResumoCard>
        )}
      </div>

      {/* módulos da jornada */}
      <div>
        <div style={c.eyebrow}>Módulos da jornada</div>
        <div style={{ ...c.grid2, marginTop: '0.7rem' }}>
          <div><MapaMaturidadeCard projetoId={projetoId} /></div>
          <ModuleCard titulo="🧬 Mapa do Crescimento Integrado v2" status={s.identity.status} href={`/adm/${projetoId}`} cta="Gerenciar identidade"
            linhas={[['Públicos concluídos', `${s.identity.publicos_concluidos}/${s.identity.publicos_total}`], ['Maior divergência', s.identity.top_gap ? `${s.identity.top_gap.indicador} (${Math.round(s.identity.top_gap.gap)})` : '—']]} />
          <ModuleCard titulo="🧠 Mapeamento Comportamental" cta="Gerenciar DISC" onCta={() => onAction?.({ module: 'disc' })}
            linhas={[['Sócios', `${s.people.socios.concluidos}/${s.people.socios.total}`], ['Equipe', `${s.people.equipe.concluidos}/${s.people.equipe.total}`]]} hint="DISC padrão — a função (sócio/líder) contextualiza as trilhas depois." />
          <ModuleCard titulo="📘 Relatório PDF" status={s.deliverables.pdf_identidade_blocked ? STATUS.BLOCKED : STATUS.NOT_STARTED}
            linhas={[['Identidade', s.deliverables.pdf_identidade_blocked ? 'Bloqueado' : 'Pode gerar']]} hint={s.deliverables.pdf_identidade_blocked ? 'Conclua as fontes obrigatórias do Mapa do Crescimento Integrado v2 para liberar.' : 'Ao gerar o PDF, a Leitura Guiada é liberada junto.'} />
          <ModuleCard titulo="📖 Leitura Guiada" status={STATUS.BLOCKED} linhas={[['Público', 'Sócios']]} hint="Liberada automaticamente junto com o PDF do Mapa do Crescimento Integrado v2." />
          <ModuleCard titulo="🧗 Trilhas de Aprofundamento" status={s.deliverables.trilhas_blocked ? STATUS.BLOCKED : STATUS.NOT_STARTED} linhas={[['Público', 'Sócios e líderes']]} hint="Liberadas quando o relatório indicar recomendações." />
          <ModuleCard titulo="🤖 IA Socrática" status={STATUS.BLOCKED} hint="Disponível quando houver relatório e base mínima de conteúdo." />
          <ModuleCard titulo="🎓 Curadoria / Masterclass" status={STATUS.BLOCKED} hint="Em breve." />
        </div>
      </div>
    </div>
  );
}

// ── Abas de conteúdo simples ────────────────────────────────────────
export function FormulariosTab({ cockpit, projetoId }) {
  const s = cockpit.summary;
  const linhas = [
    { label: 'Mapa do Crescimento Integrado — questionário', status: s.maturity.status, href: null },
    ...s.identity.forms.map((f) => ({ label: 'Identidade — ' + f.label, status: mapFormStatus(f.status), href: `/adm/${projetoId}` })),
  ];
  return (
    <div className="glass-card" style={{ padding: '1.3rem' }}>
      <h3 style={{ marginTop: 0 }}>Formulários</h3>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {linhas.map((l, i) => (
          <div key={i} style={c.row}>
            <span style={{ fontSize: '0.9rem' }}>{l.label}</span>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <StatusBadge status={l.status} />
              {l.href && <a href={l.href} target="_blank" rel="noreferrer" style={c.link}>Abrir →</a>}
            </div>
          </div>
        ))}
      </div>
      <p style={c.hint}>Gestão detalhada de respondentes e convites na aba <b>Diagnóstico (esteira)</b>.</p>
    </div>
  );
}

export function PessoasTab({ cockpit }) {
  const p = cockpit.summary.people;
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <PeopleBlock titulo="Sócios" total={p.socios.total} disc={p.socios.concluidos} />
      <PeopleBlock titulo="Equipe / Líderes" total={p.equipe.total} disc={p.equipe.concluidos} nota="A marcação específica de “líder” será adicionada numa próxima fase." />
    </div>
  );
}

export function EntregaveisTab({ cockpit, projetoId }) {
  const d = cockpit.summary.deliverables;
  const items = [
    { label: 'PDF do Mapa do Crescimento Integrado', ok: d.pdf_maturidade, href: null },
    { label: 'PDF do Mapa do Crescimento Integrado v2', ok: !d.pdf_identidade_blocked, blocked: d.pdf_identidade_blocked },
    { label: 'Leitura Guiada', blocked: d.leitura_blocked },
    { label: 'Guias de Aprofundamento', blocked: d.trilhas_blocked },
  ];
  return (
    <div className="glass-card" style={{ padding: '1.3rem' }}>
      <h3 style={{ marginTop: 0 }}>Entregáveis</h3>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {items.map((it, i) => (
          <div key={i} style={c.row}>
            <span style={{ fontSize: '0.9rem' }}>{it.label}</span>
            <StatusBadge status={it.ok ? STATUS.COMPLETED : it.blocked ? STATUS.BLOCKED : STATUS.NOT_STARTED} label={it.ok ? 'Disponível' : it.blocked ? 'Bloqueado' : 'Pendente'} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlaceholderTab({ titulo, texto, status = STATUS.BLOCKED }) {
  return (
    <div className="glass-card" style={{ padding: '2.2rem 1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🔒</div>
      <h3 style={{ margin: '0 0 0.4rem' }}>{titulo}</h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto', fontSize: '0.9rem' }}>{texto}</p>
    </div>
  );
}

// ── peças de apoio ──────────────────────────────────────────────────
function ResumoCard({ titulo, status, destaque, children }) {
  return (
    <div className="glass-card" style={{ padding: '1.1rem 1.2rem', borderColor: destaque ? 'rgba(218,49,68,0.35)' : undefined, background: destaque ? 'rgba(218,49,68,0.06)' : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <div style={c.eyebrow}>{titulo}</div>
        {status && <StatusBadge status={status} />}
      </div>
      {children}
    </div>
  );
}

function ModuleCard({ titulo, status, linhas = [], hint, href, cta, onCta }) {
  return (
    <div className="glass-card" style={{ padding: '1.2rem 1.3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.02rem' }}>{titulo}</h3>
        {status && <StatusBadge status={status} />}
      </div>
      {linhas.map(([k, v], i) => <Linha key={i} k={k} v={v} />)}
      {hint && <p style={c.hint}>{hint}</p>}
      {(href || onCta) && (
        href
          ? <a href={href} target="_blank" rel="noreferrer" style={{ ...c.link, display: 'inline-block', marginTop: '0.6rem' }}>{cta || 'Abrir'} →</a>
          : <button onClick={onCta} style={c.btnSec}>{cta} →</button>
      )}
    </div>
  );
}

function PeopleBlock({ titulo, total, disc, nota }) {
  return (
    <div className="glass-card" style={{ padding: '1.2rem 1.3rem' }}>
      <h3 style={{ marginTop: 0, fontSize: '1.02rem' }}>{titulo}</h3>
      <Linha k="Cadastrados" v={total} />
      <Linha k="Mapeamento Comportamental concluído" v={`${disc}/${total}`} />
      {nota && <p style={c.hint}>{nota}</p>}
    </div>
  );
}

function Linha({ k, v }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', padding: '0.18rem 0' }}><span style={{ color: 'var(--text-secondary)' }}>{k}</span><b>{v}</b></div>;
}
function Empty({ texto }) { return <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>{texto}</div>; }
function mapFormStatus(s) { return s === 'completed' ? STATUS.COMPLETED : s === 'in_progress' ? STATUS.IN_PROGRESS : STATUS.NOT_STARTED; }

const c = {
  eyebrow: { fontSize: '0.66rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 },
  small: { fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 },
  hint: { fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.7rem 0 0', lineHeight: 1.45, fontStyle: 'italic' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.9rem' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.9rem' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.7rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' },
  link: { color: '#9bb8e0', fontSize: '0.82rem', textDecoration: 'none' },
  btnSec: { marginTop: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8, color: 'var(--text-secondary)', padding: '0.45rem 0.9rem', cursor: 'pointer', fontSize: '0.82rem' },
};
