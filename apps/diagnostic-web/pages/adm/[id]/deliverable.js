// pages/adm/[id]/deliverable.js
//
// Bloco D · TASK 4.4 — rota principal do entregável consolidado.
// /adm/{projetoId}/deliverable
//
// Mesmas convenções da TASK 4.2 (página de output):
//   - Pages Router
//   - Auth dupla: sessão (getServerUser + profile.role) OU token HMAC
//     curto (?print=true&token=...) emitido pelo endpoint PDF
//   - supabaseAdmin (bypass RLS)
//
// Em modo ?print=true o render pula todo o chrome (header, breadcrumb)
// e entrega o documento "nu" pronto pro Playwright exportar.

import Head from 'next/head';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { getServerUser } from '../../../lib/getServerUser';
import { loadAllDeliverableData } from '../../../lib/deliverable/loadAllOutputs';
import { validarTokenPdf } from '../../../lib/pdf/pdfToken';
import Deliverable from '../../../components/deliverable/Deliverable';

export async function getServerSideProps({ params, query, req, res }) {
  const projetoId = String(params.id || '');
  if (!projetoId) return { notFound: true };

  // ─── Auth dupla (mesmo padrão de TASK 4.2/4.3) ────────────────────
  const isPrintMode = query?.print === 'true';
  let autorizado = false;

  if (isPrintMode) {
    // No modo print, o token HMAC codifica stage='deliverable' para
    // evitar que um token emitido pra output de agente sirva pro
    // consolidado (scoping por tipo de recurso).
    autorizado = validarTokenPdf(String(query?.token || ''), {
      projetoId,
      stage: 'deliverable',
    });
  }

  if (!autorizado) {
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

  // ─── Load all deliverable data ───────────────────────────────────
  let data;
  try {
    data = await loadAllDeliverableData(projetoId);
  } catch (err) {
    console.error('[deliverable page] load failed:', err?.message || err);
    return { notFound: true };
  }

  return {
    props: {
      ...data,
      isPrintMode,
    },
  };
}

export default function DeliverablePage(props) {
  const titulo = `${props.projeto?.cliente || 'Projeto'} — Entregável final`;

  if (props.isPrintMode) {
    return (
      <>
        <Head>
          <title>{titulo}</title>
        </Head>
        <div className="deliverable-print-mode">
          <Deliverable {...props} />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Espansione | {titulo}</title>
      </Head>
      <Deliverable {...props} />
    </>
  );
}
