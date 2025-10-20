import { subscribePOSTEvent, startServer } from "soquetic";
import { SerialPort } from "serialport";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const LAST = path.join(__dirname, "last_command.json");
const LOG  = path.join(__dirname, "history.log");

let port = null;

async function openSerial() {
  if (port && port.isOpen) return port;
  const prefer = process.env.COM_PATH || null;
  if (prefer) {
    port = new SerialPort({ path: prefer, baudRate: 9600 });
    return new Promise(ok => port.on("open", () => ok(port)));
  }
  const list = await SerialPort.list();
  const cand = list.find(d =>
    /arduino|wch|usb/i.test(`${d.manufacturer} ${d.friendlyName} ${d.path}`) ||
    ["2341","2a03","1a86"].includes((d.vendorId||"").toLowerCase())
  ) || list[0];
  if (!cand) return null;
  port = new SerialPort({ path: cand.path, baudRate: 9600 });
  return new Promise(ok => port.on("open", () => ok(port)));
}

const VALID = ["F","B","L","R","S","LED","HORN"];

subscribePOSTEvent("command", async (data) => {
  const cmd = String((data && (data.cmd || data.action)) || "").toUpperCase();
  if (!VALID.includes(cmd)) return { ok:false };
  const payload = { command: cmd, at: Date.now() };
  try {
    fs.writeFileSync(LAST, JSON.stringify(payload, null, 2));
    fs.appendFileSync(LOG, `${new Date(payload.at).toISOString()} ${cmd}\n`);
  } catch {}
  try {
    const p = await openSerial();
    if (p && p.isOpen) p.write(cmd + "\n");
    return { ok:true, sent:cmd };
  } catch {
    return { ok:false };
  }
});

startServer(3000, false);
