'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SOURCE_DIR = path.resolve('C:/Temp/bunx-3948668521-ecc-universal@latest/node_modules/ecc-universal');
const DEST_DIR = path.resolve('x:/agents/ecc/draft');
const AGENTS_ROOT = path.join(DEST_DIR, '.agents');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function computeSha256(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

// 1. Tool and Model mappings for Antigravity & agy
const TOOL_MAP = {
  Read: 'read_file',
  Write: 'write_file',
  Edit: 'edit_file',
  MultiEdit: 'edit_file',
  view_file: 'read_file',
  write_to_file: 'write_file',
  replace_file_content: 'edit_file',
  Bash: 'run_command',
  PowerShell: 'run_command',
  run_command: 'run_command',
  Grep: 'grep_search',
  grep_search: 'grep_search',
  Glob: 'find_by_name',
  find_by_name: 'find_by_name',
  WebSearch: 'search_web',
  search_web: 'search_web',
  WebFetch: 'read_url_content',
  read_url_content: 'read_url_content',
  Task: 'invoke_subagent',
  Agent: 'invoke_subagent',
  invoke_subagent: 'invoke_subagent',
  send_message: 'send_message',
  schedule: 'schedule',
  manage_task: 'manage_task',
  TodoWrite: 'manage_task',
};

const MODEL_TIERS = {
  opus: {
    model: 'gemini-4-argon-high',
    effort: 'high',
    fallback_model: 'gemini-3.8-flash-high',
  },
  sonnet: {
    model: 'gemini-4-argon-medium',
    effort: 'medium',
    fallback_model: 'gemini-3.8-flash-medium',
  },
  haiku: {
    model: 'gemini-4-argon-low',
    effort: 'low',
    fallback_model: 'gemini-3.8-flash-low',
  },
  pro: {
    model: 'gemini-4-argon-high',
    effort: 'high',
    fallback_model: 'gemini-3.8-flash-high',
  },
  flash: {
    model: 'gemini-4-argon-low',
    effort: 'low',
    fallback_model: 'gemini-3.8-flash-low',
  },
  inherit: {
    model: 'inherit',
    effort: 'medium',
    fallback_model: 'gemini-3.8-flash-medium',
  },
};

function adaptAgentFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return source;

  const rawYaml = match[1];
  const body = match[2];
  const lines = rawYaml.split(/\r?\n/);
  let name = '';
  let description = '';
  let rawModel = 'sonnet';
  let tools = new Set(['read_file', 'write_file', 'edit_file', 'run_command']);
  let inTools = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('name:')) {
      name = trimmed.replace('name:', '').trim();
      inTools = false;
    } else if (trimmed.startsWith('description:')) {
      description = trimmed.replace('description:', '').trim();
      inTools = false;
    } else if (trimmed.startsWith('model:')) {
      rawModel = trimmed.replace('model:', '').trim().toLowerCase();
      inTools = false;
    } else if (trimmed.startsWith('tools:')) {
      inTools = true;
      const inlineTools = trimmed.replace('tools:', '').trim();
      if (inlineTools && inlineTools !== '[]') {
        inlineTools.replace(/[\[\]]/g, '').split(',').forEach(t => {
          const mapped = TOOL_MAP[t.trim()];
          if (mapped) tools.add(mapped);
        });
      }
    } else if (inTools && trimmed.startsWith('-')) {
      const rawTool = trimmed.replace('-', '').trim();
      const mapped = TOOL_MAP[rawTool];
      if (mapped) tools.add(mapped);
      // If agent references subagent calling
      if (rawTool.toLowerCase().includes('agent') || rawTool.toLowerCase().includes('task')) {
        tools.add('invoke_subagent');
        tools.add('send_message');
      }
    } else if (!trimmed.startsWith('-') && inTools) {
      inTools = false;
    }
  }

  const tier = MODEL_TIERS[rawModel] || MODEL_TIERS.sonnet;

  // Ensure every agent has essential safe capabilities
  if (name.includes('reviewer') || name.includes('analyzer') || name.includes('explorer') || name.includes('scout')) {
    tools.add('read_file');
    tools.add('grep_search');
    tools.add('find_by_name');
  }

  const toolList = Array.from(tools).map(t => `  - ${t}`).join('\n');
  return `---
name: ${name || 'agent'}
description: ${description || 'Antigravity specialized agent persona'}
model: ${tier.model}
effort: ${tier.effort}
fallback_model: ${tier.fallback_model}
tools:
${toolList}
---
${body}`;
}

// 2. Command to Skill conversion
function convertCommandToSkill(cmdContent, cmdName) {
  let description = `ECC command workflow for /${cmdName}`;
  let body = cmdContent;

  const match = cmdContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (match) {
    const rawYaml = match[1];
    body = match[2];
    for (const line of rawYaml.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed.startsWith('description:')) {
        description = trimmed.replace('description:', '').trim();
        // Remove enclosing quotes if any
        if ((description.startsWith('"') && description.endsWith('"')) || (description.startsWith("'") && description.endsWith("'"))) {
          description = description.slice(1, -1);
        }
      }
    }
  }

  // Sanitize description for YAML
  const safeDesc = description.replace(/"/g, '\\"');

  return `---
name: ${cmdName}
description: "${safeDesc}. Use when user invokes /${cmdName} or requests this procedure."
---

# /${cmdName}

${body.trim()}
`;
}

async function run() {
  console.log(`Starting Antigravity ECC adaptation...`);
  console.log(`Source: ${SOURCE_DIR}`);
  console.log(`Target: ${DEST_DIR}`);

  ensureDir(DEST_DIR);
  ensureDir(AGENTS_ROOT);
  ensureDir(path.join(AGENTS_ROOT, 'agents'));
  ensureDir(path.join(AGENTS_ROOT, 'skills'));
  ensureDir(path.join(AGENTS_ROOT, 'rules'));
  ensureDir(path.join(AGENTS_ROOT, 'hooks'));
  ensureDir(path.join(AGENTS_ROOT, 'scripts'));
  ensureDir(path.join(AGENTS_ROOT, 'scripts/hooks'));
  ensureDir(path.join(DEST_DIR, '.gemini'));

  const operations = [];

  // A. Agents adaptation
  const agentsSourceDir = path.join(SOURCE_DIR, 'agents');
  if (fs.existsSync(agentsSourceDir)) {
    const agentFiles = fs.readdirSync(agentsSourceDir).filter(f => f.endsWith('.md'));
    console.log(`Processing ${agentFiles.length} agents...`);
    for (const f of agentFiles) {
      const srcPath = path.join(agentsSourceDir, f);
      const destPath = path.join(AGENTS_ROOT, 'agents', f);
      const raw = fs.readFileSync(srcPath, 'utf8');
      const adapted = adaptAgentFrontmatter(raw);
      fs.writeFileSync(destPath, adapted, 'utf8');
      operations.push({ kind: 'agent', name: f, sha256: computeSha256(adapted) });
    }
  }

  // B. Commands -> Modern Skills
  const commandsSourceDir = path.join(SOURCE_DIR, 'commands');
  if (fs.existsSync(commandsSourceDir)) {
    const cmdFiles = fs.readdirSync(commandsSourceDir).filter(f => f.endsWith('.md'));
    console.log(`Converting ${cmdFiles.length} commands to modern Antigravity skills...`);
    for (const f of cmdFiles) {
      const cmdName = f.replace('.md', '');
      const skillDir = path.join(AGENTS_ROOT, 'skills', cmdName);
      ensureDir(skillDir);
      const destSkillPath = path.join(skillDir, 'SKILL.md');
      const raw = fs.readFileSync(path.join(commandsSourceDir, f), 'utf8');
      const skillContent = convertCommandToSkill(raw, cmdName);
      fs.writeFileSync(destSkillPath, skillContent, 'utf8');
      operations.push({ kind: 'command-skill', name: cmdName, sha256: computeSha256(skillContent) });
    }
  }

  // C. Core Skills
  const skillsSourceDir = path.join(SOURCE_DIR, 'skills');
  if (fs.existsSync(skillsSourceDir)) {
    const skillFolders = fs.readdirSync(skillsSourceDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    console.log(`Copying ${skillFolders.length} core skills...`);
    for (const skillName of skillFolders) {
      const srcSkillDir = path.join(skillsSourceDir, skillName);
      const destSkillDir = path.join(AGENTS_ROOT, 'skills', skillName);
      ensureDir(destSkillDir);

      function copyRecursive(src, dst) {
        ensureDir(dst);
        for (const item of fs.readdirSync(src, { withFileTypes: true })) {
          const s = path.join(src, item.name);
          const d = path.join(dst, item.name);
          if (item.isDirectory()) {
            copyRecursive(s, d);
          } else {
            fs.copyFileSync(s, d);
          }
        }
      }
      copyRecursive(srcSkillDir, destSkillDir);
      operations.push({ kind: 'core-skill', name: skillName });
    }
  }

  // D. Modular Rules (Tier 2)
  const rulesSourceDir = path.join(SOURCE_DIR, 'rules');
  if (fs.existsSync(rulesSourceDir)) {
    console.log(`Organizing modular rules...`);
    function copyRules(src, prefix = '') {
      for (const item of fs.readdirSync(src, { withFileTypes: true })) {
        const itemPath = path.join(src, item.name);
        if (item.isDirectory()) {
          copyRules(itemPath, `${prefix}${item.name}-`);
        } else if (item.name.endsWith('.md')) {
          const targetName = `${prefix}${item.name}`;
          const destPath = path.join(AGENTS_ROOT, 'rules', targetName);
          fs.copyFileSync(itemPath, destPath);
          operations.push({ kind: 'rule', name: targetName });
        }
      }
    }
    copyRules(rulesSourceDir);
  }

  // E. Tier 1 AGENTS.md (Lean governance strictly under 2,500 tokens)
  const tier1AgentsMd = `# Antigravity Engineering Guidelines & Control Plane

This workspace is governed by **ECC-Universal (Antigravity Edition)**.
All agents and interactions must follow these core operational invariants.

---

## 1. Core Engineering Invariants

1. **Test-Driven Development (TDD) Mandatory**:
   - Write or update failing tests before implementing feature logic or bug fixes.
   - Run tests to confirm failure (RED), implement surgical fix, confirm pass (GREEN).
   - Aim for >=80% test coverage on all non-trivial logic.

2. **Surgical Diffs & Minimal Blast Radius**:
   - Touch only the lines and files directly required for the task.
   - Never reformat unrelated files or introduce gratuitous dependencies.
   - Preserve existing code comments, docstrings, and project architecture conventions.

3. **Zero Secrets & Tampering Protection**:
   - NEVER read, output, log, or commit \`.env\`, credentials, API keys, or certificates.
   - Do not disable linter, compiler, or security flags (\`--no-verify\`, \`eslint-disable\`, etc.).

4. **Deterministic Offloading**:
   - Offload arithmetic, discrete combinatorics, and complex string manipulations to sandbox execution (\`run_command\`).
   - Ground decisions in verified stdout/stderr.

---

## 2. Antigravity Native Tool Conventions

- File Inspection: Use \`read_file\` (or IDE \`view_file\`).
- File Modifications: Use \`write_file\` for creation, \`edit_file\` for targeted updates.
- Execution: Use \`run_command\` with explicit timeouts and structured error capture.
- Discovery: Use \`find_by_name\` and \`grep_search\` for broad codebase reconnaissance.
- Delegation: Use \`invoke_subagent\` for high-entropy deep dives or domain specialization.

---

## 3. Subagent Delegation Matrix

When tasks encounter high complexity or require domain expertise, invoke the specialized agent persona:

- **System Architecture & Design**: \`code-architect\`, \`architect\`
- **Codebase Exploration**: \`code-explorer\`
- **Code Review & Quality Gates**: \`code-reviewer\`, \`pr-test-analyzer\`
- **Test-Driven Refactoring**: \`tdd-guide\`, \`refactor-cleaner\`
- **Build & Compilation Issues**: \`build-error-resolver\` (or language-specific \`go-build-resolver\`, \`rust-build-resolver\`, etc.)
- **Security & Compliance Auditing**: \`security-reviewer\`, \`silent-failure-hunter\`

---

## 4. Model Routing & Resilience Tiering

All subagents and workflows follow strict primary and fallback model routing:
- **Primary Frontier Reasoning: Gemini 4 Argon**
  - \`gemini-4-argon-high\` (effort: high): Complex architecture, systemic planning, deep security auditing, multi-file refactoring.
  - \`gemini-4-argon-medium\` (effort: medium): Standard feature implementation, comprehensive code reviews, TDD cycles.
  - \`gemini-4-argon-low\` (effort: low): Mechanical code simplification, comment cleanup, doc updating, syntax checks.
- **Resilience Fallback: Gemini 3.8 Flash**
  - Automatic Fallback Trigger: If Gemini 4 Argon is unavailable, rate-limited, or offline, automatically fall back to the matching Gemini 3.8 Flash tier:
    - High: \`gemini-3.8-flash-high\`
    - Medium: \`gemini-3.8-flash-medium\`
    - Low: \`gemini-3.8-flash-low\`

---

## 5. Tier 2 Domain Rules Lookup

For deep language or framework conventions, inspect the corresponding rule file under \`.agents/rules/\` on demand:
- **TypeScript/React**: \`.agents/rules/typescript-*.md\`, \`.agents/rules/react-*.md\`
- **Python/Django/FastAPI**: \`.agents/rules/python-*.md\`, \`.agents/rules/django-*.md\`
- **Go/Rust**: \`.agents/rules/golang-*.md\`, \`.agents/rules/rust-*.md\`
- **Security/Testing**: \`.agents/rules/common-security.md\`, \`.agents/rules/common-testing.md\`
`;

  fs.writeFileSync(path.join(DEST_DIR, 'AGENTS.md'), tier1AgentsMd, 'utf8');
  fs.writeFileSync(path.join(DEST_DIR, 'GEMINI.md'), tier1AgentsMd, 'utf8');
  fs.writeFileSync(path.join(AGENTS_ROOT, 'AGENTS.md'), tier1AgentsMd, 'utf8');
  console.log(`Generated Tier 1 AGENTS.md (< 2,500 tokens budget-compliant).`);

  // F. Antigravity Native hooks.json
  const antigravityHooks = {
    "ecc-pre-tool-guard": {
      "enabled": true,
      "PreToolUse": [
        {
          "matcher": "run_command|write_file|edit_file|write_to_file|replace_file_content",
          "hooks": [
            {
              "type": "command",
              "command": "node .agents/scripts/hooks/antigravity-hook-dispatcher.js pre-tool",
              "timeout": 15
            }
          ]
        }
      ]
    },
    "ecc-post-tool-handler": {
      "enabled": true,
      "PostToolUse": [
        {
          "matcher": "run_command|write_file|edit_file",
          "hooks": [
            {
              "type": "command",
              "command": "node .agents/scripts/hooks/antigravity-hook-dispatcher.js post-tool",
              "timeout": 20
            }
          ]
        }
      ]
    },
    "ecc-session-lifecycle": {
      "enabled": true,
      "SessionStart": [
        {
          "type": "command",
          "command": "node .agents/scripts/hooks/antigravity-hook-dispatcher.js session-start",
          "timeout": 15
        }
      ],
      "Stop": [
        {
          "type": "command",
          "command": "node .agents/scripts/hooks/antigravity-hook-dispatcher.js stop",
          "timeout": 20
        }
      ]
    }
  };

  const hooksJsonContent = JSON.stringify(antigravityHooks, null, 2);
  fs.writeFileSync(path.join(AGENTS_ROOT, 'hooks.json'), hooksJsonContent, 'utf8');
  fs.writeFileSync(path.join(AGENTS_ROOT, 'hooks', 'hooks.json'), hooksJsonContent, 'utf8');
  console.log(`Configured native Antigravity hooks.json.`);

  // G. Hook Dispatcher with parameter fallback
  const hookDispatcherCode = `'use strict';
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
            reason: \`BLOCKED by ECC Hook: Modifying protected configuration or secret file '\${base}' is forbidden. Fix code or use environment variables instead.\`
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
  process.stderr.write(String(err) + '\\n');
  process.stdout.write(JSON.stringify({ decision: 'allow' }));
});
`;

  fs.writeFileSync(path.join(AGENTS_ROOT, 'scripts/hooks/antigravity-hook-dispatcher.js'), hookDispatcherCode, 'utf8');

  // Copy supporting scripts from ecc-universal
  const scriptsSrc = path.join(SOURCE_DIR, 'scripts');
  if (fs.existsSync(scriptsSrc)) {
    // Copy memory-mcp.mjs
    const memoryMcpSrc = path.join(scriptsSrc, 'memory-mcp.mjs');
    if (fs.existsSync(memoryMcpSrc)) {
      fs.copyFileSync(memoryMcpSrc, path.join(AGENTS_ROOT, 'scripts', 'memory-mcp.mjs'));
    }
  }

  // H. Project MCP Config (draft/.agents/mcp_config.json & draft/.gemini/mcp_config.json)
  const mcpConfig = {
    mcpServers: {
      "ecc-memory-vault": {
        command: "node",
        args: [
          "./.agents/scripts/memory-mcp.mjs"
        ],
        env: {
          ECC_MEMORY_HARNESS: "antigravity",
          ECC_MEMORY_VAULT_PATH: "./.agents/memory"
        },
        description: "Shared ECC Memory Vault for cross-session knowledge retention"
      }
    }
  };

  const mcpJsonStr = JSON.stringify(mcpConfig, null, 2);
  fs.writeFileSync(path.join(AGENTS_ROOT, 'mcp_config.json'), mcpJsonStr, 'utf8');
  fs.writeFileSync(path.join(DEST_DIR, '.gemini', 'mcp_config.json'), mcpJsonStr, 'utf8');
  console.log(`Configured Antigravity mcp_config.json.`);

  // I. Plugin Manifest
  const pluginManifest = {
    name: "ecc-universal",
    description: "ECC Universal Agent Operating System for Antigravity & agy CLI",
    version: "2.2.3"
  };
  fs.writeFileSync(path.join(AGENTS_ROOT, 'plugin.json'), JSON.stringify(pluginManifest, null, 2), 'utf8');

  // J. Install State Manifest
  const installState = {
    schemaVersion: "ecc.install.v1",
    installedAt: new Date().toISOString(),
    target: {
      id: "antigravity-project",
      target: "antigravity",
      kind: "project",
      root: AGENTS_ROOT,
      installStatePath: path.join(AGENTS_ROOT, 'ecc-install-state.json')
    },
    version: "2.2.3",
    operationsCount: operations.length
  };
  fs.writeFileSync(path.join(AGENTS_ROOT, 'ecc-install-state.json'), JSON.stringify(installState, null, 2), 'utf8');

  console.log(`Antigravity adaptation completed successfully with ${operations.length} operations.`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
