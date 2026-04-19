import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo';
import RespondentesManager from '../../components/RespondentesManager';
import { supabase } from '../../lib/supabaseClient';
const AGENT_NAMES = [
  null,
  "01. Roteiros Internos",
  "02. Contexto Interno",
  "03. Roteiro Cliente",
  "04. Contexto Externo",
  "05. Pesquisa Web",
  "06. Visão Geral",
  "07. Decodificação de Valores",
  "08. Diretrizes Estratégicas",
  "09. Plataforma de Branding",
  "10. Identidade Verbal",
  "11. Identidade Visual (Brief)",
  "12. CX (Personas & Jornada)",
  "13. Comunicação Tática"
];

export default function ProjetoDetalhes() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      if (!active) return;
      if (profile?.role !== 'master' && profile?.role !== 'admin') { router.replace('/dashboard'); return; }
    })();
    return () => { active = false; };
  }, [router]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [runningAgent, setRunningAgent] = useState(null);
  const [engineError, setEngineError] = useState('');
  const [approving, setApproving] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [pendingAgentNum, setPendingAgentNum] = useState(null);

  // CIS Participantes
  const [cisParticipantes, setCisParticipantes] = useState([]);
  const [cisForm, setCisForm] = useState({ nome: '', email: '', cargo: '' });
  const [cisAdding, setCisAdding] = useState(false);
  const [cisMsg, setCisMsg] = useState({ tipo: '', texto: '' });
  const [cisBulkMode, setCisBulkMode] = useState(false);
  const [cisBulkText, setCisBulkText] = useState('');
  const [editId, setEditId] = useState(null);

  // Responsável do projeto (editável pelo master)
  const [editingResp, setEditingResp] = useState(false);
  const [respForm, setRespForm] = useState({ nome: '', email: '' });
  const [savingResp, setSavingResp] = useState(false);
  const [respMsg, setRespMsg] = useState('');

  // Modal de transcrição de entrevista
  const [transcritModal, setTranscritModal] = useState(null);
  const [transcritText, setTranscritText] = useState('');
  const [transcritNome, setTranscritNome] = useState('');
  const [transcritSaving, setTranscritSaving] = useState(false);

  // Modal de envio de link por email

  // Busca todos os dados do BD via nossa rota central
  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/adm/${id}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setErrorMsg(json.error || 'Erro ao carregar dados');
      }
    } catch (err) {
      setErrorMsg('Falha de conexão com a API.');
    } finally {
      setLoading(false);
    }
  };

  // Sincroniza participantes CIS toda vez que os dados carregam
  useEffect(() => {
    if (data?.cisParticipantes) {
      setCisParticipantes(data.cisParticipantes);
    }
  }, [data]);

  useEffect(() => {
    loadData();
  }, [id]);

  const [deletando, setDeletando] = useState(false);

  const handleDeleteProjeto = async () => {
    const confirmado = window.confirm(`Tem certeza que deseja excluir o projeto "${data?.projeto?.cliente}"?\n\nEsta ação é irreversível e apagará todos os dados relacionados.`);
    if (!confirmado) return;
    setDeletando(true);
    try {
      const res = await fetch(`/api/projetos/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      router.push('/adm');
    } catch (err) {
      alert('Erro ao excluir projeto: ' + err.message);
    } finally {
      setDeletando(false);
    }
  };

  const handleApproveCheckpoint = async (checkpointNum) => {
    setApproving(true);
    setEngineError('');
    try {
      const res = await fetch('/api/engine/checkpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projetoId: id, checkpointNum, status: 'aprovado' })
      });
      const json = await res.json();
      if (!json.success) {
        setEngineError(json.error || 'Falha ao aprovar checkpoint.');
      } else {
        await loadData();
      }
    } catch (err) {
      setEngineError('Falha ao comunicar com o servidor.');
    } finally {
      setApproving(false);
    }
  };

  const AI_MODELS = [
    { key: 'gemini-flash', label: 'Gemini Flash', desc: 'Rápido e econômico', provider: 'Google' },
    { key: 'gemini-pro', label: 'Gemini Pro', desc: 'Mais completo', provider: 'Google' },
    { key: 'claude-sonnet', label: 'Claude Sonnet', desc: 'Equilibrado', provider: 'Anthropic' },
    { key: 'claude-haiku', label: 'Claude Haiku', desc: 'Rápido e leve', provider: 'Anthropic' },
    { key: 'gpt-4o', label: 'GPT-4o', desc: 'Alta capacidade', provider: 'OpenAI' },
    { key: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Rápido e econômico', provider: 'OpenAI' },
  ];

  const handleRequestRun = (agentNum) => {
    setPendingAgentNum(agentNum);
    setShowModelPicker(true);
    setEngineError('');
  };

  const handleRunWithModel = async (modelKey) => {
    setShowModelPicker(false);
    const agentNum = pendingAgentNum;
    setRunningAgent(agentNum);
    setEngineError('');
    try {
      const res = await fetch('/api/engine/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projetoId: id, agentNum, modelKey })
      });
      const json = await res.json();
      if (!json.success) {
        setEngineError(json.error || 'Falha desconhecida no Engine.');
      } else {
        await loadData();
      }
    } catch (err) {
      setEngineError('Falha ao comunicar com o servidor.');
    } finally {
      setRunningAgent(null);
    }
  };

  const openTranscritModal = (tipo) => {
    setTranscritModal(tipo);
    setTranscritText('');
    setTranscritNome('');
  };

  const saveTranscrit = async () => {
    if (!transcritText.trim()) return;
    setTranscritSaving(true);
    try {
      const res = await fetch('/api/formularios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projetoId: id,
          tipo: transcritModal,
          respostas: { respondente: transcritNome || 'anônimo', transcricao: transcritText },
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao salvar');
      setTranscritModal(null);
      await loadData();
    } catch (err) {
      alert('Erro ao salvar transcrição: ' + err.message);
    } finally {
      setTranscritSaving(false);
    }
  };

  const [cisSending, setCisSending] = useState(false);

  const downloadOutputPdf = async (out) => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 56;
    const marginTop = 60;
    const marginBottom = 60;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - marginX * 2;
    let y = marginTop;

    const stripTags = (t) => String(t || '').replace(/<\/?[^>]+>/g, '').replace(/\r/g, '');
    const newPageIfNeeded = (h) => {
      if (y + h > pageHeight - marginBottom) {
        doc.addPage();
        y = marginTop;
      }
    };
    const writeHeading = (text, size = 14) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(size);
      newPageIfNeeded(size + 6);
      doc.text(text, marginX, y);
      y += size + 6;
    };
    const writeParagraph = (text, size = 10, color = [40, 40, 40]) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      const lines = doc.splitTextToSize(stripTags(text), maxWidth);
      for (const line of lines) {
        newPageIfNeeded(size + 3);
        doc.text(line, marginX, y);
        y += size + 3;
      }
      doc.setTextColor(0, 0, 0);
    };

    // Cabeçalho
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0, 65, 152);
    doc.text('Espansione', marginX, y);
    y += 22;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const projetoNome = data?.projeto?.cliente || data?.projeto?.nome || '';
    const agentName = AGENT_NAMES[out.agent_num]?.replace(/^\d+\.\s*/, '') || `Agente ${out.agent_num}`;
    doc.text(`${projetoNome}  •  Agente ${String(out.agent_num).padStart(2, '0')} — ${agentName}`, marginX, y);
    y += 14;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    const when = out.created_at ? new Date(out.created_at).toLocaleString('pt-BR') : '';
    const conf = out.confianca ? `Confiança: ${out.confianca}` : '';
    doc.text([when, conf].filter(Boolean).join('  •  '), marginX, y);
    y += 18;
    doc.setDrawColor(220, 220, 220);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 16;
    doc.setTextColor(0, 0, 0);

    if (out.resumo_executivo) {
      writeHeading('Resumo Executivo');
      writeParagraph(out.resumo_executivo);
      y += 8;
    }
    if (out.conteudo) {
      writeHeading('Conteúdo');
      writeParagraph(out.conteudo);
      y += 8;
    }
    if (out.conclusoes) {
      writeHeading('Conclusões');
      writeParagraph(out.conclusoes);
      y += 8;
    }
    if (out.fontes) {
      writeHeading('Fontes');
      writeParagraph(out.fontes, 9, [90, 90, 90]);
    }

    const filename = `${projetoNome}_Agente${String(out.agent_num).padStart(2, '0')}_${(agentName || '').replace(/[^A-Za-z0-9À-ÿ]+/g, '_')}.pdf`;
    doc.save(filename);
  };

  const sendCisInvite = async (participante) => {
    try {
      const res = await fetch('/api/convites/form-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projetoId: id, tipo: 'mapeamento_cis', email: participante.email, nome: participante.nome }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const sendCisBatch = async () => {
    const pendentes = cisParticipantes.filter(p => !p.respondido);
    if (pendentes.length === 0) { alert('Nenhum participante pendente.'); return; }
    if (!confirm(`Enviar convite do DISC pra ${pendentes.length} participantes pendentes?`)) return;
    setCisSending(true);
    let ok = 0, fail = 0;
    let firstErr = '';
    for (const p of pendentes) {
      const r = await sendCisInvite(p);
      if (r.ok) ok++;
      else { fail++; if (!firstErr) firstErr = `${p.email}: ${r.error}`; }
    }
    setCisSending(false);
    alert(fail === 0 ? `${ok} convite(s) enviado(s)` : `Enviados ${ok} | Falhas ${fail}${firstErr ? ` — ${firstErr}` : ''}`);
  };

  const handleAddCisParticipante = async (e) => {
    e.preventDefault();
    if (!cisForm.nome || !cisForm.email) {
      setCisMsg({ tipo: 'erro', texto: 'Nome e e-mail são obrigatórios.' });
      return;
    }
    setCisAdding(true);
    setCisMsg({ tipo: '', texto: '' });
    try {
      const isUpdating = !!editId;
      const res = await fetch(`/api/cis/participantes?projeto_id=${id}`, {
        method: isUpdating ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isUpdating ? { ...cisForm, id: editId } : cisForm)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      if (isUpdating) {
        setCisParticipantes(prev => prev.map(p => p.id === editId ? json.participante : p));
        setEditId(null);
        setCisMsg({ tipo: 'ok', texto: 'Participante atualizado!' });
      } else {
        setCisParticipantes(prev => [json.participante, ...prev]);
        setCisMsg({ tipo: 'ok', texto: 'Participante adicionado!' });
      }
      setCisForm({ nome: '', email: '', cargo: '' });
    } catch (err) {
      setCisMsg({ tipo: 'erro', texto: err.message || 'Erro ao processar.' });
    } finally {
      setCisAdding(false);
    }
  };

  const handleDeleteParticipante = async (pId, pNome) => {
    if (!window.confirm(`Excluir participante "${pNome}"?`)) return;
    try {
      const res = await fetch(`/api/cis/participantes?projeto_id=${id}&id=${pId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setCisParticipantes(prev => prev.filter(p => p.id !== pId));
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const startEditParticipante = (p) => {
    setEditId(p.id);
    setCisForm({ nome: p.nome, email: p.email, cargo: p.cargo || '' });
    setCisBulkMode(false);
  };

  const handleBulkImport = async () => {
    if (!cisBulkText.trim()) return;
    setCisAdding(true);
    setCisMsg({ tipo: '', texto: '' });
    
    // Parser simples: Nome;Cargo;Email ou Nome;Email
    const lines = cisBulkText.split('\n').filter(l => l.trim().includes('@'));
    const rows = lines.map(line => {
      const parts = line.split(/[;,]/).map(p => p.trim());
      if (parts.length >= 3) return { nome: parts[0], cargo: parts[1], email: parts[2] };
      if (parts.length === 2) return { nome: parts[0], email: parts[1], cargo: '' };
      return null;
    }).filter(Boolean);

    if (rows.length === 0) {
      setCisMsg({ tipo: 'erro', texto: 'Nenhum formato válido encontrado (use Nome;Cargo;Email)' });
      setCisAdding(false);
      return;
    }

    try {
      const res = await fetch(`/api/cis/participantes?projeto_id=${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      setCisParticipantes(prev => [...json.participantes, ...prev]);
      setCisBulkText('');
      setCisBulkMode(false);
      setCisMsg({ tipo: 'ok', texto: `${rows.length} participantes importados!` });
    } catch (err) {
      setCisMsg({ tipo: 'erro', texto: err.message });
    } finally {
      setCisAdding(false);
    }
  };

  const handleDownloadPdf = async (email, nome) => {
    try {
      const btn = document.activeElement;
      if (btn) { btn.textContent = '⏳'; btn.disabled = true; }

      const res = await fetch(`/api/relatorio/gerar?projeto_id=${id}&email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Erro ao gerar PDF');
        if (btn) { btn.textContent = '📄'; btn.disabled = false; }
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Espansione_Perfil_${nome.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      if (btn) { btn.textContent = '📄'; btn.disabled = false; }
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#fff' }}>Carregando Painel de Controle...</div>;
  if (errorMsg) return <div style={{ color: 'var(--brand-red)', padding: '2rem' }}>{errorMsg}</div>;
  if (!data || !data.projeto) return <div style={{ color: '#fff' }}>Projeto não encontrado.</div>;

  const { projeto, outputs = [], formularios = [], intake, respondentes = [] } = data;

  const PAPEL_FROM_TIPO = {
    entrevista_socios: 'socios',
    entrevista_colaboradores: 'colaboradores',
    entrevista_cliente: 'clientes',
  };
  const transcritPapel = transcritModal ? PAPEL_FROM_TIPO[transcritModal] : null;
  const transcritRespondentes = transcritPapel ? respondentes.filter(r => r.papel === transcritPapel) : [];
  
  // Calcular qual é o próximo agente baseado no último output gerado
  const lastOutputNum = outputs.length > 0 ? Math.max(...outputs.map(o => o.agent_num)) : 0;
  const nextAgent = lastOutputNum < 13 ? lastOutputNum + 1 : null;
  
  const { pendingCheckpoints = [] } = data;
  const pendingCkpt = (pendingCheckpoints && pendingCheckpoints.length > 0) 
    ? [...pendingCheckpoints].sort((a,b) => a.checkpoint_num - b.checkpoint_num)[0]
    : null;

  // Render formatters
  const renderMarkdownText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => <span key={i}>{line}<br/></span>);
  };

  return (
    <>
      <Head>
        <title>Espansione | Painel de Controle</title>
      </Head>
      <div className="page-container">
        <main className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Link href="/adm">
              <span style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.9rem' }}>
                &larr; Voltar ao Painel Gerencial
              </span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={handleDeleteProjeto}
                disabled={deletando}
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: 'var(--brand-red)', fontSize: '0.82rem', fontWeight: 600, padding: '0.4rem 0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.6)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
              >
                {deletando ? 'Excluindo...' : '🗑 Excluir Projeto'}
              </button>
              <Logo size="sm" showTagline={false} />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
            {/* Esquerda: Informações Gerais */}
            <div style={{ flex: '1 1 300px' }}>
              <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>{projeto.cliente}</h1>

              {/* Card: Responsável do Projeto */}
              <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editingResp ? '1rem' : 0 }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Responsavel do Projeto</h3>
                  {!editingResp && (
                    <button
                      onClick={() => {
                        setRespForm({ nome: projeto.responsavel_nome || '', email: projeto.responsavel_email || '' });
                        setEditingResp(true);
                        setRespMsg('');
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Editar
                    </button>
                  )}
                </div>

                {editingResp ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <input
                      className="form-input"
                      style={{ padding: '0.5rem', margin: 0, fontSize: '0.85rem' }}
                      placeholder="Nome do responsavel"
                      value={respForm.nome}
                      onChange={e => setRespForm({ ...respForm, nome: e.target.value })}
                    />
                    <input
                      className="form-input"
                      style={{ padding: '0.5rem', margin: 0, fontSize: '0.85rem' }}
                      type="email"
                      placeholder="E-mail do responsavel"
                      value={respForm.email}
                      onChange={e => setRespForm({ ...respForm, email: e.target.value })}
                    />
                    {respMsg && (
                      <p style={{ fontSize: '0.75rem', color: respMsg.includes('Erro') ? 'var(--brand-red)' : 'var(--success)', margin: 0 }}>{respMsg}</p>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-primary"
                        disabled={savingResp}
                        onClick={async () => {
                          setSavingResp(true);
                          setRespMsg('');
                          try {
                            const res = await fetch(`/api/projetos/${id}/responsavel`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(respForm),
                            });
                            const json = await res.json();
                            if (!res.ok) throw new Error(json.error);
                            setRespMsg('Salvo!');
                            setEditingResp(false);
                            loadData();
                          } catch (err) {
                            setRespMsg('Erro: ' + err.message);
                          } finally {
                            setSavingResp(false);
                          }
                        }}
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                      >
                        {savingResp ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button
                        onClick={() => { setEditingResp(false); setRespMsg(''); }}
                        style={{ background: 'none', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-secondary)', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '0.5rem' }}>
                    {projeto.responsavel_nome ? (
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{projeto.responsavel_nome}</span>
                        <br />
                        <span style={{ color: 'var(--accent-blue)', fontSize: '0.85rem' }}>{projeto.responsavel_email}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>Nenhum responsavel atribuido</span>
                    )}
                  </div>
                )}
              </div>

              {/* Diagnósticos Essenciais — Formulários + Entrevistas */}
              <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Diagnósticos Essenciais</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    { tipo: 'intake_socios', papel: 'socios', label: 'Formulário Sócios', path: '/form/socios' },
                    { tipo: 'intake_colaboradores', papel: 'colaboradores', label: 'Formulário Colaboradores', path: '/form/colaboradores' },
                    { tipo: 'intake_clientes', papel: 'clientes', label: 'Formulário Clientes', path: '/form/clientes' },
                  ].map(f => {
                    const lista = respondentes.filter(x => x.papel === f.papel);
                    const respondidos = lista.filter(x => x.status_convite === 'respondido').length;
                    const total = lista.length;
                    const icone = total === 0 ? '⏳' : respondidos === total ? '✅' : '🟡';
                    return (
                      <li key={f.tipo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{icone} {f.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                            {total === 0 ? 'nenhum cadastrado' : `${respondidos}/${total} respondidos`}
                          </span>
                          <a href={`${f.path}?projeto=${id}`} target="_blank" rel="noopener noreferrer" title="Visualizar formulário" style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', textDecoration: 'none' }}>👁</a>
                        </div>
                      </li>
                    );
                  })}
                  <li style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Entrevistas (transcrições)
                  </li>
                  {[
                    { tipo: 'entrevista_socios', label: 'Entrevista Sócios' },
                    { tipo: 'entrevista_colaboradores', label: 'Entrevista Colaboradores' },
                    { tipo: 'entrevista_cliente', label: 'Entrevista Cliente' },
                  ].map(e => {
                    const count = formularios.filter(x => x.tipo === e.tipo).length;
                    return (
                      <li key={e.tipo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{count > 0 ? `✅ ${count}` : '⏳'} {e.label}</span>
                        <button onClick={() => openTranscritModal(e.tipo)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.85rem' }}>+ Adicionar transcrição</button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <RespondentesManager projetoId={id} />

              {/* Card: Mapeamento Comportamental CIS */}
              <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderColor: 'rgba(167, 139, 250, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--accent-purple)', margin: 0 }}>🧠 Mapeamento Comportamental</h3>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(167,139,250,0.1)', color: 'var(--accent-purple)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>
                    {cisParticipantes.filter(p => p.respondido).length}/{cisParticipantes.length} respondidos
                  </span>
                </div>

                {!cisBulkMode ? (
                  <form onSubmit={handleAddCisParticipante} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <input className="form-input" style={{ flex: 1, padding: '0.4rem', margin: 0 }} placeholder="Nome" value={cisForm.nome} onChange={e => setCisForm({ ...cisForm, nome: e.target.value })} />
                      <input className="form-input" style={{ flex: 1, padding: '0.4rem', margin: 0 }} placeholder="Cargo" value={cisForm.cargo} onChange={e => setCisForm({ ...cisForm, cargo: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <input className="form-input" style={{ flex: 1, padding: '0.4rem', margin: 0 }} type="email" placeholder="E-mail" value={cisForm.email} onChange={e => setCisForm({ ...cisForm, email: e.target.value })} />
                      <button className="btn-primary" style={{ padding: '0 1rem', flexShrink: 0, fontSize: '0.8rem', height: 'auto', background: editId ? 'var(--accent-blue)' : 'var(--accent-purple)' }} disabled={cisAdding}>
                        {cisAdding ? '...' : editId ? 'Salvar' : '+ Adicionar'}
                      </button>
                    </div>
                    {editId && (
                      <button type="button" onClick={() => { setEditId(null); setCisForm({ nome: '', email: '', cargo: '' }); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', textDecoration: 'underline', padding: 0 }}>
                        Cancelar Edição
                      </button>
                    )}
                    <button type="button" onClick={() => setCisBulkMode(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', textDecoration: 'underline', padding: 0 }}>
                      ⚡ Importar vários de uma vez (Excel/Planilha)
                    </button>
                    {cisMsg.texto && (
                      <p style={{ fontSize: '0.75rem', color: cisMsg.tipo === 'erro' ? 'var(--brand-red)' : 'var(--success)', marginTop: '0.2rem' }}>
                        {cisMsg.texto}
                      </p>
                    )}
                  </form>
                ) : (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Cole sua lista: <strong>Nome;Cargo;E-mail</strong> ou <strong>Nome;E-mail</strong></p>
                    <textarea 
                      className="form-input" 
                      style={{ width: '100%', height: '100px', fontSize: '0.8rem', resize: 'none', marginBottom: '0.6rem', fontFamily: 'monospace', padding: '0.5rem' }}
                      placeholder="Ex: João Silva;Gerente;joao@email.com"
                      value={cisBulkText}
                      onChange={e => setCisBulkText(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button className="btn-primary" style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem', background: 'var(--accent-purple)' }} onClick={handleBulkImport} disabled={cisAdding}>
                        {cisAdding ? 'Importando...' : 'Confirmar Importação'}
                      </button>
                      <button className="form-input" style={{ flexShrink: 1, padding: '0 0.8rem', margin: 0, fontSize: '0.75rem', cursor: 'pointer' }} onClick={() => setCisBulkMode(false)}>Cancelar</button>
                    </div>
                    {cisMsg.texto && (
                      <p style={{ fontSize: '0.75rem', color: cisMsg.tipo === 'erro' ? 'var(--brand-red)' : 'var(--success)', marginTop: '0.5rem' }}>
                        {cisMsg.texto}
                      </p>
                    )}
                  </div>
                )}

                {/* Lista de participantes */}
                {cisParticipantes.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {cisParticipantes.map(p => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.nome}</span>
                          {p.cargo && <span style={{ color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>• {p.cargo}</span>}
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{p.email}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1rem' }}>{p.respondido ? '✅' : '⏳'}</span>
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            {p.respondido && <button onClick={() => handleDownloadPdf(p.email, p.nome)} title="Baixar PDF" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--accent-purple)', padding: '0.2rem' }}>📄</button>}
                            {!p.respondido && p.token && <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/mapeamento.html?t=${p.token}`); alert(`Link de ${p.nome} copiado`); }} title="Copiar link único" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.2rem' }}>🔗</button>}
                            {!p.respondido && <button onClick={async () => { const r = await sendCisInvite(p); alert(r.ok ? `Convite enviado pra ${p.email}` : `Erro: ${r.error}`); }} title="Enviar convite por email" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--accent-blue)', padding: '0.2rem' }}>✉️</button>}
                            <button onClick={() => startEditParticipante(p)} title="Editar" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.2rem' }}>✏️</button>
                            {!p.respondido && <button onClick={() => handleDeleteParticipante(p.id, p.nome)} title="Excluir" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.2rem' }}>🗑️</button>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', textAlign: 'center' }}>Nenhum participante cadastrado.</p>
                )}

                <button
                  onClick={sendCisBatch}
                  disabled={cisSending || cisParticipantes.filter(p => !p.respondido).length === 0}
                  style={{ width: '100%', background: 'rgba(167,139,250,0.2)', border: '1px solid var(--accent-purple)', borderRadius: '8px', color: 'var(--accent-purple)', fontWeight: 700, padding: '0.6rem', cursor: cisSending ? 'wait' : 'pointer', fontSize: '0.85rem', opacity: cisSending ? 0.6 : 1 }}
                >
                  {cisSending ? 'Enviando...' : `✉️ Enviar para pendentes (${cisParticipantes.filter(p => !p.respondido).length})`}
                </button>
              </div>
              
              {/* Box de Ação Principal */}
              <div className="glass-card outline-glow" style={{ padding: '1.5rem', background: 'rgba(56, 189, 248, 0.05)', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent-blue)' }}>Orquestrador de IA</h3>
                {pendingCkpt ? (
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <p style={{ color: 'var(--warning)', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>🛑</span> Checkpoint {pendingCkpt.checkpoint_num} Pendente
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                      Valide os relatórios formatados entregues até agora. Eles devem ser apresentados ao cliente. 
                      Se aprovado, o sistema destravará a próxima etapa da esteira.
                    </p>
                    <button 
                      className="btn-primary" 
                      style={{ width: '100%', padding: '0.75rem', background: 'var(--warning)', color: '#000', filter: 'none', boxShadow: 'none' }}
                      onClick={() => handleApproveCheckpoint(pendingCkpt.checkpoint_num)}
                      disabled={approving}
                    >
                      {approving ? 'Aprovando...' : `Aprovar Checkpoint ${pendingCkpt.checkpoint_num}`}
                    </button>
                    {engineError && <p style={{ color: 'var(--brand-red)', marginTop: '0.5rem', fontSize: '0.85rem' }}>{engineError}</p>}
                  </div>
                ) : nextAgent === null ? (
                  <p style={{ color: 'var(--success)', fontWeight: 600 }}>Cérebro 100% Processado! 🎉</p>
                ) : (
                  <>
                    <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                      Próximo passo na esteira:
                    </p>
                    <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                      {AGENT_NAMES[nextAgent]}
                    </p>
                    {engineError && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--brand-red)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        {engineError.includes('Missing fields') ? '⚠️ Faltam dados na base (ex: formulário de clima) antes de rodar este agente.' : '🚨 Erro: ' + engineError}
                      </div>
                    )}
                    <button
                      className="btn-primary"
                      style={{ width: '100%', padding: '0.85rem' }}
                      disabled={runningAgent !== null}
                      onClick={() => handleRequestRun(nextAgent)}
                    >
                      {runningAgent !== null ? 'Processando (aguarde 15s~30s)...' : `Executar Agente ${nextAgent}`}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Direita: Trilha Visual dos Agentes (O histórico de Outputs) */}
            <div style={{ flex: '2 1 500px' }}>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Relatórios Gerados (Outputs)</h2>
                
                {outputs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    Nenhum output gerado ainda. Execute o Agente 00 para começar.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Renderiza os outputs já concluídos */}
                    {outputs.sort((a, b) => b.agent_num - a.agent_num).map((out) => (
                      <div key={out.id} style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                            <span style={{ color: 'var(--accent-blue)', marginRight: '0.5rem' }}>A{out.agent_num}</span> 
                            {AGENT_NAMES[out.agent_num]?.split('.')[1] || `Agente ${out.agent_num}`}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <button
                              onClick={() => downloadOutputPdf(out)}
                              title="Baixar em PDF"
                              style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', color: 'var(--accent-blue)', borderRadius: '8px', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                            >
                              📄 PDF
                            </button>
                            <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>Concluído</span>
                          </div>
                        </div>
                        <div style={{ padding: '1.5rem', fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                          {out.resumo_executivo ? (
                            <div style={{ marginBottom: '1rem' }}>
                              <strong style={{ color: 'var(--text-primary)' }}>Resumo Executivo:</strong><br/>
                              {renderMarkdownText(out.resumo_executivo)}
                            </div>
                          ) : null}
                          
                          {/* Botão simples que poderia expandir um modal com o conteúdo completo */}
                          <details style={{ cursor: 'pointer', outline: 'none' }}>
                            <summary style={{ color: 'var(--accent-blue)', fontWeight: 500, userSelect: 'none' }}>Ver Documento Completo</summary>
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                              {renderMarkdownText(out.conteudo)}
                              
                              {out.conclusoes && (
                                <div style={{ marginTop: '1rem' }}>
                                  <strong style={{ color: 'var(--text-primary)' }}>Conclusões/Takeaways:</strong><br/>
                                  {renderMarkdownText(out.conclusoes)}
                                </div>
                              )}
                            </div>
                          </details>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Modal: Seleção de Modelo de IA */}
        {showModelPicker && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={() => setShowModelPicker(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
            <div style={{ position: 'relative', background: 'var(--bg-secondary, #0a1122)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem', maxWidth: '440px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
              <h3 style={{ color: 'var(--accent-blue)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Escolha o modelo de IA</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                Agente {pendingAgentNum} — {AGENT_NAMES[pendingAgentNum]}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {AI_MODELS.map(m => (
                  <button
                    key={m.key}
                    onClick={() => handleRunWithModel(m.key)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px', padding: '0.85rem 1rem', cursor: 'pointer',
                      transition: 'all 0.15s', textAlign: 'left', color: 'inherit',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(107,163,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(107,163,255,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', marginBottom: '2px' }}>{m.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.desc}</div>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '6px', letterSpacing: '0.5px' }}>
                      {m.provider}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowModelPicker(false)}
                style={{ marginTop: '1rem', width: '100%', padding: '0.6rem', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {transcritModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => !transcritSaving && setTranscritModal(null)}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#0a1122', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.5rem', maxWidth: '640px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>Adicionar transcrição — {transcritModal.replace('entrevista_', '').replace('_', ' ')}</h3>
              {transcritRespondentes.length > 0 ? (
                <select
                  className="form-input"
                  value={transcritNome}
                  onChange={e => setTranscritNome(e.target.value)}
                  style={{ padding: '0.6rem', margin: 0 }}
                >
                  <option value="">Selecione o entrevistado...</option>
                  {transcritRespondentes.map(r => (
                    <option key={r.id} value={r.nome}>{r.nome}{r.email ? ` — ${r.email}` : ''}</option>
                  ))}
                </select>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '6px', padding: '0.6rem 0.8rem' }}>
                  ⚠ Nenhum respondente cadastrado pra {transcritPapel}. Adicione na seção "Respondentes" antes de salvar a transcrição, ou digite o nome abaixo.
                </div>
              )}
              <input
                className="form-input"
                placeholder={transcritRespondentes.length > 0 ? 'Ou digite outro nome (opcional)' : 'Nome do entrevistado'}
                value={transcritNome}
                onChange={e => setTranscritNome(e.target.value)}
                style={{ padding: '0.6rem', margin: 0 }}
              />
              <textarea
                className="form-input"
                placeholder="Cole aqui a transcrição da entrevista..."
                value={transcritText}
                onChange={e => setTranscritText(e.target.value)}
                style={{ width: '100%', minHeight: '280px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem', padding: '0.75rem' }}
              />
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setTranscritModal(null)} disabled={transcritSaving} style={{ padding: '0.5rem 1rem', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={saveTranscrit} disabled={transcritSaving || !transcritText.trim()} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  {transcritSaving ? 'Salvando...' : 'Salvar Transcrição'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
