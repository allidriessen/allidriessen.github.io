/* Minimal PDF writer: no libraries, nothing uploaded. Standard fonts (Helvetica), JPEG images, clickable links.
   Usage: const d=new PDFDoc(); d.text("Hello",{size:14,bold:true}); d.image(jpegDataURL,pxW,pxH,ptW); d.save("name.pdf",footerFn) */
(function(){
const W=612,H=792,M=54,FB=34;
const CP={8364:128,8218:130,402:131,8222:132,8230:133,8224:134,8225:135,710:136,8240:137,352:138,8249:139,338:140,381:142,8216:145,8217:146,8220:147,8221:148,8226:149,8211:150,8212:151,732:152,8482:153,353:154,8250:155,339:156,382:158,376:159};
const enc=s=>{let o="";for(const ch of String(s)){let c=ch.codePointAt(0);if(c===9||c===160)c=32;else if(c>255)c=CP[c]||63;else if(c<32)c=32;else if(c>=128&&c<160)c=63;o+=String.fromCharCode(c)}return o};
const esc=s=>s.replace(/[\\()]/g,"\\$&");
const mc=document.createElement("canvas").getContext("2d");
const tw=(s,sz,b)=>{mc.font=(b?"bold ":"")+sz+"px Helvetica,Arial,sans-serif";return mc.measureText(s).width};
const rg=c=>c.map(v=>(v/255).toFixed(3)).join(" ");
const latin=s=>{const b=new Uint8Array(s.length);for(let i=0;i<s.length;i++)b[i]=s.charCodeAt(i)&255;return b};
function PDFDoc(){this.pages=[];this.imgs=[];this.np()}
PDFDoc.prototype={
 np(){this.p={ops:[],links:[],ims:[]};this.pages.push(this.p);this.y=M},
 room(h){if(this.y+h>H-M-FB+10)this.np()},
 gap(h){this.y+=h},
 wrap(t,sz,b,w){const out=[];String(t).split(/\r?\n/).forEach(par=>{let line="";const words=par.split(/(\s+)/);
  const push=()=>{out.push(line.replace(/\s+$/,""));line=""};
  words.forEach(wd=>{if(!wd)return;if(tw(line+wd,sz,b)<=w){line+=wd;return}
   if(line.trim())push();if(/^\s+$/.test(wd))return;
   if(tw(wd,sz,b)<=w){line=wd;return}
   for(const ch of wd){if(tw(line+ch,sz,b)>w)push();line+=ch}});
  push()});return out},
 text(t,o){o=o||{};const sz=o.size||11,b=!!o.bold,x=o.x==null?M:o.x,w=o.w||(W-M-x),lh=sz*1.32,col=o.color||[0,0,0];
  this.wrap(t,sz,b,w).forEach(line=>{this.room(lh);const ty=H-this.y-sz;
   this.p.ops.push(`BT /F${b?2:1} ${sz} Tf ${rg(col)} rg ${x} ${ty.toFixed(1)} Td (${esc(enc(line))}) Tj ET`);
   if(o.link)this.p.links.push({r:[x,ty-2,x+tw(line,sz,b),ty+sz],u:o.link});this.y+=lh});
  this.y+=o.gap==null?4:o.gap},
 rule(c){this.room(8);const y=H-this.y-2;this.p.ops.push(`${rg(c||[200,200,200])} RG 0.8 w ${M} ${y} m ${W-M} ${y} l S`);this.y+=8},
 box(x,y,w,h,fill,stroke){const py=H-y-h;this.p.ops.push((fill?`${rg(fill)} rg `:"")+(stroke?`${rg(stroke)} RG 0.8 w `:"")+`${x} ${py.toFixed(1)} ${w} ${h} re ${fill&&stroke?"B":fill?"f":"S"}`)},
 image(src,pw,ph,w,x){if(!src)return;const b64=src.split(",")[1],bin=atob(b64),by=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)by[i]=bin.charCodeAt(i);
  const idx=this.imgs.push({by,pw,ph})-1,h=w*ph/pw;this.room(h+4);x=x==null?M:x;
  this.p.ims.push(idx);this.p.ops.push(`q ${w} 0 0 ${h.toFixed(1)} ${x} ${(H-this.y-h).toFixed(1)} cm /Im${idx} Do Q`);this.y+=h+4;return h},
 /* a row of images with captions: items [{src,pw,ph,cap}] */
 row(items,w,bh){bh=bh||w;const capH=14,h=bh+capH+6;this.room(h);const top=this.y;let x=M;
  items.forEach(it=>{if(it.src){const hh=Math.min(bh,w*it.ph/it.pw),idx=this.imgs.push({by:(()=>{const bin=atob(it.src.split(",")[1]),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a})(),pw:it.pw,ph:it.ph})-1;
    this.p.ims.push(idx);this.p.ops.push(`q ${w} 0 0 ${hh.toFixed(1)} ${x} ${(H-top-hh).toFixed(1)} cm /Im${idx} Do Q`)}
   else{this.box(x,top,w,bh,[245,245,245],[190,190,190]);this.p.ops.push(`BT /F1 9 Tf 0.4 0.4 0.4 rg ${x+6} ${(H-top-bh/2).toFixed(1)} Td (Not completed yet) Tj ET`)}
   this.p.ops.push(`BT /F1 9 Tf 0.25 0.25 0.25 rg ${x} ${(H-top-bh-11).toFixed(1)} Td (${esc(enc(it.cap||""))}) Tj ET`);x+=w+16});
  this.y=top+h},
 bytes(foot){const N=this.pages.length;
  this.pages.forEach((p,i)=>p.ops.push(`BT /F1 8 Tf 0.4 0.4 0.4 rg ${M} 28 Td (${esc(enc(foot?foot(i+1,N):""))}) Tj ET`));
  const parts=[],off=[];let pos=0;const put=s=>{const b=typeof s==="string"?latin(s):s;parts.push(b);pos+=b.length};
  const ni=this.imgs.length;put("%PDF-1.4\n");
  const obj=(n,body)=>{off[n]=pos;put(n+" 0 obj\n"+body+"\nendobj\n")};
  const stream=(n,dict,b)=>{off[n]=pos;put(n+" 0 obj\n<< "+dict+" /Length "+b.length+" >>\nstream\n");put(b);put("\nendstream\nendobj\n")};
  const kids=this.pages.map((p,k)=>6+ni+3*k+0);
  obj(1,"<< /Type /Catalog /Pages 2 0 R >>");
  obj(2,`<< /Type /Pages /Kids [${this.pages.map((p,k)=>(5+ni+2*k+1)+" 0 R").join(" ")}] /Count ${N} >>`);
  obj(3,"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  obj(4,"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  this.imgs.forEach((im,i)=>stream(5+i,`/Type /XObject /Subtype /Image /Width ${im.pw} /Height ${im.ph} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`,im.by));
  this.pages.forEach((p,k)=>{const c=5+ni+2*k,pg=c+1;
   stream(c,"",latin(p.ops.join("\n")));
   const xo=[...new Set(p.ims)].map(i=>`/Im${i} ${5+i} 0 R`).join(" "),an=p.links.map(l=>`<< /Type /Annot /Subtype /Link /Rect [${l.r.map(v=>v.toFixed(1)).join(" ")}] /Border [0 0 0] /A << /S /URI /URI (${esc(l.u)}) >> >>`).join(" ");
   obj(pg,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << ${xo} >> >> /Contents ${c} 0 R /Annots [ ${an} ] >>`)});
  const total=5+ni+2*N,xr=pos;put(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for(let i=1;i<total;i++)put(String(off[i]).padStart(10,"0")+" 00000 n \n");
  put(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`);
  const out=new Uint8Array(pos);let q=0;parts.forEach(b=>{out.set(b,q);q+=b.length});return out},
 save(name,foot){const b=this.bytes(foot),u=URL.createObjectURL(new Blob([b],{type:"application/pdf"})),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);return b}
};
window.PDFDoc=PDFDoc;
})();
