import { subscribeGETEvent, subscribePOSTEvent, startServer } from "soquetic";
import { SerialPort } from "serialport";

let port = null;

function abrirPuerto() {
  let ruta = process.env.COM_PATH;

  if (ruta) {
    try {
      console.log("Intentando abrir puerto (env):", ruta);
      port = new SerialPort({ path: ruta, baudRate: 9600 });
      return;
    } catch (e) {
      console.log("Error abriendo puerto desde COM_PATH:", e.message);
    }
  }

  SerialPort.list().then(lista => {
    console.log("Puertos encontrados:", lista);
    if (lista.length > 0) {
      try {
        const path = lista[0].path;
        console.log("Abriendo puerto:", path);
        port = new SerialPort({ path: path, baudRate: 9600 });
      } catch (e) {
        console.log("Error abriendo puerto automático:", e.message);
      }
    } else {
      console.log("No se encontraron puertos serie.");
    }
  }).catch(err => {
    console.log("Error listando puertos:", err.message);
  });
}

abrirPuerto();

subscribeGETEvent("ping", () => ({ ok: true }));

const OK = ["F", "B", "L", "R", "S", "LED", "HORN"];

subscribePOSTEvent("command", (data) => {
  const cmd = String((data && data.cmd) || "").toUpperCase();

  if (!OK.includes(cmd)) {
    console.log("Comando inválido:", cmd);
    return { ok: false };
  }

  console.log("CMD:", cmd);

  try {
    if (port && port.isOpen) {
      port.write(cmd + "\n");
    } else {
      console.log("Puerto no abierto, reintentando...");
      abrirPuerto();
    }
  } catch (e) {
    console.log("Error escribiendo al puerto:", e.message);
  }

  return { ok: true };
});

startServer(3000, false); 
console.log("Backend SoqueTIC escuchando en puerto 3000");
