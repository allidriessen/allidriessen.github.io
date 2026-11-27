/* Enzymatic Reactions Virtual Lab: worksheet widgets (choices, dropdown blanks, data tables, writing boxes, pictures).
   Everything is saved in this browser (BVL.save) and printed to the PDF. Needs /assets/bvl.js first. */
(function(){
const K="ch",B=()=>window.BVL;
const D=window.LAB_D={mc:{},ans:{},data:{},cap:{},pr:{},sig:"",done:{},order:[]};
const L=window.LAB={D,K,items:[],part:""};
L.load=()=>{const d=B()&&B().load(K);if(d){["mc","ans","data","cap","pr","done"].forEach(k=>D[k]=d[k]||{});D.order=d.order||[];D.sig=d.sig||""}};
let tm;L.save=()=>{if(!B())return;clearTimeout(tm);tm=setTimeout(L.saveNow,250)};
L.saveNow=()=>{if(!B())return;const sc=Object.values(D.mc).filter(q=>!q.pred),n=sc.filter(q=>q.d).length,w=Object.values(D.ans).filter(v=>v&&v.trim()).length;
 B().save(K,{title:"Cellular Homeostasis & Membrane Transport",summary:n+" of "+sc.length+" questions answered, "+w+" written answers",mc:D.mc,ans:D.ans,data:D.data,cap:D.cap,pr:D.pr,done:D.done,order:D.order,sig:D.sig})};
addEventListener("pagehide",()=>L.saveNow());document.addEventListener("visibilitychange",()=>{if(document.hidden)L.saveNow()});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
L.esc=esc;
const strip=t=>String(t||"").replace(/<[^>]+>/g,"");
L.strip=strip;
/* text that is safe for the PDF's plain fonts */
L.pt=t=>strip(t).replace(/[₀-₉]/g,c=>String.fromCharCode(c.charCodeAt(0)-8272)).replace(/→/g,"->").replace(/≤/g,"<=").replace(/≥/g,">=").replace(/✓/g,"").replace(/[★☆]/g,"*");
L.flash=t=>{let e=document.getElementById("toast");if(!e){e=document.createElement("div");e.id="toast";e.className="toast";document.body.appendChild(e)}e.textContent=t;e.hidden=false;clearTimeout(L.flash.t);L.flash.t=setTimeout(()=>e.hidden=true,3200)};
const ord=(t,id)=>{if(!D.order.some(o=>o.id===id))D.order.push({t,id,part:L.part})};
L.reg=(id,q,a,pred)=>{ord("mc",id);if(!L.items.some(x=>x.id===id&&x.t==="mc"))L.items.push({part:L.part,t:"mc",id});if(!D.mc[id])D.mc[id]={q:strip(q),a:strip(a),w:0,d:0,pred:pred?1:0,pick:""};else{D.mc[id].q=strip(q);D.mc[id].a=strip(a);D.mc[id].pred=pred?1:0}};
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
 ord("w",key);host.appendChild(w);D.pr[key]=strip(prompt);const t=w.querySelector("textarea");t.value=D.ans[key]||"";
 if(B()&&B().noPaste)B().noPaste(t,()=>{w.querySelector(".note").textContent="Pasting is turned off. Please type or handwrite your own words."});
 t.addEventListener("input",()=>{D.ans[key]=t.value;L.save()});t.addEventListener("blur",L.saveNow);return t};

/* save a canvas as a white-background JPEG for the PDF */
L.shot=(key,cv,cap)=>{try{const t=document.createElement("canvas");t.width=cv.width;t.height=cv.height;const x=t.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,t.width,t.height);x.drawImage(cv,0,0);
 const sc=Math.min(1,900/t.width),o=document.createElement("canvas");o.width=Math.round(t.width*sc);o.height=Math.round(t.height*sc);o.getContext("2d").drawImage(t,0,0,o.width,o.height);
 if(B())B().save("img:ch:"+key,{d:o.toDataURL("image/jpeg",.85),w:o.width,h:o.height,cap:cap||""});D.cap[key]=1;L.save();return true}catch(e){return false}};
/* mark a part finished (sequential unlock on the main page) */
L.finish=p=>{D.done[p]=1;L.saveNow()};
/* ---- drag-and-drop ordering: cards[i] belongs in zones[i]. Drag, or tap a card then tap a box. */
L.dnd=(host,id,prompt,zones,cards,o)=>{o=o||{};const names=o.names||cards.map((c,i)=>"card "+(i+1));
 L.reg(id,prompt,zones.map((z,i)=>z+": "+names[i]).join("; "),false);const st=D.mc[id],key="dnd:"+id;
 let S=D.data[key];if(!S){const ord=cards.map((c,i)=>i);for(let i=ord.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ord[i],ord[j]]=[ord[j],ord[i]]}if(ord.every((v,i)=>v===i))ord.push(ord.shift());S=D.data[key]={z:zones.map(()=>-1),ord}}
 const w=document.createElement("div");w.className="q dnd";
 w.innerHTML=`<p>${prompt}</p><div class="dz">${zones.map((z,i)=>`${i?'<div class="dar" aria-hidden="true">\u2192</div>':""}<div class="zbox" data-z="${i}"><div class="zlab">${z}</div><div class="zcard"></div></div>`).join("")}</div><div class="dtray" aria-label="Diagrams to place"></div><div class="czr"><button type="button" class="pbtn sm dchk">Check</button><button type="button" class="pbtn ghost sm drst">Start over</button><span class="fb" aria-live="polite"></span></div>`;
 host.appendChild(w);const fb=w.querySelector(".fb"),tray=w.querySelector(".dtray"),chk=w.querySelector(".dchk"),rst=w.querySelector(".drst");let sel=-1;
 const card=c=>`<button type="button" class="dcard" data-c="${c}" aria-label="Diagram ${c+1}">${cards[c]}</button>`;
 const draw=()=>{const placed=S.z.filter(v=>v>=0);tray.innerHTML=S.ord.filter(c=>!placed.includes(c)).map(card).join("");
  w.querySelectorAll(".zbox").forEach((b,i)=>{b.querySelector(".zcard").innerHTML=S.z[i]>=0?card(S.z[i]):"";b.classList.toggle("tgt",sel>=0);b.classList.toggle("okz",!!st.d)});
  w.querySelectorAll(".dcard").forEach(b=>b.classList.toggle("sel",+b.dataset.c===sel));
  if(st.d){tray.hidden=true;chk.hidden=true;rst.hidden=true;fb.className="fb good";fb.textContent="\u2713 Correct"+(st.w?" (after "+(st.w+1)+" tries)":" on the first try")}};
 const put=(z,c)=>{if(st.d)return;const from=S.z.indexOf(c),old=S.z[z];if(from>=0)S.z[from]=old>=0?old:-1;S.z[z]=c;sel=-1;fb.textContent="";draw();L.save()};
 let g=null,sx,sy,mv=0,cc=-1;
 w.addEventListener("pointerdown",e=>{const b=e.target.closest(".dcard");if(!b||st.d)return;cc=+b.dataset.c;sx=e.clientX;sy=e.clientY;mv=0;g=document.createElement("div");g.className="dragg";g.style.width="150px";g.innerHTML=cards[cc];g.style.display="none";document.body.appendChild(g)});
 addEventListener("pointermove",e=>{if(!g)return;if(Math.hypot(e.clientX-sx,e.clientY-sy)>8)mv=1;if(mv){g.style.display="block";g.style.left=e.clientX-75+"px";g.style.top=e.clientY-30+"px"}});
 const end=e=>{if(!g)return;g.remove();g=null;const c=cc;cc=-1;
  if(!mv){const inZone=S.z.indexOf(c);if(inZone>=0){S.z[inZone]=-1;sel=-1;draw();L.save()}else{sel=sel===c?-1:c;draw()}return}
  const t=document.elementFromPoint(e.clientX,e.clientY),z=t&&t.closest&&t.closest(".zbox");if(z&&w.contains(z))put(+z.dataset.z,c);else if(S.z.includes(c)){S.z[S.z.indexOf(c)]=-1;draw();L.save()}};
 addEventListener("pointerup",end);addEventListener("pointercancel",()=>{if(g){g.remove();g=null}});
 w.addEventListener("click",e=>{const z=e.target.closest(".zbox");if(z&&sel>=0&&!e.target.closest(".dcard"))put(+z.dataset.z,sel)});
 rst.onclick=()=>{if(st.d)return;S.z=zones.map(()=>-1);sel=-1;fb.textContent="";draw();L.save()};
 chk.onclick=()=>{if(st.d)return;if(S.z.some(v=>v<0)){fb.className="fb bad";fb.textContent="Put a diagram in every box first.";return}
  const bad=S.z.map((v,i)=>v!==i);if(!bad.some(Boolean)){st.d=1;st.pick="ok";draw();L.save();return}
  st.w++;L.save();fb.className="fb bad";fb.textContent="Not quite. The wrong ones went back to the tray. Look again.";
  bad.forEach((b,i)=>{if(b)S.z[i]=-1});draw()};
 draw();return w};
})();
