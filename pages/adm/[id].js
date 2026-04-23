import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo';
import RespondentesManager from '../../components/RespondentesManager';
import OptInEntrevistasManager from '../../components/OptInEntrevistasManager';
import PosicionamentoResults from '../../components/PosicionamentoResults';
import { supabase } from '../../lib/supabaseClient';
import { generateOutputPdf } from '../../lib/pdf/outputPdf';
import {
  CATALOGO_AGENTES,
  TOTAL_AGENTES,
  getAgenteByNum,
  calcularProgresso,
  formatarTituloAdmin,
} from '../../lib/agents/catalog';

// Formato "02. Consolidado da Visão Interna (VI)" — preserva layout
// do painel admin que antes consumia um array AGENT_NAMES hardcoded
// com 13 itens. Agora vem do catálogo (15 agentes, FIX.3).
const nomeAgente = (n) => formatarTituloAdmin(n);

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

  // Modal do resultado do posicionamento
  const [posModalOpen, setPosModalOpen] = useState(false);

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
    { key: 'claude-opus-4-7', label: 'Claude Opus 4.7', desc: 'Máxima capacidade · web search', provider: 'Anthropic' },
    { key: 'claude-opus-4-5', label: 'Claude Opus 4.5', desc: 'Alta capacidade (fallback)', provider: 'Anthropic' },
    { key: 'claude-sonnet', label: 'Claude Sonnet', desc: 'Equilibrado', provider: 'Anthropic' },
    { key: 'claude-haiku', label: 'Claude Haiku', desc: 'Rápido e leve', provider: 'Anthropic' },
    { key: 'gpt-5.4-mini', label: 'GPT-5.4 Mini', desc: 'Rápido e econômico', provider: 'OpenAI' },
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

  const downloadDiscReport = async () => {
    const assessments = data?.cisAssessments || [];
    if (assessments.length === 0) {
      alert('Nenhum mapeamento DISC respondido ainda.');
      return;
    }

    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 56;
    const marginTop = 56;
    const marginBottom = 56;
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const maxW = pageW - marginX * 2;
    let y = marginTop;

    const nl = (h = 12) => { y += h; if (y > pageH - marginBottom) { doc.addPage(); y = marginTop; } };
    const needSpace = (h) => { if (y + h > pageH - marginBottom) { doc.addPage(); y = marginTop; } };
    const heading = (text, size = 14, color = [0, 65, 152]) => {
      nl(6); needSpace(size + 8);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(size);
      doc.setTextColor(...color);
      doc.text(text, marginX, y); y += size + 6;
      doc.setTextColor(0, 0, 0);
    };
    const paragraph = (text, size = 10, color = [40, 40, 40]) => {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(size);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(String(text || ''), maxW);
      for (const line of lines) { needSpace(size + 3); doc.text(line, marginX, y); y += size + 3; }
      doc.setTextColor(0, 0, 0);
    };
    const barRow = (label, value, max = 100, color = [56, 189, 248]) => {
      needSpace(22);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(40, 40, 40);
      doc.text(label, marginX, y);
      const pct = Math.max(0, Math.min(1, value / max));
      const barX = marginX + 140;
      const barW = maxW - 180;
      doc.setFillColor(230, 230, 230); doc.rect(barX, y - 8, barW, 8, 'F');
      doc.setFillColor(...color); doc.rect(barX, y - 8, barW * pct, 8, 'F');
      doc.setFontSize(9); doc.text(String(Math.round(value)), barX + barW + 8, y);
      y += 14;
    };
    const drawLine = () => { doc.setDrawColor(220, 220, 220); doc.line(marginX, y, pageW - marginX, y); y += 14; };

    // ==== Agregações ====
    const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const sum = (arr) => arr.reduce((a, b) => a + b, 0);

    const disc = { D: [], I: [], S: [], C: [] };
    const discA = { D: [], I: [], S: [], C: [] };
    const leadership = { visionaria: [], executora: [], relacional: [], analitica: [] };
    const comps = {};
    const perfilCount = {};

    for (const a of assessments) {
      const s = a.scores_json || {};
      ['D', 'I', 'S', 'C'].forEach(k => {
        if (s.disc?.[k] != null) disc[k].push(Number(s.disc[k]));
        if (s.discA?.[k] != null) discA[k].push(Number(s.discA[k]));
      });
      ['visionaria', 'executora', 'relacional', 'analitica'].forEach(k => {
        if (s.leadership?.[k] != null) leadership[k].push(Number(s.leadership[k]));
      });
      if (s.competencies) {
        for (const [k, v] of Object.entries(s.competencies)) {
          if (!comps[k]) comps[k] = [];
          comps[k].push(Number(v));
        }
      }
      const label = s.profileLabel || s.profile || '—';
      perfilCount[label] = (perfilCount[label] || 0) + 1;
    }

    const discMed = Object.fromEntries(['D','I','S','C'].map(k => [k, avg(disc[k])]));
    const discAMed = Object.fromEntries(['D','I','S','C'].map(k => [k, avg(discA[k])]));
    const leadMed = Object.fromEntries(['visionaria','executora','relacional','analitica'].map(k => [k, avg(leadership[k])]));
    const compMed = Object.entries(comps).map(([k, arr]) => ({ nome: k, media: avg(arr) })).sort((a, b) => b.media - a.media);

    // ==== Capa ====
    doc.setFont('helvetica', 'bold'); doc.setFontSize(24); doc.setTextColor(0, 65, 152);
    doc.text('Espansione', marginX, y); y += 28;
    doc.setFontSize(16); doc.setTextColor(40, 40, 40);
    doc.text('Relatório Comportamental — Perfil do Time', marginX, y); y += 22;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(12); doc.setTextColor(100, 100, 100);
    const projetoNome = data?.projeto?.cliente || data?.projeto?.nome || '';
    doc.text(projetoNome, marginX, y); y += 16;
    doc.setFontSize(10); doc.setTextColor(150, 150, 150);
    doc.text(`${assessments.length} respondente(s)  •  ${new Date().toLocaleDateString('pt-BR')}`, marginX, y);
    y += 20; drawLine();

    // ==== Sumário Executivo ====
    heading('Sumário Executivo');
    const dimDom = Object.entries(discMed).sort((a, b) => b[1] - a[1])[0];
    const dimBaixa = Object.entries(discMed).sort((a, b) => a[1] - b[1])[0];
    const topComp = compMed[0];
    const bottomComp = compMed[compMed.length - 1];
    const perfisPredom = Object.entries(perfilCount).sort((a, b) => b[1] - a[1])[0];
    paragraph(
      `O time de ${assessments.length} respondente(s) apresenta predominância em ${dimDom[0]} (${Math.round(dimDom[1])}) ` +
      `e pontuação mais baixa em ${dimBaixa[0]} (${Math.round(dimBaixa[1])}) no DISC natural agregado. ` +
      `O perfil mais representado é "${perfisPredom[0]}" (${perfisPredom[1]}/${assessments.length}). ` +
      `A competência com maior maturidade média é "${topComp.nome}" (${topComp.media.toFixed(1)}) e a mais frágil é "${bottomComp.nome}" (${bottomComp.media.toFixed(1)}).`
    );

    // ==== DISC Natural Agregado ====
    heading('DISC Natural (médias do time)');
    barRow('Dominância (D)', discMed.D, 100, [220, 38, 38]);
    barRow('Influência (I)', discMed.I, 100, [245, 158, 11]);
    barRow('Estabilidade (S)', discMed.S, 100, [16, 185, 129]);
    barRow('Conformidade (C)', discMed.C, 100, [56, 189, 248]);

    heading('DISC Adaptado (como o time se ajusta em contexto de trabalho)');
    barRow('Dominância (D)', discAMed.D, 100, [220, 38, 38]);
    barRow('Influência (I)', discAMed.I, 100, [245, 158, 11]);
    barRow('Estabilidade (S)', discAMed.S, 100, [16, 185, 129]);
    barRow('Conformidade (C)', discAMed.C, 100, [56, 189, 248]);

    // ==== Matriz de Liderança ====
    heading('Matriz de Estilos de Liderança (médias)');
    barRow('Visionária', leadMed.visionaria, 100, [167, 139, 250]);
    barRow('Executora', leadMed.executora, 100, [244, 63, 94]);
    barRow('Relacional', leadMed.relacional, 100, [236, 72, 153]);
    barRow('Analítica', leadMed.analitica, 100, [56, 189, 248]);

    // ==== Competências ====
    heading('Competências — Top 5 e Bottom 5');
    paragraph('Forças do time (top 5):', 10, [40, 40, 40]);
    compMed.slice(0, 5).forEach(c => barRow(c.nome, c.media, 10, [16, 185, 129]));
    nl(4);
    paragraph('Áreas de desenvolvimento (bottom 5):', 10, [40, 40, 40]);
    compMed.slice(-5).reverse().forEach(c => barRow(c.nome, c.media, 10, [244, 63, 94]));

    // ==== Distribuição de Perfis ====
    heading('Distribuição de Perfis');
    Object.entries(perfilCount).sort((a, b) => b[1] - a[1]).forEach(([label, count]) => {
      paragraph(`• ${label} — ${count} respondente(s)`, 10);
    });

    // ==== Perfil Individual ====
    heading('Perfis Individuais');
    assessments.forEach(a => {
      const s = a.scores_json || {};
      const nome = a.nome || a.email || '—';
      const perfil = s.profileLabel || s.profile || '—';
      const d = s.disc || {};
      needSpace(40);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(40, 40, 40);
      doc.text(nome, marginX, y); y += 12;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(100, 100, 100);
      doc.text(perfil, marginX, y); y += 11;
      doc.setFontSize(9); doc.setTextColor(40, 40, 40);
      doc.text(`DISC: D=${d.D ?? '—'}  I=${d.I ?? '—'}  S=${d.S ?? '—'}  C=${d.C ?? '—'}`, marginX, y);
      y += 16;
    });

    // ==== Insights ====
    heading('Leitura Estratégica');
    const gaps = [];
    if (discMed.S < 50) gaps.push('Baixa estabilidade (S) agregada — time pode ter dificuldade em processos longos e consistência operacional.');
    if (discMed.D > 65) gaps.push('Alta dominância (D) agregada — risco de conflitos entre múltiplos protagonistas, cuidado com alinhamento.');
    if (discMed.C < 50) gaps.push('Baixa conformidade (C) agregada — atenção com rigor analítico e aderência a processos.');
    if (discMed.I < 45) gaps.push('Baixa influência (I) agregada — time mais técnico que relacional, possível lacuna em comunicação externa.');
    const leadOrdered = Object.entries(leadMed).sort((a, b) => b[1] - a[1]);
    gaps.push(`Estilo de liderança predominante: ${leadOrdered[0][0]} (${Math.round(leadOrdered[0][1])}). Menor presença em ${leadOrdered[3][0]} (${Math.round(leadOrdered[3][1])}).`);
    gaps.forEach(t => paragraph(`• ${t}`));

    nl(20);
    doc.setFontSize(8); doc.setTextColor(150, 150, 150);
    doc.text('Gerado automaticamente por Espansione • Metodologia DISC + 16 competências + 4 estilos de liderança', marginX, y);

    const filename = `${projetoNome}_Relatorio_Comportamental.pdf`;
    doc.save(filename);
  };

  const downloadOutputPdf = async (out) => {
    await generateOutputPdf(out, data?.projeto);
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

  // FIX.4 — exclusão com preview de cascata + confirmação forte
  // quando há 3+ outputs afetados. Passos:
  //   1. GET /api/outputs/delete?projetoId&agentNum → preview
  //   2. Abre modal com lista de dependentes + confirmação
  //   3. POST /api/outputs/delete com confirmar_cascata=true
  const [deletingOutput, setDeletingOutput] = useState(null);
  const [cascadePreview, setCascadePreview] = useState(null);
  const [cascadeConfirmText, setCascadeConfirmText] = useState('');

  const abrirCascatePreview = async (agentNum) => {
    try {
      const res = await fetch(`/api/outputs/delete?projetoId=${id}&agentNum=${agentNum}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Falha ao analisar cascata');
      setCascadeConfirmText('');
      setCascadePreview({ agentNum, ...json });
    } catch (err) {
      alert('Erro ao analisar exclusão: ' + err.message);
    }
  };

  const confirmarExclusao = async () => {
    if (!cascadePreview) return;
    const { agentNum, cascata } = cascadePreview;
    setDeletingOutput(agentNum);
    try {
      const res = await fetch('/api/outputs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projetoId: id,
          agentNum,
          confirmar_cascata: cascata?.tem_cascata === true,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Falha ao excluir');
      setCascadePreview(null);
      setCascadeConfirmText('');
      await loadData();
    } catch (err) {
      alert('Erro ao excluir relatório: ' + err.message);
    } finally {
      setDeletingOutput(null);
    }
  };

  const handleDeleteOutput = (agentNum) => abrirCascatePreview(agentNum);

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
  
  // Próximo agente = primeiro faltante na ordem do catálogo (FIX.3).
  // Antes: "maior output + 1" — pulava gaps (output 2, 4, 5 existia →
  // sugeria 6 em vez de 3). Agora respeita a ordem sequencial.
  // EVP (Agente 14, modular) só entra no denominador se o projeto já
  // tem algum output 14 — proxy simples de "escopo EVP contratado".
  const agentNumsCompletos = outputs.map(o => o.agent_num);
  const projetoTemEvp = agentNumsCompletos.includes(14);
  const progresso = calcularProgresso(agentNumsCompletos, projetoTemEvp);
  const nextAgent = progresso.proximoAgente?.agent_num || null;
  
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
              <Link
                href={`/adm/${id}/deliverable`}
                title="Abrir o entregável final consolidado"
                style={{ background: 'rgba(0,50,109,0.1)', border: '1px solid rgba(0,50,109,0.35)', borderRadius: '8px', color: 'var(--brand-blue-light)', fontSize: '0.82rem', fontWeight: 600, padding: '0.4rem 0.8rem', textDecoration: 'none' }}
              >
                📘 Entregável final
              </Link>
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
                          <a href={`${f.path}?projeto=${id}&preview=true`} target="_blank" rel="noopener noreferrer" title="Pré-visualizar formulário (respostas não serão salvas)" style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', textDecoration: 'none' }}>👁 preview</a>
                        </div>
                      </li>
                    );
                  })}
                  {/* Teste de Posicionamento Estratégico — só para sócios */}
                  {(() => {
                    const socios = respondentes.filter(x => x.papel === 'socios');
                    const respPosicionamento = formularios.filter(x => x.tipo === 'posicionamento_estrategico').length;
                    const icone = socios.length === 0 ? '⏳' : respPosicionamento >= socios.length ? '✅' : respPosicionamento > 0 ? '🟡' : '⏳';
                    return (
                      <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <span>{icone} Teste de Posicionamento Estratégico <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>(só sócios)</span></span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                            {socios.length === 0 ? 'sem sócios' : `${respPosicionamento}/${socios.length} respondidos`}
                          </span>
                          {respPosicionamento > 0 && (
                            <button onClick={() => setPosModalOpen(true)} title="Ver resultados" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', color: 'var(--accent-blue)', borderRadius: '6px', padding: '0.15rem 0.5rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>📊 Ver resultados</button>
                          )}
                          <a href={`/form/posicionamento?projeto=${id}`} target="_blank" rel="noopener noreferrer" title="Visualizar teste" style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', textDecoration: 'none' }}>👁</a>
                        </div>
                      </li>
                    );
                  })()}
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

              <OptInEntrevistasManager projetoId={id} />

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

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={sendCisBatch}
                    disabled={cisSending || cisParticipantes.filter(p => !p.respondido).length === 0}
                    style={{ flex: 1, background: 'rgba(167,139,250,0.2)', border: '1px solid var(--accent-purple)', borderRadius: '8px', color: 'var(--accent-purple)', fontWeight: 700, padding: '0.6rem', cursor: cisSending ? 'wait' : 'pointer', fontSize: '0.85rem', opacity: cisSending ? 0.6 : 1 }}
                  >
                    {cisSending ? 'Enviando...' : `✉️ Enviar para pendentes (${cisParticipantes.filter(p => !p.respondido).length})`}
                  </button>
                  <button
                    onClick={downloadDiscReport}
                    disabled={!(data?.cisAssessments?.length > 0)}
                    title="Baixar relatório comportamental consolidado (PDF)"
                    style={{ flex: 1, background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.4)', borderRadius: '8px', color: 'var(--accent-blue)', fontWeight: 700, padding: '0.6rem', cursor: (data?.cisAssessments?.length > 0) ? 'pointer' : 'not-allowed', fontSize: '0.85rem', opacity: (data?.cisAssessments?.length > 0) ? 1 : 0.5 }}
                  >
                    📄 Relatório Comportamental ({data?.cisAssessments?.length || 0})
                  </button>
                </div>
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
                      {nomeAgente(nextAgent)}
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
                    Nenhum output gerado ainda. Execute o Agente 01 para começar.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Renderiza os outputs já concluídos */}
                    {outputs.sort((a, b) => b.agent_num - a.agent_num).map((out) => (
                      <div key={out.id} style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                            <span style={{ color: 'var(--accent-blue)', marginRight: '0.5rem' }}>A{out.agent_num}</span> 
                            {getAgenteByNum(out.agent_num)?.nome_exibicao || `Agente ${out.agent_num}`}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Link
                              href={`/adm/${id}/outputs/${out.agent_num}`}
                              title="Abrir em página editorial"
                              style={{ background: 'rgba(107,163,255,0.1)', border: '1px solid rgba(107,163,255,0.3)', color: 'var(--brand-blue-light)', borderRadius: '8px', padding: '0.3rem 0.7rem', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}
                            >
                              📖 Abrir
                            </Link>
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

          {/* Danger Zone — exclusão de relatórios individuais */}
          <div className="glass-card" style={{ padding: '2rem', marginTop: '2.5rem', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.3rem' }}>⚠️</span>
              <h2 style={{ margin: 0, color: 'var(--brand-red)', fontSize: '1.15rem' }}>Danger Zone — Exclusão de Relatórios</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Excluir um relatório apaga o output, limpa logs e checkpoints relacionados e libera o agente para ser rodado novamente. Os agentes posteriores que dependem deste podem precisar ser re-executados.
            </p>
            {outputs.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>Nenhum relatório gerado.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {outputs.sort((a, b) => a.agent_num - b.agent_num).map((out) => (
                  <div key={out.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', padding: '0.6rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 700, minWidth: '2.5rem' }}>A{out.agent_num}</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{getAgenteByNum(out.agent_num)?.nome_exibicao || `Agente ${out.agent_num}`}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteOutput(out.agent_num)}
                      disabled={deletingOutput !== null}
                      style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '6px', color: 'var(--brand-red)', fontSize: '0.78rem', fontWeight: 600, padding: '0.35rem 0.75rem', cursor: deletingOutput !== null ? 'not-allowed' : 'pointer', opacity: deletingOutput !== null && deletingOutput !== out.agent_num ? 0.4 : 1 }}
                    >
                      {deletingOutput === out.agent_num ? 'Excluindo…' : '🗑 Excluir relatório'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* FIX.4 — Modal de confirmação de exclusão com preview de cascata */}
        {cascadePreview && (() => {
          const alvoNome = cascadePreview.alvo?.nome || `Agente ${cascadePreview.agentNum}`;
          const deps = cascadePreview.cascata?.dependentes_detalhados || [];
          const total = cascadePreview.cascata?.total_afetados || 1;
          const forte = deps.length >= 3;
          const confirmacaoOk = !forte || cascadeConfirmText.trim().toLowerCase() === 'confirmar';
          const deletingAlvo = deletingOutput === cascadePreview.agentNum;
          return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                onClick={() => !deletingAlvo && setCascadePreview(null)}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
              />
              <div style={{ position: 'relative', background: 'var(--bg-secondary, #0a1122)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '16px', padding: '1.75rem', maxWidth: '520px', width: '92%', maxHeight: '80vh', overflowY: 'auto' }}>
                <h3 style={{ color: 'var(--brand-red)', fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                  🗑 Excluir {alvoNome}?
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem 0', lineHeight: 1.45 }}>
                  {cascadePreview.mensagem}
                </p>

                {deps.length > 0 && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '0.75rem 0.9rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--brand-red)', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Também serão apagados ({deps.length})
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: 1.55 }}>
                      {deps.map(d => (
                        <li key={d.agent_num}>Agente {d.agent_num} · {d.nome}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontStyle: 'italic', marginBottom: '1rem' }}>
                  Esta ação é irreversível. Os {total} output{total > 1 ? 's' : ''} precisarão ser reexecutados.
                </p>

                {forte && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="cascade-confirm" style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Digite <code style={{ color: 'var(--brand-red)', fontWeight: 700 }}>confirmar</code> para prosseguir:
                    </label>
                    <input
                      id="cascade-confirm"
                      type="text"
                      autoFocus
                      value={cascadeConfirmText}
                      onChange={(e) => setCascadeConfirmText(e.target.value)}
                      disabled={deletingAlvo}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.35)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.55rem 0.75rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => { setCascadePreview(null); setCascadeConfirmText(''); }}
                    disabled={deletingAlvo}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, padding: '0.55rem 1rem', cursor: deletingAlvo ? 'not-allowed' : 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmarExclusao}
                    disabled={!confirmacaoOk || deletingAlvo}
                    style={{
                      background: (!confirmacaoOk || deletingAlvo) ? 'rgba(239,68,68,0.25)' : 'var(--brand-red)',
                      border: '1px solid var(--brand-red)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      padding: '0.55rem 1.1rem',
                      cursor: (!confirmacaoOk || deletingAlvo) ? 'not-allowed' : 'pointer',
                      opacity: (!confirmacaoOk || deletingAlvo) ? 0.6 : 1,
                    }}
                  >
                    {deletingAlvo ? 'Excluindo…' : (deps.length > 0 ? `Excluir em cascata (${total})` : 'Excluir')}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Modal: Seleção de Modelo de IA */}
        {showModelPicker && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={() => setShowModelPicker(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
            <div style={{ position: 'relative', background: 'var(--bg-secondary, #0a1122)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem', maxWidth: '440px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
              <h3 style={{ color: 'var(--accent-blue)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Escolha o modelo de IA</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                Agente {pendingAgentNum} — {getAgenteByNum(pendingAgentNum)?.nome_exibicao || ''}
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

        {posModalOpen && (
          <PosicionamentoResults
            respostas={formularios}
            projetoNome={data?.projeto?.cliente || data?.projeto?.nome || ''}
            onClose={() => setPosModalOpen(false)}
          />
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
