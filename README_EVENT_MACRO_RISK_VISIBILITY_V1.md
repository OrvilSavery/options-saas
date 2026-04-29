# Event & Macro Risk Visibility v1 — overwrite package

## Objective
Make event/catalyst/macro risk visible as a first-class analyzer result section while keeping scoring, ranking, posture, and setup selection deterministic.

## Files included
- `types/analysis.ts`
- `lib/analyzer/analyzeTicker.ts`
- `lib/analyzer/events/deriveEventRisks.ts`
- `lib/analyzer/input/types.ts`
- `lib/analyzer/input/seeded/types.ts`
- `lib/analyzer/input/normalizers/normalizeAnalyzerInput.ts`
- `components/analyzer/EventMacroRiskPanel.tsx`
- `components/analyzer/AnalyzerResultWorkspace.tsx`

## What changed
- Adds `EventRiskFlag` and related typed fields.
- Adds optional `eventRisks` to `AnalysisResponse` for specific event/context flags.
- Adds deterministic event-risk derivation in `lib/analyzer/events/deriveEventRisks.ts`.
- Supports optional seeded `scheduledEvents` so mock/live calendar data can flow through the normalizer without raw provider payloads leaking into UI.
- Updates the result page to pass `eventRisks` into `EventMacroRiskPanel`.
- Replaces the generic event panel with a clearer `Event & market risk` section.

## What this intentionally does not change
- No scoring changes.
- No posture/decision changes.
- No ranking changes.
- No AI-generated event conclusions.
- No live news scraping.
- No billing or plan gating.

## Validation checklist
After overwriting files:
1. Run typecheck/build.
2. Run a normal Find setups analysis.
3. Run a Review your setup analysis.
4. Confirm the result page shows `Event & market risk`.
5. Confirm earnings-in-window or earnings-after-expiration cases show specific flags when candidate fields are present.
6. Confirm no-event state says no major scheduled events were detected.
7. Confirm save/watch and setup comparison still work.
