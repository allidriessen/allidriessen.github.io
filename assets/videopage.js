/* Video + questions page. Left/top: video. Right/bottom: questions. Each pane scrolls on its own.
   Pages only supply a settings block (see /templates/video-page-template.html). Needs bvl.js, pdf.js and the lesson's ws.js first. */
(function(){
const VP=window.VP={};
/* Turn a share link into something that can be embedded: Google Drive, YouTube, or a direct .mp4 */
VP.embed=u=>{u=(u||"").trim();let m;
 if((m=u.match(/drive\.google\.com\/file\/d\/([\w-]+)/))||(m=u.match(/drive\.google\.com\/(?:open|uc)\?[^#]*id=([\w-]+)/)))return{kind:"frame",src:"https://drive.google.com/file/d/"+m[1]+"/preview"};
 if((m=u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/)))return{kind:"frame",src:"https://www.youtube-nocookie.com/embed/"+m[1]+"?rel=0&playsinline=1"};
 if(/\.(mp4|m4v|mov|webm)(\?|$)/i.test(u))return{kind:"video",src:u};
 return u?{kind:"frame",src:u}:{kind:"none"}};
const css=document.createElement("style");css.textContent=`
html,body{margin:0;height:100%}
body{display:flex;flex-direction:column;height:100vh;height:100dvh;overflow:hidden;font-family:'Open Sans',system-ui,sans-serif;background:#f5f0fa;color:#241a38;line-height:1.5;-webkit-text-size-adjust:100%}
.vph{flex:none;margin:8px 10px;background:linear-gradient(135deg,#2b1856,#5b3a9a 65%,#a0507a);color:#fff;border-radius:14px;padding:8px 16px;display:flex;justify-content:space-between;align-items:center;gap:10px}
.vph .ey{font-size:13px;font-weight:600;opacity:.9}.vph h1{margin:0;font-size:clamp(20px,3.2vw,30px);font-weight:800;line-height:1.1}
.vph button{font:700 14px 'Open Sans',sans-serif;background:#fff;color:#4b2e83;border:2px solid #fff;border-radius:10px;padding:8px 12px;min-height:40px;cursor:pointer}
#vpm{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:10px;padding:0 10px 10px}
#vpv,#vpq{min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:#fff;border:2px solid #ddd0ee;border-radius:14px}
#vpv{padding:10px;display:flex;flex-direction:column;gap:8px}
#vpq{padding:12px 16px 80px}
.vf{position:relative;width:100%;aspect-ratio:16/9;background:#000;border-radius:10px;overflow:hidden;flex:none}
.vf iframe,.vf video{position:absolute;inset:0;width:100%;height:100%;border:0}
.vnote{font-size:13px;color:#6b5a85}.vnote a{color:#4b2e83;font-weight:600}
.vint{font-size:15px}
#vpq h2{font-size:18px;margin:14px 0 4px;color:#4b2e83}
.vimg{margin:6px 0 10px}.vimg img{max-width:100%;border-radius:10px;border:2px solid #ddd0ee;display:block}.vimg figcaption{font-size:12px;color:#6b5a85}
.vq{margin:10px 0}.vq p.vp{font-weight:700;margin:8px 0 6px}
.vopt{display:block;width:100%;text-align:left;background:#faf7fd;border:2px solid #ddd0ee;border-radius:10px;padding:10px 12px;margin:6px 0;min-height:46px;font:inherit;cursor:pointer}
.vopt.right{background:#e9f8ef;border-color:#14803f}.vopt.wrong{background:#fdecea;border-color:#c0392b}
.vbtn{background:#4b2e83;color:#fff;border:0;border-radius:12px;padding:11px 18px;font:700 16px 'Open Sans',sans-serif;min-height:46px;cursor:pointer}
.vbtn.g{background:#fff;color:#4b2e83;border:2px solid #4b2e83}
.vnav{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 8px}
#vt{display:none}
#vpm.pt #vpv.min .vf{display:none}
#vmod{position:fixed;inset:0;background:rgba(20,10,40,.6);z-index:90;display:flex;align-items:center;justify-content:center;padding:16px}
#vmod div{background:#fff;border-radius:14px;padding:18px 20px;max-width:460px}
.bvl-bar{top:auto!important;bottom:8px}
.vtoast{position:fixed;bottom:60px;left:50%;transform:translateX(-50%);background:#241a38;color:#fff;padding:10px 16px;border-radius:10px;z-index:95}
@media (orientation:portrait),(max-width:760px){
 #vpm{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}
 #vpv{padding:6px;overflow:visible}
 .vf{width:min(100%,calc(36vh * 16 / 9));margin:0 auto}
 #vt{display:inline-block}
 .vint,.vsrc{display:none}
}`;document.head.appendChild(css);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function toast(t){let e=document.querySelector(".vtoast");if(!e){e=document.createElement("div");e.className="vtoast";document.body.appendChild(e)}e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,2600)}
function go(u){u?location.href=u:toast("That page is coming soon.")}
VP.init=function(cfg){
 const B=window.BVL,W=window.WS;
 document.title=cfg.part+": "+cfg.title+" · "+cfg.lesson;
 if(B&&cfg.releaseId)B.guard(cfg.releaseId);
 const em=VP.embed(cfg.video&&cfg.video.url);
 const vid=em.kind==="frame"?`<div class="vf"><iframe src="${esc(em.src)}" title="${esc(cfg.title)} video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`
  :em.kind==="video"?`<div class="vf"><video src="${esc(em.src)}" controls playsinline></video></div>`
  :`<div class="vf" style="display:grid;place-items:center;color:#fff">No video link has been added yet.</div>`;
 const Q=cfg.questions;
 document.body.insertAdjacentHTML("afterbegin",`<header class="vph"><div><div class="ey">${esc(cfg.lesson)}</div><h1>${esc(cfg.part)}: ${esc(cfg.title)}</h1></div><button id="vh">🏠 All parts</button></header>
 <div id="vpm"><section id="vpv" aria-label="Video">${vid}
  <div class="vnote"><button class="vbtn g" id="vt" style="min-height:38px;padding:6px 12px;font-size:14px">Hide / show video</button> ${cfg.video&&cfg.video.url?`<span class="vsrc">Video not loading? <a href="${esc(cfg.video.url)}" target="_blank" rel="noopener">Open it in a new tab ↗</a></span>`:""}</div>
  <p class="vint">${cfg.intro||""}</p></section>
 <section id="vpq" aria-label="Questions"></section></div>`);
 const pane=document.getElementById("vpq"),pv=document.getElementById("vpv"),pm=document.getElementById("vpm");
 const orient=()=>pm.classList.toggle("pt",matchMedia("(orientation:portrait),(max-width:760px)").matches);orient();addEventListener("resize",orient);
 document.getElementById("vh").onclick=()=>go(cfg.homeUrl);
 document.getElementById("vt").onclick=()=>pv.classList.toggle("min");
 /* image slot: put a picture's address in cfg.image.src (for example "img/lungs.png") */
 if(cfg.image&&cfg.image.src)pane.insertAdjacentHTML("beforeend",`<figure class="vimg"><img src="${esc(cfg.image.src)}" alt="${esc(cfg.image.alt||"")}">${cfg.image.credit?`<figcaption>${esc(cfg.image.credit)}</figcaption>`:""}</figure>`);
 /* register this page's content for the PDF */
 if(W)W.vp(cfg.id,{order:cfg.order||0,part:cfg.part,title:cfg.title,url:(cfg.video&&cfg.video.url)||"",points:cfg.points||[],qs:Q.filter(q=>q.type!=="heading").map(q=>({id:q.id,type:q.type,prompt:q.prompt,a:q.type==="mc"?q.o[q.a]:""}))});
 Q.forEach(q=>{
  if(q.type==="heading"){pane.insertAdjacentHTML("beforeend",`<h2>${esc(q.text)}</h2>`);return}
  const box=document.createElement("div");box.className="vq";pane.appendChild(box);
  if(q.type==="written"&&W)W.box(box,q.id,q.prompt,q.rows||4);
  else if(q.type==="sketch"&&W)W.sketch(box,q.id,q.prompt);
  else if(q.type==="mc"&&W){const id="vp:"+cfg.id+":"+q.id;if(!W.mcGet(id))W.mc(id,{q:q.prompt,a:q.o[q.a],w:0,d:0});
   box.innerHTML=`<p class="vp">${q.prompt}</p>`+q.o.map((t,k)=>`<button class="vopt" data-k="${k}">${t}</button>`).join("")+`<div class="vnote" hidden></div>`;
   const done=W.mcGet(id).d,note=box.querySelector(".vnote");
   const fin=()=>{box.querySelectorAll(".vopt")[q.a].classList.add("right");note.hidden=false;note.textContent=q.note||"Correct!"};if(done)fin();
   box.querySelectorAll(".vopt").forEach(b=>b.onclick=()=>{const c=W.mcGet(id);if(c.d||b.classList.contains("wrong"))return;
    if(+b.dataset.k===q.a){W.mc(id,{d:1});fin()}else{b.classList.add("wrong");W.mc(id,{w:(c.w||0)+1})}})}});
 /* bottom: PDF panel (final page only), previous / next */
 const end=document.createElement("div");end.innerHTML=`<div id="vex"></div><div class="vnav">${cfg.prevUrl?`<button class="vbtn g" id="vp">← Back</button>`:""}<button class="vbtn" id="vn">${esc(cfg.nextLabel||"Next →")}</button></div><p class="vnote">You can go on at any time. Your answers save automatically.</p>`;pane.appendChild(end);
 if(W)W.mountExport(document.getElementById("vex"),cfg.id);
 if(cfg.prevUrl)document.getElementById("vp").onclick=()=>go(cfg.prevUrl);
 const blank=()=>Q.filter(q=>q.type!=="heading").filter(q=>{if(!W)return false;if(q.type==="written")return !W.ans(q.id).trim();if(q.type==="sketch")return !W.hasSketch(q.id);if(q.type==="mc"){const c=W.mcGet("vp:"+cfg.id+":"+q.id);return !(c&&c.d)}return false});
 document.getElementById("vn").onclick=()=>{const b=blank();if(!b.length)return go(cfg.nextUrl);
  const m=document.createElement("div");m.id="vmod";m.innerHTML=`<div><h3 style="margin:0 0 6px">${b.length} question${b.length>1?"s":""} still blank</h3><p style="margin:0 0 10px">${b.map(q=>"• "+esc(q.prompt.replace(/<[^>]+>/g,"").slice(0,70))+"…").join("<br>")}</p><button class="vbtn" id="vg">Go back and answer</button> <button class="vbtn g" id="vc">Continue anyway</button></div>`;
  document.body.appendChild(m);document.getElementById("vg").onclick=()=>m.remove();document.getElementById("vc").onclick=()=>go(cfg.nextUrl)}};
})();
