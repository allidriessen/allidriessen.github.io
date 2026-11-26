/* Shared page pieces for Cancer Cell Exploration Parts 2 (challenge), 4, 5 and 6.
   Needs /assets/bvl.js, /assets/pdf.js and /u3/cce/ws.js loaded first.
   PG.init(...)      page frame: header, Back / Next buttons, teacher bypass
   PG.quiz(...)      multiple-choice questions (first-try scoring goes to the PDF)
   PG.classify(...)  tap-to-sort challenge (for example Benign / Malignant) with "X of N correct" feedback
   PG.hint(...)      a collapsible hint button */
(function(){
const css=document.createElement("style");css.textContent=`
:root{--ink:#241a38;--pur:#4b2e83;--bg:#f5f0fa;--ok:#14803f;--bad:#c0392b}
*{box-sizing:border-box}
body{margin:0;font-family:'Open Sans',system-ui,sans-serif;background:var(--bg);color:var(--ink);-webkit-text-size-adjust:100%;line-height:1.5}
button{font:inherit;cursor:pointer}
[hidden]{display:none!important}
.wrap{max-width:1000px;margin:0 auto;padding:12px}
.ph{background:linear-gradient(135deg,#2b1856,#5b3a9a 65%,#a0507a);color:#fff;border-radius:16px;padding:14px 20px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.ph .ey{font-size:15px;font-weight:600;opacity:.9}.ph h1{margin:0;font-size:clamp(26px,5vw,40px);font-weight:800;line-height:1.1}
.pbtn{background:var(--pur);color:#fff;border:0;border-radius:12px;padding:11px 18px;font-weight:700;font-size:16px;min-height:46px}
.pbtn[disabled]{background:#b9aed0;cursor:not-allowed}
.ghost{background:#fff;color:var(--pur);border:2px solid var(--pur)}
.box{background:#fff;border:2px solid #ddd0ee;border-radius:14px;padding:12px 16px;margin:12px 0}
.box h2,.box h3{margin:4px 0 6px}
.note{font-size:13px;color:#6b5a85}
.nav{display:flex;justify-content:space-between;gap:8px;margin:12px 0}
.bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:10px 0}
.q{margin:12px 0}.q p{font-weight:700;margin:0 0 6px}
.opt{display:block;width:100%;text-align:left;background:#faf7fd;border:2px solid #ddd0ee;border-radius:10px;padding:10px 12px;margin:6px 0;min-height:46px}
.opt.right{background:#e9f8ef;border-color:var(--ok)}.opt.wrong{background:#fdecea;border-color:var(--bad)}
.ws{background:#e9f8ef;border:1px solid #9ad3b0;border-radius:8px;padding:8px 10px;margin-top:6px;font-weight:600}
.hide{display:none}
.banner{background:#e9f8ef;border:2px solid var(--ok);border-radius:12px;padding:12px 16px;margin:12px 0}
.tiles6{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:10px 0}@media(max-width:560px){.tiles6{grid-template-columns:repeat(2,1fr)}}
.tiles6 figure{margin:0}.tiles6 .gfx{border:3px solid #ddd0ee;border-radius:10px;overflow:hidden;cursor:zoom-in;background:#fff}
.tiles6 .gfx img,.tiles6 .gfx svg{width:100%;height:auto;display:block}
.tiles6 figcaption{font-size:13px;font-weight:600;margin:2px 0}
.lb{display:flex;gap:6px}.lb button{flex:1;min-height:46px;font:700 14px 'Open Sans',sans-serif;background:#faf7fd;color:#4b2e83;border:2px solid #ddd0ee;border-radius:10px;cursor:pointer}.lb button.on{background:#4b2e83;color:#fff;border-color:#4b2e83}
.tiles6 figure.good .gfx{border-color:#14803f}.tiles6 figure.hintring .gfx{border-color:#f5b700;box-shadow:0 0 0 4px #f5b70066}
.refs{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,200px));gap:10px;margin:10px 0}.refs figure{margin:0}.refs .gfx{border:3px solid #14803f;border-radius:10px;overflow:hidden}.refs img{width:100%;display:block}.refs figcaption{font-weight:700;font-size:14px}
#zm{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:80;display:flex;align-items:center;justify-content:center;cursor:zoom-out}#zm>*{max-width:92vw;max-height:92vh;width:min(92vw,92vh);height:auto;border-radius:8px;background:#fff}
.hintbox{background:#fff8d6;border:1px solid #e6c84a;border-radius:8px;padding:8px 12px;margin:6px 0;font-weight:600}
table{border-collapse:collapse;width:100%;font-size:14px}th,td{border:1px solid #ddd0ee;padding:6px 8px;text-align:left;vertical-align:top}th{background:#efe8f8}
.foot{display:flex;justify-content:flex-end;align-items:center;gap:6px;margin:30px 0 70px;opacity:.35}
.foot input{font:inherit;padding:6px;border-radius:8px;border:1px solid #999;width:110px}
#tg{cursor:pointer;font-size:16px;padding:6px}
.toast{position:fixed;bottom:76px;left:50%;transform:translateX(-50%);background:#241a38;color:#fff;padding:10px 16px;border-radius:10px;z-index:60}
.pill{display:inline-block;background:#efe8f8;color:#4b2e83;font-weight:700;border-radius:999px;padding:3px 12px;font-size:13px}
.cards3{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px}.cards3>div{background:#faf7fd;border:2px solid #ddd0ee;border-radius:12px;padding:10px 14px}.cards3 h3{margin:0 0 4px;font-size:16px;color:#4b2e83}
`;document.head.appendChild(css);

const $=id=>document.getElementById(id);
const PG=window.PG={};
const TCODE=()=>(window.BVL_CFG&&BVL_CFG.teacherCode)||"teacher";
PG.TEACH=!!(window.BVL&&BVL.preview);
PG.$=$;
PG.flash=t=>{const e=$("toast");if(!e)return;e.textContent=t;e.hidden=false;clearTimeout(PG.flash.t);PG.flash.t=setTimeout(()=>e.hidden=true,2600)};
PG.link=u=>u?location.href=u:PG.flash("This part is coming soon.");
PG.shuf=(a,seed)=>{const r=a.slice();let s=seed%2147483646+1;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=r.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[r[i],r[j]]=[r[j],r[i]]}return r};
PG.zoom=el=>{const d=document.createElement("div");d.id="zm";const c=el.cloneNode(true);c.removeAttribute("id");d.appendChild(c);d.onclick=()=>d.remove();document.body.appendChild(d)};
PG.seed=salt=>(window.BVL?BVL.seed(salt):0)||0;

/* page frame. cfg: {releaseId, part, title, homeUrl, backUrl, nextUrl, nextLabel, nextLocked:true|false} */
PG.init=cfg=>{
 if(window.BVL&&cfg.releaseId)BVL.guard(cfg.releaseId);
 document.title=cfg.part+": "+cfg.title+" · Cancer Cell Exploration";
 document.body.insertAdjacentHTML("afterbegin",`<div class="wrap"><header class="ph"><div><div class="ey">Cancer Cell Exploration</div><h1>${cfg.part}: ${cfg.title}</h1></div><button class="pbtn ghost" id="hm">🏠 All parts</button></header>
 <main id="pg"></main>
 <div class="nav"><button class="pbtn ghost" id="bk" ${cfg.backUrl?"":"hidden"}>← Back</button><button class="pbtn" id="nx" ${cfg.nextUrl||cfg.nextLabel?"":"hidden"}>${cfg.nextLabel||"Next →"}</button></div>
 <div class="foot"><input id="tc" type="password" placeholder="code" aria-label="Teacher code" hidden><span id="tg" role="button" tabindex="0" aria-label="Teacher options">⚙</span></div><div class="toast" id="toast" hidden></div></div>`);
 const home=cfg.homeUrl||"../cce.html";
 $("hm").onclick=()=>PG.link(home);$("bk").onclick=()=>PG.link(cfg.backUrl);
 PG.locked=cfg.nextLocked!==false;
 PG.sync=()=>{const n=$("nx");if(n)n.disabled=PG.locked&&!PG.TEACH};
 $("nx").onclick=()=>{if(cfg.onNext)return cfg.onNext();PG.link(cfg.nextUrl)};
 PG.unlock=()=>{PG.locked=false;PG.sync()};
 $("tg").onclick=()=>{if(PG.TEACH)return;const e=$("tc");e.hidden=!e.hidden;if(!e.hidden)e.focus()};
 $("tc").onkeydown=e=>{if(e.key==="Enter"){if(e.target.value===TCODE()){PG.TEACH=true;e.target.hidden=true;e.target.value="";PG.flash("Teacher mode: Next is unlocked");PG.sync();if(PG.onTeacher)PG.onTeacher()}else{e.target.value="";PG.flash("Incorrect code")}}};
 PG.sync();return $("pg")};

/* collapsible hint */
PG.hint=(host,text)=>{const w=document.createElement("div");w.innerHTML=`<button class="pbtn ghost" type="button" style="min-height:38px;padding:6px 12px;font-size:14px">💡 Need a hint?</button><div class="hintbox" hidden>${text}</div>`;const b=w.querySelector("button"),h=w.querySelector(".hintbox");b.onclick=()=>{h.hidden=!h.hidden;b.textContent=h.hidden?"💡 Need a hint?":"Hide hint"};host.appendChild(w);return w};

/* multiple-choice questions. opts:{key:"p5", onDone, title}. Correct answers are remembered; first-try scores go to the PDF.
   q.a may be one index or an array of indexes (select all that apply). */
PG.quiz=(host,qs,opts)=>{opts=opts||{};const key=opts.key;let n=0;if(window.WS)WS.mcReg(key,qs);
 host.innerHTML=(opts.title===""?"":`<h3>${opts.title||"Check your understanding"}</h3>`)+qs.map((q,i)=>{const ord=q.o.map((_,k)=>k).sort(()=>Math.random()-.5);return `<div class="q"><p>${i+1}. ${q.q}${Array.isArray(q.a)?" <i>(Select two answers.)</i>":""}</p>${ord.map(k=>`<button class="opt" data-q="${i}" data-k="${k}">${q.o[k]}</button>`).join("")}<div class="ws hide"></div></div>`}).join("");
 const ok=(blk)=>{const w=blk.querySelector(".ws");w.textContent="✅ Correct!";w.classList.remove("hide")};
 host.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{const i=+b.dataset.q,q=qs[i],blk=b.parentElement,A=[].concat(q.a);if(blk.dataset.ok||b.classList.contains("right")||b.classList.contains("wrong"))return;
  if(A.includes(+b.dataset.k)){b.classList.add("right");blk.dataset.c=(+blk.dataset.c||0)+1;if(+blk.dataset.c===A.length){blk.dataset.ok=1;if(window.WS)WS.mc(key+":"+i,{d:1});ok(blk);if(++n===qs.length&&opts.onDone)opts.onDone()}}
  else{b.classList.add("wrong");if(window.WS){const c=WS.mcGet(key+":"+i)||{w:0};WS.mc(key+":"+i,{w:(c.w||0)+1})}b.textContent+="  (Not quite. Re-read and try another answer.)"}});
 if(window.WS)qs.forEach((q,i)=>{const c=WS.mcGet(key+":"+i);if(c&&c.d){const blk=host.querySelectorAll(".q")[i];[].concat(q.a).forEach(k=>blk.querySelector(`.opt[data-k="${k}"]`).classList.add("right"));blk.dataset.ok=1;ok(blk);n++}});
 if(n===qs.length&&opts.onDone)opts.onDone()};

/* sorting challenge. cfg:{key, items:[{html, cap, truth:0|1}], labels:["Benign","Malignant"], counts:[3,3], seed, nounPlural:"samples",
   hint:(k,items)=>"text", onSolved, solvedExtra:(box)=>{}}  Progress is kept in WS.ch(key). */
PG.classify=(host,cfg)=>{
 const T=PG.shuf(cfg.items,cfg.seed||1),sel=T.map(()=>null),N=T.length,L=cfg.labels,noun=cfg.noun||"sample";
 host.innerHTML=`<div class="tiles6">${T.map((t,k)=>`<figure data-k="${k}"><div class="gfx">${t.html}</div><figcaption>${t.cap||noun[0].toUpperCase()+noun.slice(1)+" "+(k+1)}</figcaption><div class="lb"><button data-k="${k}" data-v="0">${L[0]}</button><button data-k="${k}" data-v="1">${L[1]}</button></div></figure>`).join("")}</div>
 <div class="bar"><button class="pbtn" id="chk${cfg.key}">Check my answers</button><button class="pbtn ghost" id="hnt${cfg.key}" hidden>💡 Hint</button></div><div class="msg" id="cm${cfg.key}" aria-live="polite" style="font-weight:600;min-height:24px"></div><div id="cw${cfg.key}"></div>`;
 const q=s=>host.querySelector(s),msg=(t,c)=>{const e=q("#cm"+cfg.key);e.textContent=t;e.style.color=c||""},fig=k=>host.querySelector(`figure[data-k="${k}"]`);
 const paint=()=>host.querySelectorAll(".lb button").forEach(b=>b.classList.toggle("on",sel[+b.dataset.k]===+b.dataset.v));
 const solved=()=>{T.forEach((t,k)=>{sel[k]=t.truth;fig(k).classList.add("good")});paint();host.querySelectorAll(".lb button").forEach(b=>b.disabled=true);q("#chk"+cfg.key).hidden=true;q("#hnt"+cfg.key).hidden=true;
  msg("✅ All "+N+" correct! You solved it on attempt "+WS.ch(cfg.key).att+".","#14803f");if(cfg.onSolved)cfg.onSolved(q("#cw"+cfg.key))};
 host.querySelectorAll(".gfx").forEach(g=>g.onclick=()=>PG.zoom(g.firstElementChild));
 host.querySelectorAll(".lb button").forEach(b=>b.onclick=()=>{sel[+b.dataset.k]=+b.dataset.v;paint()});
 const hintBtn=()=>{q("#hnt"+cfg.key).hidden=!(WS.ch(cfg.key).att>=3&&!WS.ch(cfg.key).done)};hintBtn();
 q("#chk"+cfg.key).onclick=()=>{if(sel.includes(null))return msg("Label all "+N+" "+noun+"s first.","#c0392b");
  const n0=sel.filter(v=>v===0).length;if(cfg.counts&&n0!==cfg.counts[0])return msg("You labeled "+n0+" as "+L[0].toLowerCase()+" and "+(N-n0)+" as "+L[1].toLowerCase()+", but exactly "+cfg.counts[0]+" are "+L[0].toLowerCase()+" and "+cfg.counts[1]+" are "+L[1].toLowerCase()+". Adjust and check again.","#c0392b");
  const c=WS.ch(cfg.key),att=(c.att||0)+1,ok=T.filter((t,k)=>sel[k]===t.truth).length;WS.ch(cfg.key,{att,first:c.first==null?ok:c.first,n:N});
  if(ok===N){WS.ch(cfg.key,{done:1});solved()}else{msg(ok+" of "+N+" correct. Look again and try again.","#c0392b");hintBtn()}};
 q("#hnt"+cfg.key).onclick=()=>{host.querySelectorAll("figure").forEach(f=>f.classList.remove("hintring"));const k=T.findIndex((t,k)=>sel[k]!==t.truth);if(k<0)return;fig(k).classList.add("hintring");msg(cfg.hint?cfg.hint(k,T):"Hint: look again at the highlighted one.","#7a5a00")};
 if(WS.ch(cfg.key).done)solved()};
})();
