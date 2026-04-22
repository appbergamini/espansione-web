// pages/api/outputs/[projetoId]/[stage]/pdf.js
//
// Bloco D · TASK 4.3 — GET /api/outputs/:projetoId/:stage/pdf
// Retorna o PDF do output renderizado em layout editorial. Internamente:
//   1. Autentica o usuário (getServerUser + profile.role)
//   2. Confirma que o projeto + output existem
//   3. Emite um token de curta duração (60s) para o print mode
//   4. Chama Playwright + Chromium contra a URL interna ?print=true
//   5. Devolve o Buffer PDF com headers de download
//
// maxDuration: 60s e memory: 3009 MB declarados em vercel.json.

import { generatePdfFromPage } from '../../../../../lib/pdf/generatePdfFromPage';
import { emitirTokenPdf } from '../../../../../lib/pdf/pdfToken';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';
import { getServerUser } from '../../../../../lib/getServerUser';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const projetoId = String(req.query.projetoId || '');
  const stage = Number(req.query.stage);

  if (!projetoId || !Number.isFinite(stage) || stage < 1) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  // ─── Auth ──────────────────────────────────────────────────────────
  const { user } = await getServerUser(req, res);
  if (!user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || (profile.role !== 'master' && profile.role !== 'admin')) {
    return res.status(403).json({ error: 'Sem permissão' });
  }

  // ─── Projeto + output existem ─────────────────────────────────────
  const { data: projeto } = await supabaseAdmin
    .from('projetos')
    .select('id, cliente')
    .eq('id', projetoId)
    .maybeSingle();
  if (!projeto) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }

  const { data: outputExiste } = await supabaseAdmin
    .from('outputs')
    .select('id')
    .eq('projeto_id', projetoId)
    .eq('agent_num', stage)
    .limit(1)
    .maybeSingle();
  if (!outputExiste) {
    return res.status(404).json({ error: 'Output não encontrado' });
  }

  // ─── URL interna em modo print ─────────────────────────────────────
  const token = emitirTokenPdf({ projetoId, stage });
  const protocol =
    req.headers['x-forwarded-proto'] ||
    (req.socket?.encrypted ? 'https' : 'http');
  const host =
    req.headers['x-forwarded-host'] ||
    req.headers.host ||
    process.env.VERCEL_URL;

  if (!host) {
    return res.status(500).json({ error: 'Host não detectado' });
  }

  const printUrl =
    `${protocol}://${host}/adm/${encodeURIComponent(projetoId)}/outputs/${stage}` +
    `?print=true&token=${encodeURIComponent(token)}`;

  // ─── Gerar PDF ─────────────────────────────────────────────────────
  try {
    const pdfBuffer = await generatePdfFromPage({ url: printUrl });

    const nomeArquivo = construirNomeArquivo(projeto.cliente, stage);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${nomeArquivo}"`,
    );
    res.setHeader(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate',
    );
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error('[api/outputs/pdf] erro:', err);
    return res.status(500).json({
      error: 'Falha ao gerar PDF',
      detalhes:
        process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}

function construirNomeArquivo(cliente, stage) {
  const slug = String(cliente || 'output')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const data = new Date().toISOString().slice(0, 10);
  return `${slug || 'output'}_agente-${stage}_${data}.pdf`;
}
