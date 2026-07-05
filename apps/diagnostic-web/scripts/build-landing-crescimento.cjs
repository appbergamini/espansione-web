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
  .replace(/src="brand\//g, 'src="/crescimento/brand/')
  .replace(/src='brand\//g, "src='/crescimento/brand/");
const script = `
<script>
(function(){var els=document.querySelectorAll('[data-reveal]');
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(ents,o){ents.forEach(function(en){if(en.isIntersecting){en.target.style.transition='opacity .7s ease, transform .7s ease';en.target.style.opacity='1';en.target.style.transform='none';o.unobserve(en.target);}});},{threshold:0.1,rootMargin:'0px 0px -40px 0px'});els.forEach(function(e){io.observe(e);});}else{els.forEach(function(e){e.style.opacity='1';e.style.transform='none';});}
var p=document.getElementById('lp-progress'),nav=document.getElementById('lp-nav');
function onScroll(){var h=document.documentElement,sc=h.scrollTop||document.body.scrollTop,mx=h.scrollHeight-h.clientHeight;if(p)p.style.width=(mx>0?(sc/mx*100):0)+'%';if(nav){var on=sc>20;nav.style.background=on?'rgba(0,26,59,.92)':'transparent';nav.style.borderBottomColor=on?'rgba(255,255,255,.08)':'transparent';nav.style.boxShadow=on?'0 6px 24px rgba(0,0,0,.18)':'none';nav.style.backdropFilter=on?'blur(8px)':'none';}}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();})();
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
