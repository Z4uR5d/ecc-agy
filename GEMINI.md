# Antigravity Engineering Guidelines & Control Plane

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
   - NEVER read, output, log, or commit `.env`, credentials, API keys, or certificates.
   - Do not disable linter, compiler, or security flags (`--no-verify`, `eslint-disable`, etc.).

4. **Deterministic Offloading**:
   - Offload arithmetic, discrete combinatorics, and complex string manipulations to sandbox execution (`run_command`).
   - Ground decisions in verified stdout/stderr.

---

## 2. Antigravity Native Tool Conventions

- File Inspection: Use `read_file` (or IDE `view_file`).
- File Modifications: Use `write_file` for creation, `edit_file` for targeted updates.
- Execution: Use `run_command` with explicit timeouts and structured error capture.
- Discovery: Use `find_by_name` and `grep_search` for broad codebase reconnaissance.
- Delegation: Use `invoke_subagent` for high-entropy deep dives or domain specialization.

---

## 3. Subagent Delegation Matrix

When tasks encounter high complexity or require domain expertise, invoke the specialized agent persona:

- **System Architecture & Design**: `code-architect`, `architect`
- **Codebase Exploration**: `code-explorer`
- **Code Review & Quality Gates**: `code-reviewer`, `pr-test-analyzer`
- **Test-Driven Refactoring**: `tdd-guide`, `refactor-cleaner`
- **Build & Compilation Issues**: `build-error-resolver` (or language-specific `go-build-resolver`, `rust-build-resolver`, etc.)
- **Security & Compliance Auditing**: `security-reviewer`, `silent-failure-hunter`

---

## 4. Model Routing & Resilience Tiering

All subagents and workflows follow strict primary and fallback model routing:
- **Primary Frontier Reasoning: Gemini 4 Argon**
  - `gemini-4-argon-high` (effort: high): Complex architecture, systemic planning, deep security auditing, multi-file refactoring.
  - `gemini-4-argon-medium` (effort: medium): Standard feature implementation, comprehensive code reviews, TDD cycles.
  - `gemini-4-argon-low` (effort: low): Mechanical code simplification, comment cleanup, doc updating, syntax checks.
- **Resilience Fallback: Gemini 3.8 Flash**
  - Automatic Fallback Trigger: If Gemini 4 Argon is unavailable, rate-limited, or offline, automatically fall back to the matching Gemini 3.8 Flash tier:
    - High: `gemini-3.8-flash-high`
    - Medium: `gemini-3.8-flash-medium`
    - Low: `gemini-3.8-flash-low`

---

## 5. Tier 2 Domain Rules Lookup

For deep language or framework conventions, inspect the corresponding rule file under `.agents/rules/` on demand:
- **TypeScript/React**: `.agents/rules/typescript-*.md`, `.agents/rules/react-*.md`
- **Python/Django/FastAPI**: `.agents/rules/python-*.md`, `.agents/rules/django-*.md`
- **Go/Rust**: `.agents/rules/golang-*.md`, `.agents/rules/rust-*.md`
- **Security/Testing**: `.agents/rules/common-security.md`, `.agents/rules/common-testing.md`
