# Closeout SSoT

> Single source of truth for task closeout evidence. Every closed Harness Ledger row must be represented here.

## Active Closeouts

| Harness ID | Date | Task | Task Plan | Review Report | Walkthrough | Evidence | Residual | Closeout Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Walkthrough Skip Reasons

Only these skip reasons are allowed:

- `walkthrough skipped-with-reason: docs-only`
- `walkthrough skipped-with-reason: no-runtime`
- `walkthrough skipped-with-reason: superseded`
- `walkthrough skipped-with-reason: historical-backfill`
- `walkthrough skipped-with-reason: owner-deferred`

## Rules

1. Every `closed`, `closed-with-residual`, or `closed-local-only` Harness Ledger row must have a row in this file.
2. The Walkthrough column must contain either `docs/10-WALKTHROUGH/<file>.md` or one allowed skip reason.
3. Implementation waves should write a walkthrough. Skip reasons are for constrained cases, not convenience.
4. The Evidence column must name the checks, smoke, review, or runtime proof used for closeout.
5. The Residual column must say `none` or route the residual to an owner, task, Regression SSoT, or Harness Ledger row.
