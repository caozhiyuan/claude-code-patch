# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is a **Windows-focused packaging/patch layer** on top of upstream Claude Code.

- `cli.js` is the upstream-distributed CLI entry (large/generated; avoid hand-editing).
- This repo adds a Bun entrypoint and small patches to make the Windows experience reliable (notably `execSync` + `cygpath` and ripgrep pathing).

Primary references:
- `README.md:20` (repo purpose + build notes)
- `AGENTS.md:3` (repo-specific guidelines)

## Key architecture (big picture)

### Entrypoints

- **Node entrypoint (upstream):** `cli.js`
  - Exposed via `package.json` bin mapping (`"claude": "cli.js"`).

- **Bun snapshot entrypoint (this repo):** `cli-entry.mjs`
  - Imports the runtime patch, adjusts the environment, then `await import("./cli.js")` so Bun snapshots the patched behavior.
  - See `cli-entry.mjs:1-22`.

### Patch flow

- **Runtime patch:** `patch-execsync.mjs`
  - Monkey-patches `child_process.execSync` to cache simple `cygpath -u` / `cygpath -w` calls.
  - Controlled by `CLAUDE_CODE_CYGPATH_CACHE_MAX` (`0` disables caching).
  - See `patch-execsync.mjs:1-69`.

- **Bundling guard patch:** `patch-cli.mjs`
  - Rewrites the `execSync` import in `cli.js` so that the Bun-compiled executable keeps using the patched `execSync` at runtime.
  - Optional `--backup` creates `cli.js.bak`.
  - See `patch-cli.mjs:4-48`.

### Ripgrep on Windows

- Vendor ripgrep lives in `vendor/ripgrep/x64-win32` (`rg.exe`, `ripgrep.node`).
- `cli-entry.mjs` prepends that directory to `PATH` and sets `USE_BUILTIN_RIPGREP=0`.
  - See `cli-entry.mjs:5-19`.

## Common commands

> Notes:
> - This repo does **not** define lint/test runners.
> - Commands below are pulled from `README.md:27` and `AGENTS.md:13`.

### Build `claude.exe` (Windows x64, Bun)

1) Patch `cli.js` (recommended with backup):

```powershell
node .\patch-cli.mjs --backup
```

2) Build the single-file Windows executable:

```powershell
bun build .\cli-entry.mjs --compile --target=bun-windows-x64 --outfile claude.exe
```

### Run unbundled Node CLI with the runtime patch

If you run the npm-installed CLI or `cli.js` directly and want the `execSync` patch applied via Node:

```powershell
setx NODE_OPTIONS "--import file://C:\claude-code-patch\patch-execsync.mjs"
```

(You’ll need to start a new shell for updated `NODE_OPTIONS` to apply.)

### Tests / lint

- No test or lint commands are configured in this repo (`AGENTS.md:19`).

## Repo-specific conventions / gotchas

- Keep changes **minimal and targeted**; prefer editing `patch-*.mjs` and `cli-entry.mjs` rather than `cli.js` (`AGENTS.md:24`).
- If you must touch `cli.js`, do so mechanically (it is treated as generated) and prefer using `patch-cli.mjs` to apply required rewrites.
- `patch-cli.mjs` accepts an optional positional path to `cli.js` (defaults to `./cli.js`). See `patch-cli.mjs:7-9`.

## Tunables

- `CLAUDE_CODE_CYGPATH_CACHE_MAX`
  - Max cache entries for `cygpath` conversions; set `0` to disable caching.
  - See `patch-execsync.mjs:9-12`.

- `USE_BUILTIN_RIPGREP`
  - Set to `"0"` by `cli-entry.mjs` to prefer vendored ripgrep on Windows.
  - See `cli-entry.mjs:18`.
