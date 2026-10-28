# ECC-AGY

> **Harness-Native Agent Operating System for Google Antigravity & `agy` CLI**  
> Adapted from `ecc-universal` with full native support for Antigravity tools, progressive disclosure skills, declarative lifecycle hooks, and dual-tier model routing (Gemini 4 Argon + Gemini 3.8 Flash fallback).

---

## ⚡ Quick Start (Instant 1-Command Install)

Run this single command inside **any project directory** to instantly install the full ECC-AGY operating system:

```bash
bunx github:Z4uR5d/ecc-agy
```

*(or using npm/npx)*:
```bash
npx github:Z4uR5d/ecc-agy
```

This will automatically set up:
1. `.agents/` — 68 specialized subagents, 387 skills, native lifecycle hooks, and SQLite cross-session memory vault.
2. `AGENTS.md` and `GEMINI.md` — Tier 1 core engineering invariants (< 550 tokens) and frontier model routing.

---

## 🧠 Architecture Overview

ECC-AGY transforms Google Antigravity and the `agy` CLI into an autonomous agent engineering platform:

* **68 Specialized Subagents** (`.agents/agents/*.md`)
  * Native Antigravity tools: `read_file`, `write_file`, `edit_file`, `run_command`, `grep_search`, `find_by_name`, `invoke_subagent`, `send_message`, `manage_task`.
  * Pre-configured reasoning models: **Gemini 4 Argon** with reasoning effort levels (`high`, `medium`, `low`) and resilient **Gemini 3.8 Flash** fallback.

* **387 Progressive Skills** (`.agents/skills/*/SKILL.md`)
  * **293 Core Skills**: Software engineering runbooks, TDD workflows, architecture patterns, and framework blueprints.
  * **94 Command Skills**: Converted slash commands (`/plan`, `/review-pr`, `/model-route`, `/orch-review`, etc.) discoverable via Antigravity's progressive disclosure.

* **Two-Tier Rules Budget Architecture (20,000-Token Protection)**
  * **Tier 1 (Always Active)**: `AGENTS.md` & `GEMINI.md` (< 550 tokens) enforcing core engineering invariants (TDD RED/GREEN, surgical diffs, zero secrets) without blowing Antigravity's aggregate 20,000-token rules limit.
  * **Tier 2 (On-Demand)**: 50+ modular domain rules under `.agents/rules/` loaded dynamically via `read_file` only when needed.

* **Declarative Lifecycle Hooks & Safety Guard**
  * `.agents/hooks.json` mapping `PreToolUse`, `PostToolUse`, `SessionStart`, and `Stop`.
  * Multi-key parameter fallback dispatcher protecting `.env`, linter configs, and blocking unsafe `--no-verify` commits.

* **Persistent Memory Vault (MCP)**
  * `.agents/mcp_config.json` exposing `ecc-memory-vault` backed by SQLite for cross-session knowledge retention.

---

## 🎯 Model Hierarchy & Fallback Matrix

| Complexity Tier | Primary Model | Reasoning Effort | Fallback Model | Scope |
|---|---|---|---|---|
| **High** | `gemini-4-argon-high` | `high` | `gemini-3.8-flash-high` | Architecture, systemic planning, security audits, GAN evaluations |
| **Medium** | `gemini-4-argon-medium` | `medium` | `gemini-3.8-flash-medium` | Feature implementation, TDD cycles, code reviews, E2E testing |
| **Low** | `gemini-4-argon-low` | `low` | `gemini-3.8-flash-low` | Code simplification, comment cleanup, doc updating, syntax checks |

*Automatic Fallback*: If Gemini 4 Argon is unavailable, rate-limited, or offline, the harness automatically falls back to the corresponding Gemini 3.8 Flash tier.

---

## 🛠️ Usage in Antigravity

Once installed into your project, launch Antigravity:

* **In the Antigravity IDE**: All 68 specialized subagents will appear in the agent palette, and slash commands/skills can be called directly in the chat canvas.
* **In the `agy` CLI**:
  ```bash
  cd /path/to/your-project
  agy
  ```
  Run `/help` to see available skills and slash commands, or ask the agent to perform workflows:
  * `/review-pr` — Multi-agent code review pass
  * `/plan` — Feature architecture and implementation planning
  * `/model-route` — Recommend optimal model and effort level for a task

---

## 📦 Alternative Installation Methods

### Direct Copy
Copy `.agents`, `AGENTS.md`, and `GEMINI.md` directly into your repository:
```bash
cp -r .agents /path/to/your-project/
cp AGENTS.md GEMINI.md /path/to/your-project/
```

### Antigravity Plugin
Install as a plugin using the `agy` CLI:
```bash
agy plugin install https://github.com/Z4uR5d/ecc-agy
agy plugin enable ecc-agy
```

---

## 📄 License

MIT License — Copyright (c) 2026 Dmitry Sagnant
