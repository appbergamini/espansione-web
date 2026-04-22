import { useState, useEffect } from 'react';
import { useFormPersistence } from '../../../lib/forms/useFormPersistence';
import { BLOCOS, validarFormulario, construirPayload } from '../../../lib/forms/colaboradores_v3_schema';
import BarraProgresso from '../shared/BarraProgresso';
import Bloco1 from './Bloco1_Perfil';
import Bloco2 from './Bloco2_MarcaProposito';
import Bloco3 from './Bloco3_CulturaVivida';
import Bloco4 from './Bloco4_SegurancaPsicologica';
import Bloco5 from './Bloco5_LiderancaImediata';
import Bloco6 from './Bloco6_CoerenciaMomentos';
import Bloco7 from './Bloco7_MotivacaoPermanencia';
import Bloco8 from './Bloco8_OptIn';

const COMPONENTES = { 1: Bloco1, 2: Bloco2, 3: Bloco3, 4: Bloco4, 5: Bloco5, 6: Bloco6, 7: Bloco7, 8: Bloco8 };

export default function FormColaboradores({ token, projetoId, totalColaboradores }) {
  const { dados, atualizar, inicializado, limparStorage } = useFormPersistence('colaboradores', token);
  const [blocoAtual, setBlocoAtual] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erros, setErros] = useState({});
  const [erroEnvio, setErroEnvio] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [blocoAtual]);

  if (!inicializado) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando…</div>;
  }

  const ComponenteBloco = COMPONENTES[blocoAtual];
  const totalBlocos = BLOCOS.length;
  const ehUltimo = blocoAtual === totalBlocos;

  const avancar = () => { if (blocoAtual < totalBlocos) setBlocoAtual(b => b + 1); };
  const voltar  = () => { if (blocoAtual > 1) setBlocoAtual(b => b - 1); };

  const navegarParaErro = (erros) => {
    const primeiro = Object.keys(erros)[0];
    if (!primeiro) return;
    for (let i = 1; i <= 8; i++) {
      if (primeiro.startsWith(`b${i}_`)) { setBlocoAtual(i); return; }
    }
  };

  async function submeter() {
    setErroEnvio('');
    setEnviando(true);
    setErros({});

    try {
      const validacao = validarFormulario(dados);
      if (!validacao.valido) {
        setErros(validacao.erros);
        setEnviando(false);
        navegarParaErro(validacao.erros);
        alert('Existem campos obrigatórios pendentes. Revise o bloco destacado.');
        return;
      }

      const payload = construirPayload(dados, projetoId, token);
      const res = await fetch('/api/formularios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erro ao enviar');
      }
      limparStorage();
      setEnviado(true);
    } catch (err) {
      setErroEnvio(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div style={encerramento}>
        <h1 style={{ marginBottom: '1rem' }}>Obrigada pela sua voz 🙏</h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          Sua contribuição é essencial para construirmos juntos uma empresa mais coerente e mais humana.
        </p>
        <div style={proximos}>
          <h3 style={{ marginTop: 0, color: 'var(--accent-blue, #6BA3FF)' }}>O que acontece agora:</h3>
          <p style={{ lineHeight: 1.7, fontSize: '0.95rem' }}>
            Suas respostas serão analisadas junto com as dos seus colegas, de forma coletiva.
            Os achados orientarão decisões reais sobre cultura, liderança e marca.
          </p>
          <p style={{ lineHeight: 1.7, fontSize: '0.95rem', margin: '0.6rem 0 0 0' }}>
            Se você aceitou participar da entrevista confidencial, entraremos em contato nas próximas semanas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={wrapper}>
      <header style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
        <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.6rem' }}>Pesquisa Interna</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic' }}>
          Sua voz na construção da nossa marca e cultura
        </p>
      </header>

      {blocoAtual === 1 && (
        <div style={intro}>
          <p style={{ margin: 0, fontSize: '1.02rem', fontWeight: 600 }}>
            🔒 Esta pesquisa é <strong>100% anônima e confidencial</strong>.
          </p>
          <details style={{ marginTop: '0.7rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 500, padding: '0.2rem 0', fontSize: '0.9rem' }}>
              O que isso significa, na prática
            </summary>
            <ul style={{ paddingLeft: '1.1rem', margin: '0.5rem 0', lineHeight: 1.6, fontSize: '0.9rem' }}>
              <li>Suas respostas são gravadas <strong>sem</strong> associação ao seu nome, e-mail ou qualquer dado que te identifique.</li>
              <li>A análise é feita de forma coletiva. Ninguém — nem a liderança, nem a consultoria — verá respostas individuais.</li>
              <li>No final, você pode <strong>voluntariamente</strong> nos dar seu contato para uma conversa em profundidade. Isso é opcional e fica em área separada — não se cruza com suas respostas.</li>
              <li>Tempo de preenchimento: 8 a 12 minutos.</li>
            </ul>
          </details>
          <p style={{ marginTop: '0.8rem', marginBottom: 0, fontSize: '0.92rem' }}>
            <strong>Como responder:</strong> seja honesto(a). Elogios, críticas e sugestões são todos bem-vindos.
            Não existe resposta certa ou errada.
          </p>
        </div>
      )}

      <BarraProgresso partes={BLOCOS} parteAtual={blocoAtual} onClickParte={setBlocoAtual} />

      <div style={{ margin: '2rem 0' }}>
        <ComponenteBloco
          dados={dados}
          atualizar={atualizar}
          erros={erros}
          totalColaboradores={totalColaboradores}
        />
      </div>

      {erroEnvio && (
        <p style={{ color: 'var(--brand-red, #dc2626)', background: 'rgba(239,68,68,0.08)', padding: '0.7rem 0.9rem', borderRadius: 8, fontSize: '0.9rem' }}>
          Erro ao enviar: {erroEnvio}
          <br/>
          <small>Seus dados estão salvos neste dispositivo. Tente novamente em alguns instantes.</small>
        </p>
      )}

      <div style={nav}>
        {blocoAtual > 1 && (
          <button type="button" onClick={voltar} disabled={enviando} style={btnSecondary}>
            ← Voltar
          </button>
        )}
        <div style={{ flex: 1 }} />
        {!ehUltimo && (
          <button type="button" onClick={avancar} disabled={enviando} className="btn-primary" style={{ padding: '0.7rem 1.4rem' }}>
            Avançar →
          </button>
        )}
        {ehUltimo && (
          <button type="button" onClick={submeter} disabled={enviando} className="btn-primary" style={{ padding: '0.7rem 1.4rem' }}>
            {enviando ? 'Enviando…' : 'Enviar respostas'}
          </button>
        )}
      </div>
    </div>
  );
}

const wrapper = { maxWidth: 760, margin: '0 auto', padding: '1.75rem 1.25rem', color: 'var(--text-primary)' };
const intro   = { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '1rem 1.25rem', borderRadius: 10, marginBottom: '1.25rem' };
const nav     = { display: 'flex', gap: '0.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', alignItems: 'center' };
const btnSecondary = {
  background: 'transparent', border: '1px solid var(--glass-border)',
  color: 'var(--text-secondary)', padding: '0.7rem 1.2rem',
  borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
};
const encerramento = { maxWidth: 640, margin: '4rem auto', padding: '2rem', textAlign: 'center', color: 'var(--text-primary)' };
const proximos = {
  textAlign: 'left', marginTop: '2rem', padding: '1.5rem',
  background: 'rgba(107,163,255,0.06)', border: '1px solid rgba(107,163,255,0.25)', borderRadius: 10,
};
