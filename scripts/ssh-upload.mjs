import { readFileSync } from "node:fs";
import { Client } from "ssh2";

const host = process.env.SSH_HOST;
const password = process.env.SSH_PASS_B64
  ? Buffer.from(process.env.SSH_PASS_B64, "base64").toString("utf8")
  : process.env.SSH_PASS;

const files = process.argv.slice(2);
if (!host || !password || files.length === 0) {
  console.error("Usage: SSH_HOST=... SSH_PASS_B64=... node scripts/ssh-upload.mjs local:remote ...");
  process.exit(1);
}

const conn = new Client();
conn
  .on("ready", () => {
    conn.sftp((err, sftp) => {
      if (err) {
        console.error(err);
        conn.end();
        process.exit(1);
      }
      let pending = files.length;
      for (const pair of files) {
        const [local, remote] = pair.split(":");
        sftp.fastPut(local, remote, (putErr) => {
          if (putErr) console.error(`FAIL ${local} -> ${remote}:`, putErr.message);
          else console.log(`OK ${remote}`);
          pending -= 1;
          if (pending === 0) {
            conn.end();
          }
        });
      }
    });
  })
  .on("error", (e) => {
    console.error(e.message);
    process.exit(1);
  })
  .connect({
    host,
    port: 22,
    username: "root",
    password,
    tryKeyboard: true,
    readyTimeout: 120000,
  });

conn.on("keyboard-interactive", (_n, _i, _l, prompts, finish) => {
  finish(prompts.map(() => password));
});
