# Payoff Diagram Label Spacing Fix v2

## Fix included

This patch adds more vertical separation between the long-strike label and the red strike marker dot.

Changes:
- Increases the plot area height so bottom labels have room.
- Moves the long-strike label farther below the marker dot.
- Moves the combined close-strike label farther below the marker dots.
- Keeps the current-price marker layered above the room connector.
- Preserves room connector, breakeven marker, and zone behavior.

## File included

- `components/analyzer/PayoffDiagramCard.tsx`
