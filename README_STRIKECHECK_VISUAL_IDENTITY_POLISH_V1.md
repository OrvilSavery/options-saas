# StrikeCheck Visual Identity Polish v1

## Objective

Make the analyzer result page feel more like StrikeCheck: a focused premium-selling setup review tool with a recognizable position-strip visual language.

This is a UI / product identity package only. It does not change analyzer scoring, ranking, posture logic, market data, options data, or event-risk derivation.

## What changed

- Constrains the analyzer content to a centered `max-width: 740px` result column.
- Keeps the full entry form before analysis and collapses it into a compact summary bar after a result returns.
- Removes the report-like sticky/status strip from the result flow.
- Keeps the result hierarchy tight:
  1. verdict hero
  2. position strip
  3. metrics row
  4. risk flags
  5. collapsed support sections
- Removes user-facing `Surfaced setup` language and uses `Setup found` / `Your setup`.
- Standardizes action copy to `Save review` and `Add to watchlist`.
- Makes the verdict hero more distinctive with a subtle texture/wash while preserving plain-language copy.
- Strengthens the position strip as the signature visual: clearer strike markers, breakeven in header, room annotation colored by severity, stronger but still subtle zones.
- Keeps recent price context inside a collapsed accordion.
- Keeps event/macro risk collapsed by default unless elevated.
- Keeps compare setups and setup tradeoffs collapsed by default.
- Adds a dot legend for nearby setup comparison.
- Keeps save/watch actions only at the bottom action row.

## Files included

- `app/(app)/analyzer/page.tsx`
- `components/analyzer/AnalyzerEntryForm.tsx`
- `components/analyzer/AnalyzerResultWorkspace.tsx`
- `components/analyzer/RecommendedSetupHero.tsx`
- `components/analyzer/PayoffDiagramCard.tsx`
- `components/analyzer/EventMacroRiskPanel.tsx`
- `components/analyzer/CompareSetupsPreview.tsx`
- `components/analyzer/TradeoffMatrix.tsx`
- `components/analyzer/AnalyzerDetailTabs.tsx`
- `components/analyzer/DecisionStrip.tsx`
- `components/analyzer/WhatToWatchPanel.tsx`

## Guardrails respected

- No scoring changes.
- No ranking changes.
- No decision/posture changes.
- No event-risk logic changes.
- No AI-driven conclusions.
- No live news/charting expansion.
- No options chain UI.
- No billing/account work.

## After overwrite

Run:

```bash
npm run build
```

Then test:

1. Find setups mode.
2. Review your setup mode.
3. Confirm the form collapses after a result and `Modify` reopens it.
4. Confirm Explore says `Setup found`, not `Surfaced setup`.
5. Confirm action copy says `Save review`.
6. Confirm position strip appears directly under the verdict.
7. Confirm recent price path, event risk, compare setups, tradeoffs, and details are collapsed by default.
