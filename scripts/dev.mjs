/**
 * Dev server launcher.
 *
 * `next dev` only retries when a port is busy (EADDRINUSE). On Windows, Docker
 * Desktop / WSL reserves blocks of ports, and binding one of those fails with
 * EACCES instead — Next.js gives up and exits rather than trying another port.
 *
 * This wrapper finds a port we can actually bind before handing off to Next.
 *
 *   npm run dev              # uses 3000 if free, otherwise the next free port
 *   PORT=4000 npm run dev   # prefer a specific port
 */
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const preferred = Number(process.env.PORT) || 3000;
// Windows can reserve large contiguous blocks (e.g. 2918-3117), so a short
// window is not enough — scan a wide range and test candidates concurrently.
const SCAN_RANGE = 1200;
const BATCH_SIZE = 64;

/** Resolve to true if the port can be bound on 0.0.0.0. */
function canBind(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port, "0.0.0.0");
  });
}

async function findPort(start) {
  for (let offset = 0; offset < SCAN_RANGE; offset += BATCH_SIZE) {
    const candidates = [];
    for (let i = offset; i < Math.min(offset + BATCH_SIZE, SCAN_RANGE); i++) {
      candidates.push(start + i);
    }
    const results = await Promise.all(candidates.map((p) => canBind(p)));
    const hit = candidates[results.indexOf(true)];
    if (hit !== undefined) return hit;
  }
  return null;
}

const port = await findPort(preferred);
if (port === null) {
  console.error(`Could not find a free port in ${preferred}..${preferred + SCAN_RANGE - 1}.`);
  process.exit(1);
}
if (port !== preferred) {
  console.log(`Port ${preferred} is unavailable (reserved by Docker/WSL or in use) — using ${port}.`);
}

const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, "dev", "-p", String(port)], {
  stdio: "inherit",
  cwd: projectRoot,
});

child.on("exit", (code) => process.exit(code ?? 0));
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => child.kill(sig));
}
