import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo';

const STATUS = {
  checkout_criado: { txt: 'Aguardando pagamento', cor: '#fde68a', bg: 'rgba(234,179,8,0.15)' },
  checkout_estatico: { txt: 'Checkout aberto', cor: '#fde68a', bg: 'rgba(234,179,8,0.15)' },
  pago: { txt: 'Pago', cor: '#86efac', bg: 'rgba(34,197,94,0.15)' },
  pagamento_nao_confirmado: { txt: 'Não confirmado', cor: '#fca5a5', bg: 'rgba(239,68,68,0.15)' },
};

function dataBr(iso) {
  try { return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return '—'; }
}

export default function AdminFeira() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/adm/feira');
        if (response.status === 401) { router.replace('/login'); return; }
        if (response.status === 403) { router.replace('/adm'); return; }
        const data = await response.json();
        if (data.success) setLeads(data.leads || []);
        else setErro(data.error || 'Erro ao carregar os cadastros.');
      } catch { setErro('Erro de conexão.'); }
      finally { setLoading(false); }
    })();
  }, [router]);

  const pagos = leads.filter((lead) => lead.status === 'pago').length;

  return (
    <>
      <Head><title>Feira · Espansione</title></Head>
      <div className="page-container">
        <main className="container">
          <div style={sx.header}>
            <div style={sx.brand}><Logo size="lg" showTagline={false} /><div style={sx.divider} /><h1 style={{ fontSize: '1.5rem' }}>📱 Leads da Feira</h1></div>
            <button onClick={() => router.push('/adm')} style={sx.back}>← Painel</button>
          </div>
          <div className="glass-card">
            <div style={sx.summary}><h2 style={{ margin: 0 }}>QR Code e checkout</h2><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{leads.length} cadastro(s) · <b style={{ color: '#86efac' }}>{pagos}</b> pagamento(s) confirmado(s)</span></div>
            {loading ? <div style={sx.empty}>Carregando…</div> : erro ? <div style={sx.error}>{erro}</div> : leads.length === 0 ? <div style={sx.empty}>Nenhum cadastro ainda.</div> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={sx.table}>
                  <thead><tr style={sx.row}><th style={sx.th}>Cadastro</th><th style={sx.th}>Cliente</th><th style={sx.th}>Contato</th><th style={sx.th}>Pagamento</th><th style={sx.th}>Confirmado em</th></tr></thead>
                  <tbody>{leads.map((lead) => {
                    const status = STATUS[lead.status] || { txt: lead.status || '—', cor: '#9aa3ad', bg: 'rgba(255,255,255,0.06)' };
                    return <tr key={lead.id} style={sx.row}><td style={sx.td}>{dataBr(lead.created_at)}</td><td style={sx.td}><b>{lead.nome}</b></td><td style={sx.td}><div>{lead.email}</div><div style={sx.sub}>{lead.whatsapp}</div></td><td style={sx.td}><span style={{ ...sx.pill, color: status.cor, background: status.bg }}>{status.txt}</span></td><td style={sx.td}>{lead.pago_em ? dataBr(lead.pago_em) : '—'}</td></tr>;
                  })}</tbody>
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  brand: { display: 'flex', alignItems: 'center', gap: '1.5rem' }, divider: { height: 64, width: 1, background: 'var(--glass-border)' },
  back: { padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--text-secondary)', cursor: 'pointer' },
  summary: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.4rem', flexWrap: 'wrap', gap: '0.6rem' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }, row: { borderBottom: '1px solid var(--glass-border)' }, th: { padding: '0.8rem 1rem', fontWeight: 500, color: 'var(--text-secondary)' }, td: { padding: '0.8rem 1rem', verticalAlign: 'top' },
  empty: { textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }, error: { background: 'var(--error)', padding: '1rem', borderRadius: 8, color: '#fff' }, sub: { color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: 3 }, pill: { fontSize: '0.76rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 99, whiteSpace: 'nowrap' },
};
