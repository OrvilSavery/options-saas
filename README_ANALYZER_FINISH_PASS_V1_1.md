# Analyzer Finish Pass v1.1

This is a corrective overwrite package for StrikeCheck focused on the remaining visible finish-quality issues before moving to commercial gating.

## What this package fixes

- Removes the old root-level `options-saas` navigation across the whole site by replacing `app/layout.tsx` with a provider-only root layout.
- Keeps authenticated app chrome inside `app/(app)/layout.tsx` and `components/layout/AppTopbar.tsx` only.
- Keeps the StrikeCheck horizontal top nav as the single app navigation system.
- Updates global background to a slightly deeper slate tone so white cards have more contrast.
- Keeps `Pass` as a red verdict treatment, with Watchlist as amber and Valid as green.
- Moves the warm verdict sentence directly under the verdict word before the setup detail line.
- Forces the current/user setup to be selected by default in the comparison rail.
- Keeps selected cards from showing a redundant “Review this setup” button.
- Keeps saved/watchlist confirmation neutral instead of green so it does not conflict emotionally with a Pass result.
- Rewrites max loss helper text to `max you can lose`.
- Limits risk flags to the most distinct 1–2 flags and removes duplicate 0 DTE / short-window language.
- Uses specific premium-risk copy when premium is thin.
- Removes roadmap-ish event-risk coverage copy and replaces it with a user-facing scope note.
- Tightens the position strip and improves the close-strike combined label with red/amber dots.
- Hides unavailable execution/premium fields instead of showing `Not available` rows.
- Shortens setup tradeoff headers and hides identical comparison rows.
- Prevents setup tradeoffs from comparing the setup against itself.

## Files included

- `app/layout.tsx`
- `app/(app)/layout.tsx`
- `app/(app)/analyzer/page.tsx`
- `app/globals.css`
- `components/layout/AppShell.tsx`
- `components/layout/AppTopbar.tsx`
- `components/layout/AppSidebar.tsx`
- `components/analyzer/AnalyzerEntryForm.tsx`
- `components/analyzer/AnalyzerEmptyState.tsx`
- `components/analyzer/AnalyzerLoadingState.tsx`
- `components/analyzer/AnalyzerErrorState.tsx`
- `components/analyzer/AnalyzerResultWorkspace.tsx`
- `components/analyzer/RecommendedSetupHero.tsx`
- `components/analyzer/PayoffDiagramCard.tsx`
- `components/analyzer/CompareSetupsPreview.tsx`
- `components/analyzer/EventMacroRiskPanel.tsx`
- `components/analyzer/TradeoffMatrix.tsx`
- `components/analyzer/AnalyzerDetailTabs.tsx`
- `components/analyzer/ExecutionPremiumPanel.tsx`
- `components/analyzer/SetupDetailsPanel.tsx`
- `components/analyzer/WhatToWatchPanel.tsx`

## What this package does not change

- No scoring changes
- No ranking changes
- No decision/posture logic changes
- No event-risk derivation changes
- No provider adapter changes
- No history/watchlist storage contract changes
- No billing or Stripe changes

## After overwrite

Run:

```bash
npm run build
```

Then test:

1. Public/root pages no longer show the old `options-saas` header unless they intentionally render their own nav.
2. Authenticated app pages show only the StrikeCheck top nav.
3. Analyzer result defaults to `Your setup` selected in Review mode.
4. Pass result uses red, Watchlist uses amber, Valid uses green.
5. Strike labels do not overlap on the position strip.
6. Execution/premium detail views do not show empty `Not available` rows.
7. Setup tradeoffs do not show identical self-comparison rows.
