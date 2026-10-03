> Plan historique : les mentions du hero mobile compact et du fond statique sont remplacées par les décisions actuelles de [DECISIONS.md](../../DECISIONS.md). Consulter [PROJECT_STATE.md](../../PROJECT_STATE.md) pour la référence actuelle.

# Mobile landing page refactor

## Goal
Help guests find the date, venue, RSVP form, and practical details with less scrolling on phones, while retaining the wedding identity.

## Plan
- [x] Read instructions, existing components, and the supplied screenshot.
- [x] Compact hero and direct navigation.
- [x] RSVP first, venue summary, accessible disclosures for secondary details.
- [x] Preserve invitation routing, participant count, contact, and unavailable gallery state.
- [x] Verify types, production export, responsive layout, and interactions.
- [x] Update documentation and move plan to completed.

## Decisions
Keep the signature, monogram, palette, illustration, and French copy. Use native details/summary. Remove continuous canvas decoration from the landing page. Preserve the tentative programme without inventing times.

## Verification outcome
Types and clean-copy production static export passed. Browser checks passed at 320px, 390px, and 1440px, including anchors, keyboard disclosures, validation, and encoded invitation routing. No live RSVP data changed. Screenshots saved under docs/screenshots.

