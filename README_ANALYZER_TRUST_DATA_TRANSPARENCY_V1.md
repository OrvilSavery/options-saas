# Analyzer Trust & Data Transparency v1.1

## Objective

Add a user-facing trust layer to StrikeCheck before commercial gating.

This package makes the analyzer clearer about:

- what was reviewed
- when the analysis ran
- whether the market is open / closed / pre-market / after-hours
- whether data is mock, live, latest available, or unlabeled
- what expiration window was screened in Find setups mode
- which event coverage areas were checked, limited, or not included
- what data inputs are missing or simplified
- how the review works without exposing hidden score internals

The core product promise remains:

> Rules calculate the review. AI may later explain the result, but AI does not decide the verdict.

## Files included

- `app/layout.tsx`
- `app/(app)/layout.tsx`
- `app/(app)/analyzer/page.tsx`
- `app/globals.css`
- `components/layout/AppShell.tsx`
- `components/layout/AppTopbar.tsx`
- `components/layout/AppSidebar.tsx`
- `components/analyzer/AnalyzerEntryForm.tsx`
- `components/analyzer/AnalyzerResultWorkspace.tsx`
- `components/analyzer/DataTransparencyPanel.tsx`
- `components/analyzer/EventMacroRiskPanel.tsx`
- `components/analyzer/RecommendedSetupHero.tsx`
- `components/analyzer/AnalyzerEmptyState.tsx`
- `components/analyzer/AnalyzerLoadingState.tsx`
- `components/analyzer/AnalyzerErrorState.tsx`
- `components/analyzer/CompareSetupsPreview.tsx`
- `components/analyzer/PayoffDiagramCard.tsx`
- `components/analyzer/TradeoffMatrix.tsx`
- `components/analyzer/AnalyzerDetailTabs.tsx`
- `components/analyzer/ExecutionPremiumPanel.tsx`
- `components/analyzer/SetupDetailsPanel.tsx`
- `components/analyzer/WhatToWatchPanel.tsx`
- `lib/analyzer/analyzeTicker.ts`
- `lib/analyzer/metadata/buildAnalysisMetadata.ts`
- `lib/analyzer/events/deriveEventRisks.ts`
- `lib/analyzer/input/types.ts`
- `lib/analyzer/input/seeded/types.ts`
- `lib/analyzer/input/normalizers/normalizeAnalyzerInput.ts`
- `types/analysis.ts`

## Key changes

### Browser title / identity

- Keeps root metadata as `StrikeCheck`.
- Keeps dynamic analyzer page titles like `SPY · Pass — StrikeCheck`.
- Removes old user-facing `options-saas` language from included files.

### Analysis metadata

Adds a stable metadata layer to `AnalysisResponse`:

- market session labels
- quote status labels
- data source labels
- review scope summary
- data quality status
- data quality flags
- event coverage checklist

### New Data quality & review scope section

Adds a collapsed-by-default analyzer section showing:

- Review scope
- Freshness
- Event coverage checked
- Limited / missing inputs
- How this review works

This section is meant to make the analysis auditable without showing hidden score math.

### Event risk section improvements

- Uses specific `eventRisks[]` when available.
- Falls back safely to the coarse `eventRisk` label and existing market/volatility context.
- Clearly states that live headlines and unscheduled news are not included in this review.

### Hero / metric trust hints

- Shows session and quote/source context near the timestamp.
- Adds small `?` hover hints on the metrics row where the metric component is included: strikes, premium, max loss, room, DTE.

## What this package does not change

- No scoring changes
- No ranking changes
- No decision/posture changes
- No options-chain provider changes
- No market-data provider changes
- No AI explanation logic
- No billing or plan gating
- No visible numeric score on the primary result page

## After overwrite

Run:

```bash
npm run build
```

Then test:

1. `/analyzer` empty state.
2. Find setups mode.
3. Review your setup mode.
4. The new `Data quality & review scope` accordion.
5. Event & market risk accordion.
6. Dynamic browser tab title.
7. Save review / Add to watchlist actions.

## Notes

This is intentionally user-facing transparency, not the full analyzer logic audit. The logic audit should be a separate package focused on tests, fixtures, and edge-case validation.
