import "./patch-execsync.mjs";
import ripgrepNodePath from "./vendor/ripgrep/x64-win32/ripgrep.node";
import { fileURLToPath } from "url";

if (!process.env.RIPGREP_NODE_PATH) {
  if (typeof ripgrepNodePath === "string") {
    process.env.RIPGREP_NODE_PATH = ripgrepNodePath;
  } else {
    process.env.RIPGREP_NODE_PATH = fileURLToPath(
      new URL("./vendor/ripgrep/x64-win32/ripgrep.node", import.meta.url)
    );
  }
}

// Defer loading cli.js so Bun snapshots the patched execSync.
await import("./cli.js");
