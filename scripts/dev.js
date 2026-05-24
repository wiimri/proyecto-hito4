const { spawn } = require("child_process");
const path = require("path");

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const processes = [
  {
    name: "backend",
    command: `${npmCommand} run dev`,
    cwd: path.join(process.cwd(), "backend"),
  },
  {
    name: "client",
    command: `${npmCommand} run dev`,
    cwd: path.join(process.cwd(), "client"),
  },
];

const children = processes.map(({ name, command, cwd }) => {
  const child = spawn(command, {
    cwd,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] termino con codigo ${code}`);
    }
  });

  return child;
});

function stopChildren() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

process.on("SIGINT", () => {
  stopChildren();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopChildren();
  process.exit(0);
});
