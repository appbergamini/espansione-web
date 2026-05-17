import { useEffect, useState, useCallback } from 'react';

const STATUS_LABELS = {
  pendente:     'Pendente',
  priorizado:   'Priorizado',
  entrevistado: 'Entrevistado',
  descartado:   'Descartado',
};

const STATUS_COLORS = {
  pendente:     { fg: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.35)' },
  priorizado:   { fg: '#60a5fa', bg: 'rgba(96,165,250,0.15)',  border: 'rgba(96,165,250,0.35)' },
  entrevistado: { fg: '#10b981', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.35)' },
  descartado:   { fg: '#94a3b8', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.35)' },
};

const TIPO_STYLE = {
  colaborador: { bg: 'rgba(96,165,250,0.12)', fg: '#60a5fa' },
  cliente:     { bg: 'rgba(251,191,36,0.12)', fg: '#fbbf24' },
};

function fmtData(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function OptInEntrevistasManager({ projetoId }) {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ pendente: 0, priorizado: 0, entrevistado: 0, descartado: 0 });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [selecionados, setSelecionados] = useState(new Set());
  const [detalhe, setDetalhe] = useState(null);

  const carregar = useCallback(async () => {
    if (!projetoId) return;
    setLoading(true);
    setErro('');
    try {
      const params = new URLSearchParams({ projeto_id: projetoId });
      if (filtroTipo !== 'todos') params.append('tipo', filtroTipo);
      if (filtroStatus !== 'todos') params.append('status', filtroStatus);
      const res = await fetch(`/api/opt-in-entrevistas?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao carregar');
      setItems(json.items || []);
      setCounts(json.counts_by_status || { pendente: 0, priorizado: 0, entrevistado: 0, descartado: 0 });
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }, [projetoId, filtroTipo, filtroStatus]);

  useEffect(() => { carregar(); }, [carregar]);

  const atualizarStatus = async (id, novoStatus) => {
    try {
      const res = await fetch(`/api/opt-in-entrevistas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await carregar();
    } catch (err) {
      alert('Erro ao atualizar: ' + err.message);
    }
  };

  const atualizarStatusEmLote = async (novoStatus) => {
    if (selecionados.size === 0) return;
    if (!window.confirm(`Alterar status de ${selecionados.size} registro(s) para "${STATUS_LABELS[novoStatus]}"?`)) return;
    try {
      const res = await fetch('/api/opt-in-entrevistas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selecionados), status: novoStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setSelecionados(new Set());
      await carregar();
    } catch (err) {
      alert('Erro ao atualizar em lote: ' + err.message);
    }
  };

  const excluir = async (id) => {
    if (!window.confirm('Excluir este opt-in? Esta ação é irreversível.')) return;
    try {
      const res = await fetch(`/api/opt-in-entrevistas/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      await carregar();
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const salvarNotas = async (id, notas) => {
    try {
      const res = await fetch(`/api/opt-in-entrevistas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notas_internas: notas }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setDetalhe(null);
      await carregar();
    } catch (err) {
      alert('Erro ao salvar notas: ' + err.message);
    }
  };

  const toggleSelecao = (id) => {
    const n = new Set(selecionados);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelecionados(n);
  };
  const toggleSelecionarTodos = () => {
    if (selecionados.size === items.length) setSelecionados(new Set());
    else setSelecionados(new Set(items.map(i => i.id)));
  };

  const total = counts.pendente + counts.priorizado + counts.entrevistado + counts.descartado;

  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderColor: 'rgba(251, 191, 36, 0.25)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <h3 style={{ fontSize: '1rem', color: '#fbbf24', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>🎙</span> Opt-ins para Entrevista
        </h3>
        <span style={{ fontSize: '0.78rem', background: 'rgba(251,191,36,0.12)', color: '#fbbf24', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>
          {total} voluntário(s)
        </span>
      </div>

      {/* Contadores por status */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
        {Object.entries(STATUS_LABELS).map(([k, label]) => {
          const c = STATUS_COLORS[k];
          return (
            <span
              key={k}
              style={{
                fontSize: '0.74rem', padding: '0.2rem 0.55rem', borderRadius: '6px',
                background: c.bg, color: c.fg, border: `1px solid ${c.border}`,
                fontWeight: 600,
              }}
            >
              {counts[k] || 0} {label}
            </span>
          );
        })}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.9rem', alignItems: 'center' }}>
        <select
          className="form-input"
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
          style={{ padding: '0.4rem 0.6rem', margin: 0, fontSize: '0.82rem', flex: '0 1 auto' }}
        >
          <option value="todos">Todos os tipos</option>
          <option value="colaborador">Colaboradores</option>
          <option value="cliente">Clientes</option>
        </select>
        <select
          className="form-input"
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
          style={{ padding: '0.4rem 0.6rem', margin: 0, fontSize: '0.82rem', flex: '0 1 auto' }}
        >
          <option value="todos">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        {selecionados.size > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{selecionados.size} selecionado(s)</span>
            <select
              className="form-input"
              onChange={e => {
                if (e.target.value) {
                  atualizarStatusEmLote(e.target.value);
                  e.target.value = '';
                }
              }}
              style={{ padding: '0.4rem 0.6rem', margin: 0, fontSize: '0.82rem' }}
              defaultValue=""
            >
              <option value="">Alterar status…</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Erro */}
      {erro && (
        <p style={{ fontSize: '0.8rem', color: 'var(--brand-red)', background: 'rgba(239,68,68,0.08)', padding: '0.5rem 0.75rem', borderRadius: '6px', margin: '0 0 0.75rem 0' }}>
          {erro}
        </p>
      )}

      {/* Tabela / estado vazio */}
      {loading ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Carregando…</p>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '0.9rem', margin: '0 0 0.4rem 0', color: 'var(--text-primary)' }}>
            Nenhum opt-in recebido ainda.
          </p>
          <p style={{ fontSize: '0.78rem', margin: 0 }}>
            Quando colaboradores ou clientes aceitarem participar de entrevista nos formulários, aparecerão aqui.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th style={{ padding: '0.55rem 0.6rem', textAlign: 'left', width: 28 }}>
                  <input
                    type="checkbox"
                    checked={selecionados.size === items.length && items.length > 0}
                    onChange={toggleSelecionarTodos}
                  />
                </th>
                <th style={th}>Nome</th>
                <th style={th}>Tipo</th>
                <th style={th}>Contexto</th>
                <th style={th}>Contato</th>
                <th style={th}>Status</th>
                <th style={th}>Recebido</th>
                <th style={{ ...th, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const ts = TIPO_STYLE[item.tipo] || { bg: 'rgba(255,255,255,0.05)', fg: 'var(--text-secondary)' };
                const c = STATUS_COLORS[item.status] || STATUS_COLORS.pendente;
                return (
                  <tr key={item.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                    <td style={td}>
                      <input
                        type="checkbox"
                        checked={selecionados.has(item.id)}
                        onChange={() => toggleSelecao(item.id)}
                      />
                    </td>
                    <td style={{ ...td, fontWeight: 600 }}>{item.nome}</td>
                    <td style={td}>
                      <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '6px', background: ts.bg, color: ts.fg, fontWeight: 600 }}>
                        {item.tipo}
                      </span>
                    </td>
                    <td style={{ ...td, color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                      {item.tipo === 'colaborador'
                        ? `${item.area || '—'}${item.tempo_casa ? ` · ${item.tempo_casa}` : ''}`
                        : 'Cliente ICP'}
                    </td>
                    <td style={{ ...td, color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{item.contato}</td>
                    <td style={td}>
                      <select
                        value={item.status}
                        onChange={e => atualizarStatus(item.id, e.target.value)}
                        className="form-input"
                        style={{
                          padding: '0.2rem 0.4rem', margin: 0, fontSize: '0.74rem', fontWeight: 600,
                          color: c.fg, background: c.bg, border: `1px solid ${c.border}`, borderRadius: '6px',
                        }}
                      >
                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    <td style={{ ...td, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{fmtData(item.created_at)}</td>
                    <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button onClick={() => setDetalhe(item)} title="Ver detalhes" style={btnIcon}>👁</button>
                      <button onClick={() => excluir(item.id)} title="Excluir" style={{ ...btnIcon, color: 'var(--brand-red)' }}>🗑</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalhes */}
      {detalhe && (
        <DetalheModal
          item={detalhe}
          onClose={() => setDetalhe(null)}
          onSave={notas => salvarNotas(detalhe.id, notas)}
        />
      )}
    </div>
  );
}

const th = { padding: '0.55rem 0.6rem', textAlign: 'left', fontWeight: 700, fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const td = { padding: '0.55rem 0.6rem', verticalAlign: 'middle' };
const btnIcon = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem', padding: '0.2rem 0.3rem', color: 'inherit' };

function DetalheModal({ item, onClose, onSave }) {
  const [notas, setNotas] = useState(item.notas_internas || '');

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-secondary, #0a1122)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.75rem', maxWidth: '560px', width: '92%', maxHeight: '85vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#fbbf24' }}>Detalhes do opt-in</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <Field label="Nome">{item.nome}</Field>
        <Field label="Tipo">{item.tipo}</Field>
        <Field label="Contato">{item.contato}</Field>
        {item.area        && <Field label="Área">{item.area}</Field>}
        {item.tempo_casa  && <Field label="Tempo de casa">{item.tempo_casa}</Field>}
        {item.consentimento_texto && (
          <Field label="Texto de consentimento aceito">
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              &ldquo;{item.consentimento_texto}&rdquo;
            </span>
          </Field>
        )}
        <Field label="Recebido em">{fmtData(item.created_at)}</Field>
        <Field label="Última atualização">{fmtData(item.updated_at)}</Field>

        <div style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
            Notas internas (uso da consultora)
          </label>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            rows={4}
            className="form-input"
            placeholder="Registre aqui impressões, acompanhamento, tentativas de contato…"
            style={{ width: '100%', padding: '0.6rem', margin: 0, fontFamily: 'inherit', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            onClick={onClose}
            style={{ background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={() => onSave(notas)}
            style={{ padding: '0.5rem 1rem' }}
          >
            Salvar notas
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <div style={{ fontWeight: 600, fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>{label}</div>
      <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{children}</div>
    </div>
  );
}
