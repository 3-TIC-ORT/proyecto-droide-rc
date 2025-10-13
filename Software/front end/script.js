let puerto = null;
let escritor = null;

const alerta = document.getElementById("alerta");
const botones = {
  w: document.getElementById("btn-up"),
  a: document.getElementById("btn-left"),
  s: document.getElementById("btn-down"),
  d: document.getElementById("btn-right"),
  o: document.getElementById("btn-luces"),
  p: document.getElementById("btn-bocina")
};

function mostrarAlerta(msg) {
  alerta.innerText = msg;
  alerta.style.display = "block";
}

function ocultarAlerta() {
  alerta.style.display = "none";
}

async function enviarSerial(texto) {
  if (escritor) {
    const data = new TextEncoder().encode(texto + "\n");
    await escritor.write(data);
  }
}

function activarBoton(tecla, mensaje, comando) {
  const btn = botones[tecla];
  if (!btn.classList.contains("active")) {
    btn.classList.add("active");
    mostrarAlerta(mensaje);
    enviarSerial(comando);
  }
}

function desactivarBoton(tecla) {
  const btn = botones[tecla];
  if (btn.classList.contains("active")) {
    btn.classList.remove("active");
    ocultarAlerta();
    enviarSerial("x"); // detener
  }
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
      activarBoton("w", "MSE6 adelante", "w");
      break;
    case "a":
      activarBoton("a", "MSE6 izquierda", "a");
      break;
    case "s":
      activarBoton("s", "MSE6 atrás", "s");
      break;
    case "d":
      activarBoton("d", "MSE6 derecha", "d");
      break;
    case "o":
      activarBoton("o", "MSE6 secuencia de luces activada", "l");
      break;
    case "p":
      activarBoton("p", "MSE6 bocina activada", "b");
      break;
  }
});

document.addEventListener("keyup", (e) => {
  if (["w", "a", "s", "d", "o", "p"].includes(e.key)) {
    desactivarBoton(e.key);
  }
});

document.getElementById("conectar").addEventListener("click", async () => {
  try {
    puerto = await navigator.serial.requestPort();
    await puerto.open({ baudRate: 9600 });
    escritor = puerto.writable.getWriter();
    alert("✅ Arduino conectado");
  } catch (error) {
    alert("❌ Error al conectar con Arduino");
  }
});
