// Extrai a landing page do Mapa do Crescimento Integrado a partir do export
// do design tool (data/landing/crescimento.dc.html) e emite a página estática
// self-contained em public/crescimento/index.html — sem o runtime do editor
// (support.js), com os CTAs apontando pro funil /mapa e assets em /crescimento/brand.
// Reexecutar após atualizar o .dc.html:  node scripts/build-landing-crescimento.cjs
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, '..', 'data', 'landing', 'crescimento.dc.html');
const OUTDIR = path.join(__dirname, '..', 'public', 'crescimento');
const raw = fs.readFileSync(SRC, 'utf8');
const helmet = (raw.match(/<helmet>([\s\S]*?)<\/helmet>/) || [])[1] || '';
let body = (raw.split('</helmet>')[1] || '').split(/<script[^>]*data-dc-script/)[0].split('</x-dc>')[0];
body = body.replace(/<script[^>]*support\.js[^>]*><\/script>/g, '')
  .replace(/href="#mapa"/g, 'href="/mapa"')
  // CTA primário que veio do design apontando pro topo (#top) → funil /mapa.
  // (Sem isto, o botão "Fazer meu mapa agora" só rola a página pro topo.)
  .replace(/href="#top"(\s+data-cta-primary)/g, 'href="/mapa"$1')
  .replace(/src="brand\//g, 'src="/crescimento/brand/')
  .replace(/src='brand\//g, "src='/crescimento/brand/");

// CTA de compra (Mapa de Identidade, pago) — injetado no container de botões da
// seção final (âncora única). Estilo outline p/ distinguir do CTA vermelho (grátis).
const btnCompra = `<a href="/api/checkout/infinitepay?produto=identidade" style="display:inline-flex;align-items:center;gap:10px;background:transparent;color:#fff;font-family:'Poppins';font-weight:600;font-size:18px;padding:18px 34px;border-radius:15px;border:1.5px solid rgba(255,255,255,.55);text-decoration:none;transition:background .2s,border-color .2s;">Comprar o Mapa de Identidade <span style="font-size:20px;">&#8594;</span></a>`;
const anchorBtns = '<div data-reveal data-delay="160" style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-bottom:22px;">';
if (body.includes(anchorBtns)) {
  body = body.replace(anchorBtns, anchorBtns + btnCompra);
} else {
  console.warn('[landing] âncora do CTA de compra não encontrada — botão não injetado');
}
const script = `
<script>
(function(){var els=document.querySelectorAll('[data-reveal]');
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(ents,o){ents.forEach(function(en){if(en.isIntersecting){en.target.style.transition='opacity .7s ease, transform .7s ease';en.target.style.opacity='1';en.target.style.transform='none';o.unobserve(en.target);}});},{threshold:0.1,rootMargin:'0px 0px -40px 0px'});els.forEach(function(e){io.observe(e);});}else{els.forEach(function(e){e.style.opacity='1';e.style.transform='none';});}
var p=document.getElementById('lp-progress'),nav=document.getElementById('lp-nav');
function onScroll(){var h=document.documentElement,sc=h.scrollTop||document.body.scrollTop,mx=h.scrollHeight-h.clientHeight;if(p)p.style.width=(mx>0?(sc/mx*100):0)+'%';if(nav){var on=sc>20;nav.style.background=on?'rgba(0,26,59,.92)':'transparent';nav.style.borderBottomColor=on?'rgba(255,255,255,.08)':'transparent';nav.style.boxShadow=on?'0 6px 24px rgba(0,0,0,.18)':'none';nav.style.backdropFilter=on?'blur(8px)':'none';}}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
var burger=document.getElementById('lp-burger'),mobile=document.getElementById('lp-mobile');
if(burger&&mobile){burger.addEventListener('click',function(){mobile.style.display=(mobile.style.display==='flex')?'none':'flex';});Array.prototype.forEach.call(mobile.querySelectorAll('a'),function(a){a.addEventListener('click',function(){mobile.style.display='none';});});}
})();
</script>`;
const html = `<!DOCTYPE html>
<html lang="pt-BR"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Mapa do Crescimento Integrado — diagnóstico gratuito da Espansione. Descubra em 10 minutos se a sua empresa está pronta para sustentar o crescimento nos 4 sistemas: Marca, Negócios, Comunicação e Pessoas.">
<title>Mapa do Crescimento Integrado · Espansione</title>
${helmet.trim()}
</head><body>
${body.trim()}
${script}
</body></html>`;
fs.mkdirSync(OUTDIR, { recursive: true });
fs.writeFileSync(path.join(OUTDIR, 'index.html'), html, 'utf8');
console.log('OK → public/crescimento/index.html', html.length, 'bytes ·', (html.match(/href="\/mapa"/g)||[]).length, 'CTAs → /mapa');
