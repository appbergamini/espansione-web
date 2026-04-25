// FIX.24 — Curadoria Estratégica do Relatório.
// Tela master/admin que materializa cada output dos 15 agentes em
// "achados curáveis" (analysis_blocks). Cada bloco separa Fato /
// Interpretação / Recomendação e tem fluxo editorial completo: aprovar,
// editar, excluir do relatório, marcar pra discussão, comentar,
// solicitar reanálise, restaurar versão IA.
//
// Filosofia: "A IA organiza, acelera e sugere. A Espansione valida,
// interpreta e decide o que vira direcionamento estratégico."

import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
import {
  CATEGORIA_LABEL,
  CATEGORIAS_LISTA,
  STATUS_LABEL,
  STATUS_LISTA,
  STATUS_COR,
  getEffectiveField,
} from '../../../lib/curadoria/labels';
import { getAgenteByNum } from '../../../lib/agents/catalog';

export default function CuradoriaPage() {
  const router = useRouter();
  const { id } = router.query;

  const [projeto, setProjeto] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [busca, setBusca] = useState('');
  const [selecionado, setSelecionado] = useState(null); // bloco aberto no painel lateral
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [backfilling, setBackfilling] = useState(false);

  // Auth gate
  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) { router.push('/login'); return; }
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', session.user.id).single();
      if (!active) return;
      if (profile?.role !== 'master' && profile?.role !== 'admin') {
        router.replace('/dashboard');
      }
    })();
    return () => { active = false; };
  }, [router]);

  const loadAll = async () => {
    if (!id) return;
    setLoading(true);
    setErro('');
    try {
      const [pr, bl] = await Promise.all([
        fetch(`/api/projetos/${id}`).then(r => r.json()),
        fetchBlocks(),
      ]);
      if (pr?.success) setProjeto(pr.projeto);
      if (bl?.success) {
        setBlocks(bl.blocks || []);
        setCounts(bl.counts || {});
      } else if (bl?.error) {
        setErro(bl.error);
      }
    } catch (e) {
      setErro('Falha de rede: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async () => {
    const params = new URLSearchParams({ projeto_id: id });
    if (filtroStatus)    params.set('status', filtroStatus);
    if (filtroCategoria) params.set('categoria', filtroCategoria);
    if (busca.trim())    params.set('q', busca.trim());
    const res = await fetch(`/api/analysis-blocks?${params}`);
    return res.json();
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [id]);
  useEffect(() => {
    if (!id) return;
    const t = setTimeout(async () => {
      const bl = await fetchBlocks();
      if (bl?.success) {
        setBlocks(bl.blocks || []);
        setCounts(bl.counts || {});
      }
    }, 200);
    return () => clearTimeout(t);
    /* eslint-disable-next-line */
  }, [filtroStatus, filtroCategoria, busca]);

  const totalIncluidos = counts.incluidos || 0;
  const totalPendentes = counts.pendente_revisao || 0;
  const podeGerarRelatorio = totalIncluidos > 0;

  const handleBackfill = async () => {
    if (!confirm('Materializar blocos de curadoria a partir dos outputs já existentes? (Idempotente — não duplica)')) return;
    setBackfilling(true);
    try {
      const res = await fetch('/api/curadoria/backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projeto_id: id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      alert(`✓ ${json.totalInserted} bloco(s) materializado(s) a partir de ${json.totalOutputs} output(s).`);
      await loadAll();
    } catch (e) {
      alert('Erro ao materializar: ' + e.message);
    } finally {
      setBackfilling(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#fff' }}>Carregando curadoria…</div>;

  return (
    <>
      <Head><title>Espansione | Curadoria Estratégica</title></Head>
      <div className="page-container">
        <main className="container">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Link href={`/adm/${id}`}>
              <span style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.9rem' }}>&larr; Voltar ao projeto</span>
            </Link>
            <button
              onClick={() => setShowFinalModal(true)}
              disabled={!podeGerarRelatorio}
              className="btn-primary"
              style={{ padding: '0.6rem 1.2rem', opacity: podeGerarRelatorio ? 1 : 0.5, cursor: podeGerarRelatorio ? 'pointer' : 'not-allowed' }}
            >
              Gerar Relatório Final →
            </button>
          </div>

          {/* Título + projeto */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
              Curadoria Estratégica · {projeto?.cliente || projeto?.nome || ''}
            </p>
            <h1 style={{ fontSize: '1.6rem', margin: '0.4rem 0 0.6rem', color: '#fff' }}>
              Hipóteses, achados e recomendações para validação
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '760px', margin: 0 }}>
              A IA organiza, acelera e sugere. A Espansione valida, interpreta e decide o que vira direcionamento estratégico no relatório final.
            </p>
          </div>

          {/* Métricas */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <Metric label="Total" value={counts.total || 0} />
            <Metric label="Aguardando" value={totalPendentes} cor={STATUS_COR.pendente_revisao} />
            <Metric label="Aprovados" value={counts.aprovado || 0} cor={STATUS_COR.aprovado} />
            <Metric label="Editados" value={counts.editado || 0} cor={STATUS_COR.editado} />
            <Metric label="Em discussão" value={counts.levar_discussao || 0} cor={STATUS_COR.levar_discussao} />
            <Metric label="Excluídos" value={counts.excluido || 0} cor={STATUS_COR.excluido} />
            <Metric label="No relatório" value={totalIncluidos} cor={STATUS_COR.aprovado} />
          </div>

          {/* Backfill quando vazio */}
          {(counts.total || 0) === 0 && (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>Nenhum bloco de curadoria ainda</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Materializa os achados a partir dos outputs já gerados pelos agentes (parser heurístico para outputs antigos, findings_json para novos).
              </p>
              <button onClick={handleBackfill} disabled={backfilling} className="btn-primary" style={{ padding: '0.7rem 1.4rem' }}>
                {backfilling ? 'Materializando…' : 'Materializar a partir de outputs existentes'}
              </button>
            </div>
          )}

          {/* Filtros */}
          {(counts.total || 0) > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Buscar por palavra-chave…"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="form-input"
                style={{ flex: '1 1 220px', minWidth: '220px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', margin: 0 }}
              />
              <select
                className="form-input"
                value={filtroStatus}
                onChange={e => setFiltroStatus(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', margin: 0 }}
              >
                <option value="">Todos os status</option>
                {STATUS_LISTA.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
              <select
                className="form-input"
                value={filtroCategoria}
                onChange={e => setFiltroCategoria(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', margin: 0 }}
              >
                <option value="">Todas as categorias</option>
                {CATEGORIAS_LISTA.map(c => <option key={c} value={c}>{CATEGORIA_LABEL[c]}</option>)}
              </select>
              <button
                onClick={handleBackfill}
                disabled={backfilling}
                title="Re-executa o parser sobre outputs existentes (idempotente)"
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)', padding: '0.45rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                {backfilling ? 'Sincronizando…' : '↻ Sincronizar'}
              </button>
            </div>
          )}

          {/* Erro */}
          {erro && (
            <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--brand-red)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              {erro}
            </div>
          )}

          {/* Lista de cards */}
          {blocks.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
              {blocks.map(b => (
                <BlockCard key={b.id} block={b} onClick={() => setSelecionado(b)} />
              ))}
            </div>
          ) : (counts.total || 0) > 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Nenhum bloco encontrado com os filtros atuais.
            </div>
          ) : null}
        </main>
      </div>

      {/* Painel de edição */}
      {selecionado && (
        <BlockEditor
          block={selecionado}
          onClose={() => setSelecionado(null)}
          onChange={async () => {
            const bl = await fetchBlocks();
            if (bl?.success) {
              setBlocks(bl.blocks || []);
              setCounts(bl.counts || {});
              const novo = (bl.blocks || []).find(x => x.id === selecionado.id);
              if (novo) setSelecionado(novo);
            }
          }}
        />
      )}

      {/* Modal Gerar Relatório Final */}
      {showFinalModal && (
        <FinalModal
          counts={counts}
          onCancel={() => setShowFinalModal(false)}
          onConfirm={() => {
            setShowFinalModal(false);
            router.push(`/adm/${id}/deliverable`);
          }}
        />
      )}
    </>
  );
}

// ────────────── Subcomponentes ──────────────

function Metric({ label, value, cor }) {
  const fg = cor?.fg || 'var(--text-primary)';
  const bg = cor?.bg || 'rgba(255,255,255,0.03)';
  return (
    <div style={{ background: bg, border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.6rem 0.9rem', minWidth: '110px' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: fg, marginTop: '0.15rem' }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cor = STATUS_COR[status] || { fg: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
  return (
    <span style={{ background: cor.bg, color: cor.fg, fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '6px', letterSpacing: '0.04em' }}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function ConfiancaPill({ confianca }) {
  if (!confianca) return null;
  const c = String(confianca).toLowerCase();
  const cor = c.startsWith('alta') ? '#10b981' : c.startsWith('med') ? '#f59e0b' : '#ef4444';
  return (
    <span style={{ fontSize: '0.65rem', color: cor, border: `1px solid ${cor}40`, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
      Confiança {confianca}
    </span>
  );
}

function BlockCard({ block, onClick }) {
  const titulo = getEffectiveField(block, 'titulo');
  const evidencia = getEffectiveField(block, 'evidencia');
  const meta = getAgenteByNum(block.agent_num);

  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '1rem',
        cursor: 'pointer',
        color: 'inherit',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(107,163,255,0.4)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <StatusBadge status={block.status} />
        {block.incluir_no_relatorio && (
          <span title="Incluído no relatório final" style={{ fontSize: '0.85rem' }}>📌</span>
        )}
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
        {CATEGORIA_LABEL[block.categoria] || block.categoria} · A{String(block.agent_num).padStart(2,'0')}{meta?.nome_curto ? '' : ''}
      </div>
      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem', lineHeight: 1.3 }}>
        {titulo}
      </div>
      {evidencia && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {evidencia}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        <ConfiancaPill confianca={block.ai_confianca} />
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Abrir →</span>
      </div>
    </button>
  );
}

// ────────────── Painel de edição (modal lateral) ──────────────
function BlockEditor({ block, onClose, onChange }) {
  const [titulo, setTitulo] = useState(getEffectiveField(block, 'titulo') || '');
  const [evidencia, setEvidencia] = useState(getEffectiveField(block, 'evidencia') || '');
  const [interpretacao, setInterpretacao] = useState(getEffectiveField(block, 'interpretacao') || '');
  const [recomendacao, setRecomendacao] = useState(getEffectiveField(block, 'recomendacao') || '');
  const [notasInternas, setNotasInternas] = useState(block.notas_internas || '');
  const [novoComentario, setNovoComentario] = useState('');
  const [comentarios, setComentarios] = useState([]);
  const [versoes, setVersoes] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [acaoAtiva, setAcaoAtiva] = useState('');

  useEffect(() => {
    setTitulo(getEffectiveField(block, 'titulo') || '');
    setEvidencia(getEffectiveField(block, 'evidencia') || '');
    setInterpretacao(getEffectiveField(block, 'interpretacao') || '');
    setRecomendacao(getEffectiveField(block, 'recomendacao') || '');
    setNotasInternas(block.notas_internas || '');
    fetch(`/api/analysis-blocks/${block.id}`).then(r => r.json()).then(json => {
      if (json?.success) {
        setComentarios(json.comentarios || []);
        setVersoes(json.versoes || []);
      }
    });
  }, [block.id]);

  const patch = async (body) => {
    const res = await fetch(`/api/analysis-blocks/${block.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.block;
  };

  const salvarEdicao = async () => {
    setSalvando(true);
    try {
      await patch({
        edited_titulo: titulo !== block.ai_evidencia ? titulo : null,
        edited_evidencia: evidencia,
        edited_interpretacao: interpretacao,
        edited_recomendacao: recomendacao,
        notas_internas: notasInternas,
      });
      await onChange();
    } catch (e) {
      alert('Erro: ' + e.message);
    } finally {
      setSalvando(false);
    }
  };

  const mudarStatus = async (status, incluir = null) => {
    setAcaoAtiva(status);
    try {
      const body = { status };
      if (incluir !== null) body.incluir_no_relatorio = incluir;
      await patch(body);
      await onChange();
    } catch (e) {
      alert('Erro: ' + e.message);
    } finally {
      setAcaoAtiva('');
    }
  };

  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;
    try {
      const res = await fetch(`/api/analysis-blocks/${block.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comentario: novoComentario.trim() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setComentarios([...comentarios, json.comentario]);
      setNovoComentario('');
    } catch (e) {
      alert('Erro: ' + e.message);
    }
  };

  const restaurar = async () => {
    if (!confirm('Restaurar a versão original da IA? Suas edições atuais serão preservadas no histórico.')) return;
    try {
      const res = await fetch(`/api/analysis-blocks/${block.id}/restore`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      await onChange();
    } catch (e) {
      alert('Erro: ' + e.message);
    }
  };

  const reanalisar = async () => {
    if (!confirm('Marcar para reanálise? O agente que originou este bloco precisará ser re-executado para regenerar.')) return;
    try {
      const res = await fetch(`/api/analysis-blocks/${block.id}/regenerate`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      await onChange();
    } catch (e) {
      alert('Erro: ' + e.message);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
      <aside style={{ position: 'relative', width: '760px', maxWidth: '95vw', height: '100vh', overflowY: 'auto', background: 'var(--bg-secondary, #0a1122)', borderLeft: '1px solid rgba(255,255,255,0.08)', padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Topo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              {CATEGORIA_LABEL[block.categoria]} · A{String(block.agent_num).padStart(2,'0')}
            </p>
            <input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Título do achado"
              className="form-input"
              style={{ marginTop: '0.4rem', fontSize: '1.1rem', fontWeight: 600 }}
            />
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)', padding: '0.4rem 0.7rem', cursor: 'pointer', fontSize: '0.85rem' }}>Fechar</button>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <StatusBadge status={block.status} />
          <ConfiancaPill confianca={block.ai_confianca} />
          {block.incluir_no_relatorio && <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)' }}>📌 No relatório</span>}
        </div>

        {/* Camadas separadas: Fato | Interpretação | Recomendação */}
        <CamadaEdit
          label="Fato / Evidência"
          subtitle="O que se observa nos dados — citação literal, número, padrão repetido. Sem interpretar aqui."
          value={evidencia}
          onChange={setEvidencia}
          aiOriginal={block.ai_evidencia}
        />
        <CamadaEdit
          label="Interpretação sugerida"
          subtitle="O que esse fato sugere estrategicamente. Hipótese, não verdade."
          value={interpretacao}
          onChange={setInterpretacao}
          aiOriginal={block.ai_interpretacao}
        />
        <CamadaEdit
          label="Recomendação sugerida"
          subtitle="Ação concreta que o achado pede."
          value={recomendacao}
          onChange={setRecomendacao}
          aiOriginal={block.ai_recomendacao}
        />

        {/* Notas internas */}
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Notas internas (bastidor)</label>
          <textarea
            value={notasInternas}
            onChange={e => setNotasInternas(e.target.value)}
            rows={2}
            className="form-input"
            style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}
            placeholder="Visível só pra equipe Espansione, nunca aparece no relatório."
          />
        </div>

        {/* Salvar */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={salvarEdicao} disabled={salvando} className="btn-primary" style={{ padding: '0.55rem 1rem' }}>
            {salvando ? 'Salvando…' : 'Salvar edição'}
          </button>
          <button onClick={restaurar} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)', padding: '0.5rem 0.9rem', fontSize: '0.85rem', cursor: 'pointer' }}>
            ↺ Restaurar IA
          </button>
        </div>

        {/* Ações editoriais */}
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>Status editorial</p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <AcaoBtn ativo={block.status === 'aprovado'} onClick={() => mudarStatus('aprovado', true)} corFg="#10b981">✓ Aprovar</AcaoBtn>
            <AcaoBtn ativo={block.status === 'levar_discussao'} onClick={() => mudarStatus('levar_discussao')} corFg="#ec4899">💬 Levar pra discussão</AcaoBtn>
            <AcaoBtn ativo={block.status === 'somente_bastidor'} onClick={() => mudarStatus('somente_bastidor', false)} corFg="#a78bfa">Somente bastidor</AcaoBtn>
            <AcaoBtn ativo={block.status === 'excluido'} onClick={() => mudarStatus('excluido', false)} corFg="#94a3b8">✗ Excluir do relatório</AcaoBtn>
            <AcaoBtn ativo={block.status === 'validado_cliente'} onClick={() => mudarStatus('validado_cliente', true)} corFg="#22c55e">Validado com cliente</AcaoBtn>
            <AcaoBtn ativo={block.status === 'reanalise_solicitada'} onClick={reanalisar} corFg="#fb7185">⟳ Solicitar reanálise</AcaoBtn>
          </div>
        </div>

        {/* Comentários */}
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>Comentários ({comentarios.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {comentarios.map(c => (
              <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  {c.autor_tipo === 'consultor' ? 'Consultor' : 'Cliente'} · {new Date(c.created_at).toLocaleString('pt-BR')}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#fff', whiteSpace: 'pre-wrap' }}>{c.comentario}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              value={novoComentario}
              onChange={e => setNovoComentario(e.target.value)}
              placeholder="Comentário interno…"
              className="form-input"
              style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarComentario(); } }}
            />
            <button onClick={enviarComentario} className="btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>Comentar</button>
          </div>
        </div>

        {/* Histórico de versões */}
        {versoes.length > 0 && (
          <details>
            <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Histórico de versões ({versoes.length})</summary>
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {versoes.map(v => (
                <div key={v.id}>
                  <strong>{v.tipo}</strong> · {new Date(v.created_at).toLocaleString('pt-BR')}
                </div>
              ))}
            </div>
          </details>
        )}
      </aside>
    </div>
  );
}

function CamadaEdit({ label, subtitle, value, onChange, aiOriginal }) {
  const editado = aiOriginal && value && aiOriginal !== value;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{label}</label>
        {editado && <span style={{ fontSize: '0.65rem', color: 'var(--accent-blue)' }}>editado</span>}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0.4rem' }}>{subtitle}</p>
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        rows={3}
        className="form-input"
        style={{ fontSize: '0.85rem' }}
      />
    </div>
  );
}

function AcaoBtn({ children, onClick, ativo, corFg }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: ativo ? `${corFg}22` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${ativo ? corFg : 'rgba(255,255,255,0.08)'}`,
        color: ativo ? corFg : 'var(--text-secondary)',
        borderRadius: '8px',
        padding: '0.45rem 0.85rem',
        fontSize: '0.8rem',
        cursor: 'pointer',
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

// ────────────── Modal "Gerar Relatório Final" ──────────────
function FinalModal({ counts, onCancel, onConfirm }) {
  const aprovados = counts.aprovado || 0;
  const validados = counts.validado_cliente || 0;
  const editados  = counts.editado || 0;
  const excluidos = counts.excluido || 0;
  const pendentes = counts.pendente_revisao || 0;
  const incluidos = counts.incluidos || 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
      <div style={{ position: 'relative', background: 'var(--bg-secondary, #0a1122)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '90%' }}>
        <h3 style={{ color: 'var(--accent-blue)', marginBottom: '0.75rem' }}>Gerar Relatório Final</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Você está prestes a gerar o relatório final com:
        </p>
        <ul style={{ color: '#fff', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1rem' }}>
          <li><strong>{incluidos}</strong> blocos incluídos no relatório</li>
          <li>{aprovados} aprovados, {editados} editados, {validados} validados com cliente</li>
          <li>{excluidos} excluídos / somente bastidor</li>
          <li style={{ color: pendentes > 0 ? '#f59e0b' : 'inherit' }}>
            <strong>{pendentes}</strong> pendentes de revisão {pendentes > 0 && '⚠ não entram no relatório'}
          </li>
        </ul>
        {pendentes > 0 && (
          <p style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '8px', padding: '0.65rem 0.85rem', fontSize: '0.8rem', color: '#f59e0b', marginBottom: '1rem' }}>
            Há blocos aguardando validação. Eles ficarão de fora do relatório se você continuar.
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)', padding: '0.55rem 1rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            Voltar para revisar
          </button>
          <button onClick={onConfirm} className="btn-primary" style={{ padding: '0.55rem 1.2rem' }}>
            Continuar e gerar
          </button>
        </div>
      </div>
    </div>
  );
}
