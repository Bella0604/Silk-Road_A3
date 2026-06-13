// Silk Road Reconstructed
// OART1013 Interactive Media
//
// This project explores how drag interaction can support
// historical learning through reconstruction, discovery
// and connection.
//
// Context:
// Silk Road exchange network
//
// Chosen Action:
// Drag
//
// Design Goal:
// Encourage users to learn through interaction
// rather than simply reading information.
// js for assignment

var startPage = document.getElementById("startPage");
var startBtn = document.getElementById("startBtn");
var dig = document.getElementById("digArea");
var tray = document.getElementById("tray");
var theMap = document.getElementById("mapBox");
var hint = document.getElementById("hint");
var lblPart = document.getElementById("lbl_part");
var h2title = document.getElementById("bigTitle");
var progTxt = document.getElementById("txt_prog");
var bar = document.getElementById("progInner");
var popup = document.getElementById("popup");
var btnClose = document.getElementById("btn_close");
var btnOk = document.getElementById("btn_ok");
var popSub = document.getElementById("popup_sub");
var popHead = document.getElementById("popup_h");
var popMsg = document.getElementById("popup_p");
var endDiv = document.getElementById("screen_end");
var t1 = document.getElementById("end_line1");
var t2 = document.getElementById("end_h");
var t3 = document.getElementById("end_p");
var t4 = document.getElementById("end_footer");
var leftArrow = document.getElementById("btn_left");
var rightArrow = document.getElementById("btn_right");
var restartBtn = document.getElementById("restartBtn");

var whichPart = 1;
var thing = null;
var xx = 0;
var yy = 0;
var num = 0;
var n = 0;
var s = 0;
var oldPos = {};
var got = [];

// Each pairing represents a different form of exchange
// along the Silk Road. Instead of presenting history as
// a timeline, the project reveals history through
// relationships between objects.

var linkData = [
  ["spices", "coin", "route1", "Spices + Coin", "Spices and Coin",
   "Spices were traded along the Silk Road because they were valuable. Coins made it easier to buy and sell things in different cities."],
  ["coin", "ceramic", "route2", "Coin + Ceramic", "Coin and Ceramic",
   "Chinese ceramics were sold to many places. Coins show how trade worked between merchants and buyers."],
  ["ceramic", "silk", "route3", "Ceramic + Silk", "Ceramic and Silk",
   "Silk and pottery were both popular trade goods. They also spread styles and ideas between cultures."],
  ["silk", "manuscript", "route4", "Silk + Manuscript", "Silk and Manuscript",
   "Books and religious texts travelled with traders. The same routes used for silk also helped spread knowledge."],
  ["manuscript", "compass", "route5", "Manuscript + Compass", "Manuscript and Compass",
   "Maps and navigation tools helped people travel long distances. Written records made this knowledge easier to share."]
];

// Final reflection screens.
// The ending sequence encourages users to think about
// the Silk Road as a network of exchange rather than
// a single historical route.

var endTxt = [
[
"The fragments are no longer silent.",
"Each restored object holds a trace of movement.",
"A spice bowl, a coin, a piece of silk, a manuscript, a compass — none of them can tell the whole story alone."
],

[
"When placed in relation, they begin to speak.",
"Trade becomes more than exchange.",
"It becomes a way for people, beliefs, techniques and ways of seeing the world to travel across distance."
],

[
"The Silk Road was not a single line across a map.",
"It was built through repeated encounters.",
"Merchants, travellers, scholars and pilgrims carried objects, but they also carried languages, memories, risks and ideas."
],

[
"What has been reconstructed is not only a route.",
"It is a network of human connection.",
"History remains incomplete, but each fragment helps us imagine how distant worlds once touched."
]
];



startBtn.onclick = go;
btnClose.onclick = shutPop;
btnOk.onclick = shutPop;
leftArrow.onclick = back;
rightArrow.onclick = forward;

restartBtn.onclick = function () {
  location.reload();
};

window.onpointermove = dragMove;
window.onpointerup = dragStop;

var picList = document.getElementsByTagName("img");
for (var i = 0; i < picList.length; i++) {
  picList[i].draggable = false;
}

var frags = document.getElementsByClassName("frag");
for (var k = 0; k < frags.length; k++) {
  frags[k].onpointerdown = dragStart;
}

// --------------------------------------------------
// INTRODUCTION
// The experience begins with a simple start screen.
// Users intentionally enter the experience before
// interacting with historical content.
// --------------------------------------------------

function go() {
  startPage.className = "startPage hide";
  savePos();
}

function savePos() {
  var tmp = document.getElementsByClassName("mapItem");
  for (var i = 0; i < tmp.length; i++) {
    oldPos[tmp[i].id] = {
      left: tmp[i].style.left,
      top: tmp[i].style.top
    };
  }
}

// --------------------------------------------------
// PHASE 1: RECONSTRUCTION
// Users rebuild fragmented artefacts before learning
// about their historical significance.
//
// This interaction was inspired by archaeological
// reconstruction, where historians work with fragments
// rather than complete objects.
// --------------------------------------------------

function dragStart(e) {
  var el = e.currentTarget;

  if (el.className.indexOf("merged") > -1) return;
  if (whichPart == 1 && el.className.indexOf("frag") == -1) return;
  if (whichPart == 2 && el.className.indexOf("mapItem") == -1) return;

  thing = el;
  thing.className = thing.className + " dragging";

  var parent = thing.offsetParent || document.body;
  var pr = parent.getBoundingClientRect();
  var b = thing.getBoundingClientRect();

  xx = e.clientX - b.left;
  yy = e.clientY - b.top;

  if (thing.className.indexOf("mapItem") > -1) {
    thing.style.transform = "none";
  }

  thing.style.left = (b.left - pr.left) + "px";
  thing.style.top = (b.top - pr.top) + "px";
}

function dragMove(e) {
  if (thing == null) return;

  var parent = thing.offsetParent || document.body;
  var pr = parent.getBoundingClientRect();

  thing.style.left = (e.clientX - xx - pr.left) + "px";
  thing.style.top = (e.clientY - yy - pr.top) + "px";

  if (whichPart == 1) glowPiece();
  else glowPair();
}

function dragStop() {
  if (thing == null) return;

  if (whichPart == 1) doMerge();
  else tryLink();

  thing.className = thing.className.replace(" dragging", "");
  thing = null;
  removeGlow();
}

function removeGlow() {
  var a = document.getElementsByClassName("frag");
  for (var i = 0; i < a.length; i++) {
    a[i].className = a[i].className.replace(" near", "");
  }
  var b = document.getElementsByClassName("mapItem");
  for (var j = 0; j < b.length; j++) {
    b[j].className = b[j].className.replace(" near", "");
  }
}

function dist(el1, el2) {
  var r1 = el1.getBoundingClientRect();
  var r2 = el2.getBoundingClientRect();
  var x1 = r1.left + r1.width / 2;
  var y1 = r1.top + r1.height / 2;
  var x2 = r2.left + r2.width / 2;
  var y2 = r2.top + r2.height / 2;
  var d1 = x1 - x2;
  var d2 = y1 - y2;
  return Math.sqrt(d1 * d1 + d2 * d2);
}

function findMatch() {
  var nm = thing.getAttribute("data-artifact");
  var sd = thing.getAttribute("data-side");
  var all = document.getElementsByClassName("frag");

  for (var i = 0; i < all.length; i++) {
    if (all[i].getAttribute("data-artifact") == nm &&
        all[i].getAttribute("data-side") != sd &&
        all[i].className.indexOf("merged") == -1 &&
        all[i] != thing) {
      return all[i];
    }
  }
  return null;
}

function glowPiece() {
  removeGlow();
  var other = findMatch();
  if (other != null && dist(thing, other) < 260) {
    thing.className = thing.className + " near";
    other.className = other.className + " near";
  }
}

// Successful reconstruction provides immediate feedback.
// Completing an object helps users understand that they
// have restored a piece of historical evidence.

function doMerge() {
  var other = findMatch();
  if (other != null && dist(thing, other) < 260) {
    var nm = thing.getAttribute("data-artifact");
    thing.className = thing.className + " merged";
    other.className = other.className + " merged";
    addGot(nm);
  }
}

function addGot(name) {
  for (var i = 0; i < got.length; i++) {
    if (got[i] == name) return;
  }

  got.push(name);
  num = num + 1;

  var d = document.createElement("div");
  d.className = "gotIcon";
  d.innerHTML = "<img src='assets/" + name + ".png'>";
  tray.appendChild(d);

  progTxt.innerHTML = num + " / 6 done";
  bar.style.width = (num / 6 * 100) + "%";

  if (num == 6) {
    setTimeout(part2, 800);
  }
}

// --------------------------------------------------
// PHASE 2: HISTORICAL CONNECTIONS
// The focus shifts from individual artefacts to
// relationships between artefacts.
//
// Users discover different forms of exchange through
// drag-based connections.
// --------------------------------------------------

function part2() {
  whichPart = 2;
  dig.className = "digArea hide";
  theMap.className = "mapBox show";

  lblPart.innerHTML = "PHASE 2 / HISTORICAL CONNECTIONS";
  h2title.innerHTML = "Connect the Recovered Objects";
  progTxt.innerHTML = "0 / 5 connections activated";
  bar.style.width = "0%";
  hint.innerHTML = "Step 2: Find the first connection: " + linkData[0][3] + ". Drag these two artifacts together.";

  savePos();

  var items = document.getElementsByClassName("mapItem");
  for (var i = 0; i < items.length; i++) {
    items[i].onpointerdown = dragStart;
  }
}

function glowPair() {
  removeGlow();
  if (n >= linkData.length) return;

  var aa = linkData[n][0];
  var bb = linkData[n][1];
  var nm = thing.getAttribute("data-name");

  if (nm == aa || nm == bb) {
    document.getElementById(aa).className = document.getElementById(aa).className + " near";
    document.getElementById(bb).className = document.getElementById(bb).className + " near";
  }
}

// Each successful connection reveals a historical
// relationship. Information is unlocked through
// interaction rather than being presented immediately.

function tryLink() {
  if (n >= linkData.length) return;

  var aa = linkData[n][0];
  var bb = linkData[n][1];
  var rt = linkData[n][2];
  var lb = linkData[n][3];
  var hd = linkData[n][4];
  var tx = linkData[n][5];

  var el1 = document.getElementById(aa);
  var el2 = document.getElementById(bb);
  var nm = thing.getAttribute("data-name");

  if ((nm == aa || nm == bb) && dist(el1, el2) < 150) {
    lightRoute(rt);

    el1.className = el1.className + " flash";
    el2.className = el2.className + " flash";

    setTimeout(function () {
      el1.className = el1.className.replace(" flash", "");
      el2.className = el2.className.replace(" flash", "");
      goHome(el1);
      goHome(el2);
    }, 500);

    popSub.innerHTML = "Connection " + (n + 1);
    popHead.innerHTML = hd;
    popMsg.innerHTML = tx;
    popup.className = "popup show";

    n = n + 1;
    progTxt.innerHTML = n + " / 5 connected";
    bar.style.width = (n / 5 * 100) + "%";

    if (n == linkData.length) {
      hint.innerHTML = "All connections done.";
      setTimeout(function () {
        popup.className = "popup";
        endGame();
      }, 1500);
    } else {
      hint.innerHTML = "Next: " + linkData[n][3];
    }
  } else {
    hint.innerHTML = "Try connecting " + lb;
  }
}

// Illuminated routes provide visual feedback and
// gradually reveal the Silk Road as an interconnected
// network of movement and exchange.

function lightRoute(id) {
  var path = document.getElementById(id);
  if (path) path.classList.add("active");
}

function goHome(el) {
  if (!oldPos[el.id]) return;

  el.className = el.className + " returning";
  el.style.left = oldPos[el.id].left;
  el.style.top = oldPos[el.id].top;

  if (el.className.indexOf("mapItem") > -1) {
    el.style.transform = "translate(-50%, -50%)";
  }

  setTimeout(function () {
    el.className = el.className.replace(" returning", "");
  }, 600);
}

function shutPop() {
  popup.className = "popup";
  if (whichPart == 2 && n < linkData.length) {
    hint.innerHTML = "Connect: " + linkData[n][3];
  }
}

// --------------------------------------------------
// FINAL REFLECTION
// After reconstructing artefacts and connections,
// users are encouraged to reflect on the Silk Road
// as a complex system of cultural, economic and
// technological exchange.
// --------------------------------------------------

function endGame() {
  endDiv.className = "endscreen show";
  chSlide(0);
}

// The final slides connect individual objects
// to the larger Silk Road network and encourage reflection.

function chSlide(x) {
  if (x < 0 || x >= endTxt.length) return;

  s = x;
  t1.innerHTML = endTxt[s][0];
  t2.innerHTML = endTxt[s][1];
  t3.innerHTML = endTxt[s][2];

  if (s == endTxt.length - 1) {
    t4.innerHTML = "Thanks for playing";
  } else {
    t4.innerHTML = (s + 1) + " / " + endTxt.length;
  }

  leftArrow.disabled = (s == 0);
  rightArrow.disabled = (s == endTxt.length - 1);
}

function back() {
  chSlide(s - 1);
}

function forward() {
  chSlide(s + 1);
}
