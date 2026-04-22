import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import RichTextEditor from './RichTextEditor';

const PAPEIS = [
  { key: 'socios', label: 'Sócios', color: '#60a5fa' },
  { key: 'colaboradores', label: 'Colaboradores', color: '#a78bfa' },
  { key: 'clientes', label: 'Clientes', color: '#f59e0b' },
];

const PLACEHOLDERS = ['{{nome}}', '{{papel}}', '{{projeto}}', '{{link}}'];

const DEFAULT_TEMPLATE = {
  assunto: 'Convite para {{projeto}} — {{papel}}',
  corpo: '<p>Olá <strong>{{nome}}</strong>,</p><p>Você foi convidado como <strong>{{papel}}</strong> para participar do diagnóstico do projeto <strong>{{projeto}}</strong>.</p><p>Suas respostas vão alimentar a construção estratégica da marca. Deve levar cerca de <em>10–15 minutos</em>.</p>',
};

function normalizeRow(raw) {
  const lower = {};
  for (const k of Object.keys(raw)) {
    lower[k.toLowerCase().trim()] = raw[k];
  }
  const pick = (...keys) => {
    for (const k of keys) if (lower[k] !== undefined && lower[k] !== null) return String(lower[k]).trim();
    return '';
  };
  return {
    nome: pick('nome', 'name', 'nome completo'),
    email: pick('email', 'e-mail', 'mail'),
    whatsapp: pick('whatsapp', 'telefone', 'celular', 'phone'),
    papel: pick('papel', 'role', 'tipo'),
  };
}

export default function RespondentesManager({ projetoId }) {
  const [respondentes, setRespondentes] = useState([]);
  const [templates, setTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const [activeTemplatePapel, setActiveTemplatePapel] = useState(null);
  const [templateDraft, setTemplateDraft] = useState({ assunto: '', corpo: '' });
  const [sendingPapel, setSendingPapel] = useState(null);
  const fileInputRef = useRef(null);
  const [importTargetPapel, setImportTargetPapel] = useState(null);
  const corpoRef = useRef(null);

  const [form, setForm] = useState({ nome: '', email: '', whatsapp: '', papel: 'socios' });
  const [editId, setEditId] = useState(null);

  const showMsg = (tipo, texto, timeout = 4000) => {
    setMsg({ tipo, texto });
    if (timeout) setTimeout(() => setMsg({ tipo: '', texto: '' }), timeout);
  };

  const load = async () => {
    if (!projetoId) return;
    setLoading(true);
    try {
      const [rRes, tRes] = await Promise.all([
        fetch(`/api/respondentes?projeto_id=${projetoId}`),
        fetch(`/api/email-templates?projeto_id=${projetoId}`),
      ]);
      const rJson = await rRes.json();
      const tJson = await tRes.json();
      if (rJson.success) setRespondentes(rJson.respondentes || []);
      if (tJson.success) {
        const map = {};
        (tJson.templates || []).forEach(t => { map[t.papel] = t; });
        setTemplates(map);
      }
    } catch (err) {
      showMsg('erro', 'Erro carregando dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [projetoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.papel) return;
    try {
      if (editId) {
        const res = await fetch(`/api/respondentes?projeto_id=${projetoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, projeto_id: projetoId, ...form }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        showMsg('ok', 'Atualizado');
      } else {
        const res = await fetch(`/api/respondentes?projeto_id=${projetoId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projeto_id: projetoId, ...form }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        showMsg('ok', 'Adicionado');
      }
      setForm({ nome: '', email: '', whatsapp: '', papel: form.papel });
      setEditId(null);
      load();
    } catch (err) {
      showMsg('erro', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remover este respondente?')) return;
    try {
      const res = await fetch(`/api/respondentes?projeto_id=${projetoId}&id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      load();
    } catch (err) {
      showMsg('erro', err.message);
    }
  };

  const handleEdit = (r) => {
    setEditId(r.id);
    setForm({ nome: r.nome, email: r.email, whatsapp: r.whatsapp || '', papel: r.papel });
  };

  const handleFile = async (papel, file) => {
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      const items = rows
        .map(normalizeRow)
        .filter(r => r.nome && r.email)
        .map(r => ({
          nome: r.nome,
          email: r.email,
          whatsapp: r.whatsapp,
          papel: r.papel && ['socios', 'colaboradores', 'clientes'].includes(r.papel.toLowerCase()) ? r.papel.toLowerCase() : papel,
        }));
      if (items.length === 0) {
        showMsg('erro', 'Nenhuma linha válida (colunas esperadas: nome, email, whatsapp, papel)');
        return;
      }
      const res = await fetch(`/api/respondentes?projeto_id=${projetoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projeto_id: projetoId, items }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showMsg('ok', `Importado: ${json.inserted} registros`);
      load();
    } catch (err) {
      showMsg('erro', 'Erro ao importar: ' + err.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openTemplateEditor = (papel) => {
    const t = templates[papel] || {};
    setActiveTemplatePapel(papel);
    setTemplateDraft({
      assunto: t.assunto || DEFAULT_TEMPLATE.assunto,
      corpo: t.corpo || DEFAULT_TEMPLATE.corpo,
    });
  };

  const saveTemplate = async () => {
    try {
      const res = await fetch(`/api/email-templates?projeto_id=${projetoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projeto_id: projetoId, papel: activeTemplatePapel, ...templateDraft }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showMsg('ok', 'Template salvo');
      setActiveTemplatePapel(null);
      load();
    } catch (err) {
      showMsg('erro', err.message);
    }
  };

  const insertPlaceholder = (ph) => {
    corpoRef.current?.insertText(ph);
  };

  const enviarBatch = async (papel) => {
    const pendentes = respondentes.filter(r => r.papel === papel && r.status_convite === 'pendente').length;
    if (pendentes === 0) {
      showMsg('erro', 'Nenhum pendente para enviar');
      return;
    }
    if (!confirm(`Enviar convite para ${pendentes} ${papel} pendentes?`)) return;
    setSendingPapel(papel);
    try {
      const res = await fetch('/api/convites/enviar-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projetoId, papel, somentePendentes: true }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      if (json.falhas > 0) {
        const firstErr = (json.detalhes || []).find(d => !d.ok);
        const msgExtra = firstErr ? ` — ${firstErr.email}: ${firstErr.error}` : '';
        showMsg('erro', `Enviados ${json.enviados} | Falhas ${json.falhas}${msgExtra}`, 15000);
      } else {
        showMsg('ok', `${json.enviados} convite(s) enviado(s)`);
      }
      load();
    } catch (err) {
      showMsg('erro', err.message);
    } finally {
      setSendingPapel(null);
    }
  };

  if (!projetoId) return null;

  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>Respondentes</h3>
        {msg.texto && (
          <span style={{ fontSize: '0.78rem', color: msg.tipo === 'erro' ? 'var(--brand-red)' : 'var(--success)' }}>
            {msg.texto}
          </span>
        )}
      </div>

      {/* Form de adicionar/editar */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 0.8fr auto', gap: '0.5rem', marginBottom: '1rem' }}>
        <input className="form-input" style={{ padding: '0.4rem', margin: 0 }} placeholder="Nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
        <input className="form-input" style={{ padding: '0.4rem', margin: 0 }} type="email" placeholder="E-mail" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input className="form-input" style={{ padding: '0.4rem', margin: 0 }} placeholder="WhatsApp" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} />
        <select className="form-input" style={{ padding: '0.4rem', margin: 0 }} value={form.papel} onChange={e => setForm({ ...form, papel: e.target.value })}>
          {PAPEIS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        <button type="submit" className="btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
          {editId ? 'Salvar' : '+ Add'}
        </button>
      </form>
      {editId && (
        <button onClick={() => { setEditId(null); setForm({ nome: '', email: '', whatsapp: '', papel: 'socios' }); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer', marginBottom: '0.5rem' }}>
          Cancelar edição
        </button>
      )}

      {/* Upload global de arquivo */}
      <input type="file" ref={fileInputRef} accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={e => handleFile(importTargetPapel || 'socios', e.target.files?.[0])} />

      {loading ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Carregando...</p>
      ) : (
        PAPEIS.map(p => {
          const lista = respondentes.filter(r => r.papel === p.key);
          const respondidos = lista.filter(r => r.status_convite === 'respondido').length;
          const enviados = lista.filter(r => r.status_convite !== 'pendente').length;
          return (
            <div key={p.key} style={{ marginTop: '1rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: p.color }}>{p.label}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {lista.length} total • {enviados} convidados • {respondidos} respondidos
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => { setImportTargetPapel(p.key); fileInputRef.current?.click(); }} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '0.25rem 0.55rem', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}>
                    📎 Importar
                  </button>
                  <button onClick={() => openTemplateEditor(p.key)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '0.25rem 0.55rem', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}>
                    ✏️ Template
                  </button>
                  <button onClick={() => enviarBatch(p.key)} disabled={sendingPapel === p.key} className="btn-primary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: p.color }}>
                    {sendingPapel === p.key ? 'Enviando...' : '✉️ Enviar convites'}
                  </button>
                </div>
              </div>

              {lista.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>(vazio)</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {lista.map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.4rem 0.6rem', borderRadius: '5px', fontSize: '0.82rem' }}>
                      <span style={{ flex: 1, fontWeight: 600 }}>{r.nome}</span>
                      <span style={{ flex: 1.5, color: 'var(--text-secondary)' }}>{r.email}</span>
                      <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{r.whatsapp || '—'}</span>
                      <span
                        title={r.respondido_em ? `Respondido em ${new Date(r.respondido_em).toLocaleString('pt-BR')}` : undefined}
                        style={{ fontSize: '0.7rem', padding: '0.12rem 0.4rem', borderRadius: '8px',
                          background: r.status_convite === 'respondido' ? 'rgba(16,185,129,0.15)' : r.status_convite === 'enviado' ? 'rgba(96,165,250,0.15)' : 'rgba(148,163,184,0.15)',
                          color: r.status_convite === 'respondido' ? '#10b981' : r.status_convite === 'enviado' ? '#60a5fa' : '#94a3b8' }}>
                        {r.status_convite === 'respondido' && r.respondido_em
                          ? `respondido · ${new Date(r.respondido_em).toLocaleDateString('pt-BR')}`
                          : r.status_convite}
                      </span>
                      <a
                        href={`${p.key === 'socios' ? '/form/socios' : p.key === 'colaboradores' ? '/form/colaboradores' : '/form/clientes'}?t=${r.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Visualizar formulário como este respondente"
                        style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}
                      >👁</a>
                      <button onClick={() => {
                        const path = p.key === 'socios' ? '/form/socios' : p.key === 'colaboradores' ? '/form/colaboradores' : '/form/clientes';
                        const url = `${window.location.origin}${path}?t=${r.token}`;
                        navigator.clipboard.writeText(url);
                        showMsg('ok', `Link de ${r.nome} copiado`);
                      }} title="Copiar link único" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}>🔗</button>
                      <button onClick={() => handleEdit(r)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.8rem' }}>✏️</button>
                      <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', color: 'var(--brand-red)', cursor: 'pointer', fontSize: '0.8rem' }}>🗑</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {activeTemplatePapel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setActiveTemplatePapel(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0a1122', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.5rem', maxWidth: '640px', width: '100%', maxHeight: '85vh', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ margin: 0, color: '#fff' }}>Template — {PAPEIS.find(p => p.key === activeTemplatePapel)?.label}</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Placeholders disponíveis:{' '}
              {PLACEHOLDERS.map(ph => (
                <button key={ph} onClick={() => insertPlaceholder(ph)} style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '4px', padding: '0.15rem 0.45rem', color: '#60a5fa', cursor: 'pointer', fontSize: '0.75rem', margin: '0 0.2rem 0.2rem 0', fontFamily: 'monospace' }}>{ph}</button>
              ))}
            </p>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Assunto</label>
              <input className="form-input" style={{ padding: '0.5rem', margin: 0 }} value={templateDraft.assunto} onChange={e => setTemplateDraft(d => ({ ...d, assunto: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Corpo</label>
              <RichTextEditor ref={corpoRef} value={templateDraft.corpo} onChange={html => setTemplateDraft(d => ({ ...d, corpo: html }))} placeholder="Escreva o corpo do e-mail..." height={240} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setActiveTemplatePapel(null)} style={{ padding: '0.5rem 1rem', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={saveTemplate} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Salvar Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
