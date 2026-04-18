import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import RelatorioDisc from '../../components/pdf/RelatorioDisc';
import fs from 'fs';
import path from 'path';

export async function generatePdfBuffer({ nome, email, scores, narratives }) {
  // Carregar logo
  let logoData = null;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'brand', 'logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    logoData = 'data:image/png;base64,' + logoBuffer.toString('base64');
  } catch (e) {
    console.warn('[PDF] Logo nao encontrado:', e.message);
  }

  const buffer = await renderToBuffer(
    React.createElement(RelatorioDisc, {
      nome,
      email,
      scores,
      narratives,
      logoData,
    })
  );

  return Buffer.from(buffer);
}
