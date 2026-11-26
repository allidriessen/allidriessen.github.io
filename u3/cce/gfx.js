/* Stylized tissue diagrams for the "benign or malignant?" challenge (Part 2).
   GFX.tumor(kind, level, seed, uid)  ->  SVG string
     kind  : 0 = benign, 1 = malignant
     level : 1 (easiest) to 3 (hardest)
   Every picture is drawn from code, so each student can get slightly different shapes. */
window.GFX=(function(){
const rng=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const f1=n=>n.toFixed(1);
const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
function smooth(P){const n=P.length;let s=mid(P[n-1],P[0]),d=`M${f1(s[0])},${f1(s[1])}`;for(let i=0;i<n;i++){const e=mid(P[i],P[(i+1)%n]);d+=`Q${f1(P[i][0])},${f1(P[i][1])} ${f1(e[0])},${f1(e[1])}`}return d+"Z"}
function inside(P,x,y){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
function blob(R,x,y,r,j,n){n=n||9;const P=[];for(let i=0;i<n;i++){const a=i/n*6.2832,k=r*(1+(R()-.5)*2*j);P.push([x+Math.cos(a)*k,y+Math.sin(a)*k])}return smooth(P)}
const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t)),rgb=a=>`rgb(${a})`;
/* the basement membrane: a gently wavy line. "bow" pushes it downward under a benign growth (still unbroken) */
const bm=(x,bow)=>128+3.5*Math.sin(x/21+1)+(bow||0)*Math.exp(-Math.pow((x-150)/62,2));

/* cells that fill a growth */
function fillCells(poly,R,o){
 let xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),out=[];
 const nucC=rgb(mix([176,150,214],[48,22,92],o.nu));
 if(o.order){ /* neat, evenly sized cells in a tight, regular pattern */
  const r=o.r,dx=r*1.96,dy=r*1.72;let row=0;
  for(let y=y0+r*.6;y<y1+r;y+=dy,row++)for(let x=x0+(row%2?r:0);x<x1+r;x+=dx){
   const px=x+(R()-.5)*r*.12,py=y+(R()-.5)*r*.12;if(!inside(poly,px,py))continue;
   const rr=r*(1+o.rv*(R()-.5)),nr=rr*(.34+(R()-.5)*.06*(1+o.rv*4));
   out.push(`<path d="${blob(R,px,py,rr*.97,.05,9)}" fill="${o.fill}" stroke="${o.stroke}" stroke-width="1.4"/><circle cx="${f1(px+(R()-.5)*rr*.12)}" cy="${f1(py+(R()-.5)*rr*.12)}" r="${f1(nr)}" fill="${nucC}"/>`)}
  return out.join("")}
 /* crowded, overlapping cells of many sizes and shapes */
 const placed=[];let tries=0;
 while(tries++<1400&&placed.length<o.max){const x=x0+R()*(x1-x0),y=y0+R()*(y1-y0);if(!inside(poly,x,y))continue;
  const rr=o.r*(o.rmin+R()*(o.rmax-o.rmin));if(placed.some(p=>Math.hypot(p.x-x,p.y-y)<(p.r+rr)*o.gap))continue;placed.push({x,y,r:rr})}
 placed.sort((a,b)=>a.y-b.y).forEach(p=>{const nr=p.r*(.46+R()*.16);
  out.push(`<path d="${blob(R,p.x,p.y,p.r,.3,10)}" fill="${o.fill}" stroke="${o.stroke}" stroke-width="1.6"/><path d="${blob(R,p.x+(R()-.5)*p.r*.4,p.y+(R()-.5)*p.r*.4,nr,.32,9)}" fill="${nucC}" stroke="${rgb(mix([48,22,92],[20,8,50],.5))}" stroke-width=".8"/>`)});
 return out.join("")}

function scene(R,uid){
 let s=`<rect width="300" height="260" fill="#fdf1ee"/><rect y="124" width="300" height="140" fill="#fbe6ee"/>`;
 for(let k=0;k<16;k++){const x=R()*300,y=140+R()*110;s+=`<path d="M${f1(x)},${f1(y)}q${f1(18+R()*14)},${f1(-6-R()*8)} ${f1(40+R()*20)},${f1(R()*8-4)}" fill="none" stroke="#efb9c9" stroke-width="1.3" opacity=".7"/>`}
 [[58,205],[246,218]].forEach(v=>{s+=`<circle cx="${v[0]}" cy="${v[1]}" r="15" fill="#fff6f6" stroke="#d98aa3" stroke-width="2.5"/>`;for(let k=0;k<4;k++)s+=`<ellipse cx="${v[0]-6+k*4}" cy="${v[1]+(k%2?3:-3)}" rx="3.4" ry="2.2" fill="#d6303f"/>`});
 /* lining (epithelium): a row of tall cells sitting on the membrane */
 for(let x=-6;x<306;x+=13){const y0=bm(x,0)-33;s+=`<rect x="${f1(x)}" y="${f1(y0)}" width="12" height="32" rx="5" fill="#f6c1cf" stroke="#d98aa3" stroke-width="1.2"/><ellipse cx="${f1(x+6)}" cy="${f1(y0+21)}" rx="3.4" ry="5" fill="#a78bd1"/>`}
 s+=`<path d="M-4,${f1(bm(-4,0))} ${Array.from({length:32},(_,i)=>`L${i*10},${f1(bm(i*10,0))}`).join(" ")}" fill="none" stroke="#a8566b" stroke-width="3.5"/>`;
 return s}

function benign(R,L,uid){
 const rx=[64,68,72][L-1],ry=[60,63,66][L-1],amp=[.02,.07,.11][L-1],k=5+Math.floor(R()*3),ph=R()*6,bow=[4,7,10][L-1];
 const top=[],N=40;for(let i=0;i<=N;i++){const a=Math.PI*i/N,l=1+amp*Math.sin(k*a+ph);const x=150-rx*Math.cos(a),y=bm(x,bow)-ry*Math.sin(a)*l;top.push([x,y])}
 const base=[];for(let x=150+rx;x>=150-rx;x-=6)base.push([x,bm(x,bow)]);
 const poly=top.concat(base.slice(1,-1)),d=smooth(poly);
 const cell=fillCells(poly,R,{order:1,r:[9.2,8.6,8.2][L-1],rv:[.05,.22,.4][L-1],nu:[.12,.22,.34][L-1],fill:L>1?"#f2b6cf":"#f4bccf",stroke:"#d98aa3"});
 return `<defs><clipPath id="g${uid}"><path d="${d}"/></clipPath></defs><path d="${d}" fill="#f8d3df"/><g clip-path="url(#g${uid})">${cell}</g><path d="${d}" fill="none" stroke="#a64557" stroke-width="3"/>
 <path d="M-4,${f1(bm(-4,bow))} ${Array.from({length:32},(_,i)=>`L${i*10},${f1(bm(i*10,bow))}`).join(" ")}" fill="none" stroke="#a8566b" stroke-width="3.5"/>`}

function malignant(R,L,uid){
 const cx=150,cy=116,R0=[40,46,48][L-1],N=170,spikes=[];
 if(L==1){for(let i=0;i<9;i++)spikes.push({a:i/9*6.2832+R()*.3,len:20+R()*24,w:.1+R()*.06})}
 else if(L==2){[1.0,1.9,2.6].forEach(a=>spikes.push({a:a+R()*.25,len:24+R()*10,w:.2+R()*.06}));spikes.push({a:4.4+R()*.5,len:12,w:.22})}
 else{spikes.push({a:1.45+R()*.3,len:15+R()*4,w:.3},{a:2.3+R()*.3,len:10+R()*3,w:.28})}
 const amp=[.16,.1,.07][L-1],ph=[R()*6,R()*6,R()*6],P=[];
 for(let i=0;i<N;i++){const t=i/N*6.2832;let r=R0*(1+amp*Math.sin(3*t+ph[0])+amp*.7*Math.sin(5*t+ph[1])+amp*.5*Math.sin(8*t+ph[2]));
  spikes.forEach(s=>{let d=Math.abs(t-s.a);d=Math.min(d,6.2832-d);r+=s.len*Math.exp(-Math.pow(d/s.w,2))});P.push([cx+Math.cos(t)*r*1.08,cy+Math.sin(t)*r*.98])}
 const d=smooth(P.filter((_,i)=>i%2==0)),cellsFill=[rgb(mix([219,167,210],[246,194,208],[0,.45,.7][L-1])),"#8a3f86"];
 const cells=fillCells(P,R,{r:[9,9.5,9.5][L-1],rmin:[.55,.65,.75][L-1],rmax:[1.55,1.4,1.25][L-1],gap:.72,max:80,nu:[.95,.7,.5][L-1],fill:cellsFill[0],stroke:cellsFill[1]});
 /* single cells that have broken away and moved into the tissue below */
 let esc="";const ne=[5,3,1][L-1];for(let i=0;i<ne;i++){const x=cx+(R()-.5)*150,y=bm(x,0)+16+R()*[60,40,16][L-1];if(inside(P,x,y))continue;
  esc+=`<path d="${blob(R,x,y,8+R()*3,.3,9)}" fill="${cellsFill[0]}" stroke="${cellsFill[1]}" stroke-width="1.6"/><path d="${blob(R,x,y,4.6,.3,8)}" fill="${rgb(mix([176,150,214],[48,22,92],[.95,.7,.5][L-1]))}"/>`}
 return `<defs><clipPath id="g${uid}"><path d="${d}"/></clipPath></defs><path d="${d}" fill="#e9c3dc"/><g clip-path="url(#g${uid})">${cells}</g><path d="${d}" fill="none" stroke="#8a3f86" stroke-width="2.6" stroke-linejoin="round"/>${esc}`}

function tumor(kind,level,seed,uid){
 const R=rng(seed*7919+kind*131+level*17+3);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 260" role="img" aria-label="Tissue diagram">${scene(R,uid)}${kind?malignant(R,level,uid):benign(R,level,uid)}</svg>`}
return{tumor}
})();
