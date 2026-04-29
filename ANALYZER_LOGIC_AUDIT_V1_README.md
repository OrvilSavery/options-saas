# Analyzer Logic Audit + Edge-Case Validation v1

## Objective
Add a minimal deterministic test layer for the analyzer before commercial gating.

This package intentionally focuses on backend analyzer behavior only:
- scoring engine disqualifiers and cross-category modifiers
- scoring input mapping
- hard gates for Find setups
- exact Review mode preservation
- exact requested spread math
- event risk derivation
- metadata / data quality / review scope

## Files in this overwrite package

```txt
package.json
vitest.config.ts
lib/analyzer/test-utils/creditSpreadFixtures.ts
lib/analyzer/__tests__/creditSpreadEngine.test.ts
lib/analyzer/__tests__/buildEngineParams.test.ts
lib/analyzer/__tests__/hardGates.test.ts
lib/analyzer/__tests__/rankStrategiesModes.test.ts
lib/analyzer/__tests__/exactReviewBuilder.test.ts
lib/analyzer/__tests__/eventRisks.test.ts
lib/analyzer/__tests__/metadataDataQuality.test.ts
```

## Install step
After overwriting the files, run:

```bash
npm install
```

This installs Vitest from the updated `package.json`.

## Validation commands
Run:

```bash
npm run test
npm run build
```

## Guardrails preserved
- No UI files changed.
- No scoring logic changed.
- No analyzer contracts changed.
- No visible score UI added.
- No AI introduced into math, ranking, posture, gates, event risk, or metadata.
- No billing/commercial gating added.

## If a test fails
Treat failures as audit findings, not as permission to broadly refactor.

Fix only the smallest deterministic logic issue needed to satisfy the test while preserving the current analyzer contracts.
