/* The Google Sheet (Release schedule) now controls when things open. The dates below are only a backup,
   used if the sheet cannot be reached or an item is missing from it. */
/* ===== TEACHER SETTINGS: the only file you edit during the year =====
   HOW TO EDIT SAFELY: change only the text between quotation marks and the dates.
   Every line inside a list ends with a comma, except the last one. A missing comma or
   quotation mark can stop this whole file from loading.

   release: the date (YYYY-MM-DD) something becomes visible and clickable.
            Before that date students see a blurry magnifying glass and "Not yet discovered".
   theme:   the picture inside the magnifying glass: earth, atoms, cells, dna, protein,
            chromo, punnett, tree, body. (An activity uses its unit's theme unless it has its own.)
   NOTE: titles in this file can be read by anyone who views the page source. */
window.BVL_CFG={
  teacherCode:"teacher",   // change this. Add ?preview=YOURCODE to a page address to see everything unlocked.
  siteTitle:"Exploratory Biology",   // or "Biology Simulations & Labs"
  siteSub:"Explore, experiment, and investigate. New units appear as we discover them in class."
};
window.BVL_UNITS=[
 {n:1,title:"Ecosystem Interactions & Dynamics",theme:"earth",release:"2026-08-17",activities:[
 ]},
 {n:2,title:"Matter & Energy",theme:"atoms",release:"2026-09-21",activities:[
  {key:"ervl",group:"lab",title:"Enzymatic Reactions Virtual Lab",desc:"Guided lab: how do temperature, pH, and concentrations change enzyme activity?",url:"/u2/ervl.html",release:"2099-01-01"},   /* set the real release date (or the Google Sheet row u2/ervl) when ready */
  {key:"ers",group:"sim",title:"Enzymatic Reactions Simulator",desc:"",url:"/u2/ers.html",release:"2026-09-21"},
  {key:"ersbe",group:"sim",title:"Enzymatic Reactions Simulator: Build the Equation",desc:"",url:"/u2/ersbe.html",release:"2026-09-28"}
 ]},
 {n:3,title:"Cellular Dynamics: The Life and Death of a Cell",theme:"cells",release:"2026-10-26",activities:[
  {key:"cce",title:"Cancer Cell Exploration",desc:"How are cancer cells different from normal cells?",url:"/u3/cce.html",release:"2026-10-26"},
  {key:"ch",title:"Cellular Homeostasis",desc:"",url:"/u3/ch.html",release:"2099-01-01"}   /* in development: set the real date when ready */
 ]},
 {n:4,title:"The Quest to Discover Life's Molecular Code",theme:"dna",release:"2027-01-11",activities:[
 ]},
 {n:5,title:"From Genes to Proteins: How Molecules Shape Us",theme:"protein",release:"2027-02-08",activities:[
 ]},
 {n:6,title:"Inheritance and Variation: Passing and Changing Genes Through Generations",theme:"chromo",release:"2027-03-01",activities:[
 ]},
 {n:7,title:"Patterns of Heredity",theme:"punnett",release:"2027-03-22",activities:[
 ]},
 {n:8,title:"Natural Selection & Evolution of Populations",theme:"tree",release:"2027-04-12",activities:[
 ]},
 {n:9,title:"Human Body Systems",theme:"body",release:"2027-05-03",activities:[
 ]}
];
