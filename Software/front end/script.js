// ===== UI: DOM + eventos + funciones =====
const $estado = document.getElementById("estado");
const $btnConnect = document.getElementById("btn-connect");

// Mapa de teclas válidas
const keyMap = {
  w: "F", a: "L", s: "B", d: "R",
  x: "S", l: "LED", b: "HORN"
};

// --- WEB SERIAL ---
let port = null;
let writer = null;

async function conectarArduino() {
  if (!("serial" in navigator)) {
    setEstado("Tu navegador no soporta Web Serial (usa Chrome/Edge, https o localhost)");
    return;
  }
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    writer = port.writable.getWriter();
    setEstado("Arduino conectado ✔");
    $btnConnect.textContent = "Conectado";
    $btnConnect.disabled = true;
  } catch (e) {
    setEstado("Conexión cancelada o falló");
  }
}

async function enviarAccion(action) {
  if (!action) return;
  setEstado("Enviando: " + action);
  const line = action + "\n";
  const data = new TextEncoder().encode(line);
  if (writer) {
    try {
      await writer.write(data);
      setEstado("Enviado: " + action);
    } catch {
      setEstado("Error escribiendo al puerto");
    }
  } else {
    console.log("[SIMULADO]", action);
    setEstado("SIM: " + action);
  }
}

function setEstado(t){ $estado.textContent = "Estado: " + t }

// SOLO el botón conectar responde al mouse
$btnConnect.addEventListener("click", conectarArduino);

// Teclado para controlar todo
document.addEventListener("keydown", e => {
  const key = (e.key || "").toLowerCase();
  const action = keyMap[key];
  if (action) {
    enviarAccion(action);
    e.preventDefault();
  }
});
