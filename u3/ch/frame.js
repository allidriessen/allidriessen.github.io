/* Cellular Homeostasis: page frame, sequential unlock, teacher bypass.  Needs /assets/bvl.js and /u3/ch/core.js first. */
(function(){
const CH=window.CH={};
CH.PARTS=[
 {id:"intro",u:"/u3/ch/intro.html",t:"Introduction",sub:"Zoom from the digestive system to a single cell membrane.",c:"#a0507a"},
 {id:"p1",u:"/u3/ch/p1.html",t:"Part 1: Membrane Structure",sub:"Label the parts of the membrane and learn what the words mean.",c:"#3a56a8"},
 {id:"p2",u:"/u3/ch/p2.html",t:"Part 2: Passive Transport",sub:"Diffusion, facilitated diffusion and osmosis: no energy needed.",c:"#2f8f83"},
 {id:"p3",u:"/u3/ch/p3.html",t:"Part 3: Active Transport",sub:"Pumps, endocytosis and exocytosis: energy required.",c:"#c0762b"},
 {id:"p4",u:"/u3/ch/p4.html",t:"Summary",sub:"Check what you learned and download your PDF.",c:"#7a5bb5"}];
CH.TITLE="Cellular Homeostasis & Membrane Transport Exploration";
const TCODE=()=>(window.BVL_CFG&&BVL_CFG.teacherCode)||"teacher";
CH.teach=()=>!!(window.BVL&&BVL.preview);
CH.open=i=>i===0||CH.teach()||!!(LAB.D.done[CH.PARTS[i-1].id]);
CH.idx=id=>CH.PARTS.findIndex(p=>p.id===id);
/* build the page header and navigation. cfg:{id, bench:false} ; returns the <main> element */
CH.init=cfg=>{const i=CH.idx(cfg.id),P=CH.PARTS[i];
 if(window.BVL)BVL.guard("u3/ch","2099-01-01");
 LAB.load();LAB.part=cfg.id;
 document.title=P.t+" · "+CH.TITLE;
 if(!CH.open(i)){document.body.innerHTML='<div class="gate"><h1>Finish the earlier part first</h1><p>This activity is done in order. Complete <b>'+CH.PARTS[i-1].t+'</b> before opening this part.</p><p><a href="/u3/ch.html">← Back to the activity page</a></p></div>';throw new Error("locked")}
 const hdr=`<header class="ph"><a href="/u3/ch.html">← Cellular Homeostasis activity</a><div class="ey">Honors Biology · Unit 3</div><h1>${P.t}</h1>${cfg.q?`<p class="sq">${cfg.q}</p>`:""}</header>`;
 const foot=`<div class="foot"><input id="tc" type="password" placeholder="code" aria-label="Teacher code" hidden><span id="tg" role="button" tabindex="0" aria-label="Teacher options">⚙</span></div><div class="toast" id="toast" hidden></div>`;
 const notin=`<div id="notin" class="info" hidden><b>Not signed in.</b> You can try the activity, but your answers will not be saved and you cannot make a PDF. <a href="/home.html">Sign in on the home page</a>.</div>`;
 const wrap=document.getElementById("shell");wrap.innerHTML=(cfg.bench?"":`<div class="wrap">`)+hdr+notin+`<main id="pg"></main>`+foot+(cfg.bench?"":`</div>`);
 if(window.BVL&&!BVL.user())document.getElementById("notin").hidden=false;
 const $=id=>document.getElementById(id);
 $("tg").onclick=()=>{if(CH.teach())return;const e=$("tc");e.hidden=!e.hidden;if(!e.hidden)e.focus()};
 $("tc").onkeydown=e=>{if(e.key==="Enter"){if(e.target.value===TCODE()){try{sessionStorage.setItem("bvl:preview","1")}catch(x){}BVL.preview=true;e.target.hidden=true;LAB.flash("Teacher mode: next buttons unlocked");CH.sync&&CH.sync()}else{e.target.value="";LAB.flash("Incorrect code")}}};
 return $("pg")};
CH.finishPart=id=>{LAB.finish(id);LAB.flash("Part complete! Your work is saved.")};
/* bottom navigation: Back + Next. Next is locked until CH.unlock() (or teacher mode) */
CH.nav=(host,id,o)=>{o=o||{};const i=CH.idx(id),prev=CH.PARTS[i-1],next=CH.PARTS[i+1];
 const w=document.createElement("div");w.className="navrow";
 w.innerHTML=`<a class="pbtn ghost" href="${prev?prev.u:"/u3/ch.html"}" style="text-decoration:none;display:inline-flex;align-items:center">← ${prev?"Back":"Activity page"}</a><span class="fb" id="navfb" style="align-self:center"></span>${next?`<button type="button" class="pbtn" id="nxb" disabled>${o.label||"Next: "+next.t+" →"}</button>`:""}`;
 host.appendChild(w);const b=w.querySelector("#nxb");if(!b)return w;
 CH.sync=()=>{const ok=!!LAB.D.done[id]||CH.teach();b.disabled=!ok;w.querySelector("#navfb").textContent=ok?"":(o.hint||"Finish this part to unlock the next one.")};
 CH.unlock=()=>{LAB.finish(id);CH.sync();LAB.flash("Part complete! Your work is saved.")};
 b.onclick=()=>{location.href=next.u};CH.sync();return w};
})();
