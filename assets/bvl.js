/* Biology Virtual Labs shared code: sign-in, local saving, reveal tiles, backup tools.
   All data stays in this browser's localStorage. Nothing is uploaded anywhere. */
(function(){
const ROOT="/",P="bvl:"; /* the site lives at the root of allidriessen.github.io, so links start with "/" */
const B=window.BVL={root:ROOT,cfg:window.BVL_CFG||{teacherCode:"teacher"}};
const get=k=>{try{return JSON.parse(localStorage.getItem(P+k))}catch(e){return null}};
const set=(k,v)=>{try{localStorage.setItem(P+k,JSON.stringify(v));return true}catch(e){return false}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const $=(r,s)=>r.querySelector(s);
B.cfg.sheetUrl=B.cfg.sheetUrl||"https://docs.google.com/spreadsheets/d/e/2PACX-1vRGoDKJrgFC0DdbtCc21l52gNYcXwonDIJwHQYxC_IvpXx9j5Y9Kzo1zUhP8CPOOwwqX5mFFDosfTKh/pub?output=csv";
B.cfg.teachers=B.cfg.teachers||["Ms. Driessen","Ms. Bennett"];B.cfg.periods=B.cfg.periods||7;
B.preview=(new URLSearchParams(location.search).get("preview")||"\0")===B.cfg.teacherCode;
try{if(B.preview)sessionStorage.setItem("bvl:preview","1");else if(sessionStorage.getItem("bvl:preview"))B.preview=true}catch(e){}
/* ---- accounts ---- */
const norm=(f,l)=>(f.trim()+" "+l.trim()).toLowerCase().replace(/\s+/g," ");
async function hash(s){try{const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("bvl|"+s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}catch(e){let h=5381;for(const c of s)h=((h<<5)+h+c.charCodeAt(0))|0;return"x"+h}}
B.user=()=>get("current");
B.users=()=>get("users")||{};
B.signIn=async(f,l,pin,ex)=>{
 if(!f.trim()||!l.trim())return{err:"Please enter your first and last name."};
 if(!/^\d{4}$/.test(pin))return{err:"Your PIN must be exactly 4 numbers."};
 const id=norm(f,l),us=B.users(),h=await hash(id+"|"+pin);
 if(us[id]){if(us[id].h!==h)return{err:"That PIN does not match this name.",forgot:1}}
 else{if(!ex||!ex.teacher||!ex.period)return{err:"New here? Please choose your teacher and class period."};us[id]={name:f.trim()+" "+l.trim(),h,c:Date.now(),teacher:ex.teacher,period:ex.period};if(!set("users",us))return{err:"This browser is blocking saving (private browsing?)."}}
 if(ex&&ex.teacher&&ex.period&&!us[id].teacher){us[id].teacher=ex.teacher;us[id].period=ex.period;set("users",us)}
 set("current",{id,name:us[id].name});return{ok:1}};
B.resetPin=async(f,l,pin,code)=>{
 if(code!==B.cfg.teacherCode)return{err:"Teacher code is incorrect."};
 if(!/^\d{4}$/.test(pin))return{err:"The new PIN must be exactly 4 numbers."};
 const id=norm(f,l),us=B.users();if(!us[id])return{err:"No saved profile with that name on this device."};
 us[id].h=await hash(id+"|"+pin);set("users",us);set("current",{id,name:us[id].name});return{ok:1}};
B.profile=()=>{const u=B.user();if(!u)return null;const x=B.users()[u.id]||{};return{name:u.name,id:u.id,teacher:x.teacher||"",period:x.period||""}};
B.setProfile=(t,p)=>{const u=B.user();if(!u)return;const us=B.users();if(us[u.id]){us[u.id].teacher=t;us[u.id].period=p;set("users",us)}};
B.seed=salt=>{const u=B.user(),s=(u?u.id:"guest")+"|"+salt;let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0)%100000};
B.pasteCount=()=>{const u=B.user();return u?(get("pb:"+u.id)||0):0};
/* block pasting, dropping, and large one-shot insertions (e.g. AI writing tools) in answer boxes */
B.noPaste=(el,onBlock)=>{let last=el.value;const hit=()=>{const u=B.user();if(u)set("pb:"+u.id,(get("pb:"+u.id)||0)+1);onBlock&&onBlock()};
 ["paste","drop"].forEach(ev=>el.addEventListener(ev,e=>{e.preventDefault();hit()}));
 el.addEventListener("beforeinput",e=>{const t=e.inputType||"",d=(e.data||"")+((e.dataTransfer&&e.dataTransfer.getData("text/plain"))||"");if(/FromPaste|FromDrop|FromYank/.test(t)||d.length>60){e.preventDefault();hit()}});
 el.addEventListener("input",()=>{if(el.value.length-last.length>60){el.value=last;hit()}else last=el.value});
 el.setAttribute("autocomplete","off");el.setAttribute("data-gramm","false")};
/* signature box: finger or Apple Pencil. Returns {empty(),data()} where data() is a JPEG data URL */
B.sigPad=(el,init,onCh)=>{el.innerHTML='<canvas style="width:100%;max-width:520px;height:150px;border:2px dashed #888;border-radius:10px;background:#fff;touch-action:none;display:block" aria-label="Signature box"></canvas><button type="button" class="g" style="margin-top:6px">Clear signature</button>';
 const c=$(el,"canvas"),x=c.getContext("2d");c.width=1040;c.height=300;x.lineWidth=5;x.lineCap="round";x.lineJoin="round";x.strokeStyle="#111";let d=false,ink=!!init,last=null,pen=false;
 if(init){const im=new Image();im.onload=()=>x.drawImage(im,0,0,c.width,c.height);im.src=init}
 const pos=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]};
 c.addEventListener("pointerdown",e=>{if(e.pointerType==="touch"&&pen)return;if(e.pointerType==="pen")pen=true;try{c.setPointerCapture(e.pointerId)}catch(x2){}d=true;last=pos(e);x.beginPath();x.moveTo(last[0],last[1]);x.lineTo(last[0]+.1,last[1]);x.stroke();ink=true;e.preventDefault()});
 c.addEventListener("pointermove",e=>{if(!d)return;const p=pos(e);x.beginPath();x.moveTo(last[0],last[1]);x.lineTo(p[0],p[1]);x.stroke();last=p;e.preventDefault()});
 const end=()=>{if(d){d=false;onCh&&onCh()}};c.addEventListener("pointerup",end);c.addEventListener("pointercancel",end);
 $(el,"button").onclick=()=>{x.clearRect(0,0,c.width,c.height);ink=false;onCh&&onCh()};
 return{empty:()=>!ink,data:()=>{if(!ink)return"";const t=document.createElement("canvas");t.width=c.width;t.height=c.height;const q=t.getContext("2d");q.fillStyle="#fff";q.fillRect(0,0,t.width,t.height);q.drawImage(c,0,0);return t.toDataURL("image/jpeg",.8)}}};
B.signOut=()=>{try{localStorage.removeItem(P+"current")}catch(e){}};
B.load=k=>{const u=B.user();if(!u)return null;const d=get("data:"+u.id);return d&&d[k]||null};
B.save=(k,v)=>{const u=B.user();if(!u)return false;const d=get("data:"+u.id)||{};d[k]={...v,t:Date.now()};return set("data:"+u.id,d)};
/* ---- backup ---- */
B.pack=strip=>{const u=B.user();if(!u)return null;const us=B.users()[u.id]||{},d=get("data:"+u.id)||{};if(strip)Object.keys(d).forEach(k=>{if(k.startsWith("img:"))delete d[k]});return{v:1,id:u.id,name:u.name,h:us.h,teacher:us.teacher,period:us.period,data:d}};
B.unpack=o=>{if(!o||o.v!==1||!o.id||!o.h)return false;const us=B.users();if(!us[o.id])us[o.id]={name:o.name,h:o.h,c:Date.now(),teacher:o.teacher,period:o.period};set("users",us);
 const cur=get("data:"+o.id)||{};Object.keys(o.data||{}).forEach(k=>{if(!cur[k]||(o.data[k].t||0)>(cur[k].t||0))cur[k]=o.data[k]});
 set("data:"+o.id,cur);set("current",{id:o.id,name:us[o.id].name});return true};
B.code=()=>"LB1."+btoa(unescape(encodeURIComponent(JSON.stringify(B.pack(1))))).replace(/\+/g,"-").replace(/\//g,"_");
B.decode=c=>{try{return JSON.parse(decodeURIComponent(escape(atob(c.trim().replace(/^LB1\./,"").replace(/-/g,"+").replace(/_/g,"/")))))}catch(e){return null}};
B.report=()=>{const p=B.pack();if(!p)return"";return`Biology Virtual Labs: progress summary\nStudent: ${p.name}\nDate: ${new Date().toLocaleString()}\n\n`+Object.keys(p.data).filter(k=>!k.startsWith('img:')).map(k=>`• ${p.data[k].title||k}: ${p.data[k].summary||""}`).join("\n")};
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
.bvl-box select{font:inherit;padding:10px;border:2px solid #ddd0ee;border-radius:10px;min-height:44px;background:#fff;color:#241a38}
.bvl-msg{min-height:22px;font-weight:600;margin-top:6px}.bvl-msg.e{color:#c0392b}.bvl-msg.k{color:#14803f}
[hidden]{display:none!important}
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
 const u=B.user();d.innerHTML=u?`<a href="${ROOT}home.html">Home</a> Signed in: ${esc(u.name)} <a href="${ROOT}my-work.html">My work</a> <button id="bvlso">Sign out</button>`:`<a href="${ROOT}home.html">Home</a> Not signed in <a href="${ROOT}home.html">Sign in to save</a>`;
 const so=$(d,"#bvlso");if(so)so.onclick=()=>{B.signOut();location.reload()}};
/* ---- sign-in form ---- */
const topts=()=>'<option value="">Teacher…</option>'+B.cfg.teachers.map(t=>`<option>${esc(t)}</option>`).join("");
const popts=()=>'<option value="">Period…</option>'+Array.from({length:B.cfg.periods},(_,i)=>`<option>${i+1}</option>`).join("");
B.mountSignIn=(el,done)=>{const u=B.user();
 if(u){const p=B.profile();el.innerHTML=`<div class="bvl-box"><h3>Welcome back, ${esc(u.name.split(" ")[0])}!</h3><p class="bvl-s">Your progress is saving on this device. <a href="${ROOT}my-work.html">My work</a> · <button class="g" id="so">Sign out</button></p>
 <details ${p.teacher&&p.period?"":"open"}><summary><b>Profile settings:</b> <span id="ps0">${esc(p.teacher||"no teacher chosen")}, period ${esc(p.period||"?")}</span></summary><div class="bvl-fields"><select id="pt" aria-label="Teacher">${topts()}</select><select id="pp" aria-label="Class period">${popts()}</select><button id="ps">Save</button></div><div class="bvl-msg" id="pm" aria-live="polite"></div></details></div>`;
  $(el,"#pt").value=p.teacher;$(el,"#pp").value=p.period;
  $(el,"#ps").onclick=()=>{const t=$(el,"#pt").value,pe=$(el,"#pp").value,m=$(el,"#pm");if(!t||!pe){m.textContent="Please choose a teacher and a period.";m.className="bvl-msg e";return}B.setProfile(t,pe);m.textContent="Saved!";m.className="bvl-msg k";$(el,"#ps0").textContent=t+", period "+pe};
  $(el,"#so").onclick=()=>{B.signOut();B.bar();B.mountSignIn(el,done)};return}
 el.innerHTML=`<div class="bvl-box"><h3>Sign in to save your progress</h3>
 <p class="bvl-s"><b>How saving works:</b> your name and PIN create a private save file inside this iPad's web browser. Nothing is uploaded to the internet or a cloud, and your teacher cannot see it. Your progress comes back when you reopen this site on the same iPad and browser. If you clear Safari's website data, use private browsing, or switch devices, it will not come with you, so use "Save progress file" at the end of an activity as a backup. Your teacher and class period are printed on your PDF; you can change them later in Profile settings. First time here? Type your name, choose your teacher and period, and make up a 4-number PIN you will remember.</p>
 <div class="bvl-fields"><input type="text" id="bf" placeholder="First name" autocomplete="off" autocapitalize="words"><input type="text" id="bl" placeholder="Last name" autocomplete="off" autocapitalize="words"><input type="password" id="bp" placeholder="4-number PIN" inputmode="numeric" maxlength="4" autocomplete="off"></div>
 <div class="bvl-fields"><select id="bte" aria-label="Teacher">${topts()}</select><select id="bpe" aria-label="Class period">${popts()}</select></div>
 <button id="bgo">Sign in / Create</button> <button class="g" id="bfg" hidden>Forgot PIN?</button>
 <div class="bvl-fields" id="bfx" hidden><input type="password" id="bt" placeholder="Teacher code"><input type="password" id="bn" placeholder="New 4-number PIN" inputmode="numeric" maxlength="4"><button id="brs">Reset PIN</button></div>
 <div class="bvl-msg" id="bm" aria-live="polite"></div></div>`;
 const m=(t,c)=>{const e=$(el,"#bm");e.textContent=t;e.className="bvl-msg "+(c||"")},v=i=>$(el,i).value;
 const fin=r=>{if(r.ok){B.bar();done&&done();B.mountSignIn(el,done)}else{m(r.err,"e");if(r.forgot)$(el,"#bfg").hidden=false}};
 $(el,"#bgo").onclick=async()=>fin(await B.signIn(v("#bf"),v("#bl"),v("#bp"),{teacher:v("#bte"),period:v("#bpe")}));
 $(el,"#bfg").onclick=()=>{$(el,"#bfx").hidden=false};
 $(el,"#brs").onclick=async()=>fin(await B.resetPin(v("#bf"),v("#bl"),v("#bn"),v("#bt")))};
/* ---- save and hand in panel ---- */
B.mountSavePanel=el=>{if(!el)return;const u=B.user();
 if(!u){el.innerHTML=`<div class="bvl-box"><h3>Save your work</h3><p>Sign in on the <a href="${ROOT}home.html">home page</a> so your progress is saved on this iPad.</p></div>`;return}
 const d=get("data:"+u.id)||{},ks=Object.keys(d).filter(k=>!k.startsWith('img:'));
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
/* ---- release schedule: published Google Sheet (CSV). Falls back to the last saved copy, then to dates in units.js ---- */
B.sched=(get("sched")||{}).o||{};B.schedLoaded=false;
function parseCSV(t){const rows=[];let r=[],c="",q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch==='"'){if(t[i+1]==='"'){c+='"';i++}else q=false}else c+=ch}else if(ch==='"')q=true;else if(ch===","){r.push(c);c=""}else if(ch==="\n"||ch==="\r"){if(ch==="\r"&&t[i+1]==="\n")i++;r.push(c);rows.push(r);r=[];c=""}else c+=ch}if(c||r.length){r.push(c);rows.push(r)}return rows}
function pdate(s){s=(s||"").trim();let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return new Date(+m[1],m[2]-1,+m[3]);m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);if(m)return new Date(+m[3],m[1]-1,+m[2]);return null}
function ingest(t){const rows=parseCSV(t).filter(r=>r.some(x=>x.trim()));if(rows.length<2)return null;const h=rows[0].map(x=>x.trim().toLowerCase().replace(/[^a-z]/g,"")),ix=n=>h.indexOf(n),o={};
 if(ix("id")<0)return null;
 rows.slice(1).forEach(r=>{const id=(r[ix("id")]||"").trim().toLowerCase().replace(/^\/+|\/+$/g,"");if(!id)return;const g=n=>(ix(n)<0?"":(r[ix(n)]||"")).trim();o[id]={title:g("title"),desc:g("description"),rel:g("releasedate"),close:g("closedate"),ov:g("override").toLowerCase()}});return o}
let SQ=[],SL=false;
B.loadSchedule=cb=>{if(B.schedLoaded){cb&&cb();return}if(cb)SQ.push(cb);if(SL)return;SL=true;
 const done=()=>{B.schedLoaded=true;SQ.splice(0).forEach(f=>f())},url=B.cfg.sheetUrl;if(!url||!window.fetch)return done();
 const ctl=window.AbortController?new AbortController():null,tm=setTimeout(()=>ctl&&ctl.abort(),4000);
 fetch(url+(url.includes("?")?"&":"?")+"cb="+Math.floor(Date.now()/60000),{cache:"no-store",signal:ctl&&ctl.signal}).then(r=>r.ok?r.text():Promise.reject()).then(t=>{const o=ingest(t);if(o){B.sched=o;set("sched",{t:Date.now(),o})}}).catch(()=>{}).then(()=>{clearTimeout(tm);done()})};
B.row=id=>id?B.sched[String(id).toLowerCase()]:null;
/* an item is open if the sheet says so (override, then release/close dates); items missing from the sheet use it.release from units.js */
B.released=it=>{if(B.preview)return true;const r=B.row(it.id);
 if(r){if(r.ov==="hide")return false;if(r.ov==="open now")return true;const a=pdate(r.rel);if(!a)return false;const b=pdate(r.close),now=new Date();return now>=a&&(!b||now<new Date(b.getFullYear(),b.getMonth(),b.getDate()+1))}
 return !it.release||new Date(it.release+"T00:00:00")<=new Date()};
/* put at the top of a page that should be locked until released */
B.guard=(id,fallback)=>{const chk=()=>{if(B.released({id,release:fallback}))return;document.body.innerHTML='<div style="font-family:\'Open Sans\',system-ui,sans-serif;max-width:560px;margin:90px auto;padding:0 20px"><h1>Not yet discovered</h1><p>This opens later. <a href="/home.html">Back to home</a></p></div>'};chk();B.loadSchedule(chk)};
const BG='<rect width="100" height="100" fill="#fbe6ee"/>';
const TH={
 earth:()=>'<rect width="100" height="100" fill="#cfe9f7"/><circle cx="42" cy="42" r="27" fill="#3b82c4"/><path d="M28 34q8-8 15-1t3 9q-9 5-16 0z" fill="#4caf6a"/><path d="M46 48q9-3 13 4t-6 11q-9-3-7-15z" fill="#4caf6a"/>',
 atoms:()=>BG+[["C",30,30,"#555"],["H",54,28,"#ddd"],["N",63,46,"#3050f8"],["O",50,62,"#e53935"],["P",30,58,"#ff9800"],["S",21,44,"#f2c200"]].map(a=>`<circle cx="${a[1]}" cy="${a[2]}" r="11" fill="${a[3]}"/><text x="${a[1]}" y="${a[2]+4}" text-anchor="middle" font-size="11" font-weight="800" fill="${"HS".includes(a[0])?"#222":"#fff"}">${a[0]}</text>`).join(""),
 cells:(c,s)=>{let o=BG;for(let i=0;i<7;i++){const x=22+((s*37+i*29)%56),y=22+((s*53+i*41)%56),r=8+((s+i*5)%6);o+=`<circle cx="${x}" cy="${y}" r="${r}" fill="#f6c1cf" stroke="#d98aa3"/><circle cx="${x}" cy="${y}" r="${r/2.4}" fill="${c}"/>`}return o},
 dna:()=>BG+'<path d="M32 14C62 26 22 38 52 50S32 70 40 72" fill="none" stroke="#1f7a8c" stroke-width="5"/><path d="M52 14C22 26 62 38 32 50S52 70 44 72" fill="none" stroke="#b5338a" stroke-width="5"/><path d="M36 20h12M30 32h24M36 44h12M31 56h22M38 66h8" stroke="#d99a1e" stroke-width="3"/>',
 protein:()=>BG+[[20,50],[25,38],[35,31],[46,34],[53,44],[49,56],[39,62],[29,58],[31,47],[41,45]].map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="${["#b5338a","#1f7a8c","#d99a1e","#6a46ad","#2f8f6b"][i%5]}" stroke="#fff" stroke-width="1.5"/>`).join(""),
 chromo:()=>BG+'<path d="M24 18L50 64M50 18L24 64" stroke="#b5338a" stroke-width="9" stroke-linecap="round"/><path d="M42 24L60 56M60 24L42 56" stroke="#6a46ad" stroke-width="7" stroke-linecap="round" opacity=".85"/>',
 punnett:()=>BG+[["BB",16,16,"#cfe9f7"],["Bb",42,16,"#f6d8a8"],["Bb",16,42,"#f6d8a8"],["bb",42,42,"#f6c1cf"]].map(a=>`<rect x="${a[1]}" y="${a[2]}" width="25" height="25" fill="${a[3]}" stroke="#6a46ad" stroke-width="2"/><text x="${a[1]+12.5}" y="${a[2]+17}" text-anchor="middle" font-size="12" font-weight="800" fill="#241a38">${a[0]}</text>`).join(""),
 tree:()=>BG+'<path d="M42 70V50M42 50L26 34M42 50L58 34M26 34L18 18M26 34L34 18M58 34L50 18M58 34L66 18" stroke="#2f8f6b" stroke-width="4" fill="none" stroke-linecap="round"/>'+[[18,18],[34,18],[50,18],[66,18]].map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${["#b5338a","#d99a1e","#1f7a8c","#6a46ad"][i]}"/>`).join(""),
 body:()=>BG+'<path d="M42 64C18 48 20 26 33 26c6 0 9 4 9 7 0-3 3-7 9-7 13 0 15 22-9 38z" fill="#d6303f"/><path d="M14 44h14l5-9 7 18 5-9h16" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
};
B.lens=(c,s,t)=>`<div class="lw" aria-hidden="true"><svg class="lin" viewBox="0 0 100 100"><defs><clipPath id="lc${s}"><circle cx="42" cy="42" r="32"/></clipPath></defs><g clip-path="url(#lc${s})">${(TH[t]||TH.cells)(c,s)}</g></svg><svg viewBox="0 0 100 100"><circle cx="42" cy="42" r="32" fill="none" stroke="${c}" stroke-width="6"/><path d="M66 66L92 92" stroke="${c}" stroke-width="10" stroke-linecap="round"/></svg></div>`;
B.tiles=(el,items)=>{const seen=get("seen")||{},fresh=[];
 el.innerHTML=items.map((it,i)=>{const rw=B.row(it.id),ti=(rw&&rw.title)||it.title,ds=(rw&&rw.desc)||it.desc,c=it.color||COLORS[i%COLORS.length],open=B.released(it),k=it.key||("t"+i),isNew=open&&!seen[k];if(isNew)fresh.push(k);
  if(!open)return`<div class="tile locked" style="--c:${c}" aria-label="Not yet discovered">${B.lens(c,i+1,it.theme)}<div class="tt"><b>Not yet discovered</b></div></div>`;
  return`<a class="tile${isNew?" fresh":""}" style="--c:${c}" href="${it.url}">${B.lens(c,i+1,it.theme)}<div class="tt">${it.sub?`<small>${esc(it.sub)}</small>`:""}<b>${esc(ti)}</b>${ds?`<span>${esc(ds)}</span>`:""}</div></a>`}).join("");
 if(fresh.length)setTimeout(()=>{el.querySelectorAll(".fresh").forEach(t=>t.classList.remove("fresh"));fresh.forEach(k=>seen[k]=1);set("seen",seen)},700)};
document.addEventListener("DOMContentLoaded",B.bar);
})();
