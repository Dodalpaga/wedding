> Plan historique : les mentions du hero mobile compact et du fond statique sont remplacées par les décisions actuelles de [DECISIONS.md](../../DECISIONS.md). Consulter [PROJECT_STATE.md](../../PROJECT_STATE.md) pour la référence actuelle.

# Desktop/tablet layout follow-up

## Requirements
- Match the heights of the landing invitation and practical-information columns.
- Give the hero a full-screen composition on PC/tablet; retain the compact phone layout.
- Reduce empty space and oversized controls in the personalized RSVP form on larger screens.
- Clarify that the landing programme depends on each guest's invitation.

## Steps
- [x] Inspect existing layout at portrait-tablet width and read RSVP rendering code.
- [x] Update responsive landing structure and form layout without changing Firebase writes.
- [x] Inspect PC, portrait/landscape tablet, and mobile layouts, including expanded sections and invitation types.
- [x] Run type/build checks, update documentation, and finish the plan.

## Outcome
TypeScript and the clean-copy production static export passed for all 11 pages. Browser checks verified equal-height panels, full-viewport desktop/tablet hero, compact mobile hero, expandable sections, and weekend/ceremony-only RSVP layouts. Screenshots saved. No guest responses were submitted.
