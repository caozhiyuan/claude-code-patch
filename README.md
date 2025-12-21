# Claude Code (Windows build + patches)

![](https://img.shields.io/badge/Node.js-18%2B-brightgreen?style=flat-square) [![npm]](https://www.npmjs.com/package/@anthropic-ai/claude-code)

[npm]: https://img.shields.io/npm/v/@anthropic-ai/claude-code.svg?style=flat-square

This repo focuses on **Windows packaging and runtime patches** for Claude Code.

Upstream Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows -- all through natural language commands. Use it in your terminal, IDE, or tag @claude on Github.

**Learn more in the [official documentation](https://code.claude.com/docs/en/overview)**.

## Project highlights (this repo)

- With npm-installed Claude Code, you can `setx NODE_OPTIONS ...` to load `patch-execsync.mjs` at runtime.
- For the VS Code Claude Code extension, point its exe config to this repo’s built `claude.exe`.

## Local fork notes (this repo)

This repo adds a small Windows-focused build/patch layer on top of upstream Claude Code.

- `cli-entry.mjs` loads `patch-execsync.mjs`, prepends `vendor/ripgrep/x64-win32` to `PATH`, sets `USE_BUILTIN_RIPGREP=0`, then imports `cli.js` so Bun snapshots the patched runtime.
- `patch-cli.mjs` rewrites the `execSync` import in `cli.js` (optional `--backup`) so the Bun-compiled exe keeps the patched behavior.
- `patch-execsync.mjs` caches simple `cygpath -u` / `cygpath -w` calls; tune with `CLAUDE_CODE_CYGPATH_CACHE_MAX` (set `0` to disable).
- `claude.exe` is the Bun-compiled Windows x64 executable output.

## Build notes (local)

These steps are for Windows x64. Run from the repo root with Bun and Node.js 18+ installed.

### Windows exe build (Bun)

IMPORTANT: Run `patch-cli.mjs` **before** bundling with Bun, otherwise the execSync patch may not take effect in the compiled exe.

```powershell
node .\patch-cli.mjs --backup
```

Build a single-file Windows executable (x64) that includes the ripgrep native module and the execSync patch:

```powershell
bun build .\cli-entry.mjs --compile --target=bun-windows-x64 --outfile claude.exe
```

### NODE_OPTIONS (patch)

If you run the npm-installed CLI (or the unbundled `cli.js`) and want the execSync patch to apply, set:

```powershell
setx NODE_OPTIONS "--import file://C:\claude-code-patch\patch-execsync.mjs"
```
