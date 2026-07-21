// =====================================================================
// Mapa da Maturidade — relatório editorial de conversão (HTML data-driven).
// Alinhado a landing (/crescimento): Poppins + navy #001A3B + vermelho #C72638, e o
// popula com o resultado real + a narrativa da IA (reportVendedor). Serve
// tanto a rota web quanto a geração de PDF (chromium renderiza este HTML).
// =====================================================================
import { CATALOGO_MATURIDADE } from './catalog.generated.js';
import { ESPANSIONE_LOGO } from '../brand/logoDataUri.js';

// Contato do CTA final — mesmo WhatsApp da landing (/crescimento). O próximo passo
// é uma conversa, não um checkout.
const WHATSAPP_URL = `https://wa.me/5511985775893?text=${encodeURIComponent(
  'Olá! Fiz o Mapa do Crescimento Integrado Essencial e quero descobrir a origem por trás dos sintomas com o Crescimento Integrado Estratégico.'
)}`;

// remove travessões (— / –) de qualquer texto, convertendo em pontuação corrente.
// Decisão de marca: os relatórios não usam travessão.
function deDash(s) {
  return String(s == null ? '' : s)
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/,\s*,/g, ',')
    .replace(/\s+,/g, ',')
    .replace(/,\s*\./g, '.')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
// escapa texto da IA/dados para não quebrar o layout (e já tira travessões)
function esc(s) {
  return deDash(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
// permite um único *trecho* em ênfase (itálico dourado) na cópia da IA: *texto*
function emphasize(s) {
  return esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

const COR_NIVEL = { 1: '#C72638', 2: '#C72638', 3: '#A16207', 4: '#15803D' };

// todos os atributos de marca possíveis (opções do MM2-MAR-10b)
function atributosPossiveis() {
  const cond = CATALOGO_MATURIDADE.find((q) => q.score_family === 'brand_attributes');
  return cond ? cond.opcoes : [];
}

// cores dos níveis sobre o navy do hero (versões claras, legíveis)
const NIVEL_COR_HERO = { 1: '#EA6A76', 2: '#EA6A76', 3: '#E7B24D', 4: '#5FC08A' };

function trackSvg(score, sistemas = []) {
  const px = (v) => Math.max(12, Math.min(788, Math.round((v / 100) * 800)));
  const x = px(score);
  // posição real de cada pilar na régua
  const marks = (sistemas || []).filter((s) => s.nota != null).map((s) => ({
    sx: px(s.nota),
    cor: NIVEL_COR_HERO[s.nivel] || '#E7B24D',
    ini: esc((s.sistema || '?').trim().charAt(0).toUpperCase()),
  }));
  // dodge em 2 fases: quando marcadores têm nota igual/próxima, as letras se
  // sobrepõem entre si e com a linha do "você".
  // Fase 1 — espalha as letras entre si: clusters de vizinhos a menos de MIN
  // são mesclados e centrados na média das notas, presos aos limites da régua.
  const MIN = 20;
  marks.sort((a, b) => a.sx - b.sx);
  const startDe = (c) => {
    const w = (c.length - 1) * MIN;
    const media = c.reduce((t, it) => t + it.sx, 0) / c.length;
    return Math.max(12, Math.min(788 - w, media - w / 2));
  };
  let clusters = marks.map((m) => [m]);
  for (let merged = true; merged; ) {
    merged = false;
    for (let i = 0; i + 1 < clusters.length; i++) {
      const fim = startDe(clusters[i]) + (clusters[i].length - 1) * MIN;
      if (startDe(clusters[i + 1]) - fim < MIN) {
        clusters[i] = clusters[i].concat(clusters[i + 1]);
        clusters.splice(i + 1, 1);
        merged = true;
        break;
      }
    }
  }
  for (const c of clusters) {
    const s = startDe(c);
    c.forEach((it, k) => { it.lx = Math.round(s + k * MIN); });
  }
  // Fase 2 — a linha do "você" é fixa na nota real: marcadores a menos de MIN
  // dela se afastam (mudando de lado se faltar espaço na borda), mantendo MIN
  // entre si e os limites. Sempre viável: 4 letras ocupam 80 de 776 unidades.
  const esq = marks.filter((m) => m.lx < x);
  const dir = marks.filter((m) => m.lx >= x);
  const capEsq = x - MIN >= 12 ? Math.floor((x - MIN - 12) / MIN) + 1 : 0;
  const capDir = x + MIN <= 788 ? Math.floor((788 - x - MIN) / MIN) + 1 : 0;
  while (esq.length > capEsq) dir.unshift(esq.pop());
  while (dir.length > capDir) esq.push(dir.shift());
  for (let i = esq.length - 1; i >= 0; i--) {
    esq[i].lx = Math.min(esq[i].lx, i === esq.length - 1 ? x - MIN : esq[i + 1].lx - MIN);
  }
  for (let i = 0; i < esq.length; i++) {
    esq[i].lx = Math.max(esq[i].lx, i === 0 ? 12 : esq[i - 1].lx + MIN);
  }
  for (let i = 0; i < dir.length; i++) {
    dir[i].lx = Math.max(dir[i].lx, i === 0 ? x + MIN : dir[i - 1].lx + MIN);
  }
  for (let i = dir.length - 1; i >= 0; i--) {
    dir[i].lx = Math.min(dir[i].lx, i === dir.length - 1 ? 788 : dir[i + 1].lx - MIN);
  }
  const dots = marks.map((m) => {
    const lx = m.lx != null ? m.lx : m.sx;
    return `<line x1="${lx}" y1="40" x2="${lx}" y2="60" stroke="${m.cor}" stroke-width="2.5" opacity=".85"/>
      <circle cx="${lx}" cy="40" r="5.5" fill="${m.cor}" stroke="#001A3B" stroke-width="1.5"/>
      <text x="${lx}" y="30" text-anchor="middle" font-family="Poppins, sans-serif" font-size="13" font-weight="700" fill="${m.cor}">${m.ini}</text>`;
  }).join('');
  return `<svg viewBox="0 0 800 98" role="img" aria-label="Nível de maturidade: ${score}%">
      <rect x="0" y="50" width="196" height="11" rx="5.5" fill="#2C3A57"/>
      <rect x="204" y="50" width="196" height="11" rx="5.5" fill="#33507A"/>
      <rect x="408" y="50" width="196" height="11" rx="5.5" fill="#3E5F91"/>
      <rect x="612" y="50" width="188" height="11" rx="5.5" fill="#4A73AE"/>
      <g font-family="Poppins, sans-serif" font-size="15" font-weight="600" fill="#C7D2E0">
        <text x="0" y="88">Nível 1</text><text x="204" y="88">Nível 2</text>
        <text x="408" y="88">Nível 3</text><text x="612" y="88">Nível 4</text>
      </g>
      ${dots}
      <text x="${x}" y="14" text-anchor="middle" font-family="Poppins, sans-serif" font-size="14" font-weight="800" fill="#F19AA5">você</text>
      <line x1="${x}" y1="18" x2="${x}" y2="66" stroke="#F19AA5" stroke-width="2.5"/>
      <circle cx="${x}" cy="55" r="8.5" fill="#F19AA5" stroke="#001A3B" stroke-width="2.5"/>
    </svg>`;
}

export function buildRelatorioMaturidadeHtml({ cliente, dataLabel, result, narrativa = {} }) {
  const score = result.general_score == null ? 0 : Math.round(result.general_score);
  const alertsByNome = {};
  for (const s of narrativa.sistemas || []) if (s && s.sistema) alertsByNome[s.sistema] = s;

  // Um bloco por pilar amarrando TODOS os pontos: nível, leitura e, quando o
  // pilar pesa, o que a fragilidade costuma custar (antes era uma seção à parte).
  const sistemasHtml = (result.sistemas || []).map((s) => {
    const nota = s.nota == null ? 0 : Math.round(s.nota);
    const cor = COR_NIVEL[s.nivel] || 'var(--brass)';
    const n = alertsByNome[s.sistema] || {};
    const alerta = n.alert
      ? (n.is_alerta ? `<b>Sinal de alerta:</b> ${emphasize(n.alert)}` : emphasize(n.alert))
      : esc(s.leitura || '');
    const custo = n.custo && String(n.custo).trim()
      ? `<p class="sys-cost"><b>O que costuma custar:</b> ${emphasize(n.custo)}</p>`
      : '';
    return `<div class="sys">
      <div class="sys-top"><span class="sys-name">${esc(s.sistema)}</span><span class="sys-meta"><b>${nota}%</b> · Nível ${s.nivel || '?'} · ${esc((s.nivel_nome || '').toLowerCase())}</span></div>
      <div class="bar"><i style="width:${nota}%;background:${cor};"></i></div>
      <p class="sys-alert">${alerta}</p>
      ${custo}
    </div>`;
  }).join('\n');

  const selecionados = new Set(result.atributos_marca || []);
  const chipsHtml = atributosPossiveis().map((a) =>
    `<span class="chip ${selecionados.has(a) ? 'on' : 'off'}">${esc(a)}</span>`).join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mapa do Crescimento Integrado Essencial${cliente ? ' · ' + esc(cliente) : ''}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{--ink:#001A3B;--paper:#F5F7FB;--paper-2:#FFFFFF;--line:#E2E8F0;--brass:#C72638;--brass-deep:#9E1B2A;--clay:#C72638;--sage:#15803D;--text:#0C2340;--muted:#5B6B7F;--faint:#94A3B8;--r:14px;}
  *{box-sizing:border-box;} html{-webkit-text-size-adjust:100%;}
  body{margin:0;background:var(--paper);color:var(--text);font-family:'Poppins',system-ui,sans-serif;font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;}
  .wrap{max-width:820px;margin:0 auto;padding:0 26px;}
  .eyebrow{font-family:'Poppins',sans-serif;font-size:11.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--brass);font-weight:500;}
  h1,h2,h3{font-family:'Poppins',sans-serif;font-weight:600;line-height:1.12;letter-spacing:-.01em;margin:0;}
  p{margin:0 0 1em;}
  .hero{background:var(--ink);color:#EEF1F7;padding:52px 0 40px;}
  .hero .eyebrow{color:#F19AA5;} .hero .top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;}
  .hero .top-l{display:flex;flex-direction:column;gap:6px;} .hero-logo{width:150px;height:auto;flex:0 0 auto;margin-top:2px;}
  .hero .co{font-family:'Poppins',sans-serif;font-size:15px;color:#AEB8CE;font-weight:500;}
  .verdict{font-size:clamp(27px,4.6vw,40px);color:#fff;margin:22px 0 6px;max-width:18ch;}
  .verdict em{font-style:italic;color:#F19AA5;} .subverdict{color:#AEB8CE;max-width:54ch;margin-bottom:30px;}
  .score-row{display:flex;align-items:flex-end;gap:22px;flex-wrap:wrap;}
  .score-big{font-family:'Poppins',sans-serif;font-size:52px;font-weight:600;color:#fff;line-height:.9;} .score-big span{font-size:22px;color:#8E9AB6;}
  .score-lvl{padding-bottom:6px;} .score-lvl .n{font-family:'Poppins',sans-serif;font-size:21px;color:#fff;}
  .score-lvl .t{font-family:'Poppins',sans-serif;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#8E9AB6;}
  .track{margin-top:26px;} .track svg{width:100%;height:auto;display:block;}
  .track-legend{display:flex;flex-wrap:wrap;gap:8px 20px;margin-top:16px;}
  .track-legend .tl{display:inline-flex;align-items:center;gap:7px;font-size:13px;color:#C7D2E0;font-weight:500;}
  .track-legend i{width:10px;height:10px;border-radius:50%;display:inline-block;flex:0 0 auto;}
  section{padding:44px 0;} .sec-head{display:flex;align-items:baseline;gap:14px;margin-top:26px;margin-bottom:26px;}
  .sec-head .num{font-family:'Poppins',sans-serif;font-size:12px;color:var(--brass);padding-top:4px;} .sec-head h2{font-size:clamp(21px,3vw,27px);}
  .lead{font-size:18px;color:var(--muted);max-width:60ch;} .divider{height:1px;background:var(--line);border:0;margin:0;}
  .sys{padding:18px 0;border-bottom:1px solid var(--line);} .sys:first-child{border-top:1px solid var(--line);}
  .sys-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px;} .sys-name{font-family:'Poppins',sans-serif;font-size:19px;font-weight:600;}
  .sys-meta{font-family:'Poppins',sans-serif;font-size:12px;color:var(--muted);letter-spacing:.04em;} .sys-meta b{color:var(--text);}
  .bar{position:relative;height:9px;border-radius:6px;background:#E7E2D8;margin:12px 0 10px;overflow:hidden;} .bar>i{position:absolute;left:0;top:0;bottom:0;border-radius:6px;display:block;}
  .sys-alert{font-size:14.5px;color:var(--muted);} .sys-alert b{color:var(--clay);font-weight:600;}
  .sys-cost{font-size:14px;color:var(--muted);margin:8px 0 0;padding-left:14px;border-left:2px solid var(--clay);} .sys-cost b{color:var(--text);font-weight:600;}
  .exp{border:1px solid var(--line);border-left:3px solid var(--clay);border-radius:var(--r);background:var(--paper-2);padding:22px 24px;margin-bottom:16px;}
  .exp .tag{font-family:'Poppins',sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--clay);font-weight:500;} .exp h3{font-size:20px;margin:8px 0 8px;}
  .exp .cost{font-size:15px;color:var(--muted);} .exp .cost b{color:var(--text);font-weight:600;}
  .pattern{background:var(--ink);color:#EEF1F7;border-radius:20px;padding:40px;} .pattern .eyebrow{color:#F19AA5;}
  .pattern p{font-family:'Poppins',sans-serif;font-size:clamp(20px,2.8vw,25px);line-height:1.42;color:#F3F1EA;margin:16px 0 0;} .pattern p em{color:#F19AA5;font-style:italic;}
  .chips{display:flex;flex-wrap:wrap;gap:9px;margin:6px 0 20px;}
  .chip{font-family:'Poppins',sans-serif;font-size:13px;padding:7px 13px;border-radius:999px;border:1px solid var(--line);background:var(--paper-2);color:var(--text);}
  .chip.on{background:var(--ink);color:#fff;border-color:var(--ink);} .chip.off{color:var(--faint);border-style:dashed;}
  .attr-q{font-family:'Poppins',sans-serif;font-size:20px;line-height:1.4;color:var(--text);max-width:54ch;}
  .start{border:1px solid var(--line);border-left:3px solid var(--brass);border-radius:var(--r);background:var(--paper-2);padding:22px 24px;} .start .eyebrow{display:block;margin-bottom:8px;} .start p{font-family:'Poppins',sans-serif;font-size:18px;line-height:1.5;color:var(--text);margin:0;} .start p em{font-style:normal;font-weight:600;color:var(--brass-deep);}
  .gaps{border:1px solid var(--line);border-radius:var(--r);background:var(--paper-2);padding:22px 24px;} .gaps .eyebrow{display:block;margin-bottom:12px;} .gaps ul{margin:0;padding:0;list-style:none;} .gaps li{position:relative;padding-left:18px;margin:0 0 9px;font-size:15px;color:var(--muted);line-height:1.5;} .gaps li:last-child{margin-bottom:0;} .gaps li::before{content:'';position:absolute;left:0;top:9px;width:6px;height:6px;border-radius:50%;background:var(--brass);} .gaps li b{color:var(--text);font-weight:600;}
  .gap-q{font-family:'Poppins',sans-serif;font-size:clamp(22px,3.4vw,30px);line-height:1.32;max-width:24ch;margin:0 auto;text-align:center;} .gap-q em{font-style:italic;color:var(--brass-deep);}
  .gap-sub{text-align:center;color:var(--muted);max-width:48ch;margin:18px auto 0;}
  .next{background:linear-gradient(180deg,#1B2A47,#001A3B);color:#EEF1F7;border-radius:22px;padding:46px 44px;text-align:center;} .next .eyebrow{color:#F19AA5;}
  .next h2{color:#fff;font-size:clamp(24px,3.4vw,32px);margin:14px auto 0;max-width:20ch;} .next .hook{color:#B7C0D6;max-width:56ch;margin:20px auto 30px;font-size:17px;}
  .cta{display:inline-block;background:var(--brass);color:#fff;text-decoration:none;font-weight:600;font-size:16px;padding:15px 30px;border-radius:12px;} .cta:hover{background:#E13345;}
  .next .fine{color:#7E89A4;font-family:'Poppins',sans-serif;font-size:11.5px;letter-spacing:.08em;margin-top:18px;}
  footer{padding:40px 0 60px;text-align:center;} .brand{font-family:'Poppins',sans-serif;font-size:20px;letter-spacing:.04em;color:var(--ink);}
  .tagline{font-family:'Poppins',sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);margin-top:8px;}
  @media (max-width:560px){.pattern,.next{padding:30px 24px;}.exp{padding:20px;}.score-big{font-size:44px;}}
  .pdf-btn{position:fixed;bottom:20px;right:20px;z-index:99;background:var(--brass);color:#fff;border:0;border-radius:10px;padding:12px 18px;font:600 14px 'Poppins',sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.28);}
  .pdf-btn:hover{background:#E13345;}
  @page{size:A4;margin:14mm 12mm;}
  @media print{
    html,body{background:#fff!important;}
    *{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .pdf-btn{display:none!important;}
    .hero{padding:34px 0 30px;} section{padding:24px 0;} .sec-head{margin-top:12px;margin-bottom:18px;}
    .sys,.exp,.pattern,.next,.attr-q,.gap-q,.gap-sub,.chips,.track,.score-row{break-inside:avoid;}
    h1,h2,h3{break-after:avoid;}
  }
</style></head><body>
<button class="pdf-btn" onclick="salvarPdf()">⬇ Salvar como PDF</button>
<script>
// PDF pela impressão nativa do navegador: vetorial, texto selecionável e
// paginação correta. O html2pdf (canvas fatiado) gerava páginas em branco no
// início e cortava seções; trocado por window.print + @media print.
function salvarPdf(){
  var ready=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
  ready.then(function(){ setTimeout(function(){ window.print(); }, 150); });
}
if(new URLSearchParams(location.search).get('print')==='1'){
  window.addEventListener('load',function(){ salvarPdf(); });
}
</script>

<header class="hero"><div class="wrap">
  <div class="top">
    <div class="top-l"><span class="eyebrow">Mapa do Crescimento Integrado Essencial</span><span class="co">${esc(cliente || 'Empresa')}${dataLabel ? ' · ' + esc(dataLabel) : ''}</span></div>
    <img class="hero-logo" src="${ESPANSIONE_LOGO}" alt="Espansione" />
  </div>
  <h1 class="verdict">${emphasize(narrativa.verdict || 'O retrato da sua empresa hoje.')}</h1>
  <p class="subverdict">${esc(narrativa.subverdict || 'Você respondeu 40 perguntas sobre a sua empresa. Abaixo, o que elas revelam.')}</p>
  <div class="score-row"><div class="score-big">${score}<span>%</span></div>
    <div class="score-lvl"><div class="n">Nível ${result.general_nivel || '?'}</div><div class="t">${esc(result.general_level || '')}</div></div></div>
  <div class="track">${trackSvg(score, result.sistemas)}</div>
  <div class="track-legend">${(result.sistemas || []).map((s) => `<span class="tl"><i style="background:${NIVEL_COR_HERO[s.nivel] || '#E7B24D'}"></i>${esc((s.sistema || '').trim().charAt(0).toUpperCase())} · ${esc(s.sistema)}${s.nota != null ? ` (${Math.round(s.nota)}%)` : ''}</span>`).join('')}</div>
</div></header>

<section class="wrap">
  <div class="sec-head"><span class="num">01</span><h2>Onde a empresa está, pilar a pilar</h2></div>
  <p class="lead" style="margin-bottom:26px;">Marca, Negócios, Comunicação e Pessoas não funcionam separados: juntos, formam um sistema. Abaixo, o nível de cada pilar, a leitura do que isso significa na prática e, onde pesa, o que a fragilidade costuma custar ao negócio.</p>
  ${sistemasHtml}
</section>

${Array.isArray(narrativa.gaps) && narrativa.gaps.length ? `<section class="wrap"><div class="gaps"><span class="eyebrow">Principais gaps</span><ul>${narrativa.gaps.map((g) => `<li><b>${esc(g.pilar)}:</b> ${emphasize(g.gap)}</li>`).join('')}</ul></div></section>` : ''}

${narrativa.pattern ? `<section class="wrap"><div class="pattern"><span class="eyebrow">Resumo da Análise</span>${String(narrativa.pattern).split(/\n{2,}/).map((p) => `<p>${emphasize(p)}</p>`).join('')}</div></section>` : ''}

${chipsHtml ? `<section class="wrap">
  <div class="sec-head"><span class="num">02</span><h2>Como você acha que o mercado enxerga a empresa</h2></div>
  <p class="lead" style="margin-bottom:18px;">Estes são os atributos que <b>você</b> associa à empresa hoje, e os que ficaram de fora. Se os seus clientes respondessem, marcariam os mesmos? Essa é uma das perguntas que só ganham resposta quando se investiga a fundo.</p>
  <div class="chips">${chipsHtml}</div>
  ${narrativa.atributos_pergunta ? `<p class="attr-q">${emphasize(narrativa.atributos_pergunta)}</p>` : ''}
</section>` : ''}

${narrativa.ponto_de_partida ? `<section class="wrap"><div class="start"><span class="eyebrow">Por onde aprofundar</span><p>${emphasize(narrativa.ponto_de_partida)}</p></div></section>` : ''}

<hr class="divider">

<section class="wrap">
  <p class="gap-q">O que você viu até aqui são <em>sintomas</em>. O que muda o jogo agora é descobrir a origem por trás deles.</p>
  <p class="gap-sub">O problema aparece nas vendas, na margem, na equipe ou na sobrecarga do dono. Mas nem sempre a causa está onde o sintoma aparece.</p>
</section>

<section class="wrap"><div class="next">
  <span class="eyebrow">O próximo passo</span>
  <h2>Mapa do Crescimento Integrado Estratégico</h2>
  <p class="hook">${esc(narrativa.cta_hook || 'Este retrato mostra ONDE a empresa está. O Crescimento Integrado Estratégico revela POR QUÊ: ele conecta os quatro pilares, Marca, Negócios, Comunicação e Pessoas, e mostra onde a integração se rompe. Ouve não só você, mas a sua equipe e os seus clientes, cruza percepção, comportamento e resultado, e chega à origem por trás dos sintomas, com clareza para decidir e direção para crescer.')}</p>
  <a class="cta" href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer">Quero descobrir a origem por trás dos sintomas →</a>
  <div class="fine">Os quatro pilares como um sistema: da leitura ao direcionamento.</div>
</div></section>

<footer><div class="brand">Espansione</div><div class="tagline">Crescimento Integrado. Clareza para decidir, estrutura para crescer.</div></footer>
</body></html>`;
}
