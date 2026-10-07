// Fails if any source file has more than 300 lines. Usage: node scripts/check-lines.mjs
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const MAX = 300;
const skip = new Set(["node_modules", "dist", ".git"]);
let bad = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx|mjs)$/.test(name)) {
      const n = readFileSync(p, "utf8").split("\n").length;
      if (n > MAX) { console.log(`${p}: ${n} lines (max ${MAX})`); bad++; }
    }
  }
}
for (const d of ["server", "client/src", "shared", "scripts"]) walk(d);
console.log(bad ? `${bad} file(s) too long` : `All files are within ${MAX} lines`);
process.exit(bad ? 1 : 0);
