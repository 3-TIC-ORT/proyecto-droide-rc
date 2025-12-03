connect2Server(3000);


getEvent("ping", function (data) {
  var statusEl = document.getElementById("status");
  if (statusEl) {
    if (data && data.ok) {
      statusEl.textContent = "Conectado al backend 👍";
    } else {
      statusEl.textContent = "Error de ping";
    }
  }
});


var pressed = {};


var map = {
  w: "F",    
  a: "L",    
  s: "B",    
  d: "R",    
  l: "LED",  
  b: "HORN"  
};

function sendCommand(cmd) {
  postEvent("command", { cmd: cmd }, function () {
  });
}


document.addEventListener("keydown", function (e) {
  var k = (e.key || "").toLowerCase();


  if (pressed[k]) return;
  pressed[k] = true;

  if (map[k]) {
    sendCommand(map[k]);
    e.preventDefault();


    if (k === "w") document.querySelector(".arrow.up").style.background = "#ff4949";
    if (k === "a") document.querySelector(".arrow.left").style.background = "#ff4949";
    if (k === "s") document.querySelector(".arrow.down").style.background = "#ff4949";
    if (k === "d") document.querySelector(".arrow.right").style.background = "#ff4949";
  }
});


document.addEventListener("keyup", function (e) {
  var k = (e.key || "").toLowerCase();
  pressed[k] = false;


  if (["w", "a", "s", "d"].includes(k)) {
    sendCommand("S");
    e.preventDefault();
  }

  
  if (k === "b") {
    sendCommand("S");
    e.preventDefault();
  }

  
  if (k === "w") document.querySelector(".arrow.up").style.background = "#0f0f10";
  if (k === "a") document.querySelector(".arrow.left").style.background = "#0f0f10";
  if (k === "s") document.querySelector(".arrow.down").style.background = "#0f0f10";
  if (k === "d") document.querySelector(".arrow.right").style.background = "#0f0f10";
});


window.addEventListener("beforeunload", function () {
  try {
    sendCommand("S");
    document.querySelector(".arrow.up").style.background = "#0f0f10";
    document.querySelector(".arrow.left").style.background = "#0f0f10";
    document.querySelector(".arrow.down").style.background = "#0f0f10";
    document.querySelector(".arrow.right").style.background = "#0f0f10";
  } catch (e) { }
});
