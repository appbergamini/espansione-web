// ═══════════════════════════════════════════════════════════════
// VERTHO ASSESSMENT v2.1 — Adaptado para Next.js + Supabase
// ═══════════════════════════════════════════════════════════════

const L=`<svg viewBox="0 0 40 40" fill="none"><path d="M20 4L6 36h8l6-16 6 16h8L20 4z" fill="#2DD4BF"/><circle cx="20" cy="2" r="2.5" fill="#2DD4BF"/></svg>`;
const DC={D:'#EF4444',I:'#FBBF24',S:'#22C55E',C:'#3B82F6'};
const DN={D:'Dominância',I:'Influência',S:'Estabilidade',C:'Conformidade'};

const RG=[
[{l:"Direcionador(a)",d:"D"},{l:"Cativante",d:"I"},{l:"Criterioso(a)",d:"C"},{l:"Constante",d:"S"}],
[{l:"Acolhedor(a)",d:"S"},{l:"Articulado(a)",d:"I"},{l:"Incisivo(a)",d:"D"},{l:"Minucioso(a)",d:"C"}],
[{l:"Racional",d:"C"},{l:"Animado(a)",d:"I"},{l:"Tolerante",d:"S"},{l:"Firme",d:"D"}],
[{l:"Motivador(a)",d:"I"},{l:"Metódico(a)",d:"C"},{l:"Realizador(a)",d:"D"},{l:"Resiliente",d:"S"}],
[{l:"Objetivo(a)",d:"D"},{l:"Adaptável",d:"I"},{l:"Equilibrado(a)",d:"S"},{l:"Rigoroso(a)",d:"C"}],
[{l:"Estruturado(a)",d:"C"},{l:"Sereno(a)",d:"S"},{l:"Proativo(a)",d:"D"},{l:"Vibrante",d:"I"}],
[{l:"Comunicativo(a)",d:"I"},{l:"Analítico(a)",d:"C"},{l:"Colaborativo(a)",d:"S"},{l:"Decidido(a)",d:"D"}],
[{l:"Destemido(a)",d:"D"},{l:"Cauteloso(a)",d:"C"},{l:"Envolvente",d:"I"},{l:"Perseverante",d:"S"}]
];

const FP=[
{a:"Prefiro agir rápido e resolver",fa:"D",b:"Prefiro envolver as pessoas antes de agir",fb:"I"},
{a:"Gosto de mudar o que não funciona",fa:"D",b:"Prefiro manter o que já está funcionando",fb:"S"},
{a:"Tomo decisões com o que tenho disponível",fa:"D",b:"Analiso todos os dados antes de decidir",fb:"C"},
{a:"Gosto de conhecer pessoas novas",fa:"I",b:"Prefiro aprofundar relações que já tenho",fb:"S"},
{a:"Improviso bem quando o plano muda",fa:"I",b:"Me sinto melhor com uma rotina definida",fb:"C"},
{a:"Priorizo o bem-estar da equipe",fa:"S",b:"Priorizo a qualidade da entrega",fb:"C"},
];

const RW=[10,6,3,1];
const PW=1;
const CC={"Ousadia":[.0027,.48532,.38013,-.132,-.193,.150,.126,.152,.112],"Comando":[.003,.976,-.139,-.151,-.137,.151,.130,.130,.137],"Objetividade":[.003,.547,-.154,-.169,.360,.120,.182,.136,.145],"Assertividade":[.003,.418,-.136,-.179,.446,.138,.141,.148,.122],"Persuasão":[.003,-.126,.947,-.133,-.142,.154,.144,.135,.114],"Extroversão":[.003,-.138,.965,-.150,-.122,.120,.153,.138,.143],"Entusiasmo":[.003,-.138,.984,-.154,-.148,.130,.131,.138,.145],"Sociabilidade":[.003,-.162,.467,.357,-.108,.120,.167,.136,.131],"Empatia":[.003,-.172,.433,.404,-.110,.132,.143,.141,.138],"Paciência":[.003,-.153,-.136,.981,-.151,.096,.178,.093,.174],"Persistência":[.003,.401,-.117,.440,-.176,.177,.115,.171,.085],"Planejamento":[.003,-.116,-.144,.404,.430,.128,.138,.120,.186],"Organização":[.003,.176,-.130,.222,.287,.112,.140,.109,.195],"Detalhismo":[.003,.345,-.143,-.135,.499,.171,.121,.151,.124],"Prudência":[.003,-.171,-.142,.399,.462,.137,.133,.150,.128],"Concentração":[.003,.383,-.142,-.142,.449,.135,.145,.142,.125]};

function calcScores(raw){
  const rD={D:0,I:0,S:0,C:0},rDA={D:0,I:0,S:0,C:0};
  raw.r1.forEach(g=>g.forEach((it,p)=>rD[it.d]+=RW[p]));
  raw.r2.forEach(g=>g.forEach((it,p)=>rDA[it.d]+=RW[p]));
  const pD={D:0,I:0,S:0,C:0},pDA={D:0,I:0,S:0,C:0};
  raw.p1.forEach(f=>pD[f]+=PW);
  raw.p2.forEach(f=>pDA[f]+=PW);
  const combD={},combDA={};
  const rSum=Object.values(rD).reduce((a,b)=>a+b,0);
  const pSum=Object.values(pD).reduce((a,b)=>a+b,0);
  const total=rSum+pSum;
  for(const f of 'DISC'){
    combD[f]=Math.round((rD[f]+pD[f])/total*200);
    combDA[f]=Math.round((rDA[f]+pDA[f])/(rSum+pSum)*200);
  }
  const fixSum=(obj)=>{const s=Object.values(obj).reduce((a,b)=>a+b,0);if(s!==200){const k=Object.keys(obj).sort((a,b)=>obj[b]-obj[a])[0];obj[k]+=200-s}};
  fixSum(combD);fixSum(combDA);
  const disc=combD,dA=combDA;
  const lead={Executivo:Math.round(disc.D/2),Motivador:Math.round(disc.I/2),Metódico:Math.round(disc.S/2),Sistemático:Math.round(disc.C/2)};
  const x=[1,disc.D,disc.I,disc.S,disc.C,dA.D,dA.I,dA.S,dA.C];
  const comp={};
  for(const[k,c]of Object.entries(CC)){let v=0;for(let i=0;i<c.length;i++)v+=c[i]*x[i];comp[k]=Math.round(Math.min(100,Math.max(0,v)))}
  const sorted=Object.entries(disc).sort((a,b)=>b[1]-a[1]);
  const profile=sorted.filter(([_,v])=>v>=50).map(([k])=>k).join('')||sorted[0][0];
  return{disc,dA,lead,comp,profile};
}

const FORMATS=[
  {id:'video_short',label:'Vídeo curto (≤5 min)',icon:'🎬'},
  {id:'video_long',label:'Vídeo longo (aula/palestra)',icon:'🎥'},
  {id:'text',label:'Texto / artigo',icon:'📄'},
  {id:'audio',label:'Áudio / podcast',icon:'🎧'},
  {id:'infographic',label:'Infográfico / visual',icon:'📊'},
  {id:'exercise',label:'Exercício prático / simulação',icon:'🎯'},
  {id:'mentor',label:'Conversa com mentor (chat IA)',icon:'🤖'},
  {id:'case',label:'Estudo de caso',icon:'📋'},
];

const G={
  ph:'onboard',ud:{name:'',email:'',gender:''},
  gi:0,it:[],pi:0,pairChoice:null,
  raw:{r1:[],p1:[],r2:[],p2:[]},
  sc:null,learnPrefs:{}
};
const shuf=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
const $=id=>document.getElementById(id);
const app=document.getElementById('app');

function pct(){
  let d=0;
  if(G.ph==='rank1')d=G.gi;
  else if(G.ph==='pair1_intro')d=8;
  else if(G.ph==='pair1')d=8+G.pi;
  else if(G.ph==='rank2_intro')d=14;
  else if(G.ph==='rank2')d=14+G.gi;
  else if(G.ph==='pair2_intro')d=22;
  else if(G.ph==='pair2')d=22+G.pi;
  else if(G.ph==='learnpref')d=28;
  else if(G.ph==='calc'||G.ph==='results')d=29;
  return(d/29)*100;
}
function prg(label){const p=pct();return`<div class="prg"><div class="prg-h"><span>${label}</span><span>${Math.round(p)}%</span></div><div class="prg-t"><div class="prg-f" style="width:${p}%"></div></div></div>`}

function R(){
  const fns={onboard:rOnb,welcome:rWel,rank1_intro:()=>rIntro(1,'rank'),rank1:rRank,pair1_intro:()=>rIntro(1,'pair'),pair1:rPair,rank2_intro:()=>rIntro(2,'rank'),rank2:rRank,pair2_intro:()=>rIntro(2,'pair'),pair2:rPair,learnpref:rLearnPref,calc:rCalc,results:rRes};
  (fns[G.ph]||rOnb)();
  window.scrollTo({top:0,behavior:'smooth'});
}

function rOnb(){
  app.innerHTML=`<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;padding:40px 0">
  <div class="onb-bg"></div>
  <div class="onb-a logo" style="position:relative;z-index:1">${L}<span style="font-size:28px">VERTHO</span></div>
  <p class="onb-b body" style="margin-top:10px;position:relative;z-index:1">Mapeamento de Perfil Comportamental</p>
  <div class="onb-c" style="display:flex;gap:8px;margin-top:28px;width:100%;max-width:320px;position:relative;z-index:1">
    ${[{i:'🧬',t:'Perfil DISC'},{i:'⚡',t:'Pares rápidos'},{i:'📊',t:'16 Competências'}].map(c=>`<div style="flex:1;background:var(--bg2);border:1px solid rgba(255,255,255,.04);border-radius:14px;padding:14px 6px;text-align:center"><div style="font-size:22px;margin-bottom:4px">${c.i}</div><div style="font-size:10px;font-weight:700;color:var(--off)">${c.t}</div></div>`).join('')}
  </div>
  <div class="onb-d" style="width:100%;max-width:320px;margin-top:24px;position:relative;z-index:1">
    <button class="btn btn-p" onclick="G.ph='welcome';R()">COMEÇAR</button>
    <p class="cap" style="margin-top:12px">~8 minutos • Sem respostas certas ou erradas</p>
  </div></div>`;
}

function rWel(){
  var urlEmail=new URLSearchParams(window.location.search).get('email')||'';
  if(urlEmail&&!G.ud.email){G.ud.email=urlEmail;G.ud.name=urlEmail.split('@')[0];G.ud.gender='';}
  app.innerHTML=`<div class="vi"><div class="sg" style="text-align:center;padding:12px 0"><div class="logo">${L}<span>VERTHO</span></div></div>
  <div class="sg gl"><p class="tag" style="margin-bottom:8px">Seus dados</p>
  <input class="fi" id="fn" placeholder="Nome completo" value="${G.ud.name}">
  <input class="fi" id="fe" placeholder="E-mail" type="email" value="${G.ud.email}">
  <select class="fi" id="fg"><option value="">Gênero</option><option value="m"${G.ud.gender==='m'?' selected':''}>Masculino</option><option value="f"${G.ud.gender==='f'?' selected':''}>Feminino</option><option value="o"${G.ud.gender==='o'?' selected':''}>Outro</option></select></div>
  <div class="sg gl gl-g"><p class="body"><strong style="color:var(--white)">2 etapas:</strong> como você é (natural) e como esperam que você seja (adaptado). Cada etapa tem <strong style="color:var(--white)">rankings + escolhas rápidas</strong>.</p></div>
  <div class="sg"><button class="btn btn-p" id="go">INICIAR MAPEAMENTO</button></div></div>`;
  const u=()=>{G.ud.name=$('fn').value;G.ud.email=$('fe').value;G.ud.gender=$('fg').value;$('go').disabled=!(G.ud.name&&G.ud.email)};
  ['fn','fe','fg'].forEach(id=>$(id).addEventListener('input',u));
  $('go').addEventListener('click',()=>{u();G.ph='rank1_intro';R()});u();
}

function rIntro(etapa,tipo){
  const isRank=tipo==='rank';
  const titles={1:{rank:'Perfil Natural',pair:'Escolhas Rápidas'},2:{rank:'Perfil Adaptado',pair:'Escolhas Rápidas'}};
  const descs={1:{rank:'Ordene 4 palavras do que <strong style="color:var(--white)">mais se parece com você</strong> ao que menos se parece.',pair:'Agora, <strong style="color:var(--white)">6 escolhas rápidas</strong> para refinar seu perfil. Escolha A ou B — qual te descreve melhor?'},2:{rank:'Mesmas palavras, mas agora ordene como <strong style="color:var(--white)">as pessoas esperam que você seja</strong>.',pair:'Novamente <strong style="color:var(--white)">6 escolhas rápidas</strong>, agora sob a ótica do que os outros esperam de você.'}};
  const tips={1:{rank:'Como você realmente é no dia a dia.',pair:'Vá com a primeira impressão — não pense demais.'},2:{rank:'Como seu ambiente espera que você se comporte.',pair:'Pense em como os outros gostariam que você agisse.'}};
  const next={1:{rank:()=>{G.gi=0;G.ph='rank1';G.it=shuf(RG[0]);R()},pair:()=>{G.pi=0;G.ph='pair1';R()}},2:{rank:()=>{G.gi=0;G.ph='rank2';G.it=shuf(RG[0]);R()},pair:()=>{G.pi=0;G.ph='pair2';R()}}};
  app.innerHTML=`<div class="vi">${prg(`Etapa ${etapa} — ${titles[etapa][tipo]}`)}
  <div class="sg" style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
    <div style="font-size:44px;font-weight:900;color:var(--teal);opacity:.12;font-family:var(--hd)">${etapa}</div>
    <div><p class="tag">Etapa ${etapa}/2 — ${isRank?'Rankings':'Pares'}</p><p class="h2">${titles[etapa][tipo]}</p></div>
  </div>
  <div class="sg gl"><p class="body">${descs[etapa][tipo]}</p>${isRank?`<p class="body" style="margin-top:6px"><strong style="color:var(--white)">8 grupos</strong> de 4 palavras.</p>`:`<p class="body" style="margin-top:6px"><strong style="color:var(--white)">6 pares</strong> — 1 clique cada.</p>`}</div>
  <div class="sg" style="background:rgba(252,211,77,.05);border:1px solid rgba(252,211,77,.08);border-radius:var(--rs);padding:10px 12px;font-size:11px;color:var(--gold)">💡 ${tips[etapa][tipo]}</div>
  <div class="sg"><button class="btn btn-p" style="margin-top:10px" id="go">COMEÇAR →</button></div></div>`;
  $('go').addEventListener('click',next[etapa][tipo]);
}

function rRank(){
  const etapa=G.ph==='rank1'?1:2;
  const it=G.it,gi=G.gi;
  const label=etapa===1?'Natural':'Adaptado';
  app.innerHTML=`<div class="vi">${prg(`${label} — Rankings`)}
  <div class="sg"><p class="tag">${label}</p><p class="hd" style="margin:2px 0 6px">Grupo ${String(gi+1).padStart(2,'0')}</p></div>
  <div class="sg dots">${Array.from({length:8},(_,i)=>`<div class="dot ${i<gi?'done':i===gi?'now':''}"></div>`).join('')}</div>
  <div class="sg" style="text-align:center;font-size:12px;font-weight:800;color:var(--teal);letter-spacing:1px;margin-bottom:8px">👍 MAIS PARECIDO</div>
  ${it.map((x,i)=>`<div class="sg rc" data-i="${i}" draggable="true"><div class="rc-n">${i+1}</div><div class="rc-l">${x.l}</div><div style="display:flex;gap:3px"><button class="arr" data-a="u" data-i="${i}"${i===0?' disabled':''}>▲</button><button class="arr" data-a="d" data-i="${i}"${i===it.length-1?' disabled':''}>▼</button></div></div>`).join('')}
  <div class="sg" style="text-align:center;font-size:12px;font-weight:800;color:var(--muted);letter-spacing:1px;margin-top:4px;margin-bottom:8px">MENOS PARECIDO 👎</div>
  <div class="sg"><button class="btn btn-p" id="nx" style="margin-top:6px">${gi<7?'AVANÇAR':'PRÓXIMO →'}</button></div></div>`;
  document.querySelectorAll('.arr').forEach(b=>b.addEventListener('click',e=>{
    const i=+e.currentTarget.dataset.i,a=e.currentTarget.dataset.a;
    if(a==='u'&&i>0) mv(i,i-1);
    if(a==='d'&&i<it.length-1) mv(i,i+1);
  }));
  let di=null;document.querySelectorAll('.rc').forEach(c=>{
    c.addEventListener('dragstart',()=>{di=+c.dataset.i;c.classList.add('dragging')});
    c.addEventListener('dragend',()=>{di=null;document.querySelectorAll('.rc').forEach(x=>x.classList.remove('dragging'))});
    c.addEventListener('dragover',e=>e.preventDefault());
    c.addEventListener('drop',e=>{e.preventDefault();const t=+c.dataset.i;if(di!==null&&di!==t)mv(di,t)});
  });
  $('nx').addEventListener('click',advRank);
}
function anim(a,b){document.querySelectorAll('.rc').forEach(c=>{const i=+c.dataset.i;if(i===a||i===b){c.classList.add('swap');setTimeout(()=>c.classList.remove('swap'),250)}})}
function mv(f,t){
  const[x]=G.it.splice(f,1);G.it.splice(t,0,x);
  const cards=document.querySelectorAll('.rc');
  cards.forEach((c,idx)=>{
    c.dataset.i=idx;c.querySelector('.rc-n').textContent=idx+1;c.querySelector('.rc-l').textContent=G.it[idx].l;
    const btns=c.querySelectorAll('.arr');
    if(btns[0]){btns[0].dataset.i=idx;btns[0].disabled=idx===0;}
    if(btns[1]){btns[1].dataset.i=idx;btns[1].disabled=idx===G.it.length-1;}
  });
}
function advRank(){
  const etapa=G.ph==='rank1'?1:2;
  const key='r'+etapa;
  G.raw[key].push([...G.it]);
  if(G.gi<7){G.gi++;G.it=shuf(RG[G.gi]);R()}
  else{G.ph=etapa===1?'pair1_intro':'pair2_intro';R()}
}

function rPair(){
  const etapa=G.ph==='pair1'?1:2;
  const pair=FP[G.pi];
  const label=etapa===1?'Natural':'Adaptado';
  G.pairChoice=null;
  app.innerHTML=`<div class="vi">${prg(`${label} — Pares`)}
  <div class="sg"><p class="tag">${label} — Escolha rápida</p><p class="h2" style="margin-top:2px">Par ${G.pi+1}/6</p></div>
  <div class="sg dots">${Array.from({length:6},(_,i)=>`<div class="dot ${i<G.pi?'done':i===G.pi?'now':''}"></div>`).join('')}</div>
  <p class="sg body" style="margin-bottom:12px;text-align:center;font-weight:600;color:var(--off)">Qual te descreve melhor?</p>
  <div class="sg pair-card" id="pa" onclick="pick('a')"><p class="pair-text">${pair.a}</p></div>
  <div class="sg pair-or">OU</div>
  <div class="sg pair-card" id="pb" onclick="pick('b')"><p class="pair-text">${pair.b}</p></div>
  <div class="sg"><button class="btn btn-p" id="nx" style="margin-top:10px" disabled>AVANÇAR</button></div></div>`;
  $('nx').addEventListener('click',advPair);
}
function pick(choice){
  G.pairChoice=choice;
  $('pa').classList.toggle('selected',choice==='a');
  $('pb').classList.toggle('selected',choice==='b');
  $('nx').disabled=false;
}
window.pick=pick;

function advPair(){
  const etapa=G.ph==='pair1'?1:2;
  const pair=FP[G.pi];
  const winner=G.pairChoice==='a'?pair.fa:pair.fb;
  const key='p'+etapa;
  G.raw[key].push(winner);
  if(G.pi<5){G.pi++;R()}
  else{
    if(etapa===1){G.ph='rank2_intro';R()}
    else{G.ph='learnpref';R()}
  }
}

function rLearnPref(){
  const allRated=Object.keys(G.learnPrefs).length===FORMATS.length;
  app.innerHTML=`<div class="vi">${prg('Preferências de Aprendizagem')}
  <div class="sg"><p class="tag">Última etapa</p><p class="hd" style="margin-top:3px">Como você aprende melhor?</p><p class="body" style="margin-top:6px">Dê de 1 a 5 estrelas para cada formato:</p></div>
  ${FORMATS.map(f=>{
    const cur=G.learnPrefs[f.id]||0;
    return`<div class="sg star-row"><span class="star-icon">${f.icon}</span><span class="star-label">${f.label}</span><div class="stars">${[1,2,3,4,5].map(n=>`<button class="star${n<=cur?' on':''}" data-fid="${f.id}" data-n="${n}">★</button>`).join('')}</div></div>`;
  }).join('')}
  <div class="sg"><button class="btn btn-p" id="nx"${allRated?'':' disabled'}>VER MEU PERFIL →</button></div></div>`;
  document.querySelectorAll('.star').forEach(s=>s.addEventListener('click',e=>{
    const fid=e.currentTarget.dataset.fid,n=+e.currentTarget.dataset.n;
    G.learnPrefs[fid]=n;
    document.querySelectorAll('.star[data-fid="'+fid+'"]').forEach(function(s){s.classList.toggle('on',+s.dataset.n<=n)});
    var allR=Object.keys(G.learnPrefs).length===FORMATS.length;
    var nxBtn=$('nx');if(nxBtn)nxBtn.disabled=!allR;
  }));
  if($('nx'))$('nx').addEventListener('click',()=>{G.ph='calc';R();setTimeout(()=>{G.sc=calcScores(G.raw);saveToSupabase();G.ph='results';R()},600)});
}

function rCalc(){
  app.innerHTML=`<div style="min-height:60vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px"><div class="spinner"></div><p style="font-size:14px;font-weight:600">Calculando seu perfil...</p><p class="cap">Salvando resultados</p></div>`;
}

// ═══ SAVE TO SUPABASE via Next.js API ═══
function saveToSupabase(){
  const payload={
    userData:G.ud,
    scores:G.sc,
    learnPrefs:G.learnPrefs,
    rawRankings:{
      r1:G.raw.r1.map(g=>g.map(i=>({label:i.l,disc:i.d}))),
      r2:G.raw.r2.map(g=>g.map(i=>({label:i.l,disc:i.d}))),
      p1:G.raw.p1,p2:G.raw.p2
    }
  };
  fetch('/api/cis/salvar',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  })
  .then(r=>r.json())
  .then(d=>console.log('Salvo no Supabase:',d))
  .catch(e=>console.error('Erro ao salvar:',e));
}

// ═══ RESULTS ═══
function rRes(){
  const s=G.sc;
  function bar(n,v,c,m){return`<div class="br"><div class="br-h"><span class="br-n">${n}</span><span class="br-v" style="color:${c}">${v}</span></div><div class="br-t"><div class="br-f" style="width:${(v/m)*100}%;background:${c}"></div></div></div>`}
  const sorted=Object.entries(s.comp).sort((a,b)=>b[1]-a[1]);
  const top3=sorted.slice(0,3),gap3=sorted.slice(-3).reverse();
  const compG=[{t:'Dominância',c:DC.D,k:['Ousadia','Comando','Objetividade','Assertividade']},{t:'Influência',c:DC.I,k:['Persuasão','Extroversão','Entusiasmo','Sociabilidade']},{t:'Estabilidade',c:DC.S,k:['Empatia','Paciência','Persistência','Planejamento']},{t:'Conformidade',c:DC.C,k:['Organização','Detalhismo','Prudência','Concentração']}];

  app.innerHTML=`<div class="vi">
  <div class="sg" style="text-align:center;padding:16px 0 20px"><div class="logo" style="margin-bottom:12px">${L}<span>VERTHO</span></div>
  <p class="tag" style="margin-bottom:6px">Seu perfil comportamental</p>
  <div style="font-family:var(--hd);font-size:52px;font-weight:900;letter-spacing:5px;background:linear-gradient(135deg,var(--teal),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${s.profile}</div>
  <p class="cap" style="margin-top:4px">${G.ud.name}</p></div>

  <div class="sg gl"><p class="tag" style="margin-bottom:8px">DISC</p>
  <canvas id="rc" style="width:100%;max-width:240px;display:block;margin:0 auto"></canvas>
  <div style="display:flex;justify-content:center;gap:14px;margin-top:8px"><span style="font-size:10px;font-weight:700;color:var(--teal)">● Natural</span><span style="font-size:10px;font-weight:700;color:var(--coral)">● Adaptado</span></div></div>

  <div class="sg" style="display:flex;gap:6px">
    <div class="gl" style="flex:1;text-align:center;margin:0"><p style="font-size:9px;font-weight:800;color:var(--green);letter-spacing:1px">FORÇAS</p>${top3.map(([k,v])=>`<p style="font-size:11px;font-weight:700;margin-top:4px">${k} <span style="color:var(--green)">${v}</span></p>`).join('')}</div>
    <div class="gl" style="flex:1;text-align:center;margin:0"><p style="font-size:9px;font-weight:800;color:var(--coral);letter-spacing:1px">DESENVOLVIMENTO</p>${gap3.map(([k,v])=>`<p style="font-size:11px;font-weight:700;margin-top:4px">${k} <span style="color:var(--coral)">${v}</span></p>`).join('')}</div>
  </div>

  <div class="sg gl" style="margin-top:10px"><p class="tag" style="margin-bottom:8px">DISC Natural</p>${Object.entries(s.disc).map(([k,v])=>bar(DN[k],v,DC[k],100)).join('')}</div>
  <div class="sg gl"><p class="tag" style="color:var(--coral);margin-bottom:8px">DISC Adaptado</p>${Object.entries(s.dA).map(([k,v])=>bar(DN[k],v,DC[k],100)).join('')}</div>
  <div class="sg gl"><p class="tag" style="margin-bottom:8px">Liderança</p>${Object.entries(s.lead).map(([k,v])=>bar(k,v,'var(--teal)',50)).join('')}</div>
  ${compG.map(g=>`<div class="sg gl"><p class="tag" style="color:${g.c};margin-bottom:8px">Competências — ${g.t}</p>${g.k.map(k=>bar(k,s.comp[k],g.c,100)).join('')}</div>`).join('')}

  <div class="sg gl"><p class="tag" style="color:var(--gold);margin-bottom:10px">Preferências de Aprendizagem</p>
  ${FORMATS.sort((a,b)=>(G.learnPrefs[b.id]||0)-(G.learnPrefs[a.id]||0)).map(f=>{
    const stars=G.learnPrefs[f.id]||0;
    const cl=stars>=4?'var(--gold)':stars>=3?'var(--ml)':'var(--muted)';
    return`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:12px">${f.icon}</span><span style="flex:1;font-size:12px;font-weight:600">${f.label}</span><span style="font-size:12px;color:${cl};letter-spacing:1px">${'★'.repeat(stars)}${'☆'.repeat(5-stars)}</span></div>`;
  }).join('')}</div>

  <div class="sg" style="margin-top:14px"><button class="btn btn-p" id="genPdf" style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="font-size:18px">📄</span> BAIXAR RELATÓRIO PDF</button><p class="cap" style="margin-top:6px;text-align:center">Relatório completo personalizado</p></div>
  <div class="sg footer">Vertho © 2026 — Instrumento Proprietário v2.1</div></div>`;

  // Radar chart
  setTimeout(()=>{
    const cv=$('rc');if(!cv)return;
    const ctx=cv.getContext('2d'),dp=window.devicePixelRatio||1,sz=240;
    cv.width=sz*dp;cv.height=sz*dp;cv.style.width=sz+'px';cv.style.height=sz+'px';ctx.scale(dp,dp);
    const cx=sz/2,cy=sz/2,r=sz/2-30,ag=i=>-Math.PI/2+i*Math.PI/2;
    for(let ring=1;ring<=4;ring++){const rr=r*ring/4;ctx.beginPath();for(let i=0;i<=4;i++){const a=ag(i%4);ctx.lineTo(cx+rr*Math.cos(a),cy+rr*Math.sin(a))}ctx.closePath();ctx.strokeStyle='rgba(255,255,255,.06)';ctx.stroke()}
    'DISC'.split('').forEach((l,i)=>{const a=ag(i);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));ctx.strokeStyle='rgba(255,255,255,.04)';ctx.stroke();ctx.fillStyle='#64748B';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(l,cx+(r+14)*Math.cos(a),cy+(r+14)*Math.sin(a))});
    [{v:[s.disc.D,s.disc.I,s.disc.S,s.disc.C],c:'rgb(45,212,191)'},{v:[s.dA.D,s.dA.I,s.dA.S,s.dA.C],c:'rgb(251,113,133)'}].forEach(({v,c})=>{
      ctx.beginPath();v.forEach((val,i)=>{const a=ag(i),rr=r*val/100;i===0?ctx.moveTo(cx+rr*Math.cos(a),cy+rr*Math.sin(a)):ctx.lineTo(cx+rr*Math.cos(a),cy+rr*Math.sin(a))});ctx.closePath();
      ctx.fillStyle=c.replace(')',',0.1)').replace('rgb','rgba');ctx.fill();ctx.strokeStyle=c;ctx.lineWidth=2;ctx.stroke();
      v.forEach((val,i)=>{const a=ag(i),rr=r*val/100;ctx.beginPath();ctx.arc(cx+rr*Math.cos(a),cy+rr*Math.sin(a),3,0,Math.PI*2);ctx.fillStyle=c;ctx.fill()});
    });
  },100);

  // PDF button
  setTimeout(()=>{const btn=$('genPdf');if(btn)btn.addEventListener('click',()=>generateReport(s))},200);
}

// ═══ PDF REPORT ═══
const DISC_INTRO=`O DISC é um modelo de perfil comportamental criado pelo psicólogo William Moulton Marston na década de 1920. Ele descreve quatro estilos de comportamento que todas as pessoas apresentam em diferentes graus.\n\nD — Dominância: Foco em resultados e ação direta.\nI — Influência: Foco em pessoas e comunicação.\nS — Estabilidade: Foco em harmonia e consistência.\nC — Conformidade: Foco em qualidade e precisão.`;
const NAT_ADP=`Perfil Natural: Como você realmente é — seu jeito espontâneo de agir.\n\nPerfil Adaptado: Como o seu ambiente espera que você seja.`;

async function generateNarratives(sc){
  const sorted=Object.entries(sc.comp).sort((a,b)=>b[1]-a[1]);
  const top3=sorted.slice(0,3).map(([k,v])=>`${k}(${v})`).join(', ');
  const gap3=sorted.slice(-3).map(([k,v])=>`${k}(${v})`).join(', ');
  const prompt=`Você é um especialista em perfil comportamental DISC para gestão escolar brasileira.
Gere narrativas para um relatório de perfil comportamental.
DADOS: Nome: ${G.ud.name}, Perfil: ${sc.profile}, DISC Natural: D=${sc.disc.D} I=${sc.disc.I} S=${sc.disc.S} C=${sc.disc.C}, DISC Adaptado: D=${sc.dA.D} I=${sc.dA.I} S=${sc.dA.S} C=${sc.dA.C}, Liderança: ${Object.entries(sc.lead).map(([k,v])=>k+'='+v).join(', ')}, Top: ${top3}, Gap: ${gap3}
Gere APENAS este JSON (sem markdown):
{"profile_desc":"2-3 parágrafos descrevendo o perfil.","strengths":"2 parágrafos sobre forças.","development":"2 parágrafos sobre desenvolvimento.","leadership":"2 parágrafos sobre liderança.","communication":"2 parágrafos sobre comunicação.","conflict":"2 parágrafos sobre conflitos.","tips":"4 dicas práticas numeradas."}`;
  try{
    const r=await fetch('/api/generate-narratives',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});
    const d=await r.json();
    if(d.success&&d.narratives)return d.narratives;
    return fallbackNar(sc);
  }catch(e){return fallbackNar(sc)}
}

function fallbackNar(sc){
  const dom=Object.entries(sc.disc).sort((a,b)=>b[1]-a[1]);
  const n={D:'Dominância',I:'Influência',S:'Estabilidade',C:'Conformidade'};
  const p1=dom[0][0],p2=dom[1][0];
  return{
    profile_desc:`Seu perfil ${sc.profile} combina ${n[p1]} e ${n[p2]}.\n\nEsse perfil é relevante na gestão escolar.`,
    strengths:`Suas maiores forças estão nas competências mais altas.\n\nNa prática, essas forças se manifestam em como você conduz reuniões.`,
    development:`As áreas com maior potencial de desenvolvimento são oportunidades de crescimento.\n\nDesenvolvimento significa expandir seu repertório.`,
    leadership:`Seu estilo de liderança reflete seu perfil.\n\nIsso se traduz em como você conduz reuniões pedagógicas.`,
    communication:`Você se comunica de forma ${p1==='D'?'objetiva':p1==='I'?'expressiva':p1==='S'?'cuidadosa':'estruturada'}.\n\nAs pessoas devem adaptar-se ao seu estilo.`,
    conflict:`Sob pressão, seu instinto é ${p1==='D'?'enfrentar':p1==='I'?'buscar aliados':p1==='S'?'mediar':'analisar'}.\n\nEstratégia: pergunte-se "o que esta situação precisa?"`,
    tips:`1. Priorize as 3 decisões mais importantes do dia.\n2. Peça feedback direto semanalmente.\n3. Em situações desconfortáveis, pergunte "o que esta situação precisa?"\n4. Celebre pequenas conquistas da equipe.`
  }
}

async function generateReport(sc){
  const btn=$('genPdf');
  btn.disabled=true;btn.innerHTML='<div class="spinner" style="width:18px;height:18px;border-width:2px"></div> Gerando...';
  const nar=await generateNarratives(sc);
  btn.innerHTML='<div class="spinner" style="width:18px;height:18px;border-width:2px"></div> Montando PDF...';
  await new Promise(r=>setTimeout(r,100));
  const cv=$('rc');const radarImg=cv?cv.toDataURL('image/png'):null;
  const{jsPDF}=window.jspdf;const pdf=new jsPDF('portrait','mm','a4');
  const W=210,H2=297,ML=18,CW=W-ML-ML;
  const navy=[12,24,41],teal=[45,212,191],coral=[251,113,133],white=[248,250,252],muted=[148,163,184],off=[203,213,225],green=[74,222,128],gold=[252,211,77],navyL=[26,45,74],grayD=[71,85,105];
  const dC=[239,68,68],iC=[251,191,36],sC=[34,197,94],cC=[59,130,246];
  function hdr(p){if(p<2)return;pdf.setFillColor(...navy);pdf.rect(0,0,W,24,'F');pdf.setFillColor(...teal);pdf.rect(0,24,W,0.4,'F');pdf.setFont('helvetica','bold',10);pdf.setTextColor(...teal);pdf.text('VERTHO',ML,14);pdf.setFont('helvetica','normal',7);pdf.setTextColor(...white);pdf.text(G.ud.name,W-ML,14,{align:'right'})}
  function ftr(p){pdf.setFont('helvetica','normal',5.5);pdf.setTextColor(...grayD);pdf.text('Vertho © 2026',ML,H2-8);pdf.text('Pág. '+p,W-ML,H2-8,{align:'right'})}
  function sec(t,y){pdf.setFont('helvetica','bold',12);pdf.setTextColor(...teal);pdf.text(t,ML,y);return y+7}
  function bdy(t,y){pdf.setFont('helvetica','normal',8.5);pdf.setTextColor(...off);const ls=pdf.splitTextToSize(t,CW);for(const l of ls){if(y>H2-18){pdf.addPage();pg++;hdr(pg);ftr(pg);y=32}pdf.text(l,ML,y);y+=3.8}return y+2}
  function bar(nm,v,mx,cl,y){pdf.setFont('helvetica','normal',7.5);pdf.setTextColor(...off);pdf.text(nm,ML,y);pdf.setFont('helvetica','bold',7.5);pdf.setTextColor(...cl);pdf.text(String(v),ML+CW,y,{align:'right'});const by=y+1.5,bh=3,bw=CW-2;pdf.setFillColor(20,30,50);pdf.roundedRect(ML,by,bw,bh,1.2,1.2,'F');pdf.setFillColor(...cl);pdf.roundedRect(ML,by,Math.max(0,v/mx*bw),bh,1.2,1.2,'F');return y+9}
  let pg=1;
  // COVER
  pdf.setFillColor(...navy);pdf.rect(0,0,W,H2,'F');
  pdf.setFillColor(...teal);pdf.rect(ML,55,35,0.8,'F');
  pdf.setFont('helvetica','bold',26);pdf.setTextColor(...teal);pdf.text('VERTHO',ML,52);
  pdf.setFont('helvetica','bold',20);pdf.setTextColor(...white);pdf.text('Relatório de Perfil',ML,75);pdf.text('Comportamental',ML,84);
  pdf.setFillColor(...teal);pdf.roundedRect(ML,95,42,18,3,3,'F');
  pdf.setFont('helvetica','bold',22);pdf.setTextColor(...navy);pdf.text(sc.profile,ML+21,107,{align:'center'});
  let iy=135;pdf.setFont('helvetica','bold',13);pdf.setTextColor(...white);pdf.text(G.ud.name,ML,iy);iy+=8;
  pdf.setFont('helvetica','normal',9);pdf.setTextColor(...muted);
  const today=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  pdf.text(today,ML,iy);
  pdf.setFont('helvetica','normal',6);pdf.setTextColor(...grayD);
  pdf.text('Documento confidencial — Vertho © 2026',ML,H2-10);

  // Page 2: Intro
  pdf.addPage();pg++;hdr(pg);ftr(pg);let y=32;
  y=sec('O que é o DISC?',y);for(const p of DISC_INTRO.split('\n\n')){y=bdy(p,y);y+=1}
  y+=2;y=sec('Natural vs Adaptado',y);for(const p of NAT_ADP.split('\n\n')){y=bdy(p,y);y+=1}

  // Page 3: DISC numbers
  pdf.addPage();pg++;hdr(pg);ftr(pg);y=32;
  y=sec('Perfil DISC',y);
  const bw=CW/4-2;
  [['D','Dominância',dC],['I','Influência',iC],['S','Estabilidade',sC],['C','Conformidade',cC]].forEach(([f,nm,cl],i)=>{
    const bx=ML+i*(bw+2.6);pdf.setFillColor(...navyL);pdf.roundedRect(bx,y,bw,20,2,2,'F');
    pdf.setFont('helvetica','bold',10);pdf.setTextColor(...cl);pdf.text(f,bx+bw/2,y+7,{align:'center'});
    pdf.setFont('helvetica','bold',15);pdf.text(String(sc.disc[f]),bx+bw/2,y+14,{align:'center'});
  });y+=26;
  if(radarImg){pdf.addImage(radarImg,'PNG',W/2-32,y,64,64);y+=70}
  y=sec('Descrição do perfil',y);for(const p of nar.profile_desc.split('\n\n')){y=bdy(p,y);y+=1}

  // Page 4: Strengths + Development
  pdf.addPage();pg++;hdr(pg);ftr(pg);y=32;
  y=sec('Forças naturais',y);for(const p of nar.strengths.split('\n\n')){y=bdy(p,y);y+=1}
  y+=3;y=sec('Áreas de desenvolvimento',y);for(const p of nar.development.split('\n\n')){y=bdy(p,y);y+=1}

  // Page 5: Leadership + Communication
  pdf.addPage();pg++;hdr(pg);ftr(pg);y=32;
  y=sec('Estilo de liderança',y);
  [['Executivo',sc.lead.Executivo,dC],['Motivador',sc.lead.Motivador,iC],['Metódico',sc.lead.Metódico,sC],['Sistemático',sc.lead.Sistemático,cC]].forEach(([n,v,c])=>{y=bar(n,v,50,c,y)});
  y+=1;for(const p of nar.leadership.split('\n\n')){y=bdy(p,y);y+=1}
  y+=2;y=sec('Comunicação',y);for(const p of nar.communication.split('\n\n')){y=bdy(p,y);y+=1}

  // Page 6: Conflict + Tips + Competencies
  pdf.addPage();pg++;hdr(pg);ftr(pg);y=32;
  y=sec('Conflito e pressão',y);for(const p of nar.conflict.split('\n\n')){y=bdy(p,y);y+=1}
  y+=2;y=sec('Dicas práticas',y);for(const p of nar.tips.split('\n')){if(p.trim())y=bdy(p.trim(),y);y+=0.3}
  y+=4;y=sec('16 Competências',y);
  const cls=[{t:'Dominância',c:dC,k:['Ousadia','Comando','Objetividade','Assertividade']},{t:'Influência',c:iC,k:['Persuasão','Extroversão','Entusiasmo','Sociabilidade']},{t:'Estabilidade',c:sC,k:['Empatia','Paciência','Persistência','Planejamento']},{t:'Conformidade',c:cC,k:['Organização','Detalhismo','Prudência','Concentração']}];
  cls.forEach(cl=>{
    pdf.setFont('helvetica','bold',8);pdf.setTextColor(...cl.c);pdf.text(cl.t,ML,y);y+=5;
    cl.k.forEach(k=>{y=bar(k,sc.comp[k],100,cl.c,y)});y+=2;
  });

  pdf.save(`Vertho_Perfil_${G.ud.name.replace(/\s+/g,'_')}.pdf`);
  btn.disabled=false;btn.innerHTML='<span style="font-size:18px">📄</span> BAIXAR RELATÓRIO PDF';
}

// Auto-skip if email in URL
(function(){
  var p=new URLSearchParams(window.location.search);
  var e=p.get('email')||'';
  if(e){G.ud.email=e;G.ud.name=e.split('@')[0];G.ph='rank1_intro';}
})();

R();
