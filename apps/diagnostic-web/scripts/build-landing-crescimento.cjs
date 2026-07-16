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

// Botão flutuante de WhatsApp (FAB) — fixo no canto inferior direito, em toda a
// rolagem. Self-contained: logo em SVG inline (sem request externo). Verde oficial
// #25D366 pra destacar sem brigar com a paleta navy/vermelho da marca.
const waNumero = '5511985775893';
const waMsg = encodeURIComponent('Olá! Vim pela página do Mapa do Crescimento Integrado e quero saber mais.');
const whatsappFab = `
<style>#wa-fab{position:fixed;right:20px;bottom:20px;z-index:9999;display:inline-flex;align-items:center;justify-content:center;width:60px;height:60px;border-radius:50%;background:#25D366;box-shadow:0 6px 20px rgba(0,0,0,.28);transition:transform .2s ease,box-shadow .2s ease;}#wa-fab:hover{transform:scale(1.08);box-shadow:0 8px 26px rgba(0,0,0,.34);}#wa-fab svg{width:34px;height:34px;}@media(max-width:600px){#wa-fab{width:54px;height:54px;right:16px;bottom:16px;}#wa-fab svg{width:30px;height:30px;}}</style>
<a id="wa-fab" href="https://wa.me/${waNumero}?text=${waMsg}" target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp">
<svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.892c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.71 1.454h.006c6.585 0 11.946-5.359 11.949-11.945a11.821 11.821 0 00-3.494-8.411"/></svg>
</a>`;
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
<link rel="icon" type="image/png" sizes="32x32" href="/crescimento/brand/espansione-favicon-32.png">
<link rel="icon" type="image/png" sizes="256x256" href="/crescimento/brand/espansione-favicon-256.png">
<link rel="apple-touch-icon" sizes="180x180" href="/crescimento/brand/espansione-favicon-180.png">
${helmet.trim()}
</head><body>
${body.trim()}
${whatsappFab}
${script}
</body></html>`;
fs.mkdirSync(OUTDIR, { recursive: true });
fs.writeFileSync(path.join(OUTDIR, 'index.html'), html, 'utf8');
console.log('OK → public/crescimento/index.html', html.length, 'bytes ·', (html.match(/href="\/mapa"/g)||[]).length, 'CTAs → /mapa');
