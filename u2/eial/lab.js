/* Enzymes in Action Virtual Lab: the lesson content, built from the worksheet. */
(function(){
const L=window.LAB,D=L.D,$=s=>document.querySelector(s),main=$("#lab");
const sub=s=>s;
const H2O2="H₂O₂",H2O="H₂O",O2="O₂";
L.load();
const sec=(id,title,intro)=>{L.part=id;const s=document.createElement("section");s.className="box sec";s.id=id;s.innerHTML=`<h2>${title}</h2>${intro||""}`;main.appendChild(s);return s};
const sh=(host,t)=>{const h=document.createElement("h3");h.className="sh";h.innerHTML=t;host.appendChild(h);return h};
const note=(host,html,cls)=>{const d=document.createElement("div");d.className=cls||"info";d.innerHTML=html;host.appendChild(d);return d};
const iframeAuto=(host,id,src,title,msgKey,h0)=>{const f=document.createElement("iframe");f.id=id;f.src=src;f.title=title;f.setAttribute("scrolling","no");f.style.cssText="width:100%;height:"+(h0||900)+"px;border:0;display:block;background:transparent";host.appendChild(f);
 addEventListener("message",e=>{if(e.origin===location.origin&&e.source===f.contentWindow&&e.data&&e.data[msgKey])f.style.height=e.data[msgKey]+"px"});return f};

/* ============ intro ============ */
const intro=sec("intro","Enzymes in Action: What variables influence enzyme activity?",`
<p>While studying cellular respiration, you learned how cells extract usable energy (ATP) from organic molecules (glucose) to fuel life processes. Unfortunately, high-powered cellular metabolism comes with a cost. As your mitochondria facilitate the many chemical reactions involved in aerobic respiration, they continuously generate toxic byproducts.</p>
<p>Principal among these toxic molecules is hydrogen peroxide, <b>H₂O₂</b>. If hydrogen peroxide accumulates inside a cell, it causes rapid damage to proteins, lipids, and DNA, quickly leading to cell death. To survive, aerobic organisms rely on powerful enzymatic defense systems. <b>Catalase</b> is one of the fastest-reacting enzymes in biological systems, capable of decomposing millions of hydrogen peroxide molecules per second into harmless water (H₂O) and oxygen gas (O₂). Without catalase actively maintaining chemical balance during cellular respiration, aerobic life as we know it could not exist.</p>
<h3>Mission objectives</h3>
<p>In this virtual laboratory, you will step into the role of a cellular biochemist to explore how environmental conditions affect enzyme kinetics. You will manipulate key variables to observe how catalase performance changes under stress and changing environmental conditions. As you collect and analyze your simulation data, keep these key questions in mind:</p>
<ul><li>How does the rate of oxygen gas production reflect the rate of catalase activity?</li><li>What structural changes occur to the catalase enzyme when exposed to extreme environmental conditions, and how does this impact cellular survival?</li></ul>
<p class="note">Everything you need is on this page: the questions, the simulators, and your data tables. Your answers save automatically. At the very bottom you can sign and download a PDF to upload to Schoology.</p>`);

/* ============ PART 1 ============ */
const p1=sec("p1","Part 1 · Meet the Molecules","<p>Use the paragraph above to complete the following prompts.</p>");
sh(p1,"1. Label the 2 atoms involved");
const atomSvg=c=>`<svg viewBox="0 0 40 40" width="46" height="46" aria-hidden="true"><circle cx="20" cy="20" r="16" fill="${c[0]}" stroke="${c[1]}" stroke-width="2.5"/></svg>`;
L.cloze(p1,"q1a",`<div class="mrow">${atomSvg(["#e23b3b","#8f1414"])}<span>The <b>red</b> atom is {{Carbon|Hydrogen|Nitrogen|*Oxygen}}, symbol {{C|H|N|*O}}</span></div><div class="mrow">${atomSvg(["#fff","#8796a5"])}<span>The <b>white</b> atom is {{Carbon|*Hydrogen|Nitrogen|Oxygen}}, symbol {{C|*H|N|O}}</span></div>`,{q:"1. Label the 2 atoms involved (name and symbol)."});
sh(p1,"2–5. Identify each molecule");
note(p1,"Look at the three molecules in the simulator and in the pictures below. Choose the answer for each row.");
const mt=[["h2o2",H2O2,"Substrate","Hydrogen peroxide",2,2],["h2o",H2O,"Product","Water",2,1],["o2",O2,"Product","Oxygen gas",0,2]];
const molOpt={term:["Substrate","Product"],name:["Hydrogen peroxide","Water","Oxygen gas","Carbon dioxide"],f:[H2O2,H2O,O2,"CO₂","HO"]};
const sel=(opts,cor)=>"{{"+opts.map(o=>(o===cor?"*":"")+o).join("|")+"}}";
const cnt=(n)=>"{{"+[0,1,2,3,4].map(v=>(v===n?"*":"")+v).join("|")+"}}";
let tb=`<table class="dt mt"><thead><tr><th></th>${mt.map(m=>`<th>${L.mol(m[0],86)}</th>`).join("")}</tr></thead><tbody>`;
tb+=`<tr><th>2. How many atoms of each type?</th>${mt.map(m=>`<td>H: ${cnt(m[4])}<br>O: ${cnt(m[5])}</td>`).join("")}</tr>`;
tb+=`<tr><th>3. Reaction term</th>${mt.map(m=>`<td>${sel(molOpt.term,m[2])}</td>`).join("")}</tr>`;
tb+=`<tr><th>4. Molecule name</th>${mt.map(m=>`<td>${sel(molOpt.name,m[3])}</td>`).join("")}</tr>`;
tb+=`<tr><th>5. Chemical formula</th>${mt.map(m=>`<td>${sel(molOpt.f,m[1])}</td>`).join("")}</tr></tbody></table>`;
L.cloze(p1,"q2_5",tb,{q:"2–5. Atom counts, reaction term, name, and formula of each molecule.",hint:"Hint: the substrate is the molecule the enzyme works on. Products are made by the reaction."});

sh(p1,"6. Find the active site");
note(p1,"These two icons show <b>catalase enzymes</b> in two forms. <b>Tap the active site</b> on each enzyme (the pocket where the red heme group sits).");
const sites=document.createElement("div");sites.className="sites";p1.appendChild(sites);
[[0,"A"],[1,"B"]].forEach(([d,lab])=>{const w=document.createElement("div");w.className="site";w.innerHTML=`<div class="cvh"></div><div class="fb site-fb" aria-live="polite">Enzyme ${lab}: tap the active site.</div>`;sites.appendChild(w);
 const c=L.enzymeCanvas(d,260);c.style.cursor="pointer";w.querySelector(".cvh").appendChild(c);const id="q6"+lab,fb=w.querySelector(".fb");
 L.reg(id,"6. Tap the active site of enzyme "+lab+".","the pocket with the red heme group",false);const st=D.mc[id],s=260,sc=s/175;
 const target=()=>{const a=d*.55;return[24*Math.cos(a),24*Math.sin(a)]};
 const label=()=>{const x=c.getContext("2d"),r=Math.min(window.devicePixelRatio||1,2),t=target(),tx=s/2+t[0]*sc,ty=s/2+t[1]*sc;x.save();x.setTransform(r,0,0,r,0,0);
  x.strokeStyle="#111";x.fillStyle="#111";x.lineWidth=2.5;x.beginPath();x.moveTo(tx+62,ty-48);x.lineTo(tx+8,ty-6);x.stroke();x.beginPath();x.arc(tx+8,ty-6,4,0,6.3);x.fill();
  x.font="700 15px 'Open Sans',sans-serif";x.textAlign="center";const wd=x.measureText("Active site").width+14;x.fillStyle="#fff";x.strokeStyle="#111";x.lineWidth=1.5;x.beginPath();x.rect(tx+62-wd/2,ty-68,wd,24);x.fill();x.stroke();x.fillStyle="#111";x.fillText("Active site",tx+62,ty-51);x.restore();
  if(L.B){const t=document.createElement("canvas");t.width=c.width;t.height=c.height;const tx=t.getContext("2d");tx.fillStyle="#fff";tx.fillRect(0,0,t.width,t.height);tx.drawImage(c,0,0);L.B.save("img:eial:site"+lab,{d:t.toDataURL("image/jpeg",.85),w:t.width,h:t.height})}};
 const BV=window.BVL;L.B=BV;
 const done=()=>{fb.className="fb good site-fb";fb.textContent="✓ Correct. That is the active site"+(st.w?" (after "+(st.w+1)+" tries)":" on the first try")+"."};
 if(st.d){label();done()}
 c.addEventListener("pointerdown",e=>{if(st.d)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)*s/r.width,y=(e.clientY-r.top)*s/r.height,t=target(),ex=(x-s/2)/sc,ey=(y-s/2)/sc;
  if(Math.hypot(ex-t[0],ey-t[1])<26){st.d=1;label();done();L.save()}else{st.w++;fb.className="fb bad site-fb";fb.textContent="Not quite. The active site is the pocket where the substrate fits, next to the red heme group.";L.save()}e.preventDefault()});
 L.items.push({part:L.part,t:"img",key:"site"+lab,cap:"Enzyme "+lab+" with the active site labeled"})});
L.choice(p1,"q7A","7. Enzyme A is in which form?",["Functional","Denatured"],0,{row:1});
L.choice(p1,"q7B","7. Enzyme B is in which form?",["Functional","Denatured"],1,{row:1,explain:"Its shape has unfolded, so the active site no longer fits the substrate."});

/* ============ PART 2 ============ */
const p2=sec("p2","Part 2 · Build the Reaction","");
sh(p2,"8. Build the equation");
note(p2,`Each catalase reaction breaks hydrogen peroxide into water and oxygen gas. Build the equation as a <b>picture</b> first, then write it with numbers.<br><b>Law of Conservation of Matter:</b> matter cannot be created or destroyed, so both sides must have the <b>same number of each type of atom</b>.<br>How to build: <b>drag</b> a molecule into a box, or <b>tap</b> a molecule and then tap a box. Tap a molecule in a box to remove it. <a href="/u2/ersbe.html" target="_blank" rel="noopener">Need more help? Open the full equation builder ↗</a>`);
(function eq(){
 const st=D.data.eq||(D.data.eq={r:[],p:[]}),host=document.createElement("div");host.className="eqb";
 host.innerHTML=`<div class="tray" id="tray">${["h2o2","h2o","o2"].map(k=>`<button type="button" class="tk" data-k="${k}" aria-label="${L.molName[k]}">${L.mol(k,76)}<span>${L.molName[k]}</span></button>`).join("")}</div>
 <div class="eqrow"><div class="zone" data-z="r"><div class="zl">Reactants (before)</div><div class="zi" id="zr"></div></div>
 <div class="arr"><div class="en">${L.mol("o2",0).slice(0,0)}<svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true"><path d="M22 4c9 0 16 7 16 16 0 8-5 13-10 16l-3 6-5-3c-7-3-11-9-11-17C9 12 14 4 22 4z" fill="#2dd4bf" stroke="#0f766e" stroke-width="2"/><rect x="25" y="14" width="10" height="10" transform="rotate(45 30 19)" fill="#b3263e"/></svg><b>catalase</b></div><div class="ar">→</div></div>
 <div class="zone" data-z="p"><div class="zl">Products (after)</div><div class="zi" id="zp"></div></div></div>
 <div class="atomc" id="atomc"></div><div class="czr"><button type="button" class="pbtn sm" id="eqchk">Check my picture</button><button type="button" class="pbtn ghost sm" id="eqclr">Clear</button><span class="fb" id="eqfb" aria-live="polite"></span></div><div id="eqw"></div>`;
 p2.appendChild(host);L.reg("q8a","8. Build the equation as a picture (balanced, smallest whole numbers).","2 "+H2O2+" → 2 "+H2O+" + 1 "+O2,false);
 const A={h2o2:[2,2],h2o:[2,1],o2:[0,2]},cnt=l=>l.reduce((a,k)=>[a[0]+A[k][0],a[1]+A[k][1]],[0,0]);
 let selK=null;const fb=host.querySelector("#eqfb"),m=D.mc.q8a;
 const draw=()=>{["r","p"].forEach(z=>{host.querySelector("#z"+z).innerHTML=st[z].map((k,i)=>`<button type="button" class="pm" data-z="${z}" data-i="${i}" aria-label="Remove ${L.molName[k]}">${L.mol(k,70)}</button>`).join("")||`<span class="zph">${z==="r"?"Drop the starting molecules here":"Drop the new molecules here"}</span>`});
  const a=cnt(st.r),b=cnt(st.p),ok=a[0]===b[0]&&a[1]===b[1]&&(st.r.length||st.p.length);
  host.querySelector("#atomc").innerHTML=`<b>Atom counter</b> · Before: <span class="ac">H ${a[0]}</span> <span class="ac">O ${a[1]}</span>  →  After: <span class="ac">H ${b[0]}</span> <span class="ac">O ${b[1]}</span>   ${st.r.length||st.p.length?(ok?'<b class="good">✓ atoms match</b>':'<b class="bad">✗ atoms do not match yet</b>'):""}`;
  host.querySelectorAll(".tk").forEach(b=>b.classList.toggle("sel",b.dataset.k===selK));host.querySelectorAll(".zone").forEach(z=>z.classList.toggle("tgt",!!selK))};
 const add=(z,k)=>{if(m.d)return;if(st[z].length>=8){L.flash("That box is full. Tap a molecule to remove it.");return}st[z].push(k);selK=null;fb.textContent="";draw();L.save()};
 host.addEventListener("click",e=>{const pm=e.target.closest(".pm");if(pm){if(m.d)return;st[pm.dataset.z].splice(+pm.dataset.i,1);draw();L.save();return}
  const z=e.target.closest(".zone");if(z&&selK&&!e.target.closest(".tk")){add(z.dataset.z,selK);return}});
 /* drag and tap on the tray */
 host.querySelectorAll(".tk").forEach(b=>{let g=null,sx,sy,mv=0;
  b.addEventListener("pointerdown",e=>{if(m.d)return;sx=e.clientX;sy=e.clientY;mv=0;g=document.createElement("div");g.className="dragg";g.innerHTML=L.mol(b.dataset.k,70);g.style.display="none";document.body.appendChild(g);try{b.setPointerCapture(e.pointerId)}catch(z){}});
  b.addEventListener("pointermove",e=>{if(!g)return;if(Math.hypot(e.clientX-sx,e.clientY-sy)>8)mv=1;if(mv){g.style.display="block";g.style.left=e.clientX-35+"px";g.style.top=e.clientY-35+"px"}});
  const end=e=>{if(!g)return;g.remove();const was=mv;g=null;if(!was){selK=selK===b.dataset.k?null:b.dataset.k;draw();return}
   const t=document.elementFromPoint(e.clientX,e.clientY),z=t&&t.closest&&t.closest(".zone");if(z)add(z.dataset.z,b.dataset.k)};
  b.addEventListener("pointerup",end);b.addEventListener("pointercancel",()=>{if(g){g.remove();g=null}})});
 const snap=()=>{const mk=(l,x0)=>l.map((k,i)=>`<g transform="translate(${x0+i*80},20) scale(1.0)">${L.mol(k,72).replace(/^<svg[^>]*>/,"<svg width='72' height='70' viewBox='0 0 72 70'>")}</g>`).join("");
  const R=st.r,P=st.p,rw=Math.max(R.length,1)*80,pw=Math.max(P.length,1)*80,W=rw+pw+190;
  let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="120" viewBox="0 0 ${W} 120"><rect width="${W}" height="120" fill="#fff"/>`;
  R.forEach((k,i)=>s+=L.mol(k,72).replace("<svg",`<svg x="${10+i*80}" y="25"`));
  s+=`<text x="${rw+20}" y="58" font-family="Arial" font-size="12" font-weight="700" fill="#0f766e">catalase</text><text x="${rw+20}" y="84" font-family="Arial" font-size="34" fill="#111">→</text>`;
  P.forEach((k,i)=>s+=L.mol(k,72).replace("<svg",`<svg x="${rw+130+i*80}" y="25"`));return s+"</svg>"};
 const pic=async()=>{const sv=snap(),mm=sv.match(/width="(\d+)"/);await L.capture("eq",sv,+mm[1],120)};
 const wr=()=>{const w=host.querySelector("#eqw");w.innerHTML="";const q=document.createElement("div");q.className="info";q.innerHTML="<b>Now write the same equation with numbers.</b> Choose how many of each molecule (the coefficient). For one molecule, the number is 1.";w.appendChild(q);
  L.cloze(w,"q8b",`<div class="wr">{{1|*2|3|4}} ${H2O2} <span class="aw">— catalase →</span> {{1|*2|3|4}} ${H2O} + {{*1|2|3|4}} ${O2}</div>`,{q:"8. Written equation with coefficients.",hint:"Hint: use the same numbers as in your picture."});
  L.items.push({part:"p2",t:"img",key:"eq",cap:"My picture equation"})};
 host.querySelector("#eqclr").onclick=()=>{if(m.d)return;st.r=[];st.p=[];selK=null;fb.textContent="";draw();L.save()};
 host.querySelector("#eqchk").onclick=()=>{if(m.d)return;const a=cnt(st.r),b=cnt(st.p);
  if(!st.r.length||!st.p.length){fb.className="fb bad";fb.textContent="Add molecules to both boxes first.";return}
  const good=st.r.length===2&&st.r.every(k=>k==="h2o2")&&st.p.length===3&&st.p.filter(k=>k==="h2o").length===2&&st.p.filter(k=>k==="o2").length===1;
  if(good){m.d=1;fb.className="fb good";fb.textContent="✓ Balanced! 4 H and 4 O on each side"+(m.w?" (after "+(m.w+1)+" tries)":" on the first try")+".";L.save();pic();wr();return}
  m.w++;L.save();fb.className="fb bad";
  if(st.r.some(k=>k!=="h2o2"))fb.textContent="Only hydrogen peroxide goes in the Reactants box. Catalase is the enzyme, so it is not used up.";
  else if(a[0]!==b[0]||a[1]!==b[1])fb.textContent="The atoms do not match. Compare the counts: "+(a[1]!==b[1]?"oxygen":"hydrogen")+" is different on the two sides.";
  else fb.textContent="The atoms match, but can you use the smallest whole numbers?"};
 draw();if(m.d){fb.className="fb good";fb.textContent="✓ Balanced! 4 H and 4 O on each side"+(m.w?" (after "+(m.w+1)+" tries)":" on the first try")+".";wr()}
})();

sh(p2,"9. Watch one enzyme work");
note(p2,"Click the catalase and the hydrogen peroxide molecules in the tool below to step through one full reaction. Use <b>Back</b> to replay a step.");
iframeAuto(p2,"stepf","/u2/ers-steps.html","Catalase at work: step by step","ssH",760);
{const rows=[["3","The first water molecule has left. One oxygen atom is still held on the heme iron."],["1","Catalase and hydrogen peroxide float around separately. Nothing is attached yet."],["4","A second water molecule and an oxygen gas molecule (O₂) have left. Catalase is unchanged."],["2","Hydrogen peroxide fits into the active site next to the heme iron."]];
 const nm=["1 – Approach","2 – Binding","3 – After 1st "+H2O2+" release","4 – After 2nd "+H2O2+" release"];
 L.cloze(p2,"q9",`<div class="info">Match each description to its stage of the reaction.</div>`+rows.map(r=>`<div class="mrow"><span>${r[1]}</span><span>${sel(nm,nm[+r[0]-1])}</span></div>`).join(""),{q:"9. Match each description to its stage."})}
L.choice(p2,"q10","10. After a chemical reaction has concluded, has the enzyme’s structure or shape changed?",["Yes","No"],1,{row:1,explain:"Enzymes are not used up. Catalase looks the same at the end as at the start."});
L.cloze(p2,"q11",`<p>Enzymes that catalyze chemical reactions {{are changed|*are not changed}} by the reaction, which means they {{*are reusable|are not reusable}} and one enzyme can catalyze {{*multiple|only one}} chemical reaction(s).</p>`,{q:"11. Complete the statement about enzymes."});
sh(p2,"12. How many hydrogen peroxide molecules?");
L.choice(p2,"q12a","12. How many hydrogen peroxide molecules are required for each reaction?",["1","2","3","4"],1,{row:1});
L.choice(p2,"q12b","Why?",["Each H₂O₂ has 2 oxygen atoms, and the products need 2 oxygen atoms in H₂O plus 2 in one O₂","Enzymes always work in pairs","Water needs two hydrogen peroxide molecules to dissolve in","Catalase needs two H₂O₂ to stay active"],0,{explain:"Two H₂O₂ give 4 H and 4 O. That makes 2 H₂O (4 H, 2 O) and 1 O₂ (2 O)."});

/* ============ PART 3 ============ */
const p3=sec("p3","Part 3 · Investigation","");
note(p3,"Use the <b>Catalase &amp; H₂O₂ Simulator</b> below for all of Part 3. Set the sliders, wait for the trial to run, then fill in the tables on this page. <a href=\"/u2/eial/sim.html\" target=\"_blank\" rel=\"noopener\">Open the simulator in its own tab ↗</a> (handy for Split View on an iPad).","info");
const simWrap=document.createElement("details");simWrap.open=true;simWrap.className="simd";simWrap.innerHTML="<summary>Simulator (tap to hide or show)</summary>";p3.appendChild(simWrap);
{const f=document.createElement("iframe");f.id="simf";f.src="/u2/eial/sim.html";f.title="Catalase and H2O2 simulator";f.style.cssText="width:100%;height:min(88vh,900px);min-height:560px;border:0;display:block;border-radius:10px;background:#f4f6f8";simWrap.appendChild(f)}
/* 3A-3E tabs, directly under the simulator so students do not have to scroll back up */
const TABS=[["3A","Baseline"],["3B","Temperature"],["3C","pH"],["3D","Substrate"],["3E","Enzyme"]],TB=document.createElement("div");TB.className="tabbar";TB.setAttribute("role","tablist");p3.appendChild(TB);
const TP={};TABS.forEach(([k,n])=>{const b=document.createElement("button");b.type="button";b.className="tabb";b.setAttribute("role","tab");b.innerHTML="<b>"+k+"</b><span>"+n+"</span>";b.dataset.k=k;TB.appendChild(b);
 const pn=document.createElement("div");pn.className="tabp";pn.setAttribute("role","tabpanel");pn.dataset.k=k;pn.hidden=true;p3.appendChild(pn);TP["T"+k]=pn});
const showTab=k=>{TB.querySelectorAll(".tabb").forEach(b=>{const on=b.dataset.k===k;b.classList.toggle("on",on);b.setAttribute("aria-selected",on)});p3.querySelectorAll(".tabp").forEach(x=>x.hidden=x.dataset.k!==k);try{sessionStorage.setItem("eial:tab",k)}catch(e){}};
TB.addEventListener("click",e=>{const b=e.target.closest(".tabb");if(b){showTab(b.dataset.k);TB.scrollIntoView({block:"nearest",behavior:"smooth"})}});
const T3A=TP.T3A,T3B=TP.T3B,T3C=TP.T3C,T3D=TP.T3D,T3E=TP.T3E;
/* 3A */
sh(T3A,"3A · Baseline");
note(T3A,"A <b>baseline</b> is a starting point, initial measurement, or reference standard used to compare future changes, performance, or data.<br><b>Step 1:</b> In the simulator, click <b>Reset to defaults</b>.<br><b>Step 2:</b> Let the simulation run until <b>Trial time 0:30</b>, then click <b>Pause</b>.");
L.table(T3A,"t3a",[{h:H2O2+" used",k:"s",t:"num",sim:"cS"},{h:H2O+" made",k:"w",t:"num"},{h:O2+" released",k:"o",t:"num"}],[{label:"13. Counts at 30 s"}],{first:"Question"});
const g3a=T3A.lastElementChild;
{const b=document.createElement("button");b.type="button";b.className="pbtn ghost sm";b.textContent="⇣ Copy the three counts from the simulator";b.onclick=()=>{const s=L.sim();if(!s){L.flash("The simulator is still loading.");return}
  [["s","cS"],["w","cW"],["o","cO"]].forEach(([k,id])=>{const v=s.doc.getElementById(id).textContent.trim();D.data["t3a:0:"+k]=v;const e=g3a.querySelector(`[data-k="${k}"]`);if(e)e.value=v});L.save()};T3A.appendChild(b)}
L.cloze(T3A,"q14",`<div class="info"><b>14. Calculate the simplest ratio</b> of ${H2O2} used : ${H2O} made : ${O2} released. Choose the numbers.</div><div class="wr">{{1|*2|3|4}} : {{1|*2|3|4}} : {{*1|2|3|4}}</div>`,{q:"14. Simplest ratio of H2O2 used : H2O made : O2 released.",hint:"Hint: divide each count by the smallest one."});
L.choice(T3A,"q15","15. Does this ratio match the chemical reaction equation you built in Part 2?",["Yes","No"],0,{row:1,explain:"The coefficients 2 : 2 : 1 are the ratio of molecules in the reaction."});

/* 3B */
const simNote=(t)=>`<b>SET UP:</b> ${t}`;
sh(T3B,"3B · Temperature");
note(T3B,"<b>GOAL:</b> Investigate the reaction rate at different temperatures and build a graph of enzyme activity.<br><b>Background – molecular motion:</b> all molecules are in constant, random motion, with kinetic energy that scales with temperature. As temperature rises, molecules move faster.");
const arrow=n=>`<svg viewBox="0 0 100 40" width="104" height="42" aria-hidden="true"><circle cx="16" cy="20" r="10" fill="#e23b3b" stroke="#8f1414" stroke-width="1.5"/><line x1="28" y1="20" x2="${28+n*1.25}" y2="20" stroke="#111" stroke-width="3"/><polygon points="${28+n*1.25+9},20 ${28+n*1.25-1},13 ${28+n*1.25-1},27" fill="#111"/></svg>`;
note(T3B,"<b>16.</b> Show how the motion of an oxygen atom is different in <b>cold</b>, <b>moderate</b>, and <b>hot</b> temperatures. Pick the arrow that shows how fast the atom moves.");
[["Cold temperatures",0,"cold"],["Moderate temperatures",1,"moderate"],["Hot temperatures",2,"hot"]].forEach(([t,c,k])=>{const o=[24,46,66].map(arrow);L.choice(T3B,"q16"+k,"16. "+t+": which arrow fits?",o,c,{row:1,cls:"arrows"})});
note(T3B,"<b>17.</b> Temperature, kinetic energy, and molecular motion are a delicate balancing act. If the temperature is too low, molecules may move too slowly for reactions to occur at the necessary rate. If it is too high, atoms and bonds can become unstable and the shape of a molecule can be disrupted. Predict how temperature changes reaction rate.");
L.choice(T3B,"q17a","17. At LOW temperatures, enzymatic chemical reactions would…",["decrease","increase"],null,{pred:1,row:1});
L.choice(T3B,"q17b","17. At HIGH temperatures, enzymatic chemical reactions would…",["decrease","increase"],null,{pred:1,row:1});
L.write(T3B,"w17","17. Explain your reasoning for both predictions (because…).",3);
L.choice(T3B,"q18","18. Based on what you know about the human body, which temperature do you predict will give the highest rate of reaction?",["0 °C","20 °C","40 °C","60 °C"],null,{pred:1,row:1});
note(T3B,simNote("Click <b>Reset to defaults</b>.<br><b>Step 1:</b> Use the <b>Temperature</b> slider for each trial in the table. Leave all other variables at the default setting.<br><b>Step 2:</b> Let the trial run until at least <b>Trial time 0:30</b>. While you wait, fill in the table.<br><b>Step 3:</b> After 30 seconds, click <b>Record result</b> in the simulator. The data point appears in the Variable view graph.<br><b>Step 4:</b> Repeat for all temperatures. (<i>Copy from simulator</i> reads the rate and enzyme state for you, but you still choose the molecule speed yourself.)"));
const TS=[0,20,40,60];
L.table(T3B,"t3b",[{h:"Molecule speed",k:"sp",t:"sel",o:["Slow","Moderate","Fast"]},{h:"Enzyme state &amp; activity (%)",k:"st",t:"state"},{h:"Reaction rate ("+H2O2+" per 10 s)",k:"rate",t:"num",sim:"rate"}],TS.map(t=>({label:t+" °C ("+Math.round(t*9/5+32)+" °F)",set:{T:t}})),{first:"Temp",copy:1});
L.captureBtn(T3B,"g3b","Click <b>Record result</b> in the simulator for each trial, then capture your Variable view graph.","Temperature graph");
const argmax=(tid,n,vals)=>{let best=-1,bi=null;for(let i=0;i<n;i++){const v=parseFloat(D.data[tid+":"+i+":rate"]);if(isFinite(v)&&v>best){best=v;bi=i}}return bi};
L.choice(T3B,"q19","19. At what temperature was the reaction rate the highest in YOUR data?",TS.map(t=>t+" °C"),()=>argmax("t3b",4),{row:1,wait:"Fill in the Reaction rate column of your temperature table first."});
L.choice(T3B,"q20","20. What factors are balanced at this temperature?",["Enough kinetic energy for frequent collisions, and an enzyme that keeps its shape","Low kinetic energy and a denatured enzyme","High kinetic energy and an enzyme that has changed shape","No kinetic energy and an enzyme that keeps its shape"],0);
note(T3B,"<b>Connect it to kinetic energy</b> by completing each flowchart and identifying the main cause of the change in rate.");
L.cloze(T3B,"q21",`<div class="flow"><b>21. COLD (≤ 0 °C)</b><br>KE is ${sel(["low","high"],"low")} → Molecules move ${sel(["slow","fast"],"slow")} → Enzyme–substrate collisions are ${sel(["infrequent","frequent"],"infrequent")} → Reaction rate is ${sel(["low","high"],"low")}<br>Main cause of the change in rate: ${sel(["molecular collisions","enzyme shape"],"molecular collisions")}</div>`,{q:"21. COLD flowchart."});
L.cloze(T3B,"q22",`<div class="flow"><b>22. HOT (≥ 50 °C)</b><br>KE is ${sel(["low","high"],"high")} → Enzyme structure ${sel(["stays the same","unfolds (denatures)"],"unfolds (denatures)")} → Substrates fit ${sel(["decreases","increases"],"decreases")} → Reaction rate is ${sel(["low","high"],"low")}<br>Main cause of the change in rate: ${sel(["molecular collisions","enzyme shape"],"enzyme shape")}</div>`,{q:"22. HOT flowchart."});

/* 3C */
sh(T3C,"3C · pH");
note(T3C,"<b>pH</b> is a measure of how acidic or basic a solution is. The more H⁺ ions a solution contains, the more acidic it is. The more OH⁻ ions, the more basic (alkaline) it is.<br>Enzyme shape is determined by hydrogen bonds between different parts of the molecule. Different enzymes are built to work in different pH environments. Outside its normal range, H⁺ and/or OH⁻ ions can disrupt the enzyme’s internal hydrogen bonds, changing the shape of the enzyme and its active site.");
L.choice(T3C,"q23","23. Predict: as pH moves away from 7 in either direction, the reaction rate will…",["decrease","increase","stay the same"],null,{pred:1,row:1});
L.write(T3C,"w23","23. Because…",3);
note(T3C,simNote("Click <b>Reset to defaults</b> AND click <b>Clear table</b> twice.<br><b>Step 1:</b> Set the <b>Temperature</b> slider to the value from your temperature investigation that gave the greatest reaction rate.<br><b>Step 2:</b> Use the <b>pH</b> slider for each trial. Leave all other variables at their defaults.<br><b>Step 3:</b> Click <b>Resume</b>. Let each trial run to at least <b>Trial time 0:30</b>, filling in the table while you wait.<br><b>Step 4:</b> Click <b>Record result</b>. Repeat for all pH values, clicking <b>Resume</b> after each change."));
L.table(T3C,"t3c",[{h:"Did molecule speed change?",k:"sp",t:"sel",o:["Yes","No"]},{h:"Enzyme state &amp; activity (%)",k:"st",t:"state"},{h:"Reaction rate ("+H2O2+" per 10 s)",k:"rate",t:"num",sim:"rate"}],[1,4,7,10,14].map(v=>({label:"pH "+v+".0",set:{pH:v}})),{first:"pH",copy:1});
L.captureBtn(T3C,"g3c","Capture your pH graph from the Variable view.","pH graph");
L.choice(T3C,"q24","24. Did pH values affect molecule speed?",["Yes","No"],1,{row:1,explain:"Molecule speed depends on temperature (kinetic energy), not on pH."});
L.write(T3C,"w25","25. How does a change in pH compare to a change in temperature in terms of its effect on enzyme activity rate? Explain the science behind it using relevant vocabulary terms.",5);

/* 3D */
sh(T3D,"3D · Substrate ("+H2O2+") concentration");
L.choice(T3D,"q26","26. Predict: if I keep adding "+H2O2+" to 8 enzymes, the reaction rate will…",["decrease","increase","stay the same"],null,{pred:1,row:1});
L.write(T3D,"w26","26. Because…",3);
note(T3D,simNote("Click <b>Reset to defaults</b> AND click <b>Clear table</b> twice.<br><b>Step 1:</b> Set the <b>Temperature</b> slider to the value that produced the greatest reaction rate in 3B. Leave the other variables at default.<br><b>Step 2:</b> Use the <b>Substrate concentration</b> slider for each trial.<br><b>Step 3:</b> Let each trial run to at least <b>Trial time 0:30</b>, filling in the table while you wait.<br><b>Step 4:</b> Click <b>Record result</b> and repeat. To see how many enzymes are busy, open the <b>Substrate</b> tab of the Variable view; the count is written under the graph."));
L.table(T3D,"t3d",[{h:"How many enzymes are busy?",k:"busy",t:"num",sim:"busy"},{h:"Reaction rate ("+H2O2+" per 10 s)",k:"rate",t:"num",sim:"rate"},{h:"Lots of free enzymes, or lots of "+H2O2+" waiting?",k:"fw",t:"sel",o:["Lots of free enzymes","Lots of substrate waiting"]}],[4,20,36,50].map(v=>({label:"Substrate "+v,set:{S:v}})),{first:"Substrate conc.",copy:1});
L.captureBtn(T3D,"g3d","Capture your substrate graph.","Substrate graph");
L.write(T3D,"w27","27. What happens to the graph at high substrate concentration? Explain the science behind why this occurs with enzymes using relevant vocabulary terms. You may use an analogy to support your reasoning.",5);

/* 3E */
sh(T3E,"3E · Enzyme concentration");
L.choice(T3E,"q28a","28. Predict: as enzyme concentration DEcreases, the chemical reaction rate will…",["decrease","increase"],null,{pred:1,row:1});
L.choice(T3E,"q28b","28. Predict: as enzyme concentration INcreases, the chemical reaction rate will…",["decrease","increase"],null,{pred:1,row:1});
note(T3E,simNote("Click <b>Reset to defaults</b> AND click <b>Clear table</b> twice.<br><b>Step 1:</b> Set <b>Temperature</b> to the value that produced the greatest reaction rate in 3B. Set <b>Substrate concentration to 50</b> so that it never runs out.<br><b>Step 2:</b> Use the <b>Enzyme concentration</b> slider for each trial. Leave the other variables unchanged.<br><b>Step 3:</b> Let each trial run to at least <b>Trial time 0:30</b>, filling in the table while you wait.<br><b>Step 4:</b> Click <b>Record result</b> and repeat for all enzyme concentrations."));
L.table(T3E,"t3e",[{h:"Reaction rate ("+H2O2+" per 10 s)",k:"rate",t:"num",sim:"rate"},{h:"Calculate: Rate ÷ Enzyme =",k:"per",t:"calc",f:(g,r)=>g("rate")/r.n}],[1,4,8,12].map(v=>({label:"Enzyme "+v,n:v,set:{E:v,S:50}})),{first:"Enzyme conc.",copy:1});
L.captureBtn(T3E,"g3e","Capture your enzyme graph.","Enzyme graph");
L.choice(T3E,"q29","29. What happens to the graph at high enzyme concentration? The graph…",["decreases","increases"],1,{row:1});
L.write(T3E,"w30","30. If there is always excess substrate (more "+H2O2+" than enzymes), what do you predict would happen to the reaction rate and the graph if enzyme concentration continued to increase? Explain the science behind why this occurs with enzymes using relevant vocabulary terms. You may use an analogy.",5);

showTab((()=>{try{return sessionStorage.getItem("eial:tab")}catch(e){return null}})()||"3A");

/* ============ PART 4 ============ */
const p4=sec("p4","Part 4 · Summarize Your Learning","<p>Complete the table to summarize what you learned in this virtual lab. <b>Optimum</b> = best value.</p>");
const gp=d=>`<svg viewBox="0 0 90 56" width="104" height="64" aria-hidden="true"><line x1="4" y1="50" x2="88" y2="50" stroke="#888"/><line x1="4" y1="4" x2="4" y2="50" stroke="#888"/><path d="${d}" fill="none" stroke="#0f766e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const G={A:gp("M6,48 L46,12 Q54,6 58,20 L64,48 L88,48"),B:gp("M6,48 C24,48 30,8 46,8 C62,8 68,48 86,48"),C:gp("M6,48 C18,18 30,12 50,11 L88,11"),D:gp("M6,48 L88,10")};
const vars=[["Temperature","A",0,"The rate rises, peaks around 40 °C, then drops sharply."],["pH","B",0,"The rate peaks near pH 7 and falls on both sides."],["Substrate concentration","C",1,"The rate climbs, then levels off when every enzyme is busy."],["Enzyme concentration","D",1,"The rate keeps rising in a straight line when there is excess substrate."]];
vars.forEach((v,i)=>{sh(p4,v[0]);L.choice(p4,"q4g"+i,"Which simplified line graph matches your <b>"+v[0].toLowerCase()+"</b> data?",["A","B","C","D"].map(k=>G[k]),["A","B","C","D"].indexOf(v[1]),{row:1,cls:"graphs",explain:v[3]});
 L.choice(p4,"q4o"+i,"Was there an <b>optimum</b> value for "+v[0].toLowerCase()+"?",["Yes, there was an optimum","No, the rate just kept rising or leveled off"],v[2]?1:0,{row:1});
 const o=document.createElement("label");o.className="optv";o.innerHTML="If so, what was it? <input type=\"text\" data-k=\"opt"+i+"\" value=\""+L.esc(D.data["opt"+i]||"")+"\" style=\"width:140px\">";p4.appendChild(o);o.querySelector("input").oninput=e=>{D.data["opt"+i]=e.target.value;L.save()};L.items.push({part:"p4",t:"opt",i,v:v[0]});
 L.write(p4,"w4"+i,"Explain the science: WHY did the reaction rate change for "+v[0].toLowerCase()+"?",3)});
sh(p4,"Practice test questions");
L.write(p4,"w31","31. A classmate says: “High temperature kills enzymes.” Write a scientific reply. Use evidence from the simulator and the vocabulary terms <b>denature</b>, <b>active site</b>, and <b>kinetic energy</b>. (Hint: are enzymes alive?)",6);
note(p4,"During a high fever or acute illness, the autonomic nervous system shifts blood flow away from your gut and toward the immune system and vital organs. This can reduce the secretion of digestive juices and enzymes.");
L.write(p4,"w32","32. Based on what you learned about enzymes, explain why, if you are sick, you may experience stomach upset and nausea after a large and/or complex meal. Which experiment (3B–3E) is this an example of?",6);

/* ============ finish: sign + PDF ============ */
const fin=document.createElement("section");fin.className="box sec";fin.id="fin";main.appendChild(fin);
L.mountFinish=(host)=>{const b=window.BVL;
 if(!b||!b.user()){host.innerHTML='<h2>Download your worksheet</h2><p>Sign in on the <a href="/home.html">home page</a> to create your PDF. (Your work on this page is not saved until you sign in.)</p>';return}
 const p=b.profile(),need=[];if(!p.teacher||!p.period)need.push("Choose your teacher and period in Profile settings on the home page.");
 host.innerHTML=`<h2>Save and hand in</h2><p>The PDF includes your name, teacher and period, your answers, your data tables and graphs, your first-try score, and your signature. Upload it to Schoology or open it in Notability. It includes everything you have finished so far.</p><p><b>Honor statement:</b> I completed this work myself, in my own words.</p><p class="note">Sign with your finger or Apple Pencil:</p><div id="sigw"></div><p class="fb" id="exm" aria-live="polite"></p><button class="pbtn" id="exb" disabled>⬇ Download PDF</button>`;
 const m=host.querySelector("#exm"),btn=host.querySelector("#exb");
 const sync=()=>{const ok=!sig.empty()&&!need.length;btn.disabled=!ok;m.className="fb bad";m.textContent=need[0]||(sig.empty()?"Please sign above to enable the download.":"")};
 const sig=b.sigPad(host.querySelector("#sigw"),D.sig,()=>{D.sig=sig.data();L.save();sync()});sync();
 btn.onclick=()=>{btn.disabled=true;m.className="fb good";m.textContent="Making your PDF…";D.sig=sig.data();L.saveNow();
  try{const r=L.buildPdf();const nm="Enzymes-in-Action-"+r.p.name.replace(/\s+/g,"-")+".pdf";r.d.save(nm,(i,n)=>r.p.name+" · "+r.p.teacher+" · Period "+r.p.period+" · ID "+r.id+" · Page "+i+" of "+n);m.textContent="Your PDF was saved. Check your Downloads or Files app, then upload it to Schoology."}
  catch(e){m.className="fb bad";m.textContent="Sorry, the PDF could not be made ("+e.message+")."}btn.disabled=false}};
L.mountFinish(fin);
if(window.BVL&&BVL.mountSavePanel){const sv=document.createElement("div");main.appendChild(sv);BVL.mountSavePanel(sv)}
/* progress chips */
const nav=$("#chips");if(nav)nav.innerHTML=["p1:Part 1","p2:Part 2","p3:Part 3","p4:Part 4","fin:Hand in"].map(s=>{const[a,b]=s.split(":");return`<a href="#${a}">${b}</a>`}).join("");
})();
