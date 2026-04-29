# App Shell + Analyzer Identity Pass v1

## Objective
Make StrikeCheck feel like a focused product instead of a generic dashboard shell, without changing analyzer logic, scoring, ranking, provider boundaries, history storage, or watchlist storage.

## Files included

- `app/(app)/layout.tsx`
- `app/(app)/analyzer/page.tsx`
- `app/globals.css`
- `components/layout/AppShell.tsx`
- `components/layout/AppTopbar.tsx`
- `components/layout/AppSidebar.tsx`
- `components/analyzer/AnalyzerEntryForm.tsx`
- `components/analyzer/AnalyzerResultWorkspace.tsx`
- `components/analyzer/AnalyzerEmptyState.tsx`
- `components/analyzer/AnalyzerLoadingState.tsx`
- `components/analyzer/AnalyzerErrorState.tsx`

## What changed

- Replaces the left sidebar shell with a horizontal top navigation.
- Shows `StrikeCheck` once in the top nav.
- Adds a small strike-position brand mark beside the product name.
- Removes the duplicate app/page header from the shell.
- Moves signed-in identity into a compact avatar menu.
- Keeps the analyzer content centered in a 740px column.
- Adds a ghost position-strip empty state before a result exists.
- Adds analyzer skeleton loading cards while the request is running.
- Adds cleaner retryable error cards.
- Preserves collapsed entry-form behavior after results load.
- Preserves the current analyzer result flow and action row.

## What did not change

- No scoring changes.
- No ranking changes.
- No `AnalyzerInput` contract changes.
- No market-data or options-data adapter changes.
- No event-risk derivation changes.
- No history/watchlist storage changes.
- No billing or plan gating.
- No sticky scroll context bar yet.

## Install

Copy the included files into the matching paths in your app and overwrite the existing files.

Then run:

```bash
npm run build
```

## Test checklist

1. Visit `/analyzer` with no result.
2. Confirm the full form appears with a ghost position-strip empty state below it.
3. Run Find setups.
4. Confirm the form collapses, loading skeleton appears, then the result renders.
5. Run Review your setup.
6. Confirm the result still preserves `Your setup` and the Modify button reopens the form.
7. Confirm top nav links work: Dashboard, Analyzer, History, Watchlist.
8. Confirm there is no left sidebar and no duplicate `Structured analyzer` header.
9. Confirm `Save review`, `Add to watchlist`, and `Re-analyze` still work.
