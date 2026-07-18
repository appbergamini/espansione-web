import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo';

// Catálogo de produtos do checkout (master/admin): criar/editar preço, nome,
// fulfillment e ativar/desativar. O checkout e os botões leem daqui.
const FULFILLMENTS = [
  { v: 'identidade', label: 'Mapa do Crescimento Integrado v2 (cria assessment + 3 links)' },
  { v: 'treinamento', label: 'Treinamento (só libera a área/vídeos)' },
  { v: 'nenhum', label: 'Nenhum (só registra a compra)' },
];
const VAZIO = { id: null, slug: '', nome: '', descricao: '', reais: '', fulfillment: 'identidade', ativo: true };

function reais(c) { return c == null ? '—' : (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

export default function AdminProdutos() {
  const router = useRouter();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(VAZIO);
  const [msg, setMsg] = useState(null);
  const [copiado, setCopiado] = useState(null);

  async function carregar() {
    const r = await fetch('/api/adm/produtos');
    if (r.status === 401) { router.replace('/login'); return; }
    if (r.status === 403) { router.replace('/adm'); return; }
    const j = await r.json();
    if (j.success) setProdutos(j.produtos || []);
    setLoading(false);
  }
  useEffect(() => { carregar(); }, []); // eslint-disable-line

  function editar(p) {
    setForm({ id: p.id, slug: p.slug, nome: p.nome, descricao: p.descricao || '', reais: (p.preco_centavos / 100).toString(), fulfillment: p.fulfillment, ativo: p.ativo });
    setMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function salvar() {
    setMsg(null);
    const preco_centavos = Math.round(parseFloat(String(form.reais).replace(',', '.')) * 100);
    const r = await fetch('/api/adm/produtos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: form.id, slug: form.slug, nome: form.nome, descricao: form.descricao, preco_centavos, fulfillment: form.fulfillment, ativo: form.ativo }),
    });
    const j = await r.json();
    if (j.success) { setForm(VAZIO); setMsg({ ok: true, t: 'Salvo!' }); carregar(); }
    else setMsg({ ok: false, t: j.error || 'Erro' });
  }

  async function toggleAtivo(p) {
    await fetch('/api/adm/produtos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, slug: p.slug, nome: p.nome, descricao: p.descricao, preco_centavos: p.preco_centavos, fulfillment: p.fulfillment, ativo: !p.ativo }),
    });
    carregar();
  }

  function copiarLink(slug) {
    navigator.clipboard.writeText(`${window.location.origin}/api/checkout/infinitepay?produto=${slug}`);
    setCopiado(slug); setTimeout(() => setCopiado(null), 1600);
  }

  return (
    <>
      <Head><title>Produtos · Espansione</title></Head>
      <div className="page-container"><main className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Logo size="lg" showTagline={false} />
            <div style={{ height: '64px', width: '1px', background: 'var(--glass-border)' }} />
            <h1 style={{ fontSize: '1.5rem' }}>🛒 Produtos</h1>
          </div>
          <button onClick={() => router.push('/adm')} style={sx.back}>← Painel</button>
        </div>

        <div className="glass-card" style={{ marginBottom: '1.4rem' }}>
          <h2 style={{ marginTop: 0 }}>{form.id ? 'Editar produto' : 'Novo produto'}</h2>
          <div style={sx.grid}>
            <label style={sx.lbl}>Slug (URL) <input value={form.slug} disabled={!!form.id} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="identidade" style={sx.inp} /></label>
            <label style={sx.lbl}>Nome (aparece no checkout) <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Mapa do Crescimento Integrado v2" style={sx.inp} /></label>
            <label style={sx.lbl}>Preço (R$) <input value={form.reais} onChange={(e) => setForm({ ...form, reais: e.target.value })} placeholder="1497.00" inputMode="decimal" style={sx.inp} /></label>
            <label style={sx.lbl}>Fulfillment
              <select value={form.fulfillment} onChange={(e) => setForm({ ...form, fulfillment: e.target.value })} style={sx.inp}>
                {FULFILLMENTS.map((f) => <option key={f.v} value={f.v}>{f.label}</option>)}
              </select>
            </label>
            <label style={{ ...sx.lbl, gridColumn: '1 / -1' }}>Descrição (opcional) <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} style={sx.inp} /></label>
            <label style={{ ...sx.lbl, flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Ativo
            </label>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', alignItems: 'center' }}>
            <button className="btn-primary" onClick={salvar}>{form.id ? 'Salvar alterações' : 'Criar produto'}</button>
            {form.id && <button onClick={() => setForm(VAZIO)} style={sx.back}>Cancelar</button>}
            {msg && <span style={{ color: msg.ok ? '#86efac' : '#fca5a5', fontSize: '0.85rem' }}>{msg.t}</span>}
          </div>
        </div>

        <div className="glass-card">
          <h2 style={{ marginTop: 0 }}>Catálogo</h2>
          {loading ? <div style={sx.empty}>Carregando…</div> : produtos.length === 0 ? <div style={sx.empty}>Nenhum produto.</div> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead><tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                  <th style={sx.th}>Nome</th><th style={sx.th}>Slug</th><th style={sx.th}>Preço</th><th style={sx.th}>Fulfillment</th><th style={sx.th}>Ativo</th><th style={{ ...sx.th, textAlign: 'right' }}>Ações</th>
                </tr></thead>
                <tbody>
                  {produtos.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)', opacity: p.ativo ? 1 : 0.5 }}>
                      <td style={sx.td}>{p.nome}</td>
                      <td style={{ ...sx.td, fontFamily: 'monospace', fontSize: '0.85rem' }}>{p.slug}</td>
                      <td style={sx.td}>{reais(p.preco_centavos)}</td>
                      <td style={sx.td}>{p.fulfillment}</td>
                      <td style={sx.td}><button onClick={() => toggleAtivo(p)} style={{ ...sx.pill, background: p.ativo ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)', color: p.ativo ? '#86efac' : '#9aa3ad', cursor: 'pointer', border: 0 }}>{p.ativo ? 'Ativo' : 'Inativo'}</button></td>
                      <td style={{ ...sx.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button onClick={() => copiarLink(p.slug)} style={sx.linkBtn}>{copiado === p.slug ? '✓ Link' : '🔗 Link'}</button>
                        <button onClick={() => editar(p)} style={{ ...sx.linkBtn, marginLeft: '0.4rem' }}>Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '1rem' }}>
            O botão da landing usa <code>?produto=identidade</code>. Copie o link de qualquer produto para usar em outros CTAs.
          </p>
        </div>
      </main></div>
    </>
  );
}

const sx = {
  back: { padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--text-secondary)', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' },
  lbl: { display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' },
  inp: { padding: '0.6rem 0.7rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.03)', color: 'inherit', fontSize: '0.92rem' },
  th: { padding: '0.8rem 1rem', fontWeight: 500 },
  td: { padding: '0.8rem 1rem' },
  empty: { textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' },
  pill: { fontSize: '0.76rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 99, whiteSpace: 'nowrap' },
  linkBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 7, color: 'var(--text-secondary)', padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' },
};
