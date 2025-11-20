// Conectar con el backend SoqueTIC
connect2Server(3000);

// Simple ping para verificar conexión
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

// Evitar flood de teclas
var pressed = {};

// Mapeo de teclas a comandos
// OJO: X YA NO ESTÁ, NO MANDA STOP
var map = {
  w: "F",    // forward
  a: "L",    // left
  s: "B",    // back
  d: "R",    // right
  l: "LED",  // luces
  b: "HORN"  // bocina
  // x: "S"   // <- ESTO LO SACAMOS
};

function sendCommand(cmd) {
  postEvent("command", { cmd: cmd }, function () {
    // callback vacío, no necesitamos respuesta por ahora
  });
}

// ==== KEYDOWN ====
document.addEventListener("keydown", function (e) {
  var k = (e.key || "").toLowerCase();

  // Si ya estaba presionada, no volver a mandar
  if (pressed[k]) return;
  pressed[k] = true;

  if (map[k]) {
    sendCommand(map[k]);
    e.preventDefault();

    // Cambiar color de la flecha correspondiente
    if (k === "w") document.querySelector(".arrow.up").style.background = "#ff4949";
    if (k === "a") document.querySelector(".arrow.left").style.background = "#ff4949";
    if (k === "s") document.querySelector(".arrow.down").style.background = "#ff4949";
    if (k === "d") document.querySelector(".arrow.right").style.background = "#ff4949";
  }
});

// ==== KEYUP ====
document.addEventListener("keyup", function (e) {
  var k = (e.key || "").toLowerCase();
  pressed[k] = false;

  // Cuando soltamos movimiento (WASD) → STOP
  if (["w", "a", "s", "d"].includes(k)) {
    sendCommand("S");
    e.preventDefault();
  }

  // Cuando soltamos B (bocina) → STOP (apaga buzzer en Arduino)
  if (k === "b") {
    sendCommand("S");
    e.preventDefault();
  }

  // Volver flechas al color original
  if (k === "w") document.querySelector(".arrow.up").style.background = "#0f0f10";
  if (k === "a") document.querySelector(".arrow.left").style.background = "#0f0f10";
  if (k === "s") document.querySelector(".arrow.down").style.background = "#0f0f10";
  if (k === "d") document.querySelector(".arrow.right").style.background = "#0f0f10";
});

// ==== Antes de cerrar la pestaña, mandar STOP por las dudas ====
window.addEventListener("beforeunload", function () {
  try {
    sendCommand("S");
    document.querySelector(".arrow.up").style.background = "#0f0f10";
    document.querySelector(".arrow.left").style.background = "#0f0f10";
    document.querySelector(".arrow.down").style.background = "#0f0f10";
    document.querySelector(".arrow.right").style.background = "#0f0f10";
  } catch (e) { }
});
