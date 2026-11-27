/* Cellular Homeostasis: shared drawing code (canvas). Original artwork.
   G.mol(ctx,type,x,y,s)  draws a molecule icon centred at x,y (s = scale, 1 = about 40 px wide)
   G.icon(type,px)        small PNG data-URL of an icon (for buttons)
   G.bilayer(ctx,pts,o)   draws a phospholipid bilayer along any centre-line (open or closed) */
(function(){
const G=window.G={};
const C={O:"#e23b3b",Od:"#8f1414",H:"#ffffff",Hd:"#8796a5",C:"#3b3f46",P:"#f0a020",Pd:"#9a6208",N:"#3f6fd6",ad:"#8a5fc8",ink:"#241a38",
 head:"#f3c14b",headd:"#b57d0b",tail:"#e9a43a",prot:"#6f8fd8",protd:"#38539a",carr:"#4aa58f",carrd:"#1e6b59",enz:"#d96a8a",enzd:"#8d2f4f",
 lumen:"#fbe9c9",cyto:"#f6d3d9",blood:"#e8707a",skin:"#a9774f",skind:"#7e5232"};
G.C=C;
const sph=(x,t,y,r,fill,line,txt,col)=>{x.beginPath();x.arc(t,y,r,0,7);x.fillStyle=fill;x.fill();x.lineWidth=Math.max(1,r*.14);x.strokeStyle=line;x.stroke();if(txt){x.fillStyle=col||"#fff";x.font="700 "+Math.round(r*1.1)+"px 'Open Sans',sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(txt,t,y+r*.05)}};
const bond=(x,a,b,c,d,w,col)=>{x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.lineWidth=w;x.strokeStyle=col||"#5b6775";x.lineCap="round";x.stroke()};
const dbond=(x,a,b,c,d,w)=>{const dx=c-a,dy=d-b,l=Math.hypot(dx,dy)||1,nx=-dy/l*w*1.1,ny=dx/l*w*1.1;bond(x,a+nx,b+ny,c+nx,d+ny,w);bond(x,a-nx,b-ny,c-nx,d-ny,w)};
const text=(x,t,a,b,sz,col,al)=>{x.fillStyle=col||C.ink;x.font="700 "+sz+"px 'Open Sans',sans-serif";x.textAlign=al||"center";x.textBaseline="middle";x.fillText(t,a,b)};
G.NAMES={o2:"O₂",co2:"CO₂",h2o:"H₂O",glu:"Glucose",atp:"ATP",adp:"ADP",pi:"Pᵢ",na:"Na⁺",k:"K⁺",aa:"Amino acid",fa:"Fatty acid",prot:"Protein",lip:"Lipid (fat)",carb:"Carbohydrate (starch)",sol:"Large solute"};
/* every icon is drawn in a box about 40 wide, centred on (0,0) */
G.mol=(x,type,px,py,s,rot)=>{s=s||1;x.save();x.translate(px,py);x.rotate(rot||0);x.scale(s,s);x.lineJoin="round";
 switch(type){
 case"o2":dbond(x,-9,0,9,0,2.4);sph(x,-11,0,9,C.O,C.Od);sph(x,11,0,9,C.O,C.Od);break;
 case"co2":dbond(x,-17,0,0,0,2);dbond(x,0,0,17,0,2);sph(x,-18,0,8.5,C.O,C.Od);sph(x,18,0,8.5,C.O,C.Od);sph(x,0,0,7.5,C.C,"#15181c");break;
 case"h2o":{const a=52*Math.PI/180;bond(x,0,2,-Math.sin(a)*15,2-Math.cos(a)*15,3);bond(x,0,2,Math.sin(a)*15,2-Math.cos(a)*15,3);
  sph(x,0,3,10,C.O,C.Od);sph(x,-Math.sin(a)*16,2-Math.cos(a)*16,6,C.H,C.Hd);sph(x,Math.sin(a)*16,2-Math.cos(a)*16,6,C.H,C.Hd);break}
 case"glu":{/* glucose ring: hexagon with the ring oxygen, four OH groups and a CH2OH arm (no text labels) */
  const R=12,pts=[0,1,2,3,4,5].map(i=>{const a=-Math.PI/2+i*Math.PI/3+Math.PI/6;return[Math.cos(a)*R,Math.sin(a)*R+4]});
  x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.fillStyle="#fff1c9";x.fill();x.lineWidth=2.4;x.strokeStyle="#5b6775";x.stroke();
  const oh=i=>{const p=pts[i],a=Math.atan2(p[1]-4,p[0]),qx=p[0]+Math.cos(a)*8,qy=p[1]+Math.sin(a)*8;bond(x,p[0],p[1],qx,qy,2);sph(x,qx,qy,3.6,C.O,C.Od);sph(x,qx+Math.cos(a)*5,qy+Math.sin(a)*5,2.2,C.H,C.Hd)};
  sph(x,pts[0][0],pts[0][1],4.6,C.O,C.Od);
  oh(1);oh(2);oh(3);oh(4);
  bond(x,pts[5][0],pts[5][1],pts[5][0]-2,pts[5][1]-8,2);sph(x,pts[5][0]-2,pts[5][1]-9,3.4,C.C,"#15181c");bond(x,pts[5][0]-2,pts[5][1]-9,pts[5][0]-2,pts[5][1]-16,2);sph(x,pts[5][0]-2,pts[5][1]-17,3.4,C.O,C.Od);break}
 case"adp":case"atp":{/* adenine (two rings), ribose, then phosphate chain */
  const n=type==="atp"?3:2;
  x.translate(-8*(n-1)-4+4,0);
  /* adenine: 6-ring + 5-ring */
  const hex=(cx,cy,r)=>{x.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;i?x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r):x.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}x.closePath();x.fillStyle="#d9c8f2";x.fill();x.lineWidth=1.6;x.strokeStyle=C.ad;x.stroke()};
  hex(-12,-10,7);x.beginPath();[[-5,-14],[-1,-9],[-5,-4],[-12,-3]].forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.fillStyle="#cdb6ee";x.fill();x.strokeStyle=C.ad;x.stroke();
  text(x,"N",-12,-11,6,C.ad);
  /* ribose pentagon */
  x.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*2*Math.PI/5;i?x.lineTo(2+Math.cos(a)*6.5,6+Math.sin(a)*6.5):x.moveTo(2+Math.cos(a)*6.5,6+Math.sin(a)*6.5)}x.closePath();x.fillStyle="#cfe9f7";x.fill();x.lineWidth=1.6;x.strokeStyle="#3b7aa0";x.stroke();
  bond(x,-6,-3,-1,1,1.6,C.ad);
  for(let i=0;i<n;i++){const px2=14+i*14;bond(x,px2-8,8,px2-3,8,2);sph(x,px2+2,8,6.4,C.P,C.Pd,"P",C.Pd)}
  break}
 case"pi":sph(x,0,0,9,C.P,C.Pd,"P",C.Pd);text(x,"i",8,6,8,C.Pd);break;
 case"na":sph(x,0,0,10,"#7aa0f0",C.protd,"Na⁺","#0f2a66");break;
 case"k":sph(x,0,0,11,"#c88fe0","#6c2e86","K⁺","#3d1152");break;
 case"aa":sph(x,0,0,8,"#7fc99a","#2b7d4c","aa","#0d3f21");break;
 case"fa":x.beginPath();x.moveTo(-14,0);x.bezierCurveTo(-8,-8,-2,8,4,0);x.bezierCurveTo(8,-4,12,-3,14,0);x.lineWidth=3;x.strokeStyle="#e0a020";x.stroke();sph(x,-14,0,4.2,"#fff1c0","#b57d0b");break;
 case"prot":x.beginPath();x.moveTo(-17,-3);x.bezierCurveTo(-12,-14,-6,8,-1,-3);x.bezierCurveTo(4,-14,8,10,12,-1);x.bezierCurveTo(14,-6,16,4,18,2);x.lineWidth=5;x.strokeStyle="#2b7d4c";x.lineCap="round";x.stroke();[-15,-5,6,16].forEach((a,i)=>sph(x,a,i%2?3:-4,4,["#7fc99a","#a5dcb7","#4fa874","#8ccfa2"][i],"#2b7d4c"));break;
 case"lip":bond(x,-14,0,-6,0,3,"#8d6a2a");[-8,0,8].forEach((yy,i)=>{bond(x,-8,yy*.6,-3,yy,2.5,"#8d6a2a");x.beginPath();x.moveTo(-3,yy);x.bezierCurveTo(3,yy-5,9,yy+5,17,yy);x.lineWidth=3;x.strokeStyle="#e0a020";x.stroke()});sph(x,-14,0,4.5,"#fff1c0","#b57d0b");break;
 case"carb":[-14,-1,12].forEach((a,i)=>{x.beginPath();for(let k=0;k<6;k++){const an=k*Math.PI/3+Math.PI/6,xx=a+Math.cos(an)*7,yy=(i%2?4:-4)+Math.sin(an)*7;k?x.lineTo(xx,yy):x.moveTo(xx,yy)}x.closePath();x.fillStyle="#fff7e0";x.fill();x.lineWidth=2;x.strokeStyle="#8d6a2a";x.stroke()});break;
 case"sol":sph(x,0,0,13,"#8a6fd0","#4b2e83");sph(x,-4,-4,3.5,"#c8b8ee","#8a6fd0");break;
 }x.restore()};
G.icon=(type,px)=>{const c=document.createElement("canvas"),r=2;px=px||44;c.width=c.height=px*r;const x=c.getContext("2d");x.scale(r,r);G.mol(x,type,px/2,px/2,px/Math.max(46,({atp:80,adp:66,glu:66,co2:58})[type]||0));return c.toDataURL("image/png")};

/* ---- phospholipid bilayer along a centre-line.  pts: [[x,y],...]  closed: true for a vesicle (outer leaflet faces OUT)
   o: {gap, len, wob(t) wobble amount, hl (head radius), skip:[[a,b]...] fraction ranges with no lipids (protein sits there), side:"both"|"out"|"in"} */
G.bilayer=(x,pts,o)=>{o=o||{};const gap=o.gap||13,L=o.len||19,hr=o.hl||5.6,t=o.t||0,wob=o.wob||0,closed=!!o.closed;
 const seg=[];let tot=0;const P=closed?pts.concat([pts[0]]):pts;
 for(let i=0;i<P.length-1;i++){const dx=P[i+1][0]-P[i][0],dy=P[i+1][1]-P[i][1],l=Math.hypot(dx,dy);seg.push([P[i],dx,dy,l,tot]);tot+=l}
 const at=d=>{for(const s of seg){if(d<=s[4]+s[3]||s===seg[seg.length-1]){const u=Math.min(1,Math.max(0,(d-s[4])/(s[3]||1)));return{x:s[0][0]+s[1]*u,y:s[0][1]+s[2]*u,nx:-s[2]/(s[3]||1),ny:s[1]/(s[3]||1)}}}};
 const n=Math.max(2,Math.round(tot/gap)),skip=o.skip||[];
 const lip=(p,sgn,k)=>{const ph=Math.sin(t*1.7+k*2.1)*wob,wy=Math.cos(t*1.3+k*1.7)*wob*.6;
  /* head at +/- (L+hr) from centre-line; two tails run toward the centre */
  const hx=p.x+p.nx*sgn*(L+hr)+p.ny*ph*.0,hy=p.y+p.ny*sgn*(L+hr);
  const tx=p.nx*sgn,ty=p.ny*sgn,px2=-ty,py2=tx,sp=4,sway=ph;
  [-1,1].forEach(side=>{const bx=hx+px2*sp*side,by=hy+py2*sp*side;x.beginPath();x.moveTo(bx-tx*hr*.6,by-ty*hr*.6);
   x.bezierCurveTo(bx-tx*L*.4+px2*sway*side,by-ty*L*.4+py2*sway*side,bx-tx*L*.7-px2*sway*side*.6,by-ty*L*.7-py2*sway*side*.6,bx-tx*(L+hr*.7)+px2*sway*.3,by-ty*(L+hr*.7)+py2*sway*.3);
   x.lineWidth=o.lw||2.3;x.lineCap="round";x.strokeStyle=C.tail;x.stroke()});
  sph(x,hx,hy,hr,C.head,C.headd)};
 for(let i=0;i<n;i++){const f=i/n;if(skip.some(r=>f>=r[0]&&f<=r[1]))continue;const p=at(f*tot);
  if(o.side!=="in")lip(p,-1,i);if(o.side!=="out")lip(p,1,i+50)}
 return{len:tot,at}};
/* ---------- the membrane close-up (shared by the Introduction and Part 1) ----------
   Fixed layout in a W x H box.  Returns the places a student can label (in box coordinates). */
G.MEM={W:900,H:520,Y:268,L:27,HR:8.5,GAP:20,PX:{ch:250,ca:470,en:700}};
G.memSpots=()=>{const m=G.MEM,Y=m.Y,t=m.L+m.HR*2;return{
 head:[118,Y-m.L-m.HR],tails:[352,Y-m.L*0.45],bilayer:[60,Y],channel:[m.PX.ch,Y],carrier:[m.PX.ca,Y],enzyme:[m.PX.en,Y-6],lumen:[520,70],cyto:[520,Y+t+90]}};
G.memScene=(x,t,o)=>{o=o||{};const m=G.MEM,W=m.W,H=m.H,Y=m.Y,L=m.L,HR=m.HR,T=L+HR*2;
 const g1=x.createLinearGradient(0,0,0,Y);g1.addColorStop(0,"#fff4dc");g1.addColorStop(1,"#fbe3b8");x.fillStyle=g1;x.fillRect(0,0,W,Y);
 const g2=x.createLinearGradient(0,Y,0,H);g2.addColorStop(0,"#f8d6dd");g2.addColorStop(1,"#f3c3cf");x.fillStyle=g2;x.fillRect(0,Y,W,H-Y);
 const pw=[[m.PX.ch-48,m.PX.ch+48],[m.PX.ca-46,m.PX.ca+46],[m.PX.en-44,m.PX.en+44]],skip=pw.map(r=>[(r[0]-14)/(W-28),(r[1]-14)/(W-28)]);
 const pts=[];for(let i=0;i<=44;i++)pts.push([14+i*(W-28)/44,Y]);
 G.bilayer(x,pts,{gap:m.GAP,len:L,hl:HR,lw:3,t,wob:o.still?0:2.4,skip});
 const prot=(cx,fill,line)=>{x.fillStyle=fill;x.strokeStyle=line;x.lineWidth=3};
 /* channel protein: two subunits with a water-filled pore between */
 {const cx=m.PX.ch,top=Y-T-3,h=2*T+6;x.save();x.fillStyle=C.prot;x.strokeStyle=C.protd;x.lineWidth=3;
  [[cx-46,cx-14],[cx+14,cx+46]].forEach(r=>{x.beginPath();x.roundRect(r[0],top,r[1]-r[0],h,13);x.fill();x.stroke()});
  x.fillStyle="rgba(180,225,255,.75)";x.fillRect(cx-12,top+2,24,h-4);
  x.fillStyle="#9fb6ec";[[-30,.25],[-30,.62],[30,.35],[30,.7]].forEach(([dx,f])=>{x.beginPath();x.arc(cx+dx,top+h*f,5,0,7);x.fill()});x.restore()}
 /* carrier protein: one blob with a pocket open to the lumen side */
 {const cx=m.PX.ca,top=Y-T-3,bot=Y+T+3;x.save();x.fillStyle=C.carr;x.strokeStyle=C.carrd;x.lineWidth=3;x.beginPath();
  x.moveTo(cx-46,top+12);x.quadraticCurveTo(cx-46,top,cx-34,top);x.lineTo(cx-18,top);x.quadraticCurveTo(cx-10,top+4,cx-10,top+22);x.quadraticCurveTo(cx,top+44,cx+10,top+22);x.quadraticCurveTo(cx+10,top+4,cx+18,top);x.lineTo(cx+34,top);x.quadraticCurveTo(cx+46,top,cx+46,top+12);
  x.lineTo(cx+46,bot-12);x.quadraticCurveTo(cx+46,bot,cx+34,bot);x.lineTo(cx-34,bot);x.quadraticCurveTo(cx-46,bot,cx-46,bot-12);x.closePath();x.fill();x.stroke();x.restore()}
 /* enzyme: surface protein with an active-site notch */
 {const cx=m.PX.en,top=Y-T-34,bot=Y+T+3;x.save();x.fillStyle=C.enz;x.strokeStyle=C.enzd;x.lineWidth=3;x.beginPath();
  x.moveTo(cx-44,top+22);x.quadraticCurveTo(cx-44,top,cx-26,top);x.lineTo(cx-16,top);x.quadraticCurveTo(cx-10,top+4,cx-12,top+18);x.quadraticCurveTo(cx,top+34,cx+12,top+18);x.quadraticCurveTo(cx+10,top+4,cx+16,top);x.lineTo(cx+26,top);x.quadraticCurveTo(cx+44,top,cx+44,top+22);
  x.lineTo(cx+44,bot-12);x.quadraticCurveTo(cx+44,bot,cx+32,bot);x.lineTo(cx-32,bot);x.quadraticCurveTo(cx-44,bot,cx-44,bot-12);x.closePath();x.fill();x.stroke();
  /* substrate fitting the notch */
  x.fillStyle="#fff3c0";x.strokeStyle="#b57d0b";x.lineWidth=2;x.beginPath();x.roundRect(cx-10,top-14+Math.sin(t*2)*2,20,16,5);x.fill();x.stroke();x.restore()}
 return pw};
(x,a,b,w,h,r)=>{x.beginPath();x.roundRect?x.roundRect(a,b,w,h,r):x.rect(a,b,w,h)};

/* ---------- static teaching diagrams ---------- */
const arrow=(x,a,b,c,d,col,w)=>{x.save();x.strokeStyle=col;x.fillStyle=col;x.lineWidth=w||4;x.lineCap="round";x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();const an=Math.atan2(d-b,c-a),h=(w||4)*2.6;x.beginPath();x.moveTo(c,d);x.lineTo(c-Math.cos(an-.45)*h,d-Math.sin(an-.45)*h);x.lineTo(c-Math.cos(an+.45)*h,d-Math.sin(an+.45)*h);x.closePath();x.fill();x.restore()};
const pill=(x,t,px,py,col)=>{x.font="800 14px 'Open Sans',sans-serif";const w=x.measureText(t).width+18;x.fillStyle="#fff";x.strokeStyle=col||"#3a56a8";x.lineWidth=2.5;x.beginPath();x.roundRect(px,py-13,w,26,13);x.fill();x.stroke();x.fillStyle="#241a38";x.textAlign="left";x.textBaseline="middle";x.fillText(t,px+9,py+1);return w};
const numc=(x,n,px,py)=>{x.beginPath();x.arc(px,py,13,0,7);x.fillStyle="#3a56a8";x.fill();x.fillStyle="#fff";x.font="800 15px 'Open Sans',sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(n,px,py+1)};
const memLine=(x,W,y,prots)=>{const pts=[];for(let i=0;i<=40;i++)pts.push([8+i*(W-16)/40,y]);G.bilayer(x,pts,{gap:12,len:15,hl:5.5,lw:1.8,skip:prots.map(p=>[(p.x-p.hw-8)/(W-16),(p.x+p.hw-8)/(W-16)])});
 prots.forEach(p=>{const top=y-34,h=68;x.save();x.lineWidth=2.5;x.fillStyle=p.col[0];x.strokeStyle=p.col[1];x.beginPath();x.roundRect(p.x-p.hw,top,p.hw*2,h,12);x.fill();x.stroke();
  if(p.t==="channel"){x.fillStyle="rgba(180,225,255,.85)";x.fillRect(p.x-6,top+2,12,h-4)}else{x.fillStyle="#fbf1d8";x.beginPath();x.moveTo(p.x-12,top);x.quadraticCurveTo(p.x,top+26,p.x+12,top);x.closePath();x.fill();x.stroke()}
  x.restore()})};
/* glucose uptake: three proteins working together (640 x 340) */
G.dGluc=x=>{const W=640,H=340,Y1=96,Y2=250;x.fillStyle="#fff1d6";x.fillRect(0,0,W,Y1);x.fillStyle="#f9d9e0";x.fillRect(0,Y1,W,Y2-Y1);x.fillStyle="#f6b8c0";x.fillRect(0,Y2,W,H-Y2);
 x.font="800 14px 'Open Sans',sans-serif";x.fillStyle="rgba(36,26,56,.7)";x.textAlign="left";x.textBaseline="middle";x.fillText("LUMEN (lots of Na⁺)",10,16);x.fillText("INSIDE THE CELL (little Na⁺)",10,Y1+46);x.fillText("BLOOD",10,H-14);
 memLine(x,W,Y1,[{x:210,hw:34,t:"carrier",col:["#3b9d8a","#175b4d"]}]);
 memLine(x,W,Y2,[{x:210,hw:30,t:"carrier",col:["#4aa58f","#1e6b59"]},{x:470,hw:38,t:"carrier",col:["#e5a24a","#9a5f0e"]}]);
 x.fillStyle="#175b4d";x.font="800 10px 'Open Sans',sans-serif";x.textAlign="center";x.fillText("Na⁺–glucose",210,Y1+1);x.fillText("carrier",210,Y1+13);x.fillStyle="#1e6b59";x.fillText("glucose",210,Y2+1);x.fillText("carrier",210,Y2+13);x.fillStyle="#9a5f0e";x.fillText("Na⁺/K⁺ pump",470,Y2+6);
 [[60,40],[150,74],[360,30],[400,70],[520,60],[600,70],[330,66]].forEach(a=>G.mol(x,"na",a[0],a[1],.9));[[110,62],[280,52],[560,40]].forEach(a=>G.mol(x,"glu",a[0],a[1],.85));
 G.mol(x,"na",380,140,.9);[[100,175],[270,140],[330,214],[560,175]].forEach(a=>G.mol(x,"k",a[0],a[1],.9));G.mol(x,"glu",120,215,.85);
 [[90,300],[330,296],[560,300]].forEach(a=>G.mol(x,"na",a[0],a[1],.9));[[600,300]].forEach(a=>G.mol(x,"glu",a[0],a[1],.85));
 arrow(x,196,44,196,Y1-38,"#2b7d4c",5);arrow(x,224,44,224,Y1-38,"#3f6fd6",5);arrow(x,196,Y1+38,196,Y1+74,"#2b7d4c",5);arrow(x,224,Y1+38,224,Y1+74,"#3f6fd6",5);
 arrow(x,210,Y2-74,210,Y2-38,"#2b7d4c",5);arrow(x,210,Y2+38,210,Y2+72,"#2b7d4c",5);
 arrow(x,424,Y2-52,424,Y2+66,"#3f6fd6",5);arrow(x,516,Y2+66,516,Y2-52,"#8a5fc8",4);
 numc(x,"1",214,Y2-62);numc(x,"2",300,Y1-6);numc(x,"3",262,Y2+36);
 pill(x,"Pump uses ATP: Na⁺ out, K⁺ in",232,Y2-62,"#c0762b");pill(x,"Na⁺ flows in and pulls glucose along",318,Y1-6);pill(x,"Glucose exits (no ATP)",280,Y2+36);
 /* labels for the arrows' colors are the icons themselves */
};
/* Na+ / K+ gradients with the pump ON or OFF (320 x 280) */
G.dGrad=(x,on)=>{const W=320,H=280,Y=150;x.fillStyle="#f9d9e0";x.fillRect(0,0,W,Y);x.fillStyle="#f6b8c0";x.fillRect(0,Y,W,H-Y);
 x.font="800 13px 'Open Sans',sans-serif";x.fillStyle="rgba(36,26,56,.7)";x.textAlign="left";x.textBaseline="middle";x.fillText("INSIDE THE CELL",8,14);x.fillText("OUTSIDE (BLOOD)",8,H-14);
 memLine(x,W,Y,[{x:60,hw:20,t:"channel",col:["#6f8fd8","#38539a"]},{x:260,hw:20,t:"channel",col:["#6f8fd8","#38539a"]},{x:160,hw:30,t:"carrier",col:on?["#e5a24a","#9a5f0e"]:["#c9c3b6","#8a8578"]}]);
 x.fillStyle=on?"#9a5f0e":"#6d675a";x.font="800 10px 'Open Sans',sans-serif";x.textAlign="center";x.fillText("pump",160,Y+1);
 const inK=on?[[40,50],[100,40],[170,56],[230,46],[290,60],[130,90],[210,100]]:[[40,50],[170,56],[290,60],[130,96]],inN=on?[[260,100]]:[[100,44],[230,48],[210,102]],
  outN=on?[[40,214],[100,240],[170,222],[230,246],[290,220],[130,252]]:[[40,214],[170,222],[290,230]],outK=on?[[230,200]]:[[100,236],[230,246],[130,200]];
 inK.forEach(a=>G.mol(x,"k",a[0],a[1],.8));inN.forEach(a=>G.mol(x,"na",a[0],a[1],.8));outN.forEach(a=>G.mol(x,"na",a[0],a[1],.8));outK.forEach(a=>G.mol(x,"k",a[0],a[1],.8));
 arrow(x,60,Y-42,60,Y+42,"#9aa6c8",2.5);arrow(x,260,Y+42,260,Y-42,"#9aa6c8",2.5);
 if(on){arrow(x,122,Y-48,122,Y+50,"#3f6fd6",5);arrow(x,198,Y+50,198,Y-48,"#8a5fc8",4)}};
G.diag=(w,h,fn,alt)=>{const c=document.createElement("canvas"),r=2;c.width=w*r;c.height=h*r;c.style.width="100%";c.style.maxWidth=w+"px";c.style.height="auto";c.style.border="2px solid #cfd7ee";c.style.borderRadius="10px";c.setAttribute("role","img");c.setAttribute("aria-label",alt||"");const x=c.getContext("2d");x.scale(r,r);fn(x);return c};
G.text=text;G.sph=sph;G.bond=bond;
})();
