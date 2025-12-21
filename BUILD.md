# Build Notes

## Windows exe build (Bun)

IMPORTANT: Run `patch-cli.mjs` **before** bundling with Bun, otherwise the execSync patch may not take effect in the compiled exe.

```powershell
node .\patch-cli.mjs --backup
```

Build a single-file Windows executable (x64) that includes the ripgrep native module and the execSync patch:

```powershell
bun build .\cli-entry.mjs --compile --target=bun-windows-x64 --outfile claude.exe
```

## NODE_OPTIONS (patch)

If you run the unbundled `cli.js` directly and want the execSync patch to apply, set:

```powershell
setx NODE_OPTIONS "--import file://C:\claude-code-patch\patch-execsync.mjs"
````
