const intro = document.getElementById("intro");
const beginBtn = document.getElementById("beginBtn");
const excavation = document.getElementById("excavation");
const collection = document.getElementById("collection");
const mapScene = document.getElementById("mapScene");
const instruction = document.getElementById("instruction");
const phaseLabel = document.getElementById("phaseLabel");
const mainTitle = document.getElementById("mainTitle");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const scroll = document.getElementById("scroll");
const closeScroll = document.getElementById("closeScroll");
const continueBtn = document.getElementById("continueBtn");
const scrollKicker = document.getElementById("scrollKicker");
const scrollTitle = document.getElementById("scrollTitle");
const scrollText = document.getElementById("scrollText");
const final = document.getElementById("final");
const finalSmall = document.getElementById("finalSmall");
const finalTitle = document.getElementById("finalTitle");
const finalBody = document.getElementById("finalBody");
const finalTag = document.getElementById("finalTag");

let phase = "puzzle";
let current = null;
let offsetX = 0;
let offsetY = 0;
let recovered = 0;
let connectionIndex = 0;
let audio = null;

const recoveredSet = new Set();
const homePositions = {};

const pairs = [
  {
    a:"spices",
    b:"coin",
    route:"route1",
    label:"Spices + Coin",
    kicker:"Connection 1 / Economic Exchange",
    title:"Economic Exchange",
    text:"Spices moved across deserts and mountain corridors because they were rare, valuable and desired. Coins made this movement measurable. Together, they show how local markets became connected to a wider world of exchange."
  },
  {
    a:"coin",
    b:"ceramic",
    route:"route2",
    label:"Coin + Ceramic",
    kicker:"Connection 2 / Trade Networks",
    title:"Trade Networks",
    text:"Ceramics produced in China travelled far beyond their place of origin. Coins represent the commercial systems that allowed merchants, workshops and distant consumers to become part of the same trading network."
  },
  {
    a:"ceramic",
    b:"silk",
    route:"route3",
    label:"Ceramic + Silk",
    kicker:"Connection 3 / Cultural Exchange",
    title:"Cultural Exchange",
    text:"Objects carried more than material value. Ceramics and silk moved colours, symbols, techniques and tastes across borders. Through trade, visual culture travelled with the goods themselves."
  },
  {
    a:"silk",
    b:"manuscript",
    route:"route4",
    label:"Silk + Manuscript",
    kicker:"Connection 4 / Spread of Ideas",
    title:"Spread of Ideas",
    text:"Manuscripts, religious texts and stories often travelled alongside luxury goods. The same routes that carried silk also helped Buddhism, Christianity, Islam, science and literature move between regions."
  },
  {
    a:"manuscript",
    b:"compass",
    route:"route5",
    label:"Manuscript + Compass",
    kicker:"Connection 5 / Knowledge and Navigation",
    title:"Knowledge and Navigation",
    text:"Written knowledge and navigation technologies changed how distance was imagined. Maps, instruments and recorded experience helped travellers understand routes, risks and worlds beyond their own."
  }
];

document.querySelectorAll("img").forEach(img=>{
  img.setAttribute("draggable","false");
  img.addEventListener("dragstart", e => e.preventDefault());
});
beginBtn.addEventListener("click", () => {
  intro.classList.add("hide");
  initAudio();
  tone(180,.14);
  saveHomePositions();
});

closeScroll.addEventListener("click", hideScroll);
continueBtn.addEventListener("click", hideScroll);

document.querySelectorAll(".piece,.artifact").forEach(el => {
  el.addEventListener("pointerdown", startDrag);
});

window.addEventListener("pointermove", moveDrag);
window.addEventListener("pointerup", endDrag);

function initAudio(){
  if(!audio){
    audio = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function tone(freq,dur=.18){
  if(!audio) return;

  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = "triangle";
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(.0001,audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(.08,audio.currentTime+.02);
  gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+dur);

  osc.connect(gain);
  gain.connect(audio.destination);

  osc.start();
  osc.stop(audio.currentTime+dur+.04);
}

function chord(){
  [220,277,330,440].forEach((f,i)=>{
    setTimeout(()=>tone(f,.35),i*120);
  });
}

function saveHomePositions(){
  document.querySelectorAll(".artifact").forEach(el=>{
    homePositions[el.id] = {
      left:el.style.left,
      top:el.style.top
    };
  });
}

function startDrag(e){
  const el = e.currentTarget;

  if(el.classList.contains("merged")) return;

  if(phase === "puzzle" && !el.classList.contains("piece")) return;
  if(phase === "map" && !el.classList.contains("artifact")) return;

  current = el;
  current.classList.add("dragging");

  const r = current.getBoundingClientRect();
  offsetX = e.clientX - r.left;
  offsetY = e.clientY - r.top;

  current.setPointerCapture(e.pointerId);

  initAudio();
  tone(150,.08);
}

function moveDrag(e){
  if(!current) return;

  current.style.left = `${e.clientX - offsetX}px`;
  current.style.top = `${e.clientY - offsetY}px`;

  if(phase === "puzzle") highlightMatchingFragment();
  if(phase === "map") highlightCurrentPair();
}

function endDrag(){
  if(!current) return;

  if(phase === "puzzle") tryMergeFragments();
  if(phase === "map") tryActivateConnection();

  current.classList.remove("dragging");

  document.querySelectorAll(".piece,.artifact").forEach(el=>{
    el.classList.remove("near");
  });

  current = null;
}

function center(el){
  const r = el.getBoundingClientRect();
  return {
    x:r.left + r.width/2,
    y:r.top + r.height/2
  };
}

function distance(a,b){
  const A = center(a);
  const B = center(b);
  return Math.hypot(A.x - B.x, A.y - B.y);
}

function matchingPiece(){
  const name = current.dataset.artifact;
  const side = current.dataset.side;

  return [...document.querySelectorAll(`.piece[data-artifact="${name}"]:not(.merged)`)]
    .find(p => p !== current && p.dataset.side !== side);
}

function highlightMatchingFragment(){
  document.querySelectorAll(".piece").forEach(p=>{
    p.classList.remove("near");
  });

  const other = matchingPiece();

  if(other && distance(current,other) < 260){
    current.classList.add("near");
    other.classList.add("near");
  }
}

function tryMergeFragments(){
  const other = matchingPiece();

  if(other && distance(current,other) < 260){
    const name = current.dataset.artifact;

    current.classList.add("merged");
    other.classList.add("merged");

    recoverArtifact(name);

    tone(330,.24);
  }else{
    tone(105,.12);
  }
}

function recoverArtifact(name){
  if(recoveredSet.has(name)) return;

  recoveredSet.add(name);
  recovered++;

  const icon = document.createElement("div");
  icon.className = "recoveredIcon";
  icon.innerHTML = `<img src="assets/${name}.png" alt="${name}">`;

  collection.appendChild(icon);

  progressText.textContent = `${recovered} / 6 artifacts recovered`;
  progressFill.style.width = `${recovered/6*100}%`;

  if(recovered === 6){
    setTimeout(startMapPhase,900);
  }
}

function startMapPhase(){
  phase = "map";

  excavation.classList.add("hide");
  mapScene.classList.add("show");

  phaseLabel.textContent = "Phase 2 / Historical Connections";
  mainTitle.textContent = "Connect the Recovered Objects";

  progressText.textContent = "0 / 5 connections activated";
  progressFill.style.width = "0%";

  instruction.innerHTML = `<strong>Step 2:</strong> Find the first connection: <b>${pairs[0].label}</b>. Drag these two artifacts together.`;

  saveHomePositions();
  chord();
}

function currentPair(){
  return pairs[connectionIndex];
}

function highlightCurrentPair(){
  document.querySelectorAll(".artifact").forEach(a=>{
    a.classList.remove("near");
  });

  const pair = currentPair();
  if(!pair) return;

  if(current.dataset.name === pair.a || current.dataset.name === pair.b){
    document.getElementById(pair.a).classList.add("near");
    document.getElementById(pair.b).classList.add("near");
  }
}

function tryActivateConnection(){
  const pair = currentPair();
  if(!pair) return;

  const a = document.getElementById(pair.a);
  const b = document.getElementById(pair.b);

  const draggedName = current.dataset.name;
  const isCorrectArtifact = draggedName === pair.a || draggedName === pair.b;
  const isCloseEnough = distance(a,b) < 150;

  if(isCorrectArtifact && isCloseEnough){
    document.getElementById(pair.route).classList.add("active");

    a.classList.add("flash");
    b.classList.add("flash");

    setTimeout(()=>{
      a.classList.remove("flash");
      b.classList.remove("flash");
      returnArtifact(a);
      returnArtifact(b);
    },650);

    scrollKicker.textContent = pair.kicker;
    scrollTitle.textContent = pair.title;
    scrollText.textContent = pair.text;
    scroll.classList.add("show");

    connectionIndex++;

    progressText.textContent = `${connectionIndex} / 5 connections activated`;
    progressFill.style.width = `${connectionIndex/5*100}%`;

    tone(260+connectionIndex*55,.25);

    if(connectionIndex === pairs.length){
      instruction.innerHTML = `<strong>Final:</strong> All connections have been activated. The Silk Road network is complete.`;
      setTimeout(()=>{
        scroll.classList.remove("show");
        playEnding();
      },1800);
    }else{
      instruction.innerHTML = `<strong>Step 2:</strong> Connection activated. Next, find: <b>${pairs[connectionIndex].label}</b>.`;
    }
  }else{
    tone(105,.12);
    instruction.innerHTML = `<strong>Hint:</strong> Current connection is <b>${pair.label}</b>. Drag these two artifacts close together.`;
  }
}

function returnArtifact(el){
  const home = homePositions[el.id];
  if(!home) return;

  el.classList.add("returning");
  el.style.left = home.left;
  el.style.top = home.top;

  setTimeout(()=>{
    el.classList.remove("returning");
  },700);
}

function hideScroll(){
  scroll.classList.remove("show");

  if(phase === "map" && connectionIndex < pairs.length){
    instruction.innerHTML = `<strong>Step 2:</strong> Find the connection: <b>${pairs[connectionIndex].label}</b>. Drag these two artifacts together.`;
  }
}

function playEnding(){
  final.classList.add("show");
  mapScene.classList.add("ending");
  chord();

  const scenes = [
    {
      small:"The objects have been restored.",
      title:"But the Silk Road was never only about objects.",
      body:"Every fragment carried more than material value. It carried labour, memory, belief and distance."
    },
    {
      small:"Across deserts, mountains and seas...",
      title:"Merchants carried spices. Pilgrims carried beliefs.",
      body:"Scholars carried manuscripts. Travellers carried stories. Technologies moved with people, and people moved with hope, risk and desire."
    },
    {
      small:"Economic exchange became cultural exchange.",
      title:"Goods travelled. Ideas travelled. History travelled.",
      body:"Silk, ceramics, coins, texts and instruments formed a network that connected China, Central Asia, Persia, the Mediterranean and beyond."
    },
    {
      small:"The network is fully illuminated.",
      title:"The Silk Road was not a single road.",
      body:"It was a living system of trade, culture, belief, knowledge and technology — reconstructed here through touch."
    }
  ];

  let i = 0;

  function showScene(){
    if(i >= scenes.length){
      finalTag.textContent = "Reconstructed through touch.";
      return;
    }

    finalSmall.classList.add("fadeOut");
    finalTitle.classList.add("fadeOut");
    finalBody.classList.add("fadeOut");

    setTimeout(()=>{
      finalSmall.textContent = scenes[i].small;
      finalTitle.textContent = scenes[i].title;
      finalBody.textContent = scenes[i].body;

      finalSmall.classList.remove("fadeOut");
      finalTitle.classList.remove("fadeOut");
      finalBody.classList.remove("fadeOut");

      i++;
      setTimeout(showScene,5200);
    },650);
  }

  showScene();
}