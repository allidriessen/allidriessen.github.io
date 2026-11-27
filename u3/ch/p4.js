/* Summary: recap questions, signature and the PDF. */
(function(){
const L=LAB,D=L.D,G=window.G;
const main=CH.init({id:"p4",q:"What did you learn about how cells keep their balance?"});
const REQ=["p4.q1","p4.q2","p4.q3","p4.q4","p4.q5","p4.q6","p4.q7","p4.q8","p4.q9"];
const done=()=>REQ.every(i=>D.mc[i]&&D.mc[i].d);
const box=document.createElement("div");box.className="box";box.innerHTML='<h2>Check what you learned</h2><p class="note">Answer every question. If you miss one, try again. Your first-try score is shown on your PDF.</p>';main.appendChild(box);
const upd=()=>{if(done()){if(!D.done.p4){LAB.finish("p4")}sync()}else sync()};
L.choice(box,"p4.q1","1. What is the main job of the cell membrane in keeping a cell stable (homeostasis)?",["It controls what enters and leaves the cell","It makes most of the ATP the cell uses","It stores all of the cell's DNA inside it","It makes the whole cell grow larger over time"],0,{onRight:upd});
L.cloze(box,"p4.q2","<p>2. The phospholipid bilayer has {{*hydrophilic|hydrophobic}} heads that face the water and {{*hydrophobic|hydrophilic}} tails that hide in the middle.</p>",{q:"Heads and tails of phospholipids.",hint:"Hydro = water. Philic = loving.",onRight:upd});
L.choice(box,"p4.q3","3. Selective permeability means…",["the membrane lets some things cross more easily than others","the membrane lets every substance through at the same speed","the membrane is made of one single layer of lipid molecules","the membrane only ever moves water in and out of the cell"],0,{onRight:upd});
L.dnd(box,"p4.q4","4. Match each example to the process. Drag each card into a box, or tap a card and then tap a box.",["Diffusion","Facilitated diffusion","Active transport"],['<div class="stp">O₂ slips between the phospholipids</div>','<div class="stp">Glucose crosses through a carrier protein, no ATP</div>','<div class="stp">The Na⁺/K⁺ pump uses ATP</div>'],{names:["O2 slips between the phospholipids","Glucose crosses through a carrier protein, no ATP","The Na+/K+ pump uses ATP"]});
L.cloze(box,"p4.q5",`<p>5. Complete the table.</p><table class="vt">${[["Diffusion","high → low","No"],["Facilitated diffusion","high → low","No"],["Osmosis (water)","high → low water","No"],["ATP pump","low → high","Yes"]].map(r=>`<tr><td><b>${r[0]}</b></td><td>moves molecules from {{${["high → low","high → low water","low → high"].map(o=>(o===r[1]?"*":"")+o).join("|")}}}</td><td>Energy (ATP) used? {{${["Yes","No"].map(o=>(o===r[2]?"*":"")+o).join("|")}}}</td></tr>`).join("")}</table>`,{q:"Complete the table of transport types.",hint:"Passive = no energy, high to low.",onRight:upd});
L.choice(box,"p4.q6","6. A cell takes in a large protein by folding its membrane around it and pinching off a bubble. This is…",["Endocytosis","Exocytosis","Diffusion","Osmosis"],0,{onRight:upd});
L.choice(box,"p4.q7","7. Water moves across a membrane toward the side with…",["more dissolved solute","less dissolved solute","more ATP","more carrier proteins"],0,{explain:"Water follows solute (osmosis).",onRight:upd});
const fig=(h,c,cap)=>{const f=document.createElement("figure");f.style.margin="10px 0";f.appendChild(c);const t=document.createElement("figcaption");t.className="note";t.innerHTML=cap;f.appendChild(t);h.appendChild(f)};
const q8=document.createElement("div");box.appendChild(q8);
fig(q8,G.diag(640,340,G.dGluc,"Diagram of glucose absorption"),"<b>Picture for question 8.</b> 1 = the pump uses ATP to push Na⁺ out. 2 = Na⁺ flows in and pulls glucose with it. 3 = glucose leaves into the blood. (You practiced this in 3C.)");
L.choice(q8,"p4.q8","8. Look at the picture. How does the Na⁺/K⁺ pump help the cell take in glucose?",["It keeps Na⁺ low inside, so Na⁺ keeps flowing in with glucose","It carries glucose across the membrane using its own ATP","It breaks glucose into smaller pieces inside the cell","It blocks Na⁺ so glucose can enter the cell without it"],0,{explain:"The pump does not move glucose. It keeps the Na⁺ gradient going, and Na⁺ flowing in pulls glucose along.",onRight:upd});
const q9=document.createElement("div");box.appendChild(q9);
const gd=document.createElement("div");gd.style.cssText="display:flex;gap:10px;flex-wrap:wrap";[true,false].forEach(on=>{const c=G.diag(320,280,x=>G.dGrad(x,on),on?"Pumps on":"Pumps off");c.style.flex="1 1 240px";gd.appendChild(c)});q9.appendChild(gd);
q9.insertAdjacentHTML("beforeend",'<p class="note"><b>Picture for question 9.</b> Left: pumps ON (ATP available): lots of K⁺ inside, lots of Na⁺ outside, steady. Right: pumps OFF (no ATP): the ions leak until the amounts are about equal. (You practiced this in 3B.)</p>');
L.choice(q9,"p4.q9","9. Look at the pictures. What happens to the Na⁺ and K⁺ gradients if a cell runs out of ATP?",["The pumps stop, and the ions slowly leak toward equal amounts","The pumps speed up to make up for the missing ATP","The ions stop moving, so the gradients stay the same forever","The cell makes more Na⁺, so the gradient grows even larger"],0,{explain:"No ATP means no pumping. The ions keep leaking down their gradients, so the cell loses homeostasis.",onRight:upd});
/* sign + PDF */
const fin=document.createElement("section");fin.className="box";main.appendChild(fin);
const b=window.BVL;let sync=()=>{};
if(!b||!b.user()){fin.innerHTML='<h2>Download your worksheet as a PDF</h2><p>Sign in on the <a href="/home.html">home page</a> to create your PDF. (Your work is not saved until you sign in.)</p>'}
else{const p=b.profile(),need=[];if(!p.teacher||!p.period)need.push("Choose your teacher and period in Profile settings on the home page.");
 fin.innerHTML=`<h2>Download your worksheet as a PDF</h2><p class="note">The PDF includes your name, teacher and period, your labeled membrane, the vocabulary and definitions, your pictures of passive and active transport, your answers, your first-try score, and your signature. You can upload it to Schoology or open it in Notability.</p><p><b>Honor statement:</b> I completed this work myself, in my own words.</p><p class="note">Sign with your finger or Apple Pencil:</p><div id="sigw"></div><p class="fb bad" id="exm" aria-live="polite"></p><button class="wsblue" id="exb" disabled>⬇ Download PDF (you can upload this to Schoology)</button>`;
 const m=fin.querySelector("#exm"),btn=fin.querySelector("#exb");
 sync=()=>{const ok=!sig.empty()&&!need.length&&done();btn.disabled=!ok;m.className="fb bad";m.textContent=need[0]||(!done()?"Answer every question above to enable the download.":sig.empty()?"Please sign above to enable the download.":"")};
 const sig=b.sigPad(fin.querySelector("#sigw"),D.sig,()=>{D.sig=sig.data();L.save();sync()});sync();
 btn.onclick=()=>{btn.disabled=true;D.sig=sig.data();L.saveNow();CH.pdf(m,{});setTimeout(()=>{btn.disabled=false},500)}}
if(window.BVL&&BVL.mountSavePanel){const sv=document.createElement("div");main.appendChild(sv);BVL.mountSavePanel(sv)}
const nav=document.createElement("div");nav.className="navrow";nav.innerHTML='<a class="pbtn ghost" href="/u3/ch/p3.html" style="text-decoration:none">← Back to Part 3</a><a class="pbtn" href="/u3/ch.html" style="text-decoration:none">Back to lesson home</a>';main.appendChild(nav);
setInterval(()=>{if(done()&&!D.done.p4)upd();else sync()},700);
})();
