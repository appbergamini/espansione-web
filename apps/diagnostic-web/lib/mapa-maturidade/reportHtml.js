// =====================================================================
// Mapa da Maturidade — relatório editorial de conversão (HTML data-driven).
// Alinhado a landing (/crescimento): Poppins + navy #001A3B + vermelho #C72638, e o
// popula com o resultado real + a narrativa da IA (reportVendedor). Serve
// tanto a rota web quanto a geração de PDF (chromium renderiza este HTML).
// =====================================================================
import { CATALOGO_MATURIDADE } from './catalog.generated.js';

// escapa texto da IA/dados para não quebrar o layout
function esc(s) {
  return String(s == null ? '' : s)
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

function trackSvg(score) {
  const x = Math.max(8, Math.min(792, Math.round((score / 100) * 800)));
  return `<svg viewBox="0 0 800 74" role="img" aria-label="Nível de maturidade: ${score}%">
      <g font-family="Poppins, sans-serif" font-size="12" fill="#7E89A4">
        <rect x="0" y="30" width="196" height="10" rx="5" fill="#2C3A57"/>
        <rect x="204" y="30" width="196" height="10" rx="5" fill="#33507A"/>
        <rect x="408" y="30" width="196" height="10" rx="5" fill="#2C3A57"/>
        <rect x="612" y="30" width="188" height="10" rx="5" fill="#2C3A57"/>
        <text x="0" y="60">Nível 1</text><text x="204" y="60">Nível 2</text>
        <text x="408" y="60">Nível 3</text><text x="612" y="60">Nível 4</text>
      </g>
      <g><line x1="${x}" y1="16" x2="${x}" y2="52" stroke="#F19AA5" stroke-width="2"/>
        <circle cx="${x}" cy="35" r="8" fill="#F19AA5" stroke="#001A3B" stroke-width="2.5"/>
        <text x="${x}" y="12" text-anchor="middle" font-family="Poppins, sans-serif" font-size="12" fill="#F19AA5">você</text></g>
    </svg>`;
}

export function buildRelatorioMaturidadeHtml({ cliente, dataLabel, result, narrativa = {} }) {
  const score = result.general_score == null ? 0 : Math.round(result.general_score);
  const alertsByNome = {};
  for (const s of narrativa.sistemas || []) if (s && s.sistema) alertsByNome[s.sistema] = s;

  const sistemasHtml = (result.sistemas || []).map((s) => {
    const nota = s.nota == null ? 0 : Math.round(s.nota);
    const cor = COR_NIVEL[s.nivel] || 'var(--brass)';
    const n = alertsByNome[s.sistema] || {};
    const alerta = n.alert
      ? (n.is_alerta ? `<b>Sinal de alerta:</b> ${emphasize(n.alert)}` : emphasize(n.alert))
      : esc(s.leitura || '');
    return `<div class="sys">
      <div class="sys-top"><span class="sys-name">${esc(s.sistema)}</span><span class="sys-meta"><b>${nota}%</b> · Nível ${s.nivel || '—'} · ${esc((s.nivel_nome || '').toLowerCase())}</span></div>
      <div class="bar"><i style="width:${nota}%;background:${cor};"></i></div>
      <p class="sys-alert">${alerta}</p>
    </div>`;
  }).join('\n');

  const criticosHtml = (narrativa.criticos || []).slice(0, 3).map((c) => `<div class="exp">
      <span class="tag">${esc(c.tag)}</span>
      <h3>${esc(c.headline)}</h3>
      <p class="cost"><b>O que costuma custar:</b> ${emphasize(c.cost)}</p>
    </div>`).join('\n');

  const selecionados = new Set(result.atributos_marca || []);
  const chipsHtml = atributosPossiveis().map((a) =>
    `<span class="chip ${selecionados.has(a) ? 'on' : 'off'}">${esc(a)}</span>`).join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mapa da Maturidade${cliente ? ' — ' + esc(cliente) : ''}</title>
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
  .hero .eyebrow{color:#F19AA5;} .hero .top{display:flex;justify-content:space-between;align-items:baseline;gap:16px;flex-wrap:wrap;}
  .hero .co{font-family:'Poppins',sans-serif;font-size:15px;color:#AEB8CE;font-weight:500;}
  .verdict{font-size:clamp(27px,4.6vw,40px);color:#fff;margin:22px 0 6px;max-width:18ch;}
  .verdict em{font-style:italic;color:#F19AA5;} .subverdict{color:#AEB8CE;max-width:54ch;margin-bottom:30px;}
  .score-row{display:flex;align-items:flex-end;gap:22px;flex-wrap:wrap;}
  .score-big{font-family:'Poppins',sans-serif;font-size:52px;font-weight:600;color:#fff;line-height:.9;} .score-big span{font-size:22px;color:#8E9AB6;}
  .score-lvl{padding-bottom:6px;} .score-lvl .n{font-family:'Poppins',sans-serif;font-size:21px;color:#fff;}
  .score-lvl .t{font-family:'Poppins',sans-serif;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#8E9AB6;}
  .track{margin-top:26px;} .track svg{width:100%;height:auto;display:block;}
  section{padding:44px 0;} .sec-head{display:flex;align-items:baseline;gap:14px;margin-top:26px;margin-bottom:26px;}
  .sec-head .num{font-family:'Poppins',sans-serif;font-size:12px;color:var(--brass);padding-top:4px;} .sec-head h2{font-size:clamp(21px,3vw,27px);}
  .lead{font-size:18px;color:var(--muted);max-width:60ch;} .divider{height:1px;background:var(--line);border:0;margin:0;}
  .sys{padding:18px 0;border-bottom:1px solid var(--line);} .sys:first-child{border-top:1px solid var(--line);}
  .sys-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px;} .sys-name{font-family:'Poppins',sans-serif;font-size:19px;font-weight:600;}
  .sys-meta{font-family:'Poppins',sans-serif;font-size:12px;color:var(--muted);letter-spacing:.04em;} .sys-meta b{color:var(--text);}
  .bar{position:relative;height:9px;border-radius:6px;background:#E7E2D8;margin:12px 0 10px;overflow:hidden;} .bar>i{position:absolute;left:0;top:0;bottom:0;border-radius:6px;display:block;}
  .sys-alert{font-size:14.5px;color:var(--muted);} .sys-alert b{color:var(--clay);font-weight:600;}
  .exp{border:1px solid var(--line);border-left:3px solid var(--clay);border-radius:var(--r);background:var(--paper-2);padding:22px 24px;margin-bottom:16px;}
  .exp .tag{font-family:'Poppins',sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--clay);font-weight:500;} .exp h3{font-size:20px;margin:8px 0 8px;}
  .exp .cost{font-size:15px;color:var(--muted);} .exp .cost b{color:var(--text);font-weight:600;}
  .pattern{background:var(--ink);color:#EEF1F7;border-radius:20px;padding:40px;} .pattern .eyebrow{color:#F19AA5;}
  .pattern p{font-family:'Poppins',sans-serif;font-size:clamp(20px,2.8vw,25px);line-height:1.42;color:#F3F1EA;margin:16px 0 0;} .pattern p em{color:#F19AA5;font-style:italic;}
  .chips{display:flex;flex-wrap:wrap;gap:9px;margin:6px 0 20px;}
  .chip{font-family:'Poppins',sans-serif;font-size:13px;padding:7px 13px;border-radius:999px;border:1px solid var(--line);background:var(--paper-2);color:var(--text);}
  .chip.on{background:var(--ink);color:#fff;border-color:var(--ink);} .chip.off{color:var(--faint);border-style:dashed;}
  .attr-q{font-family:'Poppins',sans-serif;font-size:20px;line-height:1.4;color:var(--text);max-width:54ch;}
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
  @media print{body{background:#fff;} .pdf-btn{display:none;} .exp,.sys,.pattern,.next,.attr-q,.gap-q{break-inside:avoid;} section{padding:34px 0;}}
</style></head><body>
<button class="pdf-btn" onclick="baixarPdf()">⬇ Baixar PDF</button>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<script>
function baixarPdf(){
  var btn=document.querySelector('.pdf-btn');
  if(!window.html2pdf){ window.print(); return; }
  var orig=btn?btn.innerHTML:''; if(btn){ btn.innerHTML='Gerando PDF…'; btn.disabled=true; }
  var ready=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
  ready.then(function(){
    return html2pdf().set({
      margin:[8,6,10,6], filename:'mapa-da-maturidade.pdf',
      image:{type:'jpeg',quality:0.95},
      html2canvas:{scale:2,useCORS:true,backgroundColor:'#ffffff',
        ignoreElements:function(el){return el.classList&&el.classList.contains('pdf-btn');}},
      jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},
      pagebreak:{mode:['css','legacy']}
    }).from(document.body).save();
  }).then(function(){ if(btn){ btn.innerHTML=orig; btn.disabled=false; } })
   .catch(function(){ if(btn){ btn.innerHTML=orig; btn.disabled=false; } window.print(); });
}
if(new URLSearchParams(location.search).get('print')==='1'){window.addEventListener('load',function(){setTimeout(baixarPdf,900);});}
</script>

<header class="hero"><div class="wrap">
  <div class="top"><span class="eyebrow">Mapa da Maturidade</span><span class="co">${esc(cliente || 'Empresa')}${dataLabel ? ' · ' + esc(dataLabel) : ''}</span></div>
  <h1 class="verdict">${emphasize(narrativa.verdict || 'O retrato da sua empresa hoje.')}</h1>
  <p class="subverdict">${esc(narrativa.subverdict || 'Você respondeu 40 perguntas sobre a sua empresa. Abaixo, o que elas revelam.')}</p>
  <div class="score-row"><div class="score-big">${score}<span>%</span></div>
    <div class="score-lvl"><div class="n">Nível ${result.general_nivel || '—'}</div><div class="t">${esc(result.general_level || '')}</div></div></div>
  <div class="track">${trackSvg(score)}</div>
</div></header>

<section class="wrap">
  <div class="sec-head"><span class="num">01</span><h2>Onde a empresa está, sistema a sistema</h2></div>
  ${sistemasHtml}
</section>

<hr class="divider">

<section class="wrap">
  <div class="sec-head"><span class="num">02</span><h2>Os sinais mais críticos</h2></div>
  <p class="lead" style="margin-bottom:26px;">Não são os únicos — são os que mais pesam hoje. Ao lado de cada um, o que ele costuma custar.</p>
  ${criticosHtml}
</section>

${narrativa.pattern ? `<section class="wrap"><div class="pattern"><span class="eyebrow">O padrão por trás</span><p>${emphasize(narrativa.pattern)}</p></div></section>` : ''}

${chipsHtml ? `<section class="wrap">
  <div class="sec-head"><span class="num">03</span><h2>Como o mercado enxerga a empresa hoje</h2></div>
  <p class="lead" style="margin-bottom:18px;">Os atributos que costumam ser associados à empresa — e os que ficaram de fora.</p>
  <div class="chips">${chipsHtml}</div>
  ${narrativa.atributos_pergunta ? `<p class="attr-q">${emphasize(narrativa.atributos_pergunta)}</p>` : ''}
</section>` : ''}

<hr class="divider">

<section class="wrap">
  <p class="gap-q">Você já sabe onde dói. O que este diagnóstico não responde — <em>de propósito</em> — é por quê.</p>
  <p class="gap-sub">Essa é a diferença entre apagar incêndio e resolver a origem.</p>
</section>

<section class="wrap"><div class="next">
  <span class="eyebrow">O próximo passo</span>
  <h2>Mapa da Identidade Estratégica</h2>
  <p class="hook">${esc(narrativa.cta_hook || 'Este retrato é só o seu olhar. O Mapa da Identidade coloca lado a lado como você, a sua equipe e os seus clientes respondem às mesmas perguntas — e é na distância entre esses três olhares que a causa aparece.')}</p>
  <a class="cta" href="/api/checkout/infinitepay?produto=identidade">Fazer o Mapa de Identidade Estratégica →</a>
  <div class="fine">Os 3 olhares — você, equipe e clientes — e a distância entre eles</div>
</div></section>

<footer><div class="brand">Espansione</div><div class="tagline">Da estratégia que morre na gaveta para a marca que opera</div></footer>
</body></html>`;
}
