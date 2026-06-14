// Cockpit — as 6 views, portadas do handoff. Fase 1: dados de exemplo no
// Conteúdo/Pautas/Agenda (sem backend ainda); Revisão e IA serão ligadas a
// dados reais na sequência. Visual fiel ao protótipo.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  P, Hoverable, PBadge, PMetric, PContentCard, PTaskRow, PReviewItem,
  PTabBar, PSearch, PBtn, PSection, PCalStrip, PPanel, PProgress, PEmpty,
} from './ui';
import { CATALOGO_AGENTES, podeExecutar, getNomeAdmin } from '../../lib/agents/catalog';

export const CONTENT_DATA = [
  { id: 1, title: 'Consolidação de Perfis Existentes', type: 'Post Blog', status: 'Publicado', statusColor: 'green', date: '04 Jun', cat: 'publicados' },
  { id: 2, title: 'Desvendando o Branding Moderno', type: 'Reels', status: 'Concluído', statusColor: 'blue', date: '05 Jun', cat: 'publicados' },
  { id: 3, title: 'Análise de Mercado SWOT', type: 'Carrossel', status: 'Em revisão', statusColor: 'orange', date: '06 Jun', cat: 'revisao' },
  { id: 4, title: 'Planejamento Estratégico Q3', type: 'Post Blog', status: 'Rascunho', statusColor: 'purple', date: '07 Jun', cat: 'rascunhos' },
  { id: 5, title: 'Marca de Valor BHFS', type: 'Story', status: 'Publicado', statusColor: 'green', date: '03 Jun', cat: 'publicados' },
  { id: 6, title: 'Posicionamento Digital 2026', type: 'Reels', status: 'Pendente', statusColor: 'red', date: '08 Jun', cat: 'agendados' },
  { id: 7, title: 'Guia de Identidade Visual', type: 'E-book', status: 'Em revisão', statusColor: 'orange', date: '05 Jun', cat: 'revisao' },
  { id: 8, title: 'Tendências de Branding', type: 'Carrossel', status: 'Rascunho', statusColor: 'purple', date: '09 Jun', cat: 'rascunhos' },
  { id: 9, title: 'Case: Rebranding Startup X', type: 'Post Blog', status: 'Publicado', statusColor: 'green', date: '02 Jun', cat: 'publicados' },
  { id: 10, title: 'Dicas de Consultoria', type: 'Story', status: 'Agendado', statusColor: 'teal', date: '10 Jun', cat: 'agendados' },
  { id: 11, title: 'Mapa de Stakeholders', type: 'Infográfico', status: 'Em revisão', statusColor: 'orange', date: '06 Jun', cat: 'revisao' },
  { id: 12, title: 'Workshop de Marca Pessoal', type: 'Post Blog', status: 'Rascunho', statusColor: 'purple', date: '11 Jun', cat: 'rascunhos' },
];

export const TASKS_DATA = [
  { id: 1, label: 'Criar roteiro Reels institucional', done: false, priority: 'alta' },
  { id: 2, label: 'Revisar copy do carrossel SWOT', done: false, priority: 'média' },
  { id: 3, label: 'Enviar briefing para designer', done: true, priority: 'baixa' },
  { id: 4, label: 'Finalizar post sobre tendências', done: false, priority: 'alta' },
  { id: 5, label: 'Aprovar artes Stories da semana', done: false, priority: 'baixa' },
  { id: 6, label: 'Agendar publicações de Junho', done: true, priority: 'média' },
  { id: 7, label: 'Preparar apresentação para cliente', done: false, priority: 'alta' },
  { id: 8, label: 'Atualizar calendário editorial', done: false, priority: 'média' },
];

export const REVIEWS_DATA = [
  { id: 1, title: 'Consolidação de Perfis do Instagram e Threads', status: 'Aprovado' },
  { id: 2, title: 'Planilha nova de Mídias Pagas (padrão GRV)', status: 'Pendente' },
  { id: 3, title: 'Ficha de briefing modelo — Expansione Talks', status: 'Em análise' },
  { id: 4, title: 'Post Blog sobre Growth Hacking', status: 'Aprovado' },
  { id: 5, title: 'Estratégia de Conteúdo para LinkedIn', status: 'Pendente' },
  { id: 6, title: 'Relatório de Performance — Maio 2026', status: 'Aprovado' },
  { id: 7, title: 'Calendário de Conteúdo Julho', status: 'Pendente' },
  { id: 8, title: 'Proposta de Rebranding — Cliente Beta', status: 'Em análise' },
  { id: 9, title: 'Análise Competitiva Setor Financeiro', status: 'Aprovado' },
  { id: 10, title: 'Guia de Tom de Voz da Marca', status: 'Em análise' },
  { id: 11, title: 'Playbook de Onboarding', status: 'Pendente' },
  { id: 12, title: 'Consolidação das Saídas (semana 22)', status: 'Aprovado' },
  { id: 13, title: 'Analytics Inc. — perfil e saída (Norte)', status: 'Em análise' },
  { id: 14, title: 'Briefing Vídeo — Trabalho da Marca', status: 'Pendente' },
];

// ══════════════════════════════════
// VIEW: Diagnóstico — passo a passo (desde o Agente 1), com status REAL.
// ══════════════════════════════════
const STAGE_LABEL = {
  pre_diagnostico: 'Pré-diagnóstico',
  diagnostico_interno: 'Visão Interna',
  diagnostico_externo: 'Visão Externa',
  sintese: 'Síntese',
  estrategia: 'Estratégia',
  visual_verbal: 'Identidade',
  cx: 'Experiência',
  comunicacao: 'Comunicação',
  marca_empregadora: 'Marca Empregadora',
  encerramento: 'Encerramento',
};

export function ViewDiagnostico({ projeto }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projeto?.id) { setData(null); return undefined; }
    let active = true;
    setLoading(true);
    fetch(`/api/adm/${encodeURIComponent(projeto.id)}`)
      .then(r => r.json())
      .then(j => { if (active && j.success) setData(j.data); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [projeto?.id]);

  if (!projeto) return <PEmpty icon="⚑" message="Selecione uma marca na barra lateral para ver o diagnóstico." />;
  if (loading || !data) return <PEmpty icon="◔" message="Carregando diagnóstico…" />;

  const outputs = data.outputs || [];
  const doneNums = [...new Set(outputs.map(o => o.agent_num))];
  const confByNum = {};
  outputs.forEach(o => { if (confByNum[o.agent_num] == null) confByNum[o.agent_num] = o.confianca; });
  const pendingCkpt = new Set((data.pendingCheckpoints || []).map(c => c.checkpoint_num));
  const temEvp = !!data.projeto?.tem_evp;
  const isDone = (n) => doneNums.includes(n);

  const agentes = CATALOGO_AGENTES.filter(a => a.agent_num !== 14 || temEvp);

  let currentNum = null;
  for (const a of agentes) {
    if (!isDone(a.agent_num) && podeExecutar(a.agent_num, doneNums).ok) { currentNum = a.agent_num; break; }
  }
  const statusOf = (a) => {
    if (isDone(a.agent_num)) return 'done';
    if (a.agent_num === currentNum) return 'current';
    if (!podeExecutar(a.agent_num, doneNums).ok) return 'blocked';
    return 'pending';
  };

  const coreDone = agentes.filter(a => !a.modular && isDone(a.agent_num)).length;
  const coreTotal = agentes.filter(a => !a.modular).length;
  const ckptAprovados = [1, 2, 3, 4].filter(n => {
    const creator = CATALOGO_AGENTES.find(a => a.checkpoint === n);
    return creator && isDone(creator.agent_num) && !pendingCkpt.has(n);
  }).length;

  const dot = { done: P.green, current: P.accent, blocked: P.textDim, pending: P.textSec };
  const badge = { done: ['Concluído', 'green'], current: ['Agora', 'blue'], blocked: ['Bloqueado', 'gray'], pending: ['Pendente', 'gray'] };

  const ckptChip = (n) => {
    const creator = CATALOGO_AGENTES.find(a => a.checkpoint === n);
    const reached = creator && isDone(creator.agent_num);
    const st = pendingCkpt.has(n) ? 'pendente' : (reached ? 'aprovado' : 'locked');
    const cor = st === 'aprovado' ? P.green : st === 'pendente' ? P.orange : P.textDim;
    const label = st === 'aprovado' ? `Checkpoint ${n} · aprovado` : st === 'pendente' ? `Checkpoint ${n} · pendente — aprovar` : `Checkpoint ${n}`;
    return (
      <div key={`ck${n}`} onClick={() => st === 'pendente' && router.push(`/adm/${projeto.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px 7px 40px', fontSize: 12, color: cor, cursor: st === 'pendente' ? 'pointer' : 'default', borderBottom: `1px solid ${P.borderLt}` }}>
        <span>⛒</span><span style={{ fontWeight: 600 }}>{label}</span>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: P.text }}>Diagnóstico — passo a passo</span>
          <PBadge label={projeto.cliente || projeto.nome || 'projeto'} color="blue" />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <PBtn label="Orquestrador →" onClick={() => router.push(`/adm/${projeto.id}`)} />
          <PBtn label="Entregável →" onClick={() => router.push(`/adm/${projeto.id}/deliverable`)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <PMetric value={`${coreDone}/${coreTotal}`} label="Agentes concluídos" icon="⚑" />
        <PMetric value={`${ckptAprovados}/4`} label="Checkpoints aprovados" icon="⛒" />
        <PMetric value={currentNum ? `Agente ${currentNum}` : '✓ completo'} label="Próximo passo" icon="▶" />
      </div>

      <PPanel style={{ padding: 0, overflow: 'hidden' }}>
        {agentes.map((a) => {
          const st = statusOf(a);
          const [blab, bcol] = badge[st];
          const conf = confByNum[a.agent_num];
          const out = [
            <Hoverable
              key={a.agent_num}
              onClick={() => router.push(isDone(a.agent_num) ? `/adm/${projeto.id}/outputs/${a.agent_num}` : `/adm/${projeto.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: `1px solid ${P.borderLt}` }}
              hoverStyle={{ background: P.borderLt }}
            >
              <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: st === 'done' ? '#06210f' : '#fff', background: dot[st] }}>
                {st === 'done' ? '✓' : a.agent_num}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: P.text, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {getNomeAdmin(a.agent_num)}{a.modular && <span style={{ color: P.textDim, fontWeight: 400 }}> · modular</span>}
                </div>
                <div style={{ fontSize: 11, color: P.textDim }}>{STAGE_LABEL[a.stage] || a.stage}{conf ? ` · confiança ${conf}` : ''}</div>
              </div>
              <PBadge label={blab} color={bcol} size="xs" />
            </Hoverable>,
          ];
          if (a.checkpoint) out.push(ckptChip(a.checkpoint));
          return out;
        })}
      </PPanel>
    </div>
  );
}

export function ViewOverview({ navigate }) {
  const [calDay, setCalDay] = useState(2);
  const published = CONTENT_DATA.filter(c => c.cat === 'publicados').length;
  const pendingTasks = TASKS_DATA.filter(t => !t.done).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: P.text }}>Visão Geral</div>
          <div style={{ fontSize: 13, color: P.textSec, marginTop: 2 }}>Plano ativo</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <PBtn label="Exportar" icon="↗" small />
          <PBtn label="Novo conteúdo" primary icon="+" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <PMetric value={CONTENT_DATA.length} label="Total conteúdos" icon="◧" />
        <PMetric value={published} label="Publicados" icon="◉" trend="+3" trendUp />
        <PMetric value={pendingTasks} label="Pautas pendentes" icon="☰" trend="-2" trendUp />
        <PMetric value={REVIEWS_DATA.length} label="Em revisão" icon="✎" />
        <PMetric value="72%" label="Capacidade IA" icon="⬡" />
      </div>

      <div style={{ display: 'flex', gap: 16, flex: 1, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <PPanel>
            <PSection title="Agenda da semana">
              <PCalStrip selected={calDay} onSelect={setCalDay} />
            </PSection>
          </PPanel>
          <PPanel style={{ flex: 1 }}>
            <PSection title="Conteúdo recente" subtitle="Últimos 7 dias" action={<PBtn label="Ver todos →" small onClick={() => navigate('content')} />}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CONTENT_DATA.slice(0, 4).map(c => <PContentCard key={c.id} {...c} />)}
              </div>
            </PSection>
          </PPanel>
        </div>

        <div style={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <PPanel>
            <PSection title="Pautas" action={<PBtn label="Ver todas →" small onClick={() => navigate('tasks')} />}>
              {TASKS_DATA.slice(0, 5).map(t => <PTaskRow key={t.id} {...t} />)}
            </PSection>
          </PPanel>
          <PPanel style={{ flex: 1 }}>
            <PSection title="Revisões recentes" action={<PBtn label="Ver todas →" small onClick={() => navigate('review')} />}>
              {REVIEWS_DATA.slice(0, 5).map((r, i) => <PReviewItem key={r.id} number={i + 1} {...r} />)}
            </PSection>
          </PPanel>
        </div>
      </div>
    </div>
  );
}

export function ViewContent() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [calDay, setCalDay] = useState(2);
  const tabFilters = ['todos', 'publicados', 'revisao', 'rascunhos', 'agendados'];
  const filtered = CONTENT_DATA.filter(c => {
    const matchTab = tab === 0 || c.cat === tabFilters[tab];
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: P.text }}>Conteúdo</span>
          <PBadge label={`${CONTENT_DATA.length} itens`} color="blue" />
          <PBadge label="dados de exemplo" color="gray" size="xs" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PSearch placeholder="Buscar conteúdo..." value={search} onChange={setSearch} width={220} />
          <PBtn label="Novo conteúdo" primary icon="+" />
        </div>
      </div>

      <PTabBar tabs={['Todos', 'Publicados', 'Em revisão', 'Rascunhos', 'Agendados']} active={tab} onSelect={setTab} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
        <PCalStrip selected={calDay} onSelect={setCalDay} />
        <PBtn label="Filtros" icon="▤" small />
      </div>

      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, flex: 1, alignContent: 'start' }}>
          {filtered.map(c => <PContentCard key={c.id} {...c} />)}
        </div>
      ) : (
        <PEmpty icon="◧" message="Nenhum conteúdo encontrado" />
      )}
    </div>
  );
}

export function ViewTasks() {
  const [filter, setFilter] = useState(0);
  const [search, setSearch] = useState('');
  const filtered = TASKS_DATA.filter(t => {
    const matchFilter = filter === 0 || (filter === 1 && !t.done) || (filter === 2 && t.done);
    const matchSearch = !search || t.label.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });
  const done = TASKS_DATA.filter(t => t.done).length;
  const total = TASKS_DATA.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: P.text }}>Pautas</span>
          <PBadge label={`${total - done} pendentes`} color="orange" />
          <PBadge label="dados de exemplo" color="gray" size="xs" />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <PSearch placeholder="Buscar pauta..." value={search} onChange={setSearch} width={200} />
          <PBtn label="Nova pauta" primary icon="+" />
        </div>
      </div>

      <PPanel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: P.textSec }}>Progresso</span>
          <span style={{ fontSize: 13, color: P.accent, fontWeight: 600 }}>{done}/{total}</span>
        </div>
        <PProgress value={(done / total) * 100} color={P.green} height={8} />
      </PPanel>

      <PTabBar tabs={['Todas', 'Pendentes', 'Concluídas']} active={filter} onSelect={setFilter} />

      <PPanel>
        {filtered.length > 0 ? filtered.map(t => <PTaskRow key={t.id} {...t} />) : <PEmpty icon="☰" message="Nenhuma pauta encontrada" />}
      </PPanel>
    </div>
  );
}

export function ViewSchedule() {
  const [calDay, setCalDay] = useState(2);
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const events = [
    { hour: '09:00', title: 'Reunião de briefing', duration: '1h', color: P.accent },
    { hour: '10:00', title: 'Criação de conteúdo', duration: '2h', color: P.purple },
    { hour: '14:00', title: 'Revisão com cliente', duration: '1h', color: P.green },
    { hour: '16:00', title: 'Publicar reels', duration: '30min', color: P.orange },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: P.text }}>Agenda</span>
          <PBadge label="dados de exemplo" color="gray" size="xs" />
        </div>
        <PBtn label="Novo evento" primary icon="+" />
      </div>

      <PCalStrip selected={calDay} onSelect={setCalDay} />

      <PPanel style={{ flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {hours.map(h => {
            const ev = events.find(e => e.hour === h);
            return (
              <div key={h} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: `1px solid ${P.borderLt}`, minHeight: 48, alignItems: 'center' }}>
                <span style={{ width: 48, fontSize: 12, color: P.textDim, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{h}</span>
                {ev ? (
                  <Hoverable style={{ flex: 1, padding: '10px 14px', borderRadius: P.radius, background: ev.color + '18', borderLeft: `3px solid ${ev.color}` }} hoverStyle={{ background: ev.color + '28' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{ev.title}</div>
                    <div style={{ fontSize: 11, color: P.textSec, marginTop: 2 }}>{ev.duration}</div>
                  </Hoverable>
                ) : (
                  <div style={{ flex: 1 }} />
                )}
              </div>
            );
          })}
        </div>
      </PPanel>
    </div>
  );
}

export function ViewAI() {
  const usageData = [
    { label: 'Posts gerados', value: 18, max: 30 },
    { label: 'Reels roteirizados', value: 8, max: 15 },
    { label: 'Legendas criadas', value: 10, max: 20 },
  ];
  const history = [
    { title: 'Roteiro: Reels Identidade Visual', date: '06 Jun', tokens: '1.2k' },
    { title: 'Copy: Carrossel Estratégias', date: '05 Jun', tokens: '890' },
    { title: 'Legenda: Post Tendências', date: '05 Jun', tokens: '450' },
    { title: 'Blog: Consolidação de Perfis', date: '04 Jun', tokens: '2.1k' },
    { title: 'Copy: Story Marca BHFS', date: '03 Jun', tokens: '320' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: P.text }}>Capacidade IA</span>
          <PBadge label="72% usado" color="purple" />
          <PBadge label="dados de exemplo" color="gray" size="xs" />
        </div>
        <PBtn label="Gerar conteúdo" primary icon="⬡" />
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <PMetric value="36" label="Total gerados" icon="⬡" trend="+12" trendUp />
        <PMetric value="14" label="Restantes" icon="◔" />
        <PMetric value="50" label="Limite mensal" icon="◫" />
      </div>

      <div style={{ display: 'flex', gap: 16, flex: 1, flexWrap: 'wrap' }}>
        <PPanel style={{ flex: '1 1 380px' }}>
          <PSection title="Uso por categoria">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {usageData.map((u, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: P.text }}>{u.label}</span>
                    <span style={{ fontSize: 12, color: P.accent, fontWeight: 600 }}>{u.value}/{u.max}</span>
                  </div>
                  <PProgress value={(u.value / u.max) * 100} color={i === 0 ? P.accent : i === 1 ? P.purple : P.teal} height={8} />
                </div>
              ))}
            </div>
          </PSection>
        </PPanel>

        <PPanel style={{ width: 380, flexShrink: 0 }}>
          <PSection title="Histórico de geração">
            {history.map((h, i) => (
              <Hoverable key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${P.borderLt}` }} hoverStyle={{ opacity: 0.8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: P.purpleBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: P.purple, flexShrink: 0 }}>⬡</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: P.text }}>{h.title}</div>
                  <div style={{ fontSize: 11, color: P.textDim, marginTop: 1 }}>{h.date}</div>
                </div>
                <span style={{ fontSize: 11, color: P.textSec }}>{h.tokens} tokens</span>
              </Hoverable>
            ))}
          </PSection>
        </PPanel>
      </div>
    </div>
  );
}

// Revisão ligada à CURADORIA real (analysis_blocks) do projeto selecionado.
const statusLabelCockpit = (s) => (s === 'aprovado' ? 'Aprovado' : s === 'pendente_revisao' ? 'Pendente' : 'Em análise');

export function ViewReview({ projeto }) {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projeto?.id) { setBlocks([]); setCounts({}); return undefined; }
    let active = true;
    setLoading(true);
    fetch(`/api/analysis-blocks?projeto_id=${encodeURIComponent(projeto.id)}`)
      .then(r => r.json())
      .then(j => { if (active && j.success) { setBlocks(j.blocks || []); setCounts(j.counts || {}); } })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [projeto?.id]);

  if (!projeto) {
    return <PEmpty icon="✎" message="Selecione uma marca na barra lateral para ver a curadoria." />;
  }

  const total = blocks.length;
  const aprovados = counts.aprovado || 0;
  const pendentes = counts.pendente_revisao || 0;
  const emAnalise = Math.max(0, total - aprovados - pendentes);

  const tabKey = [null, 'aprovado', 'pendente_revisao', 'analise'][tab];
  const filtered = blocks.filter(b => {
    const matchTab = !tabKey
      || (tabKey === 'analise' ? (b.status !== 'aprovado' && b.status !== 'pendente_revisao') : b.status === tabKey);
    const title = (b.edited_titulo || b.titulo || '').toLowerCase();
    const matchSearch = !search || title.includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: P.text }}>Revisão · Curadoria</span>
          <PBadge label={projeto.cliente || projeto.nome || 'projeto'} color="blue" />
          {total > 0 && <PBadge label={`${total} achados`} color="purple" />}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <PSearch placeholder="Buscar achado..." value={search} onChange={setSearch} width={200} />
          <PBtn label="Abrir curadoria completa →" onClick={() => router.push(`/adm/${projeto.id}/curadoria`)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <PMetric value={aprovados} label="Aprovados" icon="◉" />
        <PMetric value={pendentes} label="Pendentes" icon="◔" />
        <PMetric value={emAnalise} label="Em análise / outros" icon="◧" />
        <PMetric value={counts.incluidos || 0} label="No relatório" icon="📌" />
      </div>

      <PTabBar tabs={['Todas', 'Aprovadas', 'Pendentes', 'Em análise']} active={tab} onSelect={setTab} />

      <PPanel>
        {loading
          ? <PEmpty icon="◔" message="Carregando achados…" />
          : filtered.length > 0
            ? filtered.map(b => (
                <PReviewItem
                  key={b.id}
                  number={b.agent_num}
                  title={b.edited_titulo || b.titulo || '(sem título)'}
                  status={statusLabelCockpit(b.status)}
                  onClick={() => router.push(`/adm/${projeto.id}/curadoria`)}
                />
              ))
            : <PEmpty icon="✎" message={total === 0 ? 'Nenhum achado de curadoria para esta marca ainda.' : 'Nada com esse filtro.'} />}
      </PPanel>
    </div>
  );
}
