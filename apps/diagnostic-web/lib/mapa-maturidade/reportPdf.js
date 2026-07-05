// Renderiza o relatório vendedor do Mapa da Maturidade em PDF (react-pdf, server-side).
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import fs from 'fs';
import path from 'path';
import RelatorioMaturidadeVendedor from '../../components/pdf/RelatorioMaturidadeVendedor';

let logoCache; // memoiza o logo entre chamadas no mesmo lambda
function carregarLogo() {
  if (logoCache !== undefined) return logoCache;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'brand', 'logo.png');
    logoCache = 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64');
  } catch (e) {
    console.warn('[mapa/pdf] logo não encontrado:', e.message);
    logoCache = null;
  }
  return logoCache;
}

export async function gerarPdfMaturidade({ cliente, result, narrativa, dataLabel }) {
  const buffer = await renderToBuffer(
    React.createElement(RelatorioMaturidadeVendedor, {
      cliente,
      result,
      narrativa,
      logoData: carregarLogo(),
      dataLabel,
    })
  );
  return Buffer.from(buffer);
}
