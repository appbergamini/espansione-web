// pages/api/outputs/[projetoId]/deliverable/pdf.js
//
// Bloco D · TASK 4.4 — endpoint de export PDF do entregável final
// consolidado. GET /api/outputs/:projetoId/deliverable/pdf
//
// Reusa o helper generatePdfFromPage da TASK 4.3. Emite token com
// stage='deliverable' (diferente do scope de output por agente) e
// aponta o Chromium pra /adm/:projetoId/deliverable?print=true&token=...
//
// Timeout e memória no vercel.json espelham a rota de output:
// maxDuration 60s, memory 3009 MB. Entregáveis maiores podem bater
// limite — sintoma leva à migração para arquitetura B (ver comentário
// no topo de Deliverable.js).

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
  if (!projetoId) {
    return res.status(400).json({ error: 'projetoId inválido' });
  }

  // ─── Auth ─────────────────────────────────────────────────────────
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ error: 'Não autenticado' });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile || (profile.role !== 'master' && profile.role !== 'admin')) {
    return res.status(403).json({ error: 'Sem permissão' });
  }

  // ─── Projeto existe? ─────────────────────────────────────────────
  const { data: projeto } = await supabaseAdmin
    .from('projetos')
    .select('id, cliente')
    .eq('id', projetoId)
    .maybeSingle();
  if (!projeto) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }

  // ─── URL interna em modo print ─────────────────────────────────────
  const token = emitirTokenPdf({ projetoId, stage: 'deliverable' });
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
    `${protocol}://${host}/adm/${encodeURIComponent(projetoId)}/deliverable` +
    `?print=true&token=${encodeURIComponent(token)}`;

  // ─── Gerar PDF ─────────────────────────────────────────────────────
  console.time('[deliverable-pdf] generation');
  try {
    const pdfBuffer = await generatePdfFromPage({
      url: printUrl,
      // Entregável tem layout mais denso; damos margem maior que os
      // 45s padrão do helper.
      timeoutMs: 55_000,
      // Seletor de confirmação que a página montou — wrapper do root.
      waitForSelector: '.deliverable-root',
    });
    console.timeEnd('[deliverable-pdf] generation');
    console.log('[deliverable-pdf] size:', pdfBuffer.length, 'bytes');

    const nomeArquivo = `${slugify(projeto.cliente)}_entregavel_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    console.timeEnd('[deliverable-pdf] generation');
    console.error('[deliverable-pdf] erro:', err);
    return res.status(500).json({
      error: 'Falha ao gerar entregável final',
      detalhes: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}

function slugify(s) {
  return String(s || 'entregavel')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
