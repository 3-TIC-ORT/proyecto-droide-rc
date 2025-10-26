import { subscribeGETEvent, subscribePOSTEvent, startServer } from "soquetic";
import { SerialPort } from "serialport";

let port = null;

function abrirPuerto() {
  if (port && port.isOpen) return;

  const prefer = process.env.COM_PATH || null;

  function abrir(p) {
    try {
      port = new SerialPort({ path: p, baudRate: 9600 });
      port.on("open", () => console.log("Serial abierto:", p));
      port.on("error", e => console.log("Serial error:", e.message));
    } catch (e) {
      console.log("No se pudo abrir:", e.message);
    }
  }

  if (prefer) {
    abrir(prefer);
    return;
  }

  SerialPort.list()
    .then(lista => {
      let elegido = null;
      for (let d of lista) {
        const s = ((d.manufacturer||"") + " " + d.path).toLowerCase();
        if (s.includes("arduino") || s.includes("usb")) { elegido = d; break; }
      }
      if (!elegido && lista.length) elegido = lista[0];
      if (elegido) abrir(elegido.path);
      else console.log("No hay Arduino conectado");
    })
    .catch(err => console.log("List error:", err.message));
}

abrirPuerto();

subscribeGETEvent("ping", () => {
  return { ok:true };
});

const OK = ["F","B","L","R","S","LED","HORN"];

subscribePOSTEvent("command", data => {
  const cmd = String((data && data.cmd) || "").toUpperCase();
  if (!OK.includes(cmd)) return { ok:false };

  console.log("CMD:", cmd);

  try {
    if (port && port.isOpen) port.write(cmd + "\n");
    else abrirPuerto();
  } catch(e) {
    console.log("write error:", e.message);
  }

  return { ok:true };
});

startServer(3000, false);
