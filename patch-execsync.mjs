// setx NODE_OPTIONS "--import file://C:\claude-code-patch\patch-execsync.mjs"

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const cp = require('node:child_process');

const orig = cp.execSync;
const uCache = new Map();
const wCache = new Map();
const MAX = Number(process.env.CLAUDE_CODE_CYGPATH_CACHE_MAX) || 1024;

const cacheSet = (m, k, v) => {
  m.set(k, v);
  if (m.size > MAX) {
    const o = m.keys().next().value;
    if (o !== undefined) m.delete(o);
  }
  return v;
};

const isSimpleCygpathCmd = (cmd, flag) => {
  const prefix = `cygpath -${flag} `;
  if (!cmd.startsWith(prefix)) return false;
  let inSingle = false;
  let inDouble = false;
  let escape = false;
  for (let i = prefix.length; i < cmd.length; i += 1) {
    const ch = cmd[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (!inSingle && ch === '\\') {
      escape = true;
      continue;
    }
    if (!inDouble && ch === "'") {
      inSingle = !inSingle;
      continue;
    }
    if (!inSingle && ch === '"') {
      inDouble = !inDouble;
      continue;
    }
    if (!inSingle && !inDouble) {
      if (ch === '&' || ch === '|' || ch === ';' || ch === '<' || ch === '>' || ch === '\n') {
        return false;
      }
    }
  }
  return true;
};

cp.execSync = (cmd, opts) => {
  if (typeof cmd === 'string' && MAX > 0) {
    if (isSimpleCygpathCmd(cmd, 'u')) {
      const v = uCache.get(cmd);
      if (v !== undefined) return v;
      return cacheSet(uCache, cmd, orig(cmd, opts));
    }
    if (isSimpleCygpathCmd(cmd, 'w')) {
      const v = wCache.get(cmd);
      if (v !== undefined) return v;
      return cacheSet(wCache, cmd, orig(cmd, opts));
    }
  }
  return orig(cmd, opts);
};
