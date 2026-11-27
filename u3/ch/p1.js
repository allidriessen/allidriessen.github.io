/* Part 1: membrane structure. Word clues, label the diagram, fluid mosaic, selective permeability. */
(function(){
const L=LAB,D=L.D,G=window.G,V=CH.VOCAB,M=G.MEM;
const main=CH.init({id:"p1",q:"What is the cell membrane made of, and how is it built?"});
const sec=(h,html)=>{const b=document.createElement("div");b.className="box";b.innerHTML=`<h2>${h}</h2>${html||""}`;main.appendChild(b);return b};
const need={words:0,label:0,fm:0,sel:0};
const chk=()=>{const ok=D.mc["p1.label"]&&D.mc["p1.label"].d&&D.mc["p1.words"]&&D.mc["p1.words"].d&&D.mc["p1.fm"]&&D.mc["p1.fm"].d&&D.mc["p1.sel"]&&D.mc["p1.sel"].d&&D.mc["p1.sel2"]&&D.mc["p1.sel2"].d;if(ok&&!D.done.p1){CH.unlock();reveal()}else if(ok)CH.sync&&CH.sync()};
/* ---- A. word detective ---- */
{const b=sec("A. Word detective","<p>Scientists build new words from smaller word parts. If you know the parts, you can work out what a word means. Read these clues first.</p>"+
 `<div class="wc"><div><b>hydro-</b> = water<br><b>-philic</b> = loving</div><div><b>-phobic</b> = fearing</div><div><b>phospho-lipid</b> = a fat-like molecule with a phosphate group on it</div><div><b>bi-layer</b> = two layers</div></div>`);
 L.cloze(b,"p1.words","<p><b>1.</b> A <i>hydrophilic</i> head is {{*attracted to water|repelled by water|made of water}}.</p><p><b>2.</b> A <i>hydrophobic</i> tail {{*avoids water|is attracted to water|dissolves in water}}.</p><p><b>3.</b> A membrane is surrounded by water (the lumen on one side and cytoplasm on the other). The <b>heads</b> of the phospholipids face {{*outward, toward the water|inward, toward each other}}, and the <b>tails</b> face {{*inward, away from the water|outward, toward the water}}.</p>",{q:"Use the word parts to explain hydrophilic and hydrophobic, and which way heads and tails face.",hint:"Hydro means water. Philic means loving. Phobic means fearing.",onRight:chk})}
/* ---- B. label the membrane ---- */
const lb=sec("B. Label the membrane",`<p>Here is the cell membrane you zoomed in on. <b>Tap a word</b> in the bank to read what it means. Then <b>tap a numbered circle</b> on the picture to place it. Use the definitions and the clues in the picture. You can tap a numbered circle without a word selected to get a clue about that part.</p><div id="defc" class="defc">Tap a word below to see its meaning.</div><div id="lblw"><canvas id="lbl" aria-label="Membrane diagram with numbered circles to label"></canvas></div><div id="bank" class="bank"></div><div class="czr"><button type="button" class="pbtn" id="lchk">Check my labels</button><button type="button" class="pbtn ghost sm" id="lrst">Start over</button><span class="fb" id="lfb" aria-live="polite"></span></div>`);
const MK=[ /* target order matches CH.VOCAB: bilayer, head, tails, channel, carrier, enzyme, lumen, cyto */
 {m:[40,330],p:[3,268],d:1},{m:[28,190],p:[118,226],d:1},{m:[352,385],p:[352,284],d:1},{m:[250,100],p:[250,222],d:1},
 {m:[470,150],p:[470,226],d:1},{m:[850,80],p:[716,196],d:-1},{m:[40,40],p:null,d:1},{m:[40,470],p:null,d:1}];
const lbl=lb.querySelector("#lbl"),lx=lbl.getContext("2d"),bank=lb.querySelector("#bank"),defc=lb.querySelector("#defc"),fb=lb.querySelector("#lfb");
function fit(){const r=Math.min(devicePixelRatio||1,2),w=lb.querySelector("#lblw").parentElement.clientWidth-6,h=Math.min(w*M.H/M.W,innerHeight*.72),w2=h*M.W/M.H;lbl.style.width=w2+"px";lbl.width=Math.round(w2*r);lbl.height=Math.round(h*r)}
addEventListener("resize",()=>{fit();paint()});
L.reg("p1.label","Label the parts of the cell membrane","All 8 labels correct",false);const st=D.mc["p1.label"];
let S=D.data.lbl||(D.data.lbl={a:V.map(()=>-1),ord:V.map((v,i)=>i).sort((a,b)=>((a*7+3)%8)-((b*7+3)%8))});let sel=-1,wrong=[],bad=0;
const base=document.createElement("canvas");base.width=M.W;base.height=M.H;{const bx=base.getContext("2d");G.memScene(bx,0.6,{still:1});bx.strokeStyle="#241a38";bx.lineWidth=4;bx.beginPath();bx.moveTo(10,220);bx.lineTo(3,220);bx.lineTo(3,316);bx.lineTo(10,316);bx.stroke();
 [["glu",580,50],["h2o",400,168],["o2",830,175],["co2",800,430],["glu",640,455],["h2o",780,370],["k",230,430],["na",340,455]].forEach(a=>G.mol(bx,a[0],a[1],a[2],.95))}
function render(x,final){x.drawImage(base,0,0);const F="800 18px 'Open Sans',sans-serif";
 MK.forEach((k,i)=>{const t=S.a.indexOf(i),has=t>=0;if(!has&&final)return;
  if(k.p){x.strokeStyle="#241a38";x.lineWidth=2.5;x.beginPath();x.moveTo(k.m[0],k.m[1]);x.lineTo(k.p[0],k.p[1]);x.stroke();x.beginPath();x.arc(k.p[0],k.p[1],4.5,0,7);x.fillStyle="#241a38";x.fill()}
  const bad=wrong.includes(i),col=has?(bad?"#c0392b":(st.d&&!final)?"#14803f":"#3a56a8"):"#3a56a8";
  if(has){const txt=V[t].t;x.font=F;const w=x.measureText(txt).width+20,px=k.d>0?k.m[0]+20:k.m[0]-20-w,py=k.m[1];
   x.fillStyle=bad?"#fdecea":"#fff";x.strokeStyle=col;x.lineWidth=3;x.beginPath();x.roundRect(px,py-16,w,32,16);x.fill();x.stroke();
   x.fillStyle="#241a38";x.textAlign="left";x.textBaseline="middle";x.fillText(txt,px+10,py+1)}
  x.beginPath();x.arc(k.m[0],k.m[1],17,0,7);x.fillStyle=has?col:sel>=0?"#f5b700":"#fff";x.fill();x.lineWidth=3.5;x.strokeStyle=has?"#fff":"#3a56a8";x.stroke();
  x.fillStyle=has?"#fff":sel>=0?"#241a38":"#3a56a8";x.font="800 19px 'Open Sans',sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(String(i+1),k.m[0],k.m[1]+1)})}
function paint(){const r=lbl.width/M.W;lx.setTransform(r,0,0,r,0,0);render(lx,false);
 bank.innerHTML=S.ord.map(i=>`<button type="button" class="chip${S.a.includes(i)?" used":""}${sel===i?" sel":""}" data-i="${i}"${st.d?" disabled":""}>${V[i].t}</button>`).join("")}
bank.onclick=e=>{const c=e.target.closest(".chip");if(!c||st.d)return;const i=+c.dataset.i;sel=sel===i?-1:i;defc.innerHTML=sel>=0?`<b>${V[i].t}:</b> ${V[i].d}`:"Tap a word below to see its meaning.";paint()};
lbl.addEventListener("pointerdown",e=>{if(st.d)return;const b=lbl.getBoundingClientRect(),px=(e.clientX-b.left)/b.width*M.W,py=(e.clientY-b.top)/b.height*M.H;
 const hit=MK.findIndex(k=>Math.hypot(px-k.m[0],py-k.m[1])<26);if(hit<0)return;
 const cur=S.a.indexOf(hit);
 if(sel>=0){const old=S.a.indexOf(sel);if(old>=0)S.a[old]=-1;const here=S.a.indexOf(hit);S.a.forEach((t,j)=>{if(t===hit)S.a[j]=-1});S.a[hit]=sel;sel=-1;wrong=wrong.filter(w=>w!==hit);fb.textContent="";L.save();paint();return}
 /* no word selected: a clue, or take the word back */
 if(cur>=0&&cur===hit&&S.a[hit]>=0&&false){}
 if(S.a[hit]>=0){const t=S.a[hit];S.a[hit]=-1;sel=t;defc.innerHTML=`<b>${V[t].t}:</b> ${V[t].d}`;L.save();paint();return}
 defc.innerHTML=`<b>Clue for circle ${hit+1}:</b> ${V[hit].clue}`;paint()});
lb.querySelector("#lrst").onclick=()=>{if(st.d)return;S.a=V.map(()=>-1);sel=-1;wrong=[];fb.textContent="";L.save();paint()};
lb.querySelector("#lchk").onclick=()=>{if(st.d)return;if(S.a.some(v=>v<0)){fb.className="fb bad";fb.textContent="Place a word on every circle first.";return}
 wrong=S.a.map((t,i)=>t===i?-1:i).filter(i=>i>=0);
 if(!wrong.length){st.d=1;st.pick="ok";sel=-1;fb.className="fb good";fb.textContent="✓ Correct"+(st.w?" (after "+(st.w+1)+" tries)":" on the first try")+"! Your labeled picture is saved for your PDF.";saveLbl();L.save();paint();chk();return}
 st.w++;L.save();bad=wrong.length;fb.className="fb bad";fb.textContent=(S.a.length-wrong.length)+" of "+S.a.length+" correct. The red ones are not right. Tap a red circle to take the word back, then read the clues and try again."+(st.w>=2?" Tip: tap an empty circle for a clue.":"");paint()};
function saveLbl(){const c=document.createElement("canvas");c.width=M.W;c.height=M.H;const x=c.getContext("2d");render(x,true);L.shot("lbl",c,"My labeled membrane")}
fit();paint();if(st.d){fb.className="fb good";fb.textContent="✓ Correct"+(st.w?" (after "+(st.w+1)+" tries)":" on the first try")+"!"}
/* ---- C. fluid mosaic ---- */
{const b=sec("C. A fluid mosaic",`<p>Watch the membrane move. The phospholipids wiggle and slide past each other, and the proteins drift sideways. That is why scientists call it the <b>fluid mosaic model</b>.</p><div id="fmw"><canvas id="fm"></canvas></div><div class="czr"><button type="button" class="pbtn sm ghost" id="fmp">❚❚ Pause</button></div><table class="vt"><tr><td>Fluid</td><td>The lipids and proteins can <b>move</b> around, like people in a moving crowd.</td></tr><tr><td>Mosaic</td><td>It is made of <b>many different pieces</b> (lipids and different proteins), like tiles in a mosaic picture.</td></tr></table>`);
 const c=b.querySelector("#fm"),x=c.getContext("2d");let T=0,pz=false;const r=Math.min(devicePixelRatio||1,2);
 function fit2(){const w=b.clientWidth-40,w2=Math.min(w,700);c.style.width=w2+"px";c.width=Math.round(w2*r);c.height=Math.round(w2*M.H/M.W*r)}fit2();
 const P0={...M.PX};
 (function loop(t){if(!pz)T+=.02;M.PX.ch=P0.ch+Math.sin(T*.8)*95;M.PX.ca=P0.ca+Math.sin(T*.55+2)*60+40;M.PX.en=P0.en+Math.sin(T*.7+4)*70-30;
  x.setTransform(c.width/M.W,0,0,c.width/M.W,0,0);G.memScene(x,T*3,{});M.PX.ch=P0.ch;M.PX.ca=P0.ca;M.PX.en=P0.en;requestAnimationFrame(loop)})();
 b.querySelector("#fmp").onclick=e=>{pz=!pz;e.target.textContent=pz?"▶ Play":"❚❚ Pause"};
 L.choice(b,"p1.fm","Which statement explains why the membrane is called a <i>fluid mosaic</i>?",["Its lipids and proteins can move around, and it is made of many different parts","It is a liquid with no structure","It is made of one single layer of one kind of molecule","Its parts are locked in place like bricks in a wall"],0,{onRight:chk})}
/* ---- D. selective permeability ---- */
{const b=sec("D. Selective permeability",`<p>The middle of the membrane is made of oily, <b>hydrophobic</b> tails. Think about oil and water: things that mix with oil can slip through the middle, but things that are <b>large</b> or have an <b>electric charge</b> are blocked. They need help from a protein.</p><div class="info"><b>Selective</b> = choosy. <b>Permeable</b> = lets things pass through. So <b>selective permeability</b> means the membrane is choosy about what it lets cross.</div>`);
 L.cloze(b,"p1.sel",`<p>Decide how each particle crosses the membrane.</p><table class="vt">${[["O₂ (small, no charge)",0],["CO₂ (small, no charge)",0],["Glucose (large)",1],["Na⁺ (an ion with a + charge)",1],["Amino acid (large)",1]].map(r=>`<tr><td>${r[0]}</td><td>{{${r[1]?"*":""}slips through the phospholipid bilayer|${r[1]?"":"*"}needs a membrane protein}}</td></tr>`).join("")}</table>`,{q:"How does each particle cross the membrane?",hint:"Small particles with no charge can slip between the tails. Large or charged particles need a protein.",onRight:chk});
 L.choice(b,"p1.sel2","Which statement best describes <i>selective permeability</i>?",["The membrane lets some substances cross easily, some only with help, and some not at all","The membrane lets everything cross","The membrane lets nothing cross","The membrane only lets water cross"],0,{onRight:chk});
 const j=document.createElement("div");j.className="info";j.innerHTML="<b>Looking ahead:</b> in Parts 2 and 3 you will see how particles that can't slip through still get across, and what the cell does when it must move particles <i>against</i> the odds.";b.appendChild(j)}
/* ---- E. wrap-up ---- */
const end=sec("Part 1 complete","");end.id="endbox";end.hidden=true;
function reveal(){end.hidden=false;end.innerHTML=`<h2>Part 1 complete</h2><p>Your labeled membrane, vocabulary and definitions are saved. You can download a PDF of your work so far, or go on to Part 2.</p><table class="vt">${V.map(v=>`<tr><td>${v.t}</td><td>${v.d}</td></tr>`).join("")}${CH.TERMS2.map(v=>`<tr><td>${v.t}</td><td>${v.d}</td></tr>`).join("")}</table><div class="czr"><button type="button" class="pbtn ghost" id="pdfb">⬇ Download my PDF so far</button><span class="fb" id="pdfm"></span></div>`;
 end.querySelector("#pdfb").onclick=()=>CH.pdf(end.querySelector("#pdfm"),{partial:"Part 1"});end.scrollIntoView({behavior:"smooth"})}
CH.nav(main,"p1",{hint:"Finish all five sections to unlock Part 2."});
if(D.done.p1)reveal();
window.__p1={S,chk};
})();
