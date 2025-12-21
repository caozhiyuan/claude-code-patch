import { readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const args = new Set(process.argv.slice(2));
const backup = args.has("--backup");

const pathArg = [...args].find((a) => !a.startsWith("--"));
const cliPath = pathArg ?? join(process.cwd(), "cli.js");

const importRe =
  /import\s*\{\s*execSync(?:\s+as\s+([A-Za-z_$][\w$]*))?\s*\}\s*from\s*["']node:child_process["'];/g;
const alreadyPatchedRe =
  /import\s+cp\$1\s+from\s*["']node:child_process["'];\s*const\s+[A-Za-z_$][\w$]*\s*=\s*\(\.\.\.A\)\s*=>\s*cp\$1\.execSync\(\.\.\.A\);/;

if (!existsSync(cliPath)) {
  throw new Error(`cli.js not found at: ${cliPath}`);
}

const text = readFileSync(cliPath, "utf8");

if (alreadyPatchedRe.test(text)) {
  console.log(`Already patched: ${cliPath}`);
  process.exit(0);
}

const matches = [...text.matchAll(importRe)];
if (matches.length === 0) {
  throw new Error(
    "Patch target not found (execSync import). cli.js may be a different build."
  );
}
if (matches.length > 1) {
  throw new Error(
    `Patch target ambiguous: found ${matches.length} execSync imports.`
  );
}

if (backup) {
  copyFileSync(cliPath, `${cliPath}.bak`);
}

const alias = matches[0][1] || "execSync";
const patched = text.replace(importRe, () => {
  return `import cp$1 from"node:child_process";const ${alias}=(...A)=>cp$1.execSync(...A);`;
});
writeFileSync(cliPath, patched, "utf8");
console.log(`Patched: ${cliPath}`);
