// pages/adm/[id]/outputs/[stage].js
//
// Bloco D · TASK 4.2 — página editorial de output.
// Rota: /adm/{projetoId}/outputs/{agent_num}
//
// Convenções seguidas (confirmadas na investigação):
//   - Pages Router (não App Router)
//   - `outputs.agent_num` (integer 1..13) é o "stage" na URL
//   - Auth server-side via getServerUser + consulta profile.role
//   - Acesso a banco via supabaseAdmin (service role, bypass RLS)
//   - Chrome idêntico ao resto de /adm/* — .page-container .container
//
// A página busca e passa para o renderer:
//   - projeto + empresa + cliente
//   - o output solicitado (conteudo, resumo_executivo, conclusoes, confianca)
//   - lista de outros outputs do projeto (para a sidebar)
//   - dados de visualização resolvidos a partir dos markers
//     (vizData é {} quando o output não tem markers — render permanece OK)

import Head from 'next/head';
import Link from 'next/link';
import Logo from '../../../../components/Logo';
import OutputHeader from '../../../../components/output/OutputHeader';
import OutputSidebar from '../../../../components/output/OutputSidebar';
import OutputRenderer from '../../../../components/output/OutputRenderer';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { getServerUser } from '../../../../lib/getServerUser';
import { resolveVizData } from '../../../../lib/output/resolveVizData';
import { validarTokenPdf } from '../../../../lib/pdf/pdfToken';

const AGENT_NAMES = [
  null,
  '01. Roteiros VI — Entrevistas Internas',
  '02. Consolidado da Visão Interna (VI)',
  '03. Roteiros VE — Entrevistas Cliente',
  '04. Consolidado da Visão Externa (VE)',
  '05. Visão de Mercado (VM)',
  '06. Decodificação e Direcionamento Estratégico',
  '07. Valores e Atributos',
  '08. Diretrizes Estratégicas',
  '09. Plataforma de Branding',
  '10. Identidade Verbal (UVV)',
  '11. One Page de Personalidade',
  '12. One Page de Experiência',
  '13. Plano de Comunicação',
];

function nomeAgente(num) {
  const n = Number(num);
  if (!Number.isFinite(n) || n < 1 || n >= AGENT_NAMES.length) return `Agente ${num}`;
  return AGENT_NAMES[n];
}

export async function getServerSideProps({ params, query, req, res }) {
  const projetoId = String(params.id || '');
  const agentNum = Number(params.stage);

  if (!projetoId || !Number.isFinite(agentNum) || agentNum < 1) {
    return { notFound: true };
  }

  // ─── Auth gate (dois caminhos) ───────────────────────────────────
  // Caminho A: modo ?print=true — autenticado por token HMAC curto
  //            (Playwright headless, sem cookies). Token gerado pela
  //            API /api/outputs/.../pdf imediatamente antes da
  //            navegação; vence em ~60s.
  // Caminho B: sessão de usuário master/admin (cookies do Supabase).
  //
  // Qualquer um dos dois passando libera. No modo print, a página
  // ainda busca dados normalmente — só o chrome muda no render.
  const isPrintMode = query?.print === 'true';
  let tokenValido = false;

  if (isPrintMode) {
    tokenValido = validarTokenPdf(String(query?.token || ''), {
      projetoId,
      stage: agentNum,
    });
  }

  if (!tokenValido) {
    const { user } = await getServerUser(req, res);
    if (!user) {
      return { redirect: { destination: '/login', permanent: false } };
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || (profile.role !== 'master' && profile.role !== 'admin')) {
      return { redirect: { destination: '/dashboard', permanent: false } };
    }
  }

  // ─── Projeto ──────────────────────────────────────────────────────
  const { data: projeto, error: projErr } = await supabaseAdmin
    .from('projetos')
    .select('id, cliente, responsavel_nome, empresa_id')
    .eq('id', projetoId)
    .maybeSingle();

  if (projErr || !projeto) {
    return { notFound: true };
  }

  // ─── Output solicitado (agent_num == stage) ──────────────────────
  // Se houver múltiplos (histórico), pega o mais recente.
  const { data: outputs, error: outErr } = await supabaseAdmin
    .from('outputs')
    .select('id, agent_num, conteudo, resumo_executivo, conclusoes, confianca, fontes, gaps, created_at')
    .eq('projeto_id', projetoId)
    .eq('agent_num', agentNum)
    .order('created_at', { ascending: false })
    .limit(1);

  if (outErr || !outputs || outputs.length === 0) {
    return { notFound: true };
  }
  const output = outputs[0];

  // ─── Lista de todos os outputs do projeto (sidebar) ──────────────
  // Somente a versão mais recente por agent_num — agregação em JS
  // para não depender de distinct on SQL.
  const { data: todosOutputsRaw } = await supabaseAdmin
    .from('outputs')
    .select('id, agent_num, created_at')
    .eq('projeto_id', projetoId)
    .order('created_at', { ascending: false });

  const porAgent = new Map();
  for (const out of (todosOutputsRaw || [])) {
    if (!porAgent.has(out.agent_num)) {
      porAgent.set(out.agent_num, {
        id: out.id,
        agent_num: out.agent_num,
        created_at: out.created_at,
        nome_exibicao: nomeAgente(out.agent_num),
      });
    }
  }
  const todosOutputs = [...porAgent.values()].sort(
    (a, b) => a.agent_num - b.agent_num,
  );

  // ─── Resolve dados das visualizações (markers no conteúdo) ────────
  const vizData = await resolveVizData(projetoId, output.conteudo || '');

  return {
    props: {
      projeto: {
        id: projeto.id,
        cliente: projeto.cliente,
      },
      output,
      agentNum,
      nomeExibicao: nomeAgente(agentNum),
      todosOutputs,
      vizData,
      isPrintMode,
    },
  };
}

export default function OutputPage({
  projeto,
  output,
  agentNum,
  nomeExibicao,
  todosOutputs,
  vizData,
  isPrintMode,
}) {
  // ─── Modo print: só o conteúdo editorial, fundo branco, sem chrome
  if (isPrintMode) {
    return (
      <>
        <Head>
          <title>{`${projeto.cliente} — ${nomeExibicao}`}</title>
        </Head>
        <div
          className="print-mode"
          style={{
            background: 'var(--viz-card-bg)',
            color: 'var(--viz-card-text)',
            padding: '24px 28px',
            minHeight: '100vh',
          }}
        >
          <OutputRenderer
            conteudo={output.conteudo}
            resumoExecutivo={output.resumo_executivo}
            conclusoes={output.conclusoes}
            vizData={vizData}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`Espansione | ${projeto.cliente} — ${nomeExibicao}`}</title>
      </Head>
      <div className="page-container">
        <main className="container">
          <div
            className="screen-only"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <Link href={`/adm/${projeto.id}`}>
              <span style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.9rem' }}>
                &larr; Voltar ao projeto
              </span>
            </Link>
            <Logo size="sm" showTagline={false} />
          </div>

          <div className="screen-only">
            <OutputHeader
              projeto={{ id: projeto.id, nome: projeto.cliente, empresa_nome: projeto.cliente }}
              output={output}
              agentNum={agentNum}
              nomeExibicao={nomeExibicao}
            />
          </div>

          <div className="flex gap-6 mt-6 items-start">
            <div className="screen-only">
              <OutputSidebar
                outputs={todosOutputs}
                currentAgentNum={agentNum}
                projetoId={projeto.id}
                conteudo={output.conteudo}
              />
            </div>

            <section
              className="flex-1 min-w-0 p-6 md:p-10 rounded-xl"
              style={{
                backgroundColor: 'var(--viz-card-bg)',
                color: 'var(--viz-card-text)',
                border: '1px solid var(--viz-card-border)',
                boxShadow: 'var(--viz-card-shadow)',
              }}
            >
              <OutputRenderer
                conteudo={output.conteudo}
                resumoExecutivo={output.resumo_executivo}
                conclusoes={output.conclusoes}
                vizData={vizData}
              />
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
