// FIX.24 / FIX.25 — Curadoria Estratégica do Relatório.
// FIX.25: simplificação da UX. Removido o painel lateral grande;
// tudo inline na lista. Cada card mostra título + status + categoria
// + checkbox "Incluir no relatório" + botão Aprovar + botão Editar.
// Click no card expande pra ver as 3 camadas (Fato/Interpretação/
// Recomendação) em texto read-only. Click em Editar troca cada camada
// por textarea inline. Ações secundárias (comentar, reanalisar,
// restaurar IA, histórico) ficam num "Mais opções" colapsado.
//
// Filosofia: "A IA organiza, acelera e sugere. A Espansione valida,
// interpreta e decide o que vira direcionamento estratégico."

import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../../../lib/supabaseClient';
import {
  CATEGORIA_LABEL,
  CATEGORIAS_LISTA,
  STATUS_LABEL,
  STATUS_LISTA,
  STATUS_COR,
  getEffectiveField,
} from '../../../lib/curadoria/labels';

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

  const fetchBlocks = async () => {
    const params = new URLSearchParams({ projeto_id: id });
    if (filtroStatus)    params.set('status', filtroStatus);
    if (filtroCategoria) params.set('categoria', filtroCategoria);
    if (busca.trim())    params.set('q', busca.trim());
    const res = await fetch(`/api/analysis-blocks?${params}`);
    return res.json();
  };

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

  const refreshBlocks = async () => {
    const bl = await fetchBlocks();
    if (bl?.success) {
      setBlocks(bl.blocks || []);
      setCounts(bl.counts || {});
    }
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [id]);
  useEffect(() => {
    if (!id) return;
    const t = setTimeout(refreshBlocks, 200);
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
              <select className="form-input" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', margin: 0 }}>
                <option value="">Todos os status</option>
                {STATUS_LISTA.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
              <select className="form-input" value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', margin: 0 }}>
                <option value="">Todas as categorias</option>
                {CATEGORIAS_LISTA.map(c => <option key={c} value={c}>{CATEGORIA_LABEL[c]}</option>)}
              </select>
              <button onClick={handleBackfill} disabled={backfilling} title="Re-executa o parser sobre outputs existentes (idempotente)"
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)', padding: '0.45rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                {backfilling ? 'Sincronizando…' : '↻ Sincronizar'}
              </button>
            </div>
          )}

          {erro && (
            <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--brand-red)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              {erro}
            </div>
          )}

          {/* Lista linear de cards */}
          {blocks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {blocks.map(b => (
                <BlockRow key={b.id} block={b} onChange={refreshBlocks} />
              ))}
            </div>
          ) : (counts.total || 0) > 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Nenhum bloco encontrado com os filtros atuais.
            </div>
          ) : null}
        </main>
      </div>

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

// ───────────────────────────── Subcomponentes ─────────────────────────────

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

// ─────────────────────── Card linha (expandível inline) ───────────────────────

function BlockRow({ block, onChange }) {
  const [expandido, setExpandido] = useState(false);
  const [editando, setEditando] = useState(false);

  // Estado de edição local — só usado quando editando=true
  const [titulo, setTitulo] = useState('');
  const [evidencia, setEvidencia] = useState('');
  const [interpretacao, setInterpretacao] = useState('');
  const [recomendacao, setRecomendacao] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Reset estado de edição quando o bloco muda
  useEffect(() => {
    setTitulo(getEffectiveField(block, 'titulo') || '');
    setEvidencia(getEffectiveField(block, 'evidencia') || '');
    setInterpretacao(getEffectiveField(block, 'interpretacao') || '');
    setRecomendacao(getEffectiveField(block, 'recomendacao') || '');
  }, [block.id, block.updated_at]);

  const tituloEfetivo = getEffectiveField(block, 'titulo');
  const evidenciaEfetiva = getEffectiveField(block, 'evidencia');
  const interpretacaoEfetiva = getEffectiveField(block, 'interpretacao');
  const recomendacaoEfetiva = getEffectiveField(block, 'recomendacao');

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

  const handleAprovar = async (e) => {
    e.stopPropagation();
    try {
      await patch({ status: 'aprovado', incluir_no_relatorio: true });
      await onChange();
    } catch (err) { alert('Erro: ' + err.message); }
  };

  const handleToggleIncluir = async (e) => {
    e.stopPropagation();
    try {
      await patch({ incluir_no_relatorio: !block.incluir_no_relatorio });
      await onChange();
    } catch (err) { alert('Erro: ' + err.message); }
  };

  const handleEditarClick = (e) => {
    e.stopPropagation();
    setExpandido(true);
    setEditando(true);
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      await patch({
        edited_titulo: titulo !== block.ai_evidencia ? titulo : null,
        edited_evidencia: evidencia,
        edited_interpretacao: interpretacao,
        edited_recomendacao: recomendacao,
      });
      setEditando(false);
      await onChange();
    } catch (err) {
      alert('Erro: ' + err.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleCancelarEdicao = () => {
    setTitulo(getEffectiveField(block, 'titulo') || '');
    setEvidencia(getEffectiveField(block, 'evidencia') || '');
    setInterpretacao(getEffectiveField(block, 'interpretacao') || '');
    setRecomendacao(getEffectiveField(block, 'recomendacao') || '');
    setEditando(false);
  };

  return (
    <div
      style={{
        background: 'var(--bg-tertiary)',
        border: `1px solid ${block.incluir_no_relatorio ? 'rgba(16,185,129,0.35)' : 'var(--glass-border)'}`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* HEADER (sempre visível, click expande) */}
      <div
        onClick={() => setExpandido(v => !v)}
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gap: '1rem',
          alignItems: 'center',
          padding: '1rem 1.1rem',
          cursor: 'pointer',
        }}
      >
        {/* Checkbox "Incluir no relatório" */}
        <label
          onClick={e => e.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', userSelect: 'none' }}
          title="Incluir este bloco no relatório final"
        >
          <input
            type="checkbox"
            checked={!!block.incluir_no_relatorio}
            onChange={handleToggleIncluir}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
        </label>

        {/* Título + meta */}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
            {CATEGORIA_LABEL[block.categoria] || block.categoria} · A{String(block.agent_num).padStart(2, '0')}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', lineHeight: 1.3, marginBottom: '0.35rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {tituloEfetivo}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <StatusBadge status={block.status} />
            <ConfiancaPill confianca={block.ai_confianca} />
            {block.incluir_no_relatorio && (
              <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>📌 NO RELATÓRIO</span>
            )}
          </div>
        </div>

        {/* Ações rápidas */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <button
            onClick={handleAprovar}
            disabled={block.status === 'aprovado'}
            title="Aprovar e incluir no relatório"
            style={{
              background: block.status === 'aprovado' ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.4)',
              color: '#10b981',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: block.status === 'aprovado' ? 'default' : 'pointer',
            }}
          >
            ✓ {block.status === 'aprovado' ? 'Aprovado' : 'Aprovar'}
          </button>
          <button
            onClick={handleEditarClick}
            title="Editar este bloco"
            style={{
              background: 'rgba(107,163,255,0.1)',
              border: '1px solid rgba(107,163,255,0.4)',
              color: '#6BA3FF',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ✏ Editar
          </button>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', minWidth: '14px' }}>
            {expandido ? '▾' : '▸'}
          </span>
        </div>
      </div>

      {/* CORPO EXPANDIDO */}
      {expandido && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1rem 1.1rem 1.1rem', background: 'rgba(0,0,0,0.15)' }}>
          {!editando ? (
            <>
              <CamadaLeitura label="Fato / Evidência" subtitle="O que se observa nos dados — citação literal, número, padrão repetido." texto={evidenciaEfetiva} editado={!!block.edited_evidencia} />
              <CamadaLeitura label="Interpretação sugerida" subtitle="O que esse fato sugere estrategicamente. Hipótese, não verdade." texto={interpretacaoEfetiva} editado={!!block.edited_interpretacao} />
              <CamadaLeitura label="Recomendação sugerida" subtitle="Ação concreta que o achado pede." texto={recomendacaoEfetiva} editado={!!block.edited_recomendacao} />

              <AcoesSecundarias block={block} onChange={onChange} />
            </>
          ) : (
            <>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Título</label>
                <input value={titulo} onChange={e => setTitulo(e.target.value)} className="form-input" style={{ marginTop: '0.35rem', fontSize: '0.95rem' }} />
              </div>
              <CamadaEdit label="Fato / Evidência" subtitle="O que se observa nos dados — citação literal, número, padrão repetido." value={evidencia} onChange={setEvidencia} />
              <CamadaEdit label="Interpretação sugerida" subtitle="O que esse fato sugere estrategicamente. Hipótese, não verdade." value={interpretacao} onChange={setInterpretacao} />
              <CamadaEdit label="Recomendação sugerida" subtitle="Ação concreta que o achado pede." value={recomendacao} onChange={setRecomendacao} />

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={handleSalvar} disabled={salvando} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  {salvando ? 'Salvando…' : 'Salvar edição'}
                </button>
                <button onClick={handleCancelarEdicao} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)', padding: '0.5rem 0.9rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CamadaLeitura({ label, subtitle, texto, editado }) {
  return (
    <div style={{ marginBottom: '0.9rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.15rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{label}</label>
        {editado && <span style={{ fontSize: '0.65rem', color: 'var(--accent-blue)' }}>editado</span>}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 0.4rem' }}>{subtitle}</p>
      {texto ? (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.55, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.6rem 0.8rem' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{texto}</ReactMarkdown>
        </div>
      ) : (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>— vazio —</div>
      )}
    </div>
  );
}

function CamadaEdit({ label, subtitle, value, onChange }) {
  return (
    <div style={{ marginBottom: '0.9rem' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{label}</label>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0.4rem' }}>{subtitle}</p>
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={4} className="form-input" style={{ fontSize: '0.85rem' }} />
    </div>
  );
}

// ─────────────── Ações secundárias (mais opções, comentários, histórico) ───────────────

function AcoesSecundarias({ block, onChange }) {
  const [aberto, setAberto] = useState(false);
  const [notasInternas, setNotasInternas] = useState(block.notas_internas || '');
  const [novoComentario, setNovoComentario] = useState('');
  const [comentarios, setComentarios] = useState([]);
  const [versoes, setVersoes] = useState([]);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);

  useEffect(() => {
    setNotasInternas(block.notas_internas || '');
  }, [block.id, block.notas_internas]);

  const carregarDetalhes = async () => {
    setLoadingDetalhes(true);
    try {
      const res = await fetch(`/api/analysis-blocks/${block.id}`);
      const json = await res.json();
      if (json?.success) {
        setComentarios(json.comentarios || []);
        setVersoes(json.versoes || []);
      }
    } finally {
      setLoadingDetalhes(false);
    }
  };

  const toggleAberto = async () => {
    if (!aberto && comentarios.length === 0 && versoes.length === 0) {
      await carregarDetalhes();
    }
    setAberto(v => !v);
  };

  const patch = async (body) => {
    const res = await fetch(`/api/analysis-blocks/${block.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.block;
  };

  const mudarStatus = async (status, incluir = null) => {
    try {
      const body = { status };
      if (incluir !== null) body.incluir_no_relatorio = incluir;
      await patch(body);
      await onChange();
    } catch (e) { alert('Erro: ' + e.message); }
  };

  const salvarNotas = async () => {
    try {
      await patch({ notas_internas: notasInternas });
      await onChange();
    } catch (e) { alert('Erro: ' + e.message); }
  };

  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;
    try {
      const res = await fetch(`/api/analysis-blocks/${block.id}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comentario: novoComentario.trim() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setComentarios([...comentarios, json.comentario]);
      setNovoComentario('');
    } catch (e) { alert('Erro: ' + e.message); }
  };

  const restaurar = async () => {
    if (!confirm('Restaurar a versão original da IA? Suas edições atuais serão preservadas no histórico.')) return;
    try {
      const res = await fetch(`/api/analysis-blocks/${block.id}/restore`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      await onChange();
      await carregarDetalhes();
    } catch (e) { alert('Erro: ' + e.message); }
  };

  const reanalisar = async () => {
    if (!confirm('Marcar para reanálise? O agente que originou este bloco precisará ser re-executado para regenerar.')) return;
    try {
      const res = await fetch(`/api/analysis-blocks/${block.id}/regenerate`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      await onChange();
      await carregarDetalhes();
    } catch (e) { alert('Erro: ' + e.message); }
  };

  return (
    <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.6rem' }}>
      <button
        onClick={toggleAberto}
        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
      >
        {aberto ? '▾ Fechar opções avançadas' : '▸ Mais opções (status, notas, comentários, histórico)'}
      </button>

      {aberto && (
        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Status alternativos */}
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>Status alternativos</p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <BtnAcao ativo={block.status === 'levar_discussao'} onClick={() => mudarStatus('levar_discussao')} cor="#ec4899">💬 Levar pra discussão</BtnAcao>
              <BtnAcao ativo={block.status === 'somente_bastidor'} onClick={() => mudarStatus('somente_bastidor', false)} cor="#a78bfa">Somente bastidor</BtnAcao>
              <BtnAcao ativo={block.status === 'excluido'} onClick={() => mudarStatus('excluido', false)} cor="#94a3b8">✗ Excluir</BtnAcao>
              <BtnAcao ativo={block.status === 'validado_cliente'} onClick={() => mudarStatus('validado_cliente', true)} cor="#22c55e">Validado com cliente</BtnAcao>
              <BtnAcao ativo={block.status === 'reanalise_solicitada'} onClick={reanalisar} cor="#fb7185">⟳ Reanálise</BtnAcao>
              <BtnAcao onClick={restaurar} cor="#94a3b8">↺ Restaurar IA</BtnAcao>
            </div>
          </div>

          {/* Notas internas */}
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.3rem' }}>Notas internas (bastidor)</p>
            <textarea
              value={notasInternas}
              onChange={e => setNotasInternas(e.target.value)}
              onBlur={salvarNotas}
              rows={2}
              className="form-input"
              style={{ fontSize: '0.85rem' }}
              placeholder="Visível só pra equipe Espansione, nunca aparece no relatório."
            />
          </div>

          {/* Comentários */}
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.3rem' }}>
              Comentários ({comentarios.length})
            </p>
            {loadingDetalhes && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>carregando…</p>}
            {comentarios.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
                {comentarios.map(c => (
                  <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.45rem 0.7rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                      {c.autor_tipo === 'consultor' ? 'Consultor' : 'Cliente'} · {new Date(c.created_at).toLocaleString('pt-BR')}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#fff', whiteSpace: 'pre-wrap' }}>{c.comentario}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                value={novoComentario}
                onChange={e => setNovoComentario(e.target.value)}
                placeholder="Comentário interno…"
                className="form-input"
                style={{ flex: 1, fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarComentario(); } }}
              />
              <button onClick={enviarComentario} className="btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>Comentar</button>
            </div>
          </div>

          {/* Histórico */}
          {versoes.length > 0 && (
            <details>
              <summary style={{ cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Histórico de versões ({versoes.length})</summary>
              <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {versoes.map(v => (
                  <div key={v.id}><strong>{v.tipo}</strong> · {new Date(v.created_at).toLocaleString('pt-BR')}</div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function BtnAcao({ children, onClick, ativo, cor }) {
  return (
    <button onClick={onClick}
      style={{
        background: ativo ? `${cor}22` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${ativo ? cor : 'rgba(255,255,255,0.08)'}`,
        color: ativo ? cor : 'var(--text-secondary)',
        borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600,
      }}>
      {children}
    </button>
  );
}

// ─────────────── Modal "Gerar Relatório Final" ───────────────

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
