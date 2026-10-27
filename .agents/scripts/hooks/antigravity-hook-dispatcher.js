'use strict';
const fs = require('fs');
const path = require('path');

function extractNormalizedInput(rawJson) {
  let payload = {};
  try {
    payload = JSON.parse(rawJson);
  } catch (_) {}

  const toolCall = payload.toolCall || {};
  const args = toolCall.args || payload.toolArgs || payload.args || {};
  const toolName = toolCall.name || payload.toolName || payload.tool || '';

  // Multi-key parameter fallback for file tools across IDE & agy
  const filePath =
    args.AbsolutePath ||
    args.TargetFile ||
    args.Path ||
    args.file_path ||
    args.filePath ||
    args.path ||
    args.file ||
    '';

  // Multi-key parameter fallback for commands
  const command =
    args.CommandLine ||
    args.command ||
    args.cmd ||
    '';

  return {
    raw: payload,
    toolName,
    args,
    filePath,
    command,
    conversationId: payload.conversationId || '',
    workspacePaths: payload.workspacePaths || []
  };
}

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const rawInput = Buffer.concat(chunks).toString('utf8');
  const action = process.argv[2] || 'pre-tool';
  const norm = extractNormalizedInput(rawInput);

  if (action === 'pre-tool') {
    // 1. Config protection: prevent AI from weakening linters/configs
    const protectedFiles = new Set([
      '.eslintrc.js', '.eslintrc.json', 'eslint.config.js',
      '.prettierrc', 'tsconfig.json', '.env', '.env.local',
      '.env.production'
    ]);

    if (norm.filePath) {
      const base = path.basename(norm.filePath).toLowerCase();
      if (base.startsWith('.env') || protectedFiles.has(base)) {
        let exists = false;
        try {
          fs.lstatSync(norm.filePath);
          exists = true;
        } catch (_) {}

        if (base.startsWith('.env') || (exists && protectedFiles.has(base))) {
          process.stdout.write(JSON.stringify({
            decision: 'deny',
            reason: `BLOCKED by ECC Hook: Modifying protected configuration or secret file '${base}' is forbidden. Fix code or use environment variables instead.`
          }));
          return;
        }
      }
    }

    // 2. Command check: block git commit with --no-verify
    if (norm.command && norm.command.includes('--no-verify')) {
      process.stdout.write(JSON.stringify({
        decision: 'deny',
        reason: 'BLOCKED by ECC Hook: Bypassing git verification with --no-verify is prohibited.'
      }));
      return;
    }

    process.stdout.write(JSON.stringify({ decision: 'allow' }));
    return;
  }

  if (action === 'session-start') {
    process.stdout.write(JSON.stringify({
      injectSteps: [{
        systemMessage: {
          systemMessage: '[ECC Universal] Antigravity harness active. Operating system invariants & memory vault online.'
        }
      }]
    }));
    return;
  }

  if (action === 'stop') {
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
    return;
  }

  // Default PostToolUse
  process.stdout.write(JSON.stringify({}));
}

main().catch(err => {
  process.stderr.write(String(err) + '\n');
  process.stdout.write(JSON.stringify({ decision: 'allow' }));
});
