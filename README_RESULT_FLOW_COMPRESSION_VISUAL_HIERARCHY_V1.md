# Result Flow Compression + Visual Hierarchy v1

## Objective
Tighten the analyzer result page so it feels like a focused premium-selling setup review, not a long generated report.

This package responds to the visual/product feedback that the analyzer logic is working, but the page still shows too much at once and gives too many sections equal visual weight.

## Files included

- `app/(app)/analyzer/page.tsx`
- `components/analyzer/AnalyzerEntryForm.tsx`
- `components/analyzer/AnalyzerResultWorkspace.tsx`
- `components/analyzer/RecommendedSetupHero.tsx`
- `components/analyzer/DecisionStrip.tsx`
- `components/analyzer/PayoffDiagramCard.tsx`
- `components/analyzer/CompareSetupsPreview.tsx`
- `components/analyzer/EventMacroRiskPanel.tsx`
- `components/analyzer/TradeoffMatrix.tsx`

## What changed

### Entry form compression
- After a result loads, the entry form collapses into a compact summary bar.
- Users can click `Modify` to reopen the full form.
- Entry copy is warmer and clearer:
  - `Find clean setups or review your own.`
  - Find mode and Review mode are explained in plain language.

### Verdict hero cleanup
- Removed the duplicate `Primary issue` card.
- Changed Pass tone from full red to amber/orange to avoid making the card feel like an app error.
- Hero copy is warmer and more direct.
- Timestamp is moved into a visible pill on the right side of the hero.
- Metrics were moved out of the hero so the position visual can sit immediately after the verdict.

### Position visual upgrade
- Position strip is taller and more prominent.
- Favorable/risk zones have stronger opacity.
- Room annotation is colored by severity.
- The position visual now appears directly after the verdict hero.

### Metrics row repositioning
- Metrics appear once, below the position visual.
- Room and DTE now include simple qualitative labels such as `tight`, `thin`, `usable`, `comfortable`, and `expiration day`.

### Sticky nav cleanup
- Sticky nav is trimmed to four anchors:
  - Verdict
  - Position
  - Alternatives
  - Details
- Removed ticker/status pills and save/watch actions from the sticky bar.
- Save/watch actions remain only in the bottom `Save or track` section.

### Section compression
- Recent price context is collapsed by default and helper-copy was removed.
- Event & market risk is collapsed by default and helper-copy was reduced.
- Setup comparison cards are collapsed by default behind a `Show setups` button.
- Dot-strip legend is added when setup comparison is opened.
- Tradeoff comparison helper-copy was removed.

## What did not change

- No scoring changes
- No ranking changes
- No decision/posture changes
- No analyzer input contract changes
- No provider adapter changes
- No event-risk derivation changes
- No history/watchlist storage logic changes

## Validation checklist

After overwriting files, run:

```bash
npm run build
```

Then test:

1. Run `Find setups` with a ticker.
2. Confirm the full entry form collapses after the result loads.
3. Click `Modify` and confirm the full form reopens.
4. Run `Review your setup` with exact strikes and expiration.
5. Confirm the result order is:
   - sticky nav
   - verdict hero
   - setup position
   - metrics row
   - collapsed support sections
6. Confirm the sticky nav only shows four anchors.
7. Confirm save/watch buttons only appear in the bottom action section.
8. Confirm setup comparison opens only when `Show setups` is clicked.
9. Confirm risk flags still auto-show for Pass / Watchlist results.
10. Confirm history/watchlist save behavior still works.
