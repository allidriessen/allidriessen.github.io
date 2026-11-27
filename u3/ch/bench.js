/* Cellular Homeostasis: lab-bench layout for Parts 2 and 3.  Simulation pinned on the left, worksheet scrolls on the right.
   CH.bench({id, q, tabs:[{id,label,sub,scene,build(host,api)}], scenes:{id:{cfg(),btns:[{label,fn(sim,api)}],cols:[..],kinds:[..],note}}}) */
(function(){
const L=LAB,D=L.D,G=window.G;
CH.bench=cfg=>{
 document.body.classList.add("bp");
 const P=CH.PARTS[CH.idx(cfg.id)];
 if(window.BVL)BVL.guard("u3/ch","2099-01-01");
 L.load();L.part=cfg.id;document.title=P.t+" · "+CH.TITLE;
 const i=CH.idx(cfg.id);
 if(!CH.open(i)){document.body.innerHTML='<div class="gate"><h1>Finish the earlier part first</h1><p>Complete <b>'+CH.PARTS[i-1].t+'</b> before opening this part.</p><p><a href="/u3/ch.html">← Back to lesson home</a></p></div>';throw new Error("locked")}
 const sh=document.getElementById("shell");
 sh.innerHTML=`<div class="bench"><aside id="simpane" aria-label="Simulation"><div id="spin"><div class="stitle" id="stitle"></div><div id="cvw"><canvas id="sim" aria-label="Membrane transport simulation"></canvas></div>
 <div class="sctl"><button type="button" class="pbtn sm ghost" id="spz">❚❚ Pause</button><label>Speed <input type="range" id="sspd" min="0.25" max="3" step="0.25" value="1" aria-label="Speed"><b id="sspv">1×</b></label><button type="button" class="pbtn sm ghost" id="srs">↺ Reset</button><button type="button" class="pbtn sm ghost" id="szm" hidden>🔍 Zoom in</button><button type="button" class="pbtn sm ghost" id="smd" hidden>👣 Step-by-step view</button></div>
 <div class="sctl" id="scb"></div><div id="srd"></div><div id="snote" class="note"></div></div></aside>
 <div id="wspane"><div class="wrap"><header class="ph"><a href="/u3/ch.html">← Back to lesson home</a><div class="ey">Honors Biology · Unit 3</div><h1>${P.t}</h1>${cfg.q?`<p class="sq">${cfg.q}</p>`:""}</header>
 <div id="chips"><button type="button" class="simtog" id="stog">Hide simulation</button></div>
 <div id="notin" class="info" hidden><b>Not signed in.</b> You can try the lab, but answers will not be saved and you cannot make a PDF. <a href="/home.html">Sign in on the home page</a>.</div>
 <div class="tabbar" id="tabs"></div><main id="pg"></main><div class="foot"><input id="tc" type="password" placeholder="code" aria-label="Teacher code" hidden><span id="tg" role="button" tabindex="0" aria-label="Teacher options">⚙</span></div></div></div></div><div class="toast" id="toast" hidden></div>`;
 const $=id=>document.getElementById(id);
 if(window.BVL&&!BVL.user())$("notin").hidden=false;
 $("tg").onclick=()=>{if(CH.teach())return;const e=$("tc");e.hidden=!e.hidden;if(!e.hidden)e.focus()};
 $("tc").onkeydown=e=>{if(e.key==="Enter"){if(e.target.value===((window.BVL_CFG&&BVL_CFG.teacherCode)||"teacher")){try{sessionStorage.setItem("bvl:preview","1")}catch(x){}BVL.preview=true;e.target.hidden=true;L.flash("Teacher mode: next buttons unlocked");CH.sync&&CH.sync()}else{e.target.value="";L.flash("Incorrect code")}}};
 const sim=new Sim($("sim")),api={sim,cur:null,P};
 /* sizing */
 function fit(){const pane=$("simpane"),pw=pane.clientWidth-20,oth=[...$("spin").children].filter(c=>c.id!=="cvw").reduce((h,c)=>h+c.offsetHeight+6,0),ph=Math.max(pane.clientHeight-oth-30,pane.clientHeight*.56);const w=Math.max(260,Math.min(pw,ph*Sim.W/Sim.H));sim.fit(Math.min(w,pw))}
 const cur=()=>{const sc=cfg.scenes[api.cur];return api.sm&&sc&&sc.step?Object.assign({},sc,sc.step):sc};
 /* readout table */
 function readout(){const sc=cfg.scenes[api.cur];if(!sc)return;if(!sim.cfg){const ex0=cur().extra?cur().extra(sim,api):"";if(readout.last!==ex0){readout.last=ex0;$("srd").innerHTML=ex0}return}const cn=sim.counts(),cols=sc.cols||sim.cfg.regions.map(r=>r.name),nr=cols.length;
  const rows=(sc.kinds||Object.keys(cn)).map(k=>{const c=cn[k]||Array(nr).fill(0);return`<tr class="${sim.focus===k?"fo":""}" data-k="${k}"><th scope="row"><img alt="" src="${G.icon(k,48)}">${G.NAMES[k]}</th>${c.map((n,r)=>`<td>${n}</td>`).join("")}${sc.cross===false?"":`<td class="cx">${crossTxt(k,nr)}</td>`}</tr>`}).join("");
  const cs=cur(),ex=cs.extra?cs.extra(sim,api):"";const key=cols.join()+rows+ex;if(readout.last!==key){readout.last=key;$("srd").innerHTML=(cs.top?ex:"")+`<table class="rd"><thead><tr><th></th>${cols.map(c=>`<th>${c}</th>`).join("")}${sc.cross===false?"":'<th title="Molecules that crossed a membrane since Reset">Crossed</th>'}</tr></thead><tbody>${rows}</tbody></table>`+(cs.top?"":ex)}}
 const crossTxt=(k,nr)=>{let d=0,u=0;for(let r=0;r<nr-1;r++){d+=sim.crossed(k,r,r+1);u+=sim.crossed(k,r+1,r)}return(d||u)?`↓${d} ↑${u}`:"–"};
 sim.onTick=()=>{readout();btnState();if(api.tick)api.tick(sim)};
 const btnState=()=>{const cs=cur();if(!cs||!cs.btns)return;[...$("scb").children].forEach((e,j)=>{const bt=cs.btns[j];if(!bt)return;if(typeof bt.label==="function"){const t=bt.label(sim,api);if(e.textContent!==t)e.textContent=t}e.classList.toggle("on",!!(bt.on&&bt.on(sim,api)));e.classList.toggle("off",!!(bt.off&&bt.off(sim,api)));if(bt.dis)e.disabled=!!bt.dis(sim,api)})};
 $("srd").onclick=e=>{const tr=e.target.closest("tr[data-k]");if(!tr)return;const k=tr.dataset.k;sim.focus=sim.focus===k?null:k;readout.last=null;readout()};
 /* scene control */
 const btns=()=>{const cs=cur();$("scb").innerHTML=(cs.btns||[]).map((b,j)=>`<button type="button" class="pbtn sm sb" data-j="${j}">${typeof b.label==="function"?b.label(sim,api):b.label}</button>`).join("");btnState()};
 const zin=sc=>"🔍 Zoom in"+(sc&&sc.zoom&&sc.zoom.label?" on the "+sc.zoom.label:"");const zoomOff=()=>{sim.setZoom(false);$("szm").textContent=zin(cfg.scenes[api.cur])};
 api.scene=id=>{const sc=cfg.scenes[id];api.cur=id;api.sm=false;sim.focus=null;sim.custom=null;sim.paused=false;$("spz").textContent="❚❚ Pause";sim.speed=sc.speed||1;$("sspd").value=sim.speed;$("sspv").textContent=sim.speed+"×";
  $("stitle").textContent=sc.title||"";$("snote").textContent=sc.note||"";readout.last=null;zoomOff();
  if(sc.cfg){sim.load(sc.cfg())}else{sim.cfg=null;sim.ps=[]}
  if(sc.start)sc.start(sim,api);
  $("szm").hidden=!sc.zoom;$("szm").textContent=zin(sc);$("smd").hidden=!sc.step;$("smd").textContent="👣 Step-by-step view";
  btns();$("srd").hidden=!sc.cfg&&!sc.extra;fit();readout()};
 $("scb").onclick=e=>{const b=e.target.closest(".sb");if(!b)return;const bt=cur().btns[+b.dataset.j];bt.fn(sim,api,b);readout.last=null;readout();btnState()};
 $("szm").onclick=()=>{const sc=cfg.scenes[api.cur],on=sim.zt<=1,z=sc.zoom;sim.setZoom(on,z.x,z.y,z.z);$("szm").textContent=on?"🔍 Zoom out":zin(sc)};
 $("smd").onclick=()=>{const sc=cfg.scenes[api.cur];api.sm=!api.sm;sim.focus=null;sim.paused=false;$("spz").textContent="❚❚ Pause";
  if(api.sm){sim.load(sc.step.cfg?sc.step.cfg():sc.cfg());sc.step.on(sim,api);$("smd").textContent="▶ Live view";if(sc.step.zoom){const z=sc.step.zoom;sim.setZoom(true,z.x,z.y,z.z);$("szm").textContent="🔍 Zoom out"}}
  else{sim.load(sc.cfg());zoomOff();$("smd").textContent="👣 Step-by-step view";if(sc.step.off)sc.step.off(sim,api)}
  $("snote").textContent=(api.sm&&sc.step.note)||sc.note||"";btns();readout.last=null;readout()};
 (()=>{const c=$("sim");let dr=null;c.addEventListener("pointerdown",e=>{if(sim.zt<=1)return;dr=[e.clientX,e.clientY];c.setPointerCapture&&c.setPointerCapture(e.pointerId)});
  c.addEventListener("pointermove",e=>{if(!dr)return;const k=Sim.W/c.getBoundingClientRect().width/sim.zt;sim.panBy(-(e.clientX-dr[0])*k,-(e.clientY-dr[1])*k);dr=[e.clientX,e.clientY]});
  ["pointerup","pointercancel"].forEach(n=>c.addEventListener(n,()=>{dr=null}));c.style.touchAction="pan-y"})();
 $("srs").onclick=()=>{const sc=cfg.scenes[api.cur];if(api.sm&&sc.step){sim.load(sc.step.cfg?sc.step.cfg():sc.cfg());sc.step.on(sim,api)}else if(sc.reset)sc.reset(sim,api);else if(sc.cfg)sim.load(sc.cfg());$("spz").textContent="❚❚ Pause";sim.paused=false;readout.last=null;readout()};
 $("spz").onclick=()=>{sim.paused=!sim.paused;$("spz").textContent=sim.paused?"▶ Play":"❚❚ Pause"};
 $("sspd").oninput=e=>{sim.speed=+e.target.value;$("sspv").textContent=sim.speed+"×"};
 $("stog").onclick=()=>{document.body.classList.toggle("nosim");$("stog").textContent=document.body.classList.contains("nosim")?"Show simulation":"Hide simulation"};
 addEventListener("resize",fit);
 /* tabs */
 const tabs=cfg.tabs,tb=$("tabs"),pg=$("pg");
 tb.innerHTML=tabs.map((t,j)=>`<button type="button" class="tabb" data-j="${j}"><b>${t.label}</b><span>${t.sub}</span></button>`).join("");
 const panels=tabs.map(t=>{const d=document.createElement("section");d.className="tabp";d.hidden=true;d.innerHTML=`<h3 class="sh">${t.label}: ${t.title}</h3>`;pg.appendChild(d);return d});
 function show(j){tabs.forEach((t,k)=>{panels[k].hidden=k!==j;tb.children[k].classList.toggle("on",k===j)});if(tabs[j].scene)api.scene(tabs[j].scene);try{sessionStorage.setItem("ch:"+cfg.id+":tab",j)}catch(e){}$("wspane").scrollTo({top:0});api.tabIdx=j;if(tabs[j].onShow)tabs[j].onShow(api)}
 tb.onclick=e=>{const b=e.target.closest(".tabb");if(b)show(+b.dataset.j)};
 api.show=show;
 /* "background" foldout helper */
 api.fold=(host,title,html,open)=>{const d=document.createElement("details");d.className="bgd";if(open)d.open=true;d.innerHTML=`<summary>${title}</summary><div class="bgb">${html}</div>`;host.appendChild(d);return d};
 /* snapshot */
 api.shot=(key,cap)=>{const ok=L.shot(key,sim.cv,cap);return ok};
 api.shotAuto=(key,cap)=>{if(!(D.cap&&D.cap[key]))api.shot(key,cap)};
 api.shotBtn=(host,key,cap)=>{const w=document.createElement("div");w.className="capw";w.innerHTML=`<button type="button" class="pbtn ghost sm">📷 Save this picture for my PDF</button> <span class="note">${D.cap&&D.cap[key]?"✓ A picture is saved.":"A picture is also saved automatically when you answer the check question."}</span>`;host.appendChild(w);
  w.querySelector("button").onclick=()=>{if(api.shot(key,cap)){w.querySelector(".note").textContent="✓ Picture saved for your PDF.";L.flash("Picture saved for your PDF")}};return w};
 tabs.forEach((t,j)=>t.build(panels[j],api));
 let start=0;try{start=+sessionStorage.getItem("ch:"+cfg.id+":tab")||0}catch(e){}
 CH.api=api;return api};
})();
