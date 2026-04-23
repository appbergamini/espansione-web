// Gerador de PDF editorial para outputs dos agentes (Caminho B).
// Paleta e tipografia inspiradas no prompt do dossiê GSIM.
// Cliente-side via jsPDF — sem Puppeteer, sem dependências server.

const PALETTE = {
  primary: [31, 56, 100],          // #1F3864 azul-marinho
  primaryLight: [46, 117, 182],    // #2E75B6
  primaryDark: [21, 42, 75],       // #152A4B
  accent: [192, 0, 0],             // #C00000 vermelho
  accentLight: [232, 76, 76],      // #E84C4C
  muted: [89, 89, 89],             // #595959
  mutedLight: [140, 140, 140],     // #8C8C8C
  bgSoft: [245, 247, 250],         // #F5F7FA
  bgCard: [250, 251, 252],         // #FAFBFC
  border: [225, 229, 235],         // #E1E5EB
  success: [46, 139, 87],          // #2E8B57
  warning: [212, 160, 23],         // #D4A017
  successLight: [232, 245, 237],   // fundo verde suave
  dangerLight: [250, 235, 235],    // fundo vermelho suave
  infoLight: [234, 241, 249],      // fundo azul suave
  highlight: [249, 199, 79],       // #F9C74F amarelo destaque
};

const AGENT_TITLES = {
  1: { title: 'Roteiros VI', subtitle: 'Entrevistas Internas · Visão Interna' },
  2: { title: 'Consolidado VI', subtitle: 'Analítico + Devolutiva da Visão Interna' },
  3: { title: 'Roteiros VE', subtitle: 'Entrevistas com Cliente · Visão Externa' },
  4: { title: 'Consolidado VE', subtitle: 'Analítico + Devolutiva da Visão Externa' },
  5: { title: 'Visão de Mercado', subtitle: 'Fichas de concorrentes · Categoria · Tendências · IDA' },
  6: { title: 'Decodificação & Direcionamento', subtitle: 'IDA · De-Para · Diretrizes (Analítico + Devolutiva)' },
  7: { title: 'Valores e Atributos', subtitle: 'Plataforma de Branding — 1ª parte' },
  8: { title: 'Diretrizes Estratégicas', subtitle: 'Recomendações que guiam a construção da marca' },
  9: { title: 'Plataforma de Branding', subtitle: 'Marca É · Negócio Faz · Comunicação Fala' },
  10: { title: 'Identidade Verbal', subtitle: 'UVV · Tons de Voz e Territórios' },
  11: { title: 'One Page de Personalidade', subtitle: 'Briefing de identidade visual' },
  12: { title: 'One Page de Experiência', subtitle: 'Personas · Jornada · Brand Moments' },
  13: { title: 'Plano de Comunicação', subtitle: 'A marca fala · 3 ondas do branding' },
};

// ─────────────────────────────────────────────────────────────
// HELPERS

const MM = (mm) => mm * 2.83465; // mm para pt (jsPDF unit=pt)

function rgb(doc, [r, g, b]) { doc.setTextColor(r, g, b); }
function fillRgb(doc, [r, g, b]) { doc.setFillColor(r, g, b); }
function drawRgb(doc, [r, g, b]) { doc.setDrawColor(r, g, b); }

// Transliterar caracteres fora da CP1252 (Latin-1 Extended usado pelas
// fontes embutidas do jsPDF). Chars não-mapeados viram "?" pra evitar
// que o fluxo quebre o glyph fallback do PDF.
const LATIN1_MAP = {
  '\u2264': '<=',  '\u2265': '>=',  '\u2260': '!=',
  '\u2013': '-',   '\u2014': '-',                     // en/em dash
  '\u2018': "'",   '\u2019': "'",                     // aspas simples tipográficas
  '\u201C': '"',   '\u201D': '"',   '\u201E': '"',    // aspas duplas tipográficas
  '\u2026': '...',                                     // reticências
  '\u2192': '->',  '\u2190': '<-',  '\u2191': '^', '\u2193': 'v',
  '\u2022': '-',   '\u00B7': '·',                     // bullet → hífen; middle dot preservado
  '\u25C6': '·',   '\u25CF': '·',                     // black diamond / circle
  '\u25B8': '>',   '\u25B6': '>',                     // triângulos-seta
  '\u26A0': '!',                                       // warning
  '\u2713': 'OK',  '\u2717': 'X',                      // check/cross
  '\u00B1': '+/-',                                     // plus-minus (está em Latin-1 mas às vezes bate em fonte sem glyph)
  '\u00D7': 'x',                                       // multiplication sign
};
function toLatin1Safe(text) {
  if (!text) return '';
  return String(text).replace(/[^\x00-\xFF]/g, c => LATIN1_MAP[c] || '?');
}

// Divide o campo conclusoes em takeaways + mapa de hipóteses quando o
// Agente 1 anexa "## MAPA DE HIPÓTESES" ao final (Agent_01.parseOutput).
// Retorna dois arrays de strings já "deshifenadas" (sem o "- " inicial).
function splitConclusoesEMapa(conclusoes) {
  const linhas = String(conclusoes || '').split('\n');
  const takeaways = [];
  const mapaHipoteses = [];
  let emMapa = false;
  for (const raw of linhas) {
    const linha = raw.trim();
    if (!linha) continue;
    if (/^#+\s*MAPA DE HIP[ÓO]TESES/i.test(linha)) { emMapa = true; continue; }
    const item = linha.replace(/^[-•*]\s*/, '');
    if (!item) continue;
    (emMapa ? mapaHipoteses : takeaways).push(item);
  }
  return { takeaways, mapaHipoteses };
}

// Limpa markup inline quando só queremos texto bruto (p/ medir)
function stripInline(text) {
  return String(text || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[(\d+)\]/g, '')
    .replace(/`([^`]+)`/g, '$1');
}

// Renderiza uma linha com suporte a **bold** e [N] (sobrescrito cinza)
// Retorna altura consumida (em pt). Faz wrap automaticamente.
function renderInlineLine(doc, text, x, y, maxW, opts = {}) {
  const size = opts.size || 10;
  const color = opts.color || [40, 40, 40];
  const lineHeight = size * 1.35;
  doc.setFontSize(size);
  rgb(doc, color);

  // Tokeniza: splits em **x**, [N], e texto normal
  const tokens = [];
  const re = /\*\*([^*]+)\*\*|\[(\d+)\]/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) tokens.push({ type: 'text', value: text.slice(last, m.index) });
    if (m[1]) tokens.push({ type: 'bold', value: m[1] });
    else if (m[2]) tokens.push({ type: 'sup', value: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push({ type: 'text', value: text.slice(last) });

  // Se só tem texto simples, usa splitTextToSize que é mais robusto com wrap
  if (tokens.length === 1 && tokens[0].type === 'text') {
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(tokens[0].value, maxW);
    for (const line of lines) { doc.text(line, x, y); y += lineHeight; }
    return lines.length * lineHeight;
  }

  // Render complexo token por token, com wrap manual
  let cx = x, cy = y;
  let totalH = lineHeight;
  const flushLine = () => { cx = x; cy += lineHeight; totalH += lineHeight; };
  for (const tok of tokens) {
    if (tok.type === 'bold') {
      doc.setFont('helvetica', 'bold');
      rgb(doc, PALETTE.primary);
    } else if (tok.type === 'sup') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(size * 0.72);
      rgb(doc, PALETTE.mutedLight);
      const txt = `[${tok.value}]`;
      const w = doc.getTextWidth(txt);
      if (cx + w > x + maxW) flushLine();
      doc.text(txt, cx, cy - size * 0.3);
      cx += w + 1.5;
      doc.setFontSize(size);
      rgb(doc, color);
      doc.setFont('helvetica', 'normal');
      continue;
    } else {
      doc.setFont('helvetica', 'normal');
      rgb(doc, color);
    }

    // quebra em palavras
    const words = tok.value.split(/(\s+)/);
    for (const w of words) {
      if (!w) continue;
      const ww = doc.getTextWidth(w);
      if (cx + ww > x + maxW && w.trim().length > 0) flushLine();
      doc.text(w, cx, cy);
      cx += ww;
    }
  }
  return totalH;
}

// ─────────────────────────────────────────────────────────────
// CAPA

function drawCover(doc, out, projetoNome) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const mx = MM(22);
  const agentMeta = AGENT_TITLES[out.agent_num] || { title: `Agente ${out.agent_num}`, subtitle: '' };

  // Fundo branco (default)
  // Eyebrow: ESPANSIONE · {PROJETO}
  // ◆ (U+25C6) não existe nas fontes embutidas do jsPDF (Helvetica latin-1),
  // sai como "%Æ" no PDF final. Uso · (U+00B7) que está na Latin-1.
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  rgb(doc, PALETTE.primary);
  const eyebrow = `ESPANSIONE  ·  ${String(projetoNome || '').toUpperCase()}`;
  doc.text(eyebrow, mx, MM(30), { charSpace: 1.5 });

  // Linha vermelha abaixo
  fillRgb(doc, PALETTE.accent);
  doc.rect(mx, MM(32), MM(15), MM(0.9), 'F');

  // Eyebrow secundário
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  rgb(doc, PALETTE.mutedLight);
  doc.text(`AGENTE ${String(out.agent_num).padStart(2, '0')}  ·  MÉTODO ESPANSIONE`, mx, MM(78), { charSpace: 0.8 });

  // Título grande
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(38);
  rgb(doc, PALETTE.primary);
  const titleLines = doc.splitTextToSize(agentMeta.title, pageW - mx * 2);
  let y = MM(90);
  for (const line of titleLines) { doc.text(line, mx, y); y += 44; }

  // Subtítulo italic
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(15);
  rgb(doc, PALETTE.primaryLight);
  doc.text(agentMeta.subtitle, mx, y + 6);

  // Divisor vermelho
  fillRgb(doc, PALETTE.accent);
  doc.rect(mx, y + 24, MM(20), MM(1.2), 'F');

  // Descrição (resumo executivo da capa)
  if (out.resumo_executivo) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    rgb(doc, PALETTE.muted);
    const lines = doc.splitTextToSize(stripInline(out.resumo_executivo), pageW - mx * 2);
    let yy = y + 50;
    for (const line of lines.slice(0, 6)) { doc.text(line, mx, yy); yy += 16; }
  }

  // Rodapé da capa: meta
  const footerY = pageH - MM(28);
  drawRgb(doc, PALETTE.border);
  doc.setLineWidth(0.5);
  doc.line(mx, footerY, pageW - mx, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  rgb(doc, PALETTE.muted);
  const dateStr = out.created_at
    ? new Date(out.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()
    : '';
  const timeStr = out.created_at
    ? new Date(out.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'H')
    : '';
  doc.text(`GERADO EM ${dateStr}${timeStr ? ` · ${timeStr}` : ''}`, mx, footerY + 14, { charSpace: 1.2 });

  // Badge de confiança
  if (out.confianca) {
    const conf = String(out.confianca).toLowerCase();
    const color = conf.includes('alta') ? PALETTE.success : conf.includes('baix') ? PALETTE.accent : PALETTE.warning;
    // ● (U+25CF) não está na Latin-1 das fontes embutidas do jsPDF — sai
    // como "%Æ" na badge. Uso • (U+2022 BULLET) — também ausente. Nem
    // bullets redondos. Simplifica: usa só o texto sem ícone.
    const label = `Confiança ${out.confianca}`;
    const w = doc.getTextWidth(label) + 14;
    const badgeX = pageW - mx - w;
    fillRgb(doc, color);
    doc.setGState && doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.roundedRect(badgeX, footerY + 3, w, 15, 8, 8, 'F');
    doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));
    drawRgb(doc, color);
    doc.setLineWidth(0.8);
    doc.roundedRect(badgeX, footerY + 3, w, 15, 8, 8, 'S');
    doc.setFont('helvetica', 'bold');
    rgb(doc, color);
    doc.text(label, badgeX + 7, footerY + 13);
  }
}

// ─────────────────────────────────────────────────────────────
// HEADER E FOOTER

function drawHeader(doc, projetoNome, agentMeta) {
  const pageW = doc.internal.pageSize.getWidth();
  const mx = MM(18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  rgb(doc, PALETTE.primary);
  doc.text(`ESPANSIONE  ·  ${String(projetoNome || '').toUpperCase()}  ·  ${agentMeta.title.toUpperCase()}`, mx, MM(14), { charSpace: 1 });
  doc.setFont('helvetica', 'normal');
  rgb(doc, PALETTE.mutedLight);
  doc.text(`Agente ${String(agentMeta.num).padStart(2, '0')}`, pageW - mx, MM(14), { align: 'right' });
  // Linha azul 1.5pt
  drawRgb(doc, PALETTE.primary);
  doc.setLineWidth(1.2);
  doc.line(mx, MM(16.5), pageW - mx, MM(16.5));
}

function drawFooter(doc, pageNum, pageTotal) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const mx = MM(18);
  drawRgb(doc, PALETTE.border);
  doc.setLineWidth(0.4);
  doc.line(mx, pageH - MM(14), pageW - mx, pageH - MM(14));
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  rgb(doc, PALETTE.mutedLight);
  doc.text('Espansione · Método proprietário', mx, pageH - MM(9), { charSpace: 0.8 });
  doc.text(`Página ${pageNum} de ${pageTotal}`, pageW - mx, pageH - MM(9), { align: 'right' });
}

// ─────────────────────────────────────────────────────────────
// SEÇÕES NUMERADAS (círculo azul + título)

function drawSectionHeading(doc, n, title, y, maxW, mx) {
  const circleR = 7;
  // círculo azul
  fillRgb(doc, PALETTE.primary);
  doc.circle(mx + circleR, y + 2, circleR, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(String(n), mx + circleR, y + 5.5, { align: 'center' });
  // título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  rgb(doc, PALETTE.primary);
  doc.text(title, mx + circleR * 2 + 8, y + 5);
  return 22; // altura consumida
}

// ─────────────────────────────────────────────────────────────
// CARDS DE TRÍPLICE

function drawTripliceCards(doc, y, mx, maxW, bloco) {
  // bloco = { impulsionadores: [str], detratores: [str], aceleradores: [str] }
  const cardGap = 10;
  const cardW = (maxW - cardGap * 2) / 3;
  const items = [
    { titulo: 'IMPULSIONADORES', cor: PALETTE.success, bg: PALETTE.successLight, arr: bloco.impulsionadores || [] },
    { titulo: 'DETRATORES', cor: PALETTE.accent, bg: PALETTE.dangerLight, arr: bloco.detratores || [] },
    { titulo: 'ACELERADORES', cor: PALETTE.primaryLight, bg: PALETTE.infoLight, arr: bloco.aceleradores || [] },
  ];
  // altura necessária — maior dos 3
  let maxH = 28;
  const preLines = items.map(it => {
    let lines = 0;
    for (const txt of it.arr) {
      lines += doc.splitTextToSize(stripInline(txt), cardW - 14).length;
    }
    return lines;
  });
  maxH = 28 + Math.max(...preLines) * 11 + 10;

  items.forEach((it, i) => {
    const x = mx + i * (cardW + cardGap);
    // fundo
    fillRgb(doc, it.bg);
    doc.roundedRect(x, y, cardW, maxH, 4, 4, 'F');
    // border-left
    fillRgb(doc, it.cor);
    doc.rect(x, y, 3, maxH, 'F');
    // título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    rgb(doc, it.cor);
    doc.text(it.titulo, x + 10, y + 14, { charSpace: 1 });
    // itens
    let cy = y + 24;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    rgb(doc, [40, 40, 40]);
    for (const txt of it.arr) {
      // setinha — "›" (U+203A SINGLE RIGHT-POINTING ANGLE QUOTATION MARK)
      // está na CP1252/Latin-1 Extended; "▸" (U+25B8) não e virava "%Æ".
      rgb(doc, it.cor);
      doc.text('›', x + 10, cy);
      rgb(doc, [40, 40, 40]);
      const lines = doc.splitTextToSize(stripInline(txt), cardW - 20);
      for (const ln of lines) { doc.text(ln, x + 18, cy); cy += 11; }
    }
  });
  return maxH + 8;
}

// Tenta extrair itens de tríplice a partir do texto conteudo
function extractTriplice(text) {
  const result = { impulsionadores: [], detratores: [], aceleradores: [] };
  const map = {
    impulsionadores: /impulsion[a-z]*/i,
    detratores: /detrato[a-z]*/i,
    aceleradores: /acelerad[a-z]*/i,
  };
  const lines = text.split('\n');
  let current = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    // detectar cabeçalho
    const lower = line.toLowerCase().replace(/[*#—–-]+/g, '').trim();
    for (const [k, re] of Object.entries(map)) {
      if (re.test(lower) && lower.length < 60 && !line.match(/^\s*[-•*]/)) {
        current = k;
        break;
      }
    }
    if (current && /^\s*[-•*▸]\s+/.test(raw)) {
      const bullet = raw.replace(/^\s*[-•*▸]\s+/, '').replace(/^\(?[IEM]\)?\s*/, '').trim();
      if (bullet) result[current].push(bullet);
    } else if (current && line.length > 3 && !/^#/.test(line) && !/:$/.test(line)) {
      // linha orfã dentro do bloco atual — ignora pra evitar ruído
    }
  }
  // só retorna se tiver ao menos um item em cada
  const total = result.impulsionadores.length + result.detratores.length + result.aceleradores.length;
  return total >= 2 ? result : null;
}

// ─────────────────────────────────────────────────────────────
// Renderiza uma tabela markdown como grid editorial com cabeçalho azul
// e linhas alternadas. Retorna a altura consumida.
function drawMarkdownTable(doc, headers, rows, mx, startY, maxW, pageH, onNewPage) {
  let y = startY;
  const bottomLimit = pageH - MM(22);
  const cols = headers.length;
  if (cols === 0) return 0;

  const colW = maxW / cols;
  const cellPadX = 6;
  const cellPadY = 5;
  const headerH = 20;
  const rowH = 18;

  const ensure = (h) => { if (y + h > bottomLimit) { onNewPage(); y = MM(24); } };

  // Cabeçalho
  ensure(headerH);
  fillRgb(doc, PALETTE.primary);
  doc.rect(mx, y, maxW, headerH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  headers.forEach((h, i) => {
    const x = mx + i * colW + cellPadX;
    const txt = doc.splitTextToSize(stripInline(h), colW - 2 * cellPadX)[0] || '';
    doc.text(txt, x, y + headerH - cellPadY - 2, { charSpace: 0.5 });
  });
  y += headerH;

  // Linhas
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  rows.forEach((row, rIdx) => {
    ensure(rowH);
    // alterna fundo
    if (rIdx % 2 === 0) {
      fillRgb(doc, PALETTE.bgSoft);
      doc.rect(mx, y, maxW, rowH, 'F');
    }
    row.forEach((cell, cIdx) => {
      if (cIdx >= cols) return;
      const x = mx + cIdx * colW + cellPadX;
      // respeita **bold** no conteúdo da célula
      const hasBold = /\*\*.+?\*\*/.test(cell);
      if (hasBold) {
        // renderInlineLine para preservar bold; só 1 linha
        doc.setTextColor(40, 40, 40);
        renderInlineLine(doc, cell, x, y + rowH - cellPadY - 2, colW - 2 * cellPadX, { size: 9, color: [40, 40, 40] });
      } else {
        rgb(doc, [40, 40, 40]);
        const txt = doc.splitTextToSize(stripInline(cell), colW - 2 * cellPadX)[0] || '';
        doc.text(txt, x, y + rowH - cellPadY - 2);
      }
    });
    // linha inferior sutil
    drawRgb(doc, PALETTE.border);
    doc.setLineWidth(0.3);
    doc.line(mx, y + rowH, mx + maxW, y + rowH);
    y += rowH;
  });

  return y - startY;
}

// ─────────────────────────────────────────────────────────────
// RENDERIZADOR DE MARKDOWN DO CONTEÚDO

function renderConteudo(doc, raw, mx, startY, maxW, pageH, onNewPage) {
  let y = startY;
  const bottomLimit = pageH - MM(22);
  const ensure = (h) => { if (y + h > bottomLimit) { onNewPage(); y = MM(24); } };

  // Markers VIZ (<!-- VIZ:xxx -->) são instruções ao renderer HTML/Playwright
  // e nunca devem aparecer no texto do PDF jsPDF. Remover antes de processar
  // linhas para não vazar como literal no output textual.
  // Transliterar também chars fora da CP1252 (ex.: ≥, —, aspas tipográficas)
  // que viravam "%Æ" nas fontes embutidas.
  const conteudo = toLatin1Safe(
    String(raw || '').replace(/<!--\s*VIZ:[a-z0-9_]+(?::[a-z0-9-]+)?\s*-->/g, '')
  );

  // Detecta bloco de tríplice (Impulsionadores/Detratores/Aceleradores)
  // e renderiza como grid de 3 cards quando identificado
  const triplice = extractTriplice(conteudo);
  let skipTripliceSection = false;

  const lines = conteudo.split('\n');
  let inListBuffer = null;  // buffer pra listas

  const flushList = () => {
    if (!inListBuffer || inListBuffer.length === 0) return;
    for (const item of inListBuffer) {
      ensure(16);
      fillRgb(doc, PALETTE.accent);
      doc.circle(mx + 3, y + 5, 1.6, 'F');
      const h = renderInlineLine(doc, item, mx + 10, y + 7, maxW - 10, { size: 10, color: [40, 40, 40] });
      y += Math.max(14, h);
    }
    inListBuffer = null;
    y += 2;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Linha vazia → flush
    if (!line) { flushList(); y += 4; continue; }

    // Heading ## SECTION
    if (/^##\s+/.test(line)) {
      flushList();
      const title = line.replace(/^##\s+/, '');
      // Se é cabeçalho de tríplice e temos bloco detectado, renderizar card
      if (triplice && /(impulsionador|detrator|acelerador|tríplice|triplice|decodifica)/i.test(title) && !skipTripliceSection) {
        ensure(MM(50));
        y += 6;
        // pequeno título acima dos cards
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        rgb(doc, PALETTE.primary);
        doc.text(title.toUpperCase(), mx, y, { charSpace: 0.8 });
        y += 10;
        const used = drawTripliceCards(doc, y, mx, maxW, triplice);
        y += used;
        skipTripliceSection = true;
        continue;
      }
      ensure(28);
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      rgb(doc, PALETTE.primary);
      doc.text(title, mx, y);
      y += 4;
      fillRgb(doc, PALETTE.accent);
      doc.rect(mx, y, 18, 1.8, 'F');
      y += 12;
      continue;
    }

    // Heading ### SUBSECTION
    if (/^###\s+/.test(line)) {
      flushList();
      ensure(20);
      const title = line.replace(/^###\s+/, '');
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      rgb(doc, PALETTE.primaryLight);
      doc.text(title, mx, y);
      y += 12;
      continue;
    }

    // Heading # ou cabeçalho numerado "1. TITLE"
    if (/^\d+\.\s+[A-ZÁÉÍÓÚÇÂÊÔÃÕ][A-ZÁÉÍÓÚÇÂÊÔÃÕ\s\d×—(),\/-]+$/.test(line) && line.length < 90) {
      flushList();
      // parse "1. PERFIL DA EMPRESA"
      const m = line.match(/^(\d+)\.\s+(.+)$/);
      if (m) {
        ensure(22);
        y += 4;
        drawSectionHeading(doc, m[1], m[2], y, maxW, mx);
        y += 22;
        continue;
      }
    }

    // Tabela markdown: linha que começa+termina com pipe, seguida por
    // separador "|---|---|" na próxima linha.
    if (/^\|.+\|\s*$/.test(line) && i + 1 < lines.length && /^\|\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(lines[i + 1].trim())) {
      flushList();
      const headers = line.split('|').slice(1, -1).map(c => c.trim());
      const rows = [];
      let j = i + 2;
      while (j < lines.length && /^\|.+\|\s*$/.test(lines[j].trim())) {
        rows.push(lines[j].trim().split('|').slice(1, -1).map(c => c.trim()));
        j++;
      }
      const used = drawMarkdownTable(doc, headers, rows, mx, y + 4, maxW, pageH, onNewPage);
      y += used + 6;
      i = j - 1;
      continue;
    }

    // Linha de bullet
    if (/^[-•*]\s+/.test(line)) {
      const item = line.replace(/^[-•*]\s+/, '');
      if (!inListBuffer) inListBuffer = [];
      inListBuffer.push(item);
      continue;
    }

    // Linha normal (parágrafo)
    flushList();
    ensure(18);
    const h = renderInlineLine(doc, line, mx, y + 5, maxW, { size: 10, color: [40, 40, 40] });
    y += Math.max(12, h);
  }

  flushList();
  return y;
}

// ─────────────────────────────────────────────────────────────
// BLOCO DE FONTES

function drawFontesBlock(doc, text, mx, startY, maxW, pageH, onNewPage) {
  if (!text || !text.trim()) return startY;
  let y = startY;
  const bottomLimit = pageH - MM(22);

  y += 6;
  if (y + 30 > bottomLimit) { onNewPage(); y = MM(24); }
  // Linha separadora
  drawRgb(doc, PALETTE.border);
  doc.setLineWidth(0.5);
  doc.line(mx, y, mx + maxW, y);
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  rgb(doc, PALETTE.primary);
  doc.text('FONTES', mx, y, { charSpace: 1.5 });
  y += 14;

  const items = text.split('\n').map(s => s.trim()).filter(Boolean);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  for (const item of items) {
    if (y + 14 > bottomLimit) { onNewPage(); y = MM(24); }
    // extrai número se existir
    const m = item.match(/^(\d+)[\.\)]\s*(.*)$/);
    const n = m ? m[1] : '•';
    const txt = m ? m[2] : item;
    // círculo azul pequeno
    fillRgb(doc, PALETTE.primary);
    doc.circle(mx + 5, y - 2, 4.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(String(n), mx + 5, y, { align: 'center' });
    // texto
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    rgb(doc, PALETTE.muted);
    const lines = doc.splitTextToSize(txt, maxW - 18);
    let yy = y;
    for (const ln of lines) { doc.text(ln, mx + 14, yy); yy += 10; }
    y = yy + 4;
  }
  return y;
}

// ─────────────────────────────────────────────────────────────
// ENTRADA PRINCIPAL

export async function generateOutputPdf(out, projeto) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const mx = MM(18);
  const maxW = pageW - mx * 2;
  const projetoNome = projeto?.cliente || projeto?.nome || '';
  const agentMeta = {
    num: out.agent_num,
    ...(AGENT_TITLES[out.agent_num] || { title: `Agente ${out.agent_num}`, subtitle: '' }),
  };

  // PÁGINA 1 — CAPA
  drawCover(doc, out, projetoNome);

  // ─ Páginas internas ─
  let currentPage = 1;
  let pageCount = 1;

  const startNewPage = () => {
    doc.addPage();
    currentPage++;
    pageCount = Math.max(pageCount, currentPage);
    drawHeader(doc, projetoNome, agentMeta);
  };

  // Adiciona a primeira página interna
  startNewPage();
  let y = MM(26);

  // Eyebrow da segunda página
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  rgb(doc, PALETTE.mutedLight);
  doc.text(`DOCUMENTO · AGENTE ${String(out.agent_num).padStart(2, '0')}`, mx, y, { charSpace: 1.5 });
  y += 14;

  // Card de Resumo Executivo (destaque visual)
  if (out.resumo_executivo) {
    // gradiente simulado: 3 retângulos horizontais de opacidade variável
    const cardH = 86;
    const cardX = mx;
    const cardY = y;
    const cardW = maxW;
    // fundo azul primário
    fillRgb(doc, PALETTE.primary);
    doc.roundedRect(cardX, cardY, cardW, cardH, 6, 6, 'F');
    // gradient stripes com primaryLight (simulação)
    for (let i = 0; i < 16; i++) {
      const f = i / 16;
      const r = PALETTE.primary[0] + (PALETTE.primaryLight[0] - PALETTE.primary[0]) * f;
      const g = PALETTE.primary[1] + (PALETTE.primaryLight[1] - PALETTE.primary[1]) * f;
      const b = PALETTE.primary[2] + (PALETTE.primaryLight[2] - PALETTE.primary[2]) * f;
      doc.setFillColor(r, g, b);
      doc.rect(cardX + (cardW * i) / 16, cardY, cardW / 16 + 0.5, cardH, 'F');
    }
    // bolinha vermelha decorativa
    fillRgb(doc, PALETTE.accent);
    if (doc.setGState) doc.setGState(new doc.GState({ opacity: 0.25 }));
    doc.circle(cardX + cardW - 30, cardY + cardH - 15, 18, 'F');
    if (doc.setGState) doc.setGState(new doc.GState({ opacity: 1 }));

    // texto dentro
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('RESUMO EXECUTIVO', cardX + 16, cardY + 18, { charSpace: 1.5 });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    const lines = doc.splitTextToSize(stripInline(out.resumo_executivo), cardW - 32);
    let ry = cardY + 34;
    for (const ln of lines.slice(0, 5)) { doc.text(ln, cardX + 16, ry); ry += 13; }
    y = cardY + cardH + 18;
  }

  // Renderiza conteúdo
  if (out.conteudo) {
    y = renderConteudo(doc, out.conteudo, mx, y, maxW, pageH, startNewPage);
  }

  // Conclusões — sempre como bloco destacado
  // Se o Agente 1 anexa "## MAPA DE HIPÓTESES" dentro de conclusoes (fix
  // Agent_01 parseOutput), separamos as duas seções para evitar que a
  // numeração encadeie (H1..Hn vira 4..N após os 3 takeaways).
  if (out.conclusoes) {
    const { takeaways, mapaHipoteses } = splitConclusoesEMapa(out.conclusoes);

    if (takeaways.length > 0) {
      if (y + 60 > pageH - MM(22)) { startNewPage(); y = MM(24); }
      y += 16;
      fillRgb(doc, PALETTE.accent);
      doc.rect(mx, y, 28, 2.4, 'F');
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      rgb(doc, PALETTE.accent);
      doc.text('CONCLUSÕES', mx, y, { charSpace: 1.2 });
      y += 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      takeaways.forEach((text, i) => {
        if (y + 14 > pageH - MM(22)) { startNewPage(); y = MM(24); }
        fillRgb(doc, PALETTE.accent);
        doc.circle(mx + 6, y + 3, 5.5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(String(i + 1), mx + 6, y + 5, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        rgb(doc, [40, 40, 40]);
        const h = renderInlineLine(doc, text, mx + 16, y + 4, maxW - 16, { size: 10, color: [40, 40, 40] });
        y += Math.max(14, h) + 4;
      });
    }

    if (mapaHipoteses.length > 0) {
      if (y + 60 > pageH - MM(22)) { startNewPage(); y = MM(24); }
      y += 16;
      fillRgb(doc, PALETTE.primary);
      doc.rect(mx, y, 28, 2.4, 'F');
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      rgb(doc, PALETTE.primary);
      doc.text('MAPA DE HIPÓTESES', mx, y, { charSpace: 1.2 });
      y += 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      mapaHipoteses.forEach((text, i) => {
        if (y + 14 > pageH - MM(22)) { startNewPage(); y = MM(24); }
        // rótulo [Hn] em pill azul, texto restante em cinza
        const matchLabel = text.match(/^\[H(\d+)\]\s*(.*)$/);
        const label = matchLabel ? `H${matchLabel[1]}` : `H${i + 1}`;
        const body  = matchLabel ? matchLabel[2] : text;
        fillRgb(doc, PALETTE.primary);
        doc.roundedRect(mx, y, 22, 10, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(label, mx + 11, y + 6.8, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        rgb(doc, [40, 40, 40]);
        const h = renderInlineLine(doc, body, mx + 28, y + 4, maxW - 28, { size: 10, color: [40, 40, 40] });
        y += Math.max(14, h) + 4;
      });
    }
  }

  // Fontes
  if (out.fontes) {
    y = drawFontesBlock(doc, out.fontes, mx, y, maxW, pageH, startNewPage);
  }

  // Footer em todas as páginas internas (2..N)
  const totalPages = doc.getNumberOfPages();
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, p, totalPages);
  }

  const fileName = `${projetoNome}_Agente${String(out.agent_num).padStart(2, '0')}_${(agentMeta.title || '').replace(/[^A-Za-z0-9À-ÿ]+/g, '_')}.pdf`;
  doc.save(fileName);
}
