/* Part 3: active transport (lab bench). */
(function(){
const L=LAB,D=L.D,G=window.G,Wd=Sim.W,Ht=Sim.H;
const LUM="#fff1d6",CEL="#f9d9e0",BLD="#f6b8c0";
const REQ=["p3.a.order","p3.a.sum","p3.b.off","p3.b.on","p3.b.act","p3.b.atp","p3.b.resp","p3.c.path","p3.c.src","p3.c.off","p3.c.sum","p3.d.big","p3.d.sum","p3.e.sum","p3.e.match"];
const done=()=>REQ.every(i=>D.mc[i]&&D.mc[i].d);
let reveal;const chk=()=>{if(done()){if(!D.done.p3)CH.finishPart("p3");reveal()}};
/* ---------- endocytosis / exocytosis drawing (no particles, just a timeline u from 0 to 1) ---------- */
const VY=250,VCX=320,VR=66;
function ves(x,mode,u0){const u=mode==="exo"?1-u0:u0,Y=VY,cx=VCX,r=VR,TH=Sim.TH;
 x.fillStyle=mode==="exo"?BLD:LUM;x.fillRect(0,0,Wd,Y);x.fillStyle=CEL;x.fillRect(0,Y,Wd,Ht-Y);
 x.font="800 15px 'Open Sans',sans-serif";x.fillStyle="rgba(36,26,56,.7)";x.textAlign="left";x.textBaseline="middle";x.fillText(mode==="exo"?"Outside the cell (blood side)":"Lumen (outside the cell)",12,18);x.fillText("Inside the cell",12,Ht-16);
 const pts=[],opt={gap:12,len:15,hl:5.5,lw:1.8,wob:1.2,t:u0*8};let vs=null,cargo=[cx,Y-TH-16];
 const seg=(a,b,fn)=>{for(let X=a;X<=b+.1;X+=6)pts.push([X,fn?fn(X):Y])};
 if(u<.2){seg(14,Wd-14);cargo=[cx,70+(u/.2)*(Y-TH-20-70)]}
 else if(u<.45){const d=(u-.2)/.25*r*.95;seg(14,Wd-14,X=>Y+d*Math.exp(-Math.pow((X-cx)/(r*.85),2)));cargo=[cx,Y-TH-16+d*.9]}
 else if(u<.7){const k=(u-.45)/.25,nw=r*.95+(7-r*.95)*k,sq=Math.sqrt(Math.max(0,r*r-nw*nw)),yc=Y+sq,phi=Math.asin(Math.min(1,sq/r));seg(14,cx-nw);for(let t=Math.PI+phi;t>=-phi;t-=.08)pts.push([cx+r*Math.cos(t),yc+r*Math.sin(t)]);seg(cx+nw,Wd-14);cargo=[cx,yc+4]}
 else{const vy=u<.8?Y+r+6*((u-.7)/.1):Y+r+6+(u-.8)/.2*130;seg(14,Wd-14);vs=[cx,vy];cargo=[cx,vy+2]}
 G.bilayer(x,pts,{...opt,skip:[]});
 if(vs){const c=[];for(let t=0;t>=-6.283;t-=.07)c.push([vs[0]+r*Math.cos(t),vs[1]+r*Math.sin(t)]);G.bilayer(x,c,{...opt,closed:true})}
 G.mol(x,mode==="exo"?"lip":"prot",cargo[0],cargo[1],1.15);
 x.fillStyle="#fff";x.strokeStyle="#c0762b";x.lineWidth=3;x.beginPath();x.roundRect(Wd-190,Ht-48,178,34,17);x.fill();x.stroke();x.fillStyle="#7a4a12";x.font="800 14px 'Open Sans',sans-serif";x.textAlign="center";x.fillText("Uses energy (ATP → ADP)",Wd-101,Ht-30)}
const CAP={endo:[[.2,"A large particle, like a protein, is too big for a channel or a carrier."],[.45,"The membrane folds inward around the particle."],[.7,"The edges of the fold come together."],[.8,"The membrane pinches off and forms a vesicle (a bubble of membrane) around the particle."],[1.2,"The vesicle carries the particle into the cell."]],
 exo:[[.2,"A vesicle full of material moves toward the membrane."],[.45,"The vesicle touches the membrane and begins to fuse with it."],[.7,"The vesicle membrane merges into the cell membrane and opens to the outside."],[.8,"The contents spill out of the cell."],[1.2,"The vesicle membrane is now part of the cell membrane."]]};
const caption=(mode,u)=>{const c=CAP[mode].find(a=>u<a[0])||CAP[mode][4];return c[1]};
const V={mode:"endo",u:0,auto:true,last:0};
const SC={
 pump:{title:"Scene: one Na⁺/K⁺ pump (slowed down)",kinds:["na","k","atp","adp","pi"],cross:false,speed:.6,
  note:"Press Run one cycle. Watch the pump and read the caption.",
  cfg:()=>({regions:[{name:"Inside the cell",col:CEL},{name:"Outside the cell (blood)",col:BLD}],mem:[{y:290,prot:[{t:"pump",x:320,inside:-1}]}],rule:{},pumpOn:false,mols:[{k:"na",n:[3,10]},{k:"k",n:[10,3]},{k:"atp",n:[3,0]}]}),
  btns:[{label:"▶ Run one cycle",fn:(s,a)=>{if(s.mems[0].prot[0].cy==null){s.pumpOn=true;a.cyc=1}}}],
  extra:s=>{const c=s.mems[0].prot[0].cy;const t=c==null?"The pump is waiting. Press <b>Run one cycle</b>.":c<.3?"<b>Step 1:</b> ATP and 3 Na⁺ from inside the cell bind to the pump.":c<.62?"<b>Step 2:</b> The pump splits ATP (ATP becomes ADP + a phosphate). The pump changes shape and releases the 3 Na⁺ outside the cell.":c<.9?"<b>Step 3:</b> 2 K⁺ from outside bind to the pump, and the phosphate comes off.":"<b>Step 4:</b> The pump returns to its first shape and releases the 2 K⁺ inside the cell.";return`<div class="info" style="margin:6px 0">${t}</div>`}},
 nak:{title:"Scene: a cell with Na⁺/K⁺ pumps",kinds:["na","k","atp","adp","pi"],note:"Tap a row to follow one molecule. Turn the pump off and on with the button.",
  cfg:()=>({regions:[{name:"Inside the cell",col:CEL},{name:"Outside the cell (blood)",col:BLD}],mem:[{y:290,prot:[{t:"channel",x:40,f:["na"],cap:90},{t:"channel",x:105,f:["k"],cap:90},{t:"pump",x:190,inside:-1},{t:"channel",x:275,f:["na"],cap:90},{t:"channel",x:340,f:["k"],cap:90},{t:"pump",x:425,inside:-1},{t:"channel",x:510,f:["na"],cap:90},{t:"channel",x:575,f:["k"],cap:90}]}],rule:{},mols:[{k:"na",n:[4,22]},{k:"k",n:[22,5]},{k:"atp",n:[16,0]}]}),
  btns:[{label:"Pump: ON",fn:(s,a,b)=>{s.pumpOn=!s.pumpOn;b.textContent="Pump: "+(s.pumpOn?"ON":"OFF");b.style.background=s.pumpOn?"":"#a33"}},{label:"Cell makes more ATP",fn:s=>{s.ps.forEach(p=>{if(p.k==="adp")p.k="atp"});s.ps=s.ps.filter(p=>p.k!=="pi")}}],
  reset:(s,a)=>{s.load(SC.nak.cfg());const b=document.querySelector(".sb");if(b){b.textContent="Pump: ON";b.style.background=""}}},
 sglt:{title:"Scene: absorbing glucose from the lumen",kinds:["glu","na","k","atp"],cols:["Lumen","In the cell","Blood"],note:"Top membrane faces the lumen. Bottom membrane faces the blood.",
  cfg:()=>({regions:[{name:"Lumen of the intestine",col:LUM},{name:"Inside the cell",col:CEL},{name:"Blood",col:BLD}],mem:[{y:150,prot:[{t:"sglt",x:170,f:["glu"],cap:140},{t:"sglt",x:430,f:["glu"],cap:140}]},{y:410,prot:[{t:"carrier",x:130,f:["glu"],cap:110},{t:"carrier",x:280,f:["glu"],cap:110},{t:"pump",x:470,inside:-1}]}],rule:{},refill:[{k:"na",r:0,min:20}],mols:[{k:"na",n:[22,4,22]},{k:"glu",n:[18,0,2]},{k:"k",n:[0,10,10]},{k:"atp",n:[0,14,0]}]}),
  btns:[{label:"Pump: ON",fn:(s,a,b)=>{s.pumpOn=!s.pumpOn;b.textContent="Pump: "+(s.pumpOn?"ON":"OFF");b.style.background=s.pumpOn?"":"#a33"}},{label:"Cell makes more ATP",fn:s=>{s.ps.forEach(p=>{if(p.k==="adp")p.k="atp"});s.ps=s.ps.filter(p=>p.k!=="pi")}}],
  reset:(s,a)=>{s.load(SC.sglt.cfg());const b=document.querySelector(".sb");if(b){b.textContent="Pump: ON";b.style.background=""}}},
 ves:{title:"Scene: moving large particles",note:"Use the buttons to switch processes or step through.",
  start:(s,a)=>{V.u=0;V.auto=true;s.custom=(x,T)=>{const dt=Math.max(0,T-V.last);V.last=T;if(V.auto&&!s.paused){V.u+=dt*.07;if(V.u>1.15)V.u=0}ves(x,V.mode,Math.min(V.u,1));V.cap=caption(V.mode,Math.min(V.u,1));const e=document.getElementById("vcap");if(e&&e.textContent!==V.cap)e.textContent=V.cap}},
  btns:[{label:"Endocytosis",fn:()=>{V.mode="endo";V.u=0;V.auto=true}},{label:"Exocytosis",fn:()=>{V.mode="exo";V.u=0;V.auto=true}},{label:"◀ Step",fn:()=>{V.auto=false;const st=[.05,.3,.58,.75,.95],n=[...st].reverse().find(v=>v<V.u-.02);V.u=n==null?st[st.length-1]:n}},{label:"Step ▶",fn:()=>{V.auto=false;const st=[.05,.3,.58,.75,.95],n=st.find(v=>v>V.u+.02);V.u=n==null?st[0]:n}},{label:"▶ Auto",fn:()=>{V.auto=true}}],
  extra:()=>`<div class="info" id="vcap" style="margin:6px 0">${V.cap||""}</div>`,cross:false,reset:(s,a)=>{V.u=0;V.auto=true}}
};
/* representative pictures for the PDF */
function repShot(mode,key,cap){const c=document.createElement("canvas");c.width=Wd;c.height=Ht;const x=c.getContext("2d");ves(x,mode,.62);L.shot(key,c,cap)}
const api=CH.bench({id:"p3",q:"How do cells move molecules against the odds?",scenes:SC,tabs:[
 {label:"3A",sub:"The pump",title:"A pump uses ATP",scene:"pump",build:(h,a)=>{
  a.fold(h,"Background",`<p><b>Active transport</b> moves molecules from <b>low</b> concentration to <b>high</b> concentration, against the concentration gradient. That takes <b>energy</b>, usually from <b>ATP</b>.</p><p>An <b>ATP pump</b> is a carrier-type membrane protein. ATP binds, the pump changes shape, the molecules move, and ATP becomes ADP and a phosphate (P).</p><p>The <b>Na⁺/K⁺ pump</b> (sodium-potassium ATPase) sits on the side of intestinal cells that faces the blood. Each cycle it pumps <b>3 Na⁺ out</b> of the cell and <b>2 K⁺ in</b>. This keeps Na⁺ low inside the cell.</p>`,true);
  const b=document.createElement("div");h.appendChild(b);
  b.insertAdjacentHTML("beforeend",'<div class="info"><b>Do this:</b> Press <b>Run one cycle</b> under the picture. Read the caption under the table. Run it two or three times.</div>');
  L.dnd(b,"p3.a.order","1. Put the steps of the pump in order. Drag each card into a box, or tap a card and then tap a box.",["Step 1","Step 2","Step 3","Step 4"],
   ['<div class="stp">ATP and 3 Na⁺ bind to the pump</div>','<div class="stp">ATP splits, the pump changes shape, Na⁺ is released outside</div>','<div class="stp">2 K⁺ bind from outside, the phosphate comes off</div>','<div class="stp">The pump changes back, K⁺ is released inside</div>'],{names:["ATP and 3 Na+ bind to the pump","ATP splits, pump changes shape, Na+ released outside","2 K+ bind from outside, phosphate comes off","Pump changes back, K+ released inside"]});
  L.cloze(b,"p3.a.sum","<p>2. The pump uses {{*ATP|glucose|oxygen}} as its energy source. In each cycle it moves {{*3 Na⁺ out of|3 Na⁺ into|3 K⁺ out of}} the cell and {{*2 K⁺ into|2 K⁺ out of|2 Na⁺ into}} the cell. ATP is changed into {{*ADP and a phosphate|ATP and water}}.</p>",{q:"Describe what the Na⁺/K⁺ pump does.",hint:"Watch the animation again and count the ions.",onRight:chk});
  a.shotBtn(b,"pump","The sodium-potassium pump")},
  onShow:a=>{a.tick=s=>{const p=s.mems&&s.mems[0]&&s.mems[0].prot[0];if(a.cur==="pump"&&p&&p.cy!=null&&p.cy>.45&&p.cy<.6)a.shotAuto("pump","The sodium-potassium pump");if(a.cyc&&p&&p.cy==null&&a.cur==="pump"){s.pumpOn=false;a.cyc=0}}}},
 {label:"3B",sub:"Pump in a cell",title:"Pumps keep the cell stable",scene:"nak",build:(h,a)=>{
  a.fold(h,"Background and prediction",`<p>Cells have <b>more Na⁺ outside</b> and <b>more K⁺ inside</b>. But there are leak channels in the membrane, so Na⁺ and K⁺ slowly leak down their gradients. Pumps push them back. This is <b>homeostasis</b>: the cell keeps its inside conditions steady.</p><p>The pumps run on <b>ATP</b>. When ATP is used it becomes ADP + P. The cell makes more ATP in <b>cellular respiration</b>.</p>`,true);
  const b=document.createElement("div");h.appendChild(b);
  L.choice(b,"p3.b.pred","Prediction: if the pumps are turned OFF, what will happen to the amounts of Na⁺ and K⁺ on each side?",["They will move toward equal amounts on both sides","Nothing will change","Na⁺ will all go inside","K⁺ will all go outside"],0,{pred:true});
  b.insertAdjacentHTML("beforeend",'<div class="info"><b>Do this:</b> Press <b>Pump: ON</b> to turn it OFF and set the speed to 3×. Watch for 30 seconds and look at the table. Then press <b>Reset</b> and watch again with the pump ON.</div>');
  L.choice(b,"p3.b.off","1. With the pumps OFF, what happened to Na⁺ and K⁺ over time?",["Both leaked down their gradients until the amounts were about equal on both sides","They stayed exactly the same","They both moved into the cell","They both moved out of the cell"],0,{explain:"Leak channels let them move from high to low concentration (passive).",onRight:chk});
  L.choice(b,"p3.b.on","2. With the pumps ON, what stayed true even though ions leaked?",["Na⁺ stayed higher outside and K⁺ stayed higher inside","Na⁺ and K⁺ became equal on both sides","All the Na⁺ ended up inside","All the K⁺ ended up outside"],0,{explain:"Pumps work as fast as the leaks, so the gradients stay.",onRight:()=>{a.shotAuto("pump","The sodium-potassium pump");chk()}});
  L.choice(b,"p3.b.act","3. The pump moves Na⁺ from a LOW concentration to a HIGH concentration. This kind of transport is called…",["Active transport","Diffusion","Facilitated diffusion","Osmosis"],0,{onRight:chk});
  L.choice(b,"p3.b.atp","4. Watch the ATP row. What happens to the ATP as the pumps work?",["ATP is used up and becomes ADP and phosphate","ATP is made by the pump","ATP leaves the cell","ATP does not change"],0,{explain:"ADP and P are what is left after ATP gives up its energy.",onRight:chk});
  L.choice(b,"p3.b.resp","5. When the ATP runs out, the pumps stop. Press <b>Cell makes more ATP</b>. Which process in a real cell makes ATP?",["Cellular respiration","Osmosis","Diffusion","Endocytosis"],0,{explain:"Cellular respiration turns glucose and O₂ into ATP.",onRight:chk});
  a.shotBtn(b,"pump","The sodium-potassium pump")}},
 {label:"3C",sub:"Glucose uptake",title:"Pumps help absorb glucose from the gut",scene:"sglt",build:(h,a)=>{
  a.fold(h,"Background",`<p>Intestinal cells must absorb glucose even when there is already more glucose <b>inside</b> the cell than in the lumen. How?</p><p>A protein in the lumen-facing membrane brings <b>Na⁺ and glucose in together</b>. Na⁺ flows <b>down</b> its gradient (lots of Na⁺ in the lumen, little inside the cell), and the glucose is dragged along. The Na⁺/K⁺ pump on the blood side pushes Na⁺ back out, so the Na⁺ gradient never runs out. The glucose then leaves into the blood through a carrier protein (facilitated diffusion).</p>`,true);
  const b=document.createElement("div");h.appendChild(b);
  b.insertAdjacentHTML("beforeend",'<div class="info"><b>Do this:</b> Set the speed to 3× and watch glucose for about 30 seconds. Then turn the pump <b>OFF</b> (press <b>Reset</b> first) and watch again.</div>');
  L.choice(b,"p3.c.path","1. Follow the glucose (tap its row). What path does most of it take?",["Lumen → into the cell (with Na⁺) → out to the blood","Lumen → blood directly, between the cells","Blood → cell → lumen","It stays in the lumen"],0,{onRight:chk});
  L.choice(b,"p3.c.src","2. The glucose carrier in the lumen-facing membrane can bring glucose in even when glucose is higher inside the cell. Where does its energy come from?",["From the Na⁺ gradient, which the pump keeps going using ATP","From the glucose concentration","From the lumen's water","It needs no energy"],0,{explain:"This is called secondary active transport: the gradient made by the pump powers the glucose uptake.",onRight:chk});
  L.choice(b,"p3.c.off","3. Press <b>Reset</b>, turn the pump OFF and run for 30 seconds. What happens to glucose uptake?",["It slows down or stops, because Na⁺ builds up inside the cell and the gradient is lost","It speeds up","It does not change","Glucose goes into the lumen"],0,{onRight:chk});
  L.cloze(b,"p3.c.sum","<p>4. The pump uses {{*ATP|glucose}} directly. The glucose carrier uses the {{*Na⁺ gradient|sunlight}} that the pump makes, so uptake of glucose depends on energy {{*indirectly|not at all}}.</p>",{q:"Explain how the pump helps glucose get absorbed.",hint:"No pump means no Na⁺ gradient.",onRight:chk})}},
 {label:"3D",sub:"Endo / Exo",title:"Moving large particles with vesicles",scene:"ves",build:(h,a)=>{
  a.fold(h,"Background",`<p>Some particles are too large for any pump, channel or carrier, like proteins and fats. Cells move them in <b>vesicles</b>: small bubbles of membrane. This takes energy (ATP).</p><p><b>Endocytosis:</b> the membrane folds in around material and pinches off a vesicle, bringing material <b>into</b> the cell.<br><b>Exocytosis:</b> a vesicle fuses with the membrane and releases its contents <b>out of</b> the cell.</p>`,true);
  const b=document.createElement("div");h.appendChild(b);
  b.insertAdjacentHTML("beforeend",'<div class="info"><b>Do this:</b> Use the buttons under the picture to watch <b>Endocytosis</b> and <b>Exocytosis</b>. Use <b>Step</b> to go one stage at a time.</div>');
  L.choice(b,"p3.d.big","1. Why can't a protein use a channel or carrier protein to enter the cell?",["It is too large","It is too small","It has no charge","It moves too fast"],0,{onRight:chk});
  L.cloze(b,"p3.d.sum","<p>2. In {{*endocytosis|exocytosis}} the membrane folds inward and brings material {{*into|out of}} the cell. In {{*exocytosis|endocytosis}} a vesicle fuses with the membrane and releases material {{*out of|into}} the cell. Both processes {{*use|do not use}} energy.</p>",{q:"Describe endocytosis and exocytosis.",hint:"Endo means in. Exo means out.",onRight:()=>{repShot("endo","endo","Endocytosis");repShot("exo","exo","Exocytosis");chk()}});
  const n=document.createElement("div");n.className="note";n.textContent="Pictures of endocytosis and exocytosis are added to your PDF when you answer question 2.";b.appendChild(n)}},
 {label:"3E",sub:"Summary",title:"Active transport summary",scene:null,build:(h,a)=>{
  const b=document.createElement("div");h.appendChild(b);
  L.cloze(b,"p3.e.sum","<p>Active transport moves molecules from {{*low|high}} concentration to {{*high|low}} concentration. It {{*requires|does not require}} energy, usually in the form of {{*ATP|water}}.</p>",{q:"Complete the active transport statement.",onRight:chk});
  L.cloze(b,"p3.e.match",`<p>Match each example to the process.</p><table class="vt" style="width:100%;border-collapse:collapse">${[["Na⁺/K⁺ pump moving 3 Na⁺ out of the cell","ATP pump"],["A vesicle brings a protein into the cell","Endocytosis"],["A vesicle fuses with the membrane and releases its contents","Exocytosis"],["The pump moving K⁺ into the cell against its gradient","ATP pump"]].map(r=>`<tr><td style="border:1px solid #cfd7ee;padding:6px 8px">${r[0]}</td><td style="border:1px solid #cfd7ee;padding:6px 8px">{{${["ATP pump","Endocytosis","Exocytosis"].map(o=>(o===r[1]?"*":"")+o).join("|")}}}</td></tr>`).join("")}</table>`,{q:"Match each example to an ATP pump, endocytosis or exocytosis.",hint:"Endo = in, exo = out, and a pump moves single ions.",onRight:chk});
  const e=document.createElement("div");e.className="box";e.hidden=true;b.appendChild(e);
  reveal=()=>{e.hidden=false;e.innerHTML=`<h3 class="sh" style="margin-top:0">✓ Part 3 complete</h3><p>Your pictures of the pump, endocytosis and exocytosis are saved. Download a PDF of your work so far, or go on to the Summary.</p><div class="czr"><button type="button" class="pbtn ghost" id="pdfb">⬇ Download my PDF so far</button><span class="fb" id="pdfm"></span></div><div class="navrow"><a class="pbtn ghost" href="/u3/ch/p2.html" style="text-decoration:none">← Part 2</a><a class="pbtn" href="/u3/ch/p4.html" style="text-decoration:none">Next: Summary →</a></div>`;e.querySelector("#pdfb").onclick=()=>CH.pdf(e.querySelector("#pdfm"),{partial:"Part 3",partialId:"p3"})};
  if(D.done.p3||done())reveal()}}
]});
api.show(0);
})();
