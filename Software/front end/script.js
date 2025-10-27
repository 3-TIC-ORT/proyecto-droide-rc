connect2Server(3000);
getEvent("ping", function(x){});

var mapDir  = { w:"F", a:"L", s:"B", d:"R" };
var mapOnce = { l:"LED", x:"S" };
var hornKey = "b";

var pressed = {};
var currentDir = null;
var dirTimer = null;
var hornTimer = null;

var upEl    = document.querySelector(".arrow.up");
var leftEl  = document.querySelector(".arrow.left");
var downEl  = document.querySelector(".arrow.down");
var rightEl = document.querySelector(".arrow.right");

function send(c){
  if(!c) return;
  postEvent("command", { cmd:c }, function(){});
}

function clearGlow(){
  upEl.classList.remove("on");
  leftEl.classList.remove("on");
  downEl.classList.remove("on");
  rightEl.classList.remove("on");
}
function glowForCmd(cmd, on){
  if(cmd === "F") upEl.classList.toggle("on", !!on);
  if(cmd === "L") leftEl.classList.toggle("on", !!on);
  if(cmd === "B") downEl.classList.toggle("on", !!on);
  if(cmd === "R") rightEl.classList.toggle("on", !!on);
}

function startDir(cmd){
  clearGlow();
  glowForCmd(cmd, true);
  currentDir = cmd;
  if (dirTimer) { clearInterval(dirTimer); dirTimer = null; }
  send(cmd);
  dirTimer = setInterval(function(){ send(currentDir); }, 100);
}

function stopDir(){
  if (dirTimer) { clearInterval(dirTimer); dirTimer = null; }
  if (currentDir){
    glowForCmd(currentDir, false);
    send("S");
  }
  currentDir = null;
}

function startHorn(){
  if (hornTimer) { clearInterval(hornTimer); hornTimer = null; }
  send("HORN");
  hornTimer = setInterval(function(){ send("HORN"); }, 120);
}

function stopHorn(){
  if (hornTimer){ clearInterval(hornTimer); hornTimer = null; }
}

document.addEventListener("keydown", function(e){
  var k = (e.key||"").toLowerCase();
  if (pressed[k]) return;
  pressed[k] = true;

  if (mapDir[k]){
    var cmd = mapDir[k];
    if (currentDir !== cmd){
      startDir(cmd);
    }
    e.preventDefault();
    return;
  }

  if (k === hornKey){
    startHorn();
    e.preventDefault();
    return;
  }

  if (mapOnce[k]){
    if (mapOnce[k] === "S"){
      clearGlow();
      currentDir = null;
      if (dirTimer){ clearInterval(dirTimer); dirTimer = null; }
    }
    send(mapOnce[k]);
    e.preventDefault();
    return;
  }
});

document.addEventListener("keyup", function(e){
  var k = (e.key||"").toLowerCase();
  pressed[k] = false;

  if (mapDir[k]){
    var cmd = mapDir[k];
    if (currentDir === cmd){
      stopDir();
    } else {
      glowForCmd(cmd, false);
    }
    e.preventDefault();
    return;
  }

  if (k === hornKey){
    stopHorn();
    e.preventDefault();
    return;
  }
});

window.addEventListener("beforeunload", function(){
  try {
    stopHorn();
    stopDir();
    send("S");
    clearGlow();
  } catch(e){}
});
