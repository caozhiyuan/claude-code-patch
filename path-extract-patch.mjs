#!/usr/bin/env node
/**
 * Patch for Claude Code CLI - Fix extractFilePaths token consumption
 *
 * Usage:
 *   node path-extract-patch.mjs           # Apply patch
 *   node path-extract-patch.mjs --revert  # Revert patch
 *   node path-extract-patch.mjs --check   # Check status
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const fs = require('node:fs');
const path = require('node:path');

const CLI_FILE = path.join(process.cwd(), 'cli.js');
const BACKUP_FILE = path.join(process.cwd(), 'cli.js.backup');
const MAX_OUTPUT = 30000;

const ORIGINAL = /userPrompt:`Command: \$\{A\}\s*\n\s*Output: \$\{Q\}`/;
const PATCHED = `userPrompt:\`Command: \${A}
Output: \${Q.length > ${MAX_OUTPUT} ? Q.slice(0, ${MAX_OUTPUT}) + "\\n[SUBAGENT_PATH_EXTRACT_TRUNCATED]" : Q}\``;
const MARKER = 'SUBAGENT_PATH_EXTRACT_TRUNCATED';

function read() {
    if (!fs.existsSync(CLI_FILE)) {
        console.error('Error: cli.js not found');
        process.exit(1);
    }
    return fs.readFileSync(CLI_FILE, 'utf-8');
}

function apply() {
    const content = read();
    if (content.includes(MARKER)) {
        console.log('Already patched');
        return;
    }
    if (!ORIGINAL.test(content)) {
        console.error('Error: pattern not found');
        process.exit(1);
    }
    fs.writeFileSync(BACKUP_FILE, content);
    fs.writeFileSync(CLI_FILE, content.replace(ORIGINAL, PATCHED));
    console.log('Patch applied');
}

function revert() {
    if (!fs.existsSync(BACKUP_FILE)) {
        console.error('Error: backup not found');
        process.exit(1);
    }
    fs.writeFileSync(CLI_FILE, fs.readFileSync(BACKUP_FILE));
    fs.unlinkSync(BACKUP_FILE);
    console.log('Patch reverted');
}

function check() {
    const patched = read().includes(MARKER);
    console.log(`Status: ${patched ? 'patched' : 'not patched'}`);
}

const cmd = process.argv[2];
if (cmd === '--revert' || cmd === '-r') revert();
else if (cmd === '--check' || cmd === '-c') check();
else apply();
