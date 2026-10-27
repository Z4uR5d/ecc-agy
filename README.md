# ECC-AGY

> **Harness-Native Agent Operating System for Google Antigravity & `agy` CLI**  
> Adapted from `ecc-universal` with full native support for Antigravity tools, progressive disclosure skills, declarative lifecycle hooks, and dual-tier model routing (Gemini 4 Argon + Gemini 3.8 Flash fallback).

---

## Architecture Overview

ECC-AGY is packaged as a ready-to-deploy Antigravity workspace or plugin containing:

* **68 Specialized Subagents** (`.agents/agents/*.md`)
  * Equipped with native Antigravity tools: `read_file`, `write_file`, `edit_file`, `run_command`, `grep_search`, `find_by_name`, `invoke_subagent`, `send_message`, `manage_task`.
  * Pre-configured model routing: **Gemini 4 Argon** with reasoning effort levels (`high`, `medium`, `low`) and resilient **Gemini 3.8 Flash** fallback.

* **387 Progressive Skills** (`.agents/skills/*/SKILL.md`)
  * **293 Core Skills**: Software engineering runbooks, TDD workflows, architectural patterns, and framework blueprints.
  * **94 Command Skills**: Converted slash commands (`/plan`, `/review-pr`, `/model-route`, etc.) discoverable via Antigravity's progressive disclosure.

* **Two-Tier Rules Budget Architecture**
  * **Tier 1 (Always Active)**: `AGENTS.md` & `GEMINI.md` (< 550 tokens) enforcing core engineering invariants (TDD RED/GREEN, surgical diffs, zero secrets) without exceeding Antigravity's 20,000-token rules limit.
  * **Tier 2 (On-Demand)**: 50+ modular domain rules under `.agents/rules/` loaded dynamically via `read_file`.

* **Declarative Lifecycle Hooks & Protection Bridge**
  * `.agents/hooks.json` mapping `PreToolUse`, `PostToolUse`, `SessionStart`, and `Stop`.
  * Multi-key parameter fallback dispatcher protecting `.env`, linter configs, and blocking `--no-verify`.

* **Persistent Memory Vault (MCP)**
  * `.agents/mcp_config.json` exposing `ecc-memory-vault` backed by SQLite for cross-session knowledge retention.

---

## Model Hierarchy & Fallback Matrix

| Complexity Tier | Primary Model | Reasoning Effort | Fallback Model |
|---|---|---|---|
| **High** (Architecture, Security, Planning) | `gemini-4-argon-high` | `high` | `gemini-3.8-flash-high` |
| **Medium** (Feature dev, TDD, Code Review) | `gemini-4-argon-medium` | `medium` | `gemini-3.8-flash-medium` |
| **Low** (Simplification, Cleanup, Docs) | `gemini-4-argon-low` | `low` | `gemini-3.8-flash-low` |

---

## Quick Start (Instant 1-Command Install)

Run this single command inside any project directory to install the complete ECC-AGY operating system:

```bash
bunx github:Z4uR5d/ecc-agy
```
*(or with npx: `npx github:Z4uR5d/ecc-agy`)*

This instantly sets up:
1. `.agents/` with 68 specialized subagents, 387 skills, native lifecycle hooks, and SQLite memory vault.
2. `AGENTS.md` and `GEMINI.md` with Tier 1 engineering invariants and Gemini 4 Argon / Flash model routing.

---

## How to Deploy to a Project

### Option 1: Direct Copy to Project
Copy `.agents`, `AGENTS.md`, and `GEMINI.md` into your repository root:
```bash
cp -r .agents /path/to/your-project/
cp AGENTS.md GEMINI.md /path/to/your-project/
```

### Option 2: Use as Antigravity Global / Project Plugin
Link or copy into your Antigravity plugin directory:
```bash
agy plugin install <repo-url>
# or enable directly:
agy plugin enable ecc-universal
```

---

## Updating from Upstream `ecc-universal`

To regenerate or sync with upstream releases:
```bash
node scripts/adapt-antigravity.js
```
