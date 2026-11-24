/* Biology Virtual Labs shared code: sign-in, local saving, reveal tiles, backup tools.
   All data stays in this browser's localStorage. Nothing is uploaded anywhere. */
(function(){
const SRC=document.currentScript.src,ROOT=SRC.replace(/assets\/bvl\.js.*$/,""),P="bvl:";
const B=window.BVL={root:ROOT,cfg:window.BVL_CFG||{teacherCode:"teacher"}};
const get=k=>{try{return JSON.parse(localStorage.getItem(P+k))}catch(e){return null}};
const set=(k,v)=>{try{localStorage.setItem(P+k,JSON.stringify(v));return true}catch(e){return false}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const $=(r,s)=>r.querySelector(s);
B.preview=(new URLSearchParams(location.search).get("preview")||"\0")===B.cfg.teacherCode;
/* ---- accounts ---- */
const norm=(f,l)=>(f.trim()+" "+l.trim()).toLowerCase().replace(/\s+/g," ");
async function hash(s){try{const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("bvl|"+s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}catch(e){let h=5381;for(const c of s)h=((h<<5)+h+c.charCodeAt(0))|0;return"x"+h}}
B.user=()=>get("current");
B.users=()=>get("users")||{};
B.signIn=async(f,l,pin)=>{
 if(!f.trim()||!l.trim())return{err:"Please enter your first and last name."};
 if(!/^\d{4}$/.test(pin))return{err:"Your PIN must be exactly 4 numbers."};
 const id=norm(f,l),us=B.users(),h=await hash(id+"|"+pin);
 if(us[id]){if(us[id].h!==h)return{err:"That PIN does not match this name.",forgot:1}}
 else{us[id]={name:f.trim()+" "+l.trim(),h,c:Date.now()};if(!set("users",us))return{err:"This browser is blocking saving (private browsing?)."}}
 set("current",{id,name:us[id].name});return{ok:1}};
B.resetPin=async(f,l,pin,code)=>{
 if(code!==B.cfg.teacherCode)return{err:"Teacher code is incorrect."};
 if(!/^\d{4}$/.test(pin))return{err:"The new PIN must be exactly 4 numbers."};
 const id=norm(f,l),us=B.users();if(!us[id])return{err:"No saved profile with that name on this device."};
 us[id].h=await hash(id+"|"+pin);set("users",us);set("current",{id,name:us[id].name});return{ok:1}};
B.signOut=()=>{try{localStorage.removeItem(P+"current")}catch(e){}};
B.load=k=>{const u=B.user();if(!u)return null;const d=get("data:"+u.id);return d&&d[k]||null};
B.save=(k,v)=>{const u=B.user();if(!u)return false;const d=get("data:"+u.id)||{};d[k]={...v,t:Date.now()};return set("data:"+u.id,d)};
/* ---- backup ---- */
B.pack=()=>{const u=B.user();if(!u)return null;const us=B.users()[u.id]||{};return{v:1,id:u.id,name:u.name,h:us.h,data:get("data:"+u.id)||{}}};
B.unpack=o=>{if(!o||o.v!==1||!o.id||!o.h)return false;const us=B.users();if(!us[o.id])us[o.id]={name:o.name,h:o.h,c:Date.now()};set("users",us);
 const cur=get("data:"+o.id)||{};Object.keys(o.data||{}).forEach(k=>{if(!cur[k]||(o.data[k].t||0)>(cur[k].t||0))cur[k]=o.data[k]});
 set("data:"+o.id,cur);set("current",{id:o.id,name:us[o.id].name});return true};
B.code=()=>"LB1."+btoa(unescape(encodeURIComponent(JSON.stringify(B.pack())))).replace(/\+/g,"-").replace(/\//g,"_");
B.decode=c=>{try{return JSON.parse(decodeURIComponent(escape(atob(c.trim().replace(/^LB1\./,"").replace(/-/g,"+").replace(/_/g,"/")))))}catch(e){return null}};
B.report=()=>{const p=B.pack();if(!p)return"";return`Biology Virtual Labs: progress summary\nStudent: ${p.name}\nDate: ${new Date().toLocaleString()}\n\n`+Object.keys(p.data).map(k=>`• ${p.data[k].title||k}: ${p.data[k].summary||""}`).join("\n")};
/* ---- styles ---- */
const css=document.createElement("style");css.textContent=`
.bvl-bar{position:fixed;top:8px;right:8px;z-index:45;background:rgba(36,26,56,.92);color:#fff;border-radius:999px;padding:5px 12px;font:600 13px 'Open Sans',system-ui,sans-serif;display:flex;gap:8px;align-items:center}
.bvl-bar a,.bvl-bar button{color:#f6c1cf;background:none;border:0;font:inherit;cursor:pointer;text-decoration:underline;padding:4px}
.bvl-box{background:#fff;color:#241a38;border:2px solid #ddd0ee;border-radius:14px;padding:14px 16px;margin:14px 0;font-family:'Open Sans',system-ui,sans-serif;line-height:1.5}
.bvl-box h3{margin:0 0 6px}.bvl-s{font-size:14px;color:#6b5a85}
.bvl-row{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
.bvl-box button,.bvl-btn{font:700 15px 'Open Sans',sans-serif;background:#4b2e83;color:#fff;border:0;border-radius:10px;padding:10px 14px;min-height:44px;cursor:pointer;display:inline-flex;align-items:center}
.bvl-box button.g{background:#fff;color:#4b2e83;border:2px solid #4b2e83}
.bvl-box input[type=text],.bvl-box input[type=password],.bvl-box textarea{font:inherit;padding:10px;border:2px solid #ddd0ee;border-radius:10px;min-height:44px;width:100%;max-width:240px}
.bvl-box textarea{max-width:100%;display:block;margin:6px 0}
.bvl-msg{min-height:22px;font-weight:600;margin-top:6px}.bvl-msg.e{color:#c0392b}.bvl-msg.k{color:#14803f}
.bvl-fields{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}
.tile{position:relative;display:flex;gap:14px;align-items:center;min-height:130px;padding:16px;border-radius:18px;background:var(--card,#fff);border:1px solid var(--line,#e6e0d4);box-shadow:var(--shadow,0 6px 20px rgba(0,0,0,.08));color:inherit;text-decoration:none;transition:transform .18s,border-color .18s}
a.tile:hover,a.tile:focus-visible{transform:translateY(-3px);border-color:var(--c);outline:none}
.tile .tt{display:flex;flex-direction:column;gap:2px;min-width:0}.tile .tt small{font-weight:700;color:var(--c);font-size:13px}.tile .tt b{font-size:18px;line-height:1.25}.tile .tt span{font-size:13px;color:var(--muted,#6a647a)}
.tile.locked{opacity:.8}.tile.locked .tt b{color:var(--muted,#6a647a);font-weight:600;font-size:15px}
.lw{position:relative;width:84px;height:84px;flex:none}.lw svg{position:absolute;inset:0;width:100%;height:100%}
.lw .lin{filter:blur(0);transition:filter 1.8s ease-out}
.tile.locked .lin,.tile.fresh .lin{filter:blur(7px)}
@media(prefers-reduced-motion:reduce){.lw .lin,.tile{transition:none}}`;
document.head.appendChild(css);
/* ---- top bar ---- */
B.bar=()=>{if(window.BVL_NOBAR)return;let d=document.querySelector(".bvl-bar");if(!d){d=document.createElement("div");d.className="bvl-bar";document.body.appendChild(d)}
 const u=B.user();d.innerHTML=u?`Signed in: ${esc(u.name)} <a href="${ROOT}my-work.html">My work</a> <button id="bvlso">Sign out</button>`:`Not signed in <a href="${ROOT}index.html">Sign in to save</a>`;
 const so=$(d,"#bvlso");if(so)so.onclick=()=>{B.signOut();location.reload()}};
/* ---- sign-in form ---- */
B.mountSignIn=(el,done)=>{const u=B.user();
 if(u){el.innerHTML=`<div class="bvl-box"><h3>Welcome back, ${esc(u.name.split(" ")[0])}!</h3><p class="bvl-s">Your progress is saving on this device. <a href="${ROOT}my-work.html">My work</a> · <button class="g" id="so">Sign out</button></p></div>`;$(el,"#so").onclick=()=>{B.signOut();B.bar();B.mountSignIn(el,done)};return}
 el.innerHTML=`<div class="bvl-box"><h3>Sign in to save your progress</h3>
 <p class="bvl-s"><b>How saving works:</b> your name and PIN create a private save file inside this iPad's web browser. Nothing is uploaded to the internet or a cloud, and your teacher cannot see it. Your progress comes back when you reopen this site on the same iPad and browser. If you clear Safari's website data, use private browsing, or switch devices, it will not come with you, so use "Save progress file" at the end of an activity as a backup. First time here? Type a name and make up a 4-number PIN you will remember.</p>
 <div class="bvl-fields"><input type="text" id="bf" placeholder="First name" autocomplete="off" autocapitalize="words"><input type="text" id="bl" placeholder="Last name" autocomplete="off" autocapitalize="words"><input type="password" id="bp" placeholder="4-number PIN" inputmode="numeric" maxlength="4" autocomplete="off"></div>
 <button id="bgo">Sign in / Create</button> <button class="g" id="bfg" hidden>Forgot PIN?</button>
 <div class="bvl-fields" id="bfx" hidden><input type="password" id="bt" placeholder="Teacher code"><input type="password" id="bn" placeholder="New 4-number PIN" inputmode="numeric" maxlength="4"><button id="brs">Reset PIN</button></div>
 <div class="bvl-msg" id="bm" aria-live="polite"></div></div>`;
 const m=(t,c)=>{const e=$(el,"#bm");e.textContent=t;e.className="bvl-msg "+(c||"")},v=i=>$(el,i).value;
 const fin=r=>{if(r.ok){B.bar();done&&done();B.mountSignIn(el,done)}else{m(r.err,"e");if(r.forgot)$(el,"#bfg").hidden=false}};
 $(el,"#bgo").onclick=async()=>fin(await B.signIn(v("#bf"),v("#bl"),v("#bp")));
 $(el,"#bfg").onclick=()=>{$(el,"#bfx").hidden=false};
 $(el,"#brs").onclick=async()=>fin(await B.resetPin(v("#bf"),v("#bl"),v("#bn"),v("#bt")))};
/* ---- save and hand in panel ---- */
B.mountSavePanel=el=>{if(!el)return;const u=B.user();
 if(!u){el.innerHTML=`<div class="bvl-box"><h3>Save your work</h3><p>Sign in on the <a href="${ROOT}index.html">home page</a> so your progress is saved on this iPad.</p></div>`;return}
 const d=get("data:"+u.id)||{},ks=Object.keys(d);
 el.innerHTML=`<div class="bvl-box"><h3>Save and hand in your work</h3><p class="bvl-s">Your progress saves automatically in this browser on this device. It has not been sent to your teacher; your answers go on your worksheet.</p>
 <ul>${ks.map(k=>`<li><b>${esc(d[k].title||k)}</b>: ${esc(d[k].summary||"")}</li>`).join("")||"<li>No saved progress yet.</li>"}</ul>
 <div class="bvl-row"><button data-a="copy">Copy progress summary</button><button data-a="print">Print / save as PDF</button><button data-a="file">Save progress file</button><label class="bvl-btn">Load progress file<input type="file" accept=".json,application/json" hidden></label><button data-a="code">Get resume code</button><button class="g" data-a="reset">Start over</button></div>
 <textarea rows="3" placeholder="Resume code (starts with LB1.): copy it, or paste one here"></textarea><button class="g" data-a="load">Load resume code</button><div class="bvl-msg" aria-live="polite"></div></div>`;
 const m=(t,c)=>{const e=$(el,".bvl-msg");e.textContent=t;e.className="bvl-msg "+(c||"")},ta=$(el,"textarea");
 const A={
  copy(){const t=B.report();(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>m("Copied!","k"),()=>{ta.value=t;ta.select();m("Select and copy the text in the box.","k")})},
  print(){const w=window.open("","_blank");if(!w)return m("Allow pop-ups to print.","e");w.document.write(`<pre style="font:16px system-ui;white-space:pre-wrap">${esc(B.report())}</pre>`);w.document.close();w.print()},
  file(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(B.pack())],{type:"application/json"}));a.download="bio-lab-progress-"+u.id.replace(/\s+/g,"-")+".json";document.body.appendChild(a);a.click();a.remove();m("Progress file saved to your downloads.","k")},
  code(){ta.value=B.code();ta.select();m("Resume code ready. Copy it and keep it somewhere safe.","k")},
  load(){if(B.unpack(B.decode(ta.value)))location.reload();else m("That code could not be read.","e")},
  reset(){if(confirm("Erase all saved progress for "+u.name+" on this device?")){try{localStorage.removeItem(P+"data:"+u.id)}catch(e){}location.reload()}}};
 el.querySelectorAll("[data-a]").forEach(b=>b.onclick=A[b.dataset.a]);
 $(el,"input[type=file]").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{let o=null;try{o=JSON.parse(r.result)}catch(x){}if(B.unpack(o))location.reload();else m("That file could not be read.","e")};r.readAsText(f)}};
/* ---- reveal tiles ---- */
const COLORS=["#1f7a8c","#d99a1e","#b5338a","#6a46ad","#2f8f6b","#c4572b","#3f78b5","#8a4fa8","#b5335a"];
B.released=it=>B.preview||!it.release||new Date(it.release+"T00:00:00")<=new Date();
B.lens=(c,s)=>{let cells="";for(let i=0;i<7;i++){const x=22+((s*37+i*29)%56),y=22+((s*53+i*41)%56),r=8+((s+i*5)%6);cells+=`<circle cx="${x}" cy="${y}" r="${r}" fill="#f6c1cf" stroke="#d98aa3"/><circle cx="${x}" cy="${y}" r="${r/2.4}" fill="${c}"/>`}
 return`<div class="lw"><svg class="lin" viewBox="0 0 100 100"><defs><clipPath id="lc${s}"><circle cx="42" cy="42" r="32"/></clipPath></defs><g clip-path="url(#lc${s})"><rect width="100" height="100" fill="#fbe6ee"/>${cells}</g></svg><svg viewBox="0 0 100 100"><circle cx="42" cy="42" r="32" fill="none" stroke="${c}" stroke-width="6"/><path d="M66 66L92 92" stroke="${c}" stroke-width="10" stroke-linecap="round"/></svg></div>`};
B.tiles=(el,items)=>{const seen=get("seen")||{},fresh=[];
 el.innerHTML=items.map((it,i)=>{const c=it.color||COLORS[i%COLORS.length],open=B.released(it),k=it.key||("t"+i),isNew=open&&!seen[k];if(isNew)fresh.push(k);
  if(!open)return`<div class="tile locked" style="--c:${c}" aria-label="Not yet discovered">${B.lens(c,i+1)}<div class="tt"><b>Not yet discovered</b></div></div>`;
  return`<a class="tile${isNew?" fresh":""}" style="--c:${c}" href="${it.url}">${B.lens(c,i+1)}<div class="tt">${it.sub?`<small>${esc(it.sub)}</small>`:""}<b>${esc(it.title)}</b>${it.desc?`<span>${esc(it.desc)}</span>`:""}</div></a>`}).join("");
 if(fresh.length)setTimeout(()=>{el.querySelectorAll(".fresh").forEach(t=>t.classList.remove("fresh"));fresh.forEach(k=>seen[k]=1);set("seen",seen)},700)};
document.addEventListener("DOMContentLoaded",B.bar);
})();
