// FIX.29 (Fase B) — Card de Clusters de Comunicação no painel admin.
// Etapa intermediária entre os outputs e o Agente 13. Master/admin
// define os clusters formais (nome, afinidades, motivações, objetivo
// de negócio, mensagem-âncora) que vão alimentar o Agente 13.

import { useEffect, useState } from 'react';

export default function ClustersCard({ projetoId }) {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | id | 'new'
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!projetoId) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/clusters?projeto_id=${projetoId}`);
      const j = await r.json();
      if (j.success) setClusters(j.clusters || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projetoId]);

  const startNew = () => {
    setForm(emptyForm());
    setEditing('new');
  };

  const startEdit = (c) => {
    setForm({
      nome: c.nome || '',
      descricao: c.descricao || '',
      afinidades: c.afinidades || '',
      motivacoes: c.motivacoes || '',
      objetivo_negocio: c.objetivo_negocio || '',
      mensagem_ancora: c.mensagem_ancora || '',
    });
    setEditing(c.id);
  };

  const cancel = () => { setEditing(null); setForm(emptyForm()); };

  const salvar = async () => {
    if (!form.nome.trim()) { alert('Nome do cluster é obrigatório.'); return; }
    setSaving(true);
    try {
      if (editing === 'new') {
        const r = await fetch('/api/clusters', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projeto_id: projetoId, ...form, ordem: clusters.length }),
        });
        const j = await r.json();
        if (!j.success) throw new Error(j.error);
      } else {
        const r = await fetch(`/api/clusters/${editing}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const j = await r.json();
        if (!j.success) throw new Error(j.error);
      }
      await load();
      cancel();
    } catch (e) {
      alert('Erro: ' + e.message);
    } finally { setSaving(false); }
  };

  const excluir = async (c) => {
    if (!confirm(`Excluir o cluster "${c.nome}"?`)) return;
    try {
      const r = await fetch(`/api/clusters/${c.id}`, { method: 'DELETE' });
      const j = await r.json();
      if (!j.success) throw new Error(j.error);
      await load();
    } catch (e) { alert('Erro: ' + e.message); }
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderColor: 'rgba(167,139,250,0.30)', background: 'rgba(167,139,250,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.6rem' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--accent-purple, #a78bfa)', margin: 0 }}>
            Clusters de Comunicação ({clusters.length})
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
            Lente de público pra comunicação (Módulo 2 Ana Couto). Personas continuam separadas — são pra experiência.
            Defina aqui antes de rodar o Agente 13.
          </p>
        </div>
        {!editing && (
          <button onClick={startNew} className="btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
            + Novo cluster
          </button>
        )}
      </div>

      {loading && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Carregando…</p>}

      {!loading && clusters.length === 0 && !editing && (
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
          Nenhum cluster definido. O Agente 13 pode rodar mesmo sem clusters, mas o plano sai mais forte com eles.
        </p>
      )}

      {!editing && clusters.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {clusters.map(c => (
            <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.7rem 0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <strong style={{ color: '#fff', fontSize: '0.92rem' }}>{c.nome}</strong>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button onClick={() => startEdit(c)} style={btnIcon}>✏</button>
                  <button onClick={() => excluir(c)} style={btnIcon}>🗑</button>
                </div>
              </div>
              {c.descricao && <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.2rem' }}>{c.descricao}</p>}
              {c.objetivo_negocio && (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                  <strong>Objetivo:</strong> {c.objetivo_negocio}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
          <CampoCluster label="Nome do cluster" value={form.nome} onChange={v => setForm({ ...form, nome: v })} placeholder="Ex.: C-Levels de produtoras médias" required />
          <CampoCluster label="Descrição" value={form.descricao} onChange={v => setForm({ ...form, descricao: v })} placeholder="Quem são essas pessoas, em 1-2 frases" textarea rows={2} />
          <CampoCluster label="Afinidades" value={form.afinidades} onChange={v => setForm({ ...form, afinidades: v })} placeholder="O que une as pessoas deste cluster (interesses, valores, contextos)" textarea rows={2} />
          <CampoCluster label="Motivações" value={form.motivacoes} onChange={v => setForm({ ...form, motivacoes: v })} placeholder="O que move este cluster (Job to be done, dor, aspiração)" textarea rows={2} />
          <CampoCluster label="Objetivo de negócio com este cluster" value={form.objetivo_negocio} onChange={v => setForm({ ...form, objetivo_negocio: v })} placeholder="Ex.: conversão B2B / advocacy / atração de talento sênior" />
          <CampoCluster label="Mensagem-âncora (opcional)" value={form.mensagem_ancora} onChange={v => setForm({ ...form, mensagem_ancora: v })} placeholder="Frase-rascunho que o Agente 13 vai refinar" textarea rows={2} />

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
            <button onClick={salvar} disabled={saving} className="btn-primary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}>
              {saving ? 'Salvando…' : (editing === 'new' ? 'Criar cluster' : 'Salvar')}
            </button>
            <button onClick={cancel} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)', padding: '0.45rem 0.85rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CampoCluster({ label, value, onChange, placeholder, textarea, rows = 1, required }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#fff', marginBottom: '0.2rem' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} className="form-input" placeholder={placeholder} style={{ fontSize: '0.85rem' }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} className="form-input" placeholder={placeholder} style={{ fontSize: '0.85rem' }} />
      )}
    </div>
  );
}

function emptyForm() {
  return { nome: '', descricao: '', afinidades: '', motivacoes: '', objetivo_negocio: '', mensagem_ancora: '' };
}

const btnIcon = {
  background: 'none',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  color: 'var(--text-secondary)',
  padding: '0.2rem 0.45rem',
  fontSize: '0.75rem',
  cursor: 'pointer',
};
