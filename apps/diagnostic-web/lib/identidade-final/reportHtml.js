// =====================================================================
// Mapa de Identidade — relatório editorial de TRIANGULAÇÃO (HTML data-driven).
// Mesmo design system da Maturidade (Fraunces + IBM Plex). Cruza os 3 olhares
// (Você/Equipe/Clientes) pelos mesmos indicadores. Serve página web e PDF.
// =====================================================================
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function emphasize(s) {
  return esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

const PUB = [
  { key: 'socios', nome: 'Você', cor: '#16233F' },
  { key: 'colaboradores', nome: 'Equipe', cor: '#B8894B' },
  { key: 'clientes', nome: 'Clientes', cor: '#3E6B5E' },
];

function bar3(porPublico) {
  return PUB.map((p) => {
    const v = porPublico[p.key];
    if (v == null) return '';
    const n = Math.round(v);
    return `<div class="b3"><span class="b3-lbl">${p.nome}</span><span class="b3-track"><i style="width:${n}%;background:${p.cor};"></i></span><span class="b3-val">${n}%</span></div>`;
  }).join('');
}

export function buildRelatorioIdentidadeHtml({ cliente, dataLabel, result, narrativa = {}, proposito }) {
  const porPub = result.porPublico || {};
  const tri = (result.triangulacao || []).filter((t) => t.gap != null);
  const topOlhares = tri.slice(0, 6);
  const topDiverg = tri.slice(0, 3);
  const divNarr = narrativa.divergencias || [];

  const olharesHtml = topOlhares.map((t) => `<div class="tri">
      <div class="tri-name">${esc(t.indicador)}</div>
      ${bar3(t.porPublico)}
    </div>`).join('\n');

  const divergHtml = topDiverg.map((t, i) => {
    const n = divNarr[i] || {};
    const soc = t.porPublico.socios, cli = t.porPublico.clientes, eq = t.porPublico.colaboradores;
    const par = cli != null ? `Você ${Math.round(soc)}% × Cliente ${Math.round(cli)}%` : `Você ${Math.round(soc)}% × Equipe ${Math.round(eq)}%`;
    return `<div class="exp">
      <span class="tag">${esc(par)}</span>
      <h3>${esc(n.headline || t.indicador)}</h3>
      <p class="cost">${emphasize(n.texto || '')}</p>
    </div>`;
  }).join('\n');

  const caminhoHtml = (narrativa.caminho || []).slice(0, 3).map((c, i) => `<div class="step">
      <span class="step-n">${i + 1}</span>
      <div><h3>${esc(c.headline)}</h3><p>${emphasize(c.texto)}</p></div>
    </div>`).join('\n');

  const geralBoxes = PUB.map((p) => `<div class="gbox"><div class="gnum" style="color:${p.cor === '#16233F' ? '#fff' : p.cor}">${porPub[p.key]?.geral != null ? Math.round(porPub[p.key].geral) : '—'}</div><div class="glbl">${p.nome}</div></div>`).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mapa de Identidade Estratégica${cliente ? ' — ' + esc(cliente) : ''}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{--ink:#16233F;--paper:#F6F4EF;--paper-2:#FBFAF6;--line:#E3DFD5;--brass:#B8894B;--brass-deep:#9A6E38;--clay:#B0413E;--sage:#3E6B5E;--text:#26241F;--muted:#6E6A61;--faint:#9A958A;--r:14px;}
  *{box-sizing:border-box;} html{-webkit-text-size-adjust:100%;}
  body{margin:0;background:var(--paper);color:var(--text);font-family:"IBM Plex Sans",system-ui,sans-serif;font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;}
  .wrap{max-width:820px;margin:0 auto;padding:0 26px;}
  .eyebrow{font-family:"IBM Plex Mono",monospace;font-size:11.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--brass);font-weight:500;}
  h1,h2,h3{font-family:"Fraunces",Georgia,serif;font-weight:600;line-height:1.12;letter-spacing:-.01em;margin:0;} p{margin:0 0 1em;}
  .hero{background:var(--ink);color:#EEF1F7;padding:52px 0 44px;} .hero .eyebrow{color:#C69A5E;} .hero .top{display:flex;justify-content:space-between;align-items:baseline;gap:16px;flex-wrap:wrap;}
  .hero .co{font-family:"Fraunces",serif;font-size:15px;color:#AEB8CE;font-weight:500;}
  .verdict{font-size:clamp(26px,4.4vw,38px);color:#fff;margin:22px 0 8px;max-width:20ch;} .verdict em{font-style:italic;color:#D9B983;} .subverdict{color:#AEB8CE;max-width:56ch;margin-bottom:28px;}
  .grow{display:flex;gap:14px;flex-wrap:wrap;} .gbox{flex:1;min-width:120px;border:1px solid #2C3A57;border-radius:12px;padding:14px 16px;text-align:center;background:#1B2A47;}
  .gnum{font-family:"IBM Plex Mono",monospace;font-size:34px;font-weight:600;line-height:1;} .glbl{font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#8E9AB6;margin-top:6px;}
  section{padding:44px 0;} .sec-head{display:flex;align-items:baseline;gap:14px;margin-bottom:14px;} .sec-head .num{font-family:"IBM Plex Mono",monospace;font-size:12px;color:var(--brass);padding-top:4px;} .sec-head h2{font-size:clamp(21px,3vw,27px);}
  .lead{font-size:17px;color:var(--muted);max-width:62ch;} .divider{height:1px;background:var(--line);border:0;margin:0;}
  .legend{font-family:"IBM Plex Mono",monospace;font-size:11.5px;color:var(--muted);margin:6px 0 22px;letter-spacing:.03em;}
  .tri{padding:14px 0;border-bottom:1px solid var(--line);} .tri:first-child{border-top:1px solid var(--line);}
  .tri-name{font-family:"Fraunces",serif;font-size:17px;font-weight:600;margin-bottom:8px;}
  .b3{display:flex;align-items:center;gap:10px;margin:5px 0;} .b3-lbl{font-family:"IBM Plex Mono",monospace;font-size:11px;color:var(--muted);width:56px;flex:0 0 56px;text-transform:uppercase;letter-spacing:.08em;}
  .b3-track{position:relative;flex:1;height:8px;border-radius:5px;background:#E7E2D8;overflow:hidden;} .b3-track>i{position:absolute;left:0;top:0;bottom:0;border-radius:5px;display:block;}
  .b3-val{font-family:"IBM Plex Mono",monospace;font-size:12px;color:var(--text);width:40px;text-align:right;}
  .read{font-size:14.5px;color:var(--muted);margin-top:16px;font-style:italic;}
  .exp{border:1px solid var(--line);border-left:3px solid var(--clay);border-radius:var(--r);background:var(--paper-2);padding:22px 24px;margin-bottom:16px;}
  .exp .tag{font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--clay);font-weight:500;} .exp h3{font-size:20px;margin:8px 0 8px;} .exp .cost{font-size:15px;color:var(--muted);} .exp .cost em{font-style:normal;color:var(--text);font-weight:600;}
  .pattern{background:var(--ink);color:#EEF1F7;border-radius:20px;padding:40px;} .pattern .eyebrow{color:#C69A5E;} .pattern p{font-family:"Fraunces",serif;font-size:clamp(20px,2.8vw,25px);line-height:1.42;color:#F3F1EA;margin:16px 0 0;} .pattern p em{color:#D9B983;font-style:italic;}
  .voz{border:1px solid var(--line);border-radius:var(--r);background:var(--paper-2);padding:24px 26px;} .voz .q{font-family:"Fraunces",serif;font-size:19px;line-height:1.45;color:var(--text);border-left:3px solid var(--brass);padding-left:16px;margin:0 0 14px;} .voz .lbl{font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--brass);margin-bottom:10px;}
  .prontidao{font-size:16px;color:var(--muted);max-width:62ch;}
  .step{display:flex;gap:16px;padding:16px 0;border-bottom:1px solid var(--line);} .step:first-child{border-top:1px solid var(--line);}
  .step-n{font-family:"IBM Plex Mono",monospace;font-size:14px;font-weight:600;color:#fff;background:var(--brass);width:30px;height:30px;flex:0 0 30px;border-radius:50%;display:flex;align-items:center;justify-content:center;}
  .step h3{font-size:18px;margin:2px 0 5px;} .step p{font-size:14.5px;color:var(--muted);margin:0;}
  .next{background:linear-gradient(180deg,#1B2A47,#141F36);color:#EEF1F7;border-radius:22px;padding:46px 44px;text-align:center;} .next .eyebrow{color:#C69A5E;}
  .next h2{color:#fff;font-size:clamp(24px,3.4vw,32px);margin:14px auto 0;max-width:22ch;} .next .hook{color:#B7C0D6;max-width:56ch;margin:20px auto 30px;font-size:17px;}
  .cta{display:inline-block;background:var(--brass);color:#1a1204;text-decoration:none;font-weight:600;font-size:16px;padding:15px 30px;border-radius:12px;} .next .fine{color:#7E89A4;font-family:"IBM Plex Mono",monospace;font-size:11.5px;letter-spacing:.08em;margin-top:18px;}
  footer{padding:40px 0 60px;text-align:center;} .brand{font-family:"Fraunces",serif;font-size:20px;letter-spacing:.04em;color:var(--ink);} .tagline{font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);margin-top:8px;}
  @media (max-width:560px){.pattern,.next{padding:30px 24px;}.exp{padding:20px;}}
  .pdf-btn{position:fixed;bottom:20px;right:20px;z-index:99;background:var(--brass);color:#1a1204;border:0;border-radius:10px;padding:12px 18px;font:600 14px "IBM Plex Sans",sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.28);}
  .pdf-btn:hover{background:#C99B57;}
  @media print{body{background:#fff;} .pdf-btn{display:none;} .exp,.tri,.pattern,.next,.voz,.step{break-inside:avoid;} section{padding:32px 0;}}
</style></head><body>
<button class="pdf-btn" onclick="window.print()">⬇ Baixar PDF</button>
<script>if(new URLSearchParams(location.search).get('print')==='1'){window.addEventListener('load',function(){setTimeout(function(){window.print();},700);});}</script>

<header class="hero"><div class="wrap">
  <div class="top"><span class="eyebrow">Mapa de Identidade Estratégica</span><span class="co">${esc(cliente || 'Empresa')}${dataLabel ? ' · ' + esc(dataLabel) : ''}</span></div>
  <h1 class="verdict">${emphasize(narrativa.verdict || 'Os três olhares sobre a sua marca, lado a lado.')}</h1>
  <p class="subverdict">${esc(narrativa.subverdict || 'Você, a sua equipe e os seus clientes responderam às mesmas perguntas. Este é o retrato que os três olhares formam juntos — e a causa que só aparece na distância entre eles.')}</p>
  <div class="grow">${geralBoxes}</div>
</div></header>

<section class="wrap">
  <div class="sec-head"><span class="num">01</span><h2>Os três olhares, lado a lado</h2></div>
  <p class="legend">▮ Você (sócios) &nbsp; ▮ Equipe &nbsp; ▮ Clientes &nbsp;·&nbsp; alguns indicadores internos comparam só você × equipe</p>
  ${olharesHtml}
  ${narrativa.olhares_leitura ? `<p class="read">${emphasize(narrativa.olhares_leitura)}</p>` : ''}
</section>

<hr class="divider">

<section class="wrap">
  <div class="sec-head"><span class="num">02</span><h2>Onde os olhares divergem — os pontos de escolha</h2></div>
  ${divergHtml}
</section>

${narrativa.causa_raiz ? `<section class="wrap"><div class="pattern"><span class="eyebrow">A causa-raiz</span><p>${emphasize(narrativa.causa_raiz)}</p></div></section>` : ''}

${proposito || narrativa.voz_de_dentro ? `<section class="wrap">
  <div class="sec-head"><span class="num">03</span><h2>A voz de dentro</h2></div>
  <div class="voz">
    ${proposito ? `<div class="lbl">Propósito declarado pelos sócios</div><p class="q">${esc(proposito)}</p>` : ''}
    ${narrativa.voz_de_dentro ? `<p style="margin:0;color:var(--muted);font-size:15px;">${emphasize(narrativa.voz_de_dentro)}</p>` : ''}
  </div>
</section>` : ''}

${narrativa.prontidao ? `<section class="wrap">
  <div class="sec-head"><span class="num">04</span><h2>Prontidão de execução</h2></div>
  <p class="prontidao">${emphasize(narrativa.prontidao)}</p>
</section>` : ''}

<section class="wrap">
  <div class="sec-head"><span class="num">05</span><h2>O caminho, na ordem que destrava</h2></div>
  ${caminhoHtml}
</section>

<section class="wrap"><div class="next">
  <span class="eyebrow">O próximo passo</span>
  <h2>O mapa mostrou o quê, o porquê e por onde começar.</h2>
  <p class="hook">${esc(narrativa.cta_hook || 'A partir daqui, a Espansione conduz a tradução — descer o rumo, alinhar a entrega e traduzir o diferencial numa marca que opera.')}</p>
  <a class="cta" href="#">Agendar a conversa de devolutiva</a>
  <div class="fine">sobre o seu diagnóstico · com a Espansione</div>
</div></section>

<footer><div class="brand">Espansione</div><div class="tagline">Da estratégia que morre na gaveta para a marca que opera</div></footer>
</body></html>`;
}
