import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { Client } from "ssh2";

const host = process.env.VPS_HOST || "46.173.26.108";
const username = process.env.VPS_SSH_USER || "root";
const keyPath =
  process.env.SSH_KEY_PATH || join(homedir(), ".ssh", "carcas_vps_ed25519");
const cmd = `bash ${process.env.HOUSE_ROOT || "/var/www/house"}/scripts/deploy-vps.sh`;

let privateKey;
try {
  privateKey = readFileSync(keyPath);
} catch {
  console.error(`SSH key not found: ${keyPath}`);
  process.exit(1);
}

const conn = new Client();
conn
  .on("ready", () => {
    console.log(`SSH ${host} → deploy-vps.sh`);
    conn.exec(cmd, { pty: true }, (err, stream) => {
      if (err) {
        console.error(err);
        conn.end();
        process.exit(1);
      }
      stream.on("close", (code) => {
        conn.end();
        process.exit(typeof code === "number" ? code : 0);
      });
      stream.on("data", (d) => process.stdout.write(d));
      stream.stderr.on("data", (d) => process.stderr.write(d));
    });
  })
  .on("error", (e) => {
    console.error(e.message);
    process.exit(1);
  })
  .connect({
    host,
    port: Number(process.env.VPS_SSH_PORT || 22),
    username,
    privateKey,
    readyTimeout: 120000,
  });
