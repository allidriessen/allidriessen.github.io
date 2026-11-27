/* Summary: recap questions, signature and the PDF. */
(function(){
const L=LAB,D=L.D;
const main=CH.init({id:"p4",q:"What did you learn about how cells keep their balance?"});
const REQ=["p4.q1","p4.q2","p4.q3","p4.q4","p4.q5","p4.q6","p4.q7","p4.q8","p4.q9"];
const done=()=>REQ.every(i=>D.mc[i]&&D.mc[i].d);
const box=document.createElement("div");box.className="box";box.innerHTML='<h2>Check what you learned</h2><p class="note">Answer every question. If you miss one, try again. Your first-try score is shown on your PDF.</p>';main.appendChild(box);
const upd=()=>{if(done()){if(!D.done.p4){LAB.finish("p4")}fin.hidden=false;sync()}};
L.choice(box,"p4.q1","1. What is the main job of the cell membrane in keeping a cell stable (homeostasis)?",["It controls what enters and leaves the cell","It makes ATP","It stores the cell's DNA","It makes the cell larger"],0,{onRight:upd});
L.cloze(box,"p4.q2","<p>2. The phospholipid bilayer has {{*hydrophilic|hydrophobic}} heads that face the water and {{*hydrophobic|hydrophilic}} tails that hide in the middle.</p>",{q:"Heads and tails of phospholipids.",hint:"Hydro = water. Philic = loving.",onRight:upd});
L.choice(box,"p4.q3","3. Selective permeability means…",["the membrane lets some substances cross more easily than others","the membrane lets everything through","the membrane is made of one layer","the membrane only moves water"],0,{onRight:upd});
L.dnd(box,"p4.q4","4. Match each example to the process. Drag each card into a box, or tap a card and then tap a box.",["Diffusion","Facilitated diffusion","Active transport"],['<div class="stp">O₂ slips between the phospholipids</div>','<div class="stp">Glucose crosses through a carrier protein, no ATP</div>','<div class="stp">The Na⁺/K⁺ pump uses ATP</div>'],{names:["O2 slips between the phospholipids","Glucose crosses through a carrier protein, no ATP","The Na+/K+ pump uses ATP"]});
L.cloze(box,"p4.q5",`<p>5. Complete the table.</p><table class="vt">${[["Diffusion","high → low","No"],["Facilitated diffusion","high → low","No"],["Osmosis (water)","high → low water","No"],["ATP pump","low → high","Yes"]].map(r=>`<tr><td><b>${r[0]}</b></td><td>moves molecules from {{${["high → low","high → low water","low → high"].map(o=>(o===r[1]?"*":"")+o).join("|")}}}</td><td>Energy (ATP) used? {{${["Yes","No"].map(o=>(o===r[2]?"*":"")+o).join("|")}}}</td></tr>`).join("")}</table>`,{q:"Complete the table of transport types.",hint:"Passive = no energy, high to low.",onRight:upd});
L.choice(box,"p4.q6","6. A cell takes in a large protein by folding its membrane around it and pinching off a bubble. This is…",["Endocytosis","Exocytosis","Diffusion","Osmosis"],0,{onRight:upd});
L.choice(box,"p4.q7","7. Water moves across a membrane toward the side with…",["more dissolved solute","less dissolved solute","more ATP","more carrier proteins"],0,{explain:"Water follows solute (osmosis).",onRight:upd});
L.choice(box,"p4.q8","8. How does the Na⁺/K⁺ pump help intestinal cells absorb glucose?",["It keeps Na⁺ low inside the cell, so Na⁺ keeps flowing in and pulling glucose along","It moves glucose directly into the cell using ATP","It breaks glucose into smaller pieces","It stops Na⁺ from ever entering the cell"],0,{onRight:upd});
L.choice(box,"p4.q9","9. What would happen to a cell's Na⁺ and K⁺ if it ran out of ATP?",["The pumps would stop and the gradients would slowly fade","The pumps would work faster","Na⁺ and K⁺ would never move again","The cell would make more Na⁺"],0,{onRight:upd});
/* sign + PDF */
const fin=document.createElement("section");fin.className="box";fin.hidden=true;main.appendChild(fin);
const b=window.BVL;let sync=()=>{};
if(!b||!b.user()){fin.innerHTML='<h2>Download your work</h2><p>Sign in on the <a href="/home.html">home page</a> to create your PDF. (Your work is not saved until you sign in.)</p>'}
else{const p=b.profile(),need=[];if(!p.teacher||!p.period)need.push("Choose your teacher and period in Profile settings on the home page.");
 fin.innerHTML=`<h2>Save and hand in</h2><p>The PDF includes your labeled membrane, vocabulary and definitions, your pictures of passive and active transport, your answers, your first-try score, and your signature. Upload it to Schoology.</p><p><b>Honor statement:</b> I completed this work myself, in my own words.</p><p class="note">Sign with your finger or Apple Pencil:</p><div id="sigw"></div><p class="fb" id="exm" aria-live="polite"></p><button class="pbtn" id="exb" disabled>⬇ Download PDF</button>`;
 const m=fin.querySelector("#exm"),btn=fin.querySelector("#exb");
 sync=()=>{const ok=!sig.empty()&&!need.length&&done();btn.disabled=!ok;m.className="fb bad";m.textContent=need[0]||(sig.empty()?"Please sign above to enable the download.":"")};
 const sig=b.sigPad(fin.querySelector("#sigw"),D.sig,()=>{D.sig=sig.data();L.save();sync()});sync();
 btn.onclick=()=>{btn.disabled=true;D.sig=sig.data();L.saveNow();CH.pdf(m,{});setTimeout(()=>{btn.disabled=false},500)}}
if(window.BVL&&BVL.mountSavePanel){const sv=document.createElement("div");main.appendChild(sv);BVL.mountSavePanel(sv)}
const nav=document.createElement("div");nav.className="navrow";nav.innerHTML='<a class="pbtn ghost" href="/u3/ch/p3.html" style="text-decoration:none">← Part 3</a><a class="pbtn" href="/u3/ch.html" style="text-decoration:none">Back to the activity page</a>';main.appendChild(nav);
if(done())fin.hidden=false;
setInterval(()=>{if(done()&&fin.hidden)upd()},700);
})();
