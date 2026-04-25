// FIX.29 (Fase B) — Card de Clusters de Comunicação no painel admin.
// FIX.30 (Fase C) — Botão "Gerar com IA" dispara o agente Lean Clusters
// que gera 3-5 clusters acionáveis a partir das respostas dos sócios +
// outputs anteriores. Cada cluster vem com meta_json (mensagem-chave,
// provas, canais, nível de confiança, base de análise, etc.).

import { useEffect, useState } from 'react';

const AI_MODELS = [
  { key: 'gemini-flash', label: 'Gemini Flash', desc: 'Rápido e econômico', provider: 'Google' },
  { key: 'gemini-pro', label: 'Gemini Pro', desc: 'Mais completo', provider: 'Google' },
  { key: 'claude-opus-4-7', label: 'Claude Opus 4.7', desc: 'Máxima capacidade', provider: 'Anthropic' },
  { key: 'claude-sonnet', label: 'Claude Sonnet 4.6', desc: 'Equilibrado', provider: 'Anthropic' },
  { key: 'gpt-5.4', label: 'GPT-5.4', desc: 'Alta capacidade', provider: 'OpenAI' },
  { key: 'gpt-5.4-mini', label: 'GPT-5.4 Mini', desc: 'Rápido e econômico', provider: 'OpenAI' },
];

export default function ClustersCard({ projetoId }) {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | id | 'new'
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [generating, setGenerating] = useState(false);

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

  const gerarComIA = async (modelKey) => {
    setShowModelPicker(false);
    if (clusters.length > 0) {
      if (!confirm(`Já existem ${clusters.length} cluster(s) neste projeto. Os novos clusters da IA serão ADICIONADOS (não substituem). Continuar?`)) return;
    }
    setGenerating(true);
    try {
      const r = await fetch('/api/clusters/gerar-lean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projeto_id: projetoId, modelKey }),
      });
      const j = await r.json();
      if (!j.success) {
        // FIX.32 — quando o modelo retorna sem JSON, mostra preview no
        // console e oferece o raw num alert pra debug rápido.
        if (j.debug) {
          console.error('[gerar-lean debug]', j.debug);
          throw new Error(`${j.error}\n\nModelo: ${j.debug.modelo}\nResposta: ${j.debug.raw_length} chars\nPrefixo:\n${j.debug.raw_preview?.slice(0, 200)}…`);
        }
        throw new Error(j.error || 'Falha na geração');
      }
      alert(`✓ ${j.criados || 0} cluster(s) criado(s) pela IA. Confidência: ${j.nivel_confianca_geral || '—'}.`);
      await load();
    } catch (e) {
      alert('Erro ao gerar: ' + e.message);
    } finally {
      setGenerating(false);
    }
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
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setShowModelPicker(true)}
              disabled={generating}
              style={{
                background: 'rgba(167,139,250,0.15)',
                border: '1px solid rgba(167,139,250,0.45)',
                color: '#a78bfa',
                fontWeight: 600,
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                cursor: generating ? 'wait' : 'pointer',
                opacity: generating ? 0.6 : 1,
              }}
            >
              {generating ? '⏳ Gerando…' : '✨ Gerar com IA'}
            </button>
            <button onClick={startNew} className="btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
              + Novo cluster
            </button>
          </div>
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
            <ClusterRow key={c.id} cluster={c} onEdit={() => startEdit(c)} onDelete={() => excluir(c)} />
          ))}
        </div>
      )}

      {/* FIX.30 — Modal de seleção de modelo (mesmo padrão dos demais agentes) */}
      {showModelPicker && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowModelPicker(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', background: 'var(--bg-secondary, #0a1122)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem', maxWidth: '440px', width: '90%' }}>
            <h3 style={{ color: 'var(--accent-blue)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Escolha o modelo de IA</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              Gerar Clusters Externos Lean a partir das respostas dos sócios + outputs do projeto.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {AI_MODELS.map(m => (
                <button
                  key={m.key}
                  onClick={() => gerarComIA(m.key)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px', padding: '0.85rem 1rem', cursor: 'pointer',
                    textAlign: 'left', color: 'inherit',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', marginBottom: '2px' }}>{m.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.desc}</div>
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                    {m.provider}
                  </span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowModelPicker(false)} style={{ marginTop: '1rem', width: '100%', padding: '0.6rem', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}>
              Cancelar
            </button>
          </div>
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

// FIX.30 — Render rico do cluster: campos top-level + meta_json
// (quando vier do agente Lean) com badges de confiança e base de análise.
function ClusterRow({ cluster: c, onEdit, onDelete }) {
  const [aberto, setAberto] = useState(false);
  const meta = c.meta_json || null;
  const conf = meta?.nivel_confianca || null;
  const base = meta?.base_analise || null;
  const tipo = meta?.tipo_publico || null;

  const corConfianca = conf === 'alto' ? '#10b981' : conf === 'baixo' ? '#ef4444' : '#f59e0b';

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${meta ? 'rgba(167,139,250,0.25)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '8px', padding: '0.7rem 0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.3rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ color: '#fff', fontSize: '0.92rem' }}>{c.nome}</strong>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            {meta && <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#a78bfa', background: 'rgba(167,139,250,0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>IA</span>}
            {tipo && <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{tipo.replace(/_/g, ' ')}</span>}
            {conf && <span style={{ fontSize: '0.65rem', color: corConfianca, border: `1px solid ${corConfianca}55`, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Confiança {conf}</span>}
            {base && <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>· {base.replace(/_/g, ' ')}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {meta && <button onClick={() => setAberto(v => !v)} style={btnIcon} title="Ver detalhes da IA">{aberto ? '▾' : '▸'}</button>}
          <button onClick={onEdit} style={btnIcon} title="Editar">✏</button>
          <button onClick={onDelete} style={btnIcon} title="Excluir">🗑</button>
        </div>
      </div>

      {c.descricao && <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.2rem' }}>{c.descricao}</p>}
      {c.objetivo_negocio && (
        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
          <strong>Objetivo:</strong> {c.objetivo_negocio}
        </p>
      )}

      {meta && aberto && (
        <div style={{ marginTop: '0.6rem', paddingTop: '0.55rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
          {meta.necessidade_principal && <DetalheLabel label="Necessidade">{meta.necessidade_principal}</DetalheLabel>}
          {meta.dor_barreira && <DetalheLabel label="Dor / barreira">{meta.dor_barreira}</DetalheLabel>}
          {meta.gatilho_decisao && <DetalheLabel label="Gatilho de decisão">{meta.gatilho_decisao}</DetalheLabel>}
          {meta.objecao_tipica && <DetalheLabel label="Objeção típica">{meta.objecao_tipica}</DetalheLabel>}
          {meta.mensagem_chave && <DetalheLabel label="Mensagem-chave" destaque>{meta.mensagem_chave}</DetalheLabel>}
          {Array.isArray(meta.provas_necessarias) && meta.provas_necessarias.length > 0 && <DetalheLabel label="Provas necessárias">{meta.provas_necessarias.join(' · ')}</DetalheLabel>}
          {Array.isArray(meta.canais_prioritarios) && meta.canais_prioritarios.length > 0 && <DetalheLabel label="Canais prioritários">{meta.canais_prioritarios.join(' · ')}</DetalheLabel>}
          {meta.oferta_aderente && <DetalheLabel label="Oferta aderente">{meta.oferta_aderente}</DetalheLabel>}
          {meta.risco_comunicacao && <DetalheLabel label="Risco de comunicação">{meta.risco_comunicacao}</DetalheLabel>}
          {meta.proxima_acao && <DetalheLabel label="Próxima ação prática">{meta.proxima_acao}</DetalheLabel>}
          {Array.isArray(meta.evidencias) && meta.evidencias.length > 0 && (
            <DetalheLabel label="Evidências usadas">
              <ul style={{ margin: '0.2rem 0 0 1rem', padding: 0 }}>
                {meta.evidencias.map((e, i) => <li key={i} style={{ marginBottom: '0.1rem' }}>{e}</li>)}
              </ul>
            </DetalheLabel>
          )}
          {meta.pergunta_validacao && <DetalheLabel label="Pergunta rápida de validação" destaque>{meta.pergunta_validacao}</DetalheLabel>}
        </div>
      )}
    </div>
  );
}

function DetalheLabel({ label, children, destaque }) {
  return (
    <div>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: destaque ? '#a78bfa' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '0.4rem' }}>
        {label}:
      </span>
      <span style={{ color: destaque ? '#fff' : 'var(--text-primary)' }}>{children}</span>
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
