import { useState, useEffect } from 'react';
import { useFormPersistence } from '../../../lib/forms/useFormPersistence';
import { PARTES, validarFormulario, construirPayload } from '../../../lib/forms/socios_v4_schema';
import BarraProgresso from '../shared/BarraProgresso';
import Parte1 from './Parte1_Identificacao';
import Parte2 from './Parte2_EmpresaMarca';
import Parte3 from './Parte3_PropositoEssencia';
import Parte4 from './Parte4_MarcaEmpregadora';
import Parte5 from './Parte5_VisaoFuturo';
import Parte6 from './Parte6_Diagnostico360';

const COMPONENTES_PARTE = { 1: Parte1, 2: Parte2, 3: Parte3, 4: Parte4, 5: Parte5, 6: Parte6 };

export default function FormSocios({ token, respondente }) {
  const { dados, atualizar, inicializado, limparStorage } = useFormPersistence('socios', token);
  const [parteAtual, setParteAtual] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erros, setErros] = useState({});
  const [erroEnvio, setErroEnvio] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [parteAtual]);

  if (!inicializado) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando…</div>;
  }

  const ComponenteParte = COMPONENTES_PARTE[parteAtual];
  const totalPartes = PARTES.length;
  const ehUltimaParte = parteAtual === totalPartes;

  const avancar = () => { if (parteAtual < totalPartes) setParteAtual(p => p + 1); };
  const voltar  = () => { if (parteAtual > 1) setParteAtual(p => p - 1); };

  const navegarParaPrimeiroErro = (erros) => {
    const primeiro = Object.keys(erros)[0];
    if (!primeiro) return;
    if (primeiro.startsWith('p1_')) setParteAtual(1);
    else if (primeiro.startsWith('p2_')) setParteAtual(2);
    else if (primeiro.startsWith('p3_')) setParteAtual(3);
    else if (primeiro.startsWith('p4_')) setParteAtual(4);
    else if (primeiro.startsWith('p5_')) setParteAtual(5);
    else if (primeiro.startsWith('parte6_') || primeiro === '_p6_completude') setParteAtual(6);
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
        navegarParaPrimeiroErro(validacao.erros);
        alert('Existem campos obrigatórios pendentes. Revise a seção destacada.');
        return;
      }

      const payload = construirPayload(dados, respondente.projeto_id, token);
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
      <div style={encerramentoWrapper}>
        <h1 style={{ marginBottom: '1rem' }}>Obrigada pela dedicação 🙏</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
          Este levantamento é a base de todo o processo estratégico que se inicia agora.
        </p>
        <div style={proximosPassos}>
          <h3 style={{ marginTop: 0, color: 'var(--accent-blue, #6BA3FF)' }}>O que acontece a partir daqui:</h3>
          <ul style={{ lineHeight: 1.7, fontSize: '0.95rem' }}>
            <li>Cruzamento das suas respostas com a escuta interna (colaboradores) e externa (clientes).</li>
            <li>Leitura integrada de forças, fragilidades, oportunidades e tensões.</li>
            <li>Construção da plataforma de marca: propósito, posicionamento, essência, narrativa e voz.</li>
            <li>Desenho das jornadas do cliente e da experiência do colaborador.</li>
            <li>Plano de ativação interna e externa da marca.</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div style={wrapper}>
      <header style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
        <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.6rem' }}>Levantamento Inicial — Branding e Negócios</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic' }}>
          Visão do Empresário + Diagnóstico 360° do Negócio
        </p>
        {respondente?.nome && (
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Respondendo como: <strong>{respondente.nome}</strong>
          </p>
        )}
      </header>

      <BarraProgresso partes={PARTES} parteAtual={parteAtual} onClickParte={setParteAtual} />

      {parteAtual === 1 && (
        <details style={intro}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '0.25rem 0' }}>Como responder</summary>
          <ul style={{ lineHeight: 1.7, fontSize: '0.9rem' }}>
            <li>Reserve um momento tranquilo. Respostas no automático geram estratégias genéricas.</li>
            <li>Não existe resposta certa. O objetivo é mapear a realidade como ela é.</li>
            <li>Se não souber, escreva isso. &ldquo;Não sei&rdquo; também é dado estratégico.</li>
            <li>Você pode salvar e continuar depois (o progresso fica neste navegador).</li>
          </ul>
          <p style={{ fontSize: '0.9rem' }}><strong>Tempo estimado:</strong> 60 a 90 minutos no total, divididos em 6 etapas.</p>
        </details>
      )}

      <div style={{ margin: '2rem 0' }}>
        <ComponenteParte dados={dados} atualizar={atualizar} erros={erros} />
      </div>

      {erroEnvio && (
        <p style={{ color: 'var(--brand-red, #dc2626)', background: 'rgba(239,68,68,0.08)', padding: '0.7rem 0.9rem', borderRadius: 8, fontSize: '0.9rem' }}>
          Erro ao enviar: {erroEnvio}<br/>
          <small>Seus dados estão salvos neste dispositivo. Tente novamente em alguns instantes.</small>
        </p>
      )}

      <div style={navWrapper}>
        {parteAtual > 1 && (
          <button
            type="button"
            onClick={voltar}
            disabled={enviando}
            style={btnSecondary}
          >
            ← Voltar
          </button>
        )}
        <div style={{ flex: 1 }} />
        {!ehUltimaParte && (
          <button
            type="button"
            onClick={avancar}
            disabled={enviando}
            className="btn-primary"
            style={{ padding: '0.7rem 1.4rem' }}
          >
            Avançar →
          </button>
        )}
        {ehUltimaParte && (
          <button
            type="button"
            onClick={submeter}
            disabled={enviando}
            className="btn-primary"
            style={{ padding: '0.7rem 1.4rem' }}
          >
            {enviando ? 'Enviando…' : 'Enviar respostas'}
          </button>
        )}
      </div>
    </div>
  );
}

const wrapper = {
  maxWidth: 820,
  margin: '0 auto',
  padding: '1.75rem 1.25rem',
  color: 'var(--text-primary)',
};

const intro = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--glass-border)',
  padding: '1rem 1.25rem',
  borderRadius: 10,
  marginTop: '0.25rem',
};

const navWrapper = {
  display: 'flex',
  gap: '0.75rem',
  paddingTop: '1.5rem',
  borderTop: '1px solid var(--glass-border)',
  alignItems: 'center',
};

const btnSecondary = {
  background: 'transparent',
  border: '1px solid var(--glass-border)',
  color: 'var(--text-secondary)',
  padding: '0.7rem 1.2rem',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 600,
};

const encerramentoWrapper = {
  maxWidth: 640,
  margin: '4rem auto',
  padding: '2rem',
  textAlign: 'center',
  color: 'var(--text-primary)',
};

const proximosPassos = {
  textAlign: 'left',
  marginTop: '2rem',
  padding: '1.5rem',
  background: 'rgba(107,163,255,0.06)',
  border: '1px solid rgba(107,163,255,0.25)',
  borderRadius: 10,
};
