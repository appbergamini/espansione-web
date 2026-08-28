import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Logo from '../../components/Logo';

// Painel de pagamentos (compras InfinitePay). Master/admin.
const STATUS = {
  paid: { txt: 'Pago', cor: '#86efac', bg: 'rgba(34,197,94,0.15)' },
  received: { txt: 'Recebido', cor: '#86efac', bg: 'rgba(34,197,94,0.15)' },
  paid_unverified: { txt: 'Pago (não verificado)', cor: '#fde68a', bg: 'rgba(234,179,8,0.15)' },
  unpaid: { txt: 'Não pago', cor: '#fca5a5', bg: 'rgba(239,68,68,0.15)' },
};

function reais(c) {
  if (c == null) return '—';
  return (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function dataBr(iso) {
  try { return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return '—'; }
}

const COLUNAS = [
  { key: 'created_at', label: 'Data' },
  { key: 'comprador', label: 'Comprador' },
  { key: 'produto', label: 'Produto' },
  { key: 'valor_centavos', label: 'Valor' },
  { key: 'status', label: 'Status' },
  { key: 'projeto', label: 'Projeto' },
  { key: 'comprovante', label: 'Comprovante', align: 'right' },
];

function valorOrdenacao(pagamento, key) {
  if (key === 'created_at') return pagamento.created_at ? new Date(pagamento.created_at).getTime() : null;
  if (key === 'valor_centavos') return pagamento.valor_centavos;
  if (key === 'status') return STATUS[pagamento.status]?.txt || pagamento.status;
  if (key === 'projeto') return pagamento.projeto_cliente || pagamento.projeto_id;
  if (key === 'comprovante') return pagamento.receipt_url ? 1 : 0;
  return pagamento[key];
}

function comparar(a, b, key, direction) {
  const valorA = valorOrdenacao(a, key);
  const valorB = valorOrdenacao(b, key);
  const vazioA = valorA == null || valorA === '';
  const vazioB = valorB == null || valorB === '';

  if (vazioA || vazioB) {
    if (vazioA && vazioB) return 0;
    return vazioA ? 1 : -1;
  }

  const resultado = typeof valorA === 'number' && typeof valorB === 'number'
    ? valorA - valorB
    : String(valorA).localeCompare(String(valorB), 'pt-BR', { sensitivity: 'base', numeric: true });

  return direction === 'asc' ? resultado : -resultado;
}

export default function AdminPagamentos() {
  const router = useRouter();
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [ordenacao, setOrdenacao] = useState({ key: 'created_at', direction: 'desc' });

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/adm/pagamentos');
        if (r.status === 401) { router.replace('/login'); return; }
        if (r.status === 403) { router.replace('/adm'); return; }
        const j = await r.json();
        if (j.success) setPagamentos(j.pagamentos || []);
        else setErro(j.error || 'Erro');
      } catch { setErro('Erro de conexão'); }
      finally { setLoading(false); }
    })();
  }, [router]);

  const total = pagamentos.filter((p) => /paid|received/.test(p.status || '')).reduce((s, p) => s + (p.valor_centavos || 0), 0);
  const pagamentosOrdenados = useMemo(() => pagamentos
    .map((pagamento, indice) => ({ pagamento, indice }))
    .sort((a, b) => comparar(a.pagamento, b.pagamento, ordenacao.key, ordenacao.direction) || a.indice - b.indice)
    .map(({ pagamento }) => pagamento), [pagamentos, ordenacao]);

  function ordenarPor(key) {
    setOrdenacao((atual) => ({
      key,
      direction: atual.key === key && atual.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  return (
    <>
      <Head><title>Pagamentos · Espansione</title></Head>
      <div className="page-container">
        <main className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Logo size="lg" showTagline={false} />
              <div style={{ height: '64px', width: '1px', background: 'var(--glass-border)' }} />
              <h1 style={{ fontSize: '1.5rem' }}>💳 Pagamentos</h1>
            </div>
            <button onClick={() => router.push('/adm')} style={sx.back}>← Painel</button>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.4rem', flexWrap: 'wrap', gap: '0.6rem' }}>
              <h2 style={{ margin: 0 }}>Compras recebidas</h2>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {pagamentos.length} registro(s) · total pago <b style={{ color: '#86efac' }}>{reais(total)}</b>
              </span>
            </div>

            {loading ? (
              <div style={sx.empty}>Carregando…</div>
            ) : erro ? (
              <div style={{ background: 'var(--error)', padding: '1rem', borderRadius: 8, color: '#fff' }}>{erro}</div>
            ) : pagamentos.length === 0 ? (
              <div style={sx.empty}>Nenhum pagamento ainda.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                      {COLUNAS.map((coluna) => {
                        const ativa = ordenacao.key === coluna.key;
                        const direcao = ativa ? ordenacao.direction : null;
                        return (
                          <th
                            key={coluna.key}
                            scope="col"
                            aria-sort={ativa ? (direcao === 'asc' ? 'ascending' : 'descending') : 'none'}
                            style={{ ...sx.th, textAlign: coluna.align || 'left' }}
                          >
                            <button
                              type="button"
                              onClick={() => ordenarPor(coluna.key)}
                              title={`Ordenar por ${coluna.label}`}
                              style={{ ...sx.sortButton, justifyContent: coluna.align === 'right' ? 'flex-end' : 'flex-start' }}
                            >
                              <span>{coluna.label}</span>
                              <span aria-hidden="true" style={{ ...sx.sortIcon, opacity: ativa ? 1 : 0.45 }}>
                                {direcao === 'asc' ? '↑' : direcao === 'desc' ? '↓' : '↕'}
                              </span>
                            </button>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {pagamentosOrdenados.map((p) => {
                      const st = STATUS[p.status] || { txt: p.status || '—', cor: '#9aa3ad', bg: 'rgba(255,255,255,0.06)' };
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                          <td style={sx.td}>{dataBr(p.created_at)}</td>
                          <td style={sx.td}>{p.comprador || <span style={{ color: 'var(--text-secondary)' }}>—</span>}</td>
                          <td style={sx.td}>{p.produto || '—'}</td>
                          <td style={sx.td}>{reais(p.valor_centavos)}</td>
                          <td style={sx.td}><span style={{ ...sx.pill, color: st.cor, background: st.bg }}>{st.txt}</span></td>
                          <td style={sx.td}>
                            {p.projeto_id
                              ? <a href={`/adm/${p.projeto_id}`} style={sx.link}>{p.projeto_cliente || 'ver projeto'} →</a>
                              : <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                          </td>
                          <td style={{ ...sx.td, textAlign: 'right' }}>
                            {p.receipt_url ? <a href={p.receipt_url} target="_blank" rel="noreferrer" style={sx.link}>abrir</a> : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

const sx = {
  back: { padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--text-secondary)', cursor: 'pointer' },
  th: { padding: '0.8rem 1rem', fontWeight: 500 },
  sortButton: { display: 'inline-flex', alignItems: 'center', gap: '0.35rem', width: '100%', padding: 0, border: 0, background: 'transparent', color: 'inherit', font: 'inherit', fontWeight: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' },
  sortIcon: { width: '1rem', color: '#fca5b0', fontSize: '0.85rem' },
  td: { padding: '0.8rem 1rem' },
  empty: { textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' },
  pill: { fontSize: '0.76rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 99, whiteSpace: 'nowrap' },
  link: { color: '#fca5b0', textDecoration: 'none' },
};
