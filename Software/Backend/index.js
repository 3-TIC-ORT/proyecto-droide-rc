import { subscribePOSTEvent, startServer } from "soquetic";
import { SerialPort } from "serialport";
import fs from "fs";

let port = null;

function conectarPuerto() {
  if (port && port.isOpen) return;
  const preferido = process.env.COM_PATH || null;

  function abrir(p) {
    try {
      port = new SerialPort({ path: p, baudRate: 9600 });
      port.on("open", () => console.log("Puerto abierto:", p));
      port.on("error", e => console.log("Error:", e.message));
    } catch (e) {
      console.log("No se pudo abrir el puerto:", e.message);
    }
  }

  if (preferido) {
    abrir(preferido);
    return;
  }

  SerialPort.list()
    .then(lista => {
      let elegido = lista.find(d =>
        /arduino|usb|wch/i.test((d.manufacturer || "") + d.path)
      );
      if (!elegido && lista.length) elegido = lista[0];
      if (elegido) abrir(elegido.path);
      else console.log("No se encontró Arduino.");
    })
    .catch(err => console.log("Error listando:", err.message));
}

conectarPuerto();

subscribePOSTEvent("command", data => {
  const cmd = (data.cmd || "").toUpperCase();
  const validos = ["F", "B", "L", "R", "S", "LED", "HORN"];
  if (!validos.includes(cmd)) return { ok: false };

  try {
    fs.writeFileSync("last_command.json", JSON.stringify({ cmd }, null, 2));
    fs.appendFileSync("history.log", cmd + "\n");
    if (port && port.isOpen) port.write(cmd + "\n");
    else conectarPuerto();
  } catch (e) {
    console.log("Error:", e.message);
  }

  return { ok: true, sent: cmd };
});

startServer(3000, false);
