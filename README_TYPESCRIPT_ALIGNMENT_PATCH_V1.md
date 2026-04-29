# TypeScript Alignment Patch v1

This patch consolidates the TypeScript fixes surfaced by:

```bash
npx tsc --noEmit --pretty false
```

## What this fixes

- Aligns generated credit-spread candidate types with fields already emitted by candidate generators.
- Adds event source quality typing for deterministic event-risk logic.
- Updates seeded fixtures to match the current seeded analyzer input contract.
- Updates mock analyzer input to return the current normalized analyzer shape.
- Removes invalid top-level `ivRank` / `ivHvRatio` from seeded input and enriches candidates instead.
- Narrows reopen strategy type to the allowed requested strategy union.
- Adds explicit TypeScript annotations to the credit-spread scoring engine.
- Adds the missing tracked setup key helper.
- Makes history read-model normalization null-safe.
- Fixes the one implicit-any test callback.

## What this does not change

- No UI redesign.
- No scoring formula changes.
- No visible score UI.
- No billing or plan gating.
- No live provider integration changes.
- No AI-driven scoring, ranking, posture, or event decisions.

## After installing

Run:

```bash
npx tsc --noEmit --pretty false
npm run test
npm run build
```
