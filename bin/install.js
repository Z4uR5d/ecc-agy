#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const packageRoot = path.resolve(__dirname, '..');
const targetRoot = process.cwd();

console.log(`\n🚀 Installing ECC-AGY into ${targetRoot}...\n`);

function copyRecursive(src, dst) {
  if (!fs.existsSync(src)) return;
  const stat = fs.lstatSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dst, item));
    }
  } else {
    fs.copyFileSync(src, dst);
  }
}

// 1. Copy .agents directory
console.log('📦 Installing .agents (68 subagents, 387 skills, native hooks, MCP memory)...');
copyRecursive(path.join(packageRoot, '.agents'), path.join(targetRoot, '.agents'));

// 2. Copy AGENTS.md & GEMINI.md
console.log('📋 Installing AGENTS.md & GEMINI.md (Tier 1 core invariants & 4 Argon / Flash routing)...');
if (fs.existsSync(path.join(packageRoot, 'AGENTS.md'))) {
  fs.copyFileSync(path.join(packageRoot, 'AGENTS.md'), path.join(targetRoot, 'AGENTS.md'));
}
if (fs.existsSync(path.join(packageRoot, 'GEMINI.md'))) {
  fs.copyFileSync(path.join(packageRoot, 'GEMINI.md'), path.join(targetRoot, 'GEMINI.md'));
}

console.log('\n✅ ECC-AGY successfully installed into your project!\n');
console.log('Next steps:');
console.log('  - Start Antigravity IDE or run: agy');
console.log('  - 68 specialized agents are ready (e.g. /review-pr, /plan, /model-route)');
console.log('  - Primary model: Gemini 4 Argon with Gemini 3.8 Flash fallback\n');
