/* Cellular Homeostasis: small particle simulator for membrane transport (canvas).
   Regions are stacked top to bottom; membranes sit between them.  Scenes are plain objects (see p2.js, p3.js).
   cfg: {mem:[{y, prot:[{t:"channel"|"carrier"|"sglt"|"pump", x, f:[kinds], inside:-1|1}]}], regions:[{name,col}], mols:[{k,n:[..per region]}], rule:{kind:"free"|"slow"|"block"}, speed }  */
(function(){
const G=window.G,C=G.C,W=640,H=560,TH=26;/* TH = half thickness of the membrane band */
const SP={o2:1.15,co2:1.1,h2o:1.1,na:.8,k:.8,glu:.65,aa:.65,sol:.55,atp:.7,adp:.7,pi:.8};
const SC={o2:.5,co2:.5,h2o:.5,na:.55,k:.55,glu:.58,aa:.55,sol:.55,atp:.5,adp:.5,pi:.6,prot:.6};
const spr={};const sp=k=>spr[k]||(spr[k]=(()=>{const c=document.createElement("canvas");c.width=c.height=96;G.mol(c.getContext("2d"),k,48,48,1.5);return c})());
const R=(a,b)=>a+Math.random()*(b-a),ease=u=>u<0?0:u>1?1:u*u*(3-2*u);
class Sim{
 constructor(cv){this.cv=cv;this.x=cv.getContext("2d");this.T=0;this.speed=1;this.paused=false;this.cfg=null;this.ps=[];this.focus=null;this.onTick=null;this._acc=0;
  const f=t=>{const dt=Math.min(.05,(t-(this._l||t))/1000);this._l=t;try{this.frame(dt)}catch(e){console.error(e)}requestAnimationFrame(f)};requestAnimationFrame(f)}
 fit(w){const r=Math.min(devicePixelRatio||1,2);this.cv.style.width=w+"px";this.cv.width=Math.round(w*r);this.cv.height=Math.round(w*H/W*r)}
 load(cfg){this.cfg=cfg;this.T=0;this.ps=[];this.cross={};this.pumpOn=cfg.pumpOn!==false;this.atpUsed=0;this.mems=cfg.mem.map(m=>({y:m.y,prot:m.prot.map(p=>({...p,busy:0,ph:0,open:p.inside?1:0,tmp:null}))}));
  const nr=cfg.mem.length+1;cfg.mols.forEach(m=>{m.n.forEach((n,r)=>{for(let i=0;i<n;i++)this.add(m.k,r)})});this.t0=0}
 bounds(r){const ys=this.mems.map(m=>m.y);const top=r===0?10:ys[r-1]+TH+6,bot=r===ys.length?H-10:ys[r]-TH-6;return[top,bot]}
 add(k,r,x,y){const[t,b]=this.bounds(r),a=Math.random()*6.283;this.ps.push({k,x:x==null?R(24,W-24):x,y:y==null?R(t+8,b-8):y,vx:Math.cos(a),vy:Math.sin(a),tr:null,ph:R(0,6)})}
 region(y){let r=0;this.mems.forEach(m=>{if(y>m.y)r++});return r}
 count(k,r){return this.ps.filter(p=>p.k===k&&(p.tr?p.tr.r0:this.region(p.y))===r).length}
 rule(k){return(this.cfg.rule&&this.cfg.rule[k])||"block"}
 note(k,from,to){const c=this.cross[k]||(this.cross[k]={});const key=from+">"+to;c[key]=(c[key]||0)+1}
 addProt(mi,pr){this.mems[mi].prot.push({...pr,busy:0,ph:0,open:pr.inside?1:0,tmp:null})}
 frame(dt){const d=this.paused?0:dt*this.speed;if(this.cfg&&!this.custom){this.T+=d;this.step(d)}else if(this.custom)this.T+=d;this.draw();if(this.onTick){this._acc+=dt;if(this._acc>.25){this._acc=0;this.onTick()}}}
 /* ---- physics ---- */
 step(dt){if(dt<=0)return;const ps=this.ps;if(this.cfg.refill){this.rf=(this.rf||0)+dt;if(this.rf>1.2){this.rf=0;this.cfg.refill.forEach(f=>{if(this.count(f.k,f.r)<f.min)this.add(f.k,f.r)})}}
  for(let i=ps.length-1;i>=0;i--){const p=ps[i];
   if(p.tr){this.stepTr(p,dt);continue}
   const v=34*(SP[p.k]||.8);p.vx+=R(-1,1)*5*dt;p.vy+=R(-1,1)*5*dt;const l=Math.hypot(p.vx,p.vy)||1;p.vx/=l;p.vy/=l;
   let nx=p.x+p.vx*v*dt,ny=p.y+p.vy*v*dt;
   if(nx<12){nx=12;p.vx=Math.abs(p.vx)}if(nx>W-12){nx=W-12;p.vx=-Math.abs(p.vx)}if(ny<10){ny=10;p.vy=Math.abs(p.vy)}if(ny>H-10){ny=H-10;p.vy=-Math.abs(p.vy)}
   /* membrane crossing */
   let blocked=false;
   for(let mi=0;mi<this.mems.length;mi++){const m=this.mems[mi],top=m.y-TH,bot=m.y+TH;
    const inb0=p.y>top&&p.y<bot,inb1=ny>top&&ny<bot;
    if(inb1&&!inb0||(inb0&&p.free===undefined&&false)){/* entering the band from the top or bottom */
     const fromTop=p.y<=top,r0=mi+(fromTop?0:1),r1=mi+(fromTop?1:0),rule=this.rule(p.k);
     if(rule==="free"||(rule==="slow"&&Math.random()<.22)){p.band=mi;p.bf={from:r0,to:r1};continue}
     if(this.tryProtein(p,mi,fromTop,r0,r1))return;
     blocked=true;ny=fromTop?top-1:bot+1;p.vy=fromTop?-Math.abs(p.vy):Math.abs(p.vy)}
    if(p.band===mi&&!inb1&&p.bf){/* left the band: record crossing */
     const out=ny<=top?mi:mi+1;if(out!==p.bf.from)this.note(p.k,p.bf.from,out);p.band=null;p.bf=null}}
   p.x=nx;p.y=ny}
  this.stepProt(dt)}
 tryProtein(p,mi,fromTop,r0,r1){const m=this.mems[mi];
  for(const pr of m.prot){if(!(pr.f||[]).includes(p.k))continue;const dx=Math.abs(p.x-pr.x);
   if(pr.t==="channel"&&dx<(pr.cap||28)){p.tr={kind:"ch",t:0,d:.55,x0:p.x,y0:p.y,pr,mi,r0,r1,fromTop};return true}
   if((pr.t==="carrier")&&dx<(pr.cap||36)&&pr.busy<=0){pr.busy=1.1;pr.ph=0;pr.dir=fromTop?1:-1;p.tr={kind:"car",t:0,d:1.1,x0:p.x,y0:p.y,pr,mi,r0,r1,fromTop};return true}
   if(pr.t==="sglt"&&fromTop&&dx<(pr.cap||34)&&pr.busy<=0&&this.sgltOk(pr,mi)){const na=this.near("na",r0,pr.x,m.y,2,p);if(na.length<2)continue;pr.busy=.9;pr.ph=0;pr.dir=fromTop?1:-1;
    p.tr={kind:"car",t:0,d:.9,x0:p.x,y0:p.y,pr,mi,r0,r1,fromTop};na.forEach((q,i)=>{q.tr={kind:"car",t:0,d:.9,x0:q.x,y0:q.y,pr,mi,r0,r1,fromTop,off:(i?1:-1)*11}});return true}}
  return false}
 sgltOk(pr,mi){const r0=mi,r1=mi+1;return this.count("na",r0)>=this.count("na",r1)*1.7+2}
 near(k,r,x,y,n,not){return this.ps.filter(q=>q!==not&&q.k===k&&!q.tr&&this.region(q.y)===r).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y)).slice(0,n)}
 stepTr(p,dt){const t=p.tr;if(t.kind==="hold")return;t.t+=dt;const u=Math.min(1,t.t/t.d),m=this.mems[t.mi],top=m.y-TH,bot=m.y+TH,y0=t.fromTop?top:bot,y1=t.fromTop?bot:top,px=t.pr.x+(t.off||0);
  if(t.kind==="ch"){const a=ease(Math.min(1,u*3));p.x=t.x0+(px-t.x0)*a;p.y=t.fromTop?top+(bot-top)*ease(u):bot+(top-bot)*ease(u);if(u<.12)p.y=t.y0+(p.y-t.y0)*u/.12}
  else if(t.kind==="car"){if(u<.3){const e=ease(u/.3);p.x=t.x0+(px-t.x0)*e;p.y=t.y0+(y0-t.y0)*e}else if(u<.5){p.x=px;p.y=y0+(m.y-y0)*ease((u-.3)/.2)}else if(u<.7){p.x=px;p.y=m.y}else{p.x=px;p.y=m.y+(y1-m.y)*ease((u-.7)/.3)}}
  if(u>=1){p.tr=null;p.x=px+R(-4,4);p.y=y1+(t.fromTop?4:-4);p.vy=t.fromTop?1:-1;p.vx=R(-1,1);this.note(p.k,t.r0,t.r1)}}
 stepProt(dt){this.mems.forEach((m,mi)=>m.prot.forEach(pr=>{if(pr.t!=="pump"&&pr.t!=="channel"&&pr.face==null)pr.face=-1;if(pr.busy>0){const D=pr.t==="sglt"?.9:1.1;pr.busy-=dt;const u=1-Math.max(0,pr.busy)/D;pr.ph=u;const start=pr.dir>0?-1:1;pr.face=u<.3?start:u<.7?0:-start}
   if(pr.t==="pump")this.stepPump(pr,mi,dt)}))}
 /* sodium-potassium pump: a 4-phase cycle powered by ATP */
 stepPump(pr,mi,dt){const m=this.mems[mi],inR=mi+(pr.inside>0?1:0),outR=mi+(pr.inside>0?0:1),CY=2.2;
  if(pr.cy==null){if(!this.pumpOn)return;const atp=this.near("atp",inR,pr.x,m.y,1)[0];if(!atp)return;
   const na=this.near("na",inR,pr.x,m.y,3),kk=this.near("k",outR,pr.x,m.y,2);if(!na.length)return;
   pr.cy=0;pr.atp=atp;pr.na=na;pr.kk=kk;[atp,...na,...kk].forEach(q=>{q.tr={kind:"hold",t:0,d:99,r0:this.region(q.y),sx:q.x,sy:q.y}});this.atpUsed++;return}
  pr.cy+=dt/CY;const c=pr.cy,sd=pr.inside,inY=m.y+sd*(TH+14),outY=m.y-sd*(TH+14);
  const mv=(q,tx,ty,u)=>{q.x=q.tr.sx+(tx-q.tr.sx)*ease(u);q.y=q.tr.sy+(ty-q.tr.sy)*ease(u)};
  pr.open=c<.38?1:c<.62?.5:c<.9?0:.5;
  pr.na.forEach((q,i)=>{const ox=(i-1)*9;if(c<.3)mv(q,pr.x+ox,inY,c/.3);else if(c<.4){q.x=pr.x+ox;q.y=inY}else if(c<.7){q.x=pr.x+ox;q.y=inY+(outY-inY)*ease((c-.4)/.3)}else{q.x=pr.x+ox+(c-.7)*60*(i-1);q.y=outY-sd*(c-.7)*40}});
  pr.kk.forEach((q,i)=>{const ox=(i?1:-1)*8;if(c<.45){q.x=q.tr.sx;q.y=q.tr.sy;if(c>.3)mv(q,pr.x+ox,outY,Math.min(1,(c-.3)/.15))}else if(c<.8){q.x=pr.x+ox;q.y=outY+(inY-outY)*ease((c-.45)/.35)}else{q.x=pr.x+ox*(1+(c-.8)*4);q.y=inY+sd*(c-.8)*40}});
  if(c<.3){mv(pr.atp,pr.x,inY+sd*10,c/.3)}else{pr.atp.x=pr.x;pr.atp.y=inY+sd*10}
  if(c>=1){[...pr.na].forEach(q=>{q.tr=null;q.y=outY-sd*26+R(-6,6);q.vy=-sd;q.x=pr.x+R(-30,30);this.note("na",inR,outR)});pr.kk.forEach(q=>{q.tr=null;q.y=inY+sd*26;q.vy=sd;q.x=pr.x+R(-30,30);this.note("k",outR,inR)});
   const a=pr.atp;a.tr=null;a.k="adp";a.vy=sd;a.y=inY+sd*20;this.add("pi",inR,pr.x+R(-26,26),inY+sd*34);pr.cy=null}}
 /* ---- drawing ---- */
 draw(){const x=this.x,r=this.cv.width/W;x.setTransform(r,0,0,r,0,0);if(this.custom){this.custom(x,this.T);return}const cf=this.cfg;if(!cf){x.clearRect(0,0,W,H);return}
  cf.regions.forEach((rg,i)=>{const t=i===0?0:this.mems[i-1].y,b=i===this.mems.length?H:this.mems[i].y;x.fillStyle=rg.col;x.fillRect(0,t,W,b-t)});
  cf.regions.forEach((rg,i)=>{const t=i===0?0:this.mems[i-1].y+TH,b=i===this.mems.length?H:this.mems[i].y-TH;x.font="800 15px 'Open Sans',sans-serif";x.textAlign="left";x.textBaseline="middle";x.fillStyle="rgba(36,26,56,.7)";x.fillText(rg.name,12,i===0?18:t+18)});
  this.mems.forEach(m=>this.drawMem(x,m));
  const f=this.focus;this.ps.forEach(p=>{const on=!f||p.k===f;x.globalAlpha=on?1:.18;const s=SC[p.k]||.5,w=96*s*.8;x.save();x.translate(p.x,p.y);x.rotate(Math.sin(this.T*1.7+p.ph)*.5);x.drawImage(sp(p.k),-w/2,-w/2,w,w);x.restore()});x.globalAlpha=1;
  this.mems.forEach(m=>m.prot.forEach(pr=>{if(pr.t==="pump"&&pr.cy!=null)this.drawPumpLabels(x,pr)}))}
 drawMem(x,m){const pts=[];for(let i=0;i<=40;i++)pts.push([8+i*(W-16)/40,m.y]);
  const sk=m.prot.map(p=>{const hw=p.t==="pump"?42:p.t==="channel"?34:p.t==="aqp"?34:34;return[(p.x-hw-8)/(W-16),(p.x+hw-8)/(W-16)]});
  G.bilayer(x,pts,{gap:12,len:15,hl:5.5,lw:1.8,t:this.T*1.5,wob:this.paused?0:1.3,skip:sk});
  m.prot.forEach(pr=>this.drawProt(x,pr,m))}
 drawProt(x,pr,m){const cx=pr.x,top=m.y-TH-2,bot=m.y+TH+2,h=bot-top;x.save();x.lineWidth=2.5;
  if(pr.t==="channel"){x.fillStyle=C.prot;x.strokeStyle=C.protd;[[cx-28,cx-8],[cx+8,cx+28]].forEach(r=>{x.beginPath();x.roundRect(r[0],top,r[1]-r[0],h,9);x.fill();x.stroke()});x.fillStyle="rgba(180,225,255,.8)";x.fillRect(cx-7,top+2,14,h-4)}
  else{const pump=pr.t==="pump",col=pump?["#e5a24a","#9a5f0e"]:pr.t==="sglt"?["#3b9d8a","#175b4d"]:["#4aa58f","#1e6b59"],hw=pump?32:26;
   let face=pr.face;if(pump){const ins=pr.inside>0?1:-1,c=pr.cy==null?0:pr.cy;face=pr.cy==null?-ins*-1:(c<.38?ins:c<.62?0:c<.9?-ins:0);if(pr.cy==null)face=ins}
   x.fillStyle=col[0];x.strokeStyle=col[1];x.beginPath();x.roundRect(cx-hw,top,hw*2,h,12);x.fill();x.stroke();
   if(face!==0){const y=face<0?top:bot,dy=face<0?1:-1;x.fillStyle="#fbf1d8";x.beginPath();x.moveTo(cx-12,y);x.quadraticCurveTo(cx,y+dy*28,cx+12,y);x.closePath();x.fill();x.stroke()}
   else{x.fillStyle="#fbf1d8";x.fillRect(cx-2,top+12,4,h-24)}
   x.fillStyle=col[1];x.font="800 10px 'Open Sans',sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(pump?"Na⁺/K⁺ pump":pr.t==="sglt"?"Na⁺–glucose":"carrier",cx,m.y+1)}
  x.restore()}
 drawPumpLabels(x,pr){}
 counts(){const o={};const nr=this.mems.length+1;this.ps.forEach(p=>{const r=p.tr?p.tr.r0:this.region(p.y);(o[p.k]||(o[p.k]=Array(nr).fill(0)))[r]++});return o}
 crossed(k,from,to){return(this.cross[k]||{})[from+">"+to]||0}
}
Sim.W=W;Sim.H=H;Sim.TH=TH;window.Sim=Sim;
})();
