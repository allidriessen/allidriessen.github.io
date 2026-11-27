/* Cellular Homeostasis: PDF of the student's work (built from saved data, so it works from any part). */
(function(){
const L=LAB,D=L.D,W_=504,pt=L.pt;
const TITLES={intro:"Introduction",p1:"Part 1: Membrane Structure",p2:"Part 2: Passive Transport",p3:"Part 3: Active Transport",p4:"Summary"};
const IMGS={p1:[["lbl","My labeled cell membrane"]],
 p2:[["diff","Diffusion: small, uncharged molecules (O2, CO2) move from high to low concentration through the bilayer. No energy is used."],["fac","Facilitated diffusion: large or charged molecules (glucose, Na+) move from high to low concentration through a channel or carrier protein. No energy is used."],["osm","Osmosis: water moves across the membrane toward the side with more dissolved solute. No energy is used."]],
 p3:[["pump","Sodium-potassium pump (Na+,K+-ATPase): uses ATP to move 3 Na+ out and 2 K+ in, against their concentration gradients."],["endo","Endocytosis: the membrane folds in around a large particle and pinches off a vesicle inside the cell."],["exo","Exocytosis: a vesicle fuses with the membrane and releases its contents outside the cell."]]};
const ORDER=["intro","p1","p2","p3","p4"];
CH.buildPdf=(o)=>{o=o||{};const b=window.BVL,p=b.profile(),d=new PDFDoc(),now=new Date(),id=(Date.now().toString(36)+Math.random().toString(36).slice(2,5)).toUpperCase();
 const upto=o.partial?ORDER.indexOf(o.partialId||"p1"):4,url=location.origin+"/u3/ch.html";
 const banner=t=>{d.gap(8);d.room(70);d.box(54,d.y,W_,22,[58,86,168]);d.y+=4;d.text(t,{size:13,bold:true,color:[255,255,255],x:62,gap:0});d.y+=8};
 d.text("Cellular Homeostasis & Membrane Transport",{size:20,bold:true,gap:2});
 d.text("How does a cell control what enters and leaves?  Click to return to the activity page: "+url,{size:9.5,color:[26,80,200],link:url,gap:6});d.rule();
 d.text("Name: "+p.name+"     Teacher: "+p.teacher+"     Period: "+p.period,{size:11,bold:true,gap:1});
 d.text("Date: "+now.toLocaleDateString()+"     Submission ID: "+id+(o.partial?"     (Progress copy through "+o.partial+")":""),{size:10,gap:6});
 const answerBox=(prompt,v)=>{const h=Math.max(40,d.wrap(v||" ",10.5,false,W_-16).length*14+12);d.room(h+d.wrap(prompt,10,true,W_).length*14+14);d.text(prompt,{size:10,bold:true,gap:1});d.room(h+6);d.box(54,d.y,W_,h,[250,249,253],[190,180,215]);const y0=d.y;d.y+=6;d.text(v||"(No answer yet)",{size:10.5,x:62,w:W_-16,color:v?[20,20,20]:[150,150,150],gap:0});d.y=y0+h+8};
 let scored=0,first=0,answered=0;
 ORDER.slice(0,upto+1).forEach(part=>{
  const items=D.order.filter(i=>i.part===part);
  if(!items.length&&!IMGS[part]&&part!=="p4")return;
  banner(TITLES[part]);
  items.forEach(it=>{
   if(it.t==="mc"){const q=D.mc[it.id];if(!q)return;d.text(pt(q.q),{size:10,bold:true,gap:1});
    if(q.pred){d.text("   Prediction: "+(q.d?pt(q.pt||""):"(not answered)"),{size:9.5,color:q.d?[20,20,20]:[150,60,50],gap:3});return}
    scored++;if(q.d)answered++;const ok=q.d&&!q.w;if(ok)first++;
    d.text("   "+(q.d?(ok?"Correct on the first try":"Correct after "+(q.w+1)+" tries"):"Not answered yet")+(q.d?"   (answer: "+pt(q.a)+")":""),{size:9.5,color:q.d?(ok?[20,120,60]:[160,90,20]):[150,60,50],gap:3})}
   else if(it.t==="w")answerBox(pt(D.pr[it.id]||it.id),(D.ans[it.id]||"").trim())});
  (IMGS[part]||[]).forEach(([k,cap])=>{const im=L.img(k);d.room(220);
   if(im&&im.d){const wpt=Math.min(W_-60,400);d.gap(4);d.text(pt(cap),{size:10,bold:true,gap:2,w:W_});d.image(im.d,im.w,im.h,wpt);d.gap(6)}
   else d.text(pt(cap.split(":")[0])+": (picture not saved yet)",{size:10,color:[150,150,150],gap:4})});
  if(part==="p1"){d.gap(4);d.room(90);d.text("Vocabulary and definitions",{size:11.5,bold:true,color:[58,86,168],gap:3});
   CH.VOCAB.concat(CH.TERMS2).forEach(v=>{d.text(pt(v.t)+": "+pt(v.d),{size:9.5,x:62,w:W_-14,gap:3})})}
 });
 d.gap(6);d.rule();if(scored)d.text("Question summary: "+first+" of "+scored+" correct on the first try ("+answered+" of "+scored+" answered).",{size:11,bold:true,gap:6});
 if(!o.partial){d.room(120);d.text("Honor statement: I completed this work myself, in my own words.",{size:10.5,bold:true,gap:4});
  if(D.sig)d.image(D.sig,1040,300,170);else d.text("(No signature)",{size:10,gap:4});
  d.text("Signed by "+p.name+" on "+now.toLocaleString(),{size:9.5,gap:2})}
 const pc=b.pasteCount();if(pc>0)d.text("Note: "+pc+" attempt(s) to paste text were blocked while completing this activity.",{size:8.5,color:[110,110,110]});
 return{d,id,p}};
CH.pdf=(msgEl,o)=>{if(!window.BVL||!BVL.user()){msgEl.className="fb bad";msgEl.textContent="Sign in on the home page first so your work can be saved and printed.";return}
 try{L.load();const r=CH.buildPdf(o),nm="Cellular-Homeostasis-"+(o&&o.partial?o.partial.replace(/\s+/g,"")+"-":"")+r.p.name.replace(/\s+/g,"-")+".pdf";
  r.d.save(nm,(i,n)=>r.p.name+" · "+r.p.teacher+" · Period "+r.p.period+" · ID "+r.id+" · Page "+i+" of "+n);msgEl.className="fb good";msgEl.textContent="Your PDF was saved. Check your Downloads or Files app."+(o&&o.partial?"":" Upload it to Schoology.")}
 catch(e){msgEl.className="fb bad";msgEl.textContent="Could not make the PDF: "+e.message}};
})();
