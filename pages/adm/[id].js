import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo';

const AGENT_NAMES = [
  "00. Intake & Contexto",
  "01. Visão Interna",
  "02. Visão Externa",
  "03. Visão de Mercado",
  "04. Decodificação de Valores",
  "05. Diretrizes Estratégicas",
  "06. Plataforma de Branding",
  "07. Identidade Verbal",
  "08. Identidade Visual (Brief)",
  "09. CX (Personas & Jornada)",
  "10. Comunicação Tática"
];

export default function ProjetoDetalhes() {
  const router = useRouter();
  const { id } = router.query;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [runningAgent, setRunningAgent] = useState(null); // agente atual
  const [engineError, setEngineError] = useState('');
  const [approving, setApproving] = useState(false);

  // CIS Participantes
  const [cisParticipantes, setCisParticipantes] = useState([]);
  const [cisForm, setCisForm] = useState({ nome: '', email: '', cargo: '' });
  const [cisAdding, setCisAdding] = useState(false);
  const [cisMsg, setCisMsg] = useState({ tipo: '', texto: '' });
  const [cisLinkCopiado, setCisLinkCopiado] = useState(false);
  const [cisBulkMode, setCisBulkMode] = useState(false);
  const [cisBulkText, setCisBulkText] = useState('');

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

  const handleRunNext = async (agentNum) => {
    setRunningAgent(agentNum);
    setEngineError('');
    try {
      const res = await fetch('/api/engine/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projetoId: id, agentNum })
      });
      const json = await res.json();
      
      if (!json.success) {
        setEngineError(json.error || 'Falha desconhecida no Engine.');
      } else {
        // Recarregar os dados na tela (incluindo o novo output)
        await loadData();
      }
    } catch (err) {
      setEngineError('Falha ao comunicar com o servidor.');
    } finally {
      setRunningAgent(null);
    }
  };

  const copyLink = (path) => {
    navigator.clipboard.writeText(`${window.location.origin}${path}`);
    alert('Link copiado para a área de transferência!');
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
      const res = await fetch(`/api/cis/participantes?projeto_id=${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cisForm)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setCisParticipantes(prev => [json.participante, ...prev]);
      setCisForm({ nome: '', email: '', cargo: '' });
      setCisMsg({ tipo: 'ok', texto: 'Participante adicionado com sucesso!' });
    } catch (err) {
      setCisMsg({ tipo: 'erro', texto: err.message || 'Erro ao adicionar.' });
    } finally {
      setCisAdding(false);
    }
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

  const copiarLinkCis = () => {
    const link = `${window.location.origin}/cis.html?projeto=${id}`;
    navigator.clipboard.writeText(link);
    setCisLinkCopiado(true);
    setTimeout(() => setCisLinkCopiado(false), 2500);
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#fff' }}>Carregando Painel de Controle...</div>;
  if (errorMsg) return <div style={{ color: 'var(--brand-red)', padding: '2rem' }}>{errorMsg}</div>;
  if (!data || !data.projeto) return <div style={{ color: '#fff' }}>Projeto não encontrado.</div>;

  const { projeto, outputs = [], formularios = [], intake } = data;
  
  // Calcular qual é o próximo agente baseado no último output gerado
  const lastOutputNum = outputs.length > 0 ? Math.max(...outputs.map(o => o.agent_num)) : -1;
  const nextAgent = lastOutputNum < 10 ? lastOutputNum + 1 : null;
  
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

              {/* Status de formulários (simples) */}
              <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Diagnósticos Essenciais</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
                  <li style={{ paddingBottom: '0.75rem', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500 }}>{intake && Object.keys(intake).length > 2 ? '✅' : '⏳'} Formulário Inicial</span>
                    </div>
                    {(!intake || Object.keys(intake).length <= 2) && (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-start' }}>
                        <button onClick={() => copyLink(`/form/intake?projeto=${id}&versao=resumida`)} style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--accent-blue)', borderRadius: '4px', padding: '0.3rem 0.6rem', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>Copiar Link (Resumido)</button>
                        <button onClick={() => copyLink(`/form/intake?projeto=${id}&versao=completa`)} style={{ background: 'var(--accent-blue)', border: '1px solid var(--accent-blue)', borderRadius: '4px', padding: '0.3rem 0.6rem', color: '#000', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Copiar Link (Completo)</button>
                      </div>
                    )}
                  </li>
                  <li style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{formularios.some(f => f.tipo === 'proposito') ? '✅' : '⏳'} Form. Liderança (Propósito)</span>
                    <button onClick={() => copyLink(`/form/proposito?projeto=${id}`)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer' }}>Copiar Link</button>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{formularios.some(f => f.tipo === 'pesquisa_colaboradores') ? '✅' : '⏳'} Form. Equipe (Clima)</span>
                    <button onClick={() => copyLink(`/form/colaboradores?projeto=${id}`)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer' }}>Copiar Link</button>
                  </li>
                </ul>
              </div>

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
                      <button className="btn-primary" style={{ padding: '0 1rem', flexShrink: 0, fontSize: '0.8rem', height: 'auto', background: 'var(--accent-purple)' }} disabled={cisAdding}>
                        {cisAdding ? '...' : '+ Adicionar'}
                      </button>
                    </div>
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
                        <span style={{ fontSize: '1rem' }}>{p.respondido ? '✅' : '⏳'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', textAlign: 'center' }}>Nenhum participante cadastrado.</p>
                )}

                {/* Link de acesso */}
                <button
                  onClick={copiarLinkCis}
                  style={{ width: '100%', background: cisLinkCopiado ? 'rgba(16,185,129,0.15)' : 'rgba(167,139,250,0.1)', border: `1px solid ${cisLinkCopiado ? 'var(--success)' : 'var(--accent-purple)'}`, borderRadius: '8px', color: cisLinkCopiado ? 'var(--success)' : 'var(--accent-purple)', fontWeight: 700, padding: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.3s' }}
                >
                  {cisLinkCopiado ? '✅ Link Copiado!' : '🔗 Copiar Link do Mapeamento'}
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
                      onClick={() => handleRunNext(nextAgent)}
                    >
                      {runningAgent === nextAgent ? 'Processando (aguarde 15s~30s)...' : `Executar Agente ${nextAgent}`}
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
                          <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>Concluído</span>
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
      </div>
    </>
  );
}
