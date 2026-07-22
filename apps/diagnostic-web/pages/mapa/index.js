import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { CADASTRO_MATURIDADE } from '../../lib/mapa-maturidade/catalog';
import { MapaShell, MapaCard, sx, CORES } from '../../components/mapa/mapaTheme';

// =====================================================================
// Mapa do Crescimento Integrado · Essencial — entrada pública (funil de captação).
// Coleta o cadastro/lead, cria a avaliação (/api/mapa/start) e leva ao
// questionário em /mapa/[token]. Visual alinhado à landing (/crescimento).
// =====================================================================

const ESSENCIAIS = ['CAD-MM-001', 'CAD-MM-002', 'CAD-MM-006']; // nome, empresa, contato

export default function MapaEntradaPage() {
  const router = useRouter();
  const [cadastro, setCadastro] = useState({});
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  const completo = useMemo(
    () => ESSENCIAIS.every((id) => String(cadastro[id] || '').trim()),
    [cadastro]
  );
  function setCad(id, v) { setCadastro((p) => ({ ...p, [id]: v })); }

  // pré-preenche o contato quando vem da área logada (/mapa?email=...)
  useEffect(() => {
    const e = router.query.email;
    if (e) setCadastro((p) => (p['CAD-MM-006'] ? p : { ...p, 'CAD-MM-006': e.toString() }));
  }, [router.query.email]);

  async function iniciar() {
    if (!completo) { setTentou(true); return; }
    setEnviando(true);
    setErro(null);
    try {
      const r = await fetch('/api/mapa/start', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cadastro }),
      });
      const data = await r.json();
      if (!data.success) { setErro(data.error || 'Não foi possível iniciar.'); setEnviando(false); return; }
      router.push(`/mapa/${data.token}`);
    } catch {
      setErro('Falha de conexão. Tente novamente.');
      setEnviando(false);
    }
  }

  return (
    <MapaShell>
      <MapaCard wide>
        <div style={sx.eyebrow}>Check-up gratuito</div>
        <h1 style={sx.h1}>Mapa do Crescimento Integrado · Essencial</h1>
        <p style={sx.txtSec}>
          Uma leitura rápida do seu negócio em 4 pilares: Marca, Negócios, Comunicação e
          Pessoas. Preencha seus dados para começar e receber o resultado.
        </p>
        <div style={{ marginTop: '1rem' }}>
          {CADASTRO_MATURIDADE.map((c) => {
            const essencial = ESSENCIAIS.includes(c.id);
            const vazio = !String(cadastro[c.id] || '').trim();
            const invalido = tentou && essencial && vazio;
            return (
              <div key={c.id} style={sx.campo}>
                <label style={sx.label}>{c.pergunta} {essencial && <span style={{ color: CORES.red }}>*</span>}</label>
                {c.response_type === 'selecao_unica' ? (
                  <div style={sx.opcoes}>
                    {c.opcoes.map((opt) => (
                      <button key={opt} type="button" onClick={() => setCad(c.id, opt)} style={sx.opcao(cadastro[c.id] === opt)}>
                        {cadastro[c.id] === opt ? '✓ ' : ''}{opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input className="mapa-input" value={cadastro[c.id] || ''} onChange={(e) => setCad(c.id, e.target.value)}
                    style={invalido ? { borderColor: CORES.red } : undefined} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '1.4rem', textAlign: 'right' }}>
          <button className="mapa-btn" onClick={iniciar} disabled={enviando} style={{ opacity: completo && !enviando ? 1 : 0.6 }}>
            {enviando ? 'Iniciando…' : 'Iniciar check-up →'}
          </button>
        </div>
        {tentou && !completo && (
          <p style={{ color: CORES.red, fontSize: '0.82rem', marginTop: '0.6rem' }}>Preencha ao menos nome, empresa e contato.</p>
        )}
        {erro && <p style={{ color: CORES.red, fontSize: '0.82rem', marginTop: '0.6rem' }}>{erro}</p>}
      </MapaCard>
    </MapaShell>
  );
}
