import { Client } from "ssh2";

const host = process.env.SSH_HOST;
const password =
  process.env.SSH_PASS ||
  (process.env.SSH_PASS_B64
    ? Buffer.from(process.env.SSH_PASS_B64, "base64").toString("utf8")
    : "");
const command = process.argv.slice(2).join(" ");

if (!host || !password || !command) {
  console.error("Usage: SSH_HOST=... SSH_PASS=... node scripts/ssh-exec.mjs '<command>'");
  process.exit(1);
}

const conn = new Client();
conn
  .on("ready", () => {
    conn.exec(command, { pty: true }, (err, stream) => {
      if (err) {
        console.error(err);
        conn.end();
        process.exit(1);
      }
      let code = 0;
      stream.on("close", (c) => {
        conn.end();
        process.exit(typeof c === "number" ? c : code);
      });
      stream.on("data", (d) => process.stdout.write(d));
      stream.stderr.on("data", (d) => process.stderr.write(d));
      stream.on("exit", (c) => {
        code = typeof c === "number" ? c : 0;
      });
    });
  })
  .on("error", (e) => {
    console.error(e.message);
    process.exit(1);
  })
  .on("keyboard-interactive", (_name, _instructions, _lang, prompts, finish) => {
    finish(prompts.map(() => password));
  })
  .connect({
    host,
    port: Number(process.env.SSH_PORT || 22),
    username: process.env.SSH_USER || "root",
    password,
    readyTimeout: 120000,
    tryKeyboard: true,
  });
