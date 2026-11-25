/* Cancer Cell Exploration worksheet layer: written answers, first-try scores, sample images, signature, PDF export.
   Everything stays in this browser. Load after /assets/bvl.js and /assets/pdf.js. */
(function(){
const K="cce-ws",HOME_PATH="/u3/cce.html";
let D={ans:{},mc:{},ch:{},sec:{},sig:""};
const B=()=>window.BVL;
function load(){const d=B()&&B().load(K);if(d)D={ans:d.ans||{},mc:d.mc||{},ch:d.ch||{},sec:d.sec||{},sig:d.sig||""}}
function save(){if(!B())return;const n=Object.values(D.ans).filter(v=>v&&v.trim()).length,m=Object.values(D.mc).filter(q=>q.d).length;
 B().save(K,{title:"Cancer Cell Exploration · worksheet",summary:n+" written answers, "+m+" questions answered",ans:D.ans,mc:D.mc,ch:D.ch,sec:D.sec,sig:D.sig})}
const WS=window.WS={
 load,save,
 ans:k=>D.ans[k]||"",
 mcGet:id=>D.mc[id],
 mc(id,o){D.mc[id]={...(D.mc[id]||{}),...o};save()},
 /* register all questions of a section so unanswered ones show on the PDF */
 mcReg(prefix,qs,opt){qs.forEach((q,i)=>{const id=prefix+":"+i;if(!D.mc[id])D.mc[id]={q:q.q,a:[].concat(q.a).map(k=>q.o[k]).join(" + "),w:0,d:0}});save()},
 ch:(r,o)=>{if(o){D.ch[r]={...(D.ch[r]||{}),...o};save()}return D.ch[r]||{}},
 sec:(k,o)=>{if(o){D.sec[k]={...(D.sec[k]||{}),...o};save()}return D.sec[k]||{}},
 /* written answer box (typed or Apple Pencil handwriting converted by Scribble; pasting is blocked) */
 box(host,key,prompt,rows){const w=document.createElement("div");w.className="wsq";
  w.innerHTML=`<p style="font-weight:700;margin:12px 0 6px">${prompt}</p><textarea rows="${rows||4}" style="width:100%;font:inherit;font-size:16px;padding:10px;border:2px solid #ddd0ee;border-radius:10px" aria-label="Your written answer"></textarea><div class="note" style="font-size:12px;color:#6b5a85">Type, or write with your Apple Pencil. Pasting is turned off. Your answer saves automatically.</div>`;
  host.appendChild(w);const t=w.querySelector("textarea");t.value=D.ans[key]||"";if(B())B().noPaste(t,()=>{w.querySelector(".note").textContent="Pasting is turned off. Please type or handwrite your own words."});
  let tm;t.addEventListener("input",()=>{D.ans[key]=t.value;clearTimeout(tm);tm=setTimeout(save,500)});return t},
 /* render an SVG string to a small JPEG and store it for the PDF */
 capture(key,svg,px){return new Promise(res=>{try{const im=new Image(),s=px||360;im.onload=()=>{const c=document.createElement("canvas");c.width=c.height=s;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,s,s);x.drawImage(im,0,0,s,s);
   if(B())B().save("img:"+key,{d:c.toDataURL("image/jpeg",.82)});res(1)};im.onerror=()=>res(0);
   im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)}catch(e){res(0)}})},
 img:k=>{const d=B()&&B().load("img:"+k);return d?d.d:""}
};
/* ===== PDF content ===== */
const POINTS={
 p1:["Healthy cells in a tissue are similar in size and shape and fit together neatly. Cancer cells vary widely in size and shape, with irregular borders.","Cancer cell nuclei are often enlarged, irregular, off-center, and darker when stained (hyperchromasia) because of extra or densely packed DNA, so the nucleus-to-cytoplasm ratio is higher.","Healthy tissue has an organized structure (like glands) with orderly spacing. Cancer cells lose that organization and appear crowded, overlapping, or invading nearby tissue.","Cancer cells divide much faster than normal cells, so their numbers grow far more quickly."],
 p2:["Tumors grow slowly over many years (about 10-20 years per stage). Stage numbers describe tumor size, location, and how far it has spread.","A benign tumor stays in place and is not usually called cancer. A malignant tumor breaks through the basement membrane, invades nearby tissue, and can spread.","Metastasis is when cancer cells travel through blood or lymph vessels and form secondary tumors in other parts of the body. Different cancers favor different routes.","Cancers are named for where they start (the organ or cell type). A tumor that spreads keeps the original name."]
};
const P1=[
 {t:"Cell: overall shape and size",k:"0",img:["t0h","t0c"],ans:"p1t0",found:"t0"},
 {t:"Nucleus to cytoplasm ratio, and nucleus shape and size",k:"1",img:["t1h","t1c"],ans:"p1t1",found:"t1"},
 {t:"Cell-to-cell arrangement and tissue formation",k:"2",img:["t2h","t2c"],ans:"p1t2",found:"t2"},
 {t:"Cell division rate",k:"3",img:["t3h","t3c"],ans:"p1t3",sim:1}];
const P2=[{t:"Stage 1: small benign polyp",k:"1",ans:[]},{t:"Stage 2: large benign growth (early adenoma)",k:"2",ans:["p2q2"]},{t:"Stage 3: late adenoma turning malignant",k:"3",ans:["p2q3","p2q5"],chal:1},{t:"Stage 4: metastasis",k:"4",ans:["p2q4","p2q6","p2q7","p2q7a"]}];
const PROMPT={p1t0:"Describe the overall shape and size of the healthy cells and of the cancer cells. Include at least one similarity and one difference.",
 p1t1:"Compare the nucleus-to-cytoplasm ratio and the nucleus shape and size in healthy cells and cancer cells.",
 p1t2:"Compare how healthy cells and cancer cells are arranged, and how that affects the tissue.",
 p1t3:"Compare the division rates of your healthy and cancer cells using your own counts from the simulation.",
 p2q2:"What do you notice about the overall progression of cancer? What do the different stage numbers refer to?",
 p2q3:"What are the differences between a benign tumor and a malignant tumor? List at least two.",
 p2q4:"What does the term metastasis mean? Describe in words what happens during this process.",
 p2q5:"Benign tumors are (often) not considered to be \u201Ccancerous.\u201D Why?",
 p2q6:"How do cancers typically get their names?",
 p2q7:"Some tumors occur in parts of the body that are non-essential for survival, yet can still, indirectly, result in death. Examples include breast and testicular cancer. Based on what you learned from this model, explain why these cancers can still indirectly cause death.",
 p2q7a:"Challenge: Can you think of at least one more way that these non-fatal tumors can indirectly cause death?",
 p2c1:"Round 1: Choose one malignant sample and describe two features that told you it was malignant.",
 p2c2:"Round 2: Choose one benign sample and describe two features that told you it was benign."};
WS.PROMPT=PROMPT;
const ids=p=>Object.keys(D.mc).filter(k=>k.startsWith(p)).sort((a,b)=>+a.split(":").pop()-+b.split(":").pop());
function mcBlock(d,prefix){const L=ids(prefix);if(!L.length)return{n:0,s:0};let s=0;
 L.forEach(id=>{const q=D.mc[id],ok=q.d&&!q.w;if(ok)s++;
  d.text(q.q,{size:10,bold:true,gap:1});
  d.text("   "+(q.d?(ok?"Correct on the first try":"Correct after "+(q.w+1)+" tries"):"Not answered yet")+(q.d?"   (answer: "+q.a+")":""),{size:9.5,color:q.d?(ok?[20,120,60]:[160,90,20]):[150,60,50],gap:3})});
 return{n:L.length,s}}
function answers(d,keys){keys.forEach(k=>{const v=(D.ans[k]||"").trim(),h=Math.max(40,d.wrap(v||" ",10.5,false,W_-16).length*14+12);d.room(h+d.wrap(PROMPT[k],10,true,W_).length*14+14);d.text(PROMPT[k],{size:10,bold:true,gap:1});d.box(54,d.y,W_,h,[250,249,253],[190,180,215]);
 const y0=d.y;d.y+=6;d.text(v||"(No answer yet)",{size:10.5,x:62,w:W_-16,color:v?[20,20,20]:[150,150,150],gap:0});d.y=y0+h+8})}
const W_=504;
function build(){const B_=B(),p=B_.profile(),d=new PDFDoc(),now=new Date(),id=(Date.now().toString(36)+Math.random().toString(36).slice(2,5)).toUpperCase();
 const url=location.origin+HOME_PATH,a1=B_.load("cancer-cell-exploration-part1"),a2=B_.load("cancer-cell-exploration-part2");
 d.text("Cancer Cell Exploration",{size:20,bold:true,gap:2});
 d.text("Click to return to the Cancer Cell Exploration home page: "+url,{size:9.5,color:[26,80,200],link:url,gap:6});
 d.rule();
 d.text("Name: "+p.name+"     Teacher: "+p.teacher+"     Period: "+p.period,{size:11,bold:true,gap:1});
 d.text("Date: "+now.toLocaleDateString()+"     Submission ID: "+id,{size:10,gap:6});
 const pc=B_.pasteCount();
 const parts=[["Part 1: Comparison of Cell Structures and Features","p1",!!a1],["Part 2: Tumor Growth Stages and Types","p2",!!a2]];
 parts.forEach(([title,key,has])=>{if(!has&&!Object.keys(D.mc).some(k=>k.startsWith(key+":")))return;
  d.gap(8);d.box(54,d.y,W_,22,[75,46,131]);d.y+=4;d.text(title,{size:13,bold:true,color:[255,255,255],x:62,gap:0});d.y+=8;
  d.text("Key learning points",{size:11,bold:true,gap:2});POINTS[key].forEach(t=>d.text("\u2022 "+t,{size:9.5,x:62,w:W_-14,gap:2}));d.gap(6);
  if(key==="p1"){
   P1.forEach(it=>{if(!Object.keys(D.mc).some(k=>k.startsWith("p1:q"+it.k+":"))&&!D.ans[it.ans])return;
    d.text(it.t,{size:11.5,bold:true,color:[75,46,131],gap:3});
    const f=D.sec[it.found||""]||{},sm=D.sec.t3||{};
    d.row([{src:WS.img(it.img[0]),pw:360,ph:360,cap:it.sim?"Healthy cells at 72 hours":"Healthy sample"},{src:WS.img(it.img[1]),pw:360,ph:360,cap:it.sim?"Cancer cells at 72 hours":"Cancer sample (identified cells outlined in green)"}],108);
    if(it.found&&f.total)d.text("Cancer cells identified: "+f.found+" of "+f.total,{size:10,gap:3});
    if(it.sim&&sm.tn)d.text("My simulation: healthy cells divided about every "+sm.tn+" h and cancer cells about every "+sm.tc+" h. At 72 hours I observed about "+sm.nn+" healthy cells and "+sm.nc+" cancer cells.",{size:10,gap:3});
    mcBlock(d,"p1:q"+it.k+":");answers(d,[it.ans]);d.gap(4)});
   const bonus=a1&&a1.lv?a1.lv:0;if(bonus)d.text("Bonus challenge: levels completed: "+bonus+" of 4",{size:10,gap:6});
  }else{
   P2.forEach(it=>{if(!Object.keys(D.mc).some(k=>k.startsWith("p2:"+it.k+":"))&&!it.ans.some(k=>D.ans[k]))return;
    d.text(it.t,{size:11.5,bold:true,color:[75,46,131],gap:3});mcBlock(d,"p2:"+it.k+":");
    if(it.chal){d.text("Benign or malignant? challenge",{size:10.5,bold:true,gap:2});[1,2].forEach(r=>{const c=D.ch[r]||{};d.text("Round "+r+": "+(c.done?"solved on attempt "+c.att+" (first attempt: "+c.first+" of 6 correct)":c.att?"in progress ("+c.att+" attempts)":"not started"),{size:10,x:62,gap:2})});
     answers(d,["p2c1","p2c2"]);
     d.text("Sample images: Levenson RM, Krupinski EA, Navarro VM, Wasserman EA (2015). Pigeons (Columba livia) as Trainable Observers of Pathology and Radiology Breast Cancer Images. PLoS ONE 10(11): e0141357. doi:10.1371/journal.pone.0141357. CC BY 4.0. Images cropped.",{size:7.5,color:[100,100,100],gap:6})}
    answers(d,it.ans);d.gap(4)})}
 });
 /* score summary */
 const all=Object.keys(D.mc).filter(k=>/^p[12]:/.test(k)&&!/^p1:q4:/.test(k)),tot=all.length,first=all.filter(k=>D.mc[k].d&&!D.mc[k].w).length,done=all.filter(k=>D.mc[k].d).length;
 d.gap(6);d.rule();d.text("Multiple-choice summary: "+first+" of "+tot+" correct on the first try ("+done+" of "+tot+" answered).",{size:11,bold:true,gap:6});
 d.room(120);
 d.text("Honor statement: I completed this work myself, using my own samples and my own words.",{size:10.5,bold:true,gap:4});
 if(D.sig)d.image(D.sig,1040,300,170);else d.text("(No signature)",{size:10,gap:4});
 d.text("Signed by "+p.name+" on "+now.toLocaleString(),{size:9.5,gap:2});
 if(pc>0)d.text("Note: "+pc+" attempt(s) to paste text were blocked while completing this worksheet.",{size:8.5,color:[110,110,110]});
 return{d,id,p}}
const css=document.createElement("style");css.textContent=".wsblue{background:#1a73e8!important;color:#fff!important;border:0!important;font-size:16px!important}.wsblue[disabled]{background:#9db9e6!important;cursor:not-allowed}.wscheck li{margin:2px 0}";document.head.appendChild(css);
WS.mountExport=host=>{if(!host)return;const b=B();
 if(!b||!b.user()){host.innerHTML='<div class="bvl-box"><h3>Download your worksheet</h3><p>Sign in on the <a href="/home.html">home page</a> to create your PDF.</p></div>';return}
 const p=b.profile(),need=[];if(!p.teacher||!p.period)need.push("Choose your teacher and period in Profile settings on the home page.");
 const mcs=Object.values(D.mc).filter(q=>q.d).length;
 host.innerHTML=`<div class="bvl-box"><h3>Download your worksheet as a PDF</h3><p class="bvl-s">The PDF includes your name, teacher and period, a summary of the key learning points, your samples, your answers, your first-try score, and your signature. You can upload it to Schoology or open it in Notability. It includes everything you have finished so far.</p>
 <p class="bvl-s"><b>Your samples are unique to you.</b> Your classmates' samples and numbers are different, so your PDF reflects your own work.</p>
 <p><b>Honor statement:</b> I completed this work myself, using my own samples and my own words.</p><p class="bvl-s">Sign with your finger or Apple Pencil:</p><div id="sigw"></div>
 <p class="bvl-msg" id="exm" aria-live="polite"></p><button class="wsblue" id="exb" disabled>\u2B07 Download PDF (you can upload this to Schoology)</button></div>`;
 const m=host.querySelector("#exm"),btn=host.querySelector("#exb");
 const sync=()=>{const ok=!sig.empty()&&!need.length;btn.disabled=!ok;m.className="bvl-msg e";m.textContent=need[0]||(sig.empty()?"Please sign above to enable the download.":"")};
 const sig=b.sigPad(host.querySelector("#sigw"),D.sig,()=>{D.sig=sig.data();save();sync()});sync();
 btn.onclick=async()=>{btn.disabled=true;m.className="bvl-msg k";m.textContent="Making your PDF…";D.sig=sig.data();save();
  try{const r=build();const nm="Cancer-Cell-Exploration-"+r.p.name.replace(/\s+/g,"-")+".pdf";r.d.save(nm,(i,n)=>r.p.name+" · "+r.p.teacher+" · Period "+r.p.period+" · ID "+r.id+" · Page "+i+" of "+n);m.textContent="Your PDF was saved. Check your Downloads or Files app, then upload it to Schoology.";}
  catch(e){m.className="bvl-msg e";m.textContent="Sorry, the PDF could not be made ("+e.message+")."}btn.disabled=false}};
WS.build=build;
load();
})();
