connect2Server(3000);
getEvent("ping", function(x){});

var mapDir = { w:"F", a:"L", s:"B", d:"R" };
var mapOnce = { l:"LED", x:"S" };
var hornKey = "b";

var pressed = {};
var currentDir = null;
var dirTimer = null;
var hornTimer = null;

function send(c){
  if(!c) return;
  postEvent("command", { cmd:c }, function(){});
}

function startDir(cmd){
  currentDir = cmd;
  stopDirTimer();
  send(cmd);
  dirTimer = setInterval(function(){ send(currentDir); }, 100);
}

function stopDir(){
  stopDirTimer();
  if(currentDir){ send("S"); }
  currentDir = null;
}

function stopDirTimer(){
  if(dirTimer){ clearInterval(dirTimer); dirTimer = null; }
}

function startHorn(){
  stopHorn();
  send("HORN");
  hornTimer = setInterval(function(){ send("HORN"); }, 120);
}

function stopHorn(){
  if(hornTimer){ clearInterval(hornTimer); hornTimer = null; }
}

document.addEventListener("keydown", function(e){
  var k = (e.key||"").toLowerCase();
  if(pressed[k]) return;
  pressed[k] = true;

  if(mapDir[k]){
    if(currentDir !== mapDir[k]) startDir(mapDir[k]);
    return;
  }
  if(k === hornKey){
    startHorn();
    return;
  }
  if(mapOnce[k]){
    send(mapOnce[k]);
    return;
  }
});

document.addEventListener("keyup", function(e){
  var k = (e.key||"").toLowerCase();
  pressed[k] = false;

  if(mapDir[k]){
    if(currentDir === mapDir[k]) stopDir();
    return;
  }
  if(k === hornKey){
    stopHorn();
    return;
  }
});
