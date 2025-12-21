# Repository Guidelines

## Project Structure & Module Organization
This repo is a Windows-focused packaging/patch layer for Claude Code. Key files:
- `cli.js`: upstream CLI entry (large, generated).
- `cli-entry.mjs`: Bun entry used to build `claude.exe`.
- `patch-cli.mjs`: rewrites `cli.js` to preserve `execSync` behavior in the compiled exe.
- `patch-execsync.mjs`: runtime patch (caches simple `cygpath` calls).
- `vendor/`: bundled native assets (e.g., ripgrep).
- `README.md`: build and usage notes.
No dedicated `src/` or `test/` directories are present.

## Build, Test, and Development Commands
- Build Windows exe (Bun):
  - `node .\patch-cli.mjs --backup`
  - `bun build .\cli-entry.mjs --compile --target=bun-windows-x64 --outfile claude.exe`
- Run unbundled CLI with runtime patch:
  - `setx NODE_OPTIONS "--import file://C:\claude-code-patch\patch-execsync.mjs"`
Testing commands are not defined in this repo.

## Coding Style & Naming Conventions
- Language: ESM JavaScript (`.mjs`).
- Follow existing formatting in each file (e.g., `patch-*.mjs` uses 2-space indentation).
- Keep changes minimal and targeted; avoid touching `cli.js` unless required by patching.
- File naming: `patch-*.mjs` for patch utilities; keep entrypoints explicit (`cli-entry.mjs`).

## Testing Guidelines
No automated test framework is configured. If you add tests, document the runner and how to execute it in `README.md`.

## Commit & Pull Request Guidelines
Recent history uses short, imperative messages and occasionally a `type:` prefix (e.g., `fix:`). Keep commits concise and scoped. PRs should describe:
- What changed and why.
- How to build/verify on Windows (commands or screenshots if UI-related).

## Security & Configuration Tips
- `patch-execsync.mjs` accepts `CLAUDE_CODE_CYGPATH_CACHE_MAX`; set to `0` to disable caching.
- The VS Code Claude Code extension can be pointed at the built `claude.exe` for this repo.
