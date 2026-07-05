// Renderiza o relatório de triangulação do Mapa de Identidade em PDF (server-side).
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import fs from 'fs';
import path from 'path';
import RelatorioIdentidade from '../../components/pdf/RelatorioIdentidade';

let logoCache;
function carregarLogo() {
  if (logoCache !== undefined) return logoCache;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'brand', 'logo.png');
    logoCache = 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64');
  } catch (e) {
    console.warn('[identidade/pdf] logo não encontrado:', e.message);
    logoCache = null;
  }
  return logoCache;
}

export async function gerarPdfIdentidade({ cliente, result, narrativa, dataLabel }) {
  const buffer = await renderToBuffer(
    React.createElement(RelatorioIdentidade, {
      cliente,
      result,
      narrativa,
      logoData: carregarLogo(),
      dataLabel,
    })
  );
  return Buffer.from(buffer);
}
