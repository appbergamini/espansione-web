import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CORES } from '@espansione/brand';

// Aterrissagem depois da compra: /teste/acesso?order=<order_nsu>
// Resolve o pedido, cria (ou recupera) a sessão e leva ao teste.
export default function Acesso() {
  const router = useRouter();
  const { order, token } = router.query;
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (!order && !token) { setErro('Link incompleto. Use o link que você recebeu depois da compra.'); return; }

    (async () => {
      try {
        const r = await fetch('/teste/api/sessao/acesso', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderNsu: order || undefined, token: token || undefined }),
        });
        const d = await r.json();
        if (!r.ok) { setErro(d.erro || 'Não foi possível liberar o seu teste.'); return; }
        // replace, não push: voltar não deve cair de novo nesta tela.
        router.replace(`/${d.token}`);
      } catch {
        setErro('Sem conexão. Tente de novo em instantes.');
      }
    })();
  }, [router.isReady, order, token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main style={S.shell}>
      <div style={S.card}>
        {erro ? (
          <>
            <h1 style={S.titulo}>Não consegui abrir</h1>
            <p style={S.sec}>{erro}</p>
            <a href="https://wa.me/5511985775893" style={{ ...S.btn, textDecoration: 'none' }}>Falar com a Espansione</a>
          </>
        ) : (
          <>
            <h1 style={S.titulo}>Liberando o seu teste…</h1>
            <p style={S.sec}>Um instante.</p>
          </>
        )}
      </div>
    </main>
  );
}

const S = {
  shell: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' },
  card: {
    background: CORES.card, borderRadius: '16px', padding: '2.5rem 2rem', maxWidth: '460px', width: '100%',
    boxShadow: '0 24px 60px -20px rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center',
  },
  titulo: { margin: 0, fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.25 },
  sec: { margin: 0, color: CORES.textSec, fontSize: '.98rem', lineHeight: 1.55 },
  btn: {
    background: CORES.red, color: '#fff', fontWeight: 600, fontSize: '1rem', padding: '.85rem 1.6rem',
    border: 'none', borderRadius: '12px', cursor: 'pointer', font: 'inherit',
  },
};
