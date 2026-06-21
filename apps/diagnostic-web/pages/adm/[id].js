import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo';
import RespondentesManager from '../../components/RespondentesManager';
import OptInEntrevistasManager from '../../components/OptInEntrevistasManager';
import EntrevistaIASessoes from '../../components/EntrevistaIASessoes';
import MapaMaturidadeCard from '../../components/MapaMaturidadeCard';
import PosicionamentoResults from '../../components/PosicionamentoResults';
import ClustersCard from '../../components/clusters/ClustersCard';
import { CompanyHeader, JourneyStepper, AdminTabs, VisaoGeral, FormulariosTab, PessoasTab, EntregaveisTab, PlaceholderTab } from '../../components/admin-cockpit/Cockpit';
import ExecutionalReadinessPanel from '../../components/executional/ExecutionalReadinessPanel';
import OutputQualityPanel from '../../components/output/OutputQualityPanel';
import StrategicTensionsPanel from '../../components/strategic/StrategicTensionsPanel';
import { supabase } from '../../lib/supabaseClient';
import { generateOutputPdf } from '../../lib/pdf/outputPdf';
import {
  CATALOGO_AGENTES,
  TOTAL_AGENTES,
  getAgenteByNum,
  calcularProgresso,
  podeExecutar,
  formatarTituloAdmin,
  getNomeAdmin,
} from '../../lib/agents/catalog';
import {
  canPrepareBrandMemoryBeforeEditorial,
  getPrimaryAdminAction,
} from '../../lib/agents/adminFlow';
import {
  buildBrandMemoryExportReadiness,
  extractBrandMemoryExportJson,
} from '../../lib/brand-memory/exportValidation';
import { extractExecutionalReadinessFromAgent6Output } from '../../lib/executional-readiness/extract';
import { extractStrategicTensionsFromAgent6Output } from '../../lib/strategic-tensions/extract';
import {
  buildStructuredNotesForm,
  checkpointStatusToDecision,
  parseStructuredNotesForm,
} from '../../lib/checkpoints/structuredNotes';
import { getCisParsed, COMPETENCIAS_KEYS } from '../../lib/cis/parseCis';

// Formato "02. Consolidado da Visão Interna (VI)" — preserva layout
// do painel admin que antes consumia um array AGENT_NAMES hardcoded
// com 13 itens. Agora vem do catálogo (15 agentes, FIX.3).
const nomeAgente = (n) => formatarTituloAdmin(n);

function BrandMemoryExportReadinessPanel({ readiness }) {
  if (!readiness?.items?.length) return null;

  const statusMeta = {
    valid: { label: 'válido', color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' },
    warning: { label: 'aviso', color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
    invalid: { label: 'inválido', color: 'var(--brand-red)', bg: 'rgba(239,68,68,0.1)' },
    missing: { label: 'ausente', color: 'var(--brand-red)', bg: 'rgba(239,68,68,0.1)' },
    not_applicable: { label: 'opcional', color: 'var(--text-secondary)', bg: 'rgba(148,163,184,0.08)' },
  };

  const blockers = readiness.blockingItems?.length || 0;
  return (
    <section className="glass-card" style={{ padding: '1.1rem', marginBottom: '1.25rem', borderColor: readiness.ready ? 'rgba(16,185,129,0.28)' : 'rgba(245,158,11,0.32)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1rem' }}>Prontidão dos exports para Brand Memory</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.45 }}>
            Validação incremental dos blocos que o Agente 16 vai apenas consolidar.
          </p>
        </div>
        <span style={{ borderRadius: 999, padding: '0.28rem 0.7rem', fontSize: '0.78rem', fontWeight: 800, color: readiness.ready ? 'var(--success)' : 'var(--warning)', background: readiness.ready ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${readiness.ready ? 'rgba(16,185,129,0.28)' : 'rgba(245,158,11,0.28)'}` }}>
          {readiness.ready ? 'pronto para A16' : `${blockers} bloqueio${blockers === 1 ? '' : 's'}`}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '0.65rem' }}>
        {readiness.items.map((item) => {
          const meta = statusMeta[item.status] || statusMeta.not_applicable;
          const agentName = getNomeAdmin(item.agent_num);
          const problems = [...(item.errors || []), ...(item.warnings || [])].filter(Boolean);
          return (
            <article key={item.agent_num} style={{ border: `1px solid ${item.blocking ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.08)'}`, background: 'rgba(255,255,255,0.025)', borderRadius: 8, padding: '0.8rem', minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.7rem', alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: 'var(--accent-blue)', fontSize: '0.76rem', fontWeight: 800 }}>A{item.agent_num}</div>
                  <h3 style={{ margin: '0.15rem 0 0', fontSize: '0.86rem', lineHeight: 1.3 }}>{agentName}</h3>
                </div>
                <span style={{ flexShrink: 0, borderRadius: 999, padding: '0.18rem 0.5rem', color: meta.color, background: meta.bg, fontSize: '0.72rem', fontWeight: 800 }}>
                  {meta.label}
                </span>
              </div>
              <div style={{ marginTop: '0.65rem', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Slices:</strong> {item.expected_slices?.join(', ') || 'nenhum'}
              </div>
              {item.found_slices?.length > 0 && (
                <div style={{ marginTop: '0.3rem', fontSize: '0.74rem', color: 'var(--success)' }}>
                  Encontrados: {item.found_slices.join(', ')}
                </div>
              )}
              {problems.length > 0 && (
                <details style={{ marginTop: '0.55rem' }}>
                  <summary style={{ cursor: 'pointer', color: item.blocking ? 'var(--brand-red)' : 'var(--warning)', fontSize: '0.74rem', fontWeight: 800 }}>
                    Ver erros e avisos
                  </summary>
                  <ul style={{ margin: '0.45rem 0 0', paddingLeft: '1rem', color: 'var(--text-secondary)', fontSize: '0.74rem', lineHeight: 1.45 }}>
                    {problems.map((problem, index) => <li key={index}>{problem}</li>)}
                  </ul>
                </details>
              )}
              <div style={{ marginTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.55rem', color: item.blocking ? 'var(--warning)' : 'var(--text-secondary)', fontSize: '0.74rem', lineHeight: 1.45 }}>
                {item.recommended_action}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CuratedEvidencePackPanel({ projectId, pack, outputs, onSaved }) {
  const [form, setForm] = useState(() => buildCuratedEvidenceForm(pack));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm(buildCuratedEvidenceForm(pack));
    setMessage('');
  }, [pack?.id, pack?.updated_at]);

  const hasSources = Boolean(outputs.vi || outputs.ve || outputs.vm);
  if (!hasSources) return null;

  const sourceOutputs = {
    vi_output_id: outputs.vi?.id,
    ve_output_id: outputs.ve?.id,
    vm_output_id: outputs.vm?.id,
  };
  const isReady = pack?.status === 'ready_for_agent_6';

  const save = async (status) => {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        id: pack?.id,
        project_id: projectId,
        pack: {
          project_id: projectId,
          source_outputs: sourceOutputs,
          strong_evidence: parseEvidenceLines(form.strongEvidence, 'strong'),
          weak_evidence: parseEvidenceLines(form.weakEvidence, 'weak'),
          contradictions: parseContradictionLines(form.contradictions),
          evidence_gaps: parseTextLines(form.evidenceGaps),
          sensitive_points: parseTextLines(form.sensitivePoints),
          unresolved_questions: parseTextLines(form.unresolvedQuestions),
          assumptions_to_validate: parseTextLines(form.assumptionsToValidate),
          curator_notes: form.curatorNotes,
          status,
        },
      };
      const res = await fetch('/api/curated-evidence-packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Falha ao salvar curadoria');
      setMessage(status === 'ready_for_agent_6' ? 'Curadoria pronta para o Agente 6.' : 'Rascunho salvo.');
      await onSaved?.();
    } catch (error) {
      setMessage(`Erro: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const lensCard = (label, output) => (
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.025)', borderRadius: 8, padding: '0.75rem', minWidth: 0 }}>
      <div style={{ color: 'var(--accent-blue)', fontWeight: 800, fontSize: '0.78rem' }}>{label}</div>
      {output ? (
        <>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {output.resumo_executivo || output.conclusoes || 'Output disponível.'}
          </p>
          <Link href={`/adm/${projectId}/outputs/${output.agent_num}`} style={{ display: 'inline-block', marginTop: '0.5rem', color: 'var(--accent-blue)', fontSize: '0.76rem', fontWeight: 700, textDecoration: 'none' }}>
            Abrir output
          </Link>
        </>
      ) : (
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: 'var(--warning)' }}>Ainda não gerado.</p>
      )}
    </div>
  );

  return (
    <section className="glass-card" style={{ padding: '1.1rem', marginBottom: '1.25rem', borderColor: isReady ? 'rgba(16,185,129,0.28)' : 'rgba(167,139,250,0.32)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '0.9rem' }}>
        <div>
          <p style={{ margin: 0, color: 'var(--accent-purple, #a78bfa)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
            Antes do Agente 6
          </p>
          <h2 style={{ margin: '0.2rem 0 0', fontSize: '1rem' }}>Curadoria VI/VE/VM</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.45 }}>
            Pacote humano de evidências, lacunas e contradições para orientar a síntese estratégica.
          </p>
        </div>
        <span style={{ borderRadius: 999, padding: '0.28rem 0.7rem', fontSize: '0.78rem', fontWeight: 800, color: isReady ? 'var(--success)' : 'var(--warning)', background: isReady ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${isReady ? 'rgba(16,185,129,0.28)' : 'rgba(245,158,11,0.28)'}` }}>
          {isReady ? 'pronto para Agente 6' : 'rascunho ou pendente'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '0.65rem', marginBottom: '0.9rem' }}>
        {lensCard('VI · Visão Interna', outputs.vi)}
        {lensCard('VE · Visão Externa', outputs.ve)}
        {lensCard('VM · Visão de Mercado', outputs.vm)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '0.75rem' }}>
        <CuratedTextArea label="Evidências fortes" value={form.strongEvidence} onChange={(value) => setForm({ ...form, strongEvidence: value })} placeholder="vi | Cliente valoriza profundidade | Descrição objetiva da evidência" />
        <CuratedTextArea label="Evidências fracas / hipóteses" value={form.weakEvidence} onChange={(value) => setForm({ ...form, weakEvidence: value })} placeholder="vm | Mercado pouco comprovado | Tratar como hipótese até validar" />
        <CuratedTextArea label="Contradições" value={form.contradictions} onChange={(value) => setForm({ ...form, contradictions: value })} placeholder="Título | sinal VI | sinal VE | sinal VM | por que importa" />
        <CuratedTextArea label="Lacunas de evidência" value={form.evidenceGaps} onChange={(value) => setForm({ ...form, evidenceGaps: value })} placeholder="Uma lacuna por linha" />
        <CuratedTextArea label="Pontos sensíveis" value={form.sensitivePoints} onChange={(value) => setForm({ ...form, sensitivePoints: value })} placeholder="Um ponto sensível por linha" />
        <CuratedTextArea label="Perguntas e hipóteses" value={`${form.unresolvedQuestions}${form.unresolvedQuestions && form.assumptionsToValidate ? '\n--- hipóteses ---\n' : ''}${form.assumptionsToValidate}`} onChange={(value) => {
          const [questions, assumptions = ''] = value.split(/\n---\s*hip[oó]teses\s*---\n/i);
          setForm({ ...form, unresolvedQuestions: questions || '', assumptionsToValidate: assumptions || '' });
        }} placeholder={'Perguntas em aberto\n--- hipóteses ---\nHipóteses a validar'} />
      </div>

      <textarea
        className="form-input"
        value={form.curatorNotes}
        onChange={(event) => setForm({ ...form, curatorNotes: event.target.value })}
        placeholder="Notas da curadoria"
        style={{ width: '100%', margin: '0.75rem 0 0', minHeight: 78, resize: 'vertical', fontSize: '0.82rem' }}
      />

      <div style={{ display: 'flex', gap: '0.55rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => save('draft')} disabled={saving} style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.35)', borderRadius: 8, color: 'var(--accent-blue)', padding: '0.55rem 0.9rem', fontWeight: 800, cursor: saving ? 'wait' : 'pointer' }}>
          {saving ? 'Salvando...' : 'Salvar rascunho'}
        </button>
        <button onClick={() => save('ready_for_agent_6')} disabled={saving} className="btn-primary" style={{ padding: '0.55rem 0.9rem', background: 'rgba(16,185,129,0.9)' }}>
          Marcar pronto para Agente 6
        </button>
        {message && <span style={{ color: message.startsWith('Erro') ? 'var(--brand-red)' : 'var(--success)', fontSize: '0.78rem', fontWeight: 700 }}>{message}</span>}
      </div>
    </section>
  );
}

function CuratedTextArea({ label, value, onChange, placeholder }) {
  return (
    <label style={{ display: 'grid', gap: '0.3rem', minWidth: 0 }}>
      <span style={{ color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 800 }}>{label}</span>
      <textarea
        className="form-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', minHeight: 110, resize: 'vertical', fontSize: '0.78rem', margin: 0, lineHeight: 1.45 }}
      />
    </label>
  );
}

function buildCuratedEvidenceForm(pack) {
  return {
    strongEvidence: evidenceToText(pack?.strong_evidence || []),
    weakEvidence: evidenceToText(pack?.weak_evidence || []),
    contradictions: contradictionsToText(pack?.contradictions || []),
    evidenceGaps: textLinesToText(pack?.evidence_gaps || []),
    sensitivePoints: textLinesToText(pack?.sensitive_points || []),
    unresolvedQuestions: textLinesToText(pack?.unresolved_questions || []),
    assumptionsToValidate: textLinesToText(pack?.assumptions_to_validate || []),
    curatorNotes: pack?.curator_notes || '',
  };
}

function evidenceToText(items) {
  return (items || []).map((item) => [
    item.source_lens || 'vi',
    item.title || '',
    item.description || '',
    item.source_reference || '',
  ].join(' | ').replace(/\s+\|\s+$/g, '')).join('\n');
}

function contradictionsToText(items) {
  return (items || []).map((item) => [
    item.title || '',
    item.vi_signal || '',
    item.ve_signal || '',
    item.vm_signal || '',
    item.why_it_matters || '',
  ].join(' | ').replace(/\s+\|\s+$/g, '')).join('\n');
}

function textLinesToText(items) {
  return (items || []).join('\n');
}

function parseEvidenceLines(text, strength) {
  return parseTextLines(text).map((line) => {
    const [lensRaw, titleRaw, descriptionRaw, referenceRaw] = line.split('|').map((part) => part.trim());
    const lens = ['vi', 've', 'vm'].includes(lensRaw) ? lensRaw : 'vi';
    return {
      source_lens: lens,
      title: titleRaw || (['vi', 've', 'vm'].includes(lensRaw) ? descriptionRaw : lensRaw) || 'Evidência',
      description: descriptionRaw || titleRaw || line,
      source_reference: referenceRaw || undefined,
      evidence_strength: strength,
    };
  });
}

function parseContradictionLines(text) {
  return parseTextLines(text).map((line) => {
    const [title, viSignal, veSignal, vmSignal, why] = line.split('|').map((part) => part.trim());
    return {
      title: title || 'Contradição VI/VE/VM',
      vi_signal: viSignal || undefined,
      ve_signal: veSignal || undefined,
      vm_signal: vmSignal || undefined,
      why_it_matters: why || line,
      should_preserve_for_strategy: true,
    };
  });
}

function parseTextLines(text) {
  return String(text || '').split('\n').map((line) => line.trim()).filter(Boolean);
}

function hasUsableAgent16BrandMemoryExport(output) {
  if (!output) return false;
  if (output.brand_memory_export_json && typeof output.brand_memory_export_json === 'object') return true;
  try {
    const parsed = extractBrandMemoryExportJson(output.conteudo || '');
    return !!(parsed?.espansione_diagnostic || parsed?.schema_version);
  } catch {
    return false;
  }
}

function CheckpointStructuredNotesPanel({
  checkpoint,
  form,
  setForm,
  freeformNotes,
  setFreeformNotes,
  approving,
  onDecision,
}) {
  if (!checkpoint) return null;

  const decision = checkpoint.latest_approval_record?.decision || checkpointStatusToDecision(checkpoint.status);
  const isBlocked = ['revision_requested', 'rejected'].includes(decision);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <div className="checkpoint-review-panel">
      <div>
        <div style={{ color: 'var(--warning)', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Checkpoint {checkpoint.checkpoint_num}
        </div>
        <h3 style={{ margin: '0.15rem 0 0', fontSize: '0.98rem' }}>Anotações estruturadas da revisão</h3>
        {isBlocked && (
          <p style={{ margin: '0.35rem 0 0', color: 'var(--brand-red)', fontSize: '0.78rem' }}>
            Este checkpoint está bloqueando a esteira até nova decisão.
          </p>
        )}
      </div>

      <div className="checkpoint-notes-grid">
        <CheckpointTextArea label="Pontos aprovados" value={form.approvedPoints} onChange={(value) => update('approvedPoints', value)} />
        <CheckpointTextArea label="Pontos aprovados com ressalva" value={form.pointsWithReservations} onChange={(value) => update('pointsWithReservations', value)} />
        <CheckpointTextArea label="Ajustes obrigatórios" value={form.requiredAdjustments} onChange={(value) => update('requiredAdjustments', value)} />
        <CheckpointTextArea label="Decisões pendentes" value={form.pendingDecisions} onChange={(value) => update('pendingDecisions', value)} />
        <CheckpointTextArea label="Contexto para próximos agentes" value={form.contextForNextAgents} onChange={(value) => update('contextForNextAgents', value)} />
        <CheckpointTextArea label="Riscos a monitorar" value={form.risksToMonitor} onChange={(value) => update('risksToMonitor', value)} />
      </div>

      <label style={{ display: 'grid', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.76rem', fontWeight: 700 }}>
        Comentário livre
        <textarea
          value={freeformNotes}
          onChange={(event) => setFreeformNotes(event.target.value)}
          rows={3}
          placeholder="Observação geral da aprovação ou revisão"
          style={checkpointInputStyle}
        />
      </label>

      <div className="checkpoint-decision-actions">
        <button className="btn-primary" style={{ padding: '0.65rem' }} onClick={() => onDecision(checkpoint.checkpoint_num, 'approved')} disabled={approving}>
          Aprovar
        </button>
        <button className="btn-secondary" style={{ padding: '0.65rem', borderColor: 'rgba(245,158,11,0.45)', color: 'var(--warning)' }} onClick={() => onDecision(checkpoint.checkpoint_num, 'approved_with_notes')} disabled={approving}>
          Aprovar com ressalvas
        </button>
        <button className="btn-secondary" style={{ padding: '0.65rem', borderColor: 'rgba(245,158,11,0.45)', color: 'var(--warning)' }} onClick={() => onDecision(checkpoint.checkpoint_num, 'revision_requested')} disabled={approving}>
          Solicitar revisão
        </button>
        <button className="btn-secondary" style={{ padding: '0.65rem', borderColor: 'rgba(239,68,68,0.45)', color: 'var(--brand-red)' }} onClick={() => onDecision(checkpoint.checkpoint_num, 'rejected')} disabled={approving}>
          Rejeitar
        </button>
      </div>
    </div>
  );
}

function CheckpointTextArea({ label, value, onChange }) {
  return (
    <label style={{ display: 'grid', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.74rem', fontWeight: 700 }}>
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder="Uma nota por linha"
        style={checkpointInputStyle}
      />
    </label>
  );
}

const checkpointInputStyle = {
  width: '100%',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(3,7,18,0.35)',
  color: 'var(--text-primary)',
  padding: '0.65rem',
  fontSize: '0.78rem',
  lineHeight: 1.45,
  resize: 'vertical',
};

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
  const [engineStage, setEngineStage] = useState('');
  const [loadingBrandMemory, setLoadingBrandMemory] = useState(false);
  const [approving, setApproving] = useState(false);
  const [checkpointNotesForm, setCheckpointNotesForm] = useState(() => buildStructuredNotesForm());
  const [checkpointFreeformNotes, setCheckpointFreeformNotes] = useState('');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [pendingAgentNum, setPendingAgentNum] = useState(null);
  // FIX.22 — picker reusado entre execução de agente e geração do
  // relatório consolidado. Mode decide o destino do modelKey escolhido.
  const [pickerMode, setPickerMode] = useState('agent'); // 'agent' | 'team-report'

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

  // FIX.15 — toggle de escopo EVP (Agente 14)
  const [togglingEvp, setTogglingEvp] = useState(false);

  // Modal do resultado do posicionamento
  const [posModalOpen, setPosModalOpen] = useState(false);

  // Modal de transcrição de entrevista
  const [transcritModal, setTranscritModal] = useState(null);
  const [transcritText, setTranscritText] = useState('');
  const [transcritNome, setTranscritNome] = useState('');
  const [transcritSaving, setTranscritSaving] = useState(false);

  // Cockpit da jornada (redesign por abas)
  const [tab, setTab] = useState('visao');
  const [cockpit, setCockpit] = useState(null);

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
        fetch(`/api/adm/cockpit/${id}`).then((r) => r.json()).then((j) => { if (j.success) setCockpit(j.cockpit); }).catch(() => {});
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

  useEffect(() => {
    const pending = [...(data?.pendingCheckpoints || [])].sort((a, b) => a.checkpoint_num - b.checkpoint_num)[0];
    const record = pending?.latest_approval_record;
    setCheckpointNotesForm(buildStructuredNotesForm(record?.structured_notes));
    setCheckpointFreeformNotes(record?.freeform_notes || pending?.notas || '');
  }, [data?.pendingCheckpoints?.[0]?.id, data?.pendingCheckpoints?.[0]?.status]);

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

  const handleCheckpointDecision = async (checkpointNum, decision) => {
    setApproving(true);
    setEngineError('');
    try {
      const res = await fetch('/api/engine/checkpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projetoId: id,
          checkpointNum,
          decision,
          structuredNotes: parseStructuredNotesForm(checkpointNotesForm),
          freeformNotes: checkpointFreeformNotes,
        })
      });
      const json = await res.json();
      if (!json.success) {
        setEngineError(json.error || 'Falha ao atualizar checkpoint.');
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
    { key: 'claude-sonnet', label: 'Claude Sonnet 4.6', desc: 'Equilibrado', provider: 'Anthropic' },
    { key: 'gpt-5.4', label: 'GPT-5.4', desc: 'Alta capacidade', provider: 'OpenAI' },
    { key: 'gpt-5.4-mini', label: 'GPT-5.4 Mini', desc: 'Rápido e econômico', provider: 'OpenAI' },
  ];

  const handleRequestRun = (agentNum) => {
    if (Number(agentNum) === 6) {
      const outputsList = Array.isArray(data?.outputs) ? data.outputs : [];
      const hasAgent6 = outputsList.some((output) => Number(output.agent_num) === 6);
      const curatedReady = data?.curatedEvidencePack?.status === 'ready_for_agent_6';
      if (!hasAgent6 && !curatedReady) {
        const ok = window.confirm(
          'A Curadoria VI/VE/VM ainda não está marcada como pronta para o Agente 6.\n\nVocê pode seguir, mas a síntese estratégica será gerada sem o pacote humano de evidências, lacunas e contradições. Deseja rodar mesmo assim?'
        );
        if (!ok) {
          setEngineError('Prepare a Curadoria VI/VE/VM e marque como pronta antes de rodar o Agente 6.');
          return;
        }
      }
    }
    if (Number(agentNum) === 16) {
      setEngineError('');
      runAgentWithModel(agentNum);
      return;
    }
    setPickerMode('agent');
    setPendingAgentNum(agentNum);
    setShowModelPicker(true);
    setEngineError('');
  };

  const handleLoadBrandMemory = async () => {
    setLoadingBrandMemory(true);
    setEngineError('');
    try {
      const res = await fetch('/api/brand-memory/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projetoId: id }),
      });
      const json = await res.json();
      if (!json.success) {
        setEngineError(json.error || 'Falha ao carregar Brand Memory.');
        return;
      }
      await loadData();
      alert('Brand Memory carregada. A Agência IA já pode usar a memória ativa.');
    } catch (err) {
      setEngineError(`Falha ao carregar Brand Memory: ${err.message || err}`);
    } finally {
      setLoadingBrandMemory(false);
    }
  };

  // FIX.22 — abre o mesmo picker em modo "team-report" (não tem agentNum
  // associado). Quando o user escolhe modelo, handleRunWithModel
  // dispatcha pra runTeamReport(modelKey).
  const handleRequestTeamReport = () => {
    if (!(data?.cisAssessments?.length > 0)) return;
    setPickerMode('team-report');
    setPendingAgentNum(null);
    setShowModelPicker(true);
  };

  // Agentes que têm enrichContext pesado e precisam rodar em 2 etapas
  // pra não estourar o cap de 300s do serverless (Vercel Fluid Compute).
  // Por enquanto só o Agente 5 (deep research via Claude web_search).
  const AGENTES_COM_ENRICH_PESADO = new Set([5]);

  const parseApiError = (res, raw, json) => (
    json?.error
      || (res.status === 504 ? 'Timeout (504). Agente demorou demais — tente de novo ou escolha outro modelo.'
      : res.status === 413 ? 'Payload grande demais (413).'
      : res.status >= 500 ? `Erro ${res.status} no servidor.${raw ? ' ' + raw.slice(0, 200) : ''}`
      : `HTTP ${res.status}: ${raw.slice(0, 200) || 'sem corpo'}`)
  );

  const fetchEngine = async (endpoint, body) => {
    const res = await fetch(`/api/engine/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const raw = await res.text();
    let json = null;
    try { json = JSON.parse(raw); } catch {}
    return { res, raw, json };
  };

  const runAgentWithModel = async (agentNum, modelKey) => {
    setRunningAgent(agentNum);
    setEngineError('');
    try {
      let precomputedEnrichment;
      if (AGENTES_COM_ENRICH_PESADO.has(agentNum)) {
        // Etapa 1/2: pesquisa (deep research + Tavily)
        setEngineStage('Etapa 1/2: pesquisando mercado…');
        const r1 = await fetchEngine('enrich', { projetoId: id, agentNum });
        if (!r1.res.ok || !r1.json?.success) {
          setEngineError(parseApiError(r1.res, r1.raw, r1.json));
          return;
        }
        precomputedEnrichment = r1.json.enrichment;
        setEngineStage('Etapa 2/2: gerando análise…');
      }
      const r2 = await fetchEngine('run', {
        projetoId: id, agentNum, modelKey,
        ...(precomputedEnrichment ? { precomputedEnrichment } : {}),
      });
      if (!r2.res.ok || !r2.json?.success) {
        setEngineError(parseApiError(r2.res, r2.raw, r2.json));
      } else {
        await loadData();
      }
    } catch (err) {
      setEngineError(`Falha de rede: ${err.message || err}`);
    } finally {
      setRunningAgent(null);
      setEngineStage('');
    }
  };

  const handleRunWithModel = async (modelKey) => {
    setShowModelPicker(false);
    // FIX.22 — picker reusado: dispatcha por mode.
    if (pickerMode === 'team-report') {
      await downloadDiscReport(modelKey);
      return;
    }
    await runAgentWithModel(pendingAgentNum, modelKey);
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
  const [generatingTeamReport, setGeneratingTeamReport] = useState(false);

  const downloadDiscReport = async (modelKey) => {
    const assessments = data?.cisAssessments || [];
    if (assessments.length === 0) {
      alert('Nenhum mapeamento DISC respondido ainda.');
      return;
    }
    if (!modelKey) {
      // FIX.22 — fluxo correto agora é via picker (handleRequestTeamReport
      // → handleRunWithModel → downloadDiscReport(modelKey)). Se chamado
      // direto sem key, abre o picker.
      handleRequestTeamReport();
      return;
    }

    // FIX.16 — antes esta função lia diretamente scores_json.discA /
    // .leadership / .competencies. O banco tem DOIS formatos (legado usa
    // dA / lead / comp). Quando todos eram do formato legado, compMed
    // saía vazio e topComp = compMed[0] virava undefined, quebrando o
    // template do sumário. Agora delega ao helper canônico getCisParsed
    // (mesmo usado pelos resolvers de viz e pelo Agente 2) e protege
    // todos os pontos onde uma agregação pode estar vazia.
    setGeneratingTeamReport(true);
    try {
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
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(text, marginX, y); y += size + 6;
        doc.setTextColor(0, 0, 0);
      };
      const paragraph = (text, size = 10, color = [40, 40, 40]) => {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(size);
        doc.setTextColor(color[0], color[1], color[2]);
        const lines = doc.splitTextToSize(String(text || ''), maxW);
        for (const line of lines) { needSpace(size + 3); doc.text(line, marginX, y); y += size + 3; }
        doc.setTextColor(0, 0, 0);
      };
      const barRow = (label, value, max = 100, color = [56, 189, 248]) => {
        needSpace(22);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(40, 40, 40);
        doc.text(label, marginX, y);
        const v = Number.isFinite(value) ? value : 0;
        const pct = Math.max(0, Math.min(1, v / max));
        const barX = marginX + 140;
        const barW = maxW - 180;
        doc.setFillColor(230, 230, 230); doc.rect(barX, y - 8, barW, 8, 'F');
        doc.setFillColor(color[0], color[1], color[2]); doc.rect(barX, y - 8, barW * pct, 8, 'F');
        doc.setFontSize(9); doc.text(String(Math.round(v)), barX + barW + 8, y);
        y += 14;
      };
      const drawLine = () => { doc.setDrawColor(220, 220, 220); doc.line(marginX, y, pageW - marginX, y); y += 14; };

      // ==== Agregações via getCisParsed (suporta ambos formatos do banco) ====
      const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

      const parsed = assessments
        .map(a => ({ raw: a, p: getCisParsed(a) }))
        .filter(x => x.p !== null);

      const disc = { D: [], I: [], S: [], C: [] };
      const discA = { D: [], I: [], S: [], C: [] };
      const compsAcc = {};
      const estiloCount = {};
      const perfilCount = {};
      const jungCount = {};

      for (const { raw, p } of parsed) {
        for (const k of ['D', 'I', 'S', 'C']) {
          if (typeof p.disc[k] === 'number') disc[k].push(p.disc[k]);
          if (typeof p.disc_adaptado[k] === 'number') discA[k].push(p.disc_adaptado[k]);
        }
        for (const k of COMPETENCIAS_KEYS) {
          const v = p.competencias[k];
          if (typeof v === 'number') {
            if (!compsAcc[k]) compsAcc[k] = [];
            compsAcc[k].push(v);
          }
        }
        if (p.estilo_lideranca) {
          estiloCount[p.estilo_lideranca] = (estiloCount[p.estilo_lideranca] || 0) + 1;
        }
        if (p.jung?.tipo) {
          jungCount[p.jung.tipo] = (jungCount[p.jung.tipo] || 0) + 1;
        }
        const label = p.perfil_label || raw?.scores_json?.profileLabel || raw?.scores_json?.profile || '—';
        perfilCount[label] = (perfilCount[label] || 0) + 1;
      }

      const discMed = Object.fromEntries(['D','I','S','C'].map(k => [k, avg(disc[k])]));
      const discAMed = Object.fromEntries(['D','I','S','C'].map(k => [k, avg(discA[k])]));
      const compMed = Object.entries(compsAcc)
        .map(([k, arr]) => ({ nome: k, media: avg(arr) }))
        .sort((a, b) => b.media - a.media);

      // FIX.21 — flag pra esconder DISC Adaptado quando o instrumento
      // não mediu (todas as 4 chaves zeradas após avg de array vazio).
      const dAHasData = discA.D.length + discA.I.length + discA.S.length + discA.C.length > 0;

      // FIX.21 — gerar narrativas executivas via Gemini ANTES de montar
      // o PDF. Se a chamada falhar (rede, quota, 5xx), o PDF é gerado
      // com fallback determinístico (Sumário curto + Leitura Estratégica
      // de bullets condicionais) — sem bloquear o download.
      const projetoNomeReq = data?.projeto?.cliente || data?.projeto?.nome || '';
      let narratives = null;
      try {
        const narrRes = await fetch('/api/relatorio/team-narratives', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelKey,
            projeto_nome: projetoNomeReq,
            n_respondentes: assessments.length,
            disc_natural: discMed,
            disc_adaptado: dAHasData ? discAMed : null,
            competencias_top: compMed.slice(0, 5),
            competencias_gap: compMed.slice(-5).reverse(),
            perfis_distribuicao: Object.entries(perfilCount).sort((a, b) => b[1] - a[1]),
            estilos_distribuicao: Object.entries(estiloCount).sort((a, b) => b[1] - a[1]),
            jung_distribuicao: Object.entries(jungCount).sort((a, b) => b[1] - a[1]),
            individuos_resumo: parsed.map(({ raw, p }) => ({
              nome: raw.nome || raw.email || '—',
              perfil: p.perfil_label || raw?.scores_json?.profileLabel || raw?.scores_json?.profile || '—',
              disc_dominante: p.disc?.dominante || null,
              jung: p.jung?.tipo || null,
            })),
          }),
        });
        const narrJson = await narrRes.json();
        if (narrJson?.success && narrJson.narratives) {
          narratives = narrJson.narratives;
        } else {
          console.warn('[downloadDiscReport] narrativas falharam:', narrJson?.error);
        }
      } catch (narrErr) {
        console.warn('[downloadDiscReport] narrativas falharam:', narrErr);
      }

      // ==== Capa ====
      doc.setFont('helvetica', 'bold'); doc.setFontSize(24); doc.setTextColor(0, 65, 152);
      doc.text('Espansione', marginX, y); y += 28;
      doc.setFontSize(16); doc.setTextColor(40, 40, 40);
      doc.text('Relatório Comportamental — Perfil do Time', marginX, y); y += 22;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(12); doc.setTextColor(100, 100, 100);
      const projetoNome = projetoNomeReq;
      doc.text(projetoNome, marginX, y); y += 16;
      doc.setFontSize(10); doc.setTextColor(150, 150, 150);
      doc.text(`${assessments.length} respondente(s)  •  ${new Date().toLocaleDateString('pt-BR')}`, marginX, y);
      y += 20; drawLine();

      // ==== Panorama do Time (narrativa) — com fallback ====
      // FIX.21 — substitui o "Sumário Executivo" determinístico curto.
      heading('Panorama do Time');
      if (narratives?.panorama) {
        paragraph(narratives.panorama);
      } else {
        // Fallback determinístico (caso a chamada ao Gemini tenha falhado)
        const dimDomEntry = Object.entries(discMed).sort((a, b) => b[1] - a[1])[0];
        const dimBaixaEntry = Object.entries(discMed).sort((a, b) => a[1] - b[1])[0];
        const perfisEntry = Object.entries(perfilCount).sort((a, b) => b[1] - a[1])[0];
        const partes = [`O time de ${assessments.length} respondente(s) foi analisado.`];
        if (dimDomEntry && dimBaixaEntry && Number.isFinite(dimDomEntry[1])) {
          partes.push(
            `Apresenta predominância em ${dimDomEntry[0]} (${Math.round(dimDomEntry[1])}) ` +
            `e pontuação mais baixa em ${dimBaixaEntry[0]} (${Math.round(dimBaixaEntry[1])}) no DISC natural agregado.`,
          );
        }
        if (perfisEntry) {
          partes.push(`O perfil mais representado é "${perfisEntry[0]}" (${perfisEntry[1]}/${assessments.length}).`);
        }
        if (compMed.length > 0) {
          const topComp = compMed[0];
          const bottomComp = compMed[compMed.length - 1];
          partes.push(
            `A competência com maior maturidade média é "${topComp.nome}" (${topComp.media.toFixed(1)}) ` +
            `e a mais frágil é "${bottomComp.nome}" (${bottomComp.media.toFixed(1)}).`,
          );
        }
        paragraph(partes.join(' '));
      }

      // ==== DISC Natural Agregado ====
      heading('DISC Natural (médias do time)');
      barRow('Dominância (D)', discMed.D, 100, [220, 38, 38]);
      barRow('Influência (I)', discMed.I, 100, [245, 158, 11]);
      barRow('Estabilidade (S)', discMed.S, 100, [16, 185, 129]);
      barRow('Conformidade (C)', discMed.C, 100, [56, 189, 248]);

      // ==== DISC Adaptado — só se medido ====
      if (dAHasData) {
        heading('DISC Adaptado (como o time se ajusta em contexto de trabalho)');
        barRow('Dominância (D)', discAMed.D, 100, [220, 38, 38]);
        barRow('Influência (I)', discAMed.I, 100, [245, 158, 11]);
        barRow('Estabilidade (S)', discAMed.S, 100, [16, 185, 129]);
        barRow('Conformidade (C)', discAMed.C, 100, [56, 189, 248]);
      }

      // ==== Estilos de Liderança (contagem) ====
      if (Object.keys(estiloCount).length > 0) {
        heading('Estilos de Liderança Dominantes — Distribuição');
        Object.entries(estiloCount).sort((a, b) => b[1] - a[1]).forEach(([estilo, count]) => {
          paragraph(`• ${estilo}: ${count} respondente(s)`, 10);
        });
      }

      // ==== Distribuição Jung/MBTI (se medida) ====
      if (Object.keys(jungCount).length > 0) {
        heading('Tipos Jung/MBTI — Distribuição');
        Object.entries(jungCount).sort((a, b) => b[1] - a[1]).forEach(([tipo, count]) => {
          paragraph(`• ${tipo}: ${count} respondente(s)`, 10);
        });
      }

      // ==== Forças do Time (narrativa + bars) ====
      if (compMed.length > 0) {
        heading('Forças do Time');
        if (narratives?.forcas) paragraph(narratives.forcas);
        nl(4);
        paragraph('Top 5 competências (médias):', 10, [40, 40, 40]);
        compMed.slice(0, 5).forEach(c => barRow(c.nome, c.media, 10, [16, 185, 129]));
      }

      // ==== Desenvolvimento (narrativa + bars) ====
      if (compMed.length > 0) {
        heading('Desenvolvimento do Time');
        if (narratives?.desenvolvimento) paragraph(narratives.desenvolvimento);
        nl(4);
        paragraph('Bottom 5 competências (médias):', 10, [40, 40, 40]);
        compMed.slice(-5).reverse().forEach(c => barRow(c.nome, c.media, 10, [244, 63, 94]));
      }

      // ==== Distribuição de Perfis ====
      heading('Distribuição de Perfis');
      Object.entries(perfilCount).sort((a, b) => b[1] - a[1]).forEach(([label, count]) => {
        paragraph(`• ${label} — ${count} respondente(s)`, 10);
      });

      // ==== Dinâmicas do Time (narrativa) ====
      if (narratives?.dinamicas) {
        heading('Dinâmicas do Time');
        paragraph(narratives.dinamicas);
      }

      // ==== Perfil Individual ====
      heading('Perfis Individuais');
      for (const { raw, p } of parsed) {
        const nome = raw.nome || raw.email || '—';
        const perfil = p.perfil_label || raw?.scores_json?.profileLabel || raw?.scores_json?.profile || '—';
        const d = p.disc;
        needSpace(40);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(40, 40, 40);
        doc.text(nome, marginX, y); y += 12;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(100, 100, 100);
        doc.text(perfil, marginX, y); y += 11;
        doc.setFontSize(9); doc.setTextColor(40, 40, 40);
        doc.text(`DISC: D=${d.D ?? '—'}  I=${d.I ?? '—'}  S=${d.S ?? '—'}  C=${d.C ?? '—'}`, marginX, y);
        y += 16;
      }

      // ==== Recomendações para a Liderança (narrativa, com fallback) ====
      heading('Recomendações para a Liderança');
      if (narratives?.recomendacoes) {
        paragraph(narratives.recomendacoes);
      } else {
        // Fallback determinístico
        const gaps = [];
        if (Number.isFinite(discMed.S) && discMed.S < 50) gaps.push('Baixa estabilidade (S) agregada — time pode ter dificuldade em processos longos e consistência operacional.');
        if (Number.isFinite(discMed.D) && discMed.D > 65) gaps.push('Alta dominância (D) agregada — risco de conflitos entre múltiplos protagonistas, cuidado com alinhamento.');
        if (Number.isFinite(discMed.C) && discMed.C < 50) gaps.push('Baixa conformidade (C) agregada — atenção com rigor analítico e aderência a processos.');
        if (Number.isFinite(discMed.I) && discMed.I < 45) gaps.push('Baixa influência (I) agregada — time mais técnico que relacional, possível lacuna em comunicação externa.');
        if (gaps.length === 0) {
          gaps.push('Distribuição equilibrada entre as quatro dimensões DISC, sem alertas extremos.');
        }
        gaps.forEach(t => paragraph(`• ${t}`));
      }

      nl(20);
      doc.setFontSize(8); doc.setTextColor(150, 150, 150);
      const rodape = narratives
        ? 'Gerado automaticamente por Espansione • Análise por gemini-3.5-flash'
        : 'Gerado automaticamente por Espansione • Análise textual indisponível (Gemini falhou) — dados quantitativos íntegros';
      doc.text(rodape, marginX, y);

      const filename = `${projetoNome || 'Projeto'}_Relatorio_Comportamental.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('[downloadDiscReport]', err);
      alert(`Erro ao gerar PDF: ${err?.message || String(err)}`);
    } finally {
      setGeneratingTeamReport(false);
    }
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
  const latestOutputs = Object.values(
    [...outputs]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .reduce((acc, output) => {
        if (!acc[output.agent_num]) acc[output.agent_num] = output;
        return acc;
      }, {})
  );

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
  // FIX.15 — EVP (Agente 14, modular) entra no denominador via flag
  // explícita projetos.tem_evp (antes era proxy galinha-e-ovo:
  // includes(14), que escondia o agente até ele já ter rodado).
  const agentNumsCompletos = latestOutputs.map(o => o.agent_num);
  const projetoTemEvp = !!data?.projeto?.tem_evp;
  const progresso = calcularProgresso(agentNumsCompletos, projetoTemEvp);
  const nextAgent = progresso.proximoAgente?.agent_num || null;
  
  const { pendingCheckpoints = [] } = data;
  const pendingCkpt = (pendingCheckpoints && pendingCheckpoints.length > 0) 
    ? [...pendingCheckpoints].sort((a,b) => a.checkpoint_num - b.checkpoint_num)[0]
    : null;
  const checkpointAgent = pendingCkpt ? CATALOGO_AGENTES.find(a => a.checkpoint === pendingCkpt.checkpoint_num) : null;
  const checkpointOutput = checkpointAgent ? latestOutputs.find(o => o.agent_num === checkpointAgent.agent_num) : null;
  const hasAgentOutput = (agentNum) => agentNumsCompletos.includes(agentNum);
  const curatedEvidencePack = data.curatedEvidencePack || null;
  const viOutput = latestOutputs.find(o => Number(o.agent_num) === 2) || null;
  const veOutput = latestOutputs.find(o => Number(o.agent_num) === 4) || null;
  const vmOutput = latestOutputs.find(o => Number(o.agent_num) === 5) || null;
  const brandMemoryExportDeps = podeExecutar(16, agentNumsCompletos);
  const brandMemoryExportReadiness = buildBrandMemoryExportReadiness(latestOutputs, { includeEvp: projetoTemEvp });
  const brandMemoryOutput = latestOutputs.find(o => o.agent_num === 16) || null;
  const brandMemoryExportDone = hasAgentOutput(16);
  const brandMemoryExportValid = hasUsableAgent16BrandMemoryExport(brandMemoryOutput);
  const checkpointStrategicTensions = checkpointOutput?.agent_num === 6
    ? extractStrategicTensionsFromAgent6Output(checkpointOutput)
    : null;
  const checkpointExecutionalReadiness = checkpointOutput?.agent_num === 6
    ? extractExecutionalReadinessFromAgent6Output(checkpointOutput)
    : null;
  const brandMemoryExportInvalid = brandMemoryExportDone && !brandMemoryExportValid;
  const brandMemoryExportReady = (!brandMemoryExportDone || brandMemoryExportInvalid) && brandMemoryExportDeps.ok && brandMemoryExportReadiness.ready && !pendingCkpt;
  const brandMemoryMissingDeps = brandMemoryExportDeps.faltando || [];
  const editorialOutputDone = hasAgentOutput(15);
  const primaryAction = getPrimaryAdminAction({
    pendingCheckpoint: pendingCkpt,
    nextAgent,
    brandMemoryExportReady,
    brandMemoryExportValid,
    brandMemoryExportInvalid,
  });
  const brandMemoryIsPrimary = ['generate_brand_memory', 'load_brand_memory'].includes(primaryAction.type);
  const showEditorialPendingBrandMemoryNotice = canPrepareBrandMemoryBeforeEditorial({
    brandMemoryExportReady,
    brandMemoryExportValid,
    hasEditorialOutput: editorialOutputDone,
  });
  const fluxoAgentes = CATALOGO_AGENTES
    .filter(a => !a.modular || a.agent_num === 16 || (a.agent_num === 14 && projetoTemEvp))
    .sort((a, b) => a.ordem_exibicao - b.ordem_exibicao);
  const etapaAtualLabel = pendingCkpt
    ? `Checkpoint ${pendingCkpt.checkpoint_num} pendente`
    : primaryAction.type === 'generate_brand_memory'
      ? (brandMemoryExportInvalid ? 'Brand Memory precisa ser regenerada' : 'Brand Memory pronta para exportação')
      : primaryAction.type === 'load_brand_memory'
        ? 'Brand Memory pronta para carregar'
    : nextAgent
      ? nomeAgente(nextAgent)
      : 'Esteira editorial completa';
  const etapaAtualColor = pendingCkpt
    ? 'var(--warning)'
    : brandMemoryIsPrimary
      ? 'var(--success)'
      : nextAgent
        ? 'var(--accent-blue)'
        : 'var(--success)';

  // Render formatters
  const renderMarkdownText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => <span key={i}>{line}<br/></span>);
  };

  const COCKPIT_TABS = [
    { key: 'visao', label: 'Visão Geral' },
    { key: 'esteira', label: 'Diagnóstico (esteira)' },
    { key: 'formularios', label: 'Formulários' },
    { key: 'pessoas', label: 'Pessoas' },
    { key: 'entregaveis', label: 'Entregáveis' },
    { key: 'trilhas', label: 'Trilhas' },
    { key: 'historico', label: 'Histórico' },
    { key: 'observacoes', label: 'Observações' },
    { key: 'logs', label: 'Logs' },
  ];
  function onCockpitAction(action) {
    const m = action?.module;
    if (m === 'identity') { window.open(`/mapa-identidade/${id}`, '_blank'); return; }
    if (m === 'disc') { setTab('esteira'); return; }
    if (m === 'report') { setTab('entregaveis'); return; }
    setTab('visao');
  }

  return (
    <>
      <Head>
        <title>Espansione | Painel de Controle</title>
      </Head>
      <div className="page-container">
        <main className="container admin-project-page">
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
          
          {cockpit ? (
            <>
              <CompanyHeader company={cockpit.company} nextAction={cockpit.summary?.next_action} onAction={onCockpitAction} />
              <JourneyStepper journey={cockpit.journey} current={cockpit.current_step} />
            </>
          ) : (
            <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>{projeto.cliente}</h1>
          )}

          <AdminTabs active={tab} onChange={setTab} tabs={COCKPIT_TABS} />

          {cockpit && tab === 'visao' && <VisaoGeral cockpit={cockpit} projetoId={id} onAction={onCockpitAction} />}
          {cockpit && tab === 'formularios' && <FormulariosTab cockpit={cockpit} projetoId={id} />}
          {cockpit && tab === 'pessoas' && <PessoasTab cockpit={cockpit} />}
          {cockpit && tab === 'entregaveis' && <EntregaveisTab cockpit={cockpit} projetoId={id} />}
          {tab === 'trilhas' && <PlaceholderTab titulo="Trilhas de Aprofundamento" texto="Liberadas quando o relatório indicar recomendações. Contextos: Sócio e Líder. (Em construção)" />}
          {tab === 'historico' && <PlaceholderTab titulo="Histórico" texto="Linha do tempo da jornada da empresa. (Em construção)" />}
          {tab === 'observacoes' && <PlaceholderTab titulo="Observações internas" texto="Notas da equipe Espansione sobre este cliente. (Em construção)" />}
          {tab === 'logs' && <PlaceholderTab titulo="Logs" texto="Automações, geração de PDF, chamadas de IA e eventos do sistema. (Em construção)" />}

          {tab === 'esteira' && (<>
          <section className={`glass-card outline-glow admin-flow-card${pendingCkpt ? ' admin-flow-card--checkpoint' : ''}`}>
            <div className="admin-flow-overview">
              <div className="admin-flow-status">
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                  Fluxo principal
                </div>
                <div style={{ color: etapaAtualColor, fontSize: '1rem', fontWeight: 800 }}>
                  {etapaAtualLabel}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                  {progresso.completos}/{progresso.total} etapas editoriais concluídas · {progresso.pct}%
                </div>
              </div>

              <div className="admin-flow-steps" style={{ gridTemplateColumns: `repeat(${fluxoAgentes.length}, minmax(34px, 1fr))` }}>
                {fluxoAgentes.map((agent) => {
                  const done = hasAgentOutput(agent.agent_num);
                  const current = !pendingCkpt && (
                    (brandMemoryIsPrimary && agent.agent_num === 16)
                    || (!brandMemoryIsPrimary && nextAgent === agent.agent_num)
                  );
                  const blocked = !done && !current && !podeExecutar(agent.agent_num, agentNumsCompletos).ok;
                  const isMemory = agent.agent_num === 16;
                  const bg = done
                    ? 'rgba(16,185,129,0.18)'
                    : current
                      ? 'rgba(56,189,248,0.22)'
                      : blocked
                        ? 'rgba(148,163,184,0.08)'
                        : 'rgba(255,255,255,0.05)';
                  const border = done
                    ? 'rgba(16,185,129,0.5)'
                    : current
                      ? 'rgba(56,189,248,0.65)'
                      : 'rgba(255,255,255,0.09)';
                  return (
                    <div
                      key={agent.agent_num}
                      title={`${agent.nome_curto} · ${getNomeAdmin(agent.agent_num)}`}
                      style={{ minWidth: '34px', height: '36px', display: 'grid', placeItems: 'center', borderRadius: '8px', border: `1px solid ${border}`, background: bg, color: done ? 'var(--success)' : current ? 'var(--accent-blue)' : 'var(--text-secondary)', fontWeight: 800, fontSize: '0.78rem', position: 'relative' }}
                    >
                      {isMemory ? 'BM' : agent.agent_num}
                      {current && <span style={{ position: 'absolute', left: '50%', bottom: '-7px', width: 6, height: 6, transform: 'translateX(-50%)', borderRadius: 999, background: 'var(--accent-blue)' }} />}
                    </div>
                  );
                })}
              </div>

              <div className="admin-flow-action">
                {primaryAction.type === 'approve_checkpoint' ? (
                  <CheckpointStructuredNotesPanel
                    checkpoint={pendingCkpt}
                    form={checkpointNotesForm}
                    setForm={setCheckpointNotesForm}
                    freeformNotes={checkpointFreeformNotes}
                    setFreeformNotes={setCheckpointFreeformNotes}
                    approving={approving}
                    onDecision={handleCheckpointDecision}
                  />
                ) : primaryAction.type === 'generate_brand_memory' ? (
                  <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(16,185,129,0.9)' }}
                    disabled={runningAgent !== null}
                    onClick={() => handleRequestRun(primaryAction.agentNum)}
                  >
                    {runningAgent === primaryAction.agentNum
                      ? (engineStage || 'Gerando export...')
                      : primaryAction.label}
                  </button>
                ) : primaryAction.type === 'load_brand_memory' ? (
                  <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(16,185,129,0.9)' }}
                    disabled={loadingBrandMemory}
                    onClick={handleLoadBrandMemory}
                  >
                    {loadingBrandMemory ? 'Carregando...' : primaryAction.label}
                  </button>
                ) : primaryAction.type === 'run_agent' ? (
                  <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '0.75rem' }}
                    disabled={runningAgent !== null}
                    onClick={() => handleRequestRun(primaryAction.agentNum)}
                  >
                    {runningAgent !== null && runningAgent === primaryAction.agentNum ? (engineStage || 'Processando...') : primaryAction.label}
                  </button>
                ) : (
                  <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>
                    Fluxo pronto
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href={`/adm/${id}/curadoria`} style={{ color: 'var(--accent-purple, #a78bfa)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 700 }}>Curadoria</Link>
                  <Link href={`/adm/${id}/deliverable`} style={{ color: 'var(--brand-blue-light)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 700 }}>Entregável</Link>
                  <Link href={`/adm/${id}/agency`} style={{ color: 'var(--accent-blue)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 700 }}>Agência IA</Link>
                  {brandMemoryExportDone && <Link href={`/adm/${id}/outputs/16`} style={{ color: 'var(--success)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 700 }}>Brand Memory</Link>}
                </div>
                {engineError && (
                  <div style={{ color: 'var(--brand-red)', fontSize: '0.78rem', textAlign: 'center' }}>
                    {engineError.includes('Missing fields') ? 'Faltam dados antes de rodar este agente.' : engineError}
                  </div>
                )}
                {brandMemoryExportInvalid && primaryAction.type !== 'generate_brand_memory' && !engineError && (
                  <div style={{ color: 'var(--brand-red)', fontSize: '0.78rem', textAlign: 'center' }}>
                    A Brand Memory antiga não tem export válido. Regere antes de usar a Agência.
                  </div>
                )}
                {!brandMemoryExportReadiness.ready && brandMemoryExportDeps.ok && !engineError && (
                  <div style={{ color: 'var(--brand-red)', fontSize: '0.78rem', textAlign: 'center' }}>
                    Exports da Brand Memory incompletos. Veja o painel de prontidão antes do Agente 16.
                  </div>
                )}
                {showEditorialPendingBrandMemoryNotice && !engineError && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textAlign: 'center' }}>
                    Entregável editorial final ainda não foi gerado, mas a Brand Memory já pode ser preparada.
                  </div>
                )}
              </div>
            </div>
            {pendingCkpt && (
              <div style={{ marginTop: '1rem' }}>
                <OutputQualityPanel metadata={checkpointOutput?.quality_metadata} />
                <StrategicTensionsPanel slice={checkpointStrategicTensions} compact />
                <ExecutionalReadinessPanel readiness={checkpointExecutionalReadiness} compact />
              </div>
            )}
          </section>

          <CuratedEvidencePackPanel
            projectId={id}
            pack={curatedEvidencePack}
            outputs={{ vi: viOutput, ve: veOutput, vm: vmOutput }}
            onSaved={loadData}
          />

          <BrandMemoryExportReadinessPanel readiness={brandMemoryExportReadiness} />

          <div className="admin-project-grid">
            <aside className="admin-project-sidebar">
              <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 0.85rem' }}>Preparação</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <Link href={`/adm/${id}/curadoria`} style={{ textDecoration: 'none', color: 'var(--text-primary)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 8, padding: '0.75rem', background: 'rgba(167,139,250,0.05)' }}>
                    <div style={{ color: '#a78bfa', fontWeight: 800, fontSize: '0.82rem' }}>Curadoria</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem', marginTop: '0.25rem' }}>Achados aprováveis</div>
                  </Link>
                  <Link href={`/adm/${id}/agency`} style={{ textDecoration: 'none', color: 'var(--text-primary)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: 8, padding: '0.75rem', background: 'rgba(56,189,248,0.05)' }}>
                    <div style={{ color: 'var(--accent-blue)', fontWeight: 800, fontSize: '0.82rem' }}>Agência IA</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem', marginTop: '0.25rem' }}>Pedidos de marketing</div>
                  </Link>
                </div>
              </div>

              {/* Esquerda: Informações Gerais */}
              {/* Card: Responsável do Projeto */}
              <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
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

              {/* FIX.29 (Fase B) — Card: Clusters de Comunicação (insumo do Agente 13) */}
              <ClustersCard projetoId={id} />

              {/* FIX.15 — Card: Escopo do Projeto (toggle EVP) */}
              <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, marginBottom: '0.75rem' }}>Escopo do Projeto</h3>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: togglingEvp ? 'wait' : 'pointer', opacity: togglingEvp ? 0.6 : 1 }}>
                  <input
                    type="checkbox"
                    checked={!!projeto.tem_evp}
                    disabled={togglingEvp}
                    onChange={async (e) => {
                      const novoValor = e.target.checked;
                      setTogglingEvp(true);
                      try {
                        const res = await fetch(`/api/projetos/${id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ tem_evp: novoValor }),
                        });
                        const json = await res.json();
                        if (!res.ok || !json.success) throw new Error(json.error || 'Falha ao salvar');
                        await loadData();
                      } catch (err) {
                        alert('Erro ao alternar escopo EVP: ' + err.message);
                      } finally {
                        setTogglingEvp(false);
                      }
                    }}
                    style={{ marginTop: '0.2rem' }}
                  />
                  <span>
                    <span style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      Marca Empregadora (EVP) — Agente 14
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {projeto.tem_evp
                        ? 'Habilitado: o Agente 14 entra na esteira após a Plataforma (9).'
                        : 'Desabilitado: pipeline pula direto do 13 para o 15.'}
                    </span>
                  </span>
                </label>
              </div>

              {/* Diagnósticos Essenciais — Formulários + Entrevistas */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
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

              <EntrevistaIASessoes projetoId={id} />

              <MapaMaturidadeCard projetoId={id} />

              <a href={`/mapa-identidade/${id}`} target="_blank" rel="noreferrer" className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.3rem 1.4rem', borderColor: 'rgba(218,49,68,0.28)', textDecoration: 'none', color: 'inherit', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #Da3144, rgba(218,49,68,0.08))' }} />
                <div>
                  <div style={{ fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Diagnóstico · 2ª etapa</div>
                  <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.05rem' }}>🧬 Mapa de Identidade Estratégica</h3>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Essência · Território de valor · Espelho interno e externo</p>
                </div>
                <span style={{ color: '#fca5b0', fontSize: '1.1rem' }}>→</span>
              </a>

              {/* Card: Mapeamento Comportamental CIS */}
              <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(167, 139, 250, 0.25)' }}>
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
                    onClick={handleRequestTeamReport}
                    disabled={!(data?.cisAssessments?.length > 0) || generatingTeamReport}
                    title="Baixar relatório comportamental consolidado (PDF)"
                    style={{ flex: 1, background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.4)', borderRadius: '8px', color: 'var(--accent-blue)', fontWeight: 700, padding: '0.6rem', cursor: generatingTeamReport ? 'wait' : ((data?.cisAssessments?.length > 0) ? 'pointer' : 'not-allowed'), fontSize: '0.85rem', opacity: (generatingTeamReport || !(data?.cisAssessments?.length > 0)) ? 0.6 : 1 }}
                  >
                    {generatingTeamReport
                      ? '⏳ Gerando análise…'
                      : `📄 Relatório Comportamental (${data?.cisAssessments?.length || 0})`}
                  </button>
                </div>
              </div>
            </aside>

            {/* Direita: Trilha Visual dos Agentes (O histórico de Outputs) */}
            <section className="glass-card admin-project-output-rail" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Esteira de outputs</h2>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    Relatórios em ordem inversa, com detalhes recolhidos para não quebrar o fluxo.
                  </p>
                </div>
                <span style={{ flexShrink: 0, fontSize: '0.78rem', color: 'var(--success)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 999, padding: '0.25rem 0.6rem', fontWeight: 700 }}>
                  {latestOutputs.length} gerados
                </span>
              </div>
                
              {latestOutputs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
                  Nenhum output gerado ainda. Execute o Agente 01 no fluxo principal.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {/* Renderiza os outputs já concluídos */}
                  {[...latestOutputs].sort((a, b) => b.agent_num - a.agent_num).map((out) => (
                    <article key={out.id} style={{ background: 'rgba(255,255,255,0.025)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 0 }}>
                          <h3 style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.35 }}>
                            <span style={{ color: 'var(--accent-blue)', marginRight: '0.45rem', fontWeight: 800 }}>A{out.agent_num}</span>
                            {getNomeAdmin(out.agent_num)}
                          </h3>
                          {out.resumo_executivo ? (
                            <p style={{ margin: '0.28rem 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {String(out.resumo_executivo).replace(/\s+/g, ' ').slice(0, 240)}
                            </p>
                          ) : null}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <Link
                              href={`/adm/${id}/outputs/${out.agent_num}`}
                              title="Abrir em página editorial"
                              style={{ background: 'rgba(107,163,255,0.1)', border: '1px solid rgba(107,163,255,0.3)', color: 'var(--brand-blue-light)', borderRadius: '8px', padding: '0.3rem 0.65rem', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}
                            >
                              Abrir
                            </Link>
                            <button
                              onClick={() => downloadOutputPdf(out)}
                              title="Baixar em PDF"
                              style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', color: 'var(--accent-blue)', borderRadius: '8px', padding: '0.3rem 0.65rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                            >
                              PDF
                            </button>
                            <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.18rem 0.52rem', borderRadius: 999, fontWeight: 700 }}>ok</span>
                        </div>
                      </div>
                      <details style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <summary style={{ cursor: 'pointer', color: 'var(--accent-blue)', fontWeight: 700, userSelect: 'none', fontSize: '0.8rem', padding: '0.65rem 0.9rem' }}>
                          Ver resumo e documento completo
                        </summary>
                        <div style={{ padding: '0 0.9rem 0.9rem', fontSize: '0.86rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
                          {out.resumo_executivo ? (
                            <div style={{ marginBottom: '0.85rem' }}>
                              <strong style={{ color: 'var(--text-primary)' }}>Resumo Executivo:</strong><br />
                              {renderMarkdownText(out.resumo_executivo)}
                            </div>
                          ) : null}
                          <div style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.18)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                            {renderMarkdownText(out.conteudo)}

                            {out.conclusoes && (
                              <div style={{ marginTop: '1rem' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>Conclusões/Takeaways:</strong><br />
                                {renderMarkdownText(out.conclusoes)}
                              </div>
                            )}
                          </div>
                        </div>
                      </details>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Danger Zone — exclusão de relatórios individuais */}
          <details className="glass-card" style={{ padding: '1.1rem 1.25rem', marginTop: '1.25rem', borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.025)' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--brand-red)', fontSize: '0.95rem', fontWeight: 800, userSelect: 'none' }}>
              Danger Zone — Exclusão de Relatórios
            </summary>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.85rem 0 1.25rem', lineHeight: 1.5 }}>
              Excluir um relatório apaga o output, limpa logs e checkpoints relacionados e libera o agente para ser rodado novamente. Os agentes posteriores que dependem deste podem precisar ser re-executados.
            </p>
            {latestOutputs.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>Nenhum relatório gerado.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[...latestOutputs].sort((a, b) => a.agent_num - b.agent_num).map((out) => (
                  <div key={out.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', padding: '0.6rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 700, minWidth: '2.5rem' }}>A{out.agent_num}</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{getNomeAdmin(out.agent_num)}</span>
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
          </details>
          </>)}
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
                {pickerMode === 'team-report'
                  ? `Relatório Comportamental Consolidado — ${data?.cisAssessments?.length || 0} respondente(s)`
                  : `Agente ${pendingAgentNum} — ${getNomeAdmin(pendingAgentNum)}`}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '6px', padding: '0.6rem 0.8rem' }}>
                <span style={{ flex: 1 }}>🤖 Ou deixe a IA conduzir: gere o link e envie por WhatsApp/e-mail. O respondente responde (texto ou voz) e a transcrição entra sozinha.</span>
                <button
                  type="button"
                  onClick={() => {
                    const sel = transcritRespondentes.find(r => r.nome === transcritNome);
                    if (!sel?.token) { alert('Selecione um respondente cadastrado (com convite gerado) para gerar o link.'); return; }
                    navigator.clipboard.writeText(`${window.location.origin}/entrevista/${sel.token}`);
                    alert(`Link de entrevista por IA de ${sel.nome} copiado.`);
                  }}
                  style={{ whiteSpace: 'nowrap', padding: '0.45rem 0.8rem', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '6px', color: '#c4b5fd', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Copiar link IA
                </button>
              </div>
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
