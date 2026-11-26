/* Enzymes in Action Virtual Lab: worksheet widgets (choices, dropdown blanks, data tables, writing boxes, pictures).
   Everything is saved in this browser (BVL.save) and printed to the PDF. Needs /assets/bvl.js first. */
(function(){
const K="eial",B=()=>window.BVL;
const D=window.LAB_D={mc:{},ans:{},data:{},cap:{},pr:{},sig:""};
const L=window.LAB={D,K,items:[],part:""};
L.load=()=>{const d=B()&&B().load(K);if(d){["mc","ans","data","cap","pr"].forEach(k=>D[k]=d[k]||{});D.sig=d.sig||""}};
let tm;L.save=()=>{if(!B())return;clearTimeout(tm);tm=setTimeout(L.saveNow,250)};
L.saveNow=()=>{if(!B())return;const sc=Object.values(D.mc).filter(q=>!q.pred),n=sc.filter(q=>q.d).length,w=Object.values(D.ans).filter(v=>v&&v.trim()).length;
 B().save(K,{title:"Enzymes in Action Virtual Lab · worksheet",summary:n+" of "+sc.length+" questions answered, "+w+" written answers",mc:D.mc,ans:D.ans,data:D.data,cap:D.cap,pr:D.pr,sig:D.sig})};
addEventListener("pagehide",()=>L.saveNow());document.addEventListener("visibilitychange",()=>{if(document.hidden)L.saveNow()});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
L.esc=esc;
const strip=t=>String(t||"").replace(/<[^>]+>/g,"");
L.strip=strip;
/* text that is safe for the PDF's plain fonts */
L.pt=t=>strip(t).replace(/[₀-₉]/g,c=>String.fromCharCode(c.charCodeAt(0)-8272)).replace(/→/g,"->").replace(/≤/g,"<=").replace(/≥/g,">=").replace(/✓/g,"").replace(/[★☆]/g,"*");
L.flash=t=>{let e=document.getElementById("toast");if(!e){e=document.createElement("div");e.id="toast";e.className="toast";document.body.appendChild(e)}e.textContent=t;e.hidden=false;clearTimeout(L.flash.t);L.flash.t=setTimeout(()=>e.hidden=true,3200)};
L.reg=(id,q,a,pred)=>{if(!L.items.some(x=>x.id===id&&x.t==="mc"))L.items.push({part:L.part,t:"mc",id});if(!D.mc[id])D.mc[id]={q:strip(q),a:strip(a),w:0,d:0,pred:pred?1:0,pick:""};else{D.mc[id].q=strip(q);D.mc[id].a=strip(a);D.mc[id].pred=pred?1:0}};
const mark=(h,ok)=>{h.classList.remove("ok","no");if(ok!=null)h.classList.add(ok?"ok":"no")};

/* ---- multiple choice. opts are HTML. correct = index, array of indexes, or a function returning an index (or null when it cannot be decided yet) */
L.choice=(host,id,prompt,opts,correct,o)=>{o=o||{};const pred=!!o.pred;
 const ansText=()=>{if(pred)return"(prediction)";const c=typeof correct==="function"?correct():correct;return c==null?"(depends on your data)":[].concat(c).map(i=>strip(opts[i])).join(" or ")};
 L.reg(id,prompt,ansText(),pred);
 const w=document.createElement("div");w.className="q"+(o.cls?" "+o.cls:"");
 w.innerHTML=`<p>${prompt}${pred?' <span class="tag">Prediction: no wrong answer</span>':""}</p><div class="opts ${o.row?"row":""}">${opts.map((t,i)=>`<button type="button" class="opt" data-i="${i}">${t}</button>`).join("")}</div><div class="fb" aria-live="polite"></div>`;
 host.appendChild(w);const bs=[...w.querySelectorAll(".opt")],fb=w.querySelector(".fb");
 const st=D.mc[id];
 const paint=()=>{if(pred){bs.forEach((b,i)=>b.classList.toggle("sel",st.pick===String(i)));if(st.d)fb.textContent="Prediction saved. You will check it against real data later.";return}
  if(st.d){const c=typeof correct==="function"?correct():correct,ok=[].concat(c);bs.forEach((b,i)=>{b.classList.toggle("right",ok.includes(i)&&st.pick===String(i))});fb.className="fb good";fb.innerHTML="✓ Correct"+(st.w?" (after "+(st.w+1)+" tries)":" on the first try")+(o.explain?". "+o.explain:"")}};
 paint();
 bs.forEach((b,i)=>b.onclick=()=>{
  if(pred){st.pick=String(i);st.pt=strip(opts[i]);st.d=1;paint();L.save();if(o.onPick)o.onPick(i);return}
  if(st.d)return;const c=typeof correct==="function"?correct():correct;
  if(c==null){fb.className="fb bad";fb.textContent=o.wait||"Fill in your data table first, then answer.";return}
  const ok=[].concat(c).includes(i);
  if(ok){st.d=1;st.pick=String(i);st.pt=strip(opts[i]);paint();L.save();if(o.onRight)o.onRight()}
  else{st.w++;b.classList.add("wrong");fb.className="fb bad";fb.textContent=(o.hint?o.hint+" ":"")+"Not quite. Try again.";L.save();setTimeout(()=>b.classList.remove("wrong"),900)}});
 return w};

/* ---- dropdown blanks inside any HTML.  {{a|*b|c}} makes a dropdown; the option starting with * is correct.  A "Check" button scores the whole group at once. */
L.cloze=(host,id,html,o)=>{o=o||{};let n=0;const keys=[];
 const body=html.replace(/\{\{([^}]+)\}\}/g,(m,s)=>{const parts=s.split("|"),i=n++;let ci=0;const opts=parts.map((p,j)=>{if(p[0]==="*"){ci=j;return p.slice(1)}return p});keys.push({c:opts[ci]});
  return`<select class="bl" data-i="${i}" aria-label="Choose an answer"><option value="">choose…</option>${opts.map(x=>`<option>${esc(x)}</option>`).join("")}</select>`});
 L.reg(id,o.q||"Complete the statement.",keys.map(k=>k.c).join(" | "),false);
 const w=document.createElement("div");w.className="q cz";w.innerHTML=`${o.pre||""}<div class="czb">${body}</div><div class="czr"><button type="button" class="pbtn sm">Check</button><span class="fb" aria-live="polite"></span></div>`;
 host.appendChild(w);const ss=[...w.querySelectorAll("select.bl")],btn=w.querySelector("button"),fb=w.querySelector(".fb"),st=D.mc[id];
 const vals=()=>D.data["cz:"+id]||(D.data["cz:"+id]=[]);
 vals().forEach((v,i)=>{if(ss[i]&&v)ss[i].value=v});
 const lock=()=>{ss.forEach((s,i)=>{s.disabled=true;s.classList.add("ok")});btn.hidden=true;fb.className="fb good";fb.textContent="✓ Correct"+(st.w?" (after "+(st.w+1)+" tries)":" on the first try")};
 if(st.d)lock();
 ss.forEach((s,i)=>s.onchange=()=>{vals()[i]=s.value;s.classList.remove("no");L.save()});
 btn.onclick=()=>{if(ss.some(s=>!s.value)){fb.className="fb bad";fb.textContent="Choose an answer in every box first.";return}
  let all=1;ss.forEach((s,i)=>{const ok=s.value===keys[i].c;if(!ok)all=0;s.classList.toggle("no",!ok)});
  if(all){st.d=1;lock();L.save();if(o.onRight)o.onRight()}else{st.w++;fb.className="fb bad";fb.textContent=(o.hint?o.hint+" ":"")+"At least one box is not right. Look at the red ones and try again.";L.save()}};
 return w};

/* ---- written answer (typed or Apple Pencil Scribble; pasting is blocked) */
L.write=(host,key,prompt,rows)=>{const w=document.createElement("div");w.className="q wq";
 w.innerHTML=`<p>${prompt}</p><textarea rows="${rows||4}" aria-label="Your written answer"></textarea><div class="note">Type, or write with your Apple Pencil. Pasting is turned off. Your answer saves automatically.</div>`;
 L.items.push({part:L.part,t:"w",id:key});host.appendChild(w);D.pr[key]=strip(prompt);const t=w.querySelector("textarea");t.value=D.ans[key]||"";
 if(B()&&B().noPaste)B().noPaste(t,()=>{w.querySelector(".note").textContent="Pasting is turned off. Please type or handwrite your own words."});
 t.addEventListener("input",()=>{D.ans[key]=t.value;L.save()});t.addEventListener("blur",L.saveNow);return t};

/* ---- data table. cols: {h, k, t:"num"|"sel"|"state"|"calc"|"txt", o:[...]} ; rows: {label, set:{T:0}} ; opts.sim = iframe getter */
L.table=(host,tid,cols,rows,o)=>{o=o||{};const w=document.createElement("div");w.className="tblw";
 L.items.push({part:L.part,t:"tbl",tid,cols,rows,first:o.first||"Setting"});
 const val=(r,k)=>D.data[tid+":"+r+":"+k]||"";
 let h=`<table class="dt"><thead><tr><th>${esc(o.first||"Setting")}</th>${cols.map(c=>`<th>${c.h}</th>`).join("")}${o.copy?"<th></th>":""}</tr></thead><tbody>`;
 rows.forEach((r,ri)=>{h+=`<tr data-r="${ri}"><th scope="row">${r.label}</th>`+cols.map(c=>{const k=c.k,v=val(ri,k);
  if(c.t==="sel")return`<td><select data-k="${k}"><option value="">–</option>${c.o.map(x=>`<option${x===v?" selected":""}>${esc(x)}</option>`).join("")}</select></td>`;
  if(c.t==="state")return`<td><select data-k="${k}"><option value="">state…</option>${["Active","Slowed (cold)","Partly denatured","Denatured"].map(x=>`<option${x===v?" selected":""}>${x}</option>`).join("")}</select> <input type="number" inputmode="decimal" data-k="${k}p" value="${esc(val(ri,k+"p"))}" placeholder="%" aria-label="Activity percent" style="width:64px"></td>`;
  if(c.t==="calc")return`<td><input type="number" inputmode="decimal" step="any" data-k="${k}" value="${esc(v)}" placeholder="?"> <span class="chk" data-c="${k}"></span></td>`;
  return`<td><input type="${c.t==="num"?"number":"text"}" ${c.t==="num"?'inputmode="decimal" step="any"':""} data-k="${k}" value="${esc(v)}" ${c.t==="num"?'style="width:84px"':""}></td>`}).join("")+(o.copy?`<td><button type="button" class="cp" title="Read the numbers from the simulator">⇣ Copy from simulator</button></td>`:"")+"</tr>"});
 w.innerHTML=h+"</tbody></table>";host.appendChild(w);
 const calc=ri=>cols.forEach(c=>{if(c.t!=="calc")return;const tr=w.querySelector(`tr[data-r="${ri}"]`),ex=c.f(k=>parseFloat(D.data[tid+":"+ri+":"+k]),rows[ri]),inp=tr.querySelector(`[data-k="${c.k}"]`),sp=tr.querySelector(`[data-c="${c.k}"]`),got=parseFloat(inp.value);
  sp.textContent="";sp.className="chk";if(isFinite(ex)&&isFinite(got)){const ok=Math.abs(got-ex)<=Math.max(.15,Math.abs(ex)*.08);sp.textContent=ok?"✓":"✗ check";sp.className="chk "+(ok?"ok":"no")}});
 const set=(ri,k,v)=>{D.data[tid+":"+ri+":"+k]=v;const e=w.querySelector(`tr[data-r="${ri}"] [data-k="${k}"]`);if(e)e.value=v};
 w.addEventListener("input",e=>{const t=e.target,tr=t.closest("tr");if(!tr||!t.dataset.k)return;D.data[tid+":"+tr.dataset.r+":"+t.dataset.k]=t.value;calc(+tr.dataset.r);L.save()});
 w.addEventListener("change",e=>{const t=e.target,tr=t.closest("tr");if(!tr||!t.dataset.k)return;D.data[tid+":"+tr.dataset.r+":"+t.dataset.k]=t.value;L.save()});
 rows.forEach((r,i)=>calc(i));
 if(o.copy)w.querySelectorAll(".cp").forEach(b=>b.onclick=()=>{const ri=+b.closest("tr").dataset.r,r=rows[ri],sim=L.sim();
  if(!sim){L.flash("The simulator is still loading. Try again in a moment.");return}
  const P=sim.win.__sim.P,bad=Object.keys(r.set||{}).filter(k=>Math.abs(P[k]-r.set[k])>.05);
  if(bad.length){const nm={T:"Temperature",pH:"pH",S:"Substrate concentration",E:"Enzyme concentration"};L.flash("The simulator is not set for this row yet. Set "+nm[bad[0]]+" to "+r.set[bad[0]]+" first.");return}
  const doc=sim.doc,rate=parseFloat(doc.getElementById("rate").textContent);
  if(!isFinite(rate)){L.flash("The simulator is still collecting data. Wait for a number in the Reaction rate box.");return}
  if(!/\u2713/.test(doc.getElementById("rs").textContent)&&!confirm("The Reading badge does not say Stable yet, so this number may change. Copy it anyway?"))return;
  cols.forEach(c=>{if(c.sim==="rate")set(ri,c.k,String(rate));if(c.sim==="busy")set(ri,c.k,String(sim.win.__sim.busy()));
   if(c.t==="state"){const s=doc.getElementById("st").textContent.trim(),a=parseFloat(doc.getElementById("actv").textContent),m=/^Active/.test(s)?"Active":/^Slowed/.test(s)?"Slowed (cold)":/^Partly/.test(s)?"Partly denatured":"Denatured";set(ri,c.k,m);set(ri,c.k+"p",String(isFinite(a)?a:""))}});
  rows.forEach((x,i)=>calc(i));L.save()});
 return w};
/* the simulator iframe on this page (same site, so we can read its numbers) */
L.sim=()=>{const f=document.getElementById("simf");try{const win=f&&f.contentWindow;if(win&&win.__sim)return{win,doc:win.document}}catch(e){}return null};

/* ---- capture the simulator's graph into the PDF */
L.captureBtn=(host,key,label,label2)=>{L.items.push({part:L.part,t:"img",key,cap:label2||"My graph"});const w=document.createElement("div");w.className="capw";
 w.innerHTML=`<button type="button" class="pbtn ghost sm">📷 Capture my graph</button> <span class="note">${label||"Click Record result in the simulator for each trial first. Then capture the Variable view graph for your PDF."}</span><div class="capv"></div>`;host.appendChild(w);
 const v=w.querySelector(".capv"),show=()=>{const c=B()&&B().load("img:eial:"+key);v.innerHTML=c&&c.d?`<img alt="Your captured graph" src="${c.d}">`:""};show();
 w.querySelector("button").onclick=()=>{const s=L.sim();if(!s){L.flash("The simulator is still loading.");return}
  try{const g=s.doc.getElementById("g"),r=s.doc.getElementById("tb"),c=document.createElement("canvas");c.width=g.width;c.height=g.height;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(g,0,0);
   if(B())B().save("img:eial:"+key,{d:c.toDataURL("image/jpeg",.82),w:c.width,h:c.height});D.cap[key]=1;L.save();show();L.flash("Graph captured. It will appear in your PDF.")}catch(e){L.flash("Could not capture the graph: "+e.message)}};
 return w};
L.img=k=>{const d=B()&&B().load("img:eial:"+k);return d?d:null};
/* SVG string -> small JPEG saved for the PDF */
L.capture=(key,svg,w,h)=>new Promise(res=>{try{const im=new Image();im.onload=()=>{const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);if(B())B().save("img:eial:"+key,{d:c.toDataURL("image/jpeg",.85),w,h});res(1)};im.onerror=()=>res(0);im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)}catch(e){res(0)}});

/* ---- molecule pictures (SVG strings) */
const O='<circle r="10" fill="#e23b3b" stroke="#8f1414" stroke-width="1.5"/>',Hh='<circle r="6" fill="#fff" stroke="#8796a5" stroke-width="1.5"/>';
const at=(x,y,s)=>`<g transform="translate(${x},${y})">${s}</g>`;
const bd=(a,b,c,d)=>`<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="#5b6775" stroke-width="4" stroke-linecap="round"/>`;
L.mol=(k,w)=>{w=w||64;let s;
 if(k==="h2o2")s=bd(26,34,46,34)+bd(26,34,16,18)+bd(46,34,56,50)+at(26,34,O)+at(46,34,O)+at(16,18,Hh)+at(56,50,Hh);
 else if(k==="h2o")s=bd(36,34,22,18)+bd(36,34,50,18)+at(36,34,O)+at(22,18,Hh)+at(50,18,Hh);
 else s=bd(24,30,48,30)+bd(24,40,48,40)+at(24,35,O)+at(48,35,O);
 return`<svg viewBox="0 0 72 70" width="${w}" height="${Math.round(w*70/72)}" role="img" aria-label="${k}">${s}</svg>`};
L.molName={h2o2:"H₂O₂",h2o:"H₂O",o2:"O₂"};

/* ---- catalase pictures on a canvas */
L.enzymeCanvas=(d,size)=>{const c=document.createElement("canvas"),r=Math.min(window.devicePixelRatio||1,2),s=size||210;c.width=c.height=s*r;c.style.width=c.style.height=s+"px";c.style.touchAction="manipulation";
 const x=c.getContext("2d");x.setTransform(r,0,0,r,0,0);
 const draw=()=>{x.clearRect(0,0,s,s);L.drawE(x,s/2,s/2,0,s/175,d,1,1.7,1.7,false,0,0)};draw();return c};
})();
