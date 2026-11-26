(function(){var TAU=Math.PI*2,ER=38,clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
/* ---------- atom sprites ---------- */
function sprite(r,c1,c2,ec){var s=2,n=Math.ceil((r*2+4)*s),o=document.createElement('canvas');o.width=o.height=n;var c=o.getContext('2d');
  var g=c.createRadialGradient(n*.38,n*.34,r*s*.1,n/2,n/2,r*s);g.addColorStop(0,c1);g.addColorStop(1,c2);
  c.beginPath();c.arc(n/2,n/2,r*s,0,TAU);c.fillStyle=g;c.fill();c.lineWidth=1.5*s;c.strokeStyle=ec;c.stroke();return {i:o,r:r,n:n/s}}
var SO=sprite(6.5,'#ff9a9a','#d62828','#8f1414'),SH=sprite(3.8,'#ffffff','#b9c6d3','#8796a5');
function atom(c,sp,x,y,al){if(al!==undefined)c.globalAlpha=al;c.drawImage(sp.i,x-sp.n/2,y-sp.n/2,sp.n,sp.n)}
function bond(c,x1,y1,x2,y2,w){c.lineCap='round';c.strokeStyle='#5b6775';c.lineWidth=w+2;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
  c.strokeStyle='#dbe3ea';c.lineWidth=w;c.stroke()}
function molH2O2(c,x,y,a){c.save();c.translate(x,y);c.rotate(a);
  bond(c,-8,0,8,0,3.5);bond(c,-8,0,-12.5,-8,2.2);bond(c,8,0,12.5,8,2.2);
  atom(c,SH,-12.5,-8);atom(c,SH,12.5,8);atom(c,SO,-8,0);atom(c,SO,8,0);c.restore()}
function molH2O(c,x,y,a,al){c.save();c.globalAlpha=al;c.translate(x,y);c.rotate(a);
  bond(c,0,0,6.2,-7.9,2.2);bond(c,0,0,6.2,7.9,2.2);atom(c,SH,6.2,-7.9);atom(c,SH,6.2,7.9);atom(c,SO,0,0);c.restore()}
function molO2(c,x,y,a,al){c.save();c.globalAlpha=al;c.translate(x,y);c.rotate(a);
  bond(c,-7,-2,7,-2,2.2);bond(c,-7,2,7,2,2.2);atom(c,SO,-7,0);atom(c,SO,7,0);c.restore()}

/* ---------- catalase ---------- */
var HX=[[-14,-14,.6,22],[-19,10,-.7,20],[0,-25,0,16],[3,23,.2,18],[-5,-3,1.5,16],[19,-20,.9,12],[19,20,-.9,12],[-28,-2,1.57,10]];
function drawE(c,x,y,a,sc,d,sf,tm,ph,bound,ox,bt){
  var N=96,sg=.3+.55*d,dp=18*(1-.85*d),sh=d*.55,hue=172-d*140,sat=68-d*50,lt=50-d*8;
  c.save();c.translate(x,y);c.rotate(a);c.scale(sc,sc);
  if(bound){var k=1+.025*Math.sin(bt*.3);c.scale(k,k)}
  c.lineCap='round';c.lineJoin='round';
  if(d>.3){c.strokeStyle='hsla('+hue+','+sat+'%,'+(lt+8)+'%,'+(d*.8)+')';c.lineWidth=3.2-d;
    for(var q=0;q<5;q++){var an=ph+q*1.3+Math.PI*.6,len=d*(30+8*q%3);c.beginPath();
      for(var j=0;j<=10;j++){var u=ER*.85+len*j/10,w=Math.sin(j*1.1+tm*(1+sf)+q)*d*7*j/10;
        var px=Math.cos(an)*u-Math.sin(an)*w,py=Math.sin(an)*u+Math.cos(an)*w;j?c.lineTo(px,py):c.moveTo(px,py)}c.stroke()}}
  c.beginPath();
  for(var i=0;i<=N;i++){var th=i/N*TAU,dt=((th-sh+Math.PI)%TAU+TAU)%TAU-Math.PI;
    var r=ER*(1+.05*Math.sin(3*th+ph)+.03*Math.sin(5*th+ph*2));
    r+=d*ER*(.13*Math.sin(4*th+ph+tm*(.8+sf))+.1*Math.sin(7*th+ph*2-tm*1.3)+.07*Math.sin(2*th+ph));
    r-=dp*Math.exp(-(dt/sg)*(dt/sg));
    var bx=Math.cos(th)*r,by=Math.sin(th)*r;i?c.lineTo(bx,by):c.moveTo(bx,by)}
  c.closePath();
  var g=c.createRadialGradient(-10,-12,4,0,0,ER*1.2);
  g.addColorStop(0,'hsl('+hue+','+sat+'%,'+(lt+20)+'%)');g.addColorStop(1,'hsl('+hue+','+sat+'%,'+(lt-14)+'%)');
  if(bound){c.shadowColor='hsl('+hue+',85%,62%)';c.shadowBlur=20}
  c.fillStyle=g;c.fill();c.shadowBlur=0;c.lineWidth=2;c.strokeStyle='hsla('+hue+','+sat+'%,'+(lt-26)+'%,.95)';c.stroke();
  // alpha helices: folded cylinders unravel into wavy strands
  HX.forEach(function(h,k){
    var L=h[3]*(1+d),A=d*10,n=12,pts=[],ca=Math.cos(h[2]),sa=Math.sin(h[2]);
    for(var j=0;j<=n;j++){var u=(j/n-.5)*L,o=A*Math.sin(j*1.1+tm*3*d+ph+k)+d*7*Math.sin(tm*.7+k);
      pts.push([h[0]+ca*u-sa*o+d*5*Math.sin(k+ph),h[1]+sa*u+ca*o])}
    c.beginPath();pts.forEach(function(p,j){j?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])});
    c.strokeStyle='rgba(255,255,255,'+(.55-.25*d)+')';c.lineWidth=7-4*d;c.stroke();
    if(d<.7){c.setLineDash([2,3]);c.strokeStyle='rgba(0,50,60,'+(.35*(1-d*1.4))+')';c.lineWidth=7-4*d;c.stroke();c.setLineDash([])}
  });
  // heme group in the active site pocket
  c.save();c.rotate(sh);c.translate(24,0);c.rotate(.785+d*.6);
  c.globalAlpha=1-d*.5;c.fillStyle='#b3263e';c.strokeStyle='#5c0f1d';c.lineWidth=1.2;
  c.beginPath();c.rect(-6,-6,12,12);c.fill();c.stroke();
  c.fillStyle='#e0566e';[[-5,-5],[5,-5],[-5,5],[5,5]].forEach(function(p){c.beginPath();c.arc(p[0],p[1],3.2,0,TAU);c.fill();c.stroke()});
  var fg=c.createRadialGradient(-1,-1,.5,0,0,3.6);fg.addColorStop(0,'#fff3c4');fg.addColorStop(1,'#d9822b');
  c.fillStyle=fg;c.beginPath();c.arc(0,0,3.6,0,TAU);c.fill();c.restore();
  if(ox>0){c.save();c.rotate(sh);c.globalAlpha=ox;atom(c,SO,31,0);c.restore()}
  c.restore();
}



window.LAB.drawE=drawE;})();
