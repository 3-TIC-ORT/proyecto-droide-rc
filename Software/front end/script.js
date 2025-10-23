connect2Server();

var teclas = { w:"F", a:"L", s:"B", d:"R", x:"S", l:"LED", b:"HORN" };

function mandar(c){
  if(!c) return;
  postEvent("command",{cmd:c},function(){});
}

document.addEventListener("keydown",function(e){
  var k = (e.key || "").toLowerCase();
  if(teclas[k]) mandar(teclas[k]);
});
