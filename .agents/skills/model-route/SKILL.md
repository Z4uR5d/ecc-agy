---
name: model-route
description: "Recommend the best model tier for the current task based on complexity, risk, and budget.. Use when user invokes /model-route or requests this procedure."
---

# /model-route

# Model Route Command

Recommend the best model tier for the current task by complexity and budget.

## Usage

`/model-route [task-description] [--budget low|med|high]`

## Routing Heuristic

### Primary Model Tier (Gemini 4 Argon)
- `gemini-4-argon-high` (effort: high): Complex architecture, systemic planning, deep security auditing, multi-file refactoring, ambiguous specifications.
- `gemini-4-argon-medium` (effort: medium): Standard feature implementation, full code reviews, TDD cycles, core development tasks.
- `gemini-4-argon-low` (effort: low): Deterministic mechanical edits, doc updating, syntax cleanup, fast scans.

### Resilience Fallback (Gemini 3.8 Flash)
If `gemini-4-argon` is unavailable, rate-limited, or offline, automatically route to the corresponding Flash effort tier:
- High: `gemini-3.8-flash-high`
- Medium: `gemini-3.8-flash-medium`
- Low: `gemini-3.8-flash-low`

## Required Output

- recommended model
- confidence level
- why this model fits
- fallback model if first attempt fails

## Arguments

$ARGUMENTS:
- `[task-description]` optional free-text
- `--budget low|med|high` optional
