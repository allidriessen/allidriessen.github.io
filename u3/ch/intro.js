/* Introduction: zoom from the GI system to the cell membrane. */
(function(){
const L=LAB,D=L.D,G=window.G,C=G.C,W=900,H=550;
const main=CH.init({id:"intro",q:"What is homeostasis, and how do cells keep it going?"});
main.innerHTML=`<div class="steps" id="steps"><span>1 · Digestive system</span><span>2 · Lumen &amp; cells</span><span>3 · A few cells</span><span>4 · The membrane</span></div>
<div id="prompt"></div>
<div id="stage"><canvas id="cv" aria-label="Zoomable picture"></canvas></div>
<div class="ctl" id="ctl" hidden>
 <button type="button" class="pbtn sm ghost" id="pz">❚❚ Pause</button>
 <label>Speed <input type="range" id="spd" min="0.25" max="3" step="0.25" value="1" aria-label="Speed"><b id="spv">1×</b></label>
</div>
<div id="mb" class="mbtns" hidden></div>
<div id="say" class="say"></div>
<div id="qs"></div>
<div id="act" class="bar" style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0"></div>`;
const $=id=>document.getElementById(id),cv=$("cv"),ctx=cv.getContext("2d");
let stage=0,paused=false,spd=1,T=0,sel=new Set(),seen=new Set(),tr=null,wrongApical=0;
const cam={s:1,cx:W/2,cy:H/2};
const R=(a,b)=>a+Math.random()*(b-a);
const ease=u=>u<0?0:u>1?1:u*u*(3-2*u);
/* ---------- canvas sizing ---------- */
function fit(){const r=Math.min(devicePixelRatio||1,2),w=$("stage").parentElement.clientWidth-6,maxH=innerHeight*.6,h=Math.min(w*H/W,maxH),w2=h*W/H;cv.style.width=w2+"px";cv.style.margin="0 auto";cv.width=Math.round(w2*r);cv.height=Math.round(h*r)}
addEventListener("resize",fit);fit();
/* ---------- sprites ---------- */
const SI=k=>k==="glu"?1.8:2.1;const spr={};const sp=k=>spr[k]||(spr[k]=(()=>{const c=document.createElement("canvas");c.width=c.height=128;G.mol(c.getContext("2d"),k,64,64,SI(k));return c})());
/* ---------- scene 0: the digestive system (organs drawn at realistic relative sizes) ---------- */
const OR={},FOOD={path:[],reg:[]};
(function(){
 const cr=(pts,n)=>{n=n||8;const out=[],P=[pts[0]].concat(pts,[pts[pts.length-1]]);for(let i=1;i<P.length-2;i++){const a=P[i-1],b=P[i],c=P[i+1],d=P[i+2];for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;out.push([.5*((2*b[0])+(-a[0]+c[0])*t+(2*a[0]-5*b[0]+4*c[0]-d[0])*t2+(-a[0]+3*b[0]-3*c[0]+d[0])*t3),.5*((2*b[1])+(-a[1]+c[1])*t+(2*a[1]-5*b[1]+4*c[1]-d[1])*t2+(-a[1]+3*b[1]-3*c[1]+d[1])*t3)])}}out.push(pts[pts.length-1]);return out};
 const P2=pts=>{const p=new Path2D();pts.forEach((q,i)=>i?p.lineTo(q[0],q[1]):p.moveTo(q[0],q[1]));return p};
 const mouth=[[450,94],[450,108],[450,124]];
 const eso=cr([[450,124],[450,150],[451,178],[456,206],[466,224]]);
 const stom=cr([[466,224],[508,232],[524,256],[502,280],[470,282]]);
 /* small intestine: duodenum, five coiled rows, ileum */
 let si=[[470,282],[468,298],[458,318],[440,338],[422,352]];
 const row=(y,x0,x1)=>{const o=[],n=10;for(let i=0;i<=n;i++)o.push([x0+(x1-x0)*i/n,y]);return o};
 const turn=(xe,y,dir)=>{const o=[];for(let i=1;i<8;i++){const a=-Math.PI/2+Math.PI*i/8;o.push([xe+dir*10*Math.cos(a),y+10+10*Math.sin(a)])}return o};
 si=si.concat(row(352,422,500),turn(500,352,1),row(372,500,400),turn(400,372,-1),row(392,400,500),turn(500,392,1),row(412,500,400),turn(400,412,-1),row(432,400,470));
 si=si.concat(cr([[470,432],[448,444],[420,452],[392,450],[378,444]]));
 const lg=cr([[372,448],[372,380],[372,340],[376,326],[392,321],[450,329],[508,321],[524,326],[528,340],[528,420],[522,452],[500,470],[474,462],[456,478],[452,500]]);
 const rec=[[452,500],[452,518]];
 OR.mouth={name:"Mouth",pts:mouth};
 OR.esoph={name:"Esophagus",pts:eso,w:11,col:"#e69a9a",edge:"#b05a5a"};
 OR.stomach={name:"Stomach",pts:stom,w:46,col:"#f0a592",edge:"#b86a58"};
 OR.small={name:"Small intestine",pts:si,w:13,col:"#f3b0bb",edge:"#c96a80"};
 OR.large={name:"Large intestine (colon)",pts:lg,w:30,col:"#d9a066",edge:"#a8703a"};
 OR.rect={name:"Rectum",pts:rec,w:20,col:"#c98a50",edge:"#8f5c2a"};
 OR.liver={name:"Liver",fill:"#9a4a3a",edge:"#6a2a20",p:new Path2D("M354,238 C380,214 440,208 474,222 C476,252 462,276 430,286 C396,294 360,278 354,238 Z")};
 ["esoph","stomach","small","large","rect"].forEach(k=>OR[k].p=P2(OR[k].pts));
 /* the food's route: mouth -> anus, with a speed for each region */
 const reg=[["mouth",mouth,38],["esoph",eso,70],["stomach",stom,26],["small",si,46],["large",lg,34],["rect",rec,30]];
 let tot=0;reg.forEach(([n,pts,v])=>{for(let i=0;i<pts.length;i++){FOOD.path.push({x:pts[i][0],y:pts[i][1],v:v,r:n,d:tot});if(i<pts.length-1)tot+=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1])}});
 FOOD.len=tot;
})();
const FCOL=["#6dbb4a","#f08a2a","#e2b66a","#d9473a","#9a6cc4"];
let fp=[];
function foodAt(d){const P=FOOD.path;let lo=0,hi=P.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(P[m].d<=d)lo=m;else hi=m}const a=P[lo],b=P[hi],u=b.d>a.d?Math.min(1,Math.max(0,(d-a.d)/(b.d-a.d))):0;return{x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u,v:a.v,r:a.r}}
function foodInit(){fp=[];for(let i=0;i<16;i++)fp.push({d:-i*FOOD.len/16*.9+R(0,20),c:FCOL[i%FCOL.length],ph:R(0,6),j:R(-3,3)})}
function foodStep(dt){fp.forEach(p=>{if(p.d<0){p.d+=dt*60;return}const f=foodAt(p.d);p.d+=f.v*dt;if(p.d>=FOOD.len){p.d=-R(10,120);p.c=FCOL[Math.floor(R(0,FCOL.length))]}})}
function foodDraw(x,t){fp.forEach(p=>{if(p.d<0)return;const f=foodAt(p.d),u=p.d/FOOD.len,ox=Math.sin(t*3+p.ph)*p.j*.7,oy=Math.cos(t*2.4+p.ph)*p.j*.7;
  let col=p.c,r=7;if(f.r==="stomach"){col=mix(p.c,"#e8cf9a",.6);r=6}else if(f.r==="small"){col="#e9d3a2";r=4.6}else if(f.r==="large"){col=mix("#e9d3a2","#8a5a2a",Math.min(1,(u-.7)*4));r=4.4}else if(f.r==="rect"){col="#7a4a22";r=4.6}else if(f.r==="mouth"){r=8}
  x.beginPath();x.arc(f.x+ox,f.y+oy,r,0,7);x.fillStyle=col;x.fill();x.lineWidth=1.6;x.strokeStyle="rgba(40,30,20,.55)";x.stroke();x.beginPath();x.arc(f.x+ox-r*.3,f.y+oy-r*.3,r*.28,0,7);x.fillStyle="rgba(255,255,255,.55)";x.fill()})}
function mix(a,b,u){const h=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)),A=h(a),B=h(b);return"#"+A.map((v,i)=>Math.round(v+(B[i]-v)*u).toString(16).padStart(2,"0")).join("")}
function drawBody(x,t){
 const bg=x.createLinearGradient(0,0,0,H);bg.addColorStop(0,"#eaf1fb");bg.addColorStop(1,"#dbe6f6");x.fillStyle=bg;x.fillRect(0,0,W,H);
 const skin=C.skin,sk=C.skind;
 /* neck + torso (medium brown skin) */
 x.beginPath();x.moveTo(426,110);x.lineTo(426,150);x.bezierCurveTo(380,154,312,162,300,204);x.bezierCurveTo(296,262,322,330,330,400);x.bezierCurveTo(334,450,320,500,314,H+4);x.lineTo(586,H+4);x.bezierCurveTo(580,500,566,450,570,400);x.bezierCurveTo(578,330,604,262,600,204);x.bezierCurveTo(588,162,520,154,474,150);x.lineTo(474,110);x.closePath();
 x.fillStyle=skin;x.fill();x.lineWidth=5;x.strokeStyle=sk;x.stroke();
 /* head */
 x.beginPath();x.ellipse(450,64,47,58,0,0,7);x.fillStyle=skin;x.fill();x.stroke();
 x.fillStyle=sk;[[432,46],[468,46]].forEach(e=>{x.beginPath();x.ellipse(e[0],e[1],3.6,2.6,0,0,7);x.fill()});x.lineWidth=2.5;x.strokeStyle=sk;x.beginPath();x.moveTo(450,50);x.quadraticCurveTo(445,66,452,68);x.stroke();
 /* open mouth: lips, teeth, tongue */
 x.beginPath();x.ellipse(450,94,21,11,0,0,7);x.fillStyle="#7a2f2f";x.fill();x.lineWidth=3;x.strokeStyle="#5a1f1f";x.stroke();
 x.fillStyle="#fff";x.beginPath();x.roundRect(436,84,28,5,2);x.fill();x.beginPath();x.ellipse(450,98,13,5.5,0,0,7);x.fillStyle="#e0707a";x.fill();
 /* cut-away window */
 x.beginPath();x.moveTo(438,100);x.lineTo(462,100);x.lineTo(462,176);x.bezierCurveTo(500,176,548,186,552,226);x.bezierCurveTo(558,320,560,420,548,500);x.quadraticCurveTo(540,528,450,528);x.quadraticCurveTo(360,528,352,500);x.bezierCurveTo(340,420,342,320,348,226);x.bezierCurveTo(352,186,400,176,438,176);x.closePath();
 x.fillStyle="#f6e6d6";x.fill();x.lineWidth=3;x.strokeStyle="#c9a081";x.stroke();
 const tube=o=>{x.lineCap="round";x.lineJoin="round";x.strokeStyle=o.edge;x.lineWidth=o.w+5;x.stroke(o.p);x.strokeStyle=o.col;x.lineWidth=o.w;x.stroke(o.p)};
 x.fillStyle=OR.liver.fill;x.strokeStyle=OR.liver.edge;x.lineWidth=4;x.fill(OR.liver.p);x.stroke(OR.liver.p);
 x.fillStyle="#7ec27a";x.strokeStyle="#3f7d3b";x.lineWidth=2;x.beginPath();x.ellipse(440,288,7,11,.5,0,7);x.fill();x.stroke();
 tube(OR.esoph);tube(OR.stomach);tube(OR.small);tube(OR.large);tube(OR.rect);
 x.beginPath();x.moveTo(368,456);x.lineTo(360,472);x.lineWidth=7;x.strokeStyle="#a8703a";x.lineCap="round";x.stroke();
 foodDraw(x,t);
 /* labels */
 const lab=(txt,tx,ty,px,py,al)=>{x.strokeStyle="#1c2140";x.lineWidth=2;x.beginPath();x.moveTo(tx+(al==="right"?6:-6),ty);x.lineTo(px,py);x.stroke();x.beginPath();x.arc(px,py,4,0,7);x.fillStyle="#1c2140";x.fill();x.font="700 18px 'Open Sans',sans-serif";x.fillStyle="#1c2140";x.textAlign=al;x.textBaseline="middle";x.fillText(txt,tx,ty)};
 lab("Mouth",388,94,432,94,"right");lab("Liver",292,236,380,240,"right");lab("Large intestine",292,352,370,360,"right");
 lab("Esophagus",506,134,454,150,"left");lab("Stomach",606,238,520,248,"left");lab("Small intestine",606,392,500,392,"left");lab("Rectum",606,484,458,490,"left");lab("Anus",606,522,454,518,"left");
 x.font="800 15px 'Open Sans',sans-serif";x.textAlign="left";x.fillStyle="rgba(255,255,255,.9)";const cap="Food moves from the mouth to the anus";const cw=x.measureText(cap).width+18;x.beginPath();x.roundRect(14,14,cw,28,14);x.fill();x.fillStyle="#1c2140";x.textBaseline="middle";x.fillText(cap,23,29);
 if(stage===0&&!tr){const r=((t*30)%30);x.strokeStyle="rgba(255,255,255,"+(1-r/30)+")";x.lineWidth=5;x.beginPath();x.arc(450,392,54+r,0,7);x.stroke()}}

/* ---------- scene 1: lumen, cells, blood ---------- */
const NC=6,CW=140,CX0=30,cellCx=i=>CX0+CW*i+CW/2,TOP=172,BOT=352;
function cellPath(i){const x0=CX0+CW*i,p=new Path2D();p.moveTo(x0+3,TOP+3);
 for(let j=0;j<7;j++){const mx=x0+14+j*(CW-28)/6;p.lineTo(mx-5,TOP+2);p.lineTo(mx-5,TOP-16);p.quadraticCurveTo(mx,TOP-24,mx+5,TOP-16);p.lineTo(mx+5,TOP+2)}
 p.lineTo(x0+CW-3,TOP+3);p.lineTo(x0+CW-3,BOT-14);p.quadraticCurveTo(x0+CW-3,BOT,x0+CW-17,BOT);p.lineTo(x0+20,BOT);p.quadraticCurveTo(x0+3,BOT,x0+3,BOT-14);p.closePath();return p}
const CP=[...Array(NC)].map((_,i)=>cellPath(i));
function drawTissue(x,t,hint){
 const g=x.createLinearGradient(0,0,0,TOP);g.addColorStop(0,"#fff3d8");g.addColorStop(1,"#fbe0b0");x.fillStyle=g;x.fillRect(-200,-200,W+400,TOP+200);
 x.fillStyle="#efdcc0";x.fillRect(-200,BOT,W+400,H-BOT+200);
 /* capillary */
 x.fillStyle="#d96672";x.fillRect(-200,376,W+400,98);x.fillStyle="#f6a3ad";x.fillRect(-200,382,W+400,86);
 for(let i=0;i<9;i++){const bx=((i*118+t*34)%1100)-100,by=410+((i*37)%40);x.save();x.translate(bx,by);x.fillStyle="#c23a4c";x.strokeStyle="#8f1f30";x.lineWidth=1.5;x.beginPath();x.ellipse(0,0,20,12,0,0,7);x.fill();x.stroke();x.fillStyle="#d9606f";x.beginPath();x.ellipse(0,0,8,5,0,0,7);x.fill();x.restore()}
 /* cells */
 for(let i=0;i<NC;i++){const cx=cellCx(i),x0=CX0+CW*i;
  const gc=x.createLinearGradient(0,TOP,0,BOT);gc.addColorStop(0,"#fbdde3");gc.addColorStop(1,"#f4c6d1");x.fillStyle=gc;x.fill(CP[i]);
  x.lineWidth=4;x.strokeStyle="#bf5a78";x.stroke(CP[i]);
  /* nucleus */
  x.fillStyle="#bba3e6";x.strokeStyle="#6d4fb0";x.lineWidth=3;x.beginPath();x.ellipse(cx,266,30,37,0,0,7);x.fill();x.stroke();x.fillStyle="#7a5bb5";x.beginPath();x.arc(cx-6,262,9,0,7);x.fill();
  /* mitochondria */
  [[cx-44,310,.3],[cx+42,228,-.5]].forEach(([mx,my,r])=>{x.save();x.translate(mx,my);x.rotate(r);x.fillStyle="#f3aa60";x.strokeStyle="#b5651d";x.lineWidth=2.5;x.beginPath();x.ellipse(0,0,19,9,0,0,7);x.fill();x.stroke();x.strokeStyle="#b5651d";x.lineWidth=1.5;x.beginPath();x.moveTo(-11,-5);x.lineTo(-11,3);x.moveTo(-4,-6);x.lineTo(-4,5);x.moveTo(4,-5);x.lineTo(4,6);x.moveTo(11,-4);x.lineTo(11,3);x.stroke();x.restore()});
  if(i>0){x.fillStyle="#7a3b50";[TOP+10,TOP+16].forEach(yy=>{x.beginPath();x.arc(x0,yy,2.6,0,7);x.fill()})}}
 /* hint: glow on the lumen-facing membrane */
 if(hint){x.save();x.globalAlpha=.55+.4*Math.sin(t*5);x.strokeStyle="#ffd21f";x.lineWidth=8;x.lineJoin="round";x.beginPath();CP.forEach((p,i)=>{const x0=CX0+CW*i;x.moveTo(x0+3,TOP+3);for(let j=0;j<7;j++){const mx=x0+14+j*(CW-28)/6;x.lineTo(mx-5,TOP+2);x.lineTo(mx-5,TOP-16);x.quadraticCurveTo(mx,TOP-24,mx+5,TOP-16);x.lineTo(mx+5,TOP+2)}x.lineTo(x0+CW-3,TOP+3)});x.stroke();x.restore()}
 /* labels */
 const pill=(txt,px,py)=>{x.font="800 17px 'Open Sans',sans-serif";const w=x.measureText(txt).width+16;x.fillStyle="rgba(255,255,255,.88)";x.beginPath();x.roundRect(px,py-13,w,26,13);x.fill();x.fillStyle="#1c2140";x.textAlign="left";x.textBaseline="middle";x.fillText(txt,px+8,py+1)};
 pill("LUMEN of the small intestine",330,24);pill("LUMEN",30,24);pill("Epithelial cell",CX0+CW*2+14,336);pill("Epithelial cell",CX0+CW*0+14,336);pill("BLOOD in a capillary",330,432);pill("BLOOD",30,432);pill("Microvilli",CX0+CW*3+34,TOP-34);pill("Nucleus",cellCx(3)-30,266);pill("Mitochondrion",cellCx(1)-60,312)}
/* ---------- molecules ---------- */
const MOL={
 o2:{n:12,v:70,sc:.26,txt:"Oxygen (O₂) is small and nonpolar. There is a lot of O₂ in the blood and little inside the cells, because cells keep using it for cellular respiration. So O₂ moves from the blood into the cells."},
 co2:{n:9,v:70,sc:.26,txt:"Carbon dioxide (CO₂) is a waste product of cellular respiration. It builds up inside the cells, so it moves out into the blood, where it is carried away to be exhaled."},
 h2o:{n:16,v:75,sc:.24,txt:"Water (H₂O) is absorbed from the lumen into the cells and on into the blood. Water also moves the other way. Which direction wins depends on where the water is more concentrated."},
 glu:{n:7,v:48,sc:.3,txt:"Glucose is a sugar that cells use for energy. It is too big and too polar to slip through the membrane, so transport proteins in the membrane carry it from the lumen into the cell and then out to the blood."},
 aa:{n:6,v:48,sc:.3,txt:"Amino acids are the building blocks of proteins. Like glucose, they cross the membrane with help from transport proteins."},
 fa:{n:5,v:48,sc:.3,txt:"Fatty acids come from fat digestion. They are repackaged inside the cell and sent on into the body (many leave through lymph vessels first, but they end up in the blood)."},
 carb:{n:3,v:30,sc:.36,txt:"Starch is a carbohydrate made of many glucose units. It is far too large to be absorbed. Enzymes break it into glucose first."},
 prot:{n:3,v:30,sc:.36,txt:"Proteins from food are huge molecules. Enzymes break them into amino acids before they can be absorbed."},
 lip:{n:3,v:30,sc:.34,txt:"Fats (lipids) are large, too. Enzymes and bile break them into fatty acids that the cells can absorb."}};
const KIND=["o2","co2","h2o","glu","aa","fa","carb","prot","lip"];
const SPLIT={carb:"glu",prot:"aa",lip:"fa"};
let ps=[];
function route(k,x0,ci){const cx=cellCx(ci)+R(-34,34);
 if(k==="o2")return{wp:[[cx,430],[cx,362],[cx,310],[cx+R(-26,26),R(250,290),"end"]],s:[cx+R(-60,60),R(395,455)]};
 if(k==="co2")return{wp:[[cx,300],[cx,360],[cx,420],[cx+380,430,"end"]],s:[cx+R(-20,20),R(230,300)]};
 if(k==="h2o")return{wp:[[cx,185],[cx+R(-20,20),270],[cx,355],[cx,420],[cx+380,430,"end"]],s:[cx+R(-30,30),R(20,140)]};
 if(SPLIT[k])return{wp:[[cx,120],[cx+R(-10,10),138,"split"]],s:[cx+R(-30,30),R(20,70)]};
 return{wp:[[cx,190],[cx+R(-18,18),262],[cx,358],[cx,420],[cx+380,430,"end"]],s:[cx+R(-30,30),R(30,120)]}}
function mk(k,ci,delay){const r=route(k,0,ci);return{k,wp:r.wp,wi:0,x:r.s[0],y:r.s[1],ph:R(0,6),delay:delay||0,ci}}
function init(){ps=[];KIND.forEach(k=>{for(let i=0;i<MOL[k].n;i++)ps.push(mk(k,Math.floor(R(0,NC)),R(0,6)))})}
function respawn(p){const ci=Math.floor(R(0,NC)),r=route(p.k,0,ci);p.wp=r.wp;p.wi=0;p.x=r.s[0];p.y=r.s[1];p.delay=R(.5,3);p.ci=ci}
function stepP(dt){for(let i=ps.length-1;i>=0;i--){const p=ps[i];if(p.delay>0){p.delay-=dt;continue}
  const w=p.wp[p.wi],dx=w[0]-p.x,dy=w[1]-p.y,d=Math.hypot(dx,dy),m=Math.min(d,MOL[p.k].v*dt);
  if(d>0.01){p.x+=dx/d*m;p.y+=dy/d*m}
  if(d<5){if(w[2]==="split"){const ch=SPLIT[p.k];for(let c=0;c<3;c++){const q={k:ch,x:p.x+(c-1)*16,y:p.y+R(-6,6),wp:[[p.x+(c-1)*18,192],[p.x+(c-1)*10,262],[p.x+(c-1)*8,358],[p.x+(c-1)*6,420],[p.x+380,430,"end"]],wi:0,ph:R(0,6),delay:0,once:1};ps.push(q)}respawn(p);p.delay=R(2,6)}
   else if(w[2]==="end"){if(p.once){ps.splice(i,1)}else respawn(p)}else p.wi++}}}
function drawMols(x,t){const any=sel.size>0;
 ps.forEach(p=>{if(p.delay>0)return;const on=!any||sel.has(p.k)||(p.once&&sel.has(Object.keys(SPLIT).find(q=>SPLIT[q]===p.k)));const ox=Math.sin(t*3+p.ph)*2.5,oy=Math.cos(t*2.3+p.ph)*2.5,s=MOL[p.k].sc;
  x.globalAlpha=on?1:.14;if(any&&on){x.fillStyle="rgba(255,255,255,.55)";x.beginPath();x.arc(p.x+ox,p.y+oy,17,0,7);x.fill()}
  x.save();x.translate(p.x+ox,p.y+oy);x.rotate(Math.sin(t*1.4+p.ph)*.5);x.drawImage(sp(p.k),-64*s*2.1/SI(p.k),-64*s*2.1/SI(p.k),128*s*2.1/SI(p.k),128*s*2.1/SI(p.k));x.restore()});x.globalAlpha=1}
/* ---------- drawing & camera ---------- */
function view(x,fn,c,alpha){x.save();x.translate(W/2,H/2);x.scale(c.s,c.s);x.translate(-c.cx,-c.cy);if(alpha!=null)x.globalAlpha=alpha;fn();x.restore()}
function whiteout(x,a){if(a<=0)return;x.fillStyle="rgba(255,255,255,"+Math.min(1,a)+")";x.fillRect(0,0,W,H)}
let clickPt=null;
function frame(now){const dt=Math.min(.05,(now-(frame.l||now))/1000);frame.l=now;
 const sdt=paused?0:dt*spd;T+=sdt;if(stage>=1&&stage<=2&&!tr)stepP(sdt);if(stage===0)foodStep(sdt);
 const r=cv.width/W;ctx.setTransform(r,0,0,r,0,0);
 if(tr){const u=Math.min(1,(now-tr.t0)/tr.dur);tr.draw(u);if(u>=1){const f=tr.done;tr=null;f&&f()}}
 else draw(ctx);
 requestAnimationFrame(frame)}
function draw(x){
 if(stage===0)view(x,()=>drawBody(x,T),cam);
 else if(stage===1||stage===2){view(x,()=>{drawTissue(x,T,stage===2&&wrongApical>=2);drawMols(x,T)},cam)}
 else if(stage===4){G.memScene(x,T,{});drawIcons(x)}}
/* small molecules wandering in the final membrane picture */
const MI=[["glu",.5,.22,.1],["o2",.2,.3,.2],["na",.37,.14,.7],["h2o",.62,.28,.4],["co2",.8,.74,.9],["glu",.3,.78,.5],["h2o",.55,.84,.3],["k",.15,.8,.6]];
function drawIcons(x){MI.forEach(([k,fx,fy,ph])=>{G.mol(x,k,fx*W+Math.sin(T*.9+ph*9)*14,fy*H+Math.cos(T*.7+ph*7)*10,1.25,Math.sin(T+ph*5)*.3)})}
/* ---------- transitions ---------- */
function go(kind,done){const now=performance.now();
 if(kind==="body->tissue"){const tx=450,ty=392;tr={t0:now,dur:2300,done,draw:u=>{if(u<.55){const e=ease(u/.55);view(ctx,()=>drawBody(ctx,T),{s:1+e*6,cx:W/2+(tx-W/2)*e,cy:H/2+(ty-H/2)*e});whiteout(ctx,(e-.55)*2.4)}
   else{const e=ease((u-.55)/.45);stage=1;view(ctx,()=>{drawTissue(ctx,T);drawMols(ctx,T)},{s:.4+.6*e,cx:W/2,cy:H/2});whiteout(ctx,1-e*1.4)}}}}
 else if(kind==="tissue->cells"){const a={...cam};tr={t0:now,dur:1300,done:()=>{cam.s=2;cam.cx=520;cam.cy=282},draw:u=>{const e=ease(u),c={s:a.s+(2-a.s)*e,cx:a.cx+(520-a.cx)*e,cy:a.cy+(282-a.cy)*e};stage=2;cam.s=c.s;cam.cx=c.cx;cam.cy=c.cy;view(ctx,()=>{drawTissue(ctx,T);drawMols(ctx,T)},c)}}}
 else if(kind==="cells->mem"){const tx=clickPt[0],ty=TOP;const a={...cam};tr={t0:now,dur:2400,done,draw:u=>{if(u<.6){const e=ease(u/.6),s=a.s+(16-a.s)*e;view(ctx,()=>{drawTissue(ctx,T);drawMols(ctx,T)},{s,cx:a.cx+(tx-a.cx)*e,cy:a.cy+(ty-a.cy)*e});whiteout(ctx,(e-.5)*2)}
   else{const e=ease((u-.6)/.4);stage=4;ctx.save();ctx.translate(W/2,H/2);ctx.scale(.55+.45*e,.55+.45*e);ctx.translate(-W/2,-H/2);G.memScene(ctx,T,{});drawIcons(ctx);ctx.restore();whiteout(ctx,1-e*1.3)}}}}}
/* ---------- user interface ---------- */
const steps=[...$("steps").children];
function setSteps(){steps.forEach((s,i)=>{const cur=Math.min(stage===4?3:stage===3?2:stage,3);s.className=i<cur?"dn":i===cur?"on":""})}
const say=t=>$("say").innerHTML=t,prompt=t=>$("prompt").innerHTML=t?`<div class="prompt">${t}</div>`:"";
const qsEl=$("qs"),actEl=$("act");
function q0(){qsEl.innerHTML="";const b=document.createElement("div");b.className="box";b.innerHTML=`<h3 class="sh" style="margin-top:0">Homeostasis: a quick review</h3><p class="big"><b>Homeostasis</b> is the process living things use to keep their internal conditions <b>stable</b> (temperature, pH, water, nutrients) even when conditions outside change. A cell does this too. Its <b>cell membrane</b> controls what goes in and what goes out.</p><p class="big">Your <b>gastrointestinal (GI) system</b> is a long tube that breaks food down. Nutrients that are broken down must cross the lining of the <b>small intestine</b> to reach your blood. That is where we are headed.</p><div id="hq"></div>`;qsEl.appendChild(b);const h=b.querySelector("#hq");
 L.choice(h,"intro.homeo1","1. Which statement best describes homeostasis?",["Keeping inside conditions fairly steady when the outside changes","Making the inside of a cell exactly the same as the outside","Stopping every kind of change inside an organism","Making all of the energy that a cell needs from glucose"],0,{explain:"Stable inside, even when the outside changes."});
 L.choice(h,"intro.homeo2","2. Which is an example of a cell helping to maintain homeostasis?",["A membrane letting needed nutrients in and keeping others out","A cell growing larger and larger without any limit","A cell becoming exactly identical to all of its neighbors","A cell losing water until it shrivels and cannot work"],0,{explain:"Controlling what enters and leaves keeps the inside stable."})}
function homeoDone(){return D.mc["intro.homeo1"]&&D.mc["intro.homeo1"].d&&D.mc["intro.homeo2"]&&D.mc["intro.homeo2"].d}
function s0(){stage=0;setSteps();foodInit();$("ctl").hidden=false;cam.s=1;cam.cx=W/2;cam.cy=H/2;cv.className="pt";
 say("<b>Zoomed out:</b> the digestive (GI) system inside the body. Food enters the <b>mouth</b>, travels down the <b>esophagus</b>, and is broken into smaller and smaller pieces in the <b>stomach</b> and <b>small intestine</b>. The <b>large intestine</b> absorbs water, and what is left leaves through the <b>rectum</b> and <b>anus</b>. The moving dots show food on its trip (watch them change as they are digested). Most nutrients are absorbed in the <b>small intestine</b>.");
 prompt("Answer the two review questions below. Then <b>click the small intestine</b> (the long coiled tube in the middle of the belly) to zoom in.");q0();actEl.innerHTML=""}
const NAMEHINT={Liver:"The liver makes bile that helps digest fat, but food does not pass through it.",Stomach:"The stomach starts digesting protein, but very few nutrients are absorbed there.","Large intestine (colon)":"The large intestine mostly absorbs water. Most nutrients are already absorbed before food gets here.",Mouth:"The mouth is where food enters. Teeth and saliva start breaking it up, but no nutrients are absorbed here.",Esophagus:"The esophagus is just a passageway that moves food to the stomach.",Rectum:"The rectum stores waste before it leaves the body."};
cv.addEventListener("pointerdown",e=>{if(tr)return;const b=cv.getBoundingClientRect(),px=(e.clientX-b.left)/b.width*W,py=(e.clientY-b.top)/b.height*H;
 if(stage===0){const c=document.createElement("canvas").getContext("2d");let hit=null;
  [OR.small,OR.large,OR.esoph,OR.rect,OR.liver,OR.stomach].forEach(o=>{if(hit)return;const ok=o.w?(c.lineWidth=o.w+10,c.lineCap="round",c.isPointInStroke(o.p,px,py)):c.isPointInPath(o.p,px,py);if(ok)hit=o});
  if(!hit&&Math.hypot((px-450)/50,(py-64)/60)<1)hit=OR.mouth;
  if(!hit){say("Click on one of the organs. The small intestine is the long coiled tube in the middle of the belly.");return}
  if(hit!==OR.small){say("<b>"+hit.name+".</b> "+(NAMEHINT[hit.name]||"")+" Try the <b>small intestine</b>, the long coiled tube in the middle of the belly.");return}
  if(!homeoDone()){say("First answer the two review questions below, then click the small intestine.");L.flash("Answer the review questions first");return}
  go("body->tissue",s1);return}
 if(stage===2){const m=cam,wx=(px-W/2)/m.s+m.cx,wy=(py-H/2)/m.s+m.cy;const ci=Math.floor((wx-CX0)/CW);
  if(ci<0||ci>=NC){say("Click on one of the cells.");return}
  const x0=CX0+CW*ci;
  if(wy>=TOP-26&&wy<=TOP+10){clickPt=[wx,wy];cv.className="";prompt("");say("<b>Zooming in on the membrane…</b>");go("cells->mem",s4);return}
  wrongApical++;
  if(wy>BOT-14&&wy<BOT+8)say("That membrane faces the <b>blood</b> side of the cell. We need the side facing the <b>lumen</b>, the open space where food passes. Look at the top of the cells.");
  else if(wy>TOP&&wy<BOT&&(wx-x0<10||x0+CW-wx<10))say("That is the membrane between two neighboring cells. Find the membrane that borders the <b>lumen</b>.");
  else if(wy<TOP-26)say("That is the lumen itself (the open space), not a membrane. Click the cell's outline right at the edge of the lumen.");
  else say("That is the inside of the cell. Click on the cell's <b>outline</b> (the membrane) where it borders the lumen.");
  if(wrongApical>=2)say($("say").innerHTML+" <i>(The correct membrane is now glowing yellow.)</i>")}});
cv.addEventListener("pointermove",e=>{if(stage!==2||tr)return;const b=cv.getBoundingClientRect(),px=(e.clientX-b.left)/b.width*W,py=(e.clientY-b.top)/b.height*H,wy=(py-H/2)/cam.s+cam.cy;cv.className=wy>=TOP-26&&wy<=TOP+10?"pt":""});
/* stage 1 */
let mbuilt=false;
function s1(){stage=1;setSteps();cam.s=1;cam.cx=W/2;cam.cy=H/2;cv.className="";init();$("ctl").hidden=false;$("mb").hidden=false;
 if(!mbuilt){mbuilt=true;$("mb").innerHTML=`<button type="button" class="mb" data-k="">Show all</button>`+KIND.map(k=>`<button type="button" class="mb" data-k="${k}"><img alt="" src="${G.icon(k,76)}">${G.NAMES[k].replace(" (starch)","").replace(" (fat)","")}</button>`).join("");
  $("mb").onclick=e=>{const b=e.target.closest(".mb");if(!b)return;const k=b.dataset.k;if(!k){sel.clear()}else{if(sel.has(k))sel.delete(k);else sel.add(k);seen.add(k)}
   [...$("mb").children].forEach(c=>{const kk=c.dataset.k;c.classList.toggle("on",kk?sel.has(kk):sel.size===0);c.classList.toggle("seen",!!kk&&seen.has(kk))});
   const last=[...sel].pop();say(k&&sel.has(k)?"<b>"+G.NAMES[k]+":</b> "+MOL[k].txt:"<b>Showing all molecules.</b> Tap a molecule name to follow just that one.");checkS1()};
  $("mb").children[0].classList.add("on")}
 say("<b>Zoomed in:</b> the lumen (inside of the small intestine), a layer of intestinal cells, and a blood vessel underneath. Molecules are moving everywhere. <b>Tap the molecule buttons</b> to follow each one. Use <b>Pause</b> and <b>Speed</b> to watch more closely.");
 prompt("Follow at least <b>3 different molecules</b>, then answer the two questions below.");
 qsEl.innerHTML="";const b=document.createElement("div");b.className="box";b.innerHTML=`<h3 class="sh" style="margin-top:0">What did you notice?</h3><div id="oq"></div>`;qsEl.appendChild(b);const h=b.querySelector("#oq");
 L.choice(h,"intro.obs1","3. Which molecule is a waste product that moves out of the cells and into the blood?",["O₂","CO₂","Glucose","Amino acids"],1,{explain:"CO₂ is made by cellular respiration and leaves the cell."});
 L.choice(h,"intro.obs2","4. Starch, proteins and fats are far too big to be absorbed. What happens to them first?",["They are broken down into smaller molecules (glucose, amino acids, fatty acids)","They squeeze through the membrane whole","They are turned into O₂","They are pushed back up the esophagus"],0,{explain:"Enzymes at the cell surface chop them into small pieces that can be absorbed."});
 actEl.innerHTML=`<button type="button" class="pbtn" id="zin" disabled>Zoom in on the cells →</button><span class="note" id="znote">Follow 3 molecules and answer both questions to unlock.</span>`;
 $("zin").onclick=()=>{if($("zin").disabled)return;actEl.innerHTML="";qsEl.innerHTML="";$("mb").hidden=true;$("ctl").hidden=false;sel.clear();go("tissue->cells",s2)};
 checkS1()}
function checkS1(){const z=$("zin");if(!z)return;const ok=seen.size>=3&&D.mc["intro.obs1"]&&D.mc["intro.obs1"].d&&D.mc["intro.obs2"]&&D.mc["intro.obs2"].d;z.disabled=!ok&&!CH.teach();$("znote").textContent=ok?"":"Followed "+Math.min(seen.size,3)+" of 3 molecules"+(D.mc["intro.obs1"]&&D.mc["intro.obs1"].d&&D.mc["intro.obs2"]&&D.mc["intro.obs2"].d?"":"; answer both questions")+"."}
setInterval(checkS1,600);
/* stage 2: a few cells, find the lumen membrane */
function s2(){stage=2;setSteps();cv.className="";
 say("<b>Three cells up close.</b> Each cell is wrapped in a <b>cell membrane</b>. The top of each cell has tiny finger-like folds called <b>microvilli</b> that give it more surface for absorbing nutrients. Molecules are still moving, so you can pause or change the speed.");
 prompt("Click on the part of a cell's <b>membrane that borders the lumen</b> (the side facing the food).")}
/* stage 4: the membrane close-up */
function s4(){stage=4;setSteps();$("ctl").hidden=true;
 say("<b>This is the cell membrane, as close as we can see it.</b> It is made of two layers of molecules with many proteins set into them. Molecules in the lumen (above) cannot just walk into the cell (below). In Part 1 you will learn the names of these parts. In Parts 2 and 3 you will find out how molecules cross.");
 prompt("");actEl.innerHTML="";const fin=document.createElement("div");fin.className="lock";fin.innerHTML="✓ <b>Introduction complete.</b> Your answers are saved.";actEl.appendChild(fin);
 CH.unlock();window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"})}
/* controls */
$("pz").onclick=()=>{paused=!paused;$("pz").textContent=paused?"▶ Play":"❚❚ Pause"};
$("spd").oninput=e=>{spd=+e.target.value;$("spv").textContent=spd+"×"};
CH.nav(main,"intro",{label:"Next: Part 1, Membrane Structure →",hint:"Reach the membrane (zoom all the way in) to unlock Part 1."});
if(D.done.intro&&!CH.teach()){/* returning student: go straight to the end view */}
s0();requestAnimationFrame(frame);
window.__intro={go:()=>({stage}),jump:n=>{if(n===1)s1();if(n===2){s1();cam.s=2;cam.cx=520;cam.cy=282;s2()}if(n===4)s4()},setStage:n=>{stage=n}};
})();
