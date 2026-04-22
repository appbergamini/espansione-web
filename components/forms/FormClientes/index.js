import { useState, useEffect } from 'react';
import { useFormPersistence } from '../../../lib/forms/useFormPersistence';
import { SECOES, validarFormulario, construirPayload } from '../../../lib/forms/clientes_v2_schema';
import BarraProgresso from '../shared/BarraProgresso';
import Secao1 from './Secao1_Perfil';
import Secao2 from './Secao2_ComportamentoEscolha';
import Secao3 from './Secao3_JornadaAtendimento';
import Secao4 from './Secao4_ExperienciaValor';
import Secao5 from './Secao5_PersonalidadeMarca';
import Secao6 from './Secao6_FuturoRecomendacao';
import Secao7 from './Secao7_OptInEntrevista';

const COMPONENTES = { 1: Secao1, 2: Secao2, 3: Secao3, 4: Secao4, 5: Secao5, 6: Secao6, 7: Secao7 };

export default function FormClientes({ token, respondente, projetoMeta }) {
  const { dados, atualizar, inicializado, limparStorage } = useFormPersistence('clientes', token);
  const [secaoAtual, setSecaoAtual] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erros, setErros] = useState({});
  const [erroEnvio, setErroEnvio] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [secaoAtual]);

  // Pré-preenche nome completo com dado do respondente
  useEffect(() => {
    if (inicializado && !dados.s1_nome_completo && respondente?.nome) {
      atualizar('s1_nome_completo', respondente.nome);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inicializado, respondente]);

  if (!inicializado) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando…</div>;
  }

  const ComponenteSecao = COMPONENTES[secaoAtual];
  const totalSecoes = SECOES.length;
  const ehUltima = secaoAtual === totalSecoes;

  const avancar = () => { if (secaoAtual < totalSecoes) setSecaoAtual(s => s + 1); };
  const voltar  = () => { if (secaoAtual > 1) setSecaoAtual(s => s - 1); };

  const navegarParaErro = (erros) => {
    const primeiro = Object.keys(erros)[0];
    if (!primeiro) return;
    for (let i = 1; i <= 7; i++) {
      if (primeiro.startsWith(`s${i}_`) || primeiro === `_s${i}_completude` || primeiro === 's3_atendimento') {
        setSecaoAtual(i);
        return;
      }
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
        alert('Existem campos obrigatórios pendentes. Revise a seção destacada.');
        return;
      }

      const payload = construirPayload(dados, respondente.projeto_id, token, respondente.id);
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
        <h1 style={{ marginBottom: '1rem' }}>Obrigada pelo tempo e pela honestidade 🙏</h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          Sua voz é parte essencial da construção que estamos fazendo. Se você aceitou participar da entrevista,
          entraremos em contato nas próximas semanas para agendar.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '2rem' }}>
          Seus dados serão utilizados exclusivamente para o desenvolvimento deste projeto e não serão partilhados com terceiros.
        </p>
      </div>
    );
  }

  const marca = projetoMeta?.nome_marca || 'a marca';

  return (
    <div style={wrapper}>
      <header style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
        <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.6rem' }}>Pesquisa de Percepção — {marca}</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic' }}>
          Sua voz nos ajuda a evoluir
        </p>
      </header>

      {secaoAtual === 1 && (
        <div style={intro}>
          <p style={{ margin: '0 0 0.6rem 0' }}>
            Obrigada por dedicar alguns minutos para nos ajudar a construir uma marca mais coerente
            e uma experiência cada vez melhor. A pesquisa leva de <strong>10 a 15 minutos</strong>.
          </p>
          <p style={{ margin: 0 }}>
            <strong>O que fazemos com suas respostas:</strong> elas alimentam um processo de reposicionamento
            estratégico da marca. Seus dados são confidenciais e usados exclusivamente para esse fim.
            Se em algum momento preferir não responder uma pergunta, pule — sua voz no que responder já será valiosa.
          </p>
        </div>
      )}

      <BarraProgresso partes={SECOES} parteAtual={secaoAtual} onClickParte={setSecaoAtual} />

      <div style={{ margin: '2rem 0' }}>
        <ComponenteSecao dados={dados} atualizar={atualizar} erros={erros} projetoMeta={projetoMeta} />
      </div>

      {erroEnvio && (
        <p style={{ color: 'var(--brand-red, #dc2626)', background: 'rgba(239,68,68,0.08)', padding: '0.7rem 0.9rem', borderRadius: 8, fontSize: '0.9rem' }}>
          Erro ao enviar: {erroEnvio}
          <br/>
          <small>Seus dados estão salvos neste dispositivo. Tente novamente em alguns instantes.</small>
        </p>
      )}

      <div style={nav}>
        {secaoAtual > 1 && (
          <button type="button" onClick={voltar} disabled={enviando} style={btnSecondary}>
            ← Voltar
          </button>
        )}
        <div style={{ flex: 1 }} />
        {!ehUltima && (
          <button type="button" onClick={avancar} disabled={enviando} className="btn-primary" style={{ padding: '0.7rem 1.4rem' }}>
            Avançar →
          </button>
        )}
        {ehUltima && (
          <button type="button" onClick={submeter} disabled={enviando} className="btn-primary" style={{ padding: '0.7rem 1.4rem' }}>
            {enviando ? 'Enviando…' : 'Enviar respostas'}
          </button>
        )}
      </div>
    </div>
  );
}

const wrapper = { maxWidth: 760, margin: '0 auto', padding: '1.75rem 1.25rem', color: 'var(--text-primary)' };
const intro = { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '1rem 1.25rem', borderRadius: 10, marginBottom: '1.25rem' };
const nav = { display: 'flex', gap: '0.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', alignItems: 'center' };
const btnSecondary = {
  background: 'transparent', border: '1px solid var(--glass-border)',
  color: 'var(--text-secondary)', padding: '0.7rem 1.2rem',
  borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
};
const encerramento = { maxWidth: 640, margin: '4rem auto', padding: '2rem', textAlign: 'center', color: 'var(--text-primary)' };
