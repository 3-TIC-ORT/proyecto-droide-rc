import { subscribePOSTEvent, startServer } from "soquetic";
import { SerialPort } from "serialport";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LAST = path.join(__dirname, "last_command.json");
const LOG = path.join(__dirname, "history.log");

let port = null;

function openSerial() {
  if (port && port.isOpen) return;

  const prefer = process.env.COM_PATH || null;

  function tryOpen(p) {
    try {
      port = new SerialPort({ path: p, baudRate: 9600 });
      port.on("open", () => console.log("Serial abierto:", p));
      port.on("error", e => console.log("Error serial:", e.message));
    } catch(e) { console.log("No se pudo abrir:", e.message); }
  }

  if (prefer) { tryOpen(prefer); return; }

  SerialPort.list()
    .then(list => {
      let c = null;
      for (let d of list) {
        const s = ((d.manufacturer||"")+" "+(d.friendlyName||"")+" "+d.path).toLowerCase();
        if (s.includes("arduino") || s.includes("usb") || ["2341","2a03","1a86"].includes((d.vendorId||"").toLowerCase())) { c = d; break; }
      }
      if (!c && list.length) c = list[0];
      if (c) tryOpen(c.path); else console.log("No hay puertos");
    })
    .catch(err => console.log("List error:", err.message));
}

openSerial();

const OK = ["F","B","L","R","S","LED","HORN"];

subscribePOSTEvent("command", data => {
  let cmd = "";
  if (data && (data.cmd || data.action)) cmd = String(data.cmd || data.action);
  cmd = cmd.toUpperCase();
  if (!OK.includes(cmd)) return { ok:false };

  const payload = { command: cmd, at: Date.now() };
  try {
    fs.writeFileSync(LAST, JSON.stringify(payload,null,2));
    fs.appendFileSync(LOG, new Date(payload.at).toISOString()+" "+cmd+"\n");
  } catch {}

  try {
    if (port && port.isOpen) port.write(cmd+"\n"); else openSerial();
  } catch(e) { console.log("write err:", e.message); }

  return { ok:true, sent:cmd };
});

startServer(3000, false);
