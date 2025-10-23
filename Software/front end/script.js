connect2Server();

var m = { w:"F", a:"L", s:"B", d:"R", x:"S", l:"LED", b:"HORN" };

function send(x){ 
  if(!x) return; 
  postEvent("command",{cmd:x},function(){}); 
}

document.addEventListener("keydown",function(e){
  var k = (e.key||"").toLowerCase();
  if(m[k]){ 
    send(m[k]); 
    e.preventDefault(); 
  }
});
