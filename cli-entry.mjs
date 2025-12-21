import "./patch-execsync.mjs";

import path from "node:path";

// Dynamically prepend the relative vendor\ripgrep\x64-win32 directory to PATH,
try {
	const execBase = process.execPath;
	const ripgrepDir = path.join(execBase, "../", "vendor", "ripgrep", "x64-win32");
	const delim = path.delimiter;
	const cur = process.env.PATH || "";
	if (!cur.split(delim).includes(ripgrepDir)) {
		process.env.PATH = ripgrepDir + delim + cur;
	}
} catch {
	// ignore logging errors
}

process.env.USE_BUILTIN_RIPGREP = "0";

// Defer loading cli.js so Bun snapshots the patched execSync.
await import("./cli.js");
