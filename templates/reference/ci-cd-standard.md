# CI/CD Standard

## CI Profile

- Platform: [GitHub Actions / GitLab CI / local-only / other]
- Runtime: [Node / Python / Go / Rust / Java / mixed / other]
- Package manager:
- Install command:
- Lint command:
- Typecheck command:
- Test command:
- Build command:
- Smoke / regression command:
- Cache strategy:
- Required secrets:
- Unsupported checks and residuals:

## Workflow

- Workflow path:
- Pull request trigger:
- Default branch push trigger:
- Required jobs:
- Artifact / log strategy:

## Required Checks

| Required check | Workflow job | Source |
|----------------|--------------|--------|
| lint | [job name] | [workflow path] |
| typecheck | [job name] | [workflow path] |
| build | [job name] | [workflow path] |
| test | [job name] | [workflow path] |

## CD / Release

- Release trigger:
- Environment:
- Approval requirement:
- Rollback path:
- Signing / credential boundary:
- If out of scope, reason:

## Evidence Status

| Item | Status | Evidence | Residual |
|------|--------|----------|----------|
| CI workflow | [designed / implemented / verified / blocked-with-owner] | [path] | [residual] |
| Required checks | [designed / implemented / verified / blocked-with-owner] | [path] | [residual] |
| Release / CD | [designed / implemented / verified / blocked-with-owner / n/a] | [path] | [residual] |
