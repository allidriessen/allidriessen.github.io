/* Enzymatic Reactions Virtual Lab: PDF of the student's work. */
(function(){
const L=window.LAB,D=L.D,W_=504,pt=L.pt;
const TITLES={p1:"Part 1: Meet the Molecules",p2:"Part 2: Build the Reaction",p3:"Part 3: Investigation",p4:"Part 4: Summarize Your Learning"};
const SUBS={t3a:"3A: Baseline",q16:"3B: Temperature",q23:"3C: pH",q26:"3D: Substrate concentration",q28a:"3E: Enzyme concentration"};
const TBLT={t3a:"3A: Baseline counts (30 s)",t3b:"3B: Temperature data",t3c:"3C: pH data",t3d:"3D: Substrate concentration data",t3e:"3E: Enzyme concentration data"};
L.buildPdf=()=>{const b=window.BVL,p=b.profile(),d=new PDFDoc(),now=new Date(),id=(Date.now().toString(36)+Math.random().toString(36).slice(2,5)).toUpperCase();
 const url=location.origin+"/u2/ervl.html",banner=t=>{d.gap(8);d.room(70);d.box(54,d.y,W_,22,[15,118,110]);d.y+=4;d.text(t,{size:13,bold:true,color:[255,255,255],x:62,gap:0});d.y+=8};
 d.text("Enzymatic Reactions Virtual Lab",{size:20,bold:true,gap:2});
 d.text("What variables influence enzyme activity?  Click to return to the lab page: "+url,{size:9.5,color:[26,80,200],link:url,gap:6});d.rule();
 d.text("Name: "+p.name+"     Teacher: "+p.teacher+"     Period: "+p.period,{size:11,bold:true,gap:1});
 d.text("Date: "+now.toLocaleDateString()+"     Submission ID: "+id,{size:10,gap:6});
 const answerBox=(prompt,v)=>{const h=Math.max(40,d.wrap(v||" ",10.5,false,W_-16).length*14+12);d.room(h+d.wrap(prompt,10,true,W_).length*14+14);d.text(prompt,{size:10,bold:true,gap:1});d.room(h+6);d.box(54,d.y,W_,h,[250,249,253],[190,180,215]);const y0=d.y;d.y+=6;d.text(v||"(No answer yet)",{size:10.5,x:62,w:W_-16,color:v?[20,20,20]:[150,150,150],gap:0});d.y=y0+h+8};
 let cur="",scored=0,first=0,answered=0;
 L.items.forEach(it=>{
  if(it.part!==cur&&TITLES[it.part]){cur=it.part;banner(TITLES[cur])}
  if(SUBS[it.id||it.tid]){d.gap(4);d.text(SUBS[it.id||it.tid],{size:11.5,bold:true,color:[15,118,110],gap:3})}
  if(it.t==="mc"){const q=D.mc[it.id];if(!q)return;
   d.text(pt(q.q),{size:10,bold:true,gap:1});
   if(q.pred){d.text("   Prediction: "+(q.d?pt(q.pt||""):"(not answered)"),{size:9.5,color:q.d?[20,20,20]:[150,60,50],gap:3});return}
   scored++;if(q.d)answered++;const ok=q.d&&!q.w;if(ok)first++;
   d.text("   "+(q.d?(ok?"Correct on the first try":"Correct after "+(q.w+1)+" tries"):"Not answered yet")+(q.d?"   (answer: "+pt(q.a)+")":""),{size:9.5,color:q.d?(ok?[20,120,60]:[160,90,20]):[150,60,50],gap:3})}
  else if(it.t==="w")answerBox(pt(D.pr[it.id]||it.id),(D.ans[it.id]||"").trim());
  else if(it.t==="opt"){d.text("Optimum value for "+it.v.toLowerCase()+": "+((D.data["opt"+it.i]||"").trim()||"(blank)"),{size:10,x:62,gap:3})}
  else if(it.t==="tbl"){d.gap(2);d.text(TBLT[it.tid]||it.tid,{size:10.5,bold:true,gap:2});
   it.rows.forEach((r,ri)=>{const parts=it.cols.map(c=>{const v=D.data[it.tid+":"+ri+":"+c.k]||"";const vp=c.t==="state"?(v?v+(D.data[it.tid+":"+ri+":"+c.k+"p"]?" "+D.data[it.tid+":"+ri+":"+c.k+"p"]+"%":""):""):v;return pt(c.h)+": "+(vp||"__")}).join("   |   ");
    d.text((r.label?pt(r.label):"Result")+":   "+parts,{size:9.5,x:62,w:W_-14,gap:2})});d.gap(4)}
  else if(it.t==="img"){const im=L.img(it.key);d.room(180);
   if(im&&im.d){const wpt=Math.min(W_-40,im.w*(im.h>200?.62:.8));d.text(pt(it.cap)+":",{size:10,bold:true,gap:2});d.image(im.d,im.w,im.h,wpt);d.gap(4)}
   else{d.text(pt(it.cap)+": (not completed yet)",{size:10,color:[150,150,150],gap:4})}}
 });
 d.gap(6);d.rule();if(scored)d.text("Multiple-choice and dropdown summary: "+first+" of "+scored+" correct on the first try ("+answered+" of "+scored+" answered).",{size:11,bold:true,gap:6});
 d.room(120);d.text("Honor statement: I completed this work myself, in my own words.",{size:10.5,bold:true,gap:4});
 if(D.sig)d.image(D.sig,1040,300,170);else d.text("(No signature)",{size:10,gap:4});
 d.text("Signed by "+p.name+" on "+now.toLocaleString(),{size:9.5,gap:2});
 const pc=b.pasteCount();if(pc>0)d.text("Note: "+pc+" attempt(s) to paste text were blocked while completing this worksheet.",{size:8.5,color:[110,110,110]});
 return{d,id,p}};
})();
